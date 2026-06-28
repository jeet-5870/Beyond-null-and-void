// backend/controllers/predictionController.js

import db from '../db/db.js';
import { SimpleLinearRegression } from 'ml-regression';

function computeR2(actual, predicted) {
  const n = actual.length;
  if (n === 0 || n !== predicted.length) return 0;
  const meanActual = actual.reduce((sum, val) => sum + val, 0) / n;
  const ssRes = actual.reduce((sum, val, idx) => sum + Math.pow(val - predicted[idx], 2), 0);
  const ssTot = actual.reduce((sum, val) => sum + Math.pow(val - meanActual, 2), 0);
  return ssTot === 0 ? 1 : 1 - ssRes / ssTot;
}

/**
 * Uses Simple Linear Regression to model the historical HPI trend
 * and extrapolate a future trend over the next 6 months (approx 180 days).
 */
const getFuturePrediction = async (req, res, next) => {
  const { location } = req.params;

  try {
    // 1. Fetch all historical HPI data for the given location, ordered chronologically
    const historyQuery = `
      SELECT pi.hpi, s.sample_date, pi.computed_on
      FROM pollution_indices pi
      JOIN samples s ON pi.sample_id = s.sample_id
      JOIN locations l ON s.location_id = l.location_id
      WHERE l.name = $1
      ORDER BY s.sample_date ASC, pi.computed_on ASC;
    `;

    const { rows } = await db.query(historyQuery, [location]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No historical data found for this location to make a prediction.' });
    }

    // 2. Prepare data for ML Regression (X = days since first sample, Y = HPI)
    const firstDate = new Date(rows[0].sample_date || rows[0].computed_on).getTime();
    const xValues = [];
    const yValues = [];

    // Include all historical points in the model
    rows.forEach(row => {
      const currentDate = new Date(row.sample_date || row.computed_on).getTime();
      const daysDiff = (currentDate - firstDate) / (1000 * 3600 * 24);
      xValues.push(daysDiff);
      yValues.push(parseFloat(row.hpi));
    });

    // 3. Train the model
    // If there's only 1 point, regression will fail or be flat. 
    // We add a slight duplicate variation just to let the math run safely if needed,
    // though in reality 1 point is just a flat line.
    if (xValues.length === 1) {
      xValues.push(xValues[0] + 1);
      yValues.push(yValues[0]);
    }

    const regression = new SimpleLinearRegression(xValues, yValues);
    const score = regression.score(xValues, yValues);
    const correlationCoefficient = Number.isNaN(score.r) ? 1.0 : score.r; // Fallback to 1.0 for constant inputs (zero variance)
    const confidenceScore = Math.min(100, Math.max(0, Math.abs(correlationCoefficient) * 100));

    // 4. Extrapolate (Generate Data Points) 
    // We predict a 6-month trend. To avoid returning 180 rows, we can return ~7 interval points.
    // e.g., today, +30 days, +60 days, +90 days, +120 days, +150 days, +180 days
    const predictionPoints = [];
    const today = new Date();
    const todayDaysDiff = (today.getTime() - firstDate) / (1000 * 3600 * 24);

    const intervals = [1, 30, 60, 90, 120, 150, 180]; // Future days from today

    for (let i = 0; i < intervals.length; i++) {
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + intervals[i]);

      const futureXDiff = todayDaysDiff + intervals[i];
      let predictedHPI = regression.predict(futureXDiff);

      // Ensure HPI doesn't drop below a physical baseline 
      predictedHPI = Math.max(10, predictedHPI);

      predictionPoints.push({
        date: futureDate.toISOString().split('T')[0],
        hpi: +predictedHPI.toFixed(2),
        confidence_score: +confidenceScore.toFixed(2)
      });
    }

    res.json(predictionPoints);

  } catch (err) {
    console.error('DB error in getFuturePrediction:', err.message);
    next(err);
  }
};

export default getFuturePrediction;
