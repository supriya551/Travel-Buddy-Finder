import { Router } from 'express';
import * as authService from './authService.js';
import asyncHandler from './asyncHandler.js';
import AppError from './AppError.js';
import { requireAuth } from './middleware.js';

const router = Router();

// POST /api/auth/register
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const result = await authService.register(name, email, password);
  res.status(201).json(result);
}));

// POST /api/auth/verify-otp
router.post('/verify-otp', asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  const result = await authService.verifyOtp(email, code);
  res.status(200).json(result);
}));

// POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.status(200).json(result);
}));

// POST /api/auth/change-password  (requires JWT)
router.post('/change-password', requireAuth, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, currentPassword, newPassword);
  res.status(200).json({ message: 'Password updated successfully.' });
}));

// DELETE /api/auth/account  (requires JWT)
router.delete('/account', requireAuth, asyncHandler(async (req, res) => {
  const { password } = req.body;
  await authService.deleteAccount(req.user.id, password);
  res.status(200).json({ message: 'Account deleted.' });
}));

// Error handling middleware
router.use((err, req, res, next) => {
  const status  = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message : 'Internal server error.';
  if (status === 500) console.error(err);
  res.status(status).json({ error: message });
});

export default router;
