import { Schema, model } from "mongoose";

const pushTokenSM = new Schema({
  _id: { type: Schema.Types.ObjectId, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
  token: { type: String, required: true, unique: true },
  platform: {
    type: String,
    required: true,
    enum: ["ios", "android", "web"],
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const PushTokenModel = model("PushTokens", pushTokenSM);

export default PushTokenModel;
