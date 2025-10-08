import { Schema, model } from "mongoose";

const authSM = new Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

const AuthModel = model("Auth", authSM);

export default AuthModel;
