import { z } from "zod";

export const userBalanceTransactionSchema = z.object({
  _id: z.string().optional(),
  type: z.enum(["deposit", "withdrawal"]),
  amount: z.number().positive(),
  description: z.string().optional().default(""),
  date: z.string(),
});

export const addUserBalanceTransactionSchema = z.object({
  type: z.enum(["deposit", "withdrawal"]),
  amount: z.number().positive(),
  description: z.string().optional().default(""),
});

export const userBalanceRecordSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  balance: z.number(),
  transactions: z.array(userBalanceTransactionSchema),
  portfolioTransactions: z.array(z.string()).optional(),
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
