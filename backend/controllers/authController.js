import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db/db.js';

// Helper function to generate a 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper function to generate JWT token
const createToken = (user) => {
  return jwt.sign(
    { userId: user.user_id, fullname: user.fullname, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// 1. Handles the start of the authentication process (Step 0)
export const initiateAuth = async (req, res, next) => {
  const { identifier, mode } = req.body;
  if (!identifier || !mode) {
    return res.status(400).json({ error: 'Identifier (email/phone) and mode are required.' });
  }

  const isEmail = identifier.includes('@');
  const identifierField = isEmail ? 'email' : 'phone';

  try {
    const userRes = await db.query(`SELECT * FROM users WHERE ${identifierField} = $1`, [identifier]);
    const userExists = userRes.rows.length > 0;
    const user = userRes.rows[0];

    if (mode === 'signup') {
      if (userExists) {
        return res.status(409).json({ error: `${identifierField} already registered. Please login.` });
      }
      // For new users, proceed to password setup (Step 1)
      return res.json({ success: true, nextStep: 'password' }); 
    } 
    
    // Login Mode
    if (!userExists) {
        // If user doesn't exist in login mode, redirect to password registration/signup
        return res.json({ success: true, nextStep: 'password', error: `Account not found for ${identifier}. Please sign up.` });
    }

    // User exists. Determine if password is set.
    if (user.password_hash) {
      // User has a password, prompt for password (Step 1)
      return res.json({ success: true, nextStep: 'password' }); 
    } else {
      // Passwordless user, enforce OTP for security (Step 2)
      return sendOtpAndRespond(user.user_id, identifier, isEmail, res); 
    }

  } catch (err) {
    next(err);
  }
};

// Sends OTP and updates user record
const sendOtpAndRespond = async (userId, identifier, isEmail, res) => {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

  // In a real app, this simulates sending email/SMS
  console.log(`[AUTH] Sending OTP: ${otp} to ${identifier}. Valid until ${expiresAt.toLocaleTimeString()}.`);

  await db.query(
    'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE user_id = $3',
    [otp, expiresAt, userId]
  );
  
  const identifierType = isEmail ? 'Email' : 'Phone Number';
  
  res.json({ 
    success: true, 
    nextStep: 'otp', 
    message: `Verification code sent to your ${identifierType}.` 
  });
};

// 2. Handles standard login and signup with password (Step 1)
export const passwordAuth = async (req, res, next) => {
  const { identifier, password, fullname, role, mode } = req.body;
  const isEmail = identifier.includes('@');
  const identifierField = isEmail ? 'email' : 'phone';
  const otherIdentifierField = isEmail ? 'phone' : 'email';

  try {
    let user;

    if (mode === 'signup') {
      // Check if user already exists (should have been caught in initiateAuth, but for safety)
      const existingUser = await db.query(`SELECT * FROM users WHERE ${identifierField} = $1`, [identifier]);
      if (existingUser.rows.length > 0) {
        return res.status(409).json({ error: `${identifierField} already registered.` });
      }

      // Create new user
      const password_hash = await bcrypt.hash(password, 10);
      const emailValue = isEmail ? identifier : null;
      const phoneValue = isEmail ? null : identifier;
      
      const result = await db.query(
        `INSERT INTO users (fullname, email, phone, password_hash, role) 
         VALUES ($1, $2, $3, $4, $5) RETURNING user_id, fullname, role`,
        [fullname, emailValue, phoneValue, password_hash, role]
      );
      user = result.rows[0];

    } else { // Login mode
      const userRes = await db.query(`SELECT * FROM users WHERE ${identifierField} = $1`, [identifier]);
      user = userRes.rows[0];

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials or user not found.' });
      }
      
      // If user is found but hasn't set a password yet, we block standard login
      if (!user.password_hash) {
          return res.status(401).json({ error: 'Account requires OTP verification. Please request OTP.' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid password.' });
      }
    }
    
    // Success: Generate and return token
    const token = createToken(user);
    res.json({ token, userId: user.user_id, role: user.role });

  } catch (err) {
    next(err);
  }
};

// 3. Handles OTP verification (Step 2)
export const verifyOtp = async (req, res, next) => {
  const { identifier, otp } = req.body;
  if (!identifier || !otp) {
    return res.status(400).json({ error: 'Identifier and OTP are required.' });
  }

  const isEmail = identifier.includes('@');
  const identifierField = isEmail ? 'email' : 'phone';

  try {
    const userRes = await db.query(`SELECT * FROM users WHERE ${identifierField} = $1`, [identifier]);
    const user = userRes.rows[0];

    if (!user || user.reset_token !== otp || new Date() > new Date(user.reset_token_expires)) {
      // Clear token/expiry to prevent brute force/reuse
      await db.query('UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE user_id = $1', [user.user_id]);
      return res.status(401).json({ error: 'Invalid or expired OTP.' });
    }

    // Success: Clear OTP fields and log the user in
    await db.query('UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE user_id = $1', [user.user_id]);

    const token = createToken(user);
    res.json({ token, userId: user.user_id, role: user.role });

  } catch (err) {
    next(err);
  }
};

// 4. Endpoint to request OTP (e.g., for password reset or initial passwordless login)
export const requestOtp = async (req, res, next) => {
    const { identifier } = req.body;
    if (!identifier) {
        return res.status(400).json({ error: 'Identifier is required.' });
    }
    
    const isEmail = identifier.includes('@');
    const identifierField = isEmail ? 'email' : 'phone';
    
    try {
        const userRes = await db.query(`SELECT user_id FROM users WHERE ${identifierField} = $1`, [identifier]);
        const user = userRes.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        
        return sendOtpAndRespond(user.user_id, identifier, isEmail, res);

    } catch (err) {
        next(err);
    }
};

// Old login/signup exports removed, replaced by new auth flow functions.
export const login = () => { throw new Error("Use /initiate-auth instead."); };
export const signup = () => { throw new Error("Use /password-auth instead."); };
export const forgotPassword = () => { throw new Error("Use /request-otp instead."); };
