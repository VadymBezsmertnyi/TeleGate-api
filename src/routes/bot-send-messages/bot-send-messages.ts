import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import { sendMessageSchema } from "./bot-send-messages.schemas";
import { validateTelegramToken } from "../../helpers/telegram.helper";
import { sendMessageToUser } from "./bot-send-messages.helper";

dotenv.config();
const router = Router();

router.post("/send-message", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res
        .status(401)
        .json({ error: "Missing or invalid authorization header" });

    const token = authHeader.substring(7);
    if (!token) return res.status(401).json({ error: "Missing token" });

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken)
      return res.status(500).json({ error: "Bot token not configured" });

    const telegramValidation = await validateTelegramToken(token, botToken);
    if (!telegramValidation.isValid || !telegramValidation.userData)
      return res.status(401).json({ error: "Invalid or expired token" });

    // Валідація вхідних даних
    const validationResult = sendMessageSchema.safeParse(req.body);
    if (!validationResult.success)
      return res.status(400).json({
        error: "Invalid request data",
        details: validationResult.error,
      });

    const { userId, groupId, message } = validationResult.data;

    // Відправка повідомлення
    const result = await sendMessageToUser(userId, groupId, message, botToken);

    if (result.success)
      return res.json({
        success: true,
        message: "Message sent successfully",
        data: result.data,
      });
    else
      return res.status(400).json({
        success: false,
        error: result.error,
      });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
