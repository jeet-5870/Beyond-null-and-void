// backend/controllers/submitfeedbackController.js

import db from '../db/db.js';

export const submitFeedback = async (req, res, next) => {
  // 🔑 FIX: Use 'message' key to be consistent with the authenticated controller
  const { message } = req.body; 
  if (!message) {
    return res.status(400).json({ error: 'Feedback message cannot be empty.' });
  }

  try {
    const result = await db.query(
      'INSERT INTO feedback (message) VALUES ($1) RETURNING *',
      [message]
    );
    res.status(201).json({ message: 'Feedback submitted successfully.', feedback: result.rows[0] });
  } catch (err) {
    next(err);
  }
};