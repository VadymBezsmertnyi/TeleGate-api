import { z } from "zod";

const urlItemSchema = z.string().min(1);

export const templateSchema = z.object({
  _id: z.any(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  content: z.string().min(1),
  urls: z.array(urlItemSchema).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const templateListSchema = z.array(templateSchema);

export const templateCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  content: z.string().min(1),
  urls: z.array(urlItemSchema).optional(),
});

export const templateUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().nullable().optional(),
  content: z.string().optional(),
  urls: z.array(urlItemSchema).optional(),
});

export const templateIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const templatePasswordQuerySchema = z.object({
  passwordToken: z.string().min(1),
});

export const templateMessageSchema = z.object({
  message: z.string(),
});
