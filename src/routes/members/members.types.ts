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

export type MemberT = z.infer<typeof memberSchema>;
export type MemberPublicT = z.infer<typeof memberPublicSchema>;
export type MembersQueryT = z.infer<typeof membersQuerySchema>;
export type MemberParamsT = z.infer<typeof memberParamsSchema>;
export type MembersResponseT = z.infer<typeof membersResponseSchema>;
export type MemberResponseT = z.infer<typeof memberResponseSchema>;
export type ErrorResponseT = z.infer<typeof errorResponseSchema>;
