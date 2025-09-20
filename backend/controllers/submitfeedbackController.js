import db from '../db/db.js';

export const submitFeedback = async (req, res, next) => {
  const { feedback } = req.body;
  if (!feedback) {
    return res.status(400).json({ error: 'Feedback message cannot be empty.' });
  }

  try {
    const result = await db.query(
      'INSERT INTO feedback (message) VALUES ($1) RETURNING *',
      [feedback]
    );
    res.status(201).json({ message: 'Feedback submitted successfully.', feedback: result.rows[0] });
  } catch (err) {
    next(err);
  }
};
