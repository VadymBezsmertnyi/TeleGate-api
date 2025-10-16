import { z } from "zod";

export const pushTokenSchema = z.object({
  token: z.string(),
  platform: z.enum(["ios", "android", "web"]),
  deviceId: z.string().optional(),
});

export const notificationSettingsSchema = z.object({
  _id: z.any(),
  userId: z.any(),
  pushTokens: z.array(pushTokenSchema).default([]),
  smsPhone: z.string().nullable().optional(),
  telegramChatId: z.string().nullable().optional(),
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
  telegramChatId: z.string().nullable().optional(),
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

export const sendNotificationSchema = z.object({
  userId: z.string(),
  title: z.string(),
  body: z.string(),
  data: z.record(z.any()).optional(),
  types: z.array(z.enum(["push", "sms", "telegram"])).default(["push"]),
});
