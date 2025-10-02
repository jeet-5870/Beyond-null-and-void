// backend/controllers/predictionController.js

import db from '../db/db.js';

/**
 * Mocks a machine learning prediction model by fetching the latest HPI
 * and extrapolating a future trend over the next 7 days.
 */
const getFuturePrediction = async (req, res, next) => {
  const { location } = req.params;

  try {
    // 1. Fetch the latest HPI for the given location
    const latestHPIQuery = `
      SELECT pi.hpi
      FROM pollution_indices pi
      JOIN samples s ON pi.sample_id = s.sample_id
      JOIN locations l ON s.location_id = l.location_id
      WHERE l.name = $1
      ORDER BY s.sample_date DESC, pi.computed_on DESC
      LIMIT 1;
    `;
    
    const { rows } = await db.query(latestHPIQuery, [location]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No historical data found for this location to make a prediction.' });
    }
    
    const currentHPI = rows[0].hpi;
    const predictionDays = 7;
    const prediction = [];
    let hpiValue = currentHPI;
    
    // 2. Simulate a future trend (simple, non-linear extrapolation)
    for (let i = 0; i < predictionDays; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i + 1); // Start from tomorrow
        
        // Mock Trend Logic: 
        // Highly Polluted (HPI > 200) tends to slightly decrease (due to awareness/intervention)
        // Safe/Polluted (HPI <= 200) tends to slightly increase (due to continuous pollution)
        let changeFactor = 0;
        
        if (hpiValue > 200) {
            // Slight decrease (randomly between -5 and -1)
            changeFactor = -(Math.random() * 4 + 1); 
        } else if (hpiValue > 100) {
            // Stable to slight increase (randomly between -1 and +3)
            changeFactor = (Math.random() * 4) - 1;
        } else {
            // Slight increase (randomly between 0 and +2)
            changeFactor = Math.random() * 2; 
        }
        
        hpiValue += changeFactor;
        // Ensure HPI doesn't drop below a minimum safe level (e.g., 50)
        hpiValue = Math.max(50, hpiValue); 
        
        prediction.push({
            date: date.toISOString().split('T')[0],
            hpi: +hpiValue.toFixed(2), // Ensure it's a number and formatted
        });
    }

    res.json(prediction);

  } catch (err) {
    console.error('DB error in getFuturePrediction:', err.message);
    next(err);
  }
};

export default getFuturePrediction; // 🔑 FIX: Export as default