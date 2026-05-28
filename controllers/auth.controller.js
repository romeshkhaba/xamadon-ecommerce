import * as authService from '../services/auth.service.js';
import {userResponse } from '../dto/user-response.dto.js';

export const signupController = async (req, res) => {
  const user = await authService.signUpService(req.validatedData);
  const response = userResponse(user);

  res.success(response, 'User created successfully', 201);
};

export const adminSignupController = async (req, res) => {
  const user = await authService.adminSignUpService(req.validatedData);
  const response = userResponse(user);

  res.success(response, 'Admin account created successfully', 201);
};

export const login = async (req, res) => {
  const {existingUser, accessToken, twoFactorRequired, email} = await authService.login(req.validatedData);

  if (twoFactorRequired) {
    return res.success(
      { email, twoFactorRequired },
      'Admin OTP sent to email'
    );
  }

  const response = userResponse(existingUser);

  res.success(response, 'Login successfully', 200, { accessToken });
};

export const verifyAdminLoginOtp = async (req, res) => {
  const {existingUser, accessToken} = await authService.verifyAdminLoginOtp(req.validatedData);
  const response = userResponse(existingUser);

  res.success(response, 'Admin login verified successfully', 200, { accessToken });
};

export const resendAdminLoginOtp = async (req, res) => {
  const response = await authService.resendAdminLoginOtp(req.validatedData);

  res.success(response, 'Admin OTP resent to email');
};

export const changePassword = async (req, res) => {
  const response = await authService.changePassword(req.user, req.validatedData);

  res.success(response, 'Password changed successfully');
};

export const forgotPassword = async (req, res) => {
  const response = await authService.forgotPassword(req.validatedData);

  res.success(response, response.message);
};

export const resetPassword = async (req, res) => {
  const response = await authService.resetPassword(req.validatedData);

  res.success(response, 'Password reset successfully');
};
