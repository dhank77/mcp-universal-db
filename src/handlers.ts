import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { TOOLS, handleToolCall } from './tools/index.js';
import { PromptGenerator } from './utils/prompt-generator.js';
import { SchemaReader } from './utils/schema-reader.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);

/**
 * Register all MCP handlers on a server instance
 * This is shared across all transport types
 */
export function registerHandlers(server: Server) {
  const promptGenerator = new PromptGenerator();
  const schemaReader = SchemaReader.getInstance();

  // Register tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS
  }));
  
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const result = await handleToolCall(request.params.name, request.params.arguments);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.message}`
          }
        ],
        isError: true
      };
    }
  });
  
  // Register dynamic prompts handler
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    try {
      const dynamicPrompts = await promptGenerator.generateDynamicPrompts();
      return { prompts: dynamicPrompts };
    } catch (error: any) {
      console.error('Error generating dynamic prompts:', error);
      return { prompts: [] };
    }
  });
  
  // Register dynamic GetPrompt handler
  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    try {
      const promptContent = await promptGenerator.generatePromptContent(
        request.params.name, 
        request.params.arguments || {}
      );
      
      const messages = [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: promptContent
          }
        }
      ];
      
      return {
        description: `Dynamic prompt for ${request.params.name}`,
        messages
      };
    } catch (error: any) {
      throw new Error(`Error generating prompt ${request.params.name}: ${error.message}`);
    }
  });
  
  // Register dynamic resources handler
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    try {
      const schema = await schemaReader.getSchema();
      const resources = [
        {
          uri: "mcp-universal-db://database-schema",
          name: "Database Schema",
          description: "Complete database schema with all tables and relationships",
          mimeType: "application/json"
        }
      ];
      
      // Add individual table resources
      for (const table of schema) {
        resources.push({
          uri: `mcp-universal-db://table/${table.name}`,
          name: `Table: ${table.name}`,
          description: `Schema and information for ${table.name} table`,
          mimeType: "application/json"
        });
      }
      
      return { resources };
    } catch (error: any) {
      console.error('Error listing resources:', error);
      return { resources: [] };
    }
  });
  
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    try {
      if (request.params.uri === "mcp-universal-db://database-schema") {
        const schema = await schemaReader.getSchema();
        return {
          contents: [
            {
              uri: request.params.uri,
              mimeType: "application/json",
              text: JSON.stringify(schema, null, 2)
            }
          ]
        };
      }
      
      const tableMatch = request.params.uri.match(/^mcp-universal-db:\/\/table\/(.+)$/);
      if (tableMatch) {
        const tableName = tableMatch[1];
        const table = await schemaReader.getTableByName(tableName);
        if (table) {
          return {
            contents: [
              {
                uri: request.params.uri,
                mimeType: "application/json",
                text: JSON.stringify(table, null, 2)
              }
            ]
          };
        }
      }
      
      throw new Error(`Unknown resource: ${request.params.uri}`);
    } catch (error: any) {
      throw new Error(`Error reading resource: ${error.message}`);
    }
  });
}

/**
 * Create a new MCP server instance with all handlers registered
 */
export function createMCPServer() {
  const server = new Server(
    {
      name: "mcp-universal-db",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
        prompts: {},
        resources: {}
      }
    }
  );
  
  registerHandlers(server);
  return server;
}