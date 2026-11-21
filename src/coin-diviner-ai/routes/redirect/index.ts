import { Router, Request, Response } from "express";

const router = Router();

router.get("/coin-diviner-ai", (req: Request, res: Response) => {
  res.redirect("coindivinerai://");
});

router.get("/binance", (req: Request, res: Response) => {
  res.redirect("bnc://app.binance.com");
});

export default router;
