import { z } from "zod";

export const pushTokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
  platform: z.enum(["ios", "android", "web"], {
    message: "Platform must be ios, android, or web",
  }),
  deviceBrand: z.string().optional().default("unknown"),
  deviceModel: z.string().optional().default("unknown"),
  deviceName: z.string().optional().default("unknown"),
  isSimulator: z.boolean().optional().default(false),
});

export const pushTokenResponseSchema = z.object({
  id: z.string(),
  token: z.string(),
  platform: z.enum(["ios", "android", "web"]),
  deviceBrand: z.string(),
  deviceModel: z.string(),
  deviceName: z.string(),
  isSimulator: z.boolean(),
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
