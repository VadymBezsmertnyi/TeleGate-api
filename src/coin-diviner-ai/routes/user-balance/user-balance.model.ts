import { Schema, model } from "mongoose";

const userBalanceTransactionSM = new Schema(
  {
    type: {
      type: String,
      enum: ["deposit", "withdrawal"],
      required: true,
    },
    amount: { type: Number, required: true },
    description: { type: String, default: "" },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const userBalanceUserBalanceSM = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "coinDivinerAI-auth",
      required: true,
      unique: true,
    },
    balance: { type: Number, default: 0 },
    transactions: [userBalanceTransactionSM],
    portfolioTransactions: [
      {
        type: Schema.Types.ObjectId,
        ref: "coinDivinerAI-portfolio",
      },
    ],
  },
  {
    timestamps: true,
  }
);

userBalanceUserBalanceSM.index({ userId: 1 });

const UserBalanceModel = model(
  "coinDivinerAI-user-balance",
  userBalanceUserBalanceSM
);

export default UserBalanceModel;
