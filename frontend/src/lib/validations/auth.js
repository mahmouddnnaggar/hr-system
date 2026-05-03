import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Use a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().min(1, "Email is required").email("Use a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["HR", "EMPLOYEE"], { message: "Choose HR or Employee" }),
});

export const otpSchema = z.object({
  email: z.string().min(1, "Email is required").email("Use a valid email"),
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});
