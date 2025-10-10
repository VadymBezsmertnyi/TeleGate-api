import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import AggregatorService from "../../hooks/aggregator";
import {
  searchQueryParamsSchema,
  priceQueryParamsSchema,
  priceHistoryQueryParamsSchema,
} from "./aggregator.schemas";
import "./aggregator.swagger";

dotenv.config();
const router = Router();

router.get("/search", async (req: Request, res: Response) => {
  try {
    const validationResult = searchQueryParamsSchema.safeParse(req.query);
    if (!validationResult.success)
      return res.status(400).json({
        message: "Validation error",
        errors: validationResult.error.issues,
      });

    const { query } = validationResult.data;
    const searchResults = await AggregatorService.searchCoins(query);
    return res.status(200).json(searchResults);
  } catch (error) {
    return res.status(500).json({ message: "Server error: " + error });
  }
});

router.get("/price", async (req: Request, res: Response) => {
  try {
    const validationResult = priceQueryParamsSchema.safeParse(req.query);
    if (!validationResult.success)
      return res.status(400).json({
        message: "Validation error",
        errors: validationResult.error.issues,
      });

    const { symbol } = validationResult.data;
    const priceData = await AggregatorService.getPrice(symbol);
    if (!priceData)
      return res.status(404).json({ message: "Price data not found" });

    return res.status(200).json(priceData);
  } catch (error) {
    return res.status(500).json({ message: "Server error: " + error });
  }
});

router.get("/price-history", async (req: Request, res: Response) => {
  try {
    const validationResult = priceHistoryQueryParamsSchema.safeParse(req.query);
    if (!validationResult.success)
      return res.status(400).json({
        message: "Validation error",
        errors: validationResult.error.issues,
      });

    const { id, range } = validationResult.data;
    const historyData = await AggregatorService.getPriceHistory(id, range);
    if (!historyData)
      return res.status(404).json({ message: "Price history not found" });

    return res.status(200).json(historyData);
  } catch (error) {
    return res.status(500).json({ message: "Server error: " + error });
  }
});

export default router;
