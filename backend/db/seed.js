// db/seed.js
import db from './db.js';

export const seedDatabase = async () => {
  try {
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

    // You can also seed the pollution_classifications table here
    // ...
  } catch (err) {
    console.error('❌ Database seeding failed:', err.message);
  }
};

// This function can be called on application startup after schema is initialized
// For example, in app.js after the initSchema import.
// seedDatabase();