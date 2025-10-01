import express from 'express';
import { 
  initiateAuth, 
  passwordAuth, 
  verifyOtp,
  requestOtp, // Used for explicit OTP requests (e.g., password reset)
} from '../controllers/authController.js';

const router = express.Router();

// Step 0: Checks identifier and determines next step (password or OTP)
router.post('/initiate-auth', initiateAuth);

// Step 1: Handles standard password login OR new user signup (requires mode in body)
router.post('/password-auth', passwordAuth);

// Step 2: Handles OTP verification
router.post('/verify-otp', verifyOtp);

// Explicit OTP request route (e.g., if user forgets password/wants passwordless entry)
router.post('/request-otp', requestOtp);

// 🔑 REMOVED: Deprecated placeholder routes (login, signup, forgot-password) have been removed.

export default router;