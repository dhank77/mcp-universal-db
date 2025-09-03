import mysql from 'mysql2/promise';
import { Client } from 'pg';
import type { DatabaseConfig } from './types';

class DatabaseConnection {
  private mysqlConnection: mysql.Connection | null = null;
  private pgConnection: Client | null = null;
  private config: DatabaseConfig;
  private isConnectedFlag: boolean = false;

  constructor(config: DatabaseConfig) {
    this.config = config;
    // Lazy connection - will connect when first used
  }

  private async ensureConnected(): Promise<void> {
    if (!this.isConnectedFlag) {
      console.error('DEBUG: Attempting to connect...');
      await this.connect();
      console.error('DEBUG: Connect completed, flag:', this.isConnectedFlag);
    }
  }

  async connect(): Promise<void> {
    if (this.isConnectedFlag) {
      console.error('DEBUG: Already connected');
      return;
    }

    try {
      console.error('DEBUG: Config type:', this.config.type);
      if (this.config.type === 'postgres') {
        const { Client } = await import('pg');
        this.pgConnection = new Client({
          host: this.config.host,
          port: this.config.port,
          user: this.config.user,
          password: this.config.password,
          database: this.config.database,
          connectionTimeoutMillis: 10000,
        });
        await this.pgConnection.connect();
        console.error('DEBUG: PostgreSQL connected');
      } else {
        // Default to MySQL - filter out 'type' property
        const { type, ...mysqlConfig } = this.config;
        console.error('DEBUG: MySQL config:', mysqlConfig);
        
        // Use standard TCP connection for all MySQL connections
        this.mysqlConnection = await mysql.createConnection({
          ...mysqlConfig,
          connectTimeout: 30000
        });
        console.error('DEBUG: MySQL connection created');
        // Test connection
        await this.mysqlConnection.ping();
        console.error('DEBUG: MySQL connected and pinged');
      }
      this.isConnectedFlag = true;
      console.error('DEBUG: Connection flag set to true');
    } catch (error) {
      this.isConnectedFlag = false;
      console.error('DEBUG: Connection failed:', error);
      throw error;
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
    console.error('DEBUG: Query method called with sql:', sql);
    await this.ensureConnected();
    console.error('DEBUG: After ensureConnected, flag:', this.isConnectedFlag);
    
    if (this.config.type === 'postgres') {
      if (!this.pgConnection) {
        throw new Error('PostgreSQL connection failed');
      }
      const result = await this.pgConnection.query(sql, params);
      return { rows: result.rows, fields: result.fields };
    } else {
      if (!this.mysqlConnection) {
        throw new Error('MySQL connection failed');
      }
      const [rows, fields] = await this.mysqlConnection.execute(sql, params);
      return { rows, fields };
    }
  }

  isConnected(): boolean {
    return this.mysqlConnection !== null || this.pgConnection !== null;
  }

  async create(table: string, data: Record<string, any>): Promise<any> {
    await this.ensureConnected();
    
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    
    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
    return this.query(sql, values);
  }

  async update(table: string, data: Record<string, any>, where: Record<string, any>): Promise<any> {
    await this.ensureConnected();
    
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
    const values = [...Object.values(data), ...Object.values(where)];
    
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    return this.query(sql, values);
  }

  async delete(table: string, where: Record<string, any>): Promise<any> {
    await this.ensureConnected();
    
    const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
    const values = Object.values(where);
    
    const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
    return this.query(sql, values);
  }
}

export default DatabaseConnection;