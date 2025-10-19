import { Router, Request, Response } from "express";
import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import {
  setWebhookSchema,
  telegramWebhookUpdateSchema,
} from "./telegram.schemas";
import {
  returnTelegramError,
  updateTelegramUserData,
} from "./telegram.helpers";
import { TelegramErrorCode } from "./telegram.types";
import NotificationSettingsModel from "../notification/notification.model";
import { checkAuth } from "../../hooks/auth";
import "./telegram.swagger";

dotenv.config();
const router = Router();

const botToken = process.env.TELEGRAM_BOT_TOKEN_COIN_DIVINER_AI || "";
export const botTelegramCoinDivinerAI = new Telegraf(botToken);
const bot = botTelegramCoinDivinerAI;

bot.command("start", async (ctx) => {
  try {
    const webhookData = {
      message: {
        from: ctx.from,
        chat: ctx.chat,
      },
    };

    const updateResult = await updateTelegramUserData(webhookData);
    if (updateResult.success)
      await ctx.reply(
        `Вітаємо в Coin Diviner AI! 🚀\n\nВаш Telegram успішно підключено до боту.`
      );
    else
      await ctx.reply(
        `Помилка підключення ❌\n\nСпочатку додайте свій username в налаштуваннях додатку Coin Diviner AI.`
      );
  } catch (error) {
    console.warn("Помилка обробки команди /start:", error);
    await ctx.reply(
      `Виникла помилка ⚠️\n\nСпробуйте пізніше або зверніться до підтримки.`
    );
  }
});

router.post("/webhook", async (req: Request, res: Response) => {
  try {
    if (!botToken)
      return returnTelegramError(
        res,
        500,
        "Bot token is missing",
        TelegramErrorCode.BOT_TOKEN_MISSING
      );

    const validationResult = telegramWebhookUpdateSchema.safeParse(req.body);
    if (!validationResult.success)
      return returnTelegramError(
        res,
        400,
        "Validation error",
        TelegramErrorCode.VALIDATION_ERROR,
        validationResult.error.issues
      );

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
    if (!botToken)
      return returnTelegramError(
        res,
        500,
        "Bot token is missing",
        TelegramErrorCode.BOT_TOKEN_MISSING
      );

    const validationResult = setWebhookSchema.safeParse(req.body);
    if (!validationResult.success)
      return returnTelegramError(
        res,
        400,
        "Validation error",
        TelegramErrorCode.VALIDATION_ERROR,
        validationResult.error.issues
      );

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

router.get("/check-connection", async (req: Request, res: Response) => {
  try {
    const decoded = checkAuth(req);
    if ("message" in decoded) return res.status(401).json(decoded);

    const notificationSettings = await NotificationSettingsModel.findOne({
      userId: decoded.userId,
    });
    if (!notificationSettings)
      return res.status(200).json({
        connected: false,
        message: "Notification settings not found",
      });

    const isConnected =
      notificationSettings.telegram &&
      !!notificationSettings.telegram.chatId &&
      !!notificationSettings.telegram.username;

    return res.status(200).json({
      connected: isConnected,
      telegram: notificationSettings.telegram || null,
    });
  } catch (error) {
    console.warn("Check connection error:", error);
    return returnTelegramError(
      res,
      500,
      "Server error",
      TelegramErrorCode.SERVER_ERROR
    );
  }
});

export default router;
