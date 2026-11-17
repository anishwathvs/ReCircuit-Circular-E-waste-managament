import { Router } from 'express';
import {
  register,
  login,
  demoLogin,
  getMe,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  updateProfile,
} from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/demo-login', demoLogin);
router.post('/refresh', refreshToken);
router.get('/me', authenticateJWT, getMe);
router.patch('/profile', authenticateJWT, updateProfile);

// Email verification & password recovery
router.post('/verify-email', verifyEmail);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
