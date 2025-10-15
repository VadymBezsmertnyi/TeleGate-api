import { z } from "zod";

export const priceSourceSchema = z.object({
  price: z.number().nullable().describe("Ціна на момент створення"),
  updatedAt: z.string().nullable().describe("Час оновлення ціни"),
});

export const pricesSchema = z.object({
  binance: priceSourceSchema.nullable().describe("Ціна з Binance"),
  dexscreener: priceSourceSchema.nullable().describe("Ціна з DexScreener"),
  coingecko: priceSourceSchema.nullable().describe("Ціна з CoinGecko"),
});

export const notificationsSchema = z.object({
  push_sent: z.boolean().describe("Чи відправлено push-повідомлення"),
  sms_sent: z.boolean().describe("Чи відправлено SMS"),
  push_sent_at: z
    .string()
    .nullable()
    .optional()
    .describe("Час відправлення push-повідомлення"),
  sms_sent_at: z
    .string()
    .nullable()
    .optional()
    .describe("Час відправлення SMS"),
});

export const createAutomationSchema = z.object({
  coinId: z.string().min(1).describe("ID крипти"),
  type: z
    .enum(["price_drop", "price_rise"])
    .describe("Тип автоматизації: падіння або піднімання"),
  target_price: z.number().positive().describe("Цільова ціна для спрацювання"),
});

export const updateAutomationSchema = z.object({
  automationId: z.string().min(1).describe("ID автоматизації"),
  isActive: z.boolean().optional().describe("Чи активна автоматизація"),
  target_price: z.number().positive().optional().describe("Нова цільова ціна"),
  continuation_price: z
    .number()
    .positive()
    .optional()
    .describe("Ціна при продовженні автоматизації"),
});

export const automationRecordSchema = z.object({
  _id: z.string().describe("ID запису"),
  userId: z.string().describe("ID користувача"),
  coinId: z.string().describe("ID крипти"),
  type: z.enum(["price_drop", "price_rise"]).describe("Тип автоматизації"),
  target_price: z.number().describe("Цільова ціна"),
  isActive: z.boolean().describe("Чи активна автоматизація"),
  prices: pricesSchema.describe("Ціни на момент створення по всіх сервісах"),
  notifications: notificationsSchema.describe("Статус відправки сповіщень"),
  continuation_price: z
    .number()
    .nullable()
    .optional()
    .describe("Ціна при продовженні"),
  continuation_count: z.number().optional().describe("Кількість продовжень"),
  createdAt: z.string().describe("Час створення"),
  updatedAt: z.string().describe("Час оновлення"),
});

export const automationResponseSchema = z.object({
  success: z.boolean().describe("Успішність операції"),
  data: automationRecordSchema.nullable().describe("Дані автоматизації"),
});

export const automationListResponseSchema = z.object({
  success: z.boolean().describe("Успішність операції"),
  data: z.array(automationRecordSchema).describe("Список автоматизацій"),
});

export const deleteResponseSchema = z.object({
  success: z.boolean().describe("Успішність операції"),
  message: z.string().describe("Повідомлення про результат"),
});
