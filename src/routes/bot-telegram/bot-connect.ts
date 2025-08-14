import { Router, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();
const router = Router();

router.get("/connect", async (req: Request, res: Response) => {
  console.log("=== BOT CONNECT ROUTE CALLED ===");
  console.log("Timestamp:", new Date().toISOString());

  try {
    const { session_id } = req.query;

    console.log("Processing bot connection for session:", session_id);
    console.log("Request headers:", JSON.stringify(req.headers));
    console.log("Request URL:", req.url);
    console.log("Request method:", req.method);

    if (!session_id) {
      console.log("No session_id provided");
      res.status(400).json({ error: "Session ID is required" });
      return;
    }

    // Тут можна додати логіку для збереження сесії та підключення бота
    // Наприклад, зберегти session_id в базі даних або кеші

    console.log("Session processed successfully:", session_id);

    // Повертаємо успішну відповідь
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
