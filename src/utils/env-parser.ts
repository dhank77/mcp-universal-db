export interface DatabaseEntry {
  name: string;
  dsn: string;
}

export function parseEnvToDSN(env: Record<string, string | undefined>): DatabaseEntry[] {
  const dbs: DatabaseEntry[] = [];

  // 1. Direct DSN (DATABASE_URL, DB_MYSQL, DB_PG, SUPABASE_DB_URL, dsb)
  for (const [key, value] of Object.entries(env)) {
    if (value && value.includes("://")) {
      dbs.push({ name: key, dsn: value });
    }
  }

  // 2. Laravel style
  if (env.DB_CONNECTION && env.DB_HOST) {
    const driver = env.DB_CONNECTION;
    const host = env.DB_HOST || "localhost";
    const port = env.DB_PORT || (driver === "mysql" ? "3306" : "5432");
    const db = env.DB_DATABASE || "";
    const user = env.DB_USERNAME || "";
    const pass = env.DB_PASSWORD || "";
    let dsn = "";

    if (driver === "mysql") {
      dsn = `mysql://${user}:${pass}@${host}:${port}/${db}`;
    } else if (driver === "pgsql" || driver === "postgres") {
      dsn = `postgres://${user}:${pass}@${host}:${port}/${db}`;
    }
    if (dsn) dbs.push({ name: "DB_DEFAULT", dsn });
  }

  // 3. Simple style (WordPress style, default MySQL)
  if (env.DB_NAME && env.DB_USER) {
    const host = env.DB_HOST || "localhost";
    const port = env.DB_PORT || "3306";
    const db = env.DB_NAME;
    const user = env.DB_USER;
    const pass = env.DB_PASS || "";
    const dsn = `mysql://${user}:${pass}@${host}:${port}/${db}`;
    dbs.push({ name: "DB_DEFAULT", dsn });
  }

  // 4. Multi DB prefix (DB1_, DB2_, ...)
  const grouped: Record<string, Record<string, string>> = {};
  for (const [key, value] of Object.entries(env)) {
    const match = key.match(/^(DB\d+)_(.+)$/);
    if (match && value) {
      const [, prefix, field] = match;
      grouped[prefix] = grouped[prefix] || {};
      grouped[prefix][field] = value;
    }
  }
  for (const [prefix, cfg] of Object.entries(grouped)) {
    const driver = cfg.CONNECTION || "mysql";
    const host = cfg.HOST || "localhost";
    const port = cfg.PORT || (driver === "mysql" ? "3306" : "5432");
    const db = cfg.DATABASE || "";
    const user = cfg.USERNAME || "";
    const pass = cfg.PASSWORD || "";
    let dsn = "";

    if (driver === "mysql") {
      dsn = `mysql://${user}:${pass}@${host}:${port}/${db}`;
    } else if (driver === "pgsql" || driver === "postgres") {
      dsn = `postgres://${user}:${pass}@${host}:${port}/${db}`;
    }
    if (dsn) dbs.push({ name: prefix, dsn });
  }

  // 5. Docker style (MYSQL_*, POSTGRES_*)
  if (env.MYSQL_DATABASE && env.MYSQL_USER) {
    const host = env.MYSQL_HOST || "localhost";
    const port = env.MYSQL_PORT || "3306";
    const db = env.MYSQL_DATABASE;
    const user = env.MYSQL_USER;
    const pass = env.MYSQL_PASSWORD || "";
    const dsn = `mysql://${user}:${pass}@${host}:${port}/${db}`;
    dbs.push({ name: "MYSQL", dsn });
  }
  if (env.POSTGRES_DB && env.POSTGRES_USER) {
    const host = env.POSTGRES_HOST || "localhost";
    const port = env.POSTGRES_PORT || "5432";
    const db = env.POSTGRES_DB;
    const user = env.POSTGRES_USER;
    const pass = env.POSTGRES_PASSWORD || "";
    const dsn = `postgres://${user}:${pass}@${host}:${port}/${db}`;
    dbs.push({ name: "POSTGRES", dsn });
  }

  // 6. Framework specific (Django)
  if (env.DJANGO_DB_ENGINE) {
    const driver = env.DJANGO_DB_ENGINE.includes("postgres") ? "postgres" : "mysql";
    const host = env.DJANGO_DB_HOST || "localhost";
    const port = env.DJANGO_DB_PORT || (driver === "mysql" ? "3306" : "5432");
    const db = env.DJANGO_DB_NAME || "";
    const user = env.DJANGO_DB_USER || "";
    const pass = env.DJANGO_DB_PASSWORD || "";
    const dsn = `${driver}://${user}:${pass}@${host}:${port}/${db}`;
    dbs.push({ name: "DJANGO", dsn });
  }

  return dbs;
}

// Helper function untuk parse DSN ke config object
export function parseDSNToConfig(dsn: string): {
  type: 'mysql' | 'postgres';
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
} {
  const url = new URL(dsn);
  const type = url.protocol.replace(':', '') as 'mysql' | 'postgres';
  
  return {
    type,
    host: url.hostname,
    port: parseInt(url.port) || (type === 'mysql' ? 3306 : 5432),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1) // remove leading slash
  };
}