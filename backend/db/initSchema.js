import db from './db.js';

export const initPostgresSchema = async () => {
  try {
    // 🔑 FIX: Add DROP TABLE IF EXISTS CASCADE to ensure the schema is always up-to-date,
    // especially for tables that received new columns like pollution_indices.
    // CASCADE ensures dependent tables (like metal_concentrations) are dropped first.
    await db.query(`
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


    await db.query(`
      CREATE TABLE IF NOT EXISTS locations (
        location_id SERIAL PRIMARY KEY,
        name TEXT,
        latitude REAL,
        longitude REAL,
        district TEXT,
        state TEXT
      );

      /* ✅ USERS TABLE: supports email, phone, OTP, and role-based access */
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        fullname TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT UNIQUE,
        password_hash TEXT,
        role TEXT CHECK (role IN ('ngo', 'guest', 'researcher')) NOT NULL,
        reset_token TEXT,
        reset_token_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP,
        CONSTRAINT chk_email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL)
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

      CREATE TABLE IF NOT EXISTS pollution_classifications (
        index_name TEXT,
        pollution_level TEXT,
        min_value REAL,
        max_value REAL,
        PRIMARY KEY (index_name, pollution_level)
      );

      CREATE TABLE IF NOT EXISTS login_logs (
        log_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id),
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        user_agent TEXT
      );
    `);

    console.log('✅ PostgreSQL schema initialized.');
  } catch (err) {
    console.error('❌ PostgreSQL schema init failed:', err.message);
  }
};