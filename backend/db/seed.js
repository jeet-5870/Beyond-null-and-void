import db from './db.js';
import bcrypt from 'bcrypt';

const initialSamples = [{
  location: 'Varanasi',
  lat: 25.3176,
  lng: 82.9739,
  metals: [{
    metal_name: 'Pb',
    concentration: 0.15
  }, {
    metal_name: 'Cd',
    concentration: 0.04
  }, {
    metal_name: 'As',
    concentration: 0.06
  }, ],
  hpi: 250.0,
  hei: 30.0,
  pli: 5.2,
  mpi: 0.05
}, {
  location: 'Lucknow',
  lat: 26.8467,
  lng: 80.9462,
  metals: [{
    metal_name: 'Pb',
    concentration: 0.05
  }, {
    metal_name: 'Cd',
    concentration: 0.01
  }, {
    metal_name: 'As',
    concentration: 0.02
  }, ],
  hpi: 100.0,
  hei: 10.0,
  pli: 2.5,
  mpi: 0.01
}, {
  location: 'Agra',
  lat: 27.1767,
  lng: 78.0081,
  metals: [{
    metal_name: 'Pb',
    concentration: 0.10
  }, {
    metal_name: 'Cd',
    concentration: 0.025
  }, {
    metal_name: 'As',
    concentration: 0.045
  }, ],
  hpi: 180.0,
  hei: 20.0,
  pli: 4.0,
  mpi: 0.03
}, ];

export const seedDatabase = async () => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const passwordHash = await bcrypt.hash('password', 10);
    let researcherUserId;

    // 1. Seed Users (if empty)
    const userCountRes = await client.query('SELECT COUNT(*) FROM users');
    if (userCountRes.rows[0].count === '0') {
      console.log('Seeding default users...');

      const resAdmin = await client.query(
        `INSERT INTO users (email, password_hash, role)
         VALUES ('admin@example.com', $1, 'researcher') RETURNING user_id`,
        [passwordHash]
      );
      researcherUserId = resAdmin.rows[0].user_id;

      await client.query(
        `INSERT INTO users (email, password_hash, role)
         VALUES ('guest@example.com', $1, 'guest')`,
        [passwordHash]
      );
      console.log('✅ Default users seeded.');
    } else {
      const res = await client.query("SELECT user_id FROM users WHERE email='admin@example.com'");
      if (res.rows.length > 0) {
        researcherUserId = res.rows[0].user_id;
      }
      console.log('Default users already exist. Skipping user seeding.');
    }

    // 2. Seed Metal Standards (if empty)
    const standardsCountRes = await client.query('SELECT COUNT(*) FROM metal_standards');
    if (standardsCountRes.rows[0].count === '0') {
      console.log('Seeding metal standards...');
      await client.query(`
        INSERT INTO metal_standards (metal_name, mac_ppm, standard_ppm) VALUES
        ('As', 0.01, 0.01),
        ('Cd', 0.003, 0.003),
        ('Cr', 0.05, 0.05),
        ('Cu', 2, 2),
        ('Pb', 0.015, 0.015),
        ('Zn', 3, 3),
        ('Hg', 0.001, 0.001)
        ON CONFLICT (metal_name) DO NOTHING;
      `);
      console.log('✅ Metal standards seeded.');
    } else {
      console.log('Metal standards already exist. Skipping standard seeding.');
    }

    // 3. Seed Sample Data (if no samples exist)
    const sampleCountRes = await client.query('SELECT COUNT(*) FROM samples');
    if (sampleCountRes.rows[0].count === '0' && researcherUserId) {
      console.log('Seeding initial sample data...');
      for (const sample of initialSamples) {
        let locRes = await client.query(
          'INSERT INTO locations (name, latitude, longitude, district, state) VALUES ($1, $2, $3, $4, $5) RETURNING location_id',
          [sample.location, sample.lat, sample.lng, sample.location, 'Uttar Pradesh']
        );
        const location_id = locRes.rows[0].location_id;

        const sampleRes = await client.query(
          `INSERT INTO samples (location_id, sample_date, source_type, notes, user_id)
           VALUES ($1, $2, $3, $4, $5) RETURNING sample_id`,
          [location_id, new Date().toISOString(), 'Groundwater', 'Initial Seed', researcherUserId]
        );
        const sample_id = sampleRes.rows[0].sample_id;

        for (const metal of sample.metals) {
          await client.query(
            'INSERT INTO metal_concentrations (sample_id, metal_name, concentration_ppm) VALUES ($1, $2, $3)',
            [sample_id, metal.metal_name, metal.concentration]
          );
        }

        const is_anomaly = (sample.hei >= 50);
        const cluster_id = (sample.location === 'Etawah') ? 1 : 2;

        await client.query(
          `INSERT INTO pollution_indices (sample_id, hpi, hei, pli, mpi, is_anomaly, cluster_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [sample_id, sample.hpi, sample.hei, sample.pli, sample.mpi, is_anomaly, cluster_id]
        );
      }
      console.log('✅ Initial sample data seeded.');
    } else {
      console.log('Initial sample data already exists. Skipping sample seeding.');
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Database seeding failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
};