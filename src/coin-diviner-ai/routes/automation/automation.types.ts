import z from "zod";
import {
  createAutomationSchema,
  updateAutomationSchema,
  automationResponseSchema,
  automationListResponseSchema,
  deleteResponseSchema,
  automationRecordSchema,
  priceSourceSchema,
  pricesSchema,
  notificationsSchema,
} from "./automation.schemas";

export type TCreateAutomation = z.infer<typeof createAutomationSchema>;
export type TUpdateAutomation = z.infer<typeof updateAutomationSchema>;
export type TAutomationResponse = z.infer<typeof automationResponseSchema>;
export type TAutomationListResponse = z.infer<
  typeof automationListResponseSchema
>;
export type TDeleteResponse = z.infer<typeof deleteResponseSchema>;
export type TAutomationRecord = z.infer<typeof automationRecordSchema>;
export type TPriceSource = z.infer<typeof priceSourceSchema>;
export type TPrices = z.infer<typeof pricesSchema>;
export type TNotifications = z.infer<typeof notificationsSchema>;
