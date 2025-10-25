import z from "zod";
import type { Document, Types } from "mongoose";
import {
  userBalanceTransactionSchema,
  userBalanceRecordSchema,
  addUserBalanceTransactionSchema,
  userBalanceResponseSchema,
  userBalanceListResponseSchema,
} from "./user-balance.schemas";

/**
 * Документ транзакції балансу користувача
 * Містить інформацію про поповнення або зняття коштів
 */
export interface IUserBalanceTransactionDocument {
  _id?: Types.ObjectId;
  type: "deposit" | "withdrawal";
  amount: number;
  description: string;
  date: Date;
}

/**
 * Документ портфоліо транзакції з повною інформацією про криптовалюту
 * Містить детальну статистику торгової сесії та інформацію про криптовалюту
 * Використовується при populate операціях для отримання повної інформації
 */
export interface IPortfolioTransactionDocument {
  _id: Types.ObjectId;
  coinId: Types.ObjectId;
  coin?: {
    _id: Types.ObjectId;
    name: string;
    symbol: string;
    coinGeckoData?: {
      thumb?: string | null;
      large?: string | null;
    } | null;
  };
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

/**
 * Документ балансу користувача з повними даними про портфоліо транзакції
 * Використовується для populate операцій з детальною інформацією про криптовалюти
 */
export interface IUserBalanceDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  balance: number;
  transactions: IUserBalanceTransactionDocument[];
  portfolioTransactions: IPortfolioTransactionDocument[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Lean об'єкт балансу користувача з гнучкою структурою портфоліо транзакцій
 * Може містити як повні об'єкти портфоліо (при populate), так і тільки ObjectId (без populate)
 * Використовується для різних сценаріїв запитів до БД
 */
export interface IUserBalanceLean {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  balance: number;
  transactions: IUserBalanceTransactionDocument[];
  portfolioTransactions: (IPortfolioTransactionDocument | Types.ObjectId)[];
  createdAt: Date;
  updatedAt: Date;
}

export type TUserBalanceTransaction = z.infer<
  typeof userBalanceTransactionSchema
>;
export type TUserBalanceRecord = z.infer<typeof userBalanceRecordSchema>;
export type TAddUserBalanceTransaction = z.infer<
  typeof addUserBalanceTransactionSchema
>;
export type TUserBalanceResponse = z.infer<typeof userBalanceResponseSchema>;
export type TUserBalanceListResponse = z.infer<
  typeof userBalanceListResponseSchema
>;
