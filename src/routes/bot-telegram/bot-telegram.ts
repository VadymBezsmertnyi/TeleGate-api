import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import {
  createOrUpdateMember,
  createOrUpdateGroup,
  createGroupMemberRelation,
  determineRole,
} from "./bot-telegram.helper";
import { GroupData, MemberData } from "./bot-telegram.types";
import GroupModel from "../groups/group.model";
import { Chat, ChatMember, User } from "telegraf/typings/core/types/typegram";

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
    console.warn("📝 Зміна статусу бота в чаті:", JSON.stringify(ctx));
    const chat = ctx.update.my_chat_member.chat;
    const newStatus = ctx.update.my_chat_member.new_chat_member.status;
    const from = ctx.update.my_chat_member.from;

    if (
      chat.type !== "group" &&
      chat.type !== "supergroup" &&
      chat.type !== "channel"
    ) {
      console.warn("👤 Приватний чат:", chat.username || chat.first_name);
      return;
    }

    console.warn("📝 Група:", chat.title);
    chat.title = chat.title || "Без назви";

    try {
      const currentChatMember = from as User & {
        can_join_groups?: boolean;
        can_read_all_group_messages?: boolean;
        supports_inline_queries?: boolean;
      };
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
      };

      const member = await createOrUpdateMember(memberData);
      const currentChat = chat as Chat & {
        is_forum?: boolean;
        all_members_are_administrators?: boolean;
        accepted_gift_types?: any;
      };
      const groupData: GroupData = {
        tgChatId: chat.id.toString(),
        type: chat.type,
        title: chat.title,
        isForum: currentChat.is_forum,
        allMembersAreAdministrators: currentChat.all_members_are_administrators,
        acceptedGiftTypes: currentChat.accepted_gift_types,
        botStatus: newStatus,
        addedBy: member._id.toString(),
      };

      const group = await createOrUpdateGroup(groupData);

      const role = determineRole(newStatus);
      await createGroupMemberRelation({
        groupId: group._id.toString(),
        memberId: member._id.toString(),
        status: newStatus,
        role,
        addedBy: member._id.toString(),
      });

      const admins = await ctx.telegram.getChatAdministrators(chat.id);
      for (const admin of admins) {
        const currentAdmin = admin as ChatMember & {
          user: User & {
            can_join_groups?: boolean;
            can_read_all_group_messages?: boolean;
            supports_inline_queries?: boolean;
          };
        };
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
        };

        const adminMember = await createOrUpdateMember(adminMemberData);
        const adminRole = determineRole(admin.status);
        await createGroupMemberRelation({
          groupId: group._id.toString(),
          memberId: adminMember._id.toString(),
          status: admin.status,
          role: adminRole,
          addedBy: member._id.toString(),
        });
      }
    } catch (error) {
      console.warn("Помилка при створенні групи:", error);
    }

    if (newStatus === "administrator" || newStatus === "member") {
      try {
        const chatWithForum = chat as any;
        if (chatWithForum.is_forum) {
          console.warn("Форум-група, пропускаємо привітання");
        } else {
          await ctx.reply("Привіт! Я підключився до групи 🚀");
        }
      } catch (error) {
        console.warn("Помилка відправки привітання:", error);
      }
    }
  });

  bot.on("chat_member", async (ctx) => {
    console.warn("🔄 Зміна статусу в чаті:", JSON.stringify(ctx));
    const chat = ctx.update.chat_member.chat;
    const newChatMember = ctx.update.chat_member.new_chat_member;
    const from = ctx.update.chat_member.from;

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
        };

        const member = await createOrUpdateMember(memberData);
        const role = determineRole(newChatMember.status);

        await createGroupMemberRelation({
          groupId: group._id.toString(),
          memberId: member._id.toString(),
          status: newChatMember.status,
          role,
          addedBy: from.id.toString(),
        });
      } catch (error) {
        console.warn("Помилка при оновленні статусу учасника:", error);
      }
    }
  });

  bot.on("message", async (ctx) => {
    console.log("Новий допис:", JSON.stringify(ctx));
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
      };

      const member = await createOrUpdateMember(memberData);
      const role = determineRole("member");

      await createGroupMemberRelation({
        groupId: group._id.toString(),
        memberId: member._id.toString(),
        status: "member",
        role,
      });

      const messageWithNewMembers = ctx.message as any;
      if (
        messageWithNewMembers.new_chat_members &&
        messageWithNewMembers.new_chat_members.length > 0
      ) {
        for (const newMember of messageWithNewMembers.new_chat_members) {
          if (newMember.is_bot && newMember.id === ctx.botInfo?.id) {
            console.warn("Бот додано до групи через new_chat_members");

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
            };

            const botMember = await createOrUpdateMember(botMemberData);
            const botRole = determineRole("member");

            await createGroupMemberRelation({
              groupId: group._id.toString(),
              memberId: botMember._id.toString(),
              status: "member",
              role: botRole,
              addedBy: member._id.toString(),
            });
          }
        }
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
