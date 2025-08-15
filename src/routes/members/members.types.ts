import { z } from "zod";
import {
  memberSchema,
  memberPublicSchema,
  membersQuerySchema,
  memberParamsSchema,
  membersResponseSchema,
  memberResponseSchema,
  errorResponseSchema,
} from "./members.schemas";

export type Member = z.infer<typeof memberSchema>;
export type MemberPublic = z.infer<typeof memberPublicSchema>;
export type MembersQuery = z.infer<typeof membersQuerySchema>;
export type MemberParams = z.infer<typeof memberParamsSchema>;
export type MembersResponse = z.infer<typeof membersResponseSchema>;
export type MemberResponse = z.infer<typeof memberResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
