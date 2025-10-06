import db from './db.js';
import bcrypt from 'bcrypt';

export const seedDatabase = async () => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const passwordHash = await bcrypt.hash('password', 10);

    // Seed Users only if the table is empty
    const userCountRes = await client.query('SELECT COUNT(*) FROM users');
    if (userCountRes.rows[0].count === '0') {
      console.log('Seeding default users...');
      await client.query(
        `INSERT INTO users (fullname, email, phone, password_hash, role)
         VALUES ('Researcher Admin', 'admin@example.com', NULL, $1, 'researcher')`,
        [passwordHash]
      );
      await client.query(
        `INSERT INTO users (fullname, email, phone, password_hash, role)
         VALUES ('Guest User', NULL, '9991234567', $1, 'guest')`,
        [passwordHash]
      );
      await client.query(
        `INSERT INTO users (fullname, email, phone, password_hash, role)
        VALUES ('NGO User', 'ngo@example.com', null, $1, 'ngo')`
      );
      console.log('✅ Default users seeded.');
    }

    // Seed Metal Standards only if the table is empty
    const standardsCountRes = await client.query('SELECT COUNT(*) FROM metal_standards');
    if (standardsCountRes.rows[0].count === '0') {
      console.log('Seeding metal standards...');
      await client.query(`
        INSERT INTO metal_standards (metal_name, mac_ppm, standard_ppm) VALUES
        ('As', 0.01, 0.01), ('Cd', 0.003, 0.003), ('Cr', 0.05, 0.05),
        ('Cu', 2, 2), ('Pb', 0.015, 0.015), ('Zn', 3, 3), ('Hg', 0.001, 0.001)
        ON CONFLICT (metal_name) DO NOTHING;
      `);
      console.log('✅ Metal standards seeded.');
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