import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import MemberModel from "./members.model";
import {
  membersQuerySchema,
  membersWithSubscriptionsQuerySchema,
  memberParamsSchema,
  membersResponseSchema,
  membersWithSubscriptionsResponseSchema,
  memberResponseSchema,
  memberWithSubscriptionResponseSchema,
  memberWithSubscriptionByIdQuerySchema,
} from "./members.schemas";
import {
  buildMembersQuery,
  buildSortQuery,
  getOwnerGroups,
} from "./members.helper";
import { getAuthenticatedUser } from "../../helpers/auth";
import MemberSubscriptionModel from "../member-subscriptions/member-subscriptions.model";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const queryValidation = membersQuerySchema.safeParse(req.query);
    if (!queryValidation.success)
      return res.status(405).json({
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
      return res.status(405).json({
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

router.get("/with-subscriptions", async (req: Request, res: Response) => {
  try {
    const queryValidation = membersWithSubscriptionsQuerySchema.safeParse(
      req.query
    );
    if (!queryValidation.success)
      return res.status(405).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid query parameters",
        },
      });

    const query = queryValidation.data;
    const { page, limit, sortBy, order, search, groupId } = query;
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser)
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });

    const filter: any = {};
    if (groupId) filter.groups = new mongoose.Types.ObjectId(groupId);
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { tgUserId: { $regex: search, $options: "i" } },
      ];
    }

    const sort = { [sortBy]: order === "asc" ? 1 : -1 } as any;
    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      MemberModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      MemberModel.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limit);

    const membersWithSubscriptions = await Promise.all(
      members.map(async (member) => {
        const subscriptionFilter: any = {
          member: member._id,
          endDate: { $gt: new Date() },
        };
        if (groupId)
          subscriptionFilter.group = new mongoose.Types.ObjectId(groupId);
        const activeSubscriptions = await MemberSubscriptionModel.find(
          subscriptionFilter
        )
          .populate("groupSubscription", "title price currency type duration")
          .sort({ endDate: 1 })
          .lean();

        const latestSubscription =
          activeSubscriptions.length > 0 ? activeSubscriptions[0] : null;

        return {
          _id: member._id,
          telegramUsername: member.telegramUsername,
          tgUserId: member.tgUserId,
          isBot: member.isBot,
          firstName: member.firstName,
          lastName: member.lastName,
          username: member.username,
          languageCode: member.languageCode,
          canJoinGroups: member.canJoinGroups,
          canReadAllGroupMessages: member.canReadAllGroupMessages,
          supportsInlineQueries: member.supportsInlineQueries,
          photoUrl: member.photoUrl,
          user: member.user,
          groups: member.groups,
          createdAt: member.createdAt,
          updatedAt: member.updatedAt,
          subscription: latestSubscription
            ? {
                _id: latestSubscription._id,
                startDate: latestSubscription.startDate,
                purchaseDate: latestSubscription.purchaseDate,
                endDate: latestSubscription.endDate,
                groupSubscription: latestSubscription.groupSubscription,
              }
            : null,
          activeSubscriptionsCount: activeSubscriptions.length,
          activeSubscriptions: activeSubscriptions.map((sub) => ({
            _id: sub._id,
            startDate: sub.startDate,
            purchaseDate: sub.purchaseDate,
            endDate: sub.endDate,
            groupSubscription: sub.groupSubscription,
          })),
        };
      })
    );

    const response = {
      data: membersWithSubscriptions,
      meta: {
        page,
        limit,
        total,
        pages,
      },
    };

    const responseValidation =
      membersWithSubscriptionsResponseSchema.safeParse(response);
    if (!responseValidation.success)
      return res.status(405).json({
        error: {
          code: "INTERNAL_ERROR",
          message: "Data validation failed",
        },
      });

    return res.json(responseValidation.data);
  } catch (error) {
    console.warn("Error fetching members with subscriptions:", error);
    return res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch members with subscriptions",
      },
    });
  }
});

