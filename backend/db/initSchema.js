import db from './db.js';

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

console.log('Database schema initialized.');
