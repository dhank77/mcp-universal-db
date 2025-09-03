import { db } from '../index.js';

export async function handleQuery(params: any) {
  const sql = params.sql.trim();
  const upperSql = sql.toUpperCase();
  if (!upperSql.startsWith('SELECT')) {
    throw new Error('Only SELECT queries are allowed in query tool');
  }
  
  const result = await db.query(params.sql, params.params);
  return {
    rows: result.rows,
    rowCount: result.rows.length
  };
}