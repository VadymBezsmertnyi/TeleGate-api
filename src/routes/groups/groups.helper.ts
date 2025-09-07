import mongoose from "mongoose";
import GroupModel from "./group.model";
import UserModel from "../users/users.model";
import MemberSubscriptionModel from "../member-subscriptions/member-subscriptions.model";
import GroupSubscriptionModel from "../group-subscriptions/group-subscriptions.model";
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
  membersCount: number = 0,
  subscriptionsCount: number = 0,
  usersWithSubscriptionCount: number = 0,
  usersWithExpiredSubscriptionCount: number = 0,
  usersWithoutSubscriptionCount: number = 0
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
  subscriptionsCount,
  usersWithSubscriptionCount,
  usersWithExpiredSubscriptionCount,
  usersWithoutSubscriptionCount,
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

export const getGroupsWithMemberCount = async (groups: any[]) => {
  if (groups.length === 0) return [];

  const groupIds = groups.map((group) => group._id);

  const [activeSubscriptions, expiredSubscriptions, groupSubscriptions] =
    await Promise.all([
      MemberSubscriptionModel.aggregate([
        {
          $match: {
            group: { $in: groupIds },
            endDate: { $gt: new Date() },
          },
        },
        {
          $group: {
            _id: "$group",
            uniqueMembers: { $addToSet: "$member" },
          },
        },
        {
          $project: {
            _id: 1,
            count: { $size: "$uniqueMembers" },
          },
        },
      ]),
      MemberSubscriptionModel.aggregate([
        {
          $match: {
            group: { $in: groupIds },
            endDate: { $lte: new Date() },
          },
        },
        {
          $group: {
            _id: "$group",
            uniqueMembers: { $addToSet: "$member" },
          },
        },
        {
          $project: {
            _id: 1,
            count: { $size: "$uniqueMembers" },
          },
        },
      ]),
      GroupSubscriptionModel.aggregate([
        {
          $match: {
            group: { $in: groupIds },
          },
        },
        {
          $group: {
            _id: "$group",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

  const activeSubsMap = new Map(
    activeSubscriptions.map((item) => [item._id.toString(), item.count])
  );
  const expiredSubsMap = new Map(
    expiredSubscriptions.map((item) => [item._id.toString(), item.count])
  );
  const groupSubsMap = new Map(
    groupSubscriptions.map((item) => [item._id.toString(), item.count])
  );

  return groups.map((group) => {
    const memberCount = group.members ? group.members.length : 0;
    const subscriptionsCount = groupSubsMap.get(group._id.toString()) || 0;
    const usersWithSubscriptionCount =
      activeSubsMap.get(group._id.toString()) || 0;
    const usersWithExpiredSubscriptionCount =
      expiredSubsMap.get(group._id.toString()) || 0;
    const usersWithoutSubscriptionCount = Math.max(
      0,
      memberCount -
        usersWithSubscriptionCount -
        usersWithExpiredSubscriptionCount
    );

    return transformGroupToPublic(
      group,
      memberCount,
      subscriptionsCount,
      usersWithSubscriptionCount,
      usersWithExpiredSubscriptionCount,
      usersWithoutSubscriptionCount
    );
  });
};
