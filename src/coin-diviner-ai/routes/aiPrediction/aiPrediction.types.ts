import { TAiPrediction } from "../../hooks/openAi/aiPrediction.types";

export type TPredictionQueryParams = {
  coinId: string;
  language?: "uk" | "en";
};

export type TPredictionStatus =
  | "creating"
  | "fetching_data"
  | "generating_ai"
  | "completed"
  | "error";

export type TPredictionResponse = {
  success: boolean;
  data: TAiPrediction | null;
  status?: TPredictionStatus;
  message?: string;
};
