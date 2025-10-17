import { Schema, model } from "mongoose";

const priceSourceSM = new Schema(
  {
    price: { type: Number, default: null },
    updatedAt: { type: Date, default: null },
  },
  { _id: false }
);

const pricesSM = new Schema(
  {
    binance: { type: priceSourceSM, default: null },
    dexscreener: { type: priceSourceSM, default: null },
    coingecko: { type: priceSourceSM, default: null },
  },
  { _id: false }
);

const notificationsSM = new Schema(
  {
    push_sent: { type: Boolean, default: false },
    sms_sent: { type: Boolean, default: false },
    telegram_sent: { type: Boolean, default: false },
    push_sent_at: { type: Date, default: null },
    sms_sent_at: { type: Date, default: null },
    telegram_sent_at: { type: Date, default: null },
  },
  { _id: false }
);

const automationSM = new Schema(
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
    type: {
      type: String,
      enum: ["price_drop", "price_rise"],
      required: true,
    },
    target_price: { type: Number, default: null },
    isActive: { type: Boolean, default: true },
    use_ai: { type: Boolean, default: false },
    enabled_notifications: {
      type: [String],
      enum: ["push", "sms", "telegram"],
      default: ["push"],
    },
    prices: { type: pricesSM, required: true },
    notifications: { type: notificationsSM, default: {} },
    continuation_price: { type: Number, default: null },
    continuation_count: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

automationSM.index({ userId: 1, createdAt: -1 });
automationSM.index({ coinId: 1, createdAt: -1 });
automationSM.index({ isActive: 1 });
automationSM.index({ type: 1 });

const AutomationModel = model("coinDivinerAI-automation", automationSM);

export default AutomationModel;
