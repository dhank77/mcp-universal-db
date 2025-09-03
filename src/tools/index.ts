import { db } from '../index.js';
import { 
  validateTableName, 
  validateColumnName, 
  escapeIdentifier,
  buildWhereClause 
} from '../utils/validation.js';

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
      }
    },
    required: ["table", "data"]
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
      }
    },
    required: ["table", "data", "where"]
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
      }
    },
    required: ["table", "where"]
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

async function handleConnection(params: any) {
  switch (params.action) {
    case "connect":
      await db.connect();
      return { status: "connected" };
    case "disconnect":
      await db.disconnect();
      return { status: "disconnected" };
    case "status":
      return { connected: db.isConnected() };
    default:
      throw new Error(`Unknown action: ${params.action}`);
  }
}

async function handleQuery(params: any) {
  const sql = params.sql.trim();
  const upperSql = sql.toUpperCase();
  if (!upperSql.startsWith('SELECT')) {
    throw new Error('Only SELECT queries are allowed in query tool');
  }
  
  const result = await db.query(params.sql, params.params);
  return {
    rows: result.rows,
    rowCount: result.rows.length
  };
}

async function handleCreate(params: any) {
  validateTableName(params.table);
  
  const columns = Object.keys(params.data);
  columns.forEach(validateColumnName);
  
  const values = Object.values(params.data);
  const placeholders = columns.map(() => '?').join(', ');
  const columnList = columns.map(escapeIdentifier).join(', ');
  
  const sql = `INSERT INTO ${escapeIdentifier(params.table)} (${columnList}) VALUES (${placeholders})`;
  const result = await db.query(sql, values);
  
  return {
    success: true,
    insertId: result.rows.insertId,
    affectedRows: result.rows.affectedRows
  };
}

async function handleUpdate(params: any) {
  validateTableName(params.table);
  
  const dataKeys = Object.keys(params.data);
  dataKeys.forEach(validateColumnName);
  
  const setClause = dataKeys
    .map(key => `${escapeIdentifier(key)} = ?`)
    .join(', ');
  
  const { clause: whereClause, values: whereValues } = buildWhereClause(params.where);
  
  const values = [...Object.values(params.data), ...whereValues];
  const sql = `UPDATE ${escapeIdentifier(params.table)} SET ${setClause} WHERE ${whereClause}`;
  
  const result = await db.query(sql, values);
  return {
    success: true,
    affectedRows: result.rows.affectedRows
  };
}

async function handleDelete(params: any) {
  validateTableName(params.table);
  
  const { clause: whereClause, values } = buildWhereClause(params.where);
  
  const sql = `DELETE FROM ${escapeIdentifier(params.table)} WHERE ${whereClause}`;
  
  const result = await db.query(sql, values);
  return {
    success: true,
    affectedRows: result.rows.affectedRows
  };
}

async function handleReadSchema(params: any) {
  let sql: string;
  let queryParams: any[] = [];
  
  if (params.table) {
    validateTableName(params.table);
    sql = `
      SELECT 
        COLUMN_NAME as name,
        DATA_TYPE as type,
        IS_NULLABLE as nullable,
        COLUMN_KEY as \`key\`,
        COLUMN_DEFAULT as defaultValue,
        EXTRA as extra
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `;
    queryParams = [process.env.DB_DATABASE, params.table];
  } else {
    sql = `
      SELECT 
        TABLE_NAME as tableName,
        TABLE_ROWS as rowCount,
        DATA_LENGTH as dataLength
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = ?
    `;
    queryParams = [process.env.DB_DATABASE];
  }
  
  const result = await db.query(sql, queryParams);
  return { schema: result.rows };
}

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