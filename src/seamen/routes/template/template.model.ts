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

const TemplateModel = model("seamen-template", templateSM);

export default TemplateModel;
