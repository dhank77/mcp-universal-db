# MCP Universal Database Server

A Model Context Protocol (MCP) server that provides universal database connectivity and operations. This server supports multiple database types and offers a comprehensive set of tools for database management.

## Features

This MCP server provides the following tools for database operations:

### 🔌 Connection Management
- **connection**: Manage database connections with support for connect, disconnect, and status operations
- Supports lazy connection initialization
- Multi-database type support (MySQL, PostgreSQL, SQLite, etc.)

### 📊 Data Operations

#### Query Operations
- **query**: Execute SELECT queries on the database
  - Support for parameterized queries
  - Safe SQL execution with prepared statements
  - Flexible parameter binding

#### CRUD Operations
- **create**: Insert new records into tables
  - Key-value pair data insertion
  - Confirmation required for safety
  
- **update**: Update existing records in tables
  - Conditional updates with WHERE clauses
  - Key-value pair data updates
  - Confirmation required for safety
  
- **delete**: Delete records from tables
  - Conditional deletion with WHERE clauses
  - Confirmation required for safety

#### Schema Operations
- **readSchema**: Read database schema information
  - Get schema for specific tables or all tables
  - Comprehensive table structure information

## Configuration

The server supports multiple configuration formats through environment variables. Create a `.env` file based on the provided `.env.example`:

### Format 1: DSN Direct
```env
DATABASE_URL=mysql://user:pass@localhost:3306/mydb
SUPABASE_DB_URL=postgres://user:pass@db.supabase.co:5432/postgres
```

### Format 2: Laravel Style
```env
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=laravel_db
DB_USERNAME=laravel_user
DB_PASSWORD=secret
```

### Format 3: WordPress Style
```env
DB_NAME=wordpress
DB_USER=wp_user
DB_PASS=wp_password
DB_HOST=localhost
DB_PORT=3306
```

### Format 4: Multi Database with Prefix
```env
DB1_CONNECTION=mysql
DB1_HOST=localhost
DB1_PORT=3306
DB1_DATABASE=app1_db
DB1_USERNAME=app1_user
DB1_PASSWORD=app1_pass

DB2_CONNECTION=postgres
DB2_HOST=localhost
DB2_PORT=5432
DB2_DATABASE=app2_db
DB2_USERNAME=app2_user
DB2_PASSWORD=app2_pass
```

### Format 5: Docker Style
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=docker_mysql
MYSQL_USER=mysql_user
MYSQL_PASSWORD=mysql_pass

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=docker_postgres
POSTGRES_USER=postgres_user
POSTGRES_PASSWORD=postgres_pass
```

### Format 6: Django Style
```env
DJANGO_DB_ENGINE=django.db.backends.postgresql
DJANGO_DB_HOST=localhost
DJANGO_DB_PORT=5432
DJANGO_DB_NAME=django_db
DJANGO_DB_USER=django_user
DJANGO_DB_PASSWORD=django_pass
```

## MCP Client Configuration

To connect to this MCP server from an MCP-compatible client, add the following configuration:

```json
{
  "mcpServers": {
    "dbmcp": {
      "command": "npx",
      "args": [
        "-y",
        "@dhank77/mcp-universal-db",
        "--transport",
        "stdio"
      ],
      "env": {
        "DOTENV_CONFIG_PATH": "./.env"
      }
    }
  }
}
```

Make sure your `.env` file is in the same directory as your MCP client configuration.

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Configure your database connection in `.env` file
5. Start the server:
   ```bash
   npm start
   ```

## Usage

This server is designed to work with MCP-compatible clients. The server communicates via stdio transport and provides all database operations through the MCP protocol.

### Example Tool Calls

#### Check Connection Status
```json
{
  "tool": "connection",
  "params": {
    "action": "status"
  }
}
```

#### Execute a Query
```json
{
  "tool": "query",
  "params": {
    "sql": "SELECT * FROM users WHERE age > ?",
    "params": [18]
  }
}
```

#### Insert a Record
```json
{
  "tool": "create",
  "params": {
    "table": "users",
    "data": {
      "name": "John Doe",
      "email": "john@example.com",
      "age": 25
    },
    "confirm": true
  }
}
```

#### Update Records
```json
{
  "tool": "update",
  "params": {
    "table": "users",
    "data": {
      "age": 26
    },
    "where": {
      "id": 1
    },
    "confirm": true
  }
}
```

#### Delete Records
```json
{
  "tool": "delete",
  "params": {
    "table": "users",
    "where": {
      "id": 1
    },
    "confirm": true
  }
}
```

#### Read Schema
```json
{
  "tool": "readSchema",
  "params": {
    "table": "users"
  }
}
```

## Safety Features

- **Confirmation Required**: All destructive operations (create, update, delete) require explicit confirmation
- **Parameterized Queries**: Support for prepared statements to prevent SQL injection
- **Connection Management**: Proper connection lifecycle management
- **Error Handling**: Comprehensive error handling and reporting

## Supported Databases

- MySQL
- PostgreSQL
- SQLite
- And other databases supported by the underlying connection libraries

## Development

### Build
```bash
npm run build
```

### Test
```bash
npm test
```

### Development Mode
```bash
npm run dev
```

## License

MIT License