import z from "zod";

export const loginDTO = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long")
});

export const verifyAdminOtpDTO = z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().trim().regex(/^\d{6}$/, "OTP must be a 6 digit code")
});

export const resendAdminOtpDTO = z.object({
    email: z.string().email("Invalid email address")
});
