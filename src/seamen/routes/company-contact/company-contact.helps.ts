import { Response } from "express";
import { companyContactSchema } from "./company-contact.schemas";
import {
  CompanyContactMessageResponseT,
  CompanyContactPasswordQueryT,
  CompanyContactT,
} from "./company-contact.types";

export const normalizeCompanyContact = (
  contact: any,
  companyName: string | null,
  templateMap: Map<string, string | null>
): CompanyContactT => {
  const sendHistory =
    Array.isArray(contact.sendHistory) && contact.sendHistory.length > 0
      ? contact.sendHistory.map((item: any) => {
          const templateId =
            typeof item.templateId === "undefined"
              ? null
              : String(item.templateId);
          return {
            type: item.type,
            template: templateId
              ? {
                  id: templateId,
                  name: templateMap.get(templateId) ?? null,
                }
              : null,
            subject:
              typeof item.subject === "undefined" ? null : item.subject,
            content:
              typeof item.content === "undefined" ? null : item.content,
            status: item.status,
            sentAt: new Date(item.sentAt),
            errorMessage:
              typeof item.errorMessage === "undefined"
                ? null
                : item.errorMessage,
          };
        })
      : [];

  const companyId =
    typeof contact.companyId === "undefined" || contact.companyId === null
      ? null
      : String(contact.companyId);

  return companyContactSchema.parse({
    _id: String(contact._id),
    company: companyId
      ? {
          id: companyId,
      name: companyName,
        }
      : null,
    fullName: contact.fullName,
    position:
      typeof contact.position === "undefined" ? null : contact.position,
    email: typeof contact.email === "undefined" ? null : contact.email,
    phone: typeof contact.phone === "undefined" ? null : contact.phone,
    notes: typeof contact.notes === "undefined" ? null : contact.notes,
    tags: Array.isArray(contact.tags)
      ? contact.tags.map((tag: unknown) => String(tag))
      : [],
    sendHistory,
    statistics: {
      success: sendHistory.filter((historyItem: any) => historyItem.status === "success").length,
      failed: sendHistory.filter((historyItem: any) => historyItem.status === "failed").length,
    },
    createdAt: new Date(contact.createdAt),
    updatedAt: new Date(contact.updatedAt),
  });
};

export const validateCompanyContactPassword = (
  query: CompanyContactPasswordQueryT,
  res: Response<CompanyContactMessageResponseT>
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

