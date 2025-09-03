import { describe, test, expect } from 'vitest';
import { CONNECTION_TOOL, QUERY_TOOL, CREATE_TOOL, UPDATE_TOOL, DELETE_TOOL } from '../src/tools';

describe('Tools', () => {
  test('CONNECTION_TOOL should have correct structure', () => {
    expect(CONNECTION_TOOL).toBeDefined();
    expect(CONNECTION_TOOL.name).toBe('connection');
    expect(CONNECTION_TOOL.description).toBeDefined();
    expect(CONNECTION_TOOL.inputSchema).toBeDefined();
  });

  test('QUERY_TOOL should have correct structure', () => {
    expect(QUERY_TOOL).toBeDefined();
    expect(QUERY_TOOL.name).toBe('query');
    expect(QUERY_TOOL.description).toBeDefined();
    expect(QUERY_TOOL.inputSchema).toBeDefined();
  });

  test('CREATE_TOOL should have correct structure', () => {
    expect(CREATE_TOOL).toBeDefined();
    expect(CREATE_TOOL.name).toBe('create');
    expect(CREATE_TOOL.description).toBeDefined();
    expect(CREATE_TOOL.inputSchema).toBeDefined();
  });

  test('UPDATE_TOOL should have correct structure', () => {
    expect(UPDATE_TOOL).toBeDefined();
    expect(UPDATE_TOOL.name).toBe('update');
    expect(UPDATE_TOOL.description).toBeDefined();
    expect(UPDATE_TOOL.inputSchema).toBeDefined();
  });

  test('DELETE_TOOL should have correct structure', () => {
    expect(DELETE_TOOL).toBeDefined();
    expect(DELETE_TOOL.name).toBe('delete');
    expect(DELETE_TOOL.description).toBeDefined();
    expect(DELETE_TOOL.inputSchema).toBeDefined();
  });
});