import { z } from "zod";

export const pushTokenSchema = z.object({
  token: z.string(),
  platform: z.enum(["ios", "android", "web"]),
  deviceId: z.string().optional(),
  failureCount: z.number().default(0).optional(),
});

export const telegramUserSchema = z.object({
  chatId: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().optional(),
});

export const notificationSettingsSchema = z.object({
  _id: z.any(),
  userId: z.any(),
  pushTokens: z.array(pushTokenSchema).default([]),
  smsPhone: z.string().nullable().optional(),
  telegram: telegramUserSchema.optional(),
  enabledTypes: z
    .object({
      push: z.boolean().default(true),
      sms: z.boolean().default(false),
      telegram: z.boolean().default(false),
    })
    .default({
      push: true,
      sms: false,
      telegram: false,
    }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const updateNotificationSettingsSchema = z.object({
  smsPhone: z.string().nullable().optional(),
  telegram: telegramUserSchema.optional(),
  enabledTypes: z
    .object({
      push: z.boolean().optional(),
      sms: z.boolean().optional(),
      telegram: z.boolean().optional(),
    })
    .optional(),
});

export const addPushTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(["ios", "android", "web"]),
  deviceId: z.string().optional(),
});

export const removePushTokenSchema = z.object({
  token: z.string().min(1),
});
