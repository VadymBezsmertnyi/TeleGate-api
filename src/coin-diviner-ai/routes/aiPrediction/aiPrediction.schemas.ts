import { z } from "zod";
import { aiPredictionSchema } from "../../hooks/openAi/aiPrediction.schemas";

export const predictionQueryParamsSchema = z.object({
  coinId: z.string().min(1, "coinId is required"),
  language: z.enum(["uk", "en"]).optional().default("uk"),
});

export const predictionRecordSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  coinId: z.string(),
  language: z.string(),
  status: z.enum([
    "creating",
    "fetching_data",
    "generating",
    "completed",
    "error",
  ]),
  prediction: aiPredictionSchema.nullable().optional(),
  tokenData: z.any().optional(),
  error: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const predictionResponseSchema = z.object({
  success: z.boolean(),
  data: predictionRecordSchema
    .describe("Full prediction record from database")
    .nullable(),
});

export const predictionsListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(predictionRecordSchema),
});
