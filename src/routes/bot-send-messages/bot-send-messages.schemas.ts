import { z } from "zod";

export const sendMessageSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  groupId: z.string().min(1, "Group ID is required"),
  message: z
    .string()
    .min(1, "Message text is required")
    .max(4096, "Message too long"),
});


