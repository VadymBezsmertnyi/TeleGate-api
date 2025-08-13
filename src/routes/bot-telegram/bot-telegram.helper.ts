import GroupModel from "../groups/group.model";
import MemberModel from "../members/member.model";
import GroupMemberRelationModel from "../groups/group-member-relation.model";
import {
  GroupData,
  MemberData,
  GroupMemberRelation,
} from "./bot-telegram.types";

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
    return await existingGroup.save();
  }

  const newGroup = new GroupModel({
    tgChatId: groupData.tgChatId,
    type: groupData.type,
    title: groupData.title,
    isForum: groupData.isForum,
    allMembersAreAdministrators: groupData.allMembersAreAdministrators,
    acceptedGiftTypes: groupData.acceptedGiftTypes,
    botStatus: groupData.botStatus,
    addedBy: groupData.addedBy,
  });

  return await newGroup.save();
};

export const createGroupMemberRelation = async (
  relationData: GroupMemberRelation
) => {
  const existingRelation = await GroupMemberRelationModel.findOne({
    groupId: relationData.groupId,
    memberId: relationData.memberId,
  });
  if (existingRelation) {
    existingRelation.status = relationData.status;
    existingRelation.role = relationData.role;
    existingRelation.addedBy = relationData.addedBy as any;
    return await existingRelation.save();
  }

  const newRelation = new GroupMemberRelationModel({
    groupId: relationData.groupId,
    memberId: relationData.memberId,
    status: relationData.status,
    role: relationData.role,
    addedBy: relationData.addedBy,
  });

  const savedRelation = await newRelation.save();

  try {
    const member = await MemberModel.findById(relationData.memberId);
    if (member && member.user) {
      await UserModel.findByIdAndUpdate(member.user, {
        $addToSet: { groups: relationData.groupId },
      });
    }
  } catch (error) {
    console.warn("Помилка при оновленні зв'язків користувача з групою:", error);
  }

  return savedRelation;
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
