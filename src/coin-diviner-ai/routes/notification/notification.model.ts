import { Schema, model } from "mongoose";

const pushTokenSM = new Schema(
  {
    token: { type: String, required: true },
    platform: { type: String, enum: ["ios", "android", "web"], required: true },
    deviceId: { type: String, required: false },
  },
  { _id: true }
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
    telegramChatId: { type: String, required: false },
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
