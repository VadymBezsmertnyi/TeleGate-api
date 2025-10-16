import { z } from "zod";

export const notificationTypeSchema = z.enum(["push", "sms", "telegram"]);
export const notificationStatusSchema = z.enum(["pending", "sent", "failed"]);

export const notificationMetadataSchema = z.object({
  pushToken: z.string().optional(),
  phoneNumber: z.string().optional(),
  telegramChatId: z.string().optional(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
});

export const createNotificationSchema = z.object({
  type: notificationTypeSchema,
  title: z.string().optional(),
  message: z.string().min(1),
  metadata: notificationMetadataSchema.optional(),
});

export const sendNotificationSchema = z.object({
  notificationId: z.string().min(1),
});

export const updateNotificationSchema = z.object({
  status: notificationStatusSchema.optional(),
  title: z.string().optional(),
  message: z.string().min(1).optional(),
  metadata: notificationMetadataSchema.optional(),
  sentAt: z.date().optional(),
});

export const notificationRecordSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  type: notificationTypeSchema,
  status: notificationStatusSchema,
  title: z.string().optional(),
  message: z.string(),
  metadata: notificationMetadataSchema.optional(),
  sentAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const notificationResponseSchema = z.object({
  success: z.boolean(),
  data: notificationRecordSchema.nullable(),
});

export const notificationListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(notificationRecordSchema),
});

export const deleteNotificationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
