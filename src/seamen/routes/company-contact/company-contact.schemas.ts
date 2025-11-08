import { z } from "zod";

export const companyContactTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().nullable(),
});

export const companyContactSendHistorySchema = z.object({
  type: z.enum(["template", "custom"]),
  template: companyContactTemplateSchema.nullable(),
  subject: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  status: z.enum(["success", "failed"]),
  sentAt: z.date(),
  errorMessage: z.string().nullable().optional(),
});

export const companyContactSendHistoryInputSchema = z
  .object({
    type: z.enum(["template", "custom"]),
    templateId: z.string().min(1).optional(),
    subject: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    status: z.enum(["success", "failed"]),
    sentAt: z.coerce.date(),
    errorMessage: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "template" && !data.templateId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "templateId обов'язковий для типу template",
        path: ["templateId"],
      });
    }
    if (
      data.type === "custom" &&
      !data.subject &&
      !data.content
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Потрібно вказати subject або content для кастомної відправки",
        path: ["subject"],
      });
    }
  });

export const companyContactCompanySchema = z.object({
  id: z.string().min(1),
  name: z.string().nullable(),
});

export const companyContactStatisticsSchema = z.object({
  success: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
});

export const companyContactSchema = z.object({
  _id: z.any(),
  company: companyContactCompanySchema,
  fullName: z.string().min(1),
  position: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  tags: z.array(z.string()),
  sendHistory: z.array(companyContactSendHistorySchema),
  statistics: companyContactStatisticsSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const companyContactListSchema = z.array(companyContactSchema);

export const companyContactCreateSchema = z.object({
  companyId: z.string().min(1),
  fullName: z.string().min(1),
  position: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  sendHistory: z.array(companyContactSendHistoryInputSchema).optional(),
});

export const companyContactUpdateSchema = z.object({
  companyId: z.string().min(1).optional(),
  fullName: z.string().min(1).optional(),
  position: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  sendHistory: z.array(companyContactSendHistoryInputSchema).optional(),
});

export const companyContactIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const companyContactPasswordQuerySchema = z.object({
  passwordToken: z.string().min(1),
});

export const companyContactMessageSchema = z.object({
  message: z.string(),
});

