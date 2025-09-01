import { Schema, model } from "mongoose";

const groupSubscriptionSM = new Schema(
  {
    price: { type: Number, required: true },
    currency: { type: String, required: true },
    durationDays: { type: Number, required: true },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
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
