import { test, expect, describe, mock } from "bun:test";
import { 
  CONNECTION_TOOL, 
  QUERY_TOOL, 
  CREATE_TOOL, 
  UPDATE_TOOL, 
  DELETE_TOOL, 
  READ_SCHEMA_TOOL 
} from "../src/tools/index";

describe("Tool Definitions", () => {
  test("connection tool has correct structure", () => {
    expect(CONNECTION_TOOL.name).toBe("connection");
    expect(CONNECTION_TOOL.inputSchema.properties.action).toBeDefined();
    expect(CONNECTION_TOOL.inputSchema.properties.action.enum).toContain("connect");
    expect(CONNECTION_TOOL.inputSchema.properties.action.enum).toContain("disconnect");
    expect(CONNECTION_TOOL.inputSchema.properties.action.enum).toContain("status");
  });

  test("query tool has correct structure", () => {
    expect(QUERY_TOOL.name).toBe("query");
    expect(QUERY_TOOL.inputSchema.properties.sql).toBeDefined();
    expect(QUERY_TOOL.inputSchema.properties.params).toBeDefined();
    expect(QUERY_TOOL.inputSchema.required).toContain("sql");
  });

  test("create tool has correct structure", () => {
    expect(CREATE_TOOL.name).toBe("create");
    expect(CREATE_TOOL.inputSchema.properties.table).toBeDefined();
    expect(CREATE_TOOL.inputSchema.properties.data).toBeDefined();
    expect(CREATE_TOOL.inputSchema.required).toContain("table");
    expect(CREATE_TOOL.inputSchema.required).toContain("data");
  });

  test("update tool has correct structure", () => {
    expect(UPDATE_TOOL.name).toBe("update");
    expect(UPDATE_TOOL.inputSchema.properties.table).toBeDefined();
    expect(UPDATE_TOOL.inputSchema.properties.data).toBeDefined();
    expect(UPDATE_TOOL.inputSchema.properties.where).toBeDefined();
    expect(UPDATE_TOOL.inputSchema.required).toContain("table");
    expect(UPDATE_TOOL.inputSchema.required).toContain("data");
    expect(UPDATE_TOOL.inputSchema.required).toContain("where");
  });

  test("delete tool has correct structure", () => {
    expect(DELETE_TOOL.name).toBe("delete");
    expect(DELETE_TOOL.inputSchema.properties.table).toBeDefined();
    expect(DELETE_TOOL.inputSchema.properties.where).toBeDefined();
    expect(DELETE_TOOL.inputSchema.required).toContain("table");
    expect(DELETE_TOOL.inputSchema.required).toContain("where");
  });

  test("readSchema tool has correct structure", () => {
    expect(READ_SCHEMA_TOOL.name).toBe("readSchema");
    expect(READ_SCHEMA_TOOL.inputSchema.properties.table).toBeDefined();
  });
});