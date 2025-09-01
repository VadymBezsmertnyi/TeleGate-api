import mongoose from "mongoose";
import GroupModel from "../groups/group.model";
import MemberModel from "./members.model";
import { MembersQueryT } from "./members.types";

export const buildMembersQuery = (query: MembersQueryT) => {
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
    if (member) filter.addedBy = member._id;
  }

  const groups = await GroupModel.find(filter).select("_id").lean();
  return groups.map((group) => group._id);
};
