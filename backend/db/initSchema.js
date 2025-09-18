import db from './db.js';

export const initPostgresSchema = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS locations (
        location_id SERIAL PRIMARY KEY,
        name TEXT,
        latitude REAL,
        longitude REAL,
        district TEXT,
        state TEXT
      );

      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
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
        computed_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS metal_standards (
        metal_name TEXT PRIMARY KEY,
        mac_ppm REAL,
        standard_ppm REAL
      );
      
      CREATE TABLE IF NOT EXISTS pollution_classifications (
        index_name TEXT,
        pollution_level TEXT,
        min_value REAL,
        max_value REAL,
        PRIMARY KEY (index_name, pollution_level)
      );
    `);
    console.log('✅ PostgreSQL schema initialized.');
  } catch (err) {
    console.error('❌ PostgreSQL schema init failed:', err.message);
  }
};