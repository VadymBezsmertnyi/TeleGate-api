import { z } from "zod";

export const userSchema = z.object({
  _id: z.any(),
  telegramId: z.number(),
  username: z.string().nullable().default(null),
  firstName: z.string().nullable().default(null),
  lastName: z.string().nullable().default(null),
  photoUrl: z.string().nullable().default(null),
  lastActivityAt: z.date(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const userPublicSchema = z.object({
  id: z.number(),
  username: z.string().nullable().optional(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  photo_url: z.string().nullable().optional(),
});

export const createUserSchema = z.object({
  telegramId: z.number(),
  username: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  photoUrl: z.string().optional(),
});
