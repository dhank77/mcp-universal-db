export function validateTableName(table: string): void {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) {
    throw new Error('Invalid table name');
  }
}

export function validateColumnName(column: string): void {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(column)) {
    throw new Error('Invalid column name');
  }
}

export function escapeIdentifier(identifier: string): string {
  return '`' + identifier.replace(/`/g, '``') + '`';
}

export function buildWhereClause(conditions: Record<string, any>): {
  clause: string;
  values: any[];
} {
  const keys = Object.keys(conditions);
  const clause = keys.map(key => {
    validateColumnName(key);
    return `${escapeIdentifier(key)} = ?`;
  }).join(' AND ');
  
  return {
    clause,
    values: Object.values(conditions)
  };
}