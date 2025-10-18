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
import { TelegramErrorCode, TelegramWebhookUpdate } from "./telegram.types";
import NotificationSettingsModel from "../notification/notification.model";
import { checkAuth } from "../../hooks/auth";
import "./telegram.swagger";

dotenv.config();
const router = Router();

const botToken = process.env.TELEGRAM_BOT_TOKEN_COIN_DIVINER_AI || "";
const bot = new Telegraf(botToken);

bot.command("start", async (ctx) => {
  console.warn("Команда /start від користувача:", {
    userId: ctx.from?.id,
    username: ctx.from?.username,
    firstName: ctx.from?.first_name,
    chatId: ctx.chat?.id,
  });

  try {
    const webhookData = {
      message: {
        from: ctx.from,
        chat: ctx.chat,
      },
    };

    const updateResult = await updateTelegramUserData(webhookData as any);
    if (updateResult.success) {
      await ctx.reply(
        `Вітаємо в Coin Diviner AI! 🚀\n\nВаш Telegram успішно підключено до боту.`
      );
      console.warn(
        "Telegram user успішно оновлено та повідомлення відправлено:",
        {
          userId: updateResult.userId,
        }
      );
    } else {
      await ctx.reply(
        `Помилка підключення ❌\n\nСпочатку додайте свій username в налаштуваннях додатку Coin Diviner AI.`
      );
      console.warn("Не вдалося оновити Telegram user:", updateResult.message);
    }
  } catch (error) {
    console.warn("Помилка обробки команди /start:", error);
    await ctx.reply(
      `Виникла помилка ⚠️\n\nСпробуйте пізніше або зверніться до підтримки.`
    );
  }
});

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
  console.warn("=== CALLBACK_QUERY EVENT TRIGGERED ===");

  const callbackData =
    "data" in ctx.callbackQuery ? ctx.callbackQuery.data : undefined;

  console.warn("Отримано callback query від Telegram:", {
    callbackId: ctx.callbackQuery.id,
    userId: ctx.from?.id,
    username: ctx.from?.username,
    data: callbackData,
    messageId: ctx.callbackQuery.message?.message_id,
    chatId: ctx.chat?.id,
  });

  try {
    if (callbackData === "close_menu") {
      console.warn("Processing close_menu callback...");

      await ctx.answerCbQuery("Меню закрито");
      console.warn("Answer callback query sent");

      const editResult = await ctx.editMessageReplyMarkup({
        inline_keyboard: [],
      });
      console.warn("Menu edited successfully:", editResult);
      return;
    }

    console.warn("Unknown callback_data, closing menu anyway");
    await ctx.answerCbQuery();
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
  } catch (error) {
    console.warn("Error handling callback query:", error);
    try {
      await ctx.answerCbQuery("Виникла помилка ⚠️");
    } catch (e) {
      console.warn("Failed to answer callback query:", e);
    }
  }
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

router.get("/check-connection", async (req: Request, res: Response) => {
  try {
    const decoded = checkAuth(req);
    if ("message" in decoded) return res.status(401).json(decoded);

    const notificationSettings = await NotificationSettingsModel.findOne({
      userId: decoded.userId,
    });

    if (!notificationSettings) {
      return res.status(200).json({
        connected: false,
        message: "Notification settings not found",
      });
    }

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
