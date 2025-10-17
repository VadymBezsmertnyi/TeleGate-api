import { Schema, model } from "mongoose";

const pushTokenSM = new Schema(
  {
    token: { type: String, required: true },
    platform: { type: String, enum: ["ios", "android", "web"], required: true },
    deviceId: { type: String, required: false },
    failureCount: { type: Number, default: 0 },
  },
  { _id: true }
);

const telegramUserSM = new Schema(
  {
    chatId: { type: String },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    username: { type: String, required: false },
  },
  { _id: false }
);

const notificationSettingsSM = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "coinDivinerAI-auth",
      required: true,
      unique: true,
    },
    pushTokens: [pushTokenSM],
    smsPhone: { type: String, required: false },
    telegram: telegramUserSM,
    enabledTypes: {
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      telegram: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

notificationSettingsSM.index({ userId: 1 });

const NotificationSettingsModel = model(
  "coinDivinerAI-notification-settings",
  notificationSettingsSM
);

export default NotificationSettingsModel;
