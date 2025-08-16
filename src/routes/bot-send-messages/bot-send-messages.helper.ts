import { Telegraf } from "telegraf";
import MemberModel from "../members/member.model";
import GroupModel from "../groups/group.model";
import ForumTopicModel from "../groups/forum-topic.model";
import { SendMessageResultI } from "./bot-send-messages.types";
import { ChatFromGetChat } from "telegraf/typings/core/types/typegram";

const sendMessageToUserInGroup = async (
  username: string,
  message: string,
  botToken: string,
  tgChatId: string
): Promise<SendMessageResultI> => {
  try {
    const bot = new Telegraf(botToken);
    const group = await bot.telegram.getChat(tgChatId);
    if (!group || !group.id)
      return {
        success: false,
        error: `Group with tgChatId ${tgChatId} not found`,
      };

    return {
      success: false,
      error: "Failed to send message to user in group",
    };
  } catch (error) {
    console.error("Error in sendMessageToUserInGroup:", error);
    return {
      success: false,
      error: "Failed to send message to user in group",
    };
  }
};

export const sendMessageToUser = async (
  userId: string,
  message: string,
  botToken: string,
  tgChatId: string
): Promise<SendMessageResultI> => {
  try {
    const member = await MemberModel.findOne({ tgUserId: userId }).lean();
    if (!member)
      return {
        success: false,
        error: `User ${userId} not found in system`,
      };

    const bot = new Telegraf(botToken);
    const memberAccess = (await bot.telegram.getChat(
      member.tgUserId
    )) as ChatFromGetChat & {
      has_private_forwards?: boolean;
    };
    if (memberAccess.has_private_forwards && member.username)
      return await sendMessageToUserInGroup(
        member.username,
        message,
        botToken,
        tgChatId
      );

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
