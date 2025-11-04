import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import "./cheats.swagger";
import { getNewPumpTokens } from "../../hooks/cheats";

dotenv.config();
const router = Router();

router.get("/test", async (req: Request, res: Response) => {
  try {
    await getNewPumpTokens();
    return res.json({ message: "Cheats route is working!" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to process request" });
  }
});

export default router;
