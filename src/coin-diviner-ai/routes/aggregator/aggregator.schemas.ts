import { z } from "zod";

export const contractAddressSchema = z.object({
  type: z.string(),
  address: z.string(),
});

export const coinPaprikaDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  rank: z.number().optional().nullable(),
  is_new: z.boolean().optional().nullable(),
  is_active: z.boolean().optional().nullable(),
  type: z.string().optional().nullable(),
  rev: z.number().optional().nullable(),
  contract_address: z.array(contractAddressSchema).optional(),
});

export const coinGeckoDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  api_symbol: z.string().optional().nullable(),
  symbol: z.string(),
  market_cap_rank: z.number().nullable().optional(),
  thumb: z.string().optional().nullable(),
  large: z.string().optional().nullable(),
});

export const cryptoCoinSchema = z.object({
  _id: z.any().optional(),
  name: z.string(),
  symbol: z.string(),
  binancePair: z.string().optional().nullable(),
  coinPaprikaData: coinPaprikaDataSchema.optional().nullable(),
  coinGeckoData: coinGeckoDataSchema.optional().nullable(),
  lastUpdatedCoinPaprika: z.date().optional(),
  lastUpdatedCoinGecko: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  source: z.enum(["coinpaprika", "coingecko", "both"]).optional(),
});

export const searchQueryParamsSchema = z.object({
  query: z.string().min(1),
  deepSearch: z.enum(["true", "false"]).optional(),
});

export const priceQueryParamsSchema = z.object({
  coinId: z.string().min(1),
});

export const priceHistoryQueryParamsSchema = z.object({
  coinId: z.string().min(1),
  range: z.enum(["1h", "1d", "7d", "30d"]).optional().default("7d"),
});

export const allPricesQueryParamsSchema = z.object({
  coinId: z.string().min(1),
});

export const allPriceHistoryQueryParamsSchema = z.object({
  coinId: z.string().min(1),
  range: z.enum(["1h", "1d", "7d", "30d"]).optional().default("1d"),
});

export const searchResponseSchema = z.object({
  results: z.array(cryptoCoinSchema),
  deepSearch: z.boolean().optional(),
  cached: z.boolean(),
});

export const priceResponseSchema = z.object({
  symbol: z.string(),
  price: z.number(),
  source: z.enum(["binance", "dexscreener", "coingecko"]),
});

export const coinGeckoMarketChartSchema = z.object({
  prices: z.array(z.tuple([z.number(), z.number()])),
  market_caps: z.array(z.tuple([z.number(), z.number()])),
  total_volumes: z.array(z.tuple([z.number(), z.number()])),
});

export const coinPaprikaQuoteSchema = z.object({
  price: z.number(),
  volume_24h: z.number(),
  volume_24h_change_24h: z.number(),
  market_cap: z.number(),
  market_cap_change_24h: z.number(),
  percent_change_15m: z.number(),
  percent_change_30m: z.number(),
  percent_change_1h: z.number(),
  percent_change_6h: z.number(),
  percent_change_12h: z.number(),
  percent_change_24h: z.number(),
  percent_change_7d: z.number(),
  percent_change_30d: z.number(),
  percent_change_1y: z.number(),
  ath_price: z.number(),
  ath_date: z.string(),
  percent_from_price_ath: z.number(),
});

export const coinPaprikaTickerSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  rank: z.number(),
  circulating_supply: z.number().optional().nullable(),
  total_supply: z.number(),
  max_supply: z.number(),
  beta_value: z.number(),
  first_data_at: z.string(),
  last_updated: z.string(),
  quotes: z.object({
    USD: coinPaprikaQuoteSchema,
  }),
});

export const priceHistoryResponseSchema = z.object({
  data: z.union([coinGeckoMarketChartSchema, coinPaprikaTickerSchema]),
  source: z.enum(["coingecko", "coinpaprika"]),
});

export const priceDataSchema = z.object({
  price: z.number().nullable(),
  updatedAt: z.date(),
  error: z.string().optional().nullable(),
});

export const allPricesResponseSchema = z.object({
  symbol: z.string(),
  binance: priceDataSchema.optional().nullable(),
  dexscreener: priceDataSchema.optional().nullable(),
  coingecko: priceDataSchema.optional().nullable(),
});

export const priceHistoryDataSchema = z.object({
  data: z
    .union([coinGeckoMarketChartSchema, coinPaprikaTickerSchema])
    .nullable(),
  updatedAt: z.date(),
  error: z.string().optional().nullable(),
});

export const allPriceHistoryResponseSchema = z.object({
  symbol: z.string(),
  coingecko: priceHistoryDataSchema.optional().nullable(),
  coinpaprika: priceHistoryDataSchema.optional().nullable(),
});

export const validationErrorSchema = z.object({
  message: z.string(),
  errors: z.array(z.any()),
});

export const notFoundErrorSchema = z.object({
  message: z.string(),
});

export const serverErrorSchema = z.object({
  message: z.string(),
});
