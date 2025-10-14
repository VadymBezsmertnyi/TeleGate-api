import { Router, Request, Response } from "express";
import dotenv from "dotenv";

// schemas
import {
  predictionQueryParamsSchema,
  predictionResponseSchema,
} from "./aiPrediction.schemas";
import {
  notFoundErrorSchema,
  serverErrorSchema,
  validationErrorSchema,
} from "../aggregator/aggregator.schemas";

// types
import type {
  TPredictionQueryParams,
  TPredictionResponse,
} from "./aiPrediction.types";
import type {
  ITokenData,
  IMarketData,
} from "../../hooks/openAi/aiPrediction.types";
import {
  TNotFoundError,
  TServerError,
  TValidationError,
} from "../aggregator/aggregator.types";

// models
import CryptoCoinModel from "../aggregator/aggregator.model";

// hooks
import AggregatorService from "../../hooks/aggregator";
import { generatePrediction } from "../../hooks/openAi";

// swagger
import "./aiPrediction.swagger";

dotenv.config();
const router = Router();

router.get("/generate", async (req: Request, res: Response) => {
  try {
    const validationResult = predictionQueryParamsSchema.safeParse(req.query);
    if (!validationResult.success) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: validationResult.error.issues,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const { coinId, language }: TPredictionQueryParams = validationResult.data;

    const cryptoCoin = await CryptoCoinModel.findById(coinId);
    if (!cryptoCoin) {
      const errorResponse: TNotFoundError = {
        message: "Crypto coin not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const allPrices = await AggregatorService.getAllPrices(coinId);
    const priceHistoryData = await AggregatorService.getAllPriceHistory(
      coinId,
      "7d"
    );

    let current_price_usd: number | null = null;
    let price_change_24h: number | null = null;
    let price_change_7d: number | null = null;
    let market_cap: number | null = null;
    let volume_24h: number | null = null;
    let launch_date: string | null = null;
    if (allPrices)
      current_price_usd =
        allPrices.binance?.price ||
        allPrices.dexscreener?.price ||
        allPrices.coingecko?.price ||
        null;
    if (priceHistoryData?.coinpaprika?.data) {
      const paprikaData = priceHistoryData.coinpaprika.data;
      price_change_24h = paprikaData.quotes.USD.percent_change_24h;
      price_change_7d = paprikaData.quotes.USD.percent_change_7d;
      market_cap = paprikaData.quotes.USD.market_cap;
      volume_24h = paprikaData.quotes.USD.volume_24h;
      launch_date = paprikaData.first_data_at;
    } else if (priceHistoryData?.coingecko?.data) {
      const geckoData = priceHistoryData.coingecko.data;
      if (geckoData.prices && geckoData.prices.length >= 2) {
        const latestPrice = geckoData.prices[geckoData.prices.length - 1][1];
        const price24hAgo =
          geckoData.prices[Math.max(0, geckoData.prices.length - 24)]?.[1] ||
          latestPrice;
        const price7dAgo = geckoData.prices[0]?.[1] || latestPrice;
        if (latestPrice && price24hAgo)
          price_change_24h = ((latestPrice - price24hAgo) / price24hAgo) * 100;
        if (latestPrice && price7dAgo)
          price_change_7d = ((latestPrice - price7dAgo) / price7dAgo) * 100;
      }
      if (geckoData.market_caps && geckoData.market_caps.length > 0)
        market_cap = geckoData.market_caps[geckoData.market_caps.length - 1][1];
      if (geckoData.total_volumes && geckoData.total_volumes.length > 0)
        volume_24h =
          geckoData.total_volumes[geckoData.total_volumes.length - 1][1];
    }

    const priceSources = {
      binance: allPrices?.binance?.price
        ? {
            price: allPrices.binance.price,
            updatedAt:
              allPrices.binance.updatedAt instanceof Date
                ? allPrices.binance.updatedAt.toISOString()
                : new Date().toISOString(),
          }
        : null,
      dexscreener: allPrices?.dexscreener?.price
        ? {
            price: allPrices.dexscreener.price,
            updatedAt:
              allPrices.dexscreener.updatedAt instanceof Date
                ? allPrices.dexscreener.updatedAt.toISOString()
                : new Date().toISOString(),
          }
        : null,
      coingecko: allPrices?.coingecko?.price
        ? {
            price: allPrices.coingecko.price,
            updatedAt:
              allPrices.coingecko.updatedAt instanceof Date
                ? allPrices.coingecko.updatedAt.toISOString()
                : new Date().toISOString(),
          }
        : null,
    };

    const priceHistory = priceHistoryData?.coingecko?.data
      ? {
          prices: priceHistoryData.coingecko.data.prices || undefined,
          market_caps: priceHistoryData.coingecko.data.market_caps || undefined,
          total_volumes:
            priceHistoryData.coingecko.data.total_volumes || undefined,
        }
      : undefined;

    const paprikaStats =
      priceHistoryData?.coinpaprika?.data?.quotes?.USD &&
      priceHistoryData?.coinpaprika?.data
        ? {
            beta_value: priceHistoryData.coinpaprika.data.beta_value || null,
            percent_change_15m:
              priceHistoryData.coinpaprika.data.quotes.USD.percent_change_15m ||
              null,
            percent_change_30m:
              priceHistoryData.coinpaprika.data.quotes.USD.percent_change_30m ||
              null,
            percent_change_1h:
              priceHistoryData.coinpaprika.data.quotes.USD.percent_change_1h ||
              null,
            percent_change_6h:
              priceHistoryData.coinpaprika.data.quotes.USD.percent_change_6h ||
              null,
            percent_change_12h:
              priceHistoryData.coinpaprika.data.quotes.USD.percent_change_12h ||
              null,
            percent_change_30d:
              priceHistoryData.coinpaprika.data.quotes.USD.percent_change_30d ||
              null,
            percent_change_1y:
              priceHistoryData.coinpaprika.data.quotes.USD.percent_change_1y ||
              null,
            ath_price:
              priceHistoryData.coinpaprika.data.quotes.USD.ath_price || null,
            ath_date:
              priceHistoryData.coinpaprika.data.quotes.USD.ath_date || null,
            percent_from_ath:
              priceHistoryData.coinpaprika.data.quotes.USD
                .percent_from_price_ath || null,
            volume_24h_change:
              priceHistoryData.coinpaprika.data.quotes.USD
                .volume_24h_change_24h || null,
          }
        : undefined;

    const tokenData: ITokenData = {
      id: cryptoCoin._id.toString(),
      symbol: cryptoCoin.symbol,
      name: cryptoCoin.name,
      contractAddress:
        cryptoCoin.coinPaprikaData?.contract_address?.[0]?.address || null,
      network: cryptoCoin.coinPaprikaData?.contract_address?.[0]?.type,
      current_price_usd,
      price_change_24h,
      price_change_7d,
      market_cap,
      volume_24h,
      liquidity_usd: null, // TODO: отримати з DexScreener API (pair.liquidity.usd)
      holders: null, // TODO: отримати з blockchain explorer
      launch_date,
      is_meme:
        cryptoCoin.coinPaprikaData?.type === "token" &&
        (cryptoCoin.name.toLowerCase().includes("meme") ||
          cryptoCoin.symbol.toLowerCase().includes("meme")),
      verified_on_dexscreener: false, // TODO: перевірити через DexScreener API
      coingecko_rank: cryptoCoin.coinGeckoData?.market_cap_rank || null,
      paprika_rank: cryptoCoin.coinPaprikaData?.rank || null,
      price_sources: priceSources,
      price_history: priceHistory,
      paprika_stats: paprikaStats,
    };

    // TODO: Отримати дані користувача з БД (user_position: has_token, token_amount, token_buy_price)
    // TODO: Для тестування дані користувача передаються як null - AI сам згенерує моковані значення

    // TODO: Замінити моковані дані на реальні з API
    const marketData: IMarketData = {
      btc_price_usd: 95000, // TODO: отримати з CoinGecko/Binance
      btc_change_24h: 2.5, // TODO: отримати з CoinGecko/Binance
      eth_price_usd: 3500, // TODO: отримати з CoinGecko/Binance
      eth_change_24h: 1.8, // TODO: отримати з CoinGecko/Binance
      total_market_cap_usd: 2500000000000, // TODO: отримати з CoinGecko global API
      total_volume_24h_usd: 85000000000, // TODO: отримати з CoinGecko global API
      btc_dominance_percent: 48.5, // TODO: отримати з CoinGecko global API
      fear_greed_index: 65, // TODO: отримати з Fear & Greed Index API
      global_news_sentiment: "neutral", // TODO: інтегрувати sentiment analysis API
      political_risk_level: "medium", // TODO: визначити логіку оцінки ризиків
      meme_market_trend: "stable", // TODO: аналізувати тренди мем-токенів
      altcoin_trend: "neutral", // TODO: аналізувати загальний тренд альткоїнів
      correlation_with_btc: 0.75, // TODO: розрахувати кореляцію з BTC
      active_blockchains: ["Ethereum", "BSC", "Solana"], // TODO: визначити активні блокчейни
      top_gainers: ["SOL", "AVAX", "MATIC"], // TODO: отримати з CoinGecko
      top_losers: ["ADA", "DOT", "LINK"], // TODO: отримати з CoinGecko
    };

    const prediction = await generatePrediction({
      tokenData,
      marketData,
      language,
    });

    const responseData: TPredictionResponse = {
      success: true,
      data: prediction,
    };

    const responseValidation = predictionResponseSchema.safeParse(responseData);
    if (!responseValidation.success) {
      console.warn("❌ Response validation failed:", responseValidation.error);
      const errorResponse: TServerError = {
        message: "Invalid response format",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    return res.status(200).json(responseValidation.data);
  } catch (error) {
    console.warn("Generate prediction error:", error);
    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

export default router;
