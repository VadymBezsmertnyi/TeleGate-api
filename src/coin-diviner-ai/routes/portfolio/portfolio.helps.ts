import { isValidObjectId } from "mongoose";
import { TPortfolioRecord } from "./portfolio.types";

export const getDataPortfolioData = (portfolio: any) => {
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

  const responseData: TPortfolioRecord = {
    ...portfolio,
    coin,
    _id: portfolio._id.toString(),
    userId: portfolio.userId.toString(),
    coinId:
      typeof portfolio.coinId === "object"
        ? portfolio.coinId._id.toString()
        : portfolio.coinId.toString(),
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
  };

  return responseData;
};
