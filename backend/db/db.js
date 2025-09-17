import pg from 'pg';
import 'dotenv/config';

let db;

if (process.env.DATABASE_URL) {
  const { Pool } = pg;
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  db = pool;
  console.log('✅ Connected to PostgreSQL database');
} else {
  console.error('❌ DATABASE_URL not found. Connection to PostgreSQL failed.');
}

export default db;