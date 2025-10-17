import { Telegraf } from "telegraf";

export const sendMessageToChatId = async (
  chatIdWithUser: string,
  message: string
) => {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN_COIN_DIVINER_AI || "";
    const bot = new Telegraf(botToken);
    await bot.telegram.sendMessage(chatIdWithUser, message);
    return true;
  } catch (error) {
    if (error instanceof Error)
      console.warn("Error sending message via Telegram:", error.message);
    else console.warn("Error sending message via Telegram:", error);
    return null;
  }
};
