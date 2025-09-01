import { Schema, model } from "mongoose";

const groupSubscriptionSM = new Schema(
  {
    price: { type: Number, required: true },
    currency: { type: String, required: true },
    durationDays: { type: Number, required: true },
    startedAt: { type: Date, default: Date.now, required: true },
    expiresAt: { type: Date },
    canceledAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    member: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    group: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    user: { type: Schema.Types.ObjectId, ref: "users", required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const GroupSubscriptionModel = model("GroupSubscription", groupSubscriptionSM);

export default GroupSubscriptionModel;
