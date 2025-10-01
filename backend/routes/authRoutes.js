// backend/routes/authRoutes.js

import express from 'express';
import { 
  initiateAuth, 
  passwordAuth, 
  verifyOtp,
  requestOtp,
  verifyToken // 🔑 NEW IMPORT
} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js'; // 🔑 NEEDED for protected route

const router = express.Router();

// Step 0: Checks identifier and determines next step (password or OTP)
router.post('/initiate-auth', initiateAuth);

// Step 1: Handles standard password login OR new user signup (requires mode in body)
router.post('/password-auth', passwordAuth);

// Step 2: Handles OTP verification
router.post('/verify-otp', verifyOtp);

// Explicit OTP request route (e.g., if user forgets password/wants passwordless entry)
router.post('/request-otp', requestOtp);

// 🔑 NEW: Protected route to verify JWT validity on page load
router.get('/verify-token', authMiddleware, verifyToken); 

// 🔑 REMOVED: Deprecated placeholder routes (login, signup, forgot-password) have been removed.

export default router;