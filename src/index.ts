import { startStdioServer } from './transports/stdio.js';
import { startSSEServer } from './transports/sse.js';
import { startHTTPServer } from './transports/http.js';
import DatabaseConnection from './db/connection.js';

// Initialize database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'mcp_test'
};

export const db = new DatabaseConnection(dbConfig);

// Parse command-line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    transport: 'stdio' as 'stdio' | 'sse' | 'http',
    port: 3100
  };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--transport' && args[i + 1]) {
      const transportValue = args[i + 1].toLowerCase();
      if (transportValue === 'stdio' || transportValue === 'sse' || transportValue === 'http') {
        options.transport = transportValue;
      } else {
        console.error(`Invalid transport option: ${args[i + 1]}. Use 'stdio', 'sse', or 'http'`);
        process.exit(1);
      }
      i++;
    } else if (args[i] === '--port' && args[i + 1]) {
      options.port = parseInt(args[i + 1]);
      if (isNaN(options.port)) {
        console.error(`Invalid port: ${args[i + 1]}`);
        process.exit(1);
      }
      i++;
    }
  }
  
  return options;
}

async function main() {
  const options = parseArgs();
  
  switch (options.transport) {
    case 'sse':
      await startSSEServer(options.port);
      break;
    case 'http':
      await startHTTPServer(options.port);
      break;
    case 'stdio':
    default:
      await startStdioServer();
      break;
  }
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});