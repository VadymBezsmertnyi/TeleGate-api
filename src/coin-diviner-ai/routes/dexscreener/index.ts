import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import DexScreenerService from "../../hooks/dexscreener";
import "./dexscreener.swagger";

dotenv.config();
const router = Router();

router.get(
  "/pairs-by-token",
  async (
    req: Request<{}, {}, {}, { chain: string; address: string }>,
    res: Response
  ) => {
    const { chain, address } = req.query;
    if (!chain || !address)
      return res
        .status(400)
        .json({ error: "Missing chain or address parameter" });

    try {
      const pairs = await DexScreenerService.getPairsByToken(address, chain);
      return res.json(pairs);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch pairs by token" });
    }
  }
);

router.get(
  "/pair",
  async (
    req: Request<{}, {}, {}, { chain: string; pairAddress: string }>,
    res: Response
  ) => {
    const { chain, pairAddress } = req.query;
    if (!chain || !pairAddress)
      return res
        .status(400)
        .json({ error: "Missing chain or pairAddress parameter" });

    try {
      const pair = await DexScreenerService.getPair(chain, pairAddress);
      return res.json(pair);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch pair data" });
    }
  }
);

router.get(
  "/search",
  async (req: Request<{}, {}, {}, { q: string }>, res: Response) => {
    const { q } = req.query;
    if (!q)
      return res.status(400).json({ error: "Missing search query parameter" });

    try {
      const results = await DexScreenerService.search(q);
      return res.json(results);
    } catch (error) {
      return res.status(500).json({ error: "Failed to perform search" });
    }
  }
);

export default router;
