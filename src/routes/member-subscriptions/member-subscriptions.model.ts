import { Schema, model } from "mongoose";

const memberSubscriptionSM = new Schema(
  {
    startDate: { type: Date, required: true },
    purchaseDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    member: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    group: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    groupSubscription: {
      type: Schema.Types.ObjectId,
      ref: "GroupSubscription",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const MemberSubscriptionModel = model(
  "MemberSubscription",
  memberSubscriptionSM
);

export default MemberSubscriptionModel;
