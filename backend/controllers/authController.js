import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db/db.js';

export const signup = async (req, res, next) => {
  // 🔑 UPDATED to use fullname, email, and role from request body
  const { fullname, email, password, role } = req.body;
  if (!fullname || !email || !password || !role) {
    return res.status(400).json({ error: 'Full name, email, password, and role are required.' });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      // 🔑 UPDATED QUERY
      'INSERT INTO users (fullname, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING user_id',
      [fullname, email, password_hash, role]
    );
    
    // 🔑 ADDED fullname and role to JWT payload
    const token = jwt.sign(
      { userId: result.rows[0].user_id, fullname: fullname, role: role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ token, userId: result.rows[0].user_id, role, message: "User created successfully." });
  } catch (err) {
    if (err.code === '23505') { // Unique violation for email
      return res.status(409).json({ error: 'Email already exists.' });
    }
    next(err);
  }
};

export const login = async (req, res, next) => {
  // 🔑 UPDATED to use fullname (as username for login)
  const { fullname, password } = req.body; 

  try {
    // 🔑 UPDATED to look up by fullname
    const userRes = await db.query('SELECT * FROM users WHERE fullname = $1', [fullname]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userRes.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 🔑 ADDED fullname and role to JWT payload and response
    const token = jwt.sign(
      { userId: user.user_id, fullname: user.fullname, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, userId: user.user_id, role: user.role });
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