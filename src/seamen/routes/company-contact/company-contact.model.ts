import { Schema, model, Types } from "mongoose";

const contactSendHistorySchema = new Schema(
  {
    templateId: { type: Types.ObjectId, ref: "Template", required: true },
    status: { type: String, enum: ["success", "failed"], required: true },
    sentAt: { type: Date, required: true },
    errorMessage: { type: String },
  },
  { _id: false }
);

const companyContactSchema = new Schema(
  {
    companyId: { type: Types.ObjectId, ref: "Company", required: true },
    fullName: { type: String, required: true },
    position: { type: String },
    email: { type: String },
    phone: { type: String },
    notes: { type: String },
    tags: [{ type: String }],
    sendHistory: { type: [contactSendHistorySchema], default: [] },
  },
  { timestamps: true }
);

const CompanyContactModel = model("CompanyContact", companyContactSchema);

export default CompanyContactModel;
