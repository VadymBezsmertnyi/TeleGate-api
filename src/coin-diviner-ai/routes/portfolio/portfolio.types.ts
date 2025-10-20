import z from "zod";
import {
  createOrUpdatePortfolioSchema,
  addTransactionSchema,
  updateTransactionSchema,
  deleteTransactionSchema,
  portfolioResponseSchema,
  portfolioListResponseSchema,
  deleteResponseSchema,
  transactionSchema,
  portfolioRecordSchema,
} from "./portfolio.schemas";

export type TCreateOrUpdatePortfolio = z.infer<
  typeof createOrUpdatePortfolioSchema
>;
export type TAddTransaction = z.infer<typeof addTransactionSchema>;
export type TUpdateTransaction = z.infer<typeof updateTransactionSchema>;
export type TDeleteTransaction = z.infer<typeof deleteTransactionSchema>;
export type TTransaction = z.infer<typeof transactionSchema>;
export type TPortfolioRecord = z.infer<typeof portfolioRecordSchema>;
export type TPortfolioResponse = z.infer<typeof portfolioResponseSchema>;
export type TPortfolioListResponse = z.infer<
  typeof portfolioListResponseSchema
>;
export type TDeleteResponse = z.infer<typeof deleteResponseSchema>;
