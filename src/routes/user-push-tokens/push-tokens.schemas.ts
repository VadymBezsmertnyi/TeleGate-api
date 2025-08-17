import { z } from "zod";

export const pushTokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
  platform: z.enum(["ios", "android", "web"], {
    message: "Platform must be ios, android, or web",
  }),
});

export const pushTokenResponseSchema = z.object({
  id: z.string(),
  token: z.string(),
  platform: z.enum(["ios", "android", "web"]),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const testNotificationSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(1000, "Message too long"),
  title: z.string().optional(),
});

export type PushTokenT = z.infer<typeof pushTokenSchema>;
export type PushTokenResponseT = z.infer<typeof pushTokenResponseSchema>;
export type TestNotificationT = z.infer<typeof testNotificationSchema>;
