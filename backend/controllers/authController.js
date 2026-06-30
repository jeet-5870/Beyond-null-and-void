import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db/prismaClient.js'; // 🔄 Replaced raw DB with Prisma Client
import axios from 'axios';
import nodemailer from 'nodemailer'; 
import { logger } from '../config/logger.js'; // Added structured logger

// Local helper functions to map between client-facing roles and DB constraint roles
function mapClientToDbRole(role) {
  if (role === 'ngo') return 'organization';
  if (role === 'guest') return 'general';
  return role;
}

function mapDbToClientRole(role) {
  if (role === 'organization') return 'ngo';
  if (role === 'general') return 'guest';
  return role;
}

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
  const clientRole = mapDbToClientRole(user.role);
  return jwt.sign(
    { userId: user.user_id, fullname: user.fullname, role: clientRole },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Helper function to dynamically attach the JWT token inside a secure cookie
const setAuthCookie = (res, token) => {
  res.cookie('jwt', token, {
    httpOnly: true,                               // 🔒 Blocks JS access (XSS mitigation)
    secure: process.env.NODE_ENV === 'production', // 🔒 Enforces HTTPS transmission in production
    sameSite: 'strict',                           // 🔒 CSRF Protection
    maxAge: 3600000,                              // 1 Hour in milliseconds
  });
};

// Sends OTP via Email (SendGrid/Nodemailer) or simulates for Phone/missing config.
const sendOtpAndRespond = async (userId, identifier, isEmail, res) => {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

  if (isEmail) {
    if (process.env.SENDGRID_API_KEY) {
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
        logger.info(`[AUTH] Successfully sent OTP email to ${identifier} via SendGrid`);
      } catch (error) {
        logger.error('[AUTH] Error sending OTP email via SendGrid:', error.response?.data);
        logger.info(`[AUTH] SIMULATED OTP for Email ${identifier}: ${otp}`);
      }
    } else if (process.env.GMAIL_USER) {
      const mailOptions = {
          from: process.env.GMAIL_USER,
          to: identifier,
          subject: 'Verification Code',
          text: `Your Groundwater Analyzer verification code is: ${otp}`
      };
      try {
        await transporter.sendMail(mailOptions);
        logger.info(`[AUTH] Successfully sent OTP email to ${identifier} via Nodemailer fallback`);
      } catch (error) {
        logger.error('[AUTH] Error sending OTP email via Nodemailer fallback:', error);
        logger.info(`[AUTH] SIMULATED OTP for Email ${identifier}: ${otp}`);
      }
    } else {
      logger.info(`[AUTH] Email API keys not set. SIMULATED OTP for Email ${identifier}: ${otp}`);
    }
  } else {
    logger.warn(`[AUTH] CRITICAL WARNING: Dedicated SMS API is required for reliable phone verification. SIMULATED OTP for Phone ${identifier}: ${otp}`);
  }
    
  // 🔄 Prisma Refactor: Replaced raw UPDATE string query
  await prisma.user.update({
    where: { user_id: userId },
    data: {
      reset_token: otp,
      reset_token_expires: expiresAt
    }
  });
  
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

  try {
    // 🔄 Prisma Refactor: Clean dynamic property search criteria
    const user = await prisma.user.findUnique({
      where: isEmail ? { email: identifier } : { phone: identifier }
    });
    
    const userExists = !!user;

    if (mode === 'signup') {
      if (userExists) {
        return res.status(409).json({ error: `${isEmail ? 'Email' : 'Phone'} already registered. Please login.` });
      }
      return res.json({ success: true, nextStep: 'password' }); 
    } 
    
    // Login Mode
    if (!userExists) {
        return res.json({ success: true, nextStep: 'password', error: `Account not found for ${identifier}. Please sign up.` });
    }

    // User exists. Determine if password is set.
    if (user.password_hash) {
      return res.json({ success: true, nextStep: 'password' }); 
    } else {
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

  try {
    let user;

    if (mode === 'signup') {
      // 🔄 Prisma Refactor: Find unique record
      const existingUser = await prisma.user.findUnique({
        where: isEmail ? { email: identifier } : { phone: identifier }
      });
      
      if (existingUser) {
        return res.status(409).json({ error: `${isEmail ? 'Email' : 'Phone'} already registered.` });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const emailValue = isEmail ? identifier : null;
      const phoneValue = isEmail ? null : identifier;
      const dbRole = mapClientToDbRole(role);
      
      // 🔄 Prisma Refactor: Handled structural INSERT object creation mapping
      user = await prisma.user.create({
        data: {
          fullname,
          email: emailValue,
          phone: phoneValue,
          password_hash,
          role: dbRole
        }
      });
      
      return sendOtpAndRespond(user.user_id, identifier, isEmail, res);

    } else { 
      // LOGIN LOGIC: Only password required.
      user = await prisma.user.findUnique({
        where: isEmail ? { email: identifier } : { phone: identifier }
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials or user not found.' });
      }
      
      if (!user.password_hash) {
          return res.status(401).json({ error: 'Account requires OTP verification. Please request OTP.' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid password.' });
      }
      
      // 🔒 Cookie Hardening: Generate token and inject it into a cookie instead of explicit JSON text fields
      const token = createToken(user);
      setAuthCookie(res, token);
      
      res.json({ success: true, userId: user.user_id, role: mapDbToClientRole(user.role) });
    }
    
  } catch (err) {
    next(err);
  }
};

// 3. Handles OTP verification (Step 2)
export const verifyOtp = async (req, res, next) => {
  const { identifier, otp, newPassword } = req.body; 
  if (!identifier || !otp) {
    return res.status(400).json({ error: 'Identifier and OTP are required.' });
  }
  
  if (newPassword && newPassword.length < 6) { 
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  const isEmail = identifier.includes('@');

  try {
    const user = await prisma.user.findUnique({
      where: isEmail ? { email: identifier } : { phone: identifier }
    });

    if (!user || user.reset_token !== otp || new Date() > new Date(user.reset_token_expires)) {
      if (user) {
        // 🔄 Prisma Refactor: Standardized clear updates
        await prisma.user.update({
          where: { user_id: user.user_id },
          data: { reset_token: null, reset_token_expires: null }
        });
      }
      return res.status(401).json({ error: 'Invalid or expired OTP.' });
    }

    const updateData = {
      reset_token: null,
      reset_token_expires: null
    };

    if (newPassword) {
        updateData.password_hash = await bcrypt.hash(newPassword, 10);
    }
    
    // 🔄 Prisma Refactor: Conditional execution wrapped within clear parameters object mapping
    const updatedUser = await prisma.user.update({
      where: { user_id: user.user_id },
      data: updateData
    });

    // 🔒 Cookie Hardening: Issue session to local secure cookie domain bounds
    const token = createToken(updatedUser);
    setAuthCookie(res, token);

    res.json({ success: true, userId: user.user_id, role: mapDbToClientRole(user.role) });

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
    
    try {
        const user = await prisma.user.findUnique({
          where: isEmail ? { email: identifier } : { phone: identifier },
          select: { user_id: true }
        });

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
    res.json({ success: true, message: 'Token is valid' });
};


// Add this to the bottom of authController.js
export const logout = (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ success: true, message: 'Successfully logged out.' });
};
