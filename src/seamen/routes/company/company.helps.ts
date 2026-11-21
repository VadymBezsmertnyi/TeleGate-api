import { Response } from "express";
import { companySchema } from "./company.schemas";
import {
  CompanyContactSummaryT,
  CompanyMessageResponseT,
  CompanyPasswordQueryT,
  CompanyT,
} from "./company.types";

export const normalizeCompany = (
  company: any,
  contacts: CompanyContactSummaryT[]
): CompanyT =>
  companySchema.parse({
    _id: String(company._id),
    name: company.name,
    category:
      typeof company.category === "undefined" ? null : company.category,
    website:
      typeof company.website === "undefined" ? null : company.website,
    description:
      typeof company.description === "undefined" ? null : company.description,
    country:
      typeof company.country === "undefined" ? null : company.country,
    tags: Array.isArray(company.tags)
      ? company.tags.map((tag: unknown) => String(tag))
      : [],
    contacts,
    statistics: {
      contactCount: contacts.length,
      successEmails: contacts.reduce((total, contact) => total + contact.success, 0),
      failedEmails: contacts.reduce((total, contact) => total + contact.failed, 0),
    },
    createdAt: new Date(company.createdAt),
    updatedAt: new Date(company.updatedAt),
  });

export const validateCompanyPassword = (
  query: CompanyPasswordQueryT,
  res: Response<CompanyMessageResponseT>
): boolean => {
  const currentPassword = process.env.SEAMEN_PASSWORD;
  if (!currentPassword) {
    res.status(500).json({ message: "Секретний код не налаштований" });
    return false;
  }
  if (query.passwordToken !== currentPassword) {
    res.status(401).json({ message: "Невірний код доступу" });
    return false;
  }
  return true;
};

