import z from "zod";
import {
  predictionResponseSchema,
  predictionsListResponseSchema,
  paginationSchema,
} from "./aiPrediction.schemas";

export type TPredictionQueryParams = {
  coinId: string;
  language?: "uk" | "en";
};

export type TPredictionResponse = z.infer<typeof predictionResponseSchema>;
export type TPredictionsListResponse = z.infer<
  typeof predictionsListResponseSchema
>;
export type TPagination = z.infer<typeof paginationSchema>;
