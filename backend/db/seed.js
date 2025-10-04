import db from './db.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// The function is now exported
export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  try {
    await db.query('BEGIN');

    console.log('Creating admin user...');
    const hashedAdminPassword = await bcrypt.hash('adminpassword', SALT_ROUNDS);
    await db.query(
      `INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      ['admin', 'admin@example.com', hashedAdminPassword, 'admin']
    );

    console.log('Creating regular user...');
    const hashedUserPassword = await bcrypt.hash('userpassword', SALT_ROUNDS);
    await db.query(
      `INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      ['testuser', 'test@example.com', hashedUserPassword, 'user']
    );

    console.log('Seeding metal standards...');
    await db.query(`
      INSERT INTO metal_standards (metal_name, standard_ppm, mac_ppm) VALUES
        ('As', 0.01, 0.01),
        ('Cd', 0.003, 0.003),
        ('Cr', 0.05, 0.05),
        ('Cu', 2.0, 2.0),
        ('Pb', 0.015, 0.015),
        ('Zn', 3.0, 3.0),
        ('Hg', 0.001, 0.001)
      ON CONFLICT (metal_name) DO NOTHING;
    `);

    await db.query('COMMIT');
    console.log('✅ Database seeding complete.');
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    // The pool should not be ended here if the app continues to run
    // await db.end();
  }
}

// The direct call has been removed from this file
// seedDatabase();