import DatabaseConnection from '../src/db/connection.js';
import dotenv from 'dotenv';

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || '.env' });

const config = {
  type: (process.env.DB_CONNECTION || 'mysql') as 'mysql' | 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'test',
};

(async () => {
  const db = new DatabaseConnection(config);
  try {
    await db.connect();
    console.log("✅ Connected!");
    const result = await db.query("SELECT NOW() AS now");
    console.log(result.rows || result);
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await db.disconnect();
  }
})();
