import { createServer } from 'http';
import { parse } from 'url';
import { randomUUID } from 'crypto';
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMCPServer } from '../handlers.js';

// Store StreamableHTTP transports by session ID
const httpTransports = new Map<string, StreamableHTTPServerTransport>();

export async function startHTTPServer(port: number) {
  const httpServer = createServer(async (req, res) => {
    const parsedUrl = parse(req.url || '', true);
    const pathname = parsedUrl.pathname;
    
    // Handle CORS headers for HTTP
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Mcp-Session-Id');
    res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    // StreamableHTTP uses a single /mcp endpoint
    if (pathname === '/mcp') {
      try {
        // Check for existing session ID in headers
        const sessionId = req.headers['mcp-session-id'] as string;
        let transport: StreamableHTTPServerTransport;
        
        if (sessionId && httpTransports.has(sessionId)) {
          // Reuse existing transport for this session
          transport = httpTransports.get(sessionId)!;
          console.error(`Reusing transport for session ${sessionId}`);
        } else if (!sessionId) {
          // New session - create transport
          console.error('Creating new transport for new session');
          const newSessionId = randomUUID();
          transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => newSessionId,
            enableJsonResponse: true, // Enable JSON response mode
            onsessioninitialized: (sessionId) => {
              console.error(`Session initialized with ID: ${sessionId}`);
              // Session is already stored, just log it
            },
            onsessionclosed: (closedSessionId) => {
              console.error(`Session closed: ${closedSessionId}`);
              httpTransports.delete(closedSessionId);
            }
          });
          // Store immediately so subsequent requests can find it
          httpTransports.set(newSessionId, transport);
          
          // Create a new server instance for this session
          const server = createMCPServer();
          
          // Connect the transport to the MCP server
          await server.connect(transport);
        } else {
          // Session ID provided but not found
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: 'Session not found',
            },
            id: null,
          }));
          return;
        }
        
        // Let the transport handle the request completely
        // It will parse the body, validate, and send the response
        await transport.handleRequest(req, res);
      } catch (error) {
        console.error('Error handling HTTP request:', error);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            jsonrpc: '2.0',
            error: {
              code: -32603,
              message: 'Internal server error',
            },
            id: null,
          }));
        }
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  });
  
  httpServer.listen(port, () => {
    console.error(`Database MCP StreamableHTTP server running on http://localhost:${port}`);
    console.error(`Endpoint: POST http://localhost:${port}/mcp`);
    console.error(`Session management via Mcp-Session-Id header`);
    console.error(`For JSON responses, use Accept: application/json`);
  });
}