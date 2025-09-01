import { z } from "zod";
import { SUBSCRIPTION_TYPES_ENUM } from "./group-subscriptions.constants";

export const groupSubscriptionSchema = z.object({
  _id: z.any(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  currency: z.string(),
  type: z.enum(SUBSCRIPTION_TYPES_ENUM),
  duration: z.number(),
  memberSubscriptions: z.array(z.any()),
  group: z.any(),
  user: z.any(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const groupSubscriptionPublicSchema = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  currency: z.string(),
  type: z.enum(SUBSCRIPTION_TYPES_ENUM),
  duration: z.number(),
  memberSubscriptionIds: z.array(z.string()),
  groupId: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createGroupSubscriptionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  currency: z.string().min(1),
  type: z.enum(SUBSCRIPTION_TYPES_ENUM).optional(),
  duration: z.number().int().min(1).optional(),
  groupId: z.string(),
  userId: z.string().optional(),
});

export const updateGroupSubscriptionSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(SUBSCRIPTION_TYPES_ENUM).optional(),
  duration: z.number().int().min(1).optional(),
});

export const groupSubscriptionsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  order: z.enum(["asc", "desc"]).default("desc"),
  groupId: z.string().optional(),
  userId: z.string().optional(),
});

export const groupSubscriptionParamsSchema = z.object({
  _id: z.string(),
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
