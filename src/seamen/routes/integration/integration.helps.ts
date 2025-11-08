import { Response } from "express";
import { integrationSchema } from "./integration.schemas";
import {
  IntegrationMessageResponseT,
  IntegrationPasswordQueryT,
  IntegrationT,
} from "./integration.types";

export const normalizeIntegration = (integration: any): IntegrationT =>
  integrationSchema.parse({
    _id: String(integration._id),
    name: integration.name,
    description:
      typeof integration.description === "undefined"
        ? null
        : integration.description,
    data: {
      type: integration.data?.type,
      host: integration.data?.host,
      port: Number(integration.data?.port),
      secure: Boolean(integration.data?.secure),
      user: integration.data?.user,
      pass: integration.data?.pass,
    },
    createdAt: new Date(integration.createdAt),
    updatedAt: new Date(integration.updatedAt),
  });

export const validateIntegrationPassword = (
  query: IntegrationPasswordQueryT,
  res: Response<IntegrationMessageResponseT>
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

