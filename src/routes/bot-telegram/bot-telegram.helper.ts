import GroupModel from "../groups/group.model";
import MemberModel from "../members/members.model";
import { GroupDataI, MemberDataI } from "./bot-telegram.types";
import UserModel from "../users/users.model";
import { Telegraf, Telegram } from "telegraf";

export const updateAllExpiredPhotos = async (bot?: any) => {
  try {
    if (!bot) {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      if (!token) {
        console.warn("❌ TELEGRAM_BOT_TOKEN не задано");
        return;
      }
      bot = new Telegraf(token);
    }

    const telegram = bot.telegram as Telegram;
    let updatedMembers = 0;
    let updatedGroups = 0;
    let errors = 0;
    const membersWithExpiredPhotos = await MemberModel.find({
      photoUrl: { $regex: /^https:\/\/api\.telegram\.org/ },
    });

    for (const member of membersWithExpiredPhotos) {
      try {
        const newPhotoUrl = await getUserPhotoUrl(bot, member.tgUserId);
        if (newPhotoUrl) {
          await MemberModel.updateOne(
            { _id: member._id },
            { photoUrl: newPhotoUrl }
          );
          updatedMembers++;
        } else {
          console.warn(
            `⚠️ Не вдалося отримати нове фото для ${member.tgUserId} (${member.firstName})`
          );
        }
      } catch (error) {
        console.warn(
          `❌ Помилка оновлення фото для ${member.tgUserId}:`,
          error
        );
        errors++;
      }
    }

    const groupsWithExpiredPhotos = await GroupModel.find({
      photoUrl: { $regex: /^https:\/\/api\.telegram\.org/ },
    });
    for (const group of groupsWithExpiredPhotos) {
      try {
        const chat = await telegram.getChat(group.tgChatId);
        if (chat.photo) {
          const file = await telegram.getFile(chat.photo.big_file_id);
          const botToken = process.env.TELEGRAM_BOT_TOKEN;
          if (botToken) {
            const newPhotoUrl = `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;
            group.photoUrl = newPhotoUrl;
            await group.save();
            updatedGroups++;
          }
        }
      } catch (error) {
        console.warn(
          `❌ Помилка оновлення фото групи ${group.tgChatId}:`,
          error
        );
        errors++;
      }
    }

    console.warn(`✅ Оновлення завершено:`);
    console.warn(`👤 Користувачів: ${updatedMembers}`);
    console.warn(`👥 Груп: ${updatedGroups}`);
    console.warn(`❌ Помилок: ${errors}`);
    console.warn(
      `📝 Загалом оброблено: ${
        membersWithExpiredPhotos.length + groupsWithExpiredPhotos.length
      }`
    );

    return {
      updatedMembers,
      updatedGroups,
      errors,
      total: membersWithExpiredPhotos.length + groupsWithExpiredPhotos.length,
    };
  } catch (error) {
    console.warn("❌ Помилка при оновленні застарілих фото:", error);
    throw error;
  }
};

export const getUserPhotoUrl = async (
  bot: any,
  userId: string
): Promise<string | undefined> => {
  try {
    const telegram = bot.telegram as Telegram;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      console.warn("❌ TELEGRAM_BOT_TOKEN не знайдено");
      return undefined;
    }

    try {
      const userInfo = await telegram.getChat(parseInt(userId));
      if (userInfo && userInfo.photo) {
        const file = await telegram.getFile(userInfo.photo.big_file_id);
        if (file && file.file_path)
          return `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;
      }
    } catch (userError) {
      console.warn(
        `Не вдалося отримати інформацію про користувача ${userId} через getChat:`,
        userError
      );
    }

    try {
      const userPhotos = await telegram.getUserProfilePhotos(parseInt(userId));
      if (userPhotos.total_count > 0 && userPhotos.photos.length > 0) {
        const photo = userPhotos.photos[0][0];
        const file = await telegram.getFile(photo.file_id);
        if (file && file.file_path) {
          return `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;
        }
      }
    } catch (photosError) {
      console.warn(
        `Не вдалося отримати фото профілю для ${userId} через getUserProfilePhotos:`,
        photosError
      );
    }

    return undefined;
  } catch (error) {
    console.warn(`Помилка при отриманні фото користувача ${userId}:`, error);
    return undefined;
  }
};

export const createOrUpdateMember = async (memberData: MemberDataI) => {
  const existingMember = await MemberModel.findOne({
    tgUserId: memberData.tgUserId,
  });

  if (existingMember) {
    if (memberData.photoUrl && memberData.photoUrl !== existingMember.photoUrl)
      existingMember.photoUrl = memberData.photoUrl;
    if (memberData.hasPrivateForwards !== undefined)
      existingMember.hasPrivateForwards = memberData.hasPrivateForwards;
    if (memberData.privacySettings && existingMember.privacySettings) {
      if (memberData.privacySettings.profilePhotos)
        existingMember.privacySettings.profilePhotos =
          memberData.privacySettings.profilePhotos;
      if (memberData.privacySettings.lastSeen)
        existingMember.privacySettings.lastSeen =
          memberData.privacySettings.lastSeen;
      if (memberData.privacySettings.forwards)
        existingMember.privacySettings.forwards =
          memberData.privacySettings.forwards;
    }

    await existingMember.save();
    return existingMember;
  }

  const newMember = new MemberModel({
    tgUserId: memberData.tgUserId,
    isBot: memberData.isBot,
    firstName: memberData.firstName,
    lastName: memberData.lastName,
    username: memberData.username,
    languageCode: memberData.languageCode,
    canJoinGroups: memberData.canJoinGroups,
    canReadAllGroupMessages: memberData.canReadAllGroupMessages,
    supportsInlineQueries: memberData.supportsInlineQueries,
    photoUrl: memberData.photoUrl,
    hasPrivateForwards: memberData.hasPrivateForwards || false,
    privacySettings: memberData.privacySettings || {
      profilePhotos: "contacts",
      lastSeen: "contacts",
      forwards: "contacts",
    },
    user: memberData.userId,
  });
  const savedMember = await newMember.save();

  if (!memberData.isBot) {
    try {
      const user = await UserModel.findOne({
        telegramId: parseInt(memberData.tgUserId),
      });
      if (user) {
        savedMember.user = user._id;
        await savedMember.save();

        await UserModel.findByIdAndUpdate(user._id, {
          $addToSet: { members: savedMember._id },
        });
      }
    } catch (error) {
      console.warn("Помилка при зв'язуванні члена з користувачем:", error);
    }
  }

  return savedMember;
};

export const createOrUpdateGroup = async (groupData: GroupDataI) => {
  const existingGroup = await GroupModel.findOne({
    tgChatId: groupData.tgChatId,
  });
  if (existingGroup) {
    existingGroup.botStatus = groupData.botStatus;
    existingGroup.addedBy = groupData.addedBy as any;
    if (groupData.title) existingGroup.title = groupData.title;
    if (groupData.description)
      existingGroup.description = groupData.description;
    if (groupData.photoUrl) existingGroup.photoUrl = groupData.photoUrl;
    return await existingGroup.save();
  }

  const newGroup = new GroupModel({
    tgChatId: groupData.tgChatId,
    type: groupData.type,
    title: groupData.title,
    description: groupData.description,
    photoUrl: groupData.photoUrl,
    isForum: groupData.isForum,
    allMembersAreAdministrators: groupData.allMembersAreAdministrators,
    acceptedGiftTypes: groupData.acceptedGiftTypes,
    botStatus: groupData.botStatus,
    addedBy: groupData.addedBy,
  });

  return await newGroup.save();
};

export const synchronizeGroupMemberRelationship = async (
  groupId: string,
  memberId: string,
  shouldAdd: boolean = true
) => {
  try {
    if (shouldAdd) {
      await GroupModel.findByIdAndUpdate(groupId, {
        $addToSet: { members: memberId },
      });
      await MemberModel.findByIdAndUpdate(memberId, {
        $addToSet: { groups: groupId },
      });
      const member = await MemberModel.findById(memberId);
      if (member && member.user) {
        await UserModel.findByIdAndUpdate(member.user, {
          $addToSet: { groups: groupId },
        });
        await GroupModel.findByIdAndUpdate(groupId, {
          $addToSet: { users: member.user },
        });
      }
    } else {
      await GroupModel.findByIdAndUpdate(groupId, {
        $pull: { members: memberId },
      });
      await MemberModel.findByIdAndUpdate(memberId, {
        $pull: { groups: groupId },
      });
      const member = await MemberModel.findById(memberId);
      if (member && member.user) {
        await UserModel.findByIdAndUpdate(member.user, {
          $pull: { groups: groupId },
        });
        await GroupModel.findByIdAndUpdate(groupId, {
          $pull: { users: member.user },
        });
      }
    }
  } catch (error) {
    console.warn(
      "Помилка при синхронізації зв'язків групи та учасника:",
      error
    );
  }
};

export const determineRole = (
  status: string
): "admin" | "moderator" | "member" => {
  switch (status) {
    case "creator":
    case "administrator":
      return "admin";
    case "member":
      return "member";
    default:
      return "member";
  }
};

export const updateGroupInfoFromTelegram = async (chatId: string, bot: any) => {
  try {
    const chat = await bot.telegram.getChat(chatId);
    let photoUrl: string | undefined;
    if (chat.photo) {
      try {
        const file = await bot.telegram.getFile(chat.photo.big_file_id);
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (botToken)
          photoUrl = `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;
      } catch (error) {
        console.warn("Помилка при отриманні фото групи:", error);
      }
    }

    const groupData: Partial<GroupDataI> = {
      title: chat.title,
      description: chat.description,
      photoUrl,
    };

    const existingGroup = await GroupModel.findOne({ tgChatId: chatId });
    if (existingGroup) {
      if (groupData.title) existingGroup.title = groupData.title;
      if (groupData.description)
        existingGroup.description = groupData.description;
      if (groupData.photoUrl) existingGroup.photoUrl = groupData.photoUrl;
      await existingGroup.save();

      return existingGroup;
    }

    return null;
  } catch (error) {
    console.warn("Помилка при оновленні інформації про групу:", error);
    return null;
  }
};

export const processMentionedUsers = async (
  bot: any,
  message: any,
  groupId: string
): Promise<void> => {
  try {
    if (!message.text) return;

    const telegram = bot.telegram as Telegram;
    const mentionedUsers: string[] = [];
    if (message.entities && Array.isArray(message.entities))
      for (const entity of message.entities) {
        if (entity.type === "mention" && entity.user)
          mentionedUsers.push(entity.user.id.toString());
        else if (entity.type === "text_mention" && entity.user)
          mentionedUsers.push(entity.user.id.toString());
      }
    if (message.reply_to_message && message.reply_to_message.from)
      if (!mentionedUsers.includes(message.reply_to_message.from.id.toString()))
        mentionedUsers.push(message.reply_to_message.from.id.toString());
    if (message.forward_from)
      if (!mentionedUsers.includes(message.forward_from.id.toString()))
        mentionedUsers.push(message.forward_from.id.toString());
    if (message.new_chat_members && Array.isArray(message.new_chat_members))
      for (const newMember of message.new_chat_members) {
        if (newMember.id && !mentionedUsers.includes(newMember.id.toString()))
          mentionedUsers.push(newMember.id.toString());
      }

    const uniqueUsers = [...new Set(mentionedUsers)];
    for (const userId of uniqueUsers) {
      try {
        const chatMember = await telegram.getChatMember(
          message.chat.id,
          parseInt(userId)
        );
        let userInfo: any = null;
        let hasPrivateForwards = false;
        try {
          userInfo = await telegram.getChat(parseInt(userId));
          hasPrivateForwards = userInfo.has_private_forwards || false;
        } catch (chatError) {
          hasPrivateForwards = true;
          userInfo = chatMember;
        }

        let photoUrl: string | undefined;
        try {
          photoUrl = await getUserPhotoUrl(bot, userId);
        } catch (photoError) {
          console.warn(
            `Помилка отримання фото для згаданого користувача ${userId}:`,
            photoError
          );
        }

        const memberData: MemberDataI = {
          tgUserId: userId,
          isBot: chatMember.user.is_bot || false,
          firstName: chatMember.user.first_name,
          lastName: chatMember.user.last_name || "",
          username: chatMember.user.username || "",
          languageCode: chatMember.user.language_code || "",
          photoUrl,
          hasPrivateForwards: hasPrivateForwards,
          privacySettings: {
            profilePhotos: hasPrivateForwards ? "contacts" : "everybody",
            lastSeen: hasPrivateForwards ? "contacts" : "everybody",
            forwards: hasPrivateForwards ? "contacts" : "everybody",
          },
        };

        const member = await createOrUpdateMember(memberData);
        await synchronizeGroupMemberRelationship(
          groupId,
          member._id.toString(),
          true
        );
      } catch (userError) {
        console.warn(
          `Помилка обробки згаданого користувача ${userId}:`,
          userError
        );
      }
    }
  } catch (error) {
    console.warn(`Помилка обробки згадок користувачів:`, error);
  }
};
