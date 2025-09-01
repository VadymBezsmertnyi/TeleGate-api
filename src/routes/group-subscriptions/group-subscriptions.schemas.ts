import { z } from "zod";

export const groupSubscriptionSchema = z.object({
  _id: z.any(),
  price: z.number(),
  currency: z.string(),
  durationDays: z.number(),
  startedAt: z.date(),
  expiresAt: z.date().nullable().optional(),
  canceledAt: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  member: z.any(),
  group: z.any(),
  user: z.any(),
});

export const groupSubscriptionPublicSchema = z.object({
  id: z.string(),
  price: z.number(),
  currency: z.string(),
  durationDays: z.number(),
  startedAt: z.date(),
  expiresAt: z.date().nullable().optional(),
  canceledAt: z.date().nullable().optional(),
  memberId: z.string(),
  groupId: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createGroupSubscriptionSchema = z.object({
  price: z.number().positive(),
  currency: z.string().min(1),
  durationDays: z.number().int().min(1),
  memberId: z.string(),
  groupId: z.string(),
  userId: z.string().optional(),
});

export const updateGroupSubscriptionSchema = z.object({
  price: z.number().positive().optional(),
  currency: z.string().min(1).optional(),
  durationDays: z.number().int().min(1).optional(),
  expiresAt: z.string().datetime().optional(),
  canceledAt: z.string().datetime().optional(),
});

export const groupSubscriptionsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  order: z.enum(["asc", "desc"]).default("desc"),
  memberId: z.string().optional(),
  groupId: z.string().optional(),
  userId: z.string().optional(),
  activeOnly: z.coerce.boolean().optional(),
});

export const groupSubscriptionParamsSchema = z.object({
  id: z.string(),
});

export const groupSubscriptionsResponseSchema = z.object({
  data: z.array(groupSubscriptionPublicSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }),
});

export const groupSubscriptionResponseSchema = z.object({
  data: groupSubscriptionPublicSchema,
});

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});
