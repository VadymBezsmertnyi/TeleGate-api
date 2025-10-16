import { z } from "zod";
import {
  createNotificationSchema,
  sendNotificationSchema,
  updateNotificationSchema,
  notificationRecordSchema,
  notificationResponseSchema,
  notificationListResponseSchema,
  deleteNotificationResponseSchema,
  notificationMetadataSchema,
} from "./notification.schemas";

export type TCreateNotification = z.infer<typeof createNotificationSchema>;
export type TSendNotification = z.infer<typeof sendNotificationSchema>;
export type TUpdateNotification = z.infer<typeof updateNotificationSchema>;
export type TNotificationRecord = z.infer<typeof notificationRecordSchema>;
export type TNotificationResponse = z.infer<typeof notificationResponseSchema>;
export type TNotificationListResponse = z.infer<
  typeof notificationListResponseSchema
>;
export type TDeleteNotificationResponse = z.infer<
  typeof deleteNotificationResponseSchema
>;
export type TNotificationMetadata = z.infer<typeof notificationMetadataSchema>;
