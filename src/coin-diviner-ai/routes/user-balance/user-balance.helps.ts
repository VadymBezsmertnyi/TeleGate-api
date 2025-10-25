import { TUserBalanceRecord } from "./user-balance.types";

export const getDataUserBalanceData = (userBalance: any) => {
  if (!userBalance || typeof userBalance !== "object" || !userBalance._id)
    return null;

  const responseData: TUserBalanceRecord = {
    _id: userBalance._id.toString(),
    userId: userBalance.userId.toString(),
    balance: userBalance.balance || 0,
    transactions: userBalance.transactions.map((t: any) => ({
      _id: t._id?.toString(),
      type: t.type,
      amount: t.amount,
      description: t.description || "",
      date: t.date instanceof Date ? t.date.toISOString() : t.date,
    })),
    portfolioTransactions: userBalance.portfolioTransactions
      ? userBalance.portfolioTransactions.map((pt: any) => pt.toString())
      : [],
    createdAt:
      userBalance.createdAt instanceof Date
        ? userBalance.createdAt.toISOString()
        : userBalance.createdAt,
    updatedAt:
      userBalance.updatedAt instanceof Date
        ? userBalance.updatedAt.toISOString()
        : userBalance.updatedAt,
  };

  return responseData;
};
