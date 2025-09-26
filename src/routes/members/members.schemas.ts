import { z } from "zod";

export const memberSchema = z.object({
  _id: z.any(),
  telegramUsername: z.string().optional(),
  tgUserId: z.string(),
  isBot: z.boolean(),
  firstName: z.string(),
  lastName: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  languageCode: z.string().nullable().optional(),
  canJoinGroups: z.boolean().nullable().optional(),
  canReadAllGroupMessages: z.boolean().nullable().optional(),
  supportsInlineQueries: z.boolean().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
  user: z.any().nullable().optional(),
  groups: z.array(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  activeSubscriptionsCount: z.number().optional(),
  groupsCount: z.number().optional(),
  subscriptionDelaysDays: z.number().optional(),
  activeSubscriptions: z.array(z.any()).optional(),
});

export const memberPublicSchema = z.object({
  id: z.string(),
  telegramUsername: z.string().optional(),
  tgUserId: z.string(),
  isBot: z.boolean(),
  firstName: z.string(),
  lastName: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  languageCode: z.string().nullable().optional(),
  canJoinGroups: z.boolean().nullable().optional(),
  canReadAllGroupMessages: z.boolean().nullable().optional(),
  supportsInlineQueries: z.boolean().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
  user: z.any().nullable().optional(),
  groups: z.array(z.any()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const memberWithSubscriptionSchema = z.object({
  _id: z.any(),
  telegramUsername: z.string().optional(),
  tgUserId: z.string(),
  isBot: z.boolean(),
  firstName: z.string(),
  lastName: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  languageCode: z.string().nullable().optional(),
  canJoinGroups: z.boolean().nullable().optional(),
  canReadAllGroupMessages: z.boolean().nullable().optional(),
  supportsInlineQueries: z.boolean().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
  user: z.any().nullable().optional(),
  groups: z.array(z.any()).optional(),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()]),
  subscription: z
    .object({
      _id: z.any(),
      startDate: z.union([z.date(), z.string()]),
      purchaseDate: z.union([z.date(), z.string()]),
      endDate: z.union([z.date(), z.string()]),
      groupSubscription: z.object({
        _id: z.any(),
        title: z.string(),
        price: z.number(),
        currency: z.string(),
        type: z.string(),
        duration: z.number(),
      }),
    })
    .nullable()
    .optional(),
  activeSubscriptionsCount: z.number().optional(),
  activeSubscriptions: z
    .array(
      z.object({
        _id: z.any(),
        startDate: z.union([z.date(), z.string()]),
        purchaseDate: z.union([z.date(), z.string()]),
        endDate: z.union([z.date(), z.string()]),
        groupSubscription: z.object({
          _id: z.any(),
          title: z.string(),
          price: z.number(),
          currency: z.string(),
          type: z.string(),
          duration: z.number(),
        }),
      })
    )
    .optional(),
  allSubscriptions: z
    .array(
      z.object({
        _id: z.any(),
        startDate: z.union([z.date(), z.string()]),
        purchaseDate: z.union([z.date(), z.string()]),
        endDate: z.union([z.date(), z.string()]),
        groupSubscription: z.object({
          _id: z.any(),
          title: z.string(),
          price: z.number(),
          currency: z.string(),
          type: z.string(),
          duration: z.number(),
        }),
      })
    )
    .optional(),
});

export const membersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z
    .enum(["createdAt", "updatedAt", "firstName", "username"])
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional(),
  status: z
    .enum([
      "creator",
      "administrator",
      "member",
      "restricted",
      "left",
      "kicked",
    ])
    .optional(),
  groupId: z.string().optional(),
  createdFrom: z.string().datetime().optional(),
  createdTo: z.string().datetime().optional(),
  ownerId: z.string().optional(),
  ownerTelegramId: z.coerce.number().optional(),
});

export const membersWithSubscriptionsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z
    .enum(["createdAt", "updatedAt", "firstName", "username"])
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional(),
  groupId: z.string().optional(),
});

export const memberParamsSchema = z.object({
  id: z.string(),
});

export const membersResponseSchema = z.object({
  data: z.array(memberSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }),
});

export const membersWithSubscriptionsResponseSchema = z.object({
  data: z.array(memberWithSubscriptionSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }),
});

export const memberWithSubscriptionResponseSchema = z.object({
  data: memberWithSubscriptionSchema,
});

export const memberWithSubscriptionByIdQuerySchema = z.object({
  groupId: z.string(),
});

export const memberResponseSchema = z.object({
  data: memberSchema,
});

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});
