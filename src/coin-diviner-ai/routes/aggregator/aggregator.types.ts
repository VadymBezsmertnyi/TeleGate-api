import { z } from "zod";
import {
  contractAddressSchema,
  coinPaprikaDataSchema,
  coinGeckoDataSchema,
  cryptoCoinSchema,
  searchQuerySchema,
  searchCoinsResultSchema,
  priceResultSchema,
  priceHistoryResultSchema,
  searchQueryParamsSchema,
  priceQueryParamsSchema,
  priceHistoryQueryParamsSchema,
} from "./aggregator.schemas";

export type TContractAddress = z.infer<typeof contractAddressSchema>;
export type TCoinPaprikaData = z.infer<typeof coinPaprikaDataSchema>;
export type TCoinGeckoData = z.infer<typeof coinGeckoDataSchema>;
export type TCryptoCoin = z.infer<typeof cryptoCoinSchema>;
export type TSearchQuery = z.infer<typeof searchQuerySchema>;
export type TSearchCoinsResult = z.infer<typeof searchCoinsResultSchema>;
export type TPriceResult = z.infer<typeof priceResultSchema>;
export type TPriceHistoryResult = z.infer<typeof priceHistoryResultSchema>;
export type TSearchQueryParams = z.infer<typeof searchQueryParamsSchema>;
export type TPriceQueryParams = z.infer<typeof priceQueryParamsSchema>;
export type TPriceHistoryQueryParams = z.infer<
  typeof priceHistoryQueryParamsSchema
>;
