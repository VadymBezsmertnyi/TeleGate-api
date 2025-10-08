import { z } from "zod";

export const authSchema = z.object({
  _id: z.any(),
  email: z.string(),
  phone: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
