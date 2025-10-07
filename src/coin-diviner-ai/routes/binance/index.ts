import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import { CandleChartInterval_LT } from "binance-api-node";
import BinanceService from "../../hooks/binance";

dotenv.config();
const router = Router();

router.get(
  "/price",
  async (req: Request<{}, {}, {}, { symbol: string }>, res: Response) => {
    const symbol = req.query.symbol || "BTCUSDT";
    try {
      const priceData = await BinanceService.getPrice(symbol);
      res.json(priceData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch price data" });
    }
  }
);

router.get(
  "/24h-stats",
  async (req: Request<{}, {}, {}, { symbol: string }>, res: Response) => {
    const symbol = req.query.symbol || "BTCUSDT";
    try {
      const statsData = await BinanceService.get24hStats(symbol);
      res.json(statsData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch 24h stats data" });
    }
  }
);

router.get(
  "/klines",
  async (
    req: Request<
      {},
      {},
      {},
      { symbol: string; interval?: CandleChartInterval_LT }
    >,
    res: Response
  ) => {
    const { symbol = "BTCUSDT", interval = "1d" } = req.query;

    try {
      const klinesData = await BinanceService.getKlines(symbol, interval);
      res.json(klinesData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch klines data" });
    }
  }
);

router.get("/exchange-info", async (req: Request, res: Response) => {
  try {
    const exchangeInfo = await BinanceService.getExchangeInfo();
    res.json(exchangeInfo);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch exchange info" });
  }
});

export default router;
