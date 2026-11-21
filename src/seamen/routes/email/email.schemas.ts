import { z } from "zod";

const emailAddressSchema = z
  .string()
  .trim()
  .min(1)
  .email({ message: "Невірний формат email" });

export const emailPasswordQuerySchema = z.object({
  passwordToken: z.string().min(1),
});

export const emailSendSchema = z.object({
  integrationId: z.string().min(1),
  to: z.array(emailAddressSchema).min(1),
  subject: z.string().min(1),
  html: z.string().min(1),
  templateId: z.string().min(1).optional(),
});

export const emailSendResultSchema = z.object({
  email: emailAddressSchema,
  contactId: z.string().min(1),
  status: z.enum(["success", "failed"]),
  error: z.string().nullable().optional(),
});

export const emailSendResponseSchema = z.object({
  message: z.string(),
  results: z.array(emailSendResultSchema),
});

export const emailMessageSchema = z.object({
  message: z.string(),
});
