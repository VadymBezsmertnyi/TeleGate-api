import { z } from "zod";
import {
  userSchema,
  userPublicSchema,
  createUserSchema,
} from "./users.schemas";

export type UserType = z.infer<typeof userSchema>;
export type UserPublicType = z.infer<typeof userPublicSchema>;
export type CreateUserType = z.infer<typeof createUserSchema>;
