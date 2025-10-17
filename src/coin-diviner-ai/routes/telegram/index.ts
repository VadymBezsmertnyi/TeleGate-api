import { Router, Request, Response } from "express";
import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import { setWebhookSchema } from "./telegram.schemas";
import { returnTelegramError } from "./telegram.helpers";
import { TelegramErrorCode } from "./telegram.types";
import "./telegram.swagger";

dotenv.config();
const router = Router();

const botToken = process.env.TELEGRAM_BOT_TOKEN_COIN_DIVINER_AI || "";
const bot = new Telegraf(botToken);

bot.on("message", async (ctx) => {
  console.warn("Отримано повідомлення від Telegram:", {
    from: ctx.from,
    chat: ctx.chat,
    message: ctx.message,
  });
});

router.post("/webhook", async (req: Request, res: Response) => {
  try {
    console.warn("Webhook викликано:", req.body);

    if (!botToken) {
      return returnTelegramError(
        res,
        500,
        "Bot token is missing",
        TelegramErrorCode.BOT_TOKEN_MISSING
      );
    }

    await bot.handleUpdate(req.body);
    return res.status(200).json({ message: "Webhook received" });
  } catch (error) {
    console.warn("Telegram webhook error:", error);
    return returnTelegramError(
      res,
      500,
      "Server error",
      TelegramErrorCode.SERVER_ERROR
    );
  }
});

router.post("/set-webhook", async (req: Request, res: Response) => {
  try {
    if (!botToken) {
      return returnTelegramError(
        res,
        500,
        "Bot token is missing",
        TelegramErrorCode.BOT_TOKEN_MISSING
      );
    }

    const validationResult = setWebhookSchema.safeParse(req.body);
    if (!validationResult.success) {
      return returnTelegramError(
        res,
        400,
        "Validation error",
        TelegramErrorCode.VALIDATION_ERROR,
        validationResult.error.issues
      );
    }

    const { webhookUrl } = validationResult.data;

    await bot.telegram.setWebhook(webhookUrl);

    return res.status(200).json({
      message: "Webhook встановлено успішно",
      webhookUrl,
    });
  } catch (error) {
    console.warn("Set webhook error:", error);
    return returnTelegramError(
      res,
      500,
      "Failed to set webhook",
      TelegramErrorCode.WEBHOOK_SETUP_FAILED,
      error instanceof Error ? error.message : error
    );
  }
});

export default router;
