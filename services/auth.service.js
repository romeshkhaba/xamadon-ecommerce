import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { UniqueConstraintError } from 'sequelize';
import { AppError } from '../middleware/error-response.js';
import { createUser, getUserByEmail, updateUser, updateUserById } from '../repositories/user.repository.js';
import jwt from 'jsonwebtoken'
import { isAdminUser } from '../utils/admin.js';
import { sendAdminLoginOtpEmail, sendPasswordResetEmail, sendWelcomeEmail } from './email.service.js';

const SALT_ROUNDS = 10;
const RESET_PASSWORD_TOKEN_MINUTES = 15;
const ADMIN_LOGIN_OTP_MINUTES = 10;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function getClientUrl() {
  return process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
}

function createOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

function createAccessToken(user) {
  const jwtSecret = process.env.JWT_SECRET || 'JWT_SECRET';

  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: isAdminUser(user),
    },
    jwtSecret,
    { expiresIn: '7d' }
  );
}

export async function signUpService(data) {
  const name = data.name.trim();
  const email = data.email.trim().toLowerCase();
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    throw new AppError('Email already exists', 409);
  }

  try {
    const user = await createUser({
      name,
      email,
      password: await hashPassword(data.password)
    });

    sendWelcomeEmail(user).catch((error) => {
      console.error('Failed to send welcome email:', error.message);
    });

    return user;
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new AppError('Email already exists', 409);
    }
    throw error;
  }
}


export async function login(data) {
  const email = data.email.trim().toLowerCase();
  const existingUser = await getUserByEmail(email);
  console.log('\n\n\n\n',existingUser)

  if (!existingUser) {
    throw new AppError('User does not exists', 404);
  }

  const validPassword = await bcrypt.compare(data.password, existingUser.password);
  if (!validPassword){
    throw new AppError('Invalid credentials', 401);
  }

  if (isAdminUser(existingUser)) {
    await sendAdminLoginOtp(existingUser);

    return {
      twoFactorRequired: true,
      email: existingUser.email,
    };
  }

  const accessToken = createAccessToken(existingUser);

  return {existingUser, accessToken};
}

async function sendAdminLoginOtp(user) {
  const otp = createOtp();
  const twoFactorOtpExpiresAt = new Date(
    Date.now() + ADMIN_LOGIN_OTP_MINUTES * 60 * 1000
  );

  const updatedUser = await updateUserById(user.id, {
    twoFactorOtpToken: otp,
    twoFactorOtpExpiresAt,
  });

  if (!updatedUser) {
    throw new AppError('Unable to update OTP', 500);
  }

  sendAdminLoginOtpEmail(updatedUser, otp, ADMIN_LOGIN_OTP_MINUTES).catch((error) => {
    console.error('Failed to send admin login OTP email:', error.message);
  });
}

export async function resendAdminLoginOtp(data) {
  const email = data.email.trim().toLowerCase();
  const existingUser = await getUserByEmail(email);

  if (!existingUser || !isAdminUser(existingUser)) {
    throw new AppError('Unable to resend OTP', 400);
  }

  await sendAdminLoginOtp(existingUser);

  return {
    email: existingUser.email,
    twoFactorRequired: true,
  };
}

export async function verifyAdminLoginOtp(data) {
  const email = data.email.trim().toLowerCase();
  const existingUser = await getUserByEmail(email);

  if (!existingUser || !isAdminUser(existingUser)) {
    throw new AppError('Invalid or expired OTP', 400);
  }

  const tokenMatches = existingUser.twoFactorOtpToken === data.otp;
  const tokenIsValid =
    existingUser.twoFactorOtpExpiresAt &&
    new Date(existingUser.twoFactorOtpExpiresAt).getTime() > Date.now();

  if (!tokenMatches || !tokenIsValid) {
    throw new AppError('Invalid or expired OTP', 400);
  }

  await updateUser(existingUser, {
    twoFactorOtpToken: null,
    twoFactorOtpExpiresAt: null,
  });

  const accessToken = createAccessToken(existingUser);

  return { existingUser, accessToken };
}

export async function changePassword(user, data) {
  const validPassword = await bcrypt.compare(data.currentPassword, user.password);

  if (!validPassword) {
    throw new AppError('Current password is incorrect', 401);
  }

  if (data.currentPassword === data.newPassword) {
    throw new AppError('New password must be different from current password', 400);
  }

  await updateUser(user, {
    password: await hashPassword(data.newPassword),
    resetPasswordToken: null,
    resetPasswordExpiresAt: null,
  });

  return { message: 'Password changed successfully' };
}

export async function forgotPassword(data) {
  const email = data.email.trim().toLowerCase();
  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return {
      message: 'If an account exists for this email, a password reset link has been sent',
    };
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetUrl = `${getClientUrl()}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
  const resetPasswordExpiresAt = new Date(
    Date.now() + RESET_PASSWORD_TOKEN_MINUTES * 60 * 1000
  );

  await updateUser(existingUser, {
    resetPasswordToken: hashToken(resetToken),
    resetPasswordExpiresAt,
  });

  try {
    await sendPasswordResetEmail(existingUser, resetUrl);
  } catch (error) {
    await updateUser(existingUser, {
      resetPasswordToken: null,
      resetPasswordExpiresAt: null,
    });

    throw new AppError(`Unable to send reset email: ${error.message}`, 500);
  }

  return {
    message: 'If an account exists for this email, a password reset link has been sent',
  };
}

export async function resetPassword(data) {
  const email = data.email.trim().toLowerCase();
  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  const tokenMatches = existingUser.resetPasswordToken === hashToken(data.token);
  const tokenIsValid =
    existingUser.resetPasswordExpiresAt &&
    new Date(existingUser.resetPasswordExpiresAt).getTime() > Date.now();

  if (!tokenMatches || !tokenIsValid) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  await updateUser(existingUser, {
    password: await hashPassword(data.password),
    resetPasswordToken: null,
    resetPasswordExpiresAt: null,
  });

  return { message: 'Password reset successfully' };
}
