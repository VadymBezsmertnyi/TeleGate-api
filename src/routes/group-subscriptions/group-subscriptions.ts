import { Router, Request, Response } from "express";
import mongoose, { SortOrder } from "mongoose";
import GroupSubscriptionModel from "./group-subscriptions.model";
import {
  groupSubscriptionsQuerySchema,
  groupSubscriptionParamsSchema,
  createGroupSubscriptionSchema,
  updateGroupSubscriptionSchema,
  groupSubscriptionsResponseSchema,
  groupSubscriptionResponseSchema,
} from "./group-subscriptions.schemas";
import { getAuthenticatedUser } from "../../helpers/auth";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const queryValidation = groupSubscriptionsQuerySchema.safeParse(req.query);
    if (!queryValidation.success)
      return res.status(405).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid query parameters",
        },
      });

    const query = queryValidation.data;
    const { page, limit, order, memberIds, groupId, userId, activeOnly } = query;
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser)
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });

    const filter: any = {};
    if (memberIds && memberIds.length > 0) filter.members = { $in: memberIds.map(id => new mongoose.Types.ObjectId(id)) };
    if (groupId) filter.group = new mongoose.Types.ObjectId(groupId);
    if (userId) filter.user = new mongoose.Types.ObjectId(userId);
    if (activeOnly) {
      filter.$or = [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }];
      filter.canceledAt = null;
    }

    const sort = { createdAt: order === "asc" ? 1 : -1 } as {
      [key: string]: SortOrder;
    };
    const skip = (page - 1) * limit;
    const [subscriptions, total] = await Promise.all([
      GroupSubscriptionModel.find(filter)
        .populate("members", "firstName lastName username")
        .populate("group", "title")
        .populate("user", "firstName lastName username")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      GroupSubscriptionModel.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limit);
    const transformedSubscriptions = subscriptions.map((sub: any) => ({
      _id: sub._id.toString(),
      price: sub.price,
      currency: sub.currency,
      durationDays: sub.durationDays,
      startedAt: sub.startedAt,
      expiresAt: sub.expiresAt,
      canceledAt: sub.canceledAt,
      memberIds: sub.members?.map((member: any) => member._id.toString()) || [],
      groupId: sub.group?._id?.toString(),
      userId: sub.user?._id?.toString(),
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
    }));

    const response = {
      data: transformedSubscriptions,
      meta: {
        page,
        limit,
        total,
        pages,
      },
    };

    const responseValidation =
      groupSubscriptionsResponseSchema.safeParse(response);
    if (!responseValidation.success)
      return res.status(405).json({
        error: {
          code: "INTERNAL_ERROR",
          message: "Data validation failed",
        },
      });

    return res.json(responseValidation.data);
  } catch (error) {
    console.warn("Error fetching group subscriptions:", error);
    return res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch group subscriptions",
      },
    });
  }
});

