import nodemailer from "nodemailer";
import dotenv from 'dotenv';

dotenv.config();

// Singleton transporter with connection pooling — avoids reconnecting on every email
let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  const user = process.env.SMTP_FROM;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error("SMTP_FROM and SMTP_PASS must be set in environment variables.");
  }

  _transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,        // STARTTLS — faster handshake than SSL/465
    requireTLS: true,
    pool: true,           // reuse connections instead of reconnecting every time
    maxConnections: 3,
    auth: { user, pass },
  });

  return _transporter;
}

export async function sendMail({ to, subject, text, html }) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM;

  return transporter.sendMail({ from, to, subject, text, html });
}

export async function sendWelcomeEmail(user) {
  return sendMail({
    to: user.email,
    subject: "Welcome to Exclusive",
    text: `Hi ${user.name}, welcome to Exclusive. Your account is ready.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Welcome to Exclusive, ${user.name}!</h2>
        <p>Your account is ready. You can now browse products, manage your cart, and place orders.</p>
      </div>
    `,
  });
}

export async function sendAdminCreatedUserEmail(user, password, loginUrl) {
  return sendMail({
    to: user.email,
    subject: "Your Exclusive account details",
    text: `Hi ${user.name}, your Exclusive account has been created. Login URL: ${loginUrl}. Email: ${user.email}. Password: ${password}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Your Exclusive account is ready</h2>
        <p>Hi ${user.name}, an account has been created for you.</p>
        <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p>Please sign in and change your password after your first login.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(user, resetUrl) {
  return sendMail({
    to: user.email,
    subject: "Reset your Exclusive password",
    text: `Hi ${user.name}, reset your password using this link: ${resetUrl}. This link expires in 15 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Reset your password</h2>
        <p>Hi ${user.name}, use the button below to reset your password. This link expires in 15 minutes.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;background:#db4444;color:#ffffff;padding:12px 18px;text-decoration:none;border-radius:6px;">
            Reset Password
          </a>
        </p>
        <p>If the button does not work, copy this URL into your browser:</p>
        <p>${resetUrl}</p>
      </div>
    `,
  });
}

export async function sendAdminLoginOtpEmail(user, otp, expiresInMinutes) {
  return sendMail({
    to: user.email,
    subject: "Your Exclusive admin login OTP",
    text: `Hi ${user.name}, your admin login OTP is ${otp}. It expires in ${expiresInMinutes} minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Admin login verification</h2>
        <p>Hi ${user.name}, use this OTP to finish signing in to your admin account.</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
        <p>This code expires in ${expiresInMinutes} minutes.</p>
        <p>If you did not try to sign in, you can ignore this email.</p>
      </div>
    `,
  });
}
