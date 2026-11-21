import { Response } from "express";
import { templateSchema } from "./template.schemas";
import {
  TemplateMessageResponseT,
  TemplatePasswordQueryT,
  TemplateT,
} from "./template.types";

export const normalizeTemplate = (template: any): TemplateT =>
  templateSchema.parse({
    _id: String(template._id),
    name: template.name,
    description:
      typeof template.description === "undefined" ? null : template.description,
    content: template.content,
    urls: Array.isArray(template.urls)
      ? template.urls.map((item: unknown) => String(item))
      : [],
    createdAt: new Date(template.createdAt),
    updatedAt: new Date(template.updatedAt),
  });

export const validatePassword = (
  query: TemplatePasswordQueryT,
  res: Response<TemplateMessageResponseT>
): string | null => {
  const currentPassword = process.env.SEAMEN_PASSWORD;
  if (!currentPassword) {
    res.status(500).json({ message: "Секретний код не налаштований" });
    return null;
  }
  if (query.passwordToken !== currentPassword) {
    res.status(401).json({ message: "Невірний код доступу" });
    return null;
  }
  return currentPassword;
};
