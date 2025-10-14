import { Router, Request, Response } from "express";
import dotenv from "dotenv";

// schemas
import {
  predictionQueryParamsSchema,
  predictionResponseSchema,
  predictionsListResponseSchema,
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
  TPredictionsListResponse,
} from "./aiPrediction.types";
import type { ITokenData } from "../../hooks/openAi/aiPrediction.types";
import {
  TNotFoundError,
  TServerError,
  TValidationError,
} from "../aggregator/aggregator.types";

// models
import CryptoCoinModel from "../aggregator/aggregator.model";
import PredictionModel from "./aiPrediction.model";
import AuthModel from "../auth/auth.model";

// hooks
import AggregatorService from "../../hooks/aggregator";
import DexScreenerService from "../../hooks/dexscreener";
import { generatePrediction } from "../../hooks/openAi";
import { checkAuth } from "../../hooks/auth";

// swagger
import "./aiPrediction.swagger";

dotenv.config();
const router = Router();

router.get("/generate", async (req: Request, res: Response) => {
  let predictionId: string | null = null;

  try {
    const decoded = checkAuth(req);
    if ("message" in decoded) return res.status(401).json(decoded);

    const user = await AuthModel.findById(decoded.userId);
    if (!user) {
      const errorResponse: TNotFoundError = {
        message: "User not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

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

    const newPrediction = await PredictionModel.create({
      userId: user._id,
      coinId: cryptoCoin._id,
      language: language || "uk",
      status: "creating",
    });

    predictionId = newPrediction._id.toString();

    await PredictionModel.findByIdAndUpdate(predictionId, {
      status: "fetching_data",
    });

    const [allPrices, priceHistoryData] = await Promise.all([
      AggregatorService.getAllPrices(coinId),
      AggregatorService.getAllPriceHistory(coinId, "7d"),
    ]);

    let liquidity_usd: number | null = null;
    let verified_on_dexscreener = false;

    const contractAddress =
      cryptoCoin.coinPaprikaData?.contract_address?.[0]?.address;
    if (contractAddress || cryptoCoin.symbol) {
      try {
        const dexResult = await DexScreenerService.search(
          contractAddress || cryptoCoin.symbol
        );
        if (dexResult && dexResult.pairs && dexResult.pairs.length > 0) {
          const pair = dexResult.pairs[0];
          liquidity_usd = pair.liquidity?.usd || null;
          verified_on_dexscreener = true;
        }
      } catch (error) {
        console.warn("DexScreener liquidity fetch error:", error);
      }
    }

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
      liquidity_usd,
      launch_date,
      is_meme:
        cryptoCoin.coinPaprikaData?.type === "token" &&
        (cryptoCoin.name.toLowerCase().includes("meme") ||
          cryptoCoin.symbol.toLowerCase().includes("meme")),
      verified_on_dexscreener,
      coingecko_rank: cryptoCoin.coinGeckoData?.market_cap_rank || null,
      paprika_rank: cryptoCoin.coinPaprikaData?.rank || null,
      price_sources: priceSources,
      price_history: priceHistory,
      paprika_stats: paprikaStats,
    };

    await PredictionModel.findByIdAndUpdate(predictionId, {
      status: "generating",
      tokenData,
    });

    const prediction = await generatePrediction({
      tokenData,
      language: language || "uk",
    });
    const updatedPrediction = await PredictionModel.findByIdAndUpdate(
      predictionId,
      {
        status: "completed",
        prediction,
      },
      { new: true }
    );
    if (!updatedPrediction) {
      const errorResponse: TServerError = {
        message: "Failed to save prediction",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    const responseData: TPredictionResponse = {
      success: true,
      data: {
        ...updatedPrediction,
        _id: updatedPrediction._id.toString(),
        createdAt: updatedPrediction.createdAt.toISOString(),
        updatedAt: updatedPrediction.updatedAt.toISOString(),
        userId: updatedPrediction.userId.toString(),
        coinId: updatedPrediction.coinId.toString(),
      },
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

    if (predictionId)
      await PredictionModel.findByIdAndUpdate(predictionId, {
        status: "error",
        error: String(error),
      });

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.get("/list", async (req: Request, res: Response) => {
  try {
    const decoded = checkAuth(req);
    if ("message" in decoded) return res.status(401).json(decoded);

    const user = await AuthModel.findById(decoded.userId);
    if (!user) {
      const errorResponse: TNotFoundError = {
        message: "User not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const predictions = await PredictionModel.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    const responseData: TPredictionsListResponse = {
      success: true,
      data: predictions.map((prediction) => ({
        ...prediction,
        _id: prediction._id.toString(),
        userId: prediction.userId.toString(),
        coinId: prediction.coinId.toString(),
        createdAt: prediction.createdAt.toISOString(),
        updatedAt: prediction.updatedAt.toISOString(),
      })),
    };

    const responseValidation =
      predictionsListResponseSchema.safeParse(responseData);
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
    console.warn("Get predictions list error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.get("/by-id/:predictionId", async (req: Request, res: Response) => {
  try {
    const decoded = checkAuth(req);
    if ("message" in decoded) return res.status(401).json(decoded);

    const user = await AuthModel.findById(decoded.userId);
    if (!user) {
      const errorResponse: TNotFoundError = {
        message: "User not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const { predictionId } = req.params;
    if (!predictionId) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: [
          {
            code: "invalid_type",
            message: "predictionId is required",
            path: ["predictionId"],
          },
        ],
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const prediction = await PredictionModel.findOne({
      _id: predictionId,
      userId: user._id,
    }).lean();

    if (!prediction) {
      const errorResponse: TNotFoundError = {
        message: "Prediction not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const responseData: TPredictionResponse = {
      success: true,
      data: {
        ...prediction,
        _id: prediction._id.toString(),
        userId: prediction.userId.toString(),
        coinId: prediction.coinId.toString(),
        createdAt: prediction.createdAt.toISOString(),
        updatedAt: prediction.updatedAt.toISOString(),
      },
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
    console.warn("Get prediction by id error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

export default router;
