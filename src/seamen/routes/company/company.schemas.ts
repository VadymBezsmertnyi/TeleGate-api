import { z } from "zod";

export const companyContactSummarySchema = z.object({
  contactId: z.string().min(1),
  fullName: z.string().min(1),
  position: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  success: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
});

export const companyStatisticsSchema = z.object({
  contactCount: z.number().int().nonnegative(),
  successEmails: z.number().int().nonnegative(),
  failedEmails: z.number().int().nonnegative(),
});

export const companySchema = z.object({
  _id: z.any(),
  name: z.string().min(1),
  category: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  tags: z.array(z.string()),
  contacts: z.array(companyContactSummarySchema),
  statistics: companyStatisticsSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const companyListSchema = z.array(companySchema);

export const companyCreateSchema = z.object({
  name: z.string().min(1),
  category: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export const companyUpdateSchema = z.object({
  name: z.string().optional(),
  category: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export const companyIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const companyPasswordQuerySchema = z.object({
  passwordToken: z.string().min(1),
});

export const companyMessageSchema = z.object({
  message: z.string(),
});

