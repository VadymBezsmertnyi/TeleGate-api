import { Telegraf } from "telegraf";
import GroupModel from "../groups/group.model";
import MemberModel from "../members/member.model";
import { SendMessageResult } from "./bot-send-messages.types";

export const sendMessageToUser = async (
  userId: string,
  groupId: string,
  message: string,
  botToken: string
): Promise<SendMessageResult> => {
  try {
    // Перевіряємо, чи існує група
    const group = await GroupModel.findOne({ tgChatId: groupId }).lean();
    if (!group) {
      return {
        success: false,
        error: "Group not found",
      };
    }

    // Перевіряємо, чи існує користувач в цій групі
    const member = await MemberModel.findOne({
      tgUserId: userId,
      groups: group._id,
    }).lean();

    if (!member) {
      return {
        success: false,
        error: "User not found in this group",
      };
    }

    // Створюємо екземпляр бота
    const bot = new Telegraf(botToken);

    // Відправляємо повідомлення користувачу
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
