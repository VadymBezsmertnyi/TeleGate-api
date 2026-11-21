import { z } from "zod";
import {
  loginSchema,
  registerSchema,
  createAuthSchema,
  updateAuthSchema,
  refreshTokenSchema,
  authSchema,
} from "./auth.schemas";

export type TBodyLogin = z.infer<typeof loginSchema>;
export type TBodyRegister = z.infer<typeof registerSchema>;
export type TBodyCreate = z.infer<typeof createAuthSchema>;
export type TBodyUpdate = z.infer<typeof updateAuthSchema>;
export type TBodyRefreshToken = z.infer<typeof refreshTokenSchema>;
export type TAuth = z.infer<typeof authSchema>;
