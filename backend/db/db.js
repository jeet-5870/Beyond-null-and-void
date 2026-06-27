import pg from 'pg';
import 'dotenv/config';

let db;

if (process.env.DATABASE_URL) {
  const { Pool } = pg;
  
  let connectionString = process.env.DATABASE_URL;
  const isProduction = 
    process.env.NODE_ENV === 'production' || 
    connectionString.includes('aivencloud.com') || 
    connectionString.includes('neon.tech');

  try {
    const urlObj = new URL(connectionString);
    if (urlObj.searchParams.has('sslmode') || urlObj.searchParams.has('ssl')) {
      urlObj.searchParams.delete('sslmode');
      urlObj.searchParams.delete('ssl');
      connectionString = urlObj.toString();
    }
  } catch (urlError) {
    console.error('⚠️ Failed to clean database URL string, attempting connection anyway...');
  }

  const pool = new Pool({
    connectionString: connectionString,
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
