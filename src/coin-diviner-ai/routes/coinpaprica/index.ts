import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import { CoinPaprikaService } from "../../hooks/coinpaprika";
import "./coinpaprika.swagger";

dotenv.config();
const router = Router();

router.get("/platforms", async (req: Request, res: Response) => {
  try {
    const platforms = await CoinPaprikaService.getPlatforms();
    return res.status(200).json(platforms);
  } catch (error) {
    return res.status(500).json({ message: "Server error: " + error });
  }
});

router.get("/coins", async (req: Request, res: Response) => {
  const { platform_id } = req.query;
  try {
    const coins = await CoinPaprikaService.getAllCoins(
      platform_id as string | undefined
    );
    return res.status(200).json(coins);
  } catch (error) {
    return res.status(500).json({ message: "Server error: " + error });
  }
});

router.get("/coins/:coinId", async (req: Request, res: Response) => {
  const { coinId } = req.params;
  try {
    const coinInfo = await CoinPaprikaService.getCoinInfo(coinId);
    if (!coinInfo) {
      return res.status(404).json({ message: "Coin not found" });
    }
    return res.status(200).json(coinInfo);
  } catch (error) {
    return res.status(500).json({ message: "Server error: " + error });
  }
});

router.get("/tickers/:coinId", async (req: Request, res: Response) => {
  const { coinId } = req.params;
  try {
    const ticker = await CoinPaprikaService.getTicker(coinId);
    if (!ticker) {
      return res.status(404).json({ message: "Ticker not found" });
    }
    return res.status(200).json(ticker);
  } catch (error) {
    return res.status(500).json({ message: "Server error: " + error });
  }
});

export default router;
