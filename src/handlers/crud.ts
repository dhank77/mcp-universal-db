import { db } from '../index.js';
import { 
  validateTableName, 
  validateColumnName, 
  escapeIdentifier,
  buildWhereClause 
} from '../utils/validation.js';

export async function handleCreate(params: any) {
  if (!params.confirm) {
    throw new Error('Confirmation required: Set confirm=true to proceed with INSERT operation');
  }
  
  validateTableName(params.table);
  
  const columns = Object.keys(params.data);
  columns.forEach(validateColumnName);
  
  const values = Object.values(params.data);
  const placeholders = columns.map(() => '?').join(', ');
  const columnList = columns.map(escapeIdentifier).join(', ');
  
  const sql = `INSERT INTO ${escapeIdentifier(params.table)} (${columnList}) VALUES (${placeholders})`;
  const result = await db.query(sql, values);
  
  return {
    success: true,
    insertId: result.rows.insertId,
    affectedRows: result.rows.affectedRows,
    message: `Successfully inserted record into ${params.table}`
  };
}

export async function handleUpdate(params: any) {
  if (!params.confirm) {
    throw new Error('Confirmation required: Set confirm=true to proceed with UPDATE operation');
  }
  
  validateTableName(params.table);
  
  const dataKeys = Object.keys(params.data);
  dataKeys.forEach(validateColumnName);
  
  const setClause = dataKeys
    .map(key => `${escapeIdentifier(key)} = ?`)
    .join(', ');
  
  const { clause: whereClause, values: whereValues } = buildWhereClause(params.where);
  
  const values = [...Object.values(params.data), ...whereValues];
  const sql = `UPDATE ${escapeIdentifier(params.table)} SET ${setClause} WHERE ${whereClause}`;
  
  const result = await db.query(sql, values);
  return {
    success: true,
    affectedRows: result.rows.affectedRows,
    message: `Successfully updated ${result.rows.affectedRows} record(s) in ${params.table}`
  };
}

export async function handleDelete(params: any) {
  if (!params.confirm) {
    throw new Error('Confirmation required: Set confirm=true to proceed with DELETE operation');
  }
  
  validateTableName(params.table);
  
  const { clause: whereClause, values } = buildWhereClause(params.where);
  
  const sql = `DELETE FROM ${escapeIdentifier(params.table)} WHERE ${whereClause}`;
  
  const result = await db.query(sql, values);
  return {
    success: true,
    affectedRows: result.rows.affectedRows,
    message: `Successfully deleted ${result.rows.affectedRows} record(s) from ${params.table}`
  };
}