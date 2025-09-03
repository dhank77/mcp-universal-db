import mysql from 'mysql2/promise';
import type { DatabaseConfig } from './types';

class DatabaseConnection {
  private connection: mysql.Connection | null = null;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    this.connection = await mysql.createConnection(this.config);
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }

  async query(sql: string, params?: any[]): Promise<any> {
    if (!this.connection) {
      throw new Error('Database not connected');
    }
    const [rows, fields] = await this.connection.execute(sql, params);
    return { rows, fields };
  }

  isConnected(): boolean {
    return this.connection !== null;
  }
}

export default DatabaseConnection;