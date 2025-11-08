import { Schema, model, Types } from "mongoose";

const contactSendHistorySchema = new Schema(
  {
    type: { type: String, enum: ["template", "custom"], required: true },
    templateId: { type: Types.ObjectId, ref: "Template" },
    subject: { type: String },
    content: { type: String },
    status: { type: String, enum: ["success", "failed"], required: true },
    sentAt: { type: Date, required: true },
    errorMessage: { type: String },
    integrationId: { type: Types.ObjectId, ref: "Integration" },
  },
  { _id: false }
);

const companyContactSchema = new Schema(
  {
    companyId: { type: Types.ObjectId, ref: "Company", default: null },
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
