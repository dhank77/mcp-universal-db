import { db } from '../index.js';
import { validateTableName } from '../utils/validation.js';

export async function handleReadSchema(params: any) {
  let sql: string;
  let queryParams: any[] = [];
  
  if (params.table) {
    validateTableName(params.table);
    sql = `
      SELECT 
        COLUMN_NAME as name,
        DATA_TYPE as type,
        IS_NULLABLE as nullable,
        COLUMN_KEY as \`key\`,
        COLUMN_DEFAULT as defaultValue,
        EXTRA as extra
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `;
    queryParams = [process.env.DB_DATABASE, params.table];
  } else {
    sql = `
      SELECT 
        TABLE_NAME as tableName,
        TABLE_ROWS as rowCount,
        DATA_LENGTH as dataLength
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = ?
    `;
    queryParams = [process.env.DB_DATABASE];
  }
  
  const result = await db.query(sql, queryParams);
  return { schema: result.rows };
}