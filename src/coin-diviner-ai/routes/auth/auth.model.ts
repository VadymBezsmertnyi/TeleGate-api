import { Schema, model } from "mongoose";

const authSM = new Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: false },
    isBlocked: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  {
    timestamps: true,
  }
);

const AuthModel = model("coinDivinerAI-auth", authSM);

export default AuthModel;
