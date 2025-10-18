import { Telegraf } from "telegraf";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";

export const sendMessageToChatId = async (
  chatIdWithUser: string,
  message: string,
  inlineKeyboard?: InlineKeyboardButton[][]
) => {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN_COIN_DIVINER_AI || "";
    const bot = new Telegraf(botToken);
    const options: ExtraReplyMessage = {};
    if (inlineKeyboard)
      options.reply_markup = {
        inline_keyboard: inlineKeyboard,
      };

    await bot.telegram.sendMessage(chatIdWithUser, message, options);
    return true;
  } catch (error) {
    if (error instanceof Error)
      console.warn("Error sending message via Telegram:", error.message);
    else console.warn("Error sending message via Telegram:", error);
    return null;
  }
};
