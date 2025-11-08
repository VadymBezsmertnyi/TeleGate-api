import { Schema, model } from "mongoose";

const templateSM = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    content: { type: String, required: true },
    urls: [{ type: String }],
  },
  { timestamps: true }
);

const TemplateModel = model("Template", templateSM);

export default TemplateModel;
