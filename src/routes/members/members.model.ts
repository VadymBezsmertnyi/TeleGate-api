import { Schema, model } from "mongoose";

const memberSM = new Schema(
  {
    telegramUsername: { type: String, unique: true, sparse: true },
    tgUserId: { type: String, required: true, unique: true },
    isBot: { type: Boolean, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
    username: { type: String },
    languageCode: { type: String },
    canJoinGroups: { type: Boolean },
    canReadAllGroupMessages: { type: Boolean },
    supportsInlineQueries: { type: Boolean },
    photoUrl: { type: String },
    hasPrivateForwards: { type: Boolean, default: false },
    privacySettings: {
      profilePhotos: {
        type: String,
        enum: ["everybody", "contacts", "nobody"],
        default: "contacts",
      },
      lastSeen: {
        type: String,
        enum: ["everybody", "contacts", "nobody"],
        default: "contacts",
      },
      forwards: {
        type: String,
        enum: ["everybody", "contacts", "nobody"],
        default: "contacts",
      },
    },
    user: { type: Schema.Types.ObjectId, ref: "users" },
    groups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const MemberModel = model("Member", memberSM);

export default MemberModel;
