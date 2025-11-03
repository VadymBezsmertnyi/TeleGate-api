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

export const dexScreenerTokenSchema = z.object({
  address: z.string(),
  name: z.string(),
  symbol: z.string(),
});

export const dexScreenerLiquiditySchema = z.object({
  usd: z.number().optional().nullable(),
  base: z.number().optional().nullable(),
  quote: z.number().optional().nullable(),
});

export const dexScreenerInfoSchema = z.object({
  imageUrl: z.string().optional().nullable(),
  websites: z
    .array(
      z
        .object({
          url: z.string().optional().nullable(),
        })
        .optional()
        .nullable()
    )
    .optional()
    .nullable(),
  socials: z
    .array(
      z
        .object({
          platform: z.string().optional().nullable(),
          handle: z.string().optional().nullable(),
        })
        .optional()
        .nullable()
    )
    .optional()
    .nullable(),
});

export const dexScreenerDataSchema = z.object({
  chainId: z.string(),
  dexId: z.string(),
  url: z.string().optional().nullable(),
  pairAddress: z.string(),
  priceNative: z.string().optional().nullable(),
  priceUsd: z.string().optional().nullable(),
  fdv: z.number().optional().nullable(),
  marketCap: z.number().optional().nullable(),
  pairCreatedAt: z.number().optional().nullable(),
  labels: z.array(z.string()).optional().nullable(),
  volume: z.record(z.string(), z.number()).optional().nullable(),
  priceChange: z.record(z.string(), z.number()).optional().nullable(),
  baseToken: dexScreenerTokenSchema,
  quoteToken: dexScreenerTokenSchema,
  liquidity: dexScreenerLiquiditySchema.optional().nullable(),
  boosts: z
    .object({
      active: z.number().optional().nullable(),
    })
    .optional()
    .nullable(),
  txns: z.record(z.string(), z.any()).optional().nullable(),
  info: dexScreenerInfoSchema.optional().nullable(),
});

export const cryptoCoinSchema = z.object({
  _id: z.any().optional(),
  name: z.string(),
  symbol: z.string(),
  binancePair: z.string().optional().nullable(),
  coinPaprikaData: coinPaprikaDataSchema.optional().nullable(),
  coinGeckoData: coinGeckoDataSchema.optional().nullable(),
  dexscreenerData: dexScreenerDataSchema.optional().nullable(),
  lastUpdatedCoinPaprika: z.date().optional(),
  lastUpdatedCoinGecko: z.date().optional(),
  lastUpdatedDexScreener: z.date().optional(),
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
  cached: z.boolean(),
  deepSearch: z.boolean().optional(),
  wasDeepSearch: z.boolean().optional(),
  lastDeepSearchDate: z.date().optional().nullable(),
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

export const priceDataSchema = z.object({
  price: z.number().nullable(),
  updatedAt: z.date(),
  error: z.string().optional().nullable(),
});

export const priceHistoryDataGeckoSchema = z.object({
  data: coinGeckoMarketChartSchema.nullable(),
  updatedAt: z.date(),
  error: z.string().optional().nullable(),
});

export const priceHistoryDataPaprikaSchema = z.object({
  data: coinPaprikaTickerSchema.nullable(),
  updatedAt: z.date(),
  error: z.string().optional().nullable(),
});

export const priceHistoryResponseSchema = z.object({
  symbol: z.string(),
  coingecko: priceHistoryDataGeckoSchema.optional().nullable(),
  coinpaprika: priceHistoryDataPaprikaSchema.optional().nullable(),
});

export const allPricesResponseSchema = z.object({
  symbol: z.string(),
  binance: priceDataSchema.optional().nullable(),
  dexscreener: priceDataSchema.optional().nullable(),
  coingecko: priceDataSchema.optional().nullable(),
});

export const allPriceHistoryResponseSchema = z.object({
  symbol: z.string(),
  coingecko: priceHistoryDataGeckoSchema.optional().nullable(),
  coinpaprika: priceHistoryDataPaprikaSchema.optional().nullable(),
});

export const validationErrorSchema = z.object({
  message: z.string(),
  errors: z.array(z.any()),
  code: z.number(),
});

export const notFoundErrorSchema = z.object({
  message: z.string(),
});

export const serverErrorSchema = z.object({
  message: z.string(),
});
