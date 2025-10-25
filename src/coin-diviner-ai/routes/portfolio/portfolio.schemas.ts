import { z } from "zod";
import { cryptoCoinSchema } from "../aggregator/aggregator.schemas";

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

export const updateTransactionSchema = z.object({
  portfolioId: z.string().min(1),
  transactionId: z.string().min(1),
  transactionType: z.enum(["purchase", "sale"]),
  amount_usd: z.number().positive(),
  amount_crypto: z.number().positive(),
  price_per_unit: z.number().positive(),
});

export const deleteTransactionSchema = z.object({
  portfolioId: z.string().min(1),
  transactionId: z.string().min(1),
  transactionType: z.enum(["purchase", "sale"]),
});

export const portfolioRecordSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  coinId: z.string(),
  coin: cryptoCoinSchema.optional().nullable(),
  purchases: z.array(transactionSchema),
  sales: z.array(transactionSchema),
  status: z.enum(["open", "completed"]).default("open"),
  completionDate: z.string().nullable().default(null),
  completionPrice: z.number().nullable().default(null),
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

export const completePortfolioSchema = z.object({
  portfolioId: z.string().min(1),
  completionPrice: z.number().positive(),
});

export const updateCompletedPortfolioSchema = z.object({
  portfolioId: z.string().min(1),
  completionPrice: z.number().positive(),
});
