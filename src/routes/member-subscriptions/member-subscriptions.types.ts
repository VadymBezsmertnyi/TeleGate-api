import { z } from "zod";
import {
  memberSubscriptionSchema,
  createMemberSubscriptionSchema,
  updateMemberSubscriptionSchema,
  memberSubscriptionsQuerySchema,
  memberSubscriptionsResponseSchema,
  memberSubscriptionResponseSchema,
} from "./member-subscriptions.schemas";

export type MemberSubscriptionT = z.infer<typeof memberSubscriptionSchema>;
export type CreateMemberSubscriptionT = z.infer<
  typeof createMemberSubscriptionSchema
>;
export type UpdateMemberSubscriptionT = z.infer<
  typeof updateMemberSubscriptionSchema
>;
export type MemberSubscriptionsQueryT = z.infer<
  typeof memberSubscriptionsQuerySchema
>;
export type MemberSubscriptionsResponseT = z.infer<
  typeof memberSubscriptionsResponseSchema
>;
export type MemberSubscriptionResponseT = z.infer<
  typeof memberSubscriptionResponseSchema
>;