router.get("/group/:groupId", async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(groupId))
      return res.status(405).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid group ID",
        },
      });

    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser)
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });

    const queryValidation = groupSubscriptionsQuerySchema.safeParse(req.query);
    if (!queryValidation.success)
      return res.status(405).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid query parameters",
        },
      });

    const query = queryValidation.data;
    const { page, limit, order, activeOnly } = query;
    const filter: any = { group: new mongoose.Types.ObjectId(groupId) };
    if (activeOnly) {
      filter.$or = [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }];
      filter.canceledAt = null;
    }

    const sort = { createdAt: order === "asc" ? 1 : -1 } as {
      [key: string]: SortOrder;
    };
    const skip = (page - 1) * limit;
    const [subscriptions, total] = await Promise.all([
      GroupSubscriptionModel.find(filter)
        .populate("members", "firstName lastName username")
        .populate("user", "firstName lastName username")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      GroupSubscriptionModel.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limit);
    const transformedSubscriptions = subscriptions.map((sub: any) => ({
      _id: sub._id.toString(),
      price: sub.price,
      currency: sub.currency,
      durationDays: sub.durationDays,
      startedAt: sub.startedAt,
      expiresAt: sub.expiresAt,
      canceledAt: sub.canceledAt,
      memberIds: sub.members?.map((member: any) => member._id.toString()) || [],
      groupId: sub.group?.toString(),
      userId: sub.user?._id?.toString(),
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
    }));

    const response = {
      data: transformedSubscriptions,
      meta: {
        page,
        limit,
        total,
        pages,
      },
    };

    return res.json(response);
  } catch (error) {
    console.warn("Error fetching group subscriptions:", error);
    return res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch group subscriptions",
      },
    });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const paramsValidation = groupSubscriptionParamsSchema.safeParse(
      req.params
    );
    if (!paramsValidation.success)
      return res.status(405).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid subscription ID",
        },
      });

    const { _id } = paramsValidation.data;
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser)
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });

    const subscription = await GroupSubscriptionModel.findById(_id)
      .populate("members", "firstName lastName username")
      .populate("group", "title")
      .populate("user", "firstName lastName username")
      .lean();

    if (!subscription)
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Subscription not found",
        },
      });

    const transformedSubscription = {
      id: subscription._id.toString(),
      price: subscription.price,
      currency: subscription.currency,
      durationDays: subscription.durationDays,
      startedAt: subscription.startedAt,
      expiresAt: subscription.expiresAt,
      canceledAt: subscription.canceledAt,
      memberIds: subscription.members?.map((member: any) => member._id.toString()) || [],
      groupId: subscription.group?._id?.toString(),
      userId: subscription.user?._id?.toString(),
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };

    const responseValidation = groupSubscriptionResponseSchema.safeParse({
      data: transformedSubscription,
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
    console.warn("Error fetching subscription:", error);
    return res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch subscription",
      },
    });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser)
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });

    const validationResult = createGroupSubscriptionSchema.safeParse(req.body);
    if (!validationResult.success)
      return res.status(405).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
        },
      });

    const { price, currency, durationDays, memberIds, groupId, userId } =
      validationResult.data;
    const startedAt = new Date();
    const expiresAt = new Date(
      startedAt.getTime() + durationDays * 24 * 60 * 60 * 1000
    );

    const subscription = await GroupSubscriptionModel.create({
      price,
      currency,
      durationDays,
      startedAt,
      expiresAt,
      members: memberIds.map(id => new mongoose.Types.ObjectId(id)),
      group: new mongoose.Types.ObjectId(groupId),
      user: userId
        ? new mongoose.Types.ObjectId(userId)
        : authenticatedUser._id,
    });

    const populatedSubscription = await GroupSubscriptionModel.findById(
      subscription._id
    )
      .populate("members", "firstName lastName username")
      .populate("group", "title")
      .populate("user", "firstName lastName username")
      .lean();
    if (!populatedSubscription)
      return res.status(400).json({ error: "Failed to create subscription" });

    const transformedSubscription = {
      _id: populatedSubscription._id.toString(),
      price: populatedSubscription.price,
      currency: populatedSubscription.currency,
      durationDays: populatedSubscription.durationDays,
      startedAt: populatedSubscription.startedAt,
      expiresAt: populatedSubscription.expiredAt,
      canceledAt: populatedSubscription.canceledAt,
      memberIds: populatedSubscription.members?.map((member: any) => member._id.toString()) || [],
      groupId: populatedSubscription.group?._id?.toString(),
      userId: populatedSubscription.user?._id?.toString(),
      createdAt: populatedSubscription.createdAt,
      updatedAt: populatedSubscription.updatedAt,
    };

    const responseValidation = groupSubscriptionResponseSchema.safeParse({
      data: transformedSubscription,
    });
    if (!responseValidation.success)
      return res.status(405).json({
        error: {
          code: "INTERNAL_ERROR",
          message: "Data validation failed",
        },
      });

    return res.status(201).json(responseValidation.data);
  } catch (error) {
    console.warn("Error creating subscription:", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as any).code === 11000
    )
      return res.status(409).json({
        error: {
          code: "DUPLICATE_SUBSCRIPTION",
          message: "Subscription already exists for these members and group",
        },
      });

    return res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to create subscription",
      },
    });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const paramsValidation = groupSubscriptionParamsSchema.safeParse(
      req.params
    );
    if (!paramsValidation.success)
      return res.status(405).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid subscription ID",
        },
      });

    const { _id } = paramsValidation.data;
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser)
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });

    const validationResult = updateGroupSubscriptionSchema.safeParse(req.body);
    if (!validationResult.success)
      return res.status(405).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
        },
      });

    const updateData = { ...validationResult.data, updatedAt: new Date() };
    if (validationResult.data.expiresAt)
      updateData.expiresAt = new Date(
        validationResult.data.expiresAt
      ).toUTCString();
    if (validationResult.data.canceledAt)
      updateData.canceledAt = new Date(
        validationResult.data.canceledAt
      ).toUTCString();

    const subscription = await GroupSubscriptionModel.findByIdAndUpdate(
      _id,
      updateData,
      { new: true }
    )
      .populate("members", "firstName lastName username")
      .populate("group", "title")
      .populate("user", "firstName lastName username")
      .lean();

    if (!subscription)
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Subscription not found",
        },
      });

    const transformedSubscription = {
      _id: subscription._id.toString(),
      price: subscription.price,
      currency: subscription.currency,
      durationDays: subscription.durationDays,
      startedAt: subscription.startedAt,
      expiresAt: subscription.expiresAt,
      canceledAt: subscription.canceledAt,
      memberIds: subscription.members?.map((member: any) => member._id.toString()) || [],
      groupId: subscription.group?._id?.toString(),
      userId: subscription.user?._id?.toString(),
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };

    const responseValidation = groupSubscriptionResponseSchema.safeParse({
      data: transformedSubscription,
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
    console.warn("Error updating subscription:", error);
    return res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to update subscription",
      },
    });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const paramsValidation = groupSubscriptionParamsSchema.safeParse(
      req.params
    );
    if (!paramsValidation.success)
      return res.status(405).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid subscription ID",
        },
      });

    const { _id } = paramsValidation.data;
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser)
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });

    const subscription = await GroupSubscriptionModel.findByIdAndDelete(
      _id
    ).lean();
    if (!subscription)
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Subscription not found",
        },
      });

    return res.json({ message: "Subscription deleted successfully" });
  } catch (error) {
    console.warn("Error deleting subscription:", error);
    return res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to delete subscription",
      },
    });
  }
});

export default router;
