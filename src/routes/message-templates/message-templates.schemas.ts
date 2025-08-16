import { z } from "zod";

// Схема для створення шаблону
export const createTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  content: z
    .string()
    .min(1, "Content is required")
    .max(4096, "Content too long"),
  type: z.enum(["text", "html", "markdown"]).default("text"),
  description: z.string().max(500, "Description too long").optional(),
  tags: z.array(z.string().max(50)).optional(),
});

// Схема для оновлення шаблону
export const updateTemplateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name too long")
    .optional(),
  content: z
    .string()
    .min(1, "Content is required")
    .max(4096, "Content too long")
    .optional(),
  type: z.enum(["text", "html", "markdown"]).optional(),
  description: z.string().max(500, "Description too long").optional(),
  isActive: z.boolean().optional(),
  tags: z.array(z.string().max(50)).optional(),
});

// Схема для фільтрації шаблонів
export const filterTemplatesSchema = z.object({
  search: z.string().optional(),
  type: z.enum(["text", "html", "markdown"]).optional(),
  isActive: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Схема для відповіді з шаблоном
export const templateResponseSchema = z.object({
  _id: z.string(),
  name: z.string(),
  content: z.string(),
  type: z.enum(["text", "html", "markdown"]),
  description: z.string().optional(),
  isActive: z.boolean(),
  tags: z.array(z.string()),
  usageCount: z.number(),
  lastUsedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Типи
export type CreateTemplateRequest = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateRequest = z.infer<typeof updateTemplateSchema>;
export type FilterTemplatesRequest = z.infer<typeof filterTemplatesSchema>;
export type TemplateResponse = z.infer<typeof templateResponseSchema>;
