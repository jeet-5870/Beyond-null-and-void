// backend/controllers/authController.js

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db/db.js';
import axios from 'axios';
import nodemailer from 'nodemailer'; // 🔑 NEW: Import the nodemailer library

// 🔑 NEW: Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

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

// 🔑 MODIFIED: Sends OTP via Email or "SMS" through Nodemailer
const sendOtpAndRespond = async (userId, identifier, isEmail, res) => {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

  if (isEmail && process.env.SENDGRID_API_KEY) {
    // --- Email Sending Logic (SendGrid) ---
    const emailData = {
      personalizations: [{ to: [{ email: identifier }] }],
      from: { email: process.env.SENDER_EMAIL },
      subject: 'Your Groundwater Analyzer Verification Code',
      content: [
        {
          type: 'text/plain',
          value: `Your verification code is: ${otp}. It is valid for 5 minutes.`,
        },
      ],
    };

    try {
      await axios.post('https://api.sendgrid.com/v3/mail/send', emailData, {
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      console.log(`[AUTH] Successfully sent OTP email to ${identifier}`);
    } catch (error) {
      console.error('[AUTH] Error sending OTP email via SendGrid:', error.response?.data);
      console.log(`[AUTH] SIMULATED OTP for ${identifier}: ${otp}`);
    }
  } else if (!isEmail && process.env.GMAIL_USER) {
    // --- 🔑 START: "SMS" via Email Logic (Nodemailer) ---
    
    // NOTE: This is a limitation. We need to guess the carrier gateway.
    // For this example, we'll assume a common Indian carrier like Jio.
    // A production app would need a more robust way to determine this.
    const smsGatewayAddress = `${identifier}@jio.com`; 

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: smsGatewayAddress,
        subject: 'Verification Code',
        text: `Your Groundwater Analyzer verification code is: ${otp}`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[AUTH] Successfully sent OTP "SMS" to ${identifier}`);
    } catch (error) {
        console.error('[AUTH] Error sending OTP via Nodemailer:', error);
        console.log(`[AUTH] SIMULATED OTP for ${identifier}: ${otp}`);
    }
    // --- 🔑 END: "SMS" via Email Logic ---
    
  } else {
    // Fallback to simulation if API keys are missing
    console.log(`[AUTH] API keys not set. SIMULATED OTP for ${identifier}: ${otp}`);
  }

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

// 2. Handles standard login and signup with password (Step 1)
export const passwordAuth = async (req, res, next) => {
  const { identifier, password, fullname, role, mode } = req.body;
  const isEmail = identifier.includes('@');
  const identifierField = isEmail ? 'email' : 'phone';

  try {
    let user;

    if (mode === 'signup') {
      // 泊 SIGNUP LOGIC: Create user, then enforce OTP verification.
      const existingUser = await db.query(`SELECT * FROM users WHERE ${identifierField} = $1`, [identifier]);
      if (existingUser.rows.length > 0) {
        return res.status(409).json({ error: `${identifierField} already registered.` });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const emailValue = isEmail ? identifier : null;
      const phoneValue = isEmail ? null : identifier;
      
      const result = await db.query(
        `INSERT INTO users (fullname, email, phone, password_hash, role) 
         VALUES ($1, $2, $3, $4, $5) RETURNING user_id, fullname, role`,
        [fullname, emailValue, phoneValue, password_hash, role]
      );
      user = result.rows[0];
      
      // Enforce OTP after signup (Step 2)
      return sendOtpAndRespond(user.user_id, identifier, isEmail, res);

    } else { // Login mode
      // 泊 LOGIN LOGIC: Only password required.
      const userRes = await db.query(`SELECT * FROM users WHERE ${identifierField} = $1`, [identifier]);
      user = userRes.rows[0];

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials or user not found.' });
      }
      
      // Enforce password check for standard login path
      if (!user.password_hash) {
          return res.status(401).json({ error: 'Account requires OTP verification. Please request OTP.' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid password.' });
      }
      
      // Standard login success: Generate and return token (NO OTP required for login)
      const token = createToken(user);
      res.json({ token, userId: user.user_id, role: user.role });
    }
    
  } catch (err) {
    next(err);
  }
};

// 3. Handles OTP verification (Step 2)
export const verifyOtp = async (req, res, next) => {
  const { identifier, otp, newPassword } = req.body; // 泊 UPDATED: Accept newPassword
  if (!identifier || !otp) {
    return res.status(400).json({ error: 'Identifier and OTP are required.' });
  }
  
  // 泊 NEW: Validate new password length if provided (for reset flow)
  if (newPassword && newPassword.length < 6) { 
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  const isEmail = identifier.includes('@');
  const identifierField = isEmail ? 'email' : 'phone';

  try {
    const userRes = await db.query(`SELECT * FROM users WHERE ${identifierField} = $1`, [identifier]);
    const user = userRes.rows[0];

    if (!user || user.reset_token !== otp || new Date() > new Date(user.reset_token_expires)) {
      // Clear token/expiry to prevent brute force/reuse
      if (user) {
        await db.query('UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE user_id = $1', [user.user_id]);
      }
      return res.status(401).json({ error: 'Invalid or expired OTP.' });
    }

    let updateQuery = 'UPDATE users SET reset_token = NULL, reset_token_expires = NULL';
    let updateParams = [];
    let paramIndex = 1;

    if (newPassword) {
        // 泊 NEW: If newPassword is provided (forgot password flow), update the password hash
        const password_hash = await bcrypt.hash(newPassword, 10);
        updateQuery += `, password_hash = $${paramIndex++}`;
        updateParams.push(password_hash);
    }
    
    updateQuery += ` WHERE user_id = $${paramIndex}`;
    updateParams.push(user.user_id);

    // Success: Clear OTP fields and log the user in (and reset password if applicable)
    await db.query(updateQuery, updateParams);

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

// 5. Endpoint to verify token validity (used by frontend on page load)
export const verifyToken = (req, res) => {
    // If authMiddleware successfully verified the token and added req.user, 
    // the token is valid. We don't need to do anything else here.
    res.json({ success: true, message: 'Token is valid' });
};