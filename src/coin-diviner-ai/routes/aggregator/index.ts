import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import AggregatorService from "../../hooks/aggregator";
import {
  searchQueryParamsSchema,
  priceQueryParamsSchema,
  priceHistoryQueryParamsSchema,
  allPricesQueryParamsSchema,
  allPriceHistoryQueryParamsSchema,
  searchResponseSchema,
  priceResponseSchema,
  priceHistoryResponseSchema,
  allPricesResponseSchema,
  allPriceHistoryResponseSchema,
  validationErrorSchema,
  notFoundErrorSchema,
  serverErrorSchema,
} from "./aggregator.schemas";
import type {
  TSearchQueryParams,
  TPriceQueryParams,
  TPriceHistoryQueryParams,
  TAllPricesQueryParams,
  TAllPriceHistoryQueryParams,
  TSearchResponse,
  TPriceResponse,
  TPriceHistoryResponse,
  TAllPricesResponse,
  TAllPriceHistoryResponse,
  TValidationError,
  TNotFoundError,
  TServerError,
} from "./aggregator.types";
import "./aggregator.swagger";

dotenv.config();
const router = Router();

router.get("/search", async (req: Request, res: Response) => {
  try {
    const validationResult = searchQueryParamsSchema.safeParse(req.query);
    if (!validationResult.success) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: validationResult.error.issues,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const { query }: TSearchQueryParams = validationResult.data;
    const searchResults: TSearchResponse = await AggregatorService.searchCoins(
      query
    );

    const responseValidation = searchResponseSchema.safeParse(searchResults);
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
    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.get("/price", async (req: Request, res: Response) => {
  try {
    const validationResult = priceQueryParamsSchema.safeParse(req.query);
    if (!validationResult.success) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: validationResult.error.issues,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const { coinId }: TPriceQueryParams = validationResult.data;
    const priceData: TPriceResponse | null = await AggregatorService.getPrice(
      coinId
    );

    if (!priceData) {
      const errorResponse: TNotFoundError = {
        message: "Price data not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const responseValidation = priceResponseSchema.safeParse(priceData);
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
    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.get("/price-history", async (req: Request, res: Response) => {
  try {
    const validationResult = priceHistoryQueryParamsSchema.safeParse(req.query);
    if (!validationResult.success) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: validationResult.error.issues,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const { coinId, range }: TPriceHistoryQueryParams = validationResult.data;
    const historyData: TPriceHistoryResponse | null =
      await AggregatorService.getPriceHistory(coinId, range);

    if (!historyData) {
      const errorResponse: TNotFoundError = {
        message: "Price history not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const responseValidation =
      priceHistoryResponseSchema.safeParse(historyData);
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
    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.get("/all-prices", async (req: Request, res: Response) => {
  try {
    const validationResult = allPricesQueryParamsSchema.safeParse(req.query);
    if (!validationResult.success) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: validationResult.error.issues,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const { coinId }: TAllPricesQueryParams = validationResult.data;
    const allPrices: TAllPricesResponse = await AggregatorService.getAllPrices(
      coinId
    );

    const responseValidation = allPricesResponseSchema.safeParse(allPrices);
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
    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.get("/all-price-history", async (req: Request, res: Response) => {
  try {
    const validationResult = allPriceHistoryQueryParamsSchema.safeParse(
      req.query
    );
    if (!validationResult.success) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: validationResult.error.issues,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const { coinId, range }: TAllPriceHistoryQueryParams =
      validationResult.data;
    const historyData: TAllPriceHistoryResponse =
      await AggregatorService.getAllPriceHistory(coinId, range);

    const responseValidation =
      allPriceHistoryResponseSchema.safeParse(historyData);
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
    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

export default router;
