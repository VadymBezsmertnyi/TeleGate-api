import z from "zod";
import type { Document, Types } from "mongoose";
import {
  userBalanceTransactionSchema,
  userBalanceRecordSchema,
  addUserBalanceTransactionSchema,
  userBalanceResponseSchema,
  userBalanceListResponseSchema,
} from "./user-balance.schemas";

export interface IUserBalanceTransactionDocument {
  _id?: Types.ObjectId;
  type: "deposit" | "withdrawal";
  amount: number;
  description: string;
  date: Date;
}

export interface IUserBalanceDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  balance: number;
  transactions: IUserBalanceTransactionDocument[];
  portfolioTransactions: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserBalanceLean {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  balance: number;
  transactions: IUserBalanceTransactionDocument[];
  portfolioTransactions: Types.ObjectId[];
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
