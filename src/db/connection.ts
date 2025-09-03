import mysql from "mysql2/promise";
import type { DatabaseConfig } from "./types";

class DatabaseConnection {
  private mysqlPool: mysql.Pool | null = null;
  private pgConnection: any | null = null;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.config.type === "postgres") {
      const { Client } = await import("pg");
      this.pgConnection = new Client({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
      });
      await this.pgConnection.connect();
      console.log("✅ Connected to Postgres");
    } else {
      // Default MySQL
      const { type, ...mysqlConfig } = this.config;

      // Normalize host
      if (mysqlConfig.host === "localhost") {
        mysqlConfig.host = "127.0.0.1";
      }

      console.log("🔌 Trying MySQL connection with:", mysqlConfig);

      try {
        // Use pool instead of single connection
        this.mysqlPool = mysql.createPool({
          ...mysqlConfig,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
        });

        // Test query
        const [rows] = await this.mysqlPool.query("SELECT 1");
        console.log("✅ Connected to MySQL, test query result:", rows);
      } catch (err: any) {
        console.error("❌ MySQL connect failed:", err.message);
        throw err;
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.mysqlPool) {
      await this.mysqlPool.end();
      this.mysqlPool = null;
    }
    if (this.pgConnection) {
      await this.pgConnection.end();
      this.pgConnection = null;
    }
  }

  async query(sql: string, params?: any[]): Promise<any> {
    if (this.config.type === "postgres" && this.pgConnection) {
      const result = await this.pgConnection.query(sql, params);
      return { rows: result.rows, fields: result.fields };
    } else if (this.mysqlPool) {
      const [rows, fields] = await this.mysqlPool.execute(sql, params);
      return { rows, fields };
    } else {
      throw new Error("Database not connected");
    }
  }

  isConnected(): boolean {
    return this.mysqlPool !== null || this.pgConnection !== null;
  }
}

export default DatabaseConnection;
