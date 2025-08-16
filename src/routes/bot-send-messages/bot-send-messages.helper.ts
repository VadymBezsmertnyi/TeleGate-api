import { Telegraf } from "telegraf";
import MemberModel from "../members/member.model";
import { SendMessageResultI } from "./bot-send-messages.types";

export const sendMessageToUser = async (
  userId: string,
  message: string,
  botToken: string
): Promise<SendMessageResultI> => {
  try {
    const member = await MemberModel.findOne({ tgUserId: userId }).lean();
    if (!member)
      return {
        success: false,
        error: `User ${userId} not found in system`,
      };

    const bot = new Telegraf(botToken);
    const sentMessage = await bot.telegram.sendMessage(userId, message);
    return {
      success: true,
      data: {
        messageId: sentMessage.message_id,
        sentAt: new Date(),
      },
    };
  } catch (error) {
    console.error("Error in sendMessageToUser:", error);

    // Обробка специфічних помилок Telegram
    if (error instanceof Error) {
      if (error.message.includes("Forbidden")) {
        return {
          success: false,
          error: "User has blocked the bot or left the group",
        };
      }
      if (error.message.includes("Bad Request")) {
        return {
          success: false,
          error: "Invalid user ID or message format",
        };
      }
    }

    return {
      success: false,
      error: "Failed to send message",
    };
  }
};
