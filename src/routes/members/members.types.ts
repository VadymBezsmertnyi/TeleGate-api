import { z } from "zod";
import {
  memberSchema,
  memberPublicSchema,
  memberWithSubscriptionSchema,
  membersQuerySchema,
  membersWithSubscriptionsQuerySchema,
  memberParamsSchema,
  membersResponseSchema,
  membersWithSubscriptionsResponseSchema,
  memberResponseSchema,
  errorResponseSchema,
} from "./members.schemas";

export type MemberT = z.infer<typeof memberSchema>;
export type MemberPublicT = z.infer<typeof memberPublicSchema>;
export type MemberWithSubscriptionT = z.infer<typeof memberWithSubscriptionSchema>;
export type MembersQueryT = z.infer<typeof membersQuerySchema>;
export type MembersWithSubscriptionsQueryT = z.infer<typeof membersWithSubscriptionsQuerySchema>;
export type MemberParamsT = z.infer<typeof memberParamsSchema>;
export type MembersResponseT = z.infer<typeof membersResponseSchema>;
export type MembersWithSubscriptionsResponseT = z.infer<typeof membersWithSubscriptionsResponseSchema>;
export type MemberResponseT = z.infer<typeof memberResponseSchema>;
export type ErrorResponseT = z.infer<typeof errorResponseSchema>;
