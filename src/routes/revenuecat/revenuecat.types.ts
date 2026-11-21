import { z } from "zod";
import {
  RevenueCatSubscriberAttributeSchema,
  RevenueCatSubscriberAttributesSchema,
  RevenueCatEventSchema,
  RevenueCatWebhookPayloadSchema,
  RevenueCatProjectSchema,
  RevenueCatCustomerSchema,
  RevenueCatProjectsResponseSchema,
  RevenueCatCustomersResponseSchema,
  RevenueCatSubscriberSchema,
  RevenueCatSubscriptionResponseSchema,
} from "./revenuecat.schemas";

export type RevenueCatSubscriberAttribute = z.infer<
  typeof RevenueCatSubscriberAttributeSchema
>;
export type RevenueCatSubscriberAttributes = z.infer<
  typeof RevenueCatSubscriberAttributesSchema
>;
export type RevenueCatEvent = z.infer<typeof RevenueCatEventSchema>;
export type RevenueCatWebhookPayload = z.infer<
  typeof RevenueCatWebhookPayloadSchema
>;
export type RevenueCatProject = z.infer<typeof RevenueCatProjectSchema>;
export type RevenueCatCustomer = z.infer<typeof RevenueCatCustomerSchema>;
export type RevenueCatProjectsResponse = z.infer<
  typeof RevenueCatProjectsResponseSchema
>;
export type RevenueCatCustomersResponse = z.infer<
  typeof RevenueCatCustomersResponseSchema
>;
export type RevenueCatSubscriber = z.infer<typeof RevenueCatSubscriberSchema>;
export type RevenueCatSubscriptionResponse = z.infer<
  typeof RevenueCatSubscriptionResponseSchema
>;

export type RevenueCatListResponse<T> = {
  items: T[];
  next_page: string | null;
  object: "list";
  url: string;
};
