import { Router, Request, Response } from "express";
import MemberModel from "./member.model";
import {
  membersQuerySchema,
  memberParamsSchema,
  membersResponseSchema,
  memberResponseSchema,
} from "./members.schemas";
import {
  getAuthenticatedUser,
  buildMembersQuery,
  buildSortQuery,
  getOwnerGroups,
} from "./members.helper";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const queryValidation = membersQuerySchema.safeParse(req.query);
    if (!queryValidation.success)
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid query parameters",
        },
      });

    const query = queryValidation.data;
    const { page, limit, sortBy, order } = query;
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser)
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });

    const filter = buildMembersQuery(query);
    const sort = buildSortQuery(sortBy, order);
    const skip = (page - 1) * limit;
    const [members, total] = await Promise.all([
      MemberModel.find(filter)
        .sort(sort as any)
        .skip(skip)
        .limit(limit)
        .lean(),
      MemberModel.countDocuments(filter),
    ]);
    const pages = Math.ceil(total / limit);

    const response = {
      data: members,
      meta: {
        page,
        limit,
        total,
        pages,
      },
    };

    const responseValidation = membersResponseSchema.safeParse(response);
    if (!responseValidation.success)
      return res.status(500).json({
        error: {
          code: "INTERNAL_ERROR",
          message: "Data validation failed",
        },
      });

    return res.json(responseValidation.data);
  } catch (error) {
    console.warn("Error fetching members:", error);
    return res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch members",
      },
    });
  }
});

router.get("/owner", async (req: Request, res: Response) => {
  try {
    const queryValidation = membersQuerySchema.safeParse(req.query);
    if (!queryValidation.success)
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid query parameters",
        },
      });

    const query = queryValidation.data;
    const { page, limit, sortBy, order, ownerId, ownerTelegramId } = query;
    const authenticatedUser = await getAuthenticatedUser(req);
    let targetOwnerId = ownerId;
    let targetOwnerTelegramId = ownerTelegramId;

    if (authenticatedUser) {
      targetOwnerId = authenticatedUser._id.toString();
      targetOwnerTelegramId = authenticatedUser.telegramId;
    } else if (!targetOwnerId && !targetOwnerTelegramId)
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
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

    const filter = buildMembersQuery(query);
    filter.groups = { $in: ownerGroups };
    const sort = buildSortQuery(sortBy, order);
    const skip = (page - 1) * limit;
    const [members, total] = await Promise.all([
      MemberModel.find(filter)
        .sort(sort as any)
        .skip(skip)
        .limit(limit)
        .lean(),
      MemberModel.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limit);
    const response = {
      data: members,
      meta: {
        page,
        limit,
        total,
        pages,
      },
    };

    const responseValidation = membersResponseSchema.safeParse(response);
    if (!responseValidation.success)
      return res.status(500).json({
        error: {
          code: "INTERNAL_ERROR",
          message: "Data validation failed",
        },
      });

    return res.json(responseValidation.data);
  } catch (error) {
    console.warn("Error fetching owner members:", error);
    return res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch owner members",
      },
    });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const paramsValidation = memberParamsSchema.safeParse(req.params);
    if (!paramsValidation.success)
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid member ID",
        },
      });

    const { id } = paramsValidation.data;
    const authenticatedUser = await getAuthenticatedUser(req);
    const member = await MemberModel.findById(id)
      .populate({
        path: "groups",
        select: "title addedBy",
        populate: {
          path: "addedBy",
          select: "telegramId",
        },
      })
      .lean();
    if (!member)
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Member not found",
        },
      });

    if (authenticatedUser) {
      const memberGroups = member.groups || [];
      const hasAccess = memberGroups.some(
        (group: any) =>
          group.addedBy &&
          group.addedBy.telegramId === authenticatedUser.telegramId
      );

      if (!hasAccess)
        return res.status(403).json({
          error: {
            code: "FORBIDDEN",
            message: "Access denied",
          },
        });
    }

    const response = {
      data: member,
    };
    const responseValidation = memberResponseSchema.safeParse(response);
    if (!responseValidation.success)
      return res.status(500).json({
        error: {
          code: "INTERNAL_ERROR",
          message: "Data validation failed",
        },
      });

    return res.json(responseValidation.data);
  } catch (error) {
    console.warn("Error fetching member:", error);
    return res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch member",
      },
    });
  }
});

export default router;
