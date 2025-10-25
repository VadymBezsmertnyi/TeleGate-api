import { isValidObjectId } from "mongoose";
import {
  TUserBalanceRecord,
  IUserBalanceDocument,
  IUserBalanceLean,
} from "./user-balance.types";

export const getDataUserBalanceData = (
  userBalance: IUserBalanceDocument | IUserBalanceLean
) => {
  if (!userBalance || typeof userBalance !== "object" || !userBalance._id)
    return null;

  const responseData: TUserBalanceRecord = {
    _id: userBalance._id.toString(),
    userId: userBalance.userId.toString(),
    balance: userBalance.balance || 0,
    transactions: userBalance.transactions.map((t) => ({
      _id: t._id?.toString(),
      type: t.type,
      amount: t.amount,
      description: t.description || "",
      date: t.date instanceof Date ? t.date.toISOString() : t.date,
    })),
    portfolioTransactions: userBalance.portfolioTransactions
      ? userBalance.portfolioTransactions
          .map((pt) => {
            // Спочатку перевіряємо, чи це populate об'єкт
            if ("coinId" in pt && pt.coinId) {
              // Перевіряємо, чи coinId є populate об'єктом (як в portfolio.helps.ts)
              const isCoinPopulated =
                pt.coinId &&
                typeof pt.coinId === "object" &&
                !isValidObjectId(pt.coinId);

              const coin = isCoinPopulated ? ({ ...pt.coinId } as any) : null;
              const coinId = isCoinPopulated
                ? pt.coinId._id.toString()
                : pt.coinId.toString();

              return {
                _id: pt._id?.toString(),
                coinId,
                coin: coin
                  ? {
                      _id: coin._id?.toString(),
                      name: coin.name,
                      symbol: coin.symbol,
                      coinGeckoData: coin.coinGeckoData
                        ? {
                            thumb: coin.coinGeckoData.thumb,
                            large: coin.coinGeckoData.large,
                          }
                        : null,
                    }
                  : undefined,
                status: pt.status || "open",
                completionDate: pt.completionDate
                  ? pt.completionDate instanceof Date
                    ? pt.completionDate.toISOString()
                    : pt.completionDate
                  : null,
                completionPrice: pt.completionPrice || null,
                totalPurchases: pt.totalPurchases || 0,
                totalSales: pt.totalSales || 0,
                totalCryptoPurchased: pt.totalCryptoPurchased || 0,
                totalCryptoSold: pt.totalCryptoSold || 0,
                profitLoss: pt.profitLoss || 0,
                profitLossPercentage: pt.profitLossPercentage || 0,
                createdAt:
                  pt.createdAt instanceof Date
                    ? pt.createdAt.toISOString()
                    : pt.createdAt,
                updatedAt:
                  pt.updatedAt instanceof Date
                    ? pt.updatedAt.toISOString()
                    : pt.updatedAt,
              };
            }

            // Якщо це ObjectId (не populate), повертаємо null для фільтрації
            return null;
          })
          .filter((pt) => pt !== null) // Фільтруємо null значення
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
