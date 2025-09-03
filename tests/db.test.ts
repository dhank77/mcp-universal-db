import { describe, test, expect, beforeAll, afterAll, vi } from 'vitest';
import DatabaseConnection from "../src/db/connection";
import type { DatabaseConfig } from "../src/db/types";

// Create mock functions using vi.hoisted()
const mockExecute = vi.hoisted(() => vi.fn());
const mockEnd = vi.hoisted(() => vi.fn());
const mockQuery = vi.hoisted(() => vi.fn());
const mockConnect = vi.hoisted(() => vi.fn());
const mockDestroy = vi.hoisted(() => vi.fn());
const mockPing = vi.hoisted(() => vi.fn());
const mockCreateConnection = vi.hoisted(() => vi.fn());

// Mock mysql2/promise
vi.mock('mysql2/promise', () => ({
  default: {
    createConnection: mockCreateConnection
  }
}));

describe("Database Connection", () => {
  let db: DatabaseConnection;

  beforeAll(async () => {
    // Create mock connection object
    const mockConnectionObj = {
      execute: mockExecute,
      end: mockEnd,
      query: mockQuery,
      connect: mockConnect,
      destroy: mockDestroy,
      ping: mockPing
    };

    // Setup mock return values
    mockExecute.mockResolvedValue([[{ value: 1 }], []]);
    mockEnd.mockResolvedValue(undefined);
    mockQuery.mockResolvedValue([[{ value: 1 }], []]);
    mockConnect.mockResolvedValue(undefined);
    mockDestroy.mockResolvedValue(undefined);
    mockPing.mockResolvedValue(undefined);
    mockCreateConnection.mockResolvedValue(mockConnectionObj);

    const config: DatabaseConfig = {
      host: 'localhost',
      port: 3306,
      user: 'test_user',
      password: 'test_password',
      database: 'test_db',
      type: 'mysql'
    };
    
    db = new DatabaseConnection(config);
  });

  afterAll(async () => {
    if (db && db.isConnected()) {
      await db.disconnect();
    }
  });

  test("should connect to database", async () => {
    await db.connect();
    expect(db.isConnected()).toBe(true);
  });

  test("should disconnect from database", async () => {
    if (!db.isConnected()) {
      await db.connect();
    }
    await db.disconnect();
    expect(db.isConnected()).toBe(false);
  });

  test("should throw error when querying without connection", async () => {
    if (db.isConnected()) {
      await db.disconnect();
    }
    await expect(async () => {
      await db.query('SELECT 1');
    }).rejects.toThrow('Database not connected');
  });

  test("should execute simple query", async () => {
    await db.connect();
    const result = await db.query('SELECT 1 as value');
    expect(result.rows).toBeDefined();
    expect(result.rows[0].value).toBe(1);
  });
});