import {
  handleConnection,
  handleQuery,
  handleCreate,
  handleUpdate,
  handleDelete,
  handleReadSchema
} from '../handlers/index.js';

export const CONNECTION_TOOL = {
  name: "connection",
  description: "Manage database connection (connect/disconnect/status)",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["connect", "disconnect", "status"],
        description: "Connection action to perform"
      }
    },
    required: ["action"]
  }
};

export const QUERY_TOOL = {
  name: "query",
  description: "Execute a SELECT query on the database",
  inputSchema: {
    type: "object",
    properties: {
      sql: {
        type: "string",
        description: "SQL SELECT query to execute"
      },
      params: {
        type: "array",
        items: { type: ["string", "number", "boolean", "null"] },
        description: "Query parameters for prepared statements"
      }
    },
    required: ["sql"]
  }
};

export const CREATE_TOOL = {
  name: "create",
  description: "Insert a new record into a table",
  inputSchema: {
    type: "object",
    properties: {
      table: {
        type: "string",
        description: "Table name"
      },
      data: {
        type: "object",
        description: "Data to insert (key-value pairs)"
      },
      confirm: {
        type: "boolean",
        description: "Confirmation required before executing the insert operation"
      }
    },
    required: ["table", "data", "confirm"]
  }
};

export const UPDATE_TOOL = {
  name: "update",
  description: "Update records in a table",
  inputSchema: {
    type: "object",
    properties: {
      table: {
        type: "string",
        description: "Table name"
      },
      data: {
        type: "object",
        description: "Data to update (key-value pairs)"
      },
      where: {
        type: "object",
        description: "WHERE conditions (key-value pairs)"
      },
      confirm: {
        type: "boolean",
        description: "Confirmation required before executing the update operation"
      }
    },
    required: ["table", "data", "where", "confirm"]
  }
};

export const DELETE_TOOL = {
  name: "delete",
  description: "Delete records from a table",
  inputSchema: {
    type: "object",
    properties: {
      table: {
        type: "string",
        description: "Table name"
      },
      where: {
        type: "object",
        description: "WHERE conditions (key-value pairs)"
      },
      confirm: {
        type: "boolean",
        description: "Confirmation required before executing the delete operation"
      }
    },
    required: ["table", "where", "confirm"]
  }
};

export const READ_SCHEMA_TOOL = {
  name: "readSchema",
  description: "Read database schema information",
  inputSchema: {
    type: "object",
    properties: {
      table: {
        type: "string",
        description: "Table name (optional, omit for all tables)"
      }
    }
  }
};

export const TOOLS = [
  CONNECTION_TOOL,
  QUERY_TOOL,
  CREATE_TOOL,
  UPDATE_TOOL,
  DELETE_TOOL,
  READ_SCHEMA_TOOL
];

export async function handleToolCall(toolName: string, params: any): Promise<any> {
  switch (toolName) {
    case "connection":
      return handleConnection(params);
    case "query":
      return handleQuery(params);
    case "create":
      return handleCreate(params);
    case "update":
      return handleUpdate(params);
    case "delete":
      return handleDelete(params);
    case "readSchema":
      return handleReadSchema(params);
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}