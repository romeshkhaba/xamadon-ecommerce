import express from 'express';
import validate from '../middleware/validate.js';
import { signUpDTO, adminSignUpDTO } from '../dto/signup.dto.js';
import { loginDTO, resendAdminOtpDTO, verifyAdminOtpDTO } from '../dto/login.dto.js';
import { changePasswordDTO, forgotPasswordDTO, resetPasswordDTO } from '../dto/password.dto.js';
import asyncHandler from '../middleware/async-handler.js';
import authenticate from '../middleware/authenticate.js';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/sign-up', validate(signUpDTO), asyncHandler(authController.signupController));
router.post('/admin-sign-up', validate(adminSignUpDTO), asyncHandler(authController.adminSignupController));
router.post('/login', validate(loginDTO), asyncHandler(authController.login));
router.post('/verify-admin-otp', validate(verifyAdminOtpDTO), asyncHandler(authController.verifyAdminLoginOtp));
router.post('/resend-admin-otp', validate(resendAdminOtpDTO), asyncHandler(authController.resendAdminLoginOtp));
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordDTO),
  asyncHandler(authController.changePassword)
);
router.post(
  '/forgot-password',
  validate(forgotPasswordDTO),
  asyncHandler(authController.forgotPassword)
);
router.post(
  '/forget-password',
  validate(forgotPasswordDTO),
  asyncHandler(authController.forgotPassword)
);
router.post(
  '/reset-password',
  validate(resetPasswordDTO),
  asyncHandler(authController.resetPassword)
);

export default router;
