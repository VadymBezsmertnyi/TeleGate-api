import { Request } from "express";
import mongoose from "mongoose";
import axios from "axios";
import GroupModel from "../groups/group.model";
import UserModel from "../users/users.model";
import { MembersQuery } from "./members.types";

export const validateTelegramToken = async (
  token: string,
  botToken: string
) => {
  try {
    const tokenParts = token.split("_");
    if (tokenParts.length !== 3) return { isValid: false, userData: null };

    const telegramId = parseInt(tokenParts[1]);
    const timestamp = parseInt(tokenParts[2]);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000;

    if (now - timestamp > maxAge) return { isValid: false, userData: null };

    const response = await axios.get(
      `https://api.telegram.org/bot${botToken}/getMe`
    );

    if (response.status !== 200 || !response.data.ok) {
      return { isValid: false, userData: null };
    }

    return { isValid: true, userData: { id: telegramId } };
  } catch (error) {
    return { isValid: false, userData: null };
  }
};

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
    telegramId: telegramValidation.userData.id,
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
    const user = await UserModel.findOne({
      telegramId: ownerTelegramId,
    }).lean();
    if (user) filter.addedBy = user._id;
  }

  const groups = await GroupModel.find(filter).select("_id").lean();
  return groups.map((group) => group._id);
};
