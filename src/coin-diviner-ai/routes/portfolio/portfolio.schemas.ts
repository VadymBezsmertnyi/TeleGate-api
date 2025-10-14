import { z } from "zod";

export const transactionSchema = z.object({
  _id: z.string().optional(),
  amount_usd: z.number().positive(),
  amount_crypto: z.number().positive(),
  price_per_unit: z.number().positive(),
  date: z.string(),
});

export const createOrUpdatePortfolioSchema = z.object({
  coinId: z.string().min(1),
  amount_usd: z.number().positive(),
  amount_crypto: z.number().positive(),
  price_per_unit: z.number().positive(),
});

export const addTransactionSchema = z.object({
  portfolioId: z.string().min(1),
  amount_usd: z.number().positive(),
  amount_crypto: z.number().positive(),
  price_per_unit: z.number().positive(),
});

export const portfolioRecordSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  coinId: z.string(),
  purchases: z.array(transactionSchema),
  sales: z.array(transactionSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const portfolioResponseSchema = z.object({
  success: z.boolean(),
  data: portfolioRecordSchema.nullable(),
});

export const portfolioListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(portfolioRecordSchema),
});

export const deleteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
