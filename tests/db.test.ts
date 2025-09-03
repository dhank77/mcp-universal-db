import { test, expect, beforeAll, afterAll, describe } from "bun:test";
import DatabaseConnection from "../src/db/connection";

describe("Database Connection", () => {
  let db: DatabaseConnection;

  beforeAll(async () => {
    db = new DatabaseConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || 'mcp_test'
    });
  });

  afterAll(async () => {
    if (db.isConnected()) {
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
    expect(async () => {
      await db.query('SELECT 1');
    }).toThrow();
  });

  test("should execute simple query", async () => {
    await db.connect();
    const result = await db.query('SELECT 1 as value');
    expect(result.rows).toBeDefined();
    expect(result.rows[0].value).toBe(1);
  });
});