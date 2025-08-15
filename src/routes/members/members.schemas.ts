import { z } from "zod";

export const memberSchema = z.object({
  _id: z.any(),
  tgUserId: z.string(),
  isBot: z.boolean(),
  firstName: z.string(),
  lastName: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  languageCode: z.string().nullable().optional(),
  canJoinGroups: z.boolean().nullable().optional(),
  canReadAllGroupMessages: z.boolean().nullable().optional(),
  supportsInlineQueries: z.boolean().nullable().optional(),
  user: z.any().nullable().optional(),
  groups: z.array(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const memberPublicSchema = z.object({
  id: z.string(),
  tgUserId: z.string(),
  isBot: z.boolean(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  username: z.string().nullable(),
  languageCode: z.string().nullable(),
  canJoinGroups: z.boolean().nullable(),
  canReadAllGroupMessages: z.boolean().nullable(),
  supportsInlineQueries: z.boolean().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
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

export const memberResponseSchema = z.object({
  data: memberSchema,
});

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});
