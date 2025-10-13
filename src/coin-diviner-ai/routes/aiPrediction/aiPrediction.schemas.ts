import { z } from "zod";
import { aiPredictionSchema } from "../../hooks/openAi/aiPrediction.schemas";

export const predictionQueryParamsSchema = z.object({
  coinId: z.string().min(1, "coinId is required"),
  language: z.enum(["uk", "en"]).optional().default("uk"),
});

export const predictionResponseSchema = z.object({
  success: z.boolean(),
  data: aiPredictionSchema
    .describe("AI prediction data for the specified coin")
    .nullable(),
});
