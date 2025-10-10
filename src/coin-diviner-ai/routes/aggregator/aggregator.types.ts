import { z } from "zod";
import {
  contractAddressSchema,
  coinPaprikaDataSchema,
  coinGeckoDataSchema,
  cryptoCoinSchema,
  searchQuerySchema,
  searchQueryParamsSchema,
  priceQueryParamsSchema,
  priceHistoryQueryParamsSchema,
  searchResponseSchema,
  priceResponseSchema,
  priceHistoryResponseSchema,
  validationErrorSchema,
  notFoundErrorSchema,
  serverErrorSchema,
} from "./aggregator.schemas";

export type TContractAddress = z.infer<typeof contractAddressSchema>;
export type TCoinPaprikaData = z.infer<typeof coinPaprikaDataSchema>;
export type TCoinGeckoData = z.infer<typeof coinGeckoDataSchema>;
export type TCryptoCoin = z.infer<typeof cryptoCoinSchema>;
export type TSearchQuery = z.infer<typeof searchQuerySchema>;

export type TSearchQueryParams = z.infer<typeof searchQueryParamsSchema>;
export type TPriceQueryParams = z.infer<typeof priceQueryParamsSchema>;
export type TPriceHistoryQueryParams = z.infer<
  typeof priceHistoryQueryParamsSchema
>;

export type TSearchResponse = z.infer<typeof searchResponseSchema>;
export type TPriceResponse = z.infer<typeof priceResponseSchema>;
export type TPriceHistoryResponse = z.infer<typeof priceHistoryResponseSchema>;

export type TValidationError = z.infer<typeof validationErrorSchema>;
export type TNotFoundError = z.infer<typeof notFoundErrorSchema>;
export type TServerError = z.infer<typeof serverErrorSchema>;
