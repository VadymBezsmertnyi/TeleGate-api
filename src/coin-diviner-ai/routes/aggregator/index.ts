import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import AggregatorService from "../../hooks/aggregator";
import "./aggregator.swagger";

dotenv.config();
const router = Router();

router.get(
  "/search",
  async (req: Request<{}, {}, {}, { query: string }>, res: Response) => {
    const { query } = req.query;
    if (!query)
      return res
        .status(400)
        .json({ message: "Bad request: 'query' parameter is required" });

    try {
      const searchResults = await AggregatorService.searchCoins(query);
      return res.status(200).json(searchResults);
    } catch (error) {
      return res.status(500).json({ message: "Server error: " + error });
    }
  }
);

router.get(
  "/price",
  async (req: Request<{}, {}, {}, { symbol: string }>, res: Response) => {
    const { symbol } = req.query;
    if (!symbol)
      return res
        .status(400)
        .json({ message: "Bad request: 'symbol' parameter is required" });

    try {
      const priceData = await AggregatorService.getPrice(symbol);
      if (!priceData)
        return res.status(404).json({ message: "Price data not found" });

      return res.status(200).json(priceData);
    } catch (error) {
      return res.status(500).json({ message: "Server error: " + error });
    }
  }
);

router.get(
  "/price-history",
  async (
    req: Request<
      {},
      {},
      {},
      { id: string; range?: "1h" | "1d" | "7d" | "30d" }
    >,
    res: Response
  ) => {
    const { id, range = "7d" } = req.query;
    if (!id)
      return res
        .status(400)
        .json({ message: "Bad request: 'id' parameter is required" });

    try {
      const historyData = await AggregatorService.getPriceHistory(id, range);
      if (!historyData)
        return res.status(404).json({ message: "Price history not found" });

      return res.status(200).json(historyData);
    } catch (error) {
      return res.status(500).json({ message: "Server error: " + error });
    }
  }
);

export default router;
