import { Schema, model } from "mongoose";

const userSM = new Schema({
  _id: { type: Schema.Types.ObjectId, required: true },
  telegramId: { type: Number, required: true, unique: true },
  username: { type: String, default: null },
  firstName: { type: String, default: null },
  lastName: { type: String, default: null },
  photoUrl: { type: String, default: null },
  lastActivityAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSM.index({ telegramId: 1 });
userSM.index({ lastActivityAt: 1 });

const UserModel = model("users", userSM);

export default UserModel;
