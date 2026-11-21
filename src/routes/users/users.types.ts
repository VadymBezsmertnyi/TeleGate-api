import { z } from "zod";
import {
  userSchema,
  userPublicSchema,
  createUserSchema,
} from "./users.schemas";

export type UserTypeT = z.infer<typeof userSchema>;
export type UserPublicTypeT = z.infer<typeof userPublicSchema>;
export type CreateUserTypeT = z.infer<typeof createUserSchema>;
