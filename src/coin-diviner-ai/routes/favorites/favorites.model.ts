import { Schema, model } from "mongoose";

const favoriteSM = new Schema(
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
  },
  {
    timestamps: true,
  }
);

favoriteSM.index({ userId: 1, coinId: 1 }, { unique: true });
favoriteSM.index({ userId: 1 });
favoriteSM.index({ coinId: 1 });

const FavoriteModel = model("coinDivinerAI-favorite", favoriteSM);

export default FavoriteModel;
