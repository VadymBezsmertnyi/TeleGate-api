import { Schema, model } from "mongoose";

const notificationSM = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "coinDivinerAI-auth",
      required: true,
    },
    type: {
      type: String,
      enum: ["push", "sms", "telegram"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    title: { type: String, required: false },
    message: { type: String, required: true },
    metadata: {
      pushToken: { type: String, required: false },
      phoneNumber: { type: String, required: false },
      telegramChatId: { type: String, required: false },
      errorCode: { type: String, required: false },
      errorMessage: { type: String, required: false },
    },
    sentAt: { type: Date, required: false },
  },
  {
    timestamps: true,
  }
);

notificationSM.index({ userId: 1 });
notificationSM.index({ status: 1 });
notificationSM.index({ type: 1 });
notificationSM.index({ createdAt: -1 });

const NotificationModel = model("coinDivinerAI-notification", notificationSM);

export default NotificationModel;
