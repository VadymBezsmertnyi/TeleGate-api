import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import AggregatorService from "../../hooks/aggregator";
import {
  searchQueryParamsSchema,
  priceQueryParamsSchema,
  priceHistoryQueryParamsSchema,
} from "./aggregator.schemas";
import type {
  TSearchQueryParams,
  TPriceQueryParams,
  TPriceHistoryQueryParams,
  TSearchResponse,
  TPriceResponse,
  TPriceHistoryResponse,
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
      return res.status(400).json(errorResponse);
    }

    const { query }: TSearchQueryParams = validationResult.data;
    const searchResults: TSearchResponse = await AggregatorService.searchCoins(
      query
    );
    return res.status(200).json(searchResults);
  } catch (error) {
    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    return res.status(500).json(errorResponse);
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
      return res.status(400).json(errorResponse);
    }

    const { symbol }: TPriceQueryParams = validationResult.data;
    const priceData: TPriceResponse | null = await AggregatorService.getPrice(
      symbol
    );

    if (!priceData) {
      const errorResponse: TNotFoundError = {
        message: "Price data not found",
      };
      return res.status(404).json(errorResponse);
    }

    return res.status(200).json(priceData);
  } catch (error) {
    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    return res.status(500).json(errorResponse);
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
      return res.status(400).json(errorResponse);
    }

    const { id, range }: TPriceHistoryQueryParams = validationResult.data;
    const historyData: TPriceHistoryResponse | null =
      await AggregatorService.getPriceHistory(id, range);

    if (!historyData) {
      const errorResponse: TNotFoundError = {
        message: "Price history not found",
      };
      return res.status(404).json(errorResponse);
    }

    return res.status(200).json(historyData);
  } catch (error) {
    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    return res.status(500).json(errorResponse);
  }
});

export default router;
