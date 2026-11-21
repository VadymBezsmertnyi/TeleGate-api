import { Schema, model } from "mongoose";
import { SUBSCRIPTION_TYPES_ENUM } from "./users.constants";

const userSM = new Schema({
  _id: { type: Schema.Types.ObjectId, required: true },
  telegramId: { type: Number, required: true, unique: true },
  username: { type: String, default: null },
  firstName: { type: String, default: null },
  lastName: { type: String, default: null },
  photoUrl: { type: String, default: null },
  lastActivityAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  subscriptionType: {
    type: String,
    enum: SUBSCRIPTION_TYPES_ENUM,
    default: "free",
  },
  subscriptionExpiresAt: { type: Number, default: null },
  isSuper: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  members: [{ type: Schema.Types.ObjectId, ref: "Member" }],
  groups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
  pushTokens: [{ type: Schema.Types.ObjectId, ref: "PushTokens" }],
});

const UserModel = model("users", userSM);

export default UserModel;
