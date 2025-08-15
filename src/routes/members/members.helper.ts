import { Request } from "express";
import mongoose from "mongoose";
import GroupModel from "../groups/group.model";
import UserModel from "../users/users.model";
import MemberModel from "./member.model";
import { validateTelegramToken } from "../../helpers/telegram.helper";
import { MembersQuery } from "./members.types";

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

export const buildMembersQuery = (query: MembersQuery) => {
  const { search, groupId, createdFrom, createdTo } = query;
  const filter: any = {};

  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
      { tgUserId: { $regex: search, $options: "i" } },
    ];
  }

  if (groupId) {
    filter.groups = new mongoose.Types.ObjectId(groupId);
  }

  if (createdFrom || createdTo) {
    filter.createdAt = {};
    if (createdFrom) filter.createdAt.$gte = new Date(createdFrom);
    if (createdTo) filter.createdAt.$lte = new Date(createdTo);
  }

  return filter;
};

export const buildSortQuery = (sortBy: string, order: string) => {
  const sortOrder = order === "asc" ? 1 : -1;
  return { [sortBy]: sortOrder as 1 | -1 };
};

export const transformMemberToPublic = (member: any) => ({
  id: member._id.toString(),
  tgUserId: member.tgUserId,
  isBot: member.isBot,
  firstName: member.firstName,
  lastName: member.lastName,
  username: member.username,
  languageCode: member.languageCode,
  canJoinGroups: member.canJoinGroups,
  canReadAllGroupMessages: member.canReadAllGroupMessages,
  supportsInlineQueries: member.supportsInlineQueries,
  createdAt: member.createdAt,
  updatedAt: member.updatedAt,
});

export const getOwnerGroups = async (
  ownerId?: string,
  ownerTelegramId?: number
) => {
  if (!ownerId && !ownerTelegramId) return [];

  const filter: any = {};
  if (ownerId) filter.addedBy = new mongoose.Types.ObjectId(ownerId);
  if (ownerTelegramId) {
    const member = await MemberModel.findOne({
      tgUserId: ownerTelegramId,
    }).lean();
    console.log("member:", member);
    if (member) filter.addedBy = member._id;
  }

  const groups = await GroupModel.find(filter).select("_id").lean();
  return groups.map((group) => group._id);
};
