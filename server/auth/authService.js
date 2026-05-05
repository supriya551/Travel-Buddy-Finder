import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import * as userStore from '../data/userStore.js';
import * as otpService from './otpService.js';
import * as jwtService from './jwtService.js';
import { sendOtp } from './emailService.js';
import AppError from './AppError.js';
import { isValidEmail } from '../utils/validate.js';

const BCRYPT_ROUNDS = 10;

export async function register(name, email, password) {
  // Validate inputs
  if (!name?.trim() || !email?.trim() || !password) {
    throw new AppError('Name, email, and password are required.', 400);
  }
  if (!isValidEmail(email.trim())) {
    throw new AppError('Invalid email address.', 400);
  }
  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters.', 400);
  }

  const normalEmail = email.trim().toLowerCase();

  // Check for existing verified account
  const existing = userStore.findByEmail(normalEmail);
  if (existing && existing.verified) {
    throw new AppError('An account with this email already exists.', 409);
  }

  // Hash password and create/overwrite unverified user
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const id = existing?.id || uuidv4();

  if (existing) {
    userStore.update(id, { passwordHash, verified: false });
  } else {
    userStore.create({ id, name: name.trim(), email: normalEmail, passwordHash, verified: false });
  }

  // Generate OTP and send email
  const code = otpService.generateAndStore(normalEmail);
  await sendOtp(normalEmail, code);

  return { message: 'Verification code sent to your email.' };
}

export async function verifyOtp(email, code) {
  if (!email || !code) {
    throw new AppError('Email and code are required.', 400);
  }

  const normalEmail = email.trim().toLowerCase();

  // Throws AppError if invalid/expired/wrong
  otpService.verify(normalEmail, code);

  const user = userStore.findByEmail(normalEmail);
  if (!user) {
    throw new AppError('Invalid or expired verification code.', 400);
  }

  userStore.update(user.id, { verified: true });

  const token = jwtService.sign({ id: user.id, name: user.name, email: user.email });
  return { token, user: { id: user.id, name: user.name, email: user.email } };
}

export async function login(email, password) {
  if (!email || !password) {
    throw new AppError('Invalid credentials.', 401);
  }

  const normalEmail = email.trim().toLowerCase();
  const user = userStore.findByEmail(normalEmail);

  if (!user) {
    throw new AppError('Invalid credentials.', 401);
  }

  if (!user.verified) {
    throw new AppError('Please verify your email before logging in.', 403);
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    throw new AppError('Invalid credentials.', 401);
  }

  const token = jwtService.sign({ id: user.id, name: user.name, email: user.email });
  return { token, user: { id: user.id, name: user.name, email: user.email } };
}

export async function changePassword(userId, currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    throw new AppError('Current and new passwords are required.', 400);
  }
  if (newPassword.length < 8) {
    throw new AppError('New password must be at least 8 characters.', 400);
  }

  const user = userStore.findById(userId);
  if (!user) throw new AppError('User not found.', 404);

  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) throw new AppError('Current password is incorrect.', 401);

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  userStore.update(userId, { passwordHash });
}

export async function deleteAccount(userId, password) {
  if (!password) throw new AppError('Password is required to delete your account.', 400);

  const user = userStore.findById(userId);
  if (!user) throw new AppError('User not found.', 404);

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new AppError('Incorrect password.', 401);

  userStore.remove(userId);
}
