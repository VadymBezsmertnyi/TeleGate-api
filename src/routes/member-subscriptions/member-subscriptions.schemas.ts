import { z } from "zod";

export const memberSubscriptionSchema = z.object({
  _id: z.any(),
  startDate: z.date(),
  purchaseDate: z.date(),
  endDate: z.date(),
  member: z.any(),
  group: z.any(),
  groupSubscription: z.any(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const memberSubscriptionPublicSchema = z.object({
  _id: z.string(),
  startDate: z.string().transform((val) => new Date(val)),
  purchaseDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
  memberId: z.string(),
  groupId: z.string(),
  groupSubscriptionId: z.string(),
  createdAt: z.string().transform((val) => new Date(val)),
  updatedAt: z.string().transform((val) => new Date(val)),
});

export const createMemberSubscriptionSchema = z.object({
  memberId: z.string(),
  groupId: z.string(),
  groupSubscriptionId: z.string(),
});

export const updateMemberSubscriptionSchema = z.object({
  startDate: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
  purchaseDate: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
  endDate: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
  memberId: z.string().optional(),
  groupId: z.string().optional(),
  groupSubscriptionId: z.string().optional(),
});

export const memberSubscriptionsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  order: z.enum(["asc", "desc"]).default("desc"),
  memberId: z.string().optional(),
  groupId: z.string().optional(),
  groupSubscriptionId: z.string().optional(),
});

export const memberSubscriptionParamsSchema = z.object({
  _id: z.string(),
});

export const memberSubscriptionsResponseSchema = z.object({
  data: z.array(memberSubscriptionPublicSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }),
});

export const memberSubscriptionResponseSchema = z.object({
  data: memberSubscriptionPublicSchema,
});

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});
