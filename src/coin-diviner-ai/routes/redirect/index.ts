import { Router, Request, Response } from "express";

const router = Router();

router.get("/coin-diviner-ai", (req: Request, res: Response) => {
  res.redirect("coindivinerai://");
});

router.get("/binance", (req: Request, res: Response) => {
  res.redirect("binance://");
});

router.get("/coin-diviner-ai/coin/:coinId", (req: Request, res: Response) => {
  const { coinId } = req.params;
  res.redirect(`coindivinerai://coin/${coinId}`);
});

router.get("/binance/trade/:symbol", (req: Request, res: Response) => {
  const { symbol } = req.params;
  res.redirect(`binance://app/trade/${symbol}_USDT`);
});

export default router;
