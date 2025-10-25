import { z } from "zod";
import { cryptoCoinSchema } from "../aggregator/aggregator.schemas";

export const transactionSchema = z.object({
  _id: z.string().optional().describe("Унікальний ідентифікатор транзакції"),
  amount_usd: z.number().positive().describe("Сума в доларах США"),
  amount_crypto: z.number().positive().describe("Кількість криптовалюти"),
  price_per_unit: z
    .number()
    .positive()
    .describe("Ціна за одиницю криптовалюти"),
  date: z.string().describe("Дата транзакції в ISO форматі"),
});

export const createOrUpdatePortfolioSchema = z.object({
  coinId: z.string().min(1).describe("ID криптовалюти"),
  amount_usd: z.number().positive().describe("Сума в доларах США"),
  amount_crypto: z.number().positive().describe("Кількість криптовалюти"),
  price_per_unit: z
    .number()
    .positive()
    .describe("Ціна за одиницю криптовалюти"),
});

export const addTransactionSchema = z.object({
  portfolioId: z.string().min(1).describe("ID портфоліо"),
  amount_usd: z.number().positive().describe("Сума в доларах США"),
  amount_crypto: z.number().positive().describe("Кількість криптовалюти"),
  price_per_unit: z
    .number()
    .positive()
    .describe("Ціна за одиницю криптовалюти"),
});

export const updateTransactionSchema = z.object({
  portfolioId: z.string().min(1).describe("ID портфоліо"),
  transactionId: z.string().min(1).describe("ID транзакції для оновлення"),
  transactionType: z
    .enum(["purchase", "sale"])
    .describe("Тип транзакції: покупка або продаж"),
  amount_usd: z.number().positive().describe("Сума в доларах США"),
  amount_crypto: z.number().positive().describe("Кількість криптовалюти"),
  price_per_unit: z
    .number()
    .positive()
    .describe("Ціна за одиницю криптовалюти"),
});

export const deleteTransactionSchema = z.object({
  portfolioId: z.string().min(1).describe("ID портфоліо"),
  transactionId: z.string().min(1).describe("ID транзакції для видалення"),
  transactionType: z
    .enum(["purchase", "sale"])
    .describe("Тип транзакції: покупка або продаж"),
});

export const portfolioRecordSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  coinId: z.string(),
  coin: cryptoCoinSchema.optional().nullable(),
  purchases: z.array(transactionSchema),
  sales: z.array(transactionSchema),
  status: z
    .enum(["open", "completed"])
    .default("open")
    .describe("Статус портфоліо: відкрите або завершене"),
  completionDate: z
    .string()
    .nullable()
    .default(null)
    .describe("Дата завершення портфоліо"),
  completionPrice: z
    .number()
    .nullable()
    .default(null)
    .describe("Ціна завершення портфоліо"),
  totalPurchases: z
    .number()
    .default(0)
    .describe("Загальна сума всіх покупок в USD"),
  totalSales: z
    .number()
    .default(0)
    .describe("Загальна сума всіх продажів в USD"),
  totalCryptoPurchased: z
    .number()
    .default(0)
    .describe("Загальна кількість купленої криптовалюти"),
  totalCryptoSold: z
    .number()
    .default(0)
    .describe("Загальна кількість проданої криптовалюти"),
  profitLoss: z
    .number()
    .default(0)
    .describe("Прибуток або збиток (totalSales - totalPurchases)"),
  profitLossPercentage: z
    .number()
    .default(0)
    .describe("Відсоток прибутку або збитку"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const portfolioResponseSchema = z.object({
  success: z.boolean().describe("Чи успішна операція"),
  data: portfolioRecordSchema.nullable().describe("Дані портфоліо або null"),
});

export const portfolioListResponseSchema = z.object({
  success: z.boolean().describe("Чи успішна операція"),
  data: z.array(portfolioRecordSchema).describe("Масив портфоліо"),
});

export const deleteResponseSchema = z.object({
  success: z.boolean().describe("Чи успішна операція"),
  message: z.string().describe("Повідомлення про результат операції"),
});

export const completePortfolioSchema = z.object({
  portfolioId: z.string().min(1).describe("ID портфоліо для завершення"),
  completionPrice: z
    .number()
    .positive()
    .describe("Ціна завершення торгової сесії"),
});

export const updateCompletedPortfolioSchema = z.object({
  portfolioId: z
    .string()
    .min(1)
    .describe("ID завершеного портфоліо для оновлення"),
  completionPrice: z.number().positive().describe("Нова ціна завершення"),
});

export const portfolioStatsSchema = z.object({
  totalInvestedInOpenSessions: z
    .number()
    .describe("Загальна сума вкладена в відкриті торгові сесії"),
  totalProfitLossFromCompletedSessions: z
    .number()
    .describe("Загальний прибуток/збиток від завершених торгових сесій"),
  openSessionsCount: z.number().describe("Кількість відкритих торгових сесій"),
  completedSessionsCount: z
    .number()
    .describe("Кількість завершених торгових сесій"),
});

export const portfolioStatsResponseSchema = z.object({
  success: z.boolean(),
  data: portfolioStatsSchema,
});
