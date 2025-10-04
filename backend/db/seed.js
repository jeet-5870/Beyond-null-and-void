import db from './db.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  const client = await db.connect(); // Use a client for the transaction
  try {
    await client.query('BEGIN');

    console.log('Creating admin user...');
    const hashedAdminPassword = await bcrypt.hash('adminpassword', SALT_ROUNDS);
    // Corrected INSERT statement: removed "username" and its corresponding value
    await client.query(
      `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING`,
      ['admin@example.com', hashedAdminPassword, 'admin']
    );

    console.log('Creating regular user...');
    const hashedUserPassword = await bcrypt.hash('userpassword', SALT_ROUNDS);
    // Corrected INSERT statement: removed "username" and its corresponding value
    await client.query(
      `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING`,
      ['test@example.com', hashedUserPassword, 'user']
    );

    console.log('Seeding metal standards...');
    await client.query(`
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

    await client.query('COMMIT');
    console.log('✅ Database seeding complete.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    client.release(); // Release the client back to the pool
  }
}