import { z } from "zod";
import {
  coinPaprikaDataSchema,
  coinGeckoDataSchema,
  cryptoCoinSchema,
  searchQueryParamsSchema,
  priceQueryParamsSchema,
  priceHistoryQueryParamsSchema,
  updateCoinQueryParamsSchema,
  allPricesQueryParamsSchema,
  searchResponseSchema,
  priceResponseSchema,
  priceHistoryResponseSchema,
  priceDataSchema,
  allPricesResponseSchema,
  validationErrorSchema,
  notFoundErrorSchema,
  serverErrorSchema,
} from "./aggregator.schemas";

export type TCoinPaprikaData = z.infer<typeof coinPaprikaDataSchema>;
export type TCoinGeckoData = z.infer<typeof coinGeckoDataSchema>;
export type TCryptoCoin = z.infer<typeof cryptoCoinSchema>;

export type TSearchQueryParams = z.infer<typeof searchQueryParamsSchema>;
export type TPriceQueryParams = z.infer<typeof priceQueryParamsSchema>;
export type TPriceHistoryQueryParams = z.infer<
  typeof priceHistoryQueryParamsSchema
>;
export type TUpdateCoinQueryParams = z.infer<
  typeof updateCoinQueryParamsSchema
>;
export type TAllPricesQueryParams = z.infer<typeof allPricesQueryParamsSchema>;

export type TSearchResponse = z.infer<typeof searchResponseSchema>;
export type TPriceResponse = z.infer<typeof priceResponseSchema>;
export type TPriceHistoryResponse = z.infer<typeof priceHistoryResponseSchema>;
export type TPriceData = z.infer<typeof priceDataSchema>;
export type TAllPricesResponse = z.infer<typeof allPricesResponseSchema>;

export type TValidationError = z.infer<typeof validationErrorSchema>;
export type TNotFoundError = z.infer<typeof notFoundErrorSchema>;
export type TServerError = z.infer<typeof serverErrorSchema>;
