import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import { sendMessageSchema } from "./bot-send-messages.schemas";
import { sendMessageToUser } from "./bot-send-messages.helper";
import { getAuthenticatedUser } from "../groups/groups.helper";

dotenv.config();
const router = Router();

router.post("/send-message", async (req: Request, res: Response) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user)
      return res.status(401).json({ error: "Authentication required" });

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken)
      return res.status(500).json({ error: "Bot token not configured" });

    // Валідація вхідних даних
    const validationResult = sendMessageSchema.safeParse(req.body);
    if (!validationResult.success)
      return res.status(400).json({
        error: "Invalid request data",
        details: validationResult.error,
      });

    const { userId, groupId, message } = validationResult.data;
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
