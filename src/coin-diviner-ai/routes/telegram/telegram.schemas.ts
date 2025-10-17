import { z } from "zod";

export const setWebhookSchema = z.object({
  webhookUrl: z.string().url(),
});
