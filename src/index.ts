import { startStdioServer } from './transports/stdio.js';
import DatabaseConnection from './db/connection.js';
import { parseEnvToDSN, parseDSNToConfig } from './utils/env-parser.js';
import type { DatabaseConfig } from './db/types.js';
import { config } from 'dotenv';

config({ path: process.env.DOTENV_CONFIG_PATH || '.env' });

// Parse environment variables untuk multiple databases
const databases = parseEnvToDSN(process.env as Record<string, string>);
const dbConnections: Record<string, DatabaseConnection> = {};

// Initialize database connections
console.error('DEBUG: Parsed databases:', databases);
for (const dbEntry of databases) {
  try {
    console.error(`DEBUG: Processing database ${dbEntry.name} with DSN:`, dbEntry.dsn);
    const config = parseDSNToConfig(dbEntry.dsn);
    console.error(`DEBUG: Parsed config for ${dbEntry.name}:`, config);
    const dbConfig: DatabaseConfig = {
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      type: config.type
    };
    console.error(`DEBUG: Final dbConfig for ${dbEntry.name}:`, dbConfig);
    dbConnections[dbEntry.name] = new DatabaseConnection(dbConfig);
  } catch (error) {
    // Gunakan stderr untuk error logging
    console.error(`Failed to parse DSN for ${dbEntry.name}:`, error);
  }
}

// Fallback ke konfigurasi lama jika tidak ada database yang ditemukan
if (Object.keys(dbConnections).length === 0) {
  const dbConfig: DatabaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'mcp_test',
    type: 'mysql'
  };
  dbConnections['default'] = new DatabaseConnection(dbConfig);
}

// Export default database connection
export const db = dbConnections['default'] || Object.values(dbConnections)[0];
export const allDatabases = dbConnections;

// Use console.log for debugging since stderr might not be visible in MCP
console.log('DEBUG: Available db connections:', Object.keys(dbConnections));
console.log('DEBUG: Selected db instance:', db ? 'exists' : 'null');
if (db) {
  console.log('DEBUG: DB config type:', (db as any).config?.type);
  console.log('DEBUG: DB config full:', (db as any).config);
}

// Database will connect lazily when first used

// Main function - hanya menggunakan stdio transport
async function main() {
  await startStdioServer();
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});