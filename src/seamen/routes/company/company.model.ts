import { Schema, model } from "mongoose";

const companySchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String },
    website: { type: String },
    description: { type: String },
    country: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

const CompanyModel = model("seamen-company", companySchema);

export default CompanyModel;
