import db from './db.js';

export const initPostgresSchema = async () => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Drop existing tables to ensure a clean slate
    await client.query(`
      DROP TABLE IF EXISTS feedback CASCADE;
      DROP TABLE IF EXISTS pollution_classifications CASCADE;
      DROP TABLE IF EXISTS login_logs CASCADE;
      DROP TABLE IF EXISTS pollution_indices CASCADE;
      DROP TABLE IF EXISTS metal_concentrations CASCADE;
      DROP TABLE IF EXISTS samples CASCADE;
      DROP TABLE IF EXISTS locations CASCADE;
      DROP TABLE IF EXISTS metal_standards CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // Create tables with the corrected schema
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT CHECK (role IN ('ngo', 'guest', 'researcher')) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS locations (
        location_id SERIAL PRIMARY KEY,
        name TEXT,
        latitude REAL,
        longitude REAL,
        district TEXT,
        state TEXT
      );

      CREATE TABLE IF NOT EXISTS samples (
        sample_id SERIAL PRIMARY KEY,
        location_id INTEGER REFERENCES locations(location_id),
        user_id INTEGER REFERENCES users(user_id),
        sample_date DATE,
        source_type TEXT,
        notes TEXT
      );

      CREATE TABLE IF NOT EXISTS metal_concentrations (
        concentration_id SERIAL PRIMARY KEY,
        sample_id INTEGER REFERENCES samples(sample_id),
        metal_name TEXT,
        concentration_ppm REAL
      );

      CREATE TABLE IF NOT EXISTS pollution_indices (
        index_id SERIAL PRIMARY KEY,
        sample_id INTEGER REFERENCES samples(sample_id),
        hpi REAL,
        hei REAL,
        pli REAL,
        mpi REAL,
        cf JSONB,
        is_anomaly BOOLEAN DEFAULT FALSE,
        cluster_id INTEGER,
        computed_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS metal_standards (
        metal_name TEXT PRIMARY KEY,
        mac_ppm REAL,
        standard_ppm REAL
      );

      CREATE TABLE IF NOT EXISTS feedback (
        feedback_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id),
        message TEXT NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('COMMIT');
    console.log('✅ PostgreSQL schema initialized.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ PostgreSQL schema init failed:', err.message);
    throw err; // Re-throw the error to be caught by the caller
  } finally {
    client.release();
  }
};