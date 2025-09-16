import db from './db.js';

const initPostgresSchema = async () => {
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

      CREATE TABLE IF NOT EXISTS samples (
        sample_id SERIAL PRIMARY KEY,
        location_id INTEGER REFERENCES locations(location_id),
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
        computed_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ PostgreSQL schema initialized.');
  } catch (err) {
    console.error('❌ PostgreSQL schema init failed:', err.message);
  }
};

const initSqliteSchema = () => {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS locations (
        location_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        latitude REAL,
        longitude REAL,
        district TEXT,
        state TEXT
      );

      CREATE TABLE IF NOT EXISTS samples (
        sample_id INTEGER PRIMARY KEY AUTOINCREMENT,
        location_id INTEGER,
        sample_date TEXT,
        source_type TEXT,
        notes TEXT,
        FOREIGN KEY(location_id) REFERENCES locations(location_id)
      );

      CREATE TABLE IF NOT EXISTS metal_concentrations (
        concentration_id INTEGER PRIMARY KEY AUTOINCREMENT,
        sample_id INTEGER,
        metal_name TEXT,
        concentration_ppm REAL,
        FOREIGN KEY(sample_id) REFERENCES samples(sample_id)
      );

      CREATE TABLE IF NOT EXISTS pollution_indices (
        index_id INTEGER PRIMARY KEY AUTOINCREMENT,
        sample_id INTEGER,
        hpi REAL,
        hei REAL,
        computed_on TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(sample_id) REFERENCES samples(sample_id)
      );
    `);
    console.log('✅ SQLite schema initialized.');
  } catch (err) {
    console.error('❌ SQLite schema init failed:', err.message);
  }
};

// Auto-detect and initialize
if (db.query) {
  await initPostgresSchema();
} else if (db.exec) {
  initSqliteSchema();
} else {
  console.error('❌ Unknown DB interface. Schema not initialized.');
}
