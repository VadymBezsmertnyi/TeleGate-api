import GroupModel from "../groups/group.model";
import MemberModel from "../members/member.model";
import { GroupData, MemberData } from "./bot-telegram.types";
import UserModel from "../users/users.model";

export const createOrUpdateMember = async (memberData: MemberData) => {
  const existingMember = await MemberModel.findOne({
    tgUserId: memberData.tgUserId,
  });
  if (existingMember) return existingMember;

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

export const createOrUpdateGroup = async (groupData: GroupData) => {
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

    const groupData: Partial<GroupData> = {
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
