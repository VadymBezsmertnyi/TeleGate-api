import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import GroupModel from "./group.model";
import {
  groupsQuerySchema,
  groupParamsSchema,
  groupsResponseSchema,
  groupResponseSchema,
} from "./groups.schemas";
import {
  getAuthenticatedUser,
  buildGroupsQuery,
  buildSortQuery,
  transformGroupToPublic,
  getOwnerGroups,
  getGroupsWithMemberCount,
} from "./groups.helper";
import { ERROR_CODES } from "./groups.constants";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const queryValidation = groupsQuerySchema.safeParse(req.query);
    if (!queryValidation.success)
      return res.status(400).json({
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: "Invalid query parameters",
        },
      });

    const query = queryValidation.data;
    const { page, limit, sortBy, order, membersFrom, membersTo } = query;
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser)
      return res.status(401).json({
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: "Authentication required",
        },
      });

    const filter = buildGroupsQuery(query);
    const sort = buildSortQuery(sortBy, order);
    const skip = (page - 1) * limit;

    let groupIds: string[] = [];
    if (membersFrom || membersTo) {
      const memberCountFilter: any = {};
      if (membersFrom) memberCountFilter.$gte = membersFrom;
      if (membersTo) memberCountFilter.$lte = membersTo;

      const groupMemberCounts = await GroupModel.aggregate([
        {
          $addFields: {
            memberCount: { $size: { $ifNull: ["$members", []] } },
          },
        },
        {
          $match: {
            memberCount: memberCountFilter,
          },
        },
        {
          $project: {
            _id: 1,
          },
        },
      ]);

      groupIds = groupMemberCounts.map((item) => item._id.toString());
      if (groupIds.length === 0) {
        return res.json({
          data: [],
          meta: {
            page,
            limit,
            total: 0,
            pages: 0,
          },
        });
      }
      filter._id = {
        $in: groupIds.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    const [groups, total] = await Promise.all([
      GroupModel.find(filter)
        .populate("addedBy", "firstName lastName username")
        .sort(sort as any)
        .skip(skip)
        .limit(limit)
        .lean(),
      GroupModel.countDocuments(filter),
    ]);
    const transformedGroups = await getGroupsWithMemberCount(groups);
    const pages = Math.ceil(total / limit);
    const response = {
      data: transformedGroups,
      meta: {
        page,
        limit,
        total,
        pages,
      },
    };
    const responseValidation = groupsResponseSchema.safeParse(response);
    if (!responseValidation.success) {
      console.warn(
        "Response validation failed:",
        JSON.stringify(responseValidation.error, null, 2)
      );
      console.warn("Response data:", response);
      return res.status(500).json({
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: "Data validation failed",
        },
      });
    }

    return res.json(responseValidation.data);
  } catch (error) {
    console.warn("Error fetching groups:", error);
    return res.status(500).json({
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "Failed to fetch groups",
      },
    });
  }
});

router.get("/owner", async (req: Request, res: Response) => {
  try {
    const queryValidation = groupsQuerySchema.safeParse(req.query);
    if (!queryValidation.success)
      return res.status(400).json({
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: "Invalid query parameters",
        },
      });

    const query = queryValidation.data;
    const {
      page,
      limit,
      sortBy,
      order,
      ownerId,
      ownerTelegramId,
      membersFrom,
      membersTo,
    } = query;
    const authenticatedUser = await getAuthenticatedUser(req);
    let targetOwnerId = ownerId;
    let targetOwnerTelegramId = ownerTelegramId;

    if (authenticatedUser) {
      targetOwnerId = authenticatedUser._id.toString();
      targetOwnerTelegramId = authenticatedUser.telegramId;
    } else if (!targetOwnerId && !targetOwnerTelegramId)
      return res.status(401).json({
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: "Authentication required or owner identification",
        },
      });

    const ownerGroups = await getOwnerGroups(
      targetOwnerId,
      targetOwnerTelegramId
    );
    if (ownerGroups.length === 0)
      return res.json({
        data: [],
        meta: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
      });

    const filter = buildGroupsQuery(query);
    filter._id = { $in: ownerGroups };
    const sort = buildSortQuery(sortBy, order);
    const skip = (page - 1) * limit;

    let groupIds: string[] = [];
    if (membersFrom || membersTo) {
      const memberCountFilter: any = {};
      if (membersFrom) memberCountFilter.$gte = membersFrom;
      if (membersTo) memberCountFilter.$lte = membersTo;

      const groupMemberCounts = await GroupModel.aggregate([
        {
          $match: {
            _id: { $in: ownerGroups },
          },
        },
        {
          $addFields: {
            memberCount: { $size: { $ifNull: ["$members", []] } },
          },
        },
        {
          $match: {
            memberCount: memberCountFilter,
          },
        },
        {
          $project: {
            _id: 1,
          },
        },
      ]);

      groupIds = groupMemberCounts.map((item) => item._id.toString());
      if (groupIds.length === 0) {
        return res.json({
          data: [],
          meta: {
            page,
            limit,
            total: 0,
            pages: 0,
          },
        });
      }
      filter._id = {
        $in: groupIds.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    const [groups, total] = await Promise.all([
      GroupModel.find(filter)
        .populate("addedBy", "firstName lastName username")
        .sort(sort as any)
        .skip(skip)
        .limit(limit)
        .lean(),
      GroupModel.countDocuments(filter),
    ]);

    const transformedGroups = await getGroupsWithMemberCount(groups);
    const pages = Math.ceil(total / limit);

    const response = {
      data: transformedGroups,
      meta: {
        page,
        limit,
        total,
        pages,
      },
    };

    const responseValidation = groupsResponseSchema.safeParse(response);
    if (!responseValidation.success)
      return res.status(500).json({
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: "Data validation failed",
        },
      });

    return res.json(responseValidation.data);
  } catch (error) {
    console.warn("Error fetching owner groups:", error);
    return res.status(500).json({
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "Failed to fetch owner groups",
      },
    });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const paramsValidation = groupParamsSchema.safeParse(req.params);
    if (!paramsValidation.success)
      return res.status(400).json({
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: "Invalid group ID",
        },
      });

    const { id } = paramsValidation.data;
    const authenticatedUser = await getAuthenticatedUser(req);

    const group = await GroupModel.findById(id)
      .populate("addedBy", "firstName lastName username")
      .lean();

    if (!group)
      return res.status(404).json({
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: "Group not found",
        },
      });

    if (authenticatedUser) {
      const isOwner =
        group.addedBy &&
        group.addedBy._id.toString() === authenticatedUser._id.toString();

      if (!isOwner)
        return res.status(403).json({
          error: {
            code: ERROR_CODES.FORBIDDEN,
            message: "Access denied",
          },
        });
    }

    const memberCount = group.members ? group.members.length : 0;

    const transformedGroup = transformGroupToPublic(group, memberCount);
    const response = {
      data: transformedGroup,
    };

    const responseValidation = groupResponseSchema.safeParse(response);
    if (!responseValidation.success)
      return res.status(500).json({
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: "Data validation failed",
        },
      });

    return res.json(responseValidation.data);
  } catch (error) {
    console.warn("Error fetching group:", error);
    return res.status(500).json({
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "Failed to fetch group",
      },
    });
  }
});

export default router;
