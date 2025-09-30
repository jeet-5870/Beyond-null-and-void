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

      /* ✅ UPDATED USERS TABLE to match LoginPage fields */
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        fullname TEXT NOT NULL,                          -- ✅ Added: Full name from signup
        email TEXT UNIQUE NOT NULL,                      -- ✅ Added: Email for signup/login
        password_hash TEXT NOT NULL,                     -- ✅ Renamed from password to password_hash
        role TEXT CHECK (role IN ('ngo', 'guest', 'researcher')) NOT NULL,  -- ✅ Added: Role selection
        reset_token TEXT,                                -- ✅ Optional: For password reset
        reset_token_expires TIMESTAMP,                   -- ✅ Optional: Expiry for reset token
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- ✅ Added: Signup timestamp
        updated_at TIMESTAMP                             -- ✅ Optional: For profile updates
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

      /* ✅ UPDATED FEEDBACK TABLE to link feedback to users */
      CREATE TABLE IF NOT EXISTS feedback (
        feedback_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id),       -- ✅ Added: Feedback tied to user
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

      /* ✅ OPTIONAL: LOGIN LOGS for audit and analytics */
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
