import { z } from "zod";

export const integrationDataSchema = z.object({
  type: z.literal("email"),
  host: z.string().min(1),
  port: z.number().int(),
  secure: z.boolean(),
  user: z.string().min(1),
  pass: z.string().min(1),
});

export const integrationSchema = z.object({
  _id: z.any(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  data: integrationDataSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const integrationListSchema = z.array(integrationSchema);

export const integrationCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  data: integrationDataSchema,
});

export const integrationUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().nullable().optional(),
  data: integrationDataSchema.partial().optional(),
});

export const integrationIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const integrationPasswordQuerySchema = z.object({
  passwordToken: z.string().min(1),
});

export const integrationMessageSchema = z.object({
  message: z.string(),
});

