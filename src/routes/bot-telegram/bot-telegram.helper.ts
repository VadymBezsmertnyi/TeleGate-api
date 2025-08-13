import GroupModel from "../groups/group.model";
import MemberModel from "../members/member.model";
import GroupMemberRelationModel from "../groups/group-member-relation.model";
import {
  GroupData,
  MemberData,
  GroupMemberRelation,
} from "./bot-telegram.types";

export const createOrUpdateMember = async (memberData: MemberData) => {
  const existingMember = await MemberModel.findOne({
    tgUserId: memberData.tgUserId,
  });

  if (existingMember) {
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
    user: memberData.userId,
  });

  return await newMember.save();
};

export const createOrUpdateGroup = async (groupData: GroupData) => {
  const existingGroup = await GroupModel.findOne({
    tgChatId: groupData.tgChatId,
  });

  if (existingGroup) {
    existingGroup.botStatus = groupData.botStatus;
    existingGroup.addedBy = groupData.addedBy;
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
    existingRelation.addedBy = relationData.addedBy;
    return await existingRelation.save();
  }

  const newRelation = new GroupMemberRelationModel({
    groupId: relationData.groupId,
    memberId: relationData.memberId,
    status: relationData.status,
    role: relationData.role,
    addedBy: relationData.addedBy,
  });

  return await newRelation.save();
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
