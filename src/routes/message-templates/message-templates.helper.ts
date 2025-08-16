import mongoose from "mongoose";
import MessageTemplateModel from "./message-template.model";
import {
  CreateTemplateRequest,
  UpdateTemplateRequest,
  FilterTemplatesRequest,
} from "./message-templates.schemas";

export const createTemplate = async (
  templateData: CreateTemplateRequest,
  userId: string
) => {
  const template = await MessageTemplateModel.create({
    ...templateData,
    user: new mongoose.Types.ObjectId(userId),
  });
  return template;
};

export const updateTemplate = async (
  templateId: string,
  userId: string,
  updateData: UpdateTemplateRequest
) => {
  const template = await MessageTemplateModel.findOneAndUpdate(
    { _id: templateId, user: userId },
    { ...updateData, updatedAt: new Date() },
    { new: true }
  );
  return template;
};

export const deleteTemplate = async (templateId: string, userId: string) => {
  const result = await MessageTemplateModel.findOneAndDelete({
    _id: templateId,
    user: userId,
  });
  return result;
};

export const getTemplateById = async (templateId: string, userId: string) => {
  const template = await MessageTemplateModel.findOne({
    _id: templateId,
    user: userId,
  }).lean();
  return template;
};

export const getTemplates = async (
  userId: string,
  filters: FilterTemplatesRequest
) => {
  const { search, type, isActive, tags, page, limit } = filters;

  const query: any = { user: userId };

  // Фільтр по пошуку
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ];
  }

  // Фільтр по типу
  if (type) {
    query.type = type;
  }

  // Фільтр по активності
  if (isActive !== undefined) {
    query.isActive = isActive;
  }

  // Фільтр по тегам
  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }

  const skip = (page - 1) * limit;

  const [templates, total] = await Promise.all([
    MessageTemplateModel.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    MessageTemplateModel.countDocuments(query),
  ]);

  return {
    templates,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const incrementUsageCount = async (
  templateId: string,
  userId: string
) => {
  const template = await MessageTemplateModel.findOneAndUpdate(
    { _id: templateId, user: userId },
    {
      $inc: { usageCount: 1 },
      lastUsedAt: new Date(),
    },
    { new: true }
  );
  return template;
};

export const getTemplateStats = async (userId: string) => {
  const stats = await MessageTemplateModel.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalTemplates: { $sum: 1 },
        activeTemplates: {
          $sum: { $cond: ["$isActive", 1, 0] },
        },
        totalUsage: { $sum: "$usageCount" },
        avgUsage: { $avg: "$usageCount" },
      },
    },
  ]);

  return (
    stats[0] || {
      totalTemplates: 0,
      activeTemplates: 0,
      totalUsage: 0,
      avgUsage: 0,
    }
  );
};
