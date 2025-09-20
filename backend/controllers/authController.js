import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db/db.js';

export const signup = async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING user_id',
      [username, password_hash]
    );
    
    const token = jwt.sign(
      { userId: result.rows[0].user_id, username: username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ token, userId: result.rows[0].user_id, message: "User created successfully." });
  } catch (err) {
    if (err.code === '23505') { // Unique violation for username
      return res.status(409).json({ error: 'Username already exists.' });
    }
    next(err);
  }
};

export const login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const userRes = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userRes.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.user_id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, userId: user.user_id });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = (req, res) => {
  // 📧 Placeholder for forgot password logic:
  // 1. Validate email address from req.body
  // 2. Generate a secure, short-lived token
  // 3. Save the token to a password_resets table with an expiry date
  // 4. Send an email to the user with a link containing the token
  res.status(200).json({ message: 'If a matching email was found, a password reset link has been sent.' });
};
