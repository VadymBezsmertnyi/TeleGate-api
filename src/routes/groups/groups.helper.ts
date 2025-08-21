import mongoose from "mongoose";
import GroupModel from "./group.model";
import UserModel from "../users/users.model";
import { GroupsQueryT, GroupsFilterI, SortQueryI } from "./groups.types";

export const buildGroupsQuery = (query: GroupsQueryT): GroupsFilterI => {
  const { search, status, createdFrom, createdTo, activity } = query;
  const filter: GroupsFilterI = {};

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tgChatId: { $regex: search, $options: "i" } },
    ];
  }

  if (status) {
    filter.botStatus = status;
  }

  if (createdFrom || createdTo) {
    filter.createdAt = {};
    if (createdFrom) filter.createdAt.$gte = new Date(createdFrom);
    if (createdTo) filter.createdAt.$lte = new Date(createdTo);
  }

  if (activity) {
    const now = new Date();
    filter.updatedAt = {};

    switch (activity) {
      case "active_7d":
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filter.updatedAt.$gte = sevenDaysAgo;
        break;
      case "active_30d":
        const thirtyDaysAgo = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000
        );
        filter.updatedAt.$gte = thirtyDaysAgo;
        break;
      case "inactive":
        const thirtyDaysAgoInactive = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000
        );
        filter.updatedAt.$lte = thirtyDaysAgoInactive;
        break;
    }
  }

  return filter;
};

export const buildSortQuery = (sortBy: string, order: string): SortQueryI => {
  const sortOrder = order === "asc" ? 1 : -1;
  const sortField = sortBy === "name" ? "title" : sortBy;
  return { [sortField]: sortOrder };
};

export const transformGroupToPublic = (
  group: any,
  membersCount: number = 0
) => ({
  id: group._id.toString(),
  tgChatId: group.tgChatId,
  type: group.type,
  name: group.title,
  description: group.description,
  photoUrl: group.photoUrl,
  isForum: group.isForum,
  allMembersAreAdministrators: group.allMembersAreAdministrators,
  acceptedGiftTypes: group.acceptedGiftTypes,
  botStatus: group.botStatus,
  membersCount,
  addedBy: group.addedBy
    ? {
        id: group.addedBy._id.toString(),
        firstName: group.addedBy.firstName,
        lastName: group.addedBy.lastName,
        username: group.addedBy.username,
      }
    : null,
  createdAt: group.createdAt,
  updatedAt: group.updatedAt,
});

export const getOwnerGroups = async (
  ownerId?: string,
  ownerTelegramId?: number
) => {
  if (!ownerId && !ownerTelegramId) return [];

  const filter: any = {};
  if (ownerId) filter.addedBy = new mongoose.Types.ObjectId(ownerId);
  if (ownerTelegramId) {
    const user = await UserModel.findOne({
      telegramId: ownerTelegramId,
    }).lean();
    if (user) filter.addedBy = user._id;
  }

  const groups = await GroupModel.find(filter).select("_id").lean();
  return groups.map((group) => group._id);
};

export const getGroupsWithMemberCount = (groups: any[]) => {
  return groups.map((group) => {
    const memberCount = group.members ? group.members.length : 0;
    return transformGroupToPublic(group, memberCount);
  });
};
