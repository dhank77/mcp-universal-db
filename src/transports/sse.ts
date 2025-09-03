import { createServer } from 'http';
import { parse } from 'url';
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createMCPServer } from '../handlers.js';

// Store SSE transports by session ID
const transports = new Map<string, SSEServerTransport>();

export async function startSSEServer(port: number) {
  const httpServer = createServer(async (req, res) => {
    const parsedUrl = parse(req.url || '', true);
    const pathname = parsedUrl.pathname;
    
    // Handle CORS headers for SSE
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    // SSE endpoint for establishing the stream
    if (pathname === '/mcp' && req.method === 'GET') {
      console.error('Establishing SSE stream...');
      
      try {
        // Create a new SSE transport for the client
        const transport = new SSEServerTransport('/messages', res);
        
        // Store the transport by session ID
        const sessionId = transport.sessionId;
        transports.set(sessionId, transport);
        
        // Set up onclose handler to clean up transport when closed
        transport.onclose = () => {
          console.error(`SSE transport closed for session ${sessionId}`);
          transports.delete(sessionId);
        };
        
        // Create a new server instance for this connection
        const server = createMCPServer();
        
        // Connect the transport to the MCP server
        await server.connect(transport);
        console.error(`Established SSE stream with session ID: ${sessionId}`);
      } catch (error) {
        console.error('Error establishing SSE stream:', error);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error establishing SSE stream');
        }
      }
    }
    // Messages endpoint for receiving client JSON-RPC requests
    else if (pathname === '/messages' && req.method === 'POST') {
      const sessionId = parsedUrl.query.sessionId as string;
      
      if (!sessionId) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('No session ID provided');
        return;
      }
      
      const transport = transports.get(sessionId);
      if (!transport) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Session not found');
        return;
      }
      
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const message = JSON.parse(body);
          await transport.handlePostMessage(req, res, message);
        } catch (error) {
          console.error('Error handling message:', error);
          if (!res.headersSent) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid request');
          }
        }
      });
    }
    // Handle unknown routes
    else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  });
  
  httpServer.listen(port, () => {
    console.error(`Database MCP SSE server running on http://localhost:${port}`);
    console.error(`SSE endpoint: http://localhost:${port}/mcp`);
    console.error(`Messages endpoint: http://localhost:${port}/messages`);
  });
}