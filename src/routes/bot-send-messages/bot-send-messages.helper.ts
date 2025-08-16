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

    // Перевіряємо чи це форум
    if ("is_forum" in group && group.is_forum) {
      // Для форумів спробуємо знайти існуючу гілку "debtors" або створити нову
      let messageThreadId: number | undefined;
      let topicName = "debtors";

      try {
        // Спробуємо створити гілку "debtors" (боржники)
        const createdTopic = await bot.telegram.createForumTopic(
          tgChatId,
          topicName,
          {
            icon_color: 7322096, // Червоний колір для боржників
          }
        );
        messageThreadId = createdTopic.message_thread_id;
        console.log(`Created new forum topic: ${topicName}`);
      } catch (error: any) {
        console.log("Error creating forum topic:", error.description);

        // Якщо немає прав або гілка вже існує, шукаємо відкриті гілки
        if (
          error.description &&
          (error.description.includes("not enough rights") ||
            error.description.includes("already exists"))
        ) {
          console.log(
            "Bot doesn't have rights to create topics, searching for open topics"
          );

          // Спробуємо відправити повідомлення в основну групу, але обробимо помилку TOPIC_CLOSED
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
            // Якщо отримали помилку TOPIC_CLOSED, спробуємо знайти відкриту гілку
            if (
              sendError.description &&
              sendError.description.includes("TOPIC_CLOSED")
            ) {
              console.log("Main topic is closed, trying to find open topics");

              // Спробуємо відправити в різні гілки з відомими ID
              const commonTopicIds = [1, 2, 3, 4, 5]; // Поширені ID гілок

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

                  console.log(
                    `Successfully sent message to topic ID: ${topicId}`
                  );
                  return {
                    success: true,
                    data: {
                      messageId: sentMessage.message_id,
                      sentAt: new Date(),
                    },
                  };
                } catch (topicError: any) {
                  console.log(
                    `Failed to send to topic ID ${topicId}:`,
                    topicError.description
                  );
                  continue; // Спробуємо наступну гілку
                }
              }

              // Якщо всі спроби невдалі, повертаємо помилку
              console.log("All topic attempts failed");
              return {
                success: false,
                error: "All forum topics are closed or inaccessible",
              };
            } else {
              // Для інших помилок відправки
              console.log("Error sending message:", sendError.description);
              return {
                success: false,
                error: "Failed to send message to group",
              };
            }
          }
        } else {
          // Для інших помилок також відправляємо в основну групу
          console.log("Sending message to main group due to other error");
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

      // Якщо гілка була створена успішно, відправляємо повідомлення в неї
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
        // Fallback: якщо гілка не була створена, відправляємо в основну групу
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
      // Для звичайної групи просто тегуємо користувача
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
