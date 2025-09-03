import mysql from 'mysql2/promise';

try {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',   // atau root kalau sudah diatur
    password: '',
    database: 'sil'
  });
  console.log("✅ Connected!");
  await conn.end();
} catch (err) {
  console.error("❌ Error:", err);
}
