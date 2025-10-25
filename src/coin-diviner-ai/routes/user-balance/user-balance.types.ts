import z from "zod";
import {
  userBalanceTransactionSchema,
  userBalanceRecordSchema,
  addUserBalanceTransactionSchema,
  userBalanceResponseSchema,
  userBalanceListResponseSchema,
} from "./user-balance.schemas";

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
