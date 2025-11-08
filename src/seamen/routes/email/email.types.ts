import { z } from "zod";
import {
  emailMessageSchema,
  emailPasswordQuerySchema,
  emailSendResponseSchema,
  emailSendResultSchema,
  emailSendSchema,
} from "./email.schemas";

export type EmailSendBodyT = z.infer<typeof emailSendSchema>;
export type EmailPasswordQueryT = z.infer<typeof emailPasswordQuerySchema>;
export type EmailSendResultT = z.infer<typeof emailSendResultSchema>;
export type EmailSendResponseT = z.infer<typeof emailSendResponseSchema>;
export type EmailMessageResponseT = z.infer<typeof emailMessageSchema>;

