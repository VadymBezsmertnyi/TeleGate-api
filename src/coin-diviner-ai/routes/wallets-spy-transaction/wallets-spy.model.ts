import { Schema, model } from "mongoose";

const walletSpyTransactionSM = new Schema(
  {
    walletAddress: { type: String, required: true },
    signatureId: { type: String, required: true },
    nameOwnerWallet: { type: String },
    nameToken: { type: String },
    type: {
      type: String,
      enum: ["buy", "sell", "buy_more", "transfer", "receive", "unknown"],
    },
    tokenMint: { type: String },
    amount: { type: Number },
    data: { type: Date, default: null },
  },
  { timestamps: true }
);

const WalletSpyTransactionModel = model(
  "coinDivinerAI-wallets-spy-transaction",
  walletSpyTransactionSM
);

export default WalletSpyTransactionModel;
