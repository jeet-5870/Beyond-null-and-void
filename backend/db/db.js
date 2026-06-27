import pg from 'pg';
import 'dotenv/config';

let db;

if (process.env.DATABASE_URL) {
  const { Pool } = pg;
  
  // 1. Define whether the app is running in production (on Render/Neon) or locally
  const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL.includes('neon.tech');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // 2. Safely apply the SSL rules based on the check above
    ssl: isProduction 
      ? {
          rejectUnauthorized: false, 
        }
      : false,
  });

  db = pool;
  console.log('✅ Connected to PostgreSQL database');
} else {
  console.error('❌ DATABASE_URL not found. Connection to PostgreSQL failed.');
}

export default db;
