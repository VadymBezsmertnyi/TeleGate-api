import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import {
  createOrUpdateMember,
  createOrUpdateGroup,
  synchronizeGroupMemberRelationship,
  getUserPhotoUrl,
} from "./bot-telegram.helper";
import { GroupData, MemberData } from "./bot-telegram.types";
import GroupModel from "../groups/group.model";
import { Chat, ChatMember, User } from "telegraf/typings/core/types/typegram";
import MemberModel from "../members/member.model";

dotenv.config();

const startBotTelegram = async () => {
  dotenv.config();

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("❌ TELEGRAM_BOT_TOKEN не задано");
    return;
  }

  console.warn("🔑 Токен знайдено, ініціалізація бота...");

  const bot = new Telegraf(token);

  bot.on("my_chat_member", async (ctx) => {
    const chat = ctx.update.my_chat_member.chat;
    const newStatus = ctx.update.my_chat_member.new_chat_member.status;
    const from = ctx.update.my_chat_member.from;

    if (
      chat.type !== "group" &&
      chat.type !== "supergroup" &&
      chat.type !== "channel"
    ) {
      return;
    }

    chat.title = chat.title || "Без назви";

    try {
      const currentChatMember = from as User & {
        can_join_groups?: boolean;
        can_read_all_group_messages?: boolean;
        supports_inline_queries?: boolean;
      };

      // Отримуємо аватар користувача
      let photoUrl: string | undefined;
      if (!from.is_bot) {
        try {
          photoUrl = await getUserPhotoUrl(ctx, from.id.toString());
        } catch (error) {
          console.warn("Помилка при отриманні аватара користувача:", error);
        }
      }

      const memberData: MemberData = {
        tgUserId: from.id.toString(),
        isBot: from.is_bot,
        firstName: from.first_name,
        lastName: from.last_name,
        username: from.username,
        languageCode: from.language_code,
        canJoinGroups: currentChatMember.can_join_groups,
        canReadAllGroupMessages: currentChatMember.can_read_all_group_messages,
        supportsInlineQueries: currentChatMember.supports_inline_queries,
        photoUrl,
      };
      const member = await createOrUpdateMember(memberData);
      const currentChat = chat as Chat & {
        is_forum?: boolean;
        all_members_are_administrators?: boolean;
        accepted_gift_types?: any;
        description?: string;
        photo?: any;
      };
      let groupPhotoUrl: string | undefined;
      if (currentChat.photo) {
        try {
          const file = await ctx.telegram.getFile(
            currentChat.photo.big_file_id
          );
          groupPhotoUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
        } catch (error) {
          console.warn("Помилка при отриманні фото групи:", error);
        }
      }

      const groupData: GroupData = {
        tgChatId: chat.id.toString(),
        type: chat.type,
        title: chat.title,
        description: currentChat.description,
        photoUrl: groupPhotoUrl,
        isForum: currentChat.is_forum,
        allMembersAreAdministrators: currentChat.all_members_are_administrators,
        acceptedGiftTypes: currentChat.accepted_gift_types,
        botStatus: newStatus,
        addedBy: member._id.toString(),
      };
      const group = await createOrUpdateGroup(groupData);
      if (newStatus === "member" || newStatus === "administrator")
        await synchronizeGroupMemberRelationship(
          group._id.toString(),
          member._id.toString(),
          true
        );
      else if (newStatus === "left" || newStatus === "kicked")
        await synchronizeGroupMemberRelationship(
          group._id.toString(),
          member._id.toString(),
          false
        );

      const existingGroup = await GroupModel.findOne({
        tgChatId: chat.id.toString(),
      });
      if (existingGroup) {
        existingGroup.botStatus = newStatus;
        await existingGroup.save();
      }

      if (newStatus === "member" || newStatus === "administrator") {
        try {
          const { updateGroupInfoFromTelegram } = await import(
            "./bot-telegram.helper"
          );
          await updateGroupInfoFromTelegram(chat.id.toString(), ctx);
        } catch (error) {
          console.warn("Помилка при оновленні інформації про групу:", error);
        }
      }

      if (newStatus !== "left" && newStatus !== "kicked") {
        try {
          const admins = await ctx.telegram.getChatAdministrators(chat.id);
          for (const admin of admins) {
            const currentAdmin = admin as ChatMember & {
              user: User & {
                can_join_groups?: boolean;
                can_read_all_group_messages?: boolean;
                supports_inline_queries?: boolean;
              };
            };

            // Отримуємо аватар адміністратора
            let adminPhotoUrl: string | undefined;
            if (!admin.user.is_bot) {
              try {
                adminPhotoUrl = await getUserPhotoUrl(
                  ctx,
                  admin.user.id.toString()
                );
              } catch (error) {
                console.warn(
                  "Помилка при отриманні аватара адміністратора:",
                  error
                );
              }
            }

            const adminMemberData: MemberData = {
              tgUserId: admin.user.id.toString(),
              isBot: admin.user.is_bot,
              firstName: admin.user.first_name,
              lastName: admin.user.last_name,
              username: admin.user.username,
              languageCode: admin.user.language_code,
              canJoinGroups: currentAdmin.user.can_join_groups,
              canReadAllGroupMessages:
                currentAdmin.user.can_read_all_group_messages,
              supportsInlineQueries: currentAdmin.user.supports_inline_queries,
              photoUrl: adminPhotoUrl,
            };

            const adminMember = await createOrUpdateMember(adminMemberData);
            await synchronizeGroupMemberRelationship(
              group._id.toString(),
              adminMember._id.toString(),
              true
            );
          }
        } catch (adminError) {
          console.warn("Помилка при отриманні адміністраторів:", adminError);
        }
      }
    } catch (error) {
      console.warn("Помилка при створенні групи:", error);
    }

    if (newStatus === "administrator" || newStatus === "member") {
      try {
        const chatWithForum = chat as any;
        if (!chatWithForum.is_forum) {
          await ctx.reply("Привіт! Я підключився до групи 🚀");
        }
      } catch (error) {
        console.warn("Помилка відправки привітання:", error);
      }
    }
  });

  bot.on("chat_member", async (ctx) => {
    const chat = ctx.update.chat_member.chat;
    const newChatMember = ctx.update.chat_member.new_chat_member;

    if (
      chat.type === "group" ||
      chat.type === "supergroup" ||
      chat.type === "channel"
    ) {
      try {
        const group = await GroupModel.findOne({
          tgChatId: chat.id.toString(),
        });
        if (!group) return;

        const newCurrentChatMember = newChatMember as ChatMember & {
          user: User & {
            can_join_groups?: boolean;
            can_read_all_group_messages?: boolean;
            supports_inline_queries?: boolean;
          };
        };

        // Отримуємо аватар нового учасника
        let newMemberPhotoUrl: string | undefined;
        if (!newChatMember.user.is_bot) {
          try {
            newMemberPhotoUrl = await getUserPhotoUrl(
              ctx,
              newChatMember.user.id.toString()
            );
          } catch (error) {
            console.warn(
              "Помилка при отриманні аватара нового учасника:",
              error
            );
          }
        }

        const memberData: MemberData = {
          tgUserId: newChatMember.user.id.toString(),
          isBot: newChatMember.user.is_bot,
          firstName: newChatMember.user.first_name,
          lastName: newChatMember.user.last_name,
          username: newChatMember.user.username,
          languageCode: newChatMember.user.language_code,
          canJoinGroups: newCurrentChatMember.user.can_join_groups,
          canReadAllGroupMessages:
            newCurrentChatMember.user.can_read_all_group_messages,
          supportsInlineQueries:
            newCurrentChatMember.user.supports_inline_queries,
          photoUrl: newMemberPhotoUrl,
        };
        const member = await createOrUpdateMember(memberData);
        if (
          newChatMember.status === "member" ||
          newChatMember.status === "administrator"
        )
          await synchronizeGroupMemberRelationship(
            group._id.toString(),
            member._id.toString(),
            true
          );
        else if (
          newChatMember.status === "left" ||
          newChatMember.status === "kicked"
        )
          await synchronizeGroupMemberRelationship(
            group._id.toString(),
            member._id.toString(),
            false
          );
      } catch (error) {
        console.warn("Помилка при оновленні статусу учасника:", error);
      }
    }
  });

  bot.on("message", async (ctx) => {
    const chat = ctx.message.chat;
    const from = ctx.message.from;
    if (!from || chat.type === "private") return;

    try {
      const group = await GroupModel.findOne({ tgChatId: chat.id.toString() });
      if (!group) return;

      const fromMember = from as User & {
        can_join_groups?: boolean;
        can_read_all_group_messages?: boolean;
        supports_inline_queries?: boolean;
      };

      // Отримуємо аватар відправника повідомлення
      let senderPhotoUrl: string | undefined;
      if (!from.is_bot) {
        try {
          senderPhotoUrl = await getUserPhotoUrl(ctx, from.id.toString());
        } catch (error) {
          console.warn("Помилка при отриманні аватара відправника:", error);
        }
      }

      const memberData: MemberData = {
        tgUserId: from.id.toString(),
        isBot: from.is_bot,
        firstName: from.first_name,
        lastName: from.last_name,
        username: from.username,
        languageCode: from.language_code,
        canJoinGroups: fromMember.can_join_groups,
        canReadAllGroupMessages: fromMember.can_read_all_group_messages,
        supportsInlineQueries: fromMember.supports_inline_queries,
        photoUrl: senderPhotoUrl,
      };
      const member = await createOrUpdateMember(memberData);
      await synchronizeGroupMemberRelationship(
        group._id.toString(),
        member._id.toString(),
        true
      );
      const messageWithNewMembers = ctx.message as any;
      if (
        messageWithNewMembers.new_chat_members &&
        messageWithNewMembers.new_chat_members.length > 0
      ) {
        for (const newMember of messageWithNewMembers.new_chat_members) {
          if (newMember.is_bot && newMember.id === ctx.botInfo?.id) {
            // Отримуємо аватар бота
            let botPhotoUrl: string | undefined;
            if (!newMember.is_bot) {
              try {
                botPhotoUrl = await getUserPhotoUrl(
                  ctx,
                  newMember.id.toString()
                );
              } catch (error) {
                console.warn("Помилка при отриманні аватара бота:", error);
              }
            }

            const botMemberData: MemberData = {
              tgUserId: newMember.id.toString(),
              isBot: newMember.is_bot,
              firstName: newMember.first_name,
              lastName: newMember.last_name,
              username: newMember.username,
              languageCode: newMember.language_code,
              canJoinGroups: newMember.can_join_groups,
              canReadAllGroupMessages: newMember.can_read_all_group_messages,
              supportsInlineQueries: newMember.supports_inline_queries,
              photoUrl: botPhotoUrl,
            };

            const botMember = await createOrUpdateMember(botMemberData);

            await synchronizeGroupMemberRelationship(
              group._id.toString(),
              botMember._id.toString(),
              true
            );

            const existingGroup = await GroupModel.findOne({
              tgChatId: chat.id.toString(),
            });
            if (existingGroup) {
              existingGroup.botStatus = "member";
              await existingGroup.save();
            }
          } else {
            // Отримуємо аватар нового учасника
            let newMemberPhotoUrl: string | undefined;
            if (!newMember.is_bot) {
              try {
                newMemberPhotoUrl = await getUserPhotoUrl(
                  ctx,
                  newMember.id.toString()
                );
              } catch (error) {
                console.warn(
                  "Помилка при отриманні аватара нового учасника:",
                  error
                );
              }
            }

            const newMemberData: MemberData = {
              tgUserId: newMember.id.toString(),
              isBot: newMember.is_bot,
              firstName: newMember.first_name,
              lastName: newMember.last_name,
              username: newMember.username,
              languageCode: newMember.language_code,
              canJoinGroups: newMember.can_join_groups,
              canReadAllGroupMessages: newMember.can_read_all_group_messages,
              supportsInlineQueries: newMember.supports_inline_queries,
              photoUrl: newMemberPhotoUrl,
            };

            const newMemberCreated = await createOrUpdateMember(newMemberData);

            await synchronizeGroupMemberRelationship(
              group._id.toString(),
              newMemberCreated._id.toString(),
              true
            );
          }
        }
      }
      if (messageWithNewMembers.left_chat_member) {
        const leftMember = messageWithNewMembers.left_chat_member;
        // Отримуємо аватар учасника, що покинув групу
        let leftMemberPhotoUrl: string | undefined;
        if (!leftMember.is_bot) {
          try {
            leftMemberPhotoUrl = await getUserPhotoUrl(
              ctx,
              leftMember.id.toString()
            );
          } catch (error) {
            console.warn(
              "Помилка при отриманні аватара учасника, що покинув групу:",
              error
            );
          }
        }

        const leftMemberData: MemberData = {
          tgUserId: leftMember.id.toString(),
          isBot: leftMember.is_bot,
          firstName: leftMember.first_name,
          lastName: leftMember.last_name,
          username: leftMember.username,
          languageCode: leftMember.language_code,
          canJoinGroups: leftMember.can_join_groups,
          canReadAllGroupMessages: leftMember.can_read_all_group_messages,
          supportsInlineQueries: leftMember.supports_inline_queries,
          photoUrl: leftMemberPhotoUrl,
        };

        const leftMemberCreated = await createOrUpdateMember(leftMemberData);

        await synchronizeGroupMemberRelationship(
          group._id.toString(),
          leftMemberCreated._id.toString(),
          false
        );
      }
    } catch (error) {
      console.warn("Помилка при обробці повідомлення:", error);
    }
  });

  bot.command("admins", async (ctx) => {
    const admins = await ctx.telegram.getChatAdministrators(ctx.chat!.id);
    await ctx.reply(
      "Адміни:\n" + admins.map((a) => `• ${a.user.first_name}`).join("\n")
    );
  });

  bot.command("update_group_info", async (ctx) => {
    try {
      const { updateGroupInfoFromTelegram } = await import(
        "./bot-telegram.helper"
      );
      const updatedGroup = await updateGroupInfoFromTelegram(
        ctx.chat!.id.toString(),
        ctx
      );

      if (updatedGroup) {
        await ctx.reply("✅ Інформація про групу оновлена!");
      } else {
        await ctx.reply("❌ Не вдалося оновити інформацію про групу");
      }
    } catch (error) {
      console.warn("Помилка при оновленні інформації про групу:", error);
      await ctx.reply("❌ Помилка при оновленні інформації про групу");
    }
  });

  bot.command("update_member_avatars", async (ctx) => {
    try {
      const { getUserPhotoUrl } = await import("./bot-telegram.helper");
      const members = await MemberModel.find({
        photoUrl: { $exists: false },
      }).limit(10);

      if (members.length === 0) {
        await ctx.reply("✅ Всі аватари користувачів вже оновлені!");
        return;
      }

      let updatedCount = 0;
      for (const member of members) {
        if (!member.isBot) {
          try {
            const photoUrl = await getUserPhotoUrl(ctx, member.tgUserId);
            if (photoUrl) {
              member.photoUrl = photoUrl;
              await member.save();
              updatedCount++;
            }
          } catch (error) {
            console.warn(
              `Помилка при оновленні аватара для ${member.tgUserId}:`,
              error
            );
          }
        }
      }

      await ctx.reply(
        `✅ Оновлено аватари для ${updatedCount} користувачів з ${members.length}`
      );
    } catch (error) {
      console.warn("Помилка при оновленні аватара користувачів:", error);
      await ctx.reply("❌ Помилка при оновленні аватара користувачів");
    }
  });

  try {
    console.warn("🔄 Перезапуск бота...");

    try {
      const me = await bot.telegram.getMe();
      console.warn(`🤖 Бот: @${me.username} (ID: ${me.id})`);
    } catch (tokenError) {
      console.warn("❌ Помилка токена:", tokenError);
      return;
    }

    console.warn("🚀 Запускаю бота...");

    // Додаємо опції для локальної розробки
    await bot.launch({
      dropPendingUpdates: true,
      allowedUpdates: ["message", "my_chat_member", "chat_member"],
    });

    console.warn(`✅ Бот запущено! @${bot.botInfo?.username}`);

    process.once("SIGINT", () => {
      console.warn("🛑 Зупиняю бота (SIGINT)...");
      bot.stop("SIGINT");
    });
    process.once("SIGTERM", () => {
      console.warn("🛑 Зупиняю бота (SIGTERM)...");
      bot.stop("SIGTERM");
    });
  } catch (e) {
    console.warn("❌ Помилка запуску:", e);
  }
};

export default startBotTelegram;
