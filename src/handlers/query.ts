import { db } from '../index.js';

export async function handleQuery(params: any) {
  console.error('DEBUG: handleQuery called with params:', params);
  console.error('DEBUG: db instance:', db ? 'exists' : 'null');
  
  if (!db) {
    throw new Error('Database not connected');
  }
  
  const sql = params.sql.trim();
  const upperSql = sql.toUpperCase();
  if (!upperSql.startsWith('SELECT')) {
    throw new Error('Only SELECT queries are allowed in query tool');
  }
  
  console.error('DEBUG: About to call db.query');
  const result = await db.query(params.sql, params.params);
  console.error('DEBUG: Query result:', result);
  return {
    rows: result.rows,
    rowCount: result.rows.length
  };
}