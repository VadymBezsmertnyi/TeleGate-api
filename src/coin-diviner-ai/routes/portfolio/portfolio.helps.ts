import { isValidObjectId } from "mongoose";
import {
  IPortfolioDocument,
  IPortfolioLean,
  IPortfolioStats,
  TPortfolioRecord,
} from "./portfolio.types";

export const calculatePortfolioStats = (
  portfolio: IPortfolioDocument | IPortfolioLean
): IPortfolioStats => {
  const totalPurchases = portfolio.purchases.reduce(
    (sum: number, purchase) => sum + purchase.amount_usd,
    0
  );
  const totalSales = portfolio.sales.reduce(
    (sum: number, sale) => sum + sale.amount_usd,
    0
  );
  const totalCryptoPurchased = portfolio.purchases.reduce(
    (sum: number, purchase) => sum + purchase.amount_crypto,
    0
  );
  const totalCryptoSold = portfolio.sales.reduce(
    (sum: number, sale) => sum + sale.amount_crypto,
    0
  );
  const profitLoss = totalSales - totalPurchases;
  const profitLossPercentage =
    totalPurchases > 0 ? (profitLoss / totalPurchases) * 100 : 0;

  return {
    totalPurchases,
    totalSales,
    totalCryptoPurchased,
    totalCryptoSold,
    profitLoss,
    profitLossPercentage,
  };
};

export const getDataPortfolioData = (
  portfolio: IPortfolioDocument | IPortfolioLean
): TPortfolioRecord | null => {
  if (!portfolio || typeof portfolio !== "object" || !portfolio._id)
    return null;
  if (!portfolio || typeof portfolio !== "object" || !portfolio._id)
    return null;

  const isObjectId =
    portfolio.coinId &&
    typeof portfolio.coinId === "object" &&
    isValidObjectId(portfolio.coinId);
  const coin =
    portfolio.coinId && typeof portfolio.coinId === "object" && !isObjectId
      ? { ...portfolio.coinId }
      : null;
  const coinId =
    portfolio.coinId && typeof portfolio.coinId === "object" && isObjectId
      ? portfolio.coinId._id.toString()
      : portfolio.coinId.toString();

  const responseData: TPortfolioRecord = {
    ...portfolio,
    coin,
    _id: portfolio._id.toString(),
    userId: portfolio.userId.toString(),
    coinId,
    purchases: portfolio.purchases.map((p: any) => ({
      _id: p._id?.toString(),
      amount_usd: p.amount_usd,
      amount_crypto: p.amount_crypto,
      price_per_unit: p.price_per_unit,
      date: p.date instanceof Date ? p.date.toISOString() : p.date,
    })),
    sales: portfolio.sales.map((s: any) => ({
      _id: s._id?.toString(),
      amount_usd: s.amount_usd,
      amount_crypto: s.amount_crypto,
      price_per_unit: s.price_per_unit,
      date: s.date instanceof Date ? s.date.toISOString() : s.date,
    })),
    createdAt:
      portfolio.createdAt instanceof Date
        ? portfolio.createdAt.toISOString()
        : portfolio.createdAt,
    updatedAt:
      portfolio.updatedAt instanceof Date
        ? portfolio.updatedAt.toISOString()
        : portfolio.updatedAt,
    completionDate:
      portfolio.completionDate instanceof Date
        ? portfolio.completionDate.toISOString()
        : portfolio.completionDate,
  };

  return responseData;
};