router.get("/with-subscriptions/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const queryValidation = memberWithSubscriptionByIdQuerySchema.safeParse(
      req.query
    );
    if (!queryValidation.success)
      return res.status(405).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid query parameters",
        },
      });

    const { groupId } = queryValidation.data;
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser)
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });

    const member = await MemberModel.findOne({
      _id: id,
      groups: groupId,
    }).lean();
    if (!member)
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Member not found in this group",
        },
      });

    const activeSubscriptions = await MemberSubscriptionModel.find({
      member: member._id,
      group: groupId,
      endDate: { $gt: new Date() },
    })
      .populate("groupSubscription", "title price currency type duration")
      .sort({ endDate: 1 })
      .lean();

    const allSubscriptions = await MemberSubscriptionModel.find({
      member: member._id,
      group: groupId,
    })
      .populate("groupSubscription", "title price currency type duration")
      .sort({ endDate: -1 })
      .lean();

    const latestSubscription =
      activeSubscriptions.length > 0 ? activeSubscriptions[0] : null;

    const memberWithSubscription = {
      ...member,
      subscription: latestSubscription
        ? {
            _id: latestSubscription._id,
            startDate: latestSubscription.startDate,
            purchaseDate: latestSubscription.purchaseDate,
            endDate: latestSubscription.endDate,
            groupSubscription: latestSubscription.groupSubscription,
          }
        : null,
      activeSubscriptionsCount: activeSubscriptions.length,
      activeSubscriptions: activeSubscriptions.map((sub) => ({
        _id: sub._id,
        startDate: sub.startDate,
        purchaseDate: sub.purchaseDate,
        endDate: sub.endDate,
        groupSubscription: sub.groupSubscription,
      })),
      allSubscriptions: allSubscriptions.map((sub) => ({
        _id: sub._id,
        startDate: sub.startDate,
        purchaseDate: sub.purchaseDate,
        endDate: sub.endDate,
        groupSubscription: sub.groupSubscription,
      })),
    };

    const response = {
      data: memberWithSubscription,
    };

    const responseValidation =
      memberWithSubscriptionResponseSchema.safeParse(response);
    if (!responseValidation.success)
      return res.status(405).json({
        error: {
          code: "INTERNAL_ERROR",
          message: "Data validation failed",
        },
      });

    return res.json(responseValidation.data);
  } catch (error) {
    console.warn("Error fetching member with subscription:", error);
    return res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch member with subscription",
      },
    });
  }
});

router.get("/owner", async (req: Request, res: Response) => {
  try {
    const queryValidation = membersQuerySchema.safeParse(req.query);
    if (!queryValidation.success)
      return res.status(405).json({
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

    const membersWithStats = await Promise.all(
      members.map(async (member) => {
        const activeSubscriptionsCount =
          await MemberSubscriptionModel.countDocuments({
            member: member._id,
            endDate: { $gt: new Date() },
          });

        const groupsCount = member.groups ? member.groups.length : 0;

        const allSubscriptions = await MemberSubscriptionModel.find({
          member: member._id,
        })
          .sort({ startDate: 1 })
          .lean();

        let subscriptionDelaysDays = 0;

        if (allSubscriptions.length > 0) {
          for (let i = 0; i < allSubscriptions.length - 1; i++) {
            const currentEnd = new Date(allSubscriptions[i].endDate);
            const nextStart = new Date(allSubscriptions[i + 1].startDate);

            if (nextStart > currentEnd) {
              const diffTime = nextStart.getTime() - currentEnd.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              subscriptionDelaysDays += diffDays;
            }
          }
        }

        return {
          ...member,
          activeSubscriptionsCount,
          groupsCount,
          subscriptionDelaysDays,
        };
      })
    );

    const pages = Math.ceil(total / limit);
    const response = {
      data: membersWithStats,
      meta: {
        page,
        limit,
        total,
        pages,
      },
    };

    const responseValidation = membersResponseSchema.safeParse(response);
    if (!responseValidation.success)
      return res.status(405).json({
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
      return res.status(405).json({
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
    if (!authenticatedUser)
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });

    const activeSubscriptionsCount =
      await MemberSubscriptionModel.countDocuments({
        member: member._id,
        endDate: { $gt: new Date() },
      });
    const allSubscriptions = await MemberSubscriptionModel.find({
      member: member._id,
    })
      .sort({ startDate: 1 })
      .lean();

    let subscriptionDelaysDays = 0;

    if (allSubscriptions.length > 0) {
      const now = new Date();
      let lastActiveSubscriptionIndex = -1;

      for (let i = allSubscriptions.length - 1; i >= 0; i--) {
        if (new Date(allSubscriptions[i].endDate) > now) {
          lastActiveSubscriptionIndex = i;
          break;
        }
      }

      const subscriptionsToCheck =
        lastActiveSubscriptionIndex >= 0
          ? allSubscriptions.slice(0, lastActiveSubscriptionIndex + 1)
          : allSubscriptions;

      for (let i = 0; i < subscriptionsToCheck.length - 1; i++) {
        const currentEnd = new Date(subscriptionsToCheck[i].endDate);
        const nextStart = new Date(subscriptionsToCheck[i + 1].startDate);

        if (nextStart > currentEnd) {
          const diffTime = nextStart.getTime() - currentEnd.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          subscriptionDelaysDays += diffDays;
        }
      }
    }

    const activeSubscriptions = await MemberSubscriptionModel.find({
      member: member._id,
      endDate: { $gt: new Date() },
    })
      .populate({
        path: "groupSubscription",
        select: "title type duration price currency",
      })
      .populate({
        path: "group",
        select: "title",
      })
      .sort({ endDate: -1 })
      .lean();

    const memberWithStats = {
      ...member,
      activeSubscriptionsCount,
      subscriptionDelaysDays,
      activeSubscriptions: activeSubscriptions.map((sub) => ({
        _id: sub._id,
        startDate: sub.startDate,
        endDate: sub.endDate,
        groupSubscription: sub.groupSubscription,
        group: sub.group,
      })),
    };

    const responseValidation = memberResponseSchema.safeParse({
      data: memberWithStats,
    });
    if (!responseValidation.success)
      return res.status(405).json({
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
