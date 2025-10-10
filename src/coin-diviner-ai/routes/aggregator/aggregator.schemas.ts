import { z } from "zod";

export const contractAddressSchema = z.object({
  type: z.string(),
  address: z.string(),
});

export const coinPaprikaDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  rank: z.number().optional(),
  is_new: z.boolean().optional(),
  is_active: z.boolean().optional(),
  type: z.string().optional(),
  rev: z.number().optional(),
  contract_address: z.array(contractAddressSchema).optional(),
});

export const coinGeckoDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  api_symbol: z.string().optional(),
  symbol: z.string(),
  market_cap_rank: z.number().nullable().optional(),
  thumb: z.string().optional(),
  large: z.string().optional(),
});

export const cryptoCoinSchema = z.object({
  _id: z.any(),
  coinId: z.string(),
  name: z.string(),
  symbol: z.string(),
  coinPaprikaData: coinPaprikaDataSchema.optional(),
  coinGeckoData: coinGeckoDataSchema.optional(),
  lastUpdatedCoinPaprika: z.date().optional(),
  lastUpdatedCoinGecko: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const searchQuerySchema = z.object({
  _id: z.any(),
  query: z.string(),
  lastSearched: z.date(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const searchCoinsResultSchema = z.object({
  results: z.array(z.union([coinPaprikaDataSchema, coinGeckoDataSchema])),
  source: z.enum(["coinpaprika", "coingecko"]).nullable(),
  cached: z.boolean(),
});

export const priceResultSchema = z.object({
  symbol: z.string(),
  price: z.number(),
  source: z.enum(["binance", "dexscreener", "coingecko"]),
});

export const priceHistoryResultSchema = z.object({
  data: z.any(),
  source: z.enum(["coingecko", "coinpaprika"]),
});

export const searchQueryParamsSchema = z.object({
  query: z.string().min(1),
});

export const priceQueryParamsSchema = z.object({
  symbol: z.string().min(1),
});

export const priceHistoryQueryParamsSchema = z.object({
  id: z.string().min(1),
  range: z.enum(["1h", "1d", "7d", "30d"]).optional().default("7d"),
});
