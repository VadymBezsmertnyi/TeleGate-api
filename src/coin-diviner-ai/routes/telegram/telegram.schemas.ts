import { z } from "zod";

export const setWebhookSchema = z.object({
  webhookUrl: z.string().url(),
});

export const telegramUserSchema = z.object({
  id: z.number().optional(),
  is_bot: z.boolean().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  language_code: z.string().optional(),
});

export const telegramChatSchema = z.object({
  id: z.number().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  type: z.string().optional(),
});

export const telegramMessageEntitySchema = z.object({
  offset: z.number().optional(),
  length: z.number().optional(),
  type: z.string().optional(),
});

export const telegramMessageSchema = z.object({
  message_id: z.number().optional(),
  from: telegramUserSchema.optional(),
  chat: telegramChatSchema.optional(),
  date: z.number().optional(),
  text: z.string().optional(),
  entities: z.array(telegramMessageEntitySchema).optional(),
});

export const telegramCallbackQuerySchema = z.object({
  id: z.string().optional(),
  from: telegramUserSchema.optional(),
  message: telegramMessageSchema.optional(),
  data: z.string().optional(),
  chat_instance: z.string().optional(),
});

export const telegramWebhookUpdateSchema = z.object({
  update_id: z.number().optional(),
  message: telegramMessageSchema.optional(),
  callback_query: telegramCallbackQuerySchema.optional(),
});
