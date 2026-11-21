import { Schema, model } from "mongoose";

const transactionSM = new Schema(
  {
    amount_usd: { type: Number, required: true },
    amount_crypto: { type: Number, required: true },
    price_per_unit: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const portfolioSM = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "coinDivinerAI-auth",
      required: true,
    },
    coinId: {
      type: Schema.Types.ObjectId,
      ref: "coinDivinerAI-crypto-coins",
      required: true,
    },
    purchases: [transactionSM],
    sales: [transactionSM],
    status: {
      type: String,
      enum: ["open", "completed"],
      default: "open",
    },
    completionDate: {
      type: Date,
      default: null,
    },
    completionPrice: {
      type: Number,
      default: null,
    },
    totalPurchases: {
      type: Number,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    totalCryptoPurchased: {
      type: Number,
      default: 0,
    },
    totalCryptoSold: {
      type: Number,
      default: 0,
    },
    profitLoss: {
      type: Number,
      default: 0,
    },
    profitLossPercentage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

portfolioSM.index({ userId: 1 });
portfolioSM.index({ coinId: 1 });

const PortfolioModel = model("coinDivinerAI-portfolio", portfolioSM);

export default PortfolioModel;
