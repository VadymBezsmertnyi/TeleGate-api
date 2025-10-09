import { z } from "zod";

export const authSchema = z.object({
  _id: z.any(),
  email: z.string(),
  phone: z.string().nullable().optional(),
  isBlocked: z.boolean().default(false),
  isVerified: z.boolean().default(false),
  role: z.enum(["user", "admin"]).default("user"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});

export const createAuthSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});

export const updateAuthSchema = z.object({
  email: z.email().optional(),
  password: z.string().min(6).optional(),
  phone: z.string().optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});
