import { Schema, model } from "mongoose";

const groupSubscriptionSM = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    currency: { type: String, required: true },
    durationDays: { type: Number, required: true, default: 30 },
    members: [{ type: Schema.Types.ObjectId, ref: "Member", required: true }],
    group: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    user: { type: Schema.Types.ObjectId, ref: "users", required: true },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

groupSubscriptionSM.index({ members: 1, group: 1 });
groupSubscriptionSM.index({ group: 1 });
groupSubscriptionSM.index({ user: 1 });

const GroupSubscriptionModel = model("GroupSubscription", groupSubscriptionSM);

export default GroupSubscriptionModel;
