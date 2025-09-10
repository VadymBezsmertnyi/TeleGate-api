import { z } from "zod";
import { GROUPS_CONSTANTS } from "./groups.constants";

export const groupSchema = z.object({
  _id: z.any(),
  tgChatId: z.string(),
  type: z.enum(["private", "group", "supergroup", "channel"]),
  title: z.string().nullable(),
  description: z.string().nullable(),
  photoUrl: z.string().nullable(),
  isForum: z.boolean(),
  allMembersAreAdministrators: z.boolean().nullable().optional(),
  acceptedGiftTypes: z
    .object({
      unlimited_gifts: z.boolean().nullable(),
      limited_gifts: z.boolean().nullable(),
      unique_gifts: z.boolean().nullable(),
      premium_subscription: z.boolean().nullable(),
    })
    .nullable()
    .optional(),
  botStatus: z.enum(GROUPS_CONSTANTS.BOT_STATUS_VALUES).nullable(),
  addedBy: z.any().nullable(),
  users: z.array(z.any()),
  members: z.array(z.any()),
  forumTopics: z.array(z.any()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const groupPublicSchema = z.object({
  id: z.string(),
  tgChatId: z.string(),
  type: z.enum(["private", "group", "supergroup", "channel"]),
  name: z.string().nullable(),
  description: z.string().nullable().default(null),
  photoUrl: z.string().nullable(),
  isForum: z.boolean(),
  allMembersAreAdministrators: z.boolean().nullable().optional(),
  acceptedGiftTypes: z
    .object({
      unlimited_gifts: z.boolean().nullable(),
      limited_gifts: z.boolean().nullable(),
      unique_gifts: z.boolean().nullable(),
      premium_subscription: z.boolean().nullable(),
    })
    .nullable()
    .optional(),
  botStatus: z.enum(GROUPS_CONSTANTS.BOT_STATUS_VALUES).nullable(),
  membersCount: z.number(),
  subscriptionsCount: z.number(),
  usersWithSubscriptionCount: z.number(),
  usersWithExpiredSubscriptionCount: z.number(),
  usersWithoutSubscriptionCount: z.number(),
  addedBy: z
    .object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string().nullable().default(null),
      username: z.string().nullable().default(null),
    })
    .nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const groupsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(GROUPS_CONSTANTS.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .min(1)
    .max(GROUPS_CONSTANTS.MAX_LIMIT)
    .default(GROUPS_CONSTANTS.DEFAULT_LIMIT),
  sortBy: z
    .enum(GROUPS_CONSTANTS.SORT_FIELDS)
    .default(GROUPS_CONSTANTS.DEFAULT_SORT_BY),
  order: z
    .enum(GROUPS_CONSTANTS.ORDER_VALUES)
    .default(GROUPS_CONSTANTS.DEFAULT_ORDER),
  search: z.string().optional(),
  status: z.enum(GROUPS_CONSTANTS.STATUS_VALUES).optional(),
  createdFrom: z.string().datetime().optional(),
  createdTo: z.string().datetime().optional(),
  membersFrom: z.coerce.number().optional(),
  membersTo: z.coerce.number().optional(),
  activity: z.enum(["active_7d", "active_30d", "inactive"]).optional(),
  ownerId: z.string().optional(),
  ownerTelegramId: z.coerce.number().optional(),
});

export const groupParamsSchema = z.object({
  id: z.string(),
});

export const groupsResponseSchema = z.object({
  data: z.array(groupPublicSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }),
});

export const groupResponseSchema = z.object({
  data: groupPublicSchema,
});

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});
