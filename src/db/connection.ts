import mysql from 'mysql2/promise';
import type { DatabaseConfig } from './types';

class DatabaseConnection {
  private mysqlConnection: mysql.Connection | null = null;
  private pgConnection: any | null = null;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.config.type === 'postgres') {
      const { Client } = await import('pg');
      this.pgConnection = new Client({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
      });
      await this.pgConnection.connect();
    } else {
      // Default to MySQL - filter out 'type' property
      const { type, ...mysqlConfig } = this.config;
      this.mysqlConnection = await mysql.createConnection(mysqlConfig);
    }
  }

  async disconnect(): Promise<void> {
    if (this.mysqlConnection) {
      await this.mysqlConnection.end();
      this.mysqlConnection = null;
    }
    if (this.pgConnection) {
      await this.pgConnection.end();
      this.pgConnection = null;
    }
  }

  async query(sql: string, params?: any[]): Promise<any> {
    if (this.config.type === 'postgres' && this.pgConnection) {
      const result = await this.pgConnection.query(sql, params);
      return { rows: result.rows, fields: result.fields };
    } else if (this.mysqlConnection) {
      const [rows, fields] = await this.mysqlConnection.execute(sql, params);
      return { rows, fields };
    } else {
      throw new Error('Database not connected');
    }
  }

  isConnected(): boolean {
    return this.mysqlConnection !== null || this.pgConnection !== null;
  }
}

export default DatabaseConnection;