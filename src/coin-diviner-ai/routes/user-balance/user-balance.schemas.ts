import { z } from "zod";

export const userBalanceTransactionSchema = z.object({
  _id: z.string().optional(),
  type: z.enum(["deposit", "withdrawal"]),
  amount: z.number().positive().multipleOf(0.00000001), // Підтримка 8 знаків після крапки
  description: z.string().optional().default(""),
  date: z.string(),
});

export const addUserBalanceTransactionSchema = z.object({
  type: z.enum(["deposit", "withdrawal"]),
  amount: z.number().positive().multipleOf(0.00000001), // Підтримка 8 знаків після крапки
  description: z.string().optional().default(""),
});

export const portfolioTransactionSchema = z.object({
  _id: z.string(),
  coinId: z.string(),
  coin: z
    .object({
      _id: z.string(),
      name: z.string(),
      symbol: z.string(),
      coinGeckoData: z
        .object({
          thumb: z.string().optional().nullable(),
          large: z.string().optional().nullable(),
        })
        .optional()
        .nullable(),
    })
    .optional(),
  status: z.enum(["open", "completed"]).default("open"),
  completionDate: z.string().nullable().default(null),
  completionPrice: z.number().nullable().default(null),
  totalPurchases: z.number().default(0),
  totalSales: z.number().default(0),
  totalCryptoPurchased: z.number().default(0),
  totalCryptoSold: z.number().default(0),
  profitLoss: z.number().default(0),
  profitLossPercentage: z.number().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const userBalanceRecordSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  balance: z.number(),
  transactions: z.array(userBalanceTransactionSchema),
  portfolioTransactions: z.array(portfolioTransactionSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const userBalanceResponseSchema = z.object({
  success: z.boolean(),
  data: userBalanceRecordSchema.nullable(),
});

export const userBalanceListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(userBalanceRecordSchema),
});
