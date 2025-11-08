import { Schema, model } from "mongoose";

const integrationDataSchema = new Schema(
  {
    type: { type: String, enum: ["email"], required: true },
    host: { type: String, required: true },
    port: { type: Number, required: true },
    secure: { type: Boolean, required: true },
    user: { type: String, required: true },
    pass: { type: String, required: true },
  },
  { _id: false }
);

const integrationSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    data: { type: integrationDataSchema, required: true },
  },
  { timestamps: true }
);

const IntegrationModel = model("seamen-integration", integrationSchema);

export default IntegrationModel;
