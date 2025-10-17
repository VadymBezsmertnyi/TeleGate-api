import { Router, Request, Response } from "express";
import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import {
  setWebhookSchema,
  telegramWebhookUpdateSchema,
} from "./telegram.schemas";
import { returnTelegramError } from "./telegram.helpers";
import { TelegramErrorCode, TelegramWebhookUpdate } from "./telegram.types";
import "./telegram.swagger";

dotenv.config();
const router = Router();

const botToken = process.env.TELEGRAM_BOT_TOKEN_COIN_DIVINER_AI || "";
const bot = new Telegraf(botToken);

bot.on("message", async (ctx) => {
  console.warn("Отримано повідомлення від Telegram:", {
    userId: ctx.from?.id,
    username: ctx.from?.username,
    firstName: ctx.from?.first_name,
    chatId: ctx.chat?.id,
    chatType: ctx.chat?.type,
    text: "text" in ctx.message ? ctx.message.text : undefined,
    messageId: ctx.message?.message_id,
  });
});

bot.on("callback_query", async (ctx) => {
  console.warn("Отримано callback query від Telegram:", {
    callbackId: ctx.callbackQuery.id,
    userId: ctx.from?.id,
    username: ctx.from?.username,
    data: "data" in ctx.callbackQuery ? ctx.callbackQuery.data : undefined,
  });
});

router.post("/webhook", async (req: Request, res: Response) => {
  try {
    if (!botToken) {
      return returnTelegramError(
        res,
        500,
        "Bot token is missing",
        TelegramErrorCode.BOT_TOKEN_MISSING
      );
    }

    const validationResult = telegramWebhookUpdateSchema.safeParse(req.body);
    if (!validationResult.success) {
      console.warn("Webhook validation error:", validationResult.error.issues);
      return returnTelegramError(
        res,
        400,
        "Validation error",
        TelegramErrorCode.VALIDATION_ERROR,
        validationResult.error.issues
      );
    }

    const webhookData: TelegramWebhookUpdate = validationResult.data;

    console.warn("Telegram webhook отримано:", {
      updateId: webhookData.update_id,
      hasMessage: !!webhookData.message,
      hasCallbackQuery: !!webhookData.callback_query,
      messageText: webhookData.message?.text,
      chatId: webhookData.message?.chat?.id,
      userId:
        webhookData.message?.from?.id || webhookData.callback_query?.from?.id,
      callbackData: webhookData.callback_query?.data,
    });

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
