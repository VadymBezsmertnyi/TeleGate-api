import { z } from "zod";
import {
  groupSubscriptionSchema,
  groupSubscriptionPublicSchema,
  createGroupSubscriptionSchema,
  updateGroupSubscriptionSchema,
  groupSubscriptionsQuerySchema,
  groupSubscriptionsResponseSchema,
  groupSubscriptionResponseSchema,
} from "./group-subscriptions.schemas";

export type GroupSubscriptionT = z.infer<typeof groupSubscriptionSchema>;
export type GroupSubscriptionPublicT = z.infer<
  typeof groupSubscriptionPublicSchema
>;
export type CreateGroupSubscriptionT = z.infer<
  typeof createGroupSubscriptionSchema
>;
export type UpdateGroupSubscriptionT = z.infer<
  typeof updateGroupSubscriptionSchema
>;
export type GroupSubscriptionsQueryT = z.infer<
  typeof groupSubscriptionsQuerySchema
>;
export type GroupSubscriptionsResponseT = z.infer<
  typeof groupSubscriptionsResponseSchema
>;
export type GroupSubscriptionResponseT = z.infer<
  typeof groupSubscriptionResponseSchema
>;
