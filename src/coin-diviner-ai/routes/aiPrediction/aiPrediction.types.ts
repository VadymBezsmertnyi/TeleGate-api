import z from "zod";
import { predictionResponseSchema } from "./aiPrediction.schemas";

export type TPredictionQueryParams = {
  coinId: string;
  language?: "uk" | "en";
};

export type TPredictionResponse = z.infer<typeof predictionResponseSchema>;
