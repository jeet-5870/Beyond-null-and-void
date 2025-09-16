import pg from 'pg';

let db;

if (process.env.DATABASE_URL) {
  // Use PostgreSQL on Render
  const { Pool } = pg;
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // For Render's free tier, this might be needed
    },
  });
  db = pool;
  console.log('✅ Connected to PostgreSQL database');
} else {
  // Fallback to SQLite for local development
  // Use a dynamic import() here
  (async () => {
    try {
      const sqlite3 = await import('sqlite3');
      db = new sqlite3.Database('./db.sqlite', (err) => {
        if (err) console.error('❌ Failed to connect to local database:', err.message);
        else console.log('✅ Connected to SQLite database');
      });
    } catch (err) {
      console.error('Failed to load sqlite3:', err);
    }
  })();
}

export default db;