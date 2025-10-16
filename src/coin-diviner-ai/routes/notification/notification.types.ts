import { z } from "zod";
import {
  notificationSettingsSchema,
  updateNotificationSettingsSchema,
  addPushTokenSchema,
  removePushTokenSchema,
  sendNotificationSchema,
  pushTokenSchema,
} from "./notification.schemas";

export type TNotificationSettings = z.infer<typeof notificationSettingsSchema>;
export type TUpdateNotificationSettings = z.infer<
  typeof updateNotificationSettingsSchema
>;
export type TAddPushToken = z.infer<typeof addPushTokenSchema>;
export type TRemovePushToken = z.infer<typeof removePushTokenSchema>;
export type TSendNotification = z.infer<typeof sendNotificationSchema>;
export type TPushToken = z.infer<typeof pushTokenSchema>;
