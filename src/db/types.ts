export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  type?: 'mysql' | 'postgres';
}

export interface MultiDatabaseConfig {
  databases: Record<string, DatabaseConfig>;
  default?: string;
}

export interface QueryResult {
  rows: any[];
  fields: any[];
  affectedRows?: number;
  insertId?: number;
}

export interface TableSchema {
  tableName: string;
  columns: ColumnInfo[];
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  key: string;
  default: any;
  extra: string;
}