import { TAiPrediction } from "../../hooks/openAi/aiPrediction.types";

export type TPredictionQueryParams = {
  coinId: string;
  language?: "uk" | "en";
};

export type TPredictionResponse = {
  success: boolean;
  data: TAiPrediction | null;
};
