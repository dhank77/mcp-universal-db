import { db } from '../index.js';

export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
  primaryKeys: string[];
  foreignKeys: ForeignKeyInfo[];
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  key: string;
  default: any;
  extra: string;
}

export interface ForeignKeyInfo {
  column: string;
  referencedTable: string;
  referencedColumn: string;
}

export class SchemaReader {
  private static instance: SchemaReader;
  private cachedSchema: TableInfo[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): SchemaReader {
    if (!SchemaReader.instance) {
      SchemaReader.instance = new SchemaReader();
    }
    return SchemaReader.instance;
  }

  async getSchema(): Promise<TableInfo[]> {
    const now = Date.now();
    if (this.cachedSchema && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.cachedSchema;
    }

    const tables = await this.getAllTables();
    const schema: TableInfo[] = [];

    for (const table of tables) {
      const columns = await this.getTableColumns(table.name);
      const primaryKeys = await this.getPrimaryKeys(table.name);
      const foreignKeys = await this.getForeignKeys(table.name);

      schema.push({
        name: table.name,
        columns,
        primaryKeys,
        foreignKeys
      });
    }

    this.cachedSchema = schema;
    this.cacheTimestamp = now;
    return schema;
  }

  private async getAllTables(): Promise<{ name: string }[]> {
    const result = await db.query(`
      SELECT TABLE_NAME as name
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = ?
      AND TABLE_TYPE = 'BASE TABLE'
    `, [process.env.DB_DATABASE]);
    return result.rows;
  }

  private async getTableColumns(tableName: string): Promise<ColumnInfo[]> {
    const result = await db.query(`
      SELECT 
        COLUMN_NAME as name,
        DATA_TYPE as type,
        IS_NULLABLE as nullable,
        COLUMN_KEY as \`key\`,
        COLUMN_DEFAULT as \`default\`,
        EXTRA as extra
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `, [process.env.DB_DATABASE, tableName]);
    return result.rows;
  }

  private async getPrimaryKeys(tableName: string): Promise<string[]> {
    const result = await db.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      AND CONSTRAINT_NAME = 'PRIMARY'
    `, [process.env.DB_DATABASE, tableName]);
    return result.rows.map((row: any) => row.COLUMN_NAME);
  }

  private async getForeignKeys(tableName: string): Promise<ForeignKeyInfo[]> {
    const result = await db.query(`
      SELECT 
        COLUMN_NAME as \`column\`,
        REFERENCED_TABLE_NAME as referencedTable,
        REFERENCED_COLUMN_NAME as referencedColumn
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `, [process.env.DB_DATABASE, tableName]);
    return result.rows;
  }

  async getTableByName(tableName: string): Promise<TableInfo | null> {
    const schema = await this.getSchema();
    return schema.find(table => table.name === tableName) || null;
  }
}