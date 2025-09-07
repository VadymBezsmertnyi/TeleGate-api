import { Router, Request, Response } from "express";
import mongoose, { SortOrder } from "mongoose";
import GroupSubscriptionModel from "./group-subscriptions.model";
import {
  groupSubscriptionsQuerySchema,
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
    const { page, limit, order, groupId, userId } = query;
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser)
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });

    const filter: any = {};
    if (groupId) filter.group = new mongoose.Types.ObjectId(groupId);
    if (userId) filter.user = new mongoose.Types.ObjectId(userId);

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
      title: sub.title,
      description: sub.description,
      price: sub.price,
      currency: sub.currency,
      type: sub.type,
      duration: sub.duration,
      memberSubscriptionIds: [],
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
    const { page, limit, order } = query;
    const filter: any = { group: new mongoose.Types.ObjectId(groupId) };

    const sort = { createdAt: order === "asc" ? 1 : -1 } as {
      [key: string]: SortOrder;
    };
    const skip = (page - 1) * limit;
    const [subscriptions, total] = await Promise.all([
      GroupSubscriptionModel.find(filter)
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
      title: sub.title,
      description: sub.description,
      price: sub.price,
      currency: sub.currency,
      type: sub.type,
      duration: sub.duration,
      memberSubscriptionIds: [],
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(405).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid subscription ID",
        },
      });

    const { id } = req.params;
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser)
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });

    const subscription = await GroupSubscriptionModel.findById(id)
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
      title: subscription.title,
      description: subscription.description,
      price: subscription.price,
      currency: subscription.currency,
      type: subscription.type,
      duration: subscription.duration,
      memberSubscriptionIds: [],
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

    const {
      title,
      description,
      price,
      currency,
      type,
      duration,
      groupId,
      userId,
    } = validationResult.data;

    const subscription = await GroupSubscriptionModel.create({
      title,
      description: description || "",
      price,
      currency,
      type: type || "monthly",
      duration: duration || 1,
      group: new mongoose.Types.ObjectId(groupId),
      user: userId
        ? new mongoose.Types.ObjectId(userId)
        : authenticatedUser._id,
    });

    const populatedSubscription = await GroupSubscriptionModel.findById(
      subscription._id
    )
      .populate("group", "title")
      .populate("user", "firstName lastName username")
      .lean();
    if (!populatedSubscription)
      return res.status(400).json({ error: "Failed to create subscription" });

    const transformedSubscription = {
      _id: populatedSubscription._id.toString(),
      title: populatedSubscription.title,
      description: populatedSubscription.description,
      price: populatedSubscription.price,
      currency: populatedSubscription.currency,
      type: populatedSubscription.type,
      duration: populatedSubscription.duration,
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(405).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid subscription ID",
        },
      });

    const { id } = req.params;
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
    const subscription = await GroupSubscriptionModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
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
      title: subscription.title,
      description: subscription.description,
      price: subscription.price,
      currency: subscription.currency,
      type: subscription.type,
      duration: subscription.duration,
      memberSubscriptionIds: [],
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(405).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid subscription ID",
        },
      });

    const { id } = req.params;
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser)
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });

    const subscription = await GroupSubscriptionModel.findByIdAndDelete(
      id
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
