import { Schema, model } from "mongoose";
import { SUBSCRIPTION_TYPES_ENUM } from "./group-subscriptions.constants";

const groupSubscriptionSM = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    currency: { type: String, required: true },
    type: {
      type: String,
      enum: SUBSCRIPTION_TYPES_ENUM,
      required: true,
      default: "monthly",
    },
    duration: { type: Number, required: true, default: 1 },
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

const GroupSubscriptionModel = model("GroupSubscription", groupSubscriptionSM);

export default GroupSubscriptionModel;
