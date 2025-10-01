// db/seed.js
import db from './db.js';
import bcrypt from 'bcrypt';

export const seedDatabase = async () => {
  try {
    // Check if users table is empty before seeding
    const userCountRes = await db.query('SELECT COUNT(*) FROM users');
    if (userCountRes.rows[0].count === '0') {
      console.log('Seeding default users...');
      const passwordHash = await bcrypt.hash('password', 10);
      
      // 1. Default Researcher (Email, with Password)
      await db.query(
        `INSERT INTO users (fullname, email, phone, password_hash, role)
         VALUES ('Researcher Admin', 'admin@example.com', NULL, $1, 'researcher')`,
        [passwordHash]
      );
      
      // 2. Default Guest (Phone, with Password)
       await db.query(
        `INSERT INTO users (fullname, email, phone, password_hash, role)
         VALUES ('Guest User', NULL, '9991234567', $1, 'guest')`,
        [passwordHash]
      );

      console.log('✅ Default users seeded.');
    } else {
      console.log('Default users already exist. Skipping seeding.');
    }

    // Check if standards table is empty before seeding
    const res = await db.query('SELECT COUNT(*) FROM metal_standards');
    if (res.rows[0].count === '0') {
      console.log('Seeding metal standards...');
      await db.query(`
        INSERT INTO metal_standards (metal_name, mac_ppm, standard_ppm) VALUES
        ('As', 0.01, 0.01),
        ('Cd', 0.003, 0.003),
        ('Cr', 0.05, 0.05),
        ('Cu', 2, 2),
        ('Pb', 0.015, 0.015),
        ('Zn', 3, 3)
      `);
      console.log('✅ Metal standards seeded.');
    } else {
      console.log('Metal standards already exist. Skipping seeding.');
    }
  } catch (err) {
    console.error('❌ Database seeding failed:', err.message);
  }
};