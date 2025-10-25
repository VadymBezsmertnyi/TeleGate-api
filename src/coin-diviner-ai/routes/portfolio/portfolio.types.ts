import type { Document, Types } from "mongoose";
import z from "zod";
import {
  createOrUpdatePortfolioSchema,
  addTransactionSchema,
  updateTransactionSchema,
  deleteTransactionSchema,
  portfolioResponseSchema,
  portfolioListResponseSchema,
  deleteResponseSchema,
  completePortfolioSchema,
  updateCompletedPortfolioSchema,
} from "./portfolio.schemas";

export interface ITransactionDocument {
  _id?: Types.ObjectId;
  amount_usd: number;
  amount_crypto: number;
  price_per_unit: number;
  date: Date;
}

export interface IPortfolioDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  coinId: Types.ObjectId;
  purchases: ITransactionDocument[];
  sales: ITransactionDocument[];
  status: "open" | "completed";
  completionDate: Date | null;
  completionPrice: number | null;
  totalPurchases: number;
  totalSales: number;
  totalCryptoPurchased: number;
  totalCryptoSold: number;
  profitLoss: number;
  profitLossPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPortfolioLean {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  coinId: Types.ObjectId;
  purchases: ITransactionDocument[];
  sales: ITransactionDocument[];
  status: "open" | "completed";
  completionDate: Date | null;
  completionPrice: number | null;
  totalPurchases: number;
  totalSales: number;
  totalCryptoPurchased: number;
  totalCryptoSold: number;
  profitLoss: number;
  profitLossPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPortfolioStats {
  totalPurchases: number;
  totalSales: number;
  totalCryptoPurchased: number;
  totalCryptoSold: number;
  profitLoss: number;
  profitLossPercentage: number;
}

// Zod schema types
export type TCreateOrUpdatePortfolio = z.infer<
  typeof createOrUpdatePortfolioSchema
>;
export type TAddTransaction = z.infer<typeof addTransactionSchema>;
export type TUpdateTransaction = z.infer<typeof updateTransactionSchema>;
export type TDeleteTransaction = z.infer<typeof deleteTransactionSchema>;
export type TPortfolioResponse = z.infer<typeof portfolioResponseSchema>;
export type TPortfolioListResponse = z.infer<
  typeof portfolioListResponseSchema
>;
export type TDeleteResponse = z.infer<typeof deleteResponseSchema>;
export type TCompletePortfolio = z.infer<typeof completePortfolioSchema>;
export type TUpdateCompletedPortfolio = z.infer<
  typeof updateCompletedPortfolioSchema
>;

// Portfolio record type for API responses
export type TPortfolioRecord = {
  _id: string;
  userId: string;
  coinId: string;
  coin?: any;
  purchases: Array<{
    _id?: string;
    amount_usd: number;
    amount_crypto: number;
    price_per_unit: number;
    date: string;
  }>;
  sales: Array<{
    _id?: string;
    amount_usd: number;
    amount_crypto: number;
    price_per_unit: number;
    date: string;
  }>;
  status: "open" | "completed";
  completionDate: string | null;
  completionPrice: number | null;
  totalPurchases: number;
  totalSales: number;
  totalCryptoPurchased: number;
  totalCryptoSold: number;
  profitLoss: number;
  profitLossPercentage: number;
  createdAt: string;
  updatedAt: string;
};
