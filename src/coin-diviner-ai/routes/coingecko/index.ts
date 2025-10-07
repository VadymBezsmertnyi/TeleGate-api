import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import CoinGeckoService from "../../hooks/coingecko";
import "./coingecko.swagger";

dotenv.config();
const router = Router();

router.get("/ping", async (req: Request, res: Response) => {
  try {
    const pingResponse = await CoinGeckoService.ping();
    return res.status(200).json(pingResponse);
  } catch (error) {
    return res.status(500).json({ message: "Server error: " + error });
  }
});

router.get("/coins-list", async (req: Request, res: Response) => {
  try {
    const coinsList = await CoinGeckoService.getCoinsList();
    return res.status(200).json(coinsList);
  } catch (error) {
    return res.status(500).json({ message: "Server error: " + error });
  }
});

router.get(
  "/markets",
  async (
    req: Request<
      {},
      {},
      {},
      { vs_currency?: string; per_page?: string; page?: string }
    >,
    res: Response
  ) => {
    const { vs_currency = "usd", per_page = "100", page = "1" } = req.query;
    try {
      const markets = await CoinGeckoService.getMarkets(
        vs_currency,
        parseInt(per_page),
        parseInt(page)
      );
      return res.status(200).json(markets);
    } catch (error) {
      return res.status(500).json({ message: "Server error: " + error });
    }
  }
);

router.get("/coin/:id", async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  try {
    const coinData = await CoinGeckoService.getCoinData(id);
    return res.status(200).json(coinData);
  } catch (error) {
    return res.status(500).json({ message: "Server error: " + error });
  }
});

router.get(
  "/simple/price",
  async (
    req: Request<{}, {}, {}, { ids: string; vs_currencies?: string }>,
    res: Response
  ) => {
    const { ids, vs_currencies = "usd" } = req.query;
    if (!ids) {
      return res
        .status(400)
        .json({ message: "Bad request: 'ids' query parameter is required" });
    }

    const idsArray = ids.split(",").map((id) => id.trim().toLowerCase());

    try {
      const priceData = await CoinGeckoService.getSimplePrice(
        idsArray,
        vs_currencies
      );
      return res.status(200).json(priceData);
    } catch (error) {
      return res.status(500).json({ message: "Server error: " + error });
    }
  }
);

router.get(
  "/search",
  async (req: Request<{}, {}, {}, { query: string }>, res: Response) => {
    const { query } = req.query;
    if (!query) {
      return res
        .status(400)
        .json({ message: "Bad request: 'query' parameter is required" });
    }

    try {
      const searchResults = await CoinGeckoService.search(query);
      return res.status(200).json(searchResults);
    } catch (error) {
      return res.status(500).json({ message: "Server error: " + error });
    }
  }
);

export default router;
