import { Telegraf } from "telegraf";
import MemberModel from "../members/member.model";
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

    if ("is_forum" in group && group.is_forum) {
      let messageThreadId: number | undefined;
      let topicName = "debtors";

      try {
        const createdTopic = await bot.telegram.createForumTopic(
          tgChatId,
          topicName,
          {
            icon_color: 7322096,
          }
        );
        messageThreadId = createdTopic.message_thread_id;
      } catch (error: any) {
        if (
          error.description &&
          (error.description.includes("not enough rights") ||
            error.description.includes("already exists"))
        ) {
          try {
            const messageWithTag = `@${username} ${message}\n\n⚠️ Увага: Для кращої організації повідомлень створіть гілку "debtors" в цьому форумі.`;
            const sentMessage = await bot.telegram.sendMessage(
              tgChatId,
              messageWithTag
            );

            return {
              success: true,
              data: {
                messageId: sentMessage.message_id,
                sentAt: new Date(),
              },
            };
          } catch (sendError: any) {
            if (
              sendError.description &&
              sendError.description.includes("TOPIC_CLOSED")
            ) {
              const commonTopicIds = [1, 2, 3, 4, 5];

              for (const topicId of commonTopicIds) {
                try {
                  const messageWithTag = `@${username} ${message}`;
                  const sentMessage = await bot.telegram.sendMessage(
                    tgChatId,
                    messageWithTag,
                    {
                      message_thread_id: topicId,
                    }
                  );

                  return {
                    success: true,
                    data: {
                      messageId: sentMessage.message_id,
                      sentAt: new Date(),
                    },
                  };
                } catch (topicError: any) {
                  continue;
                }
              }

              console.warn("All forum topics are closed or inaccessible");
              return {
                success: false,
                error: "All forum topics are closed or inaccessible",
              };
            } else {
              console.warn(
                "Failed to send message to group:",
                sendError.description
              );
              return {
                success: false,
                error: "Failed to send message to group",
              };
            }
          }
        } else {
          const messageWithTag = `@${username} ${message}`;
          const sentMessage = await bot.telegram.sendMessage(
            tgChatId,
            messageWithTag
          );

          return {
            success: true,
            data: {
              messageId: sentMessage.message_id,
              sentAt: new Date(),
            },
          };
        }
      }

      if (messageThreadId) {
        const messageWithTag = `@${username} ${message}`;
        const sentMessage = await bot.telegram.sendMessage(
          tgChatId,
          messageWithTag,
          {
            message_thread_id: messageThreadId,
          }
        );

        return {
          success: true,
          data: {
            messageId: sentMessage.message_id,
            sentAt: new Date(),
          },
        };
      } else {
        const messageWithTag = `@${username} ${message}`;
        const sentMessage = await bot.telegram.sendMessage(
          tgChatId,
          messageWithTag
        );

        return {
          success: true,
          data: {
            messageId: sentMessage.message_id,
            sentAt: new Date(),
          },
        };
      }
    } else {
      const messageWithTag = `@${username} ${message}`;
      const sentMessage = await bot.telegram.sendMessage(
        tgChatId,
        messageWithTag
      );

      return {
        success: true,
        data: {
          messageId: sentMessage.message_id,
          sentAt: new Date(),
        },
      };
    }
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
