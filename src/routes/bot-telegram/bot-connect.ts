import { Router, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();
const router = Router();

router.get("/connect", async (req: Request, res: Response) => {
  try {
    const { session_id } = req.query;
    if (!session_id) {
      res.status(400).json({ error: "Session ID is required" });
      return;
    }

    res.json({
      success: true,
      message: "Bot connection initiated",
      session_id: session_id,
    });
  } catch (error) {
    console.error("Error in bot connect route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
