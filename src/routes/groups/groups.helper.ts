import { Request } from "express";
import mongoose from "mongoose";
import GroupModel from "./group.model";
import UserModel from "../users/users.model";
import { validateTelegramToken } from "../../helpers/telegram.helper";
import { GroupsQuery, GroupsFilter, SortQuery } from "./groups.types";

export const getAuthenticatedUser = async (req: Request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.substring(7);
  if (!token) return null;

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return null;

  const telegramValidation = await validateTelegramToken(token, botToken);
  if (!telegramValidation.isValid || !telegramValidation.userData) return null;

  const user = await UserModel.findOne({
    telegramId: telegramValidation.userId,
    isActive: true,
  }).lean();

  return user;
};

export const buildGroupsQuery = (query: GroupsQuery): GroupsFilter => {
  const { search, status, createdFrom, createdTo } = query;
  const filter: GroupsFilter = {};

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

  return filter;
};

export const buildSortQuery = (sortBy: string, order: string): SortQuery => {
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

export const getGroupsWithMemberCount = async (groups: any[]) => {
  return Promise.all(
    groups.map(async (group) => {
      const memberCount = group.members ? group.members.length : 0;
      return transformGroupToPublic(group, memberCount);
    })
  );
};
