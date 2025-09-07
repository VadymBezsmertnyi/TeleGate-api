import { Router, Request, Response } from "express";
import mongoose, { SortOrder } from "mongoose";
import MemberSubscriptionModel from "./member-subscriptions.model";
import {
  memberSubscriptionsQuerySchema,
  memberSubscriptionParamsSchema,
  createMemberSubscriptionSchema,
  updateMemberSubscriptionSchema,
  memberSubscriptionsResponseSchema,
  memberSubscriptionResponseSchema,
} from "./member-subscriptions.schemas";
import { getAuthenticatedUser } from "../../helpers/auth";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const queryValidation = memberSubscriptionsQuerySchema.safeParse(req.query);
    if (!queryValidation.success)
      return res.status(405).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid query parameters",
        },
      });

    const query = queryValidation.data;
    const { page, limit, order, memberId, groupId, groupSubscriptionId } =
      query;
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser)
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });

    const filter: any = {};
    if (memberId) filter.member = new mongoose.Types.ObjectId(memberId);
    if (groupId) filter.group = new mongoose.Types.ObjectId(groupId);
    if (groupSubscriptionId)
      filter.groupSubscription = new mongoose.Types.ObjectId(
        groupSubscriptionId
      );

    const sort = { createdAt: order === "asc" ? 1 : -1 } as {
      [key: string]: SortOrder;
    };
    const skip = (page - 1) * limit;
    const [subscriptions, total] = await Promise.all([
      MemberSubscriptionModel.find(filter)
        .populate("member", "firstName lastName username")
        .populate("group", "title")
        .populate("groupSubscription", "title price currency type duration")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      MemberSubscriptionModel.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limit);
    const transformedSubscriptions = subscriptions.map((sub: any) => ({
      _id: sub._id.toString(),
      startDate: sub.startDate.toISOString(),
      purchaseDate: sub.purchaseDate.toISOString(),
      endDate: sub.endDate.toISOString(),
      memberId: sub.member?._id?.toString(),
      groupId: sub.group?._id?.toString(),
      groupSubscriptionId: sub.groupSubscription?._id?.toString(),
      createdAt: sub.createdAt.toISOString(),
      updatedAt: sub.updatedAt.toISOString(),
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
      memberSubscriptionsResponseSchema.safeParse(response);
    if (!responseValidation.success)
      return res.status(405).json({
        error: {
          code: "INTERNAL_ERROR",
          message: "Data validation failed",
        },
      });

    return res.json(responseValidation.data);
  } catch (error) {
    console.warn("Error fetching member subscriptions:", error);
    return res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch member subscriptions",
      },
    });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const paramsValidation = memberSubscriptionParamsSchema.safeParse(
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

    const subscription = await MemberSubscriptionModel.findById(_id)
      .populate("member", "firstName lastName username")
      .populate("group", "title")
      .populate("groupSubscription", "title price currency type duration")
      .lean();

    if (!subscription)
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Member subscription not found",
        },
      });

    const transformedSubscription = {
      _id: subscription._id.toString(),
      startDate: subscription.startDate.toISOString(),
      purchaseDate: subscription.purchaseDate.toISOString(),
      endDate: subscription.endDate.toISOString(),
      memberId: subscription.member?._id?.toString(),
      groupId: subscription.group?._id?.toString(),
      groupSubscriptionId: subscription.groupSubscription?._id?.toString(),
      createdAt: subscription.createdAt.toISOString(),
      updatedAt: subscription.updatedAt.toISOString(),
    };

    const responseValidation = memberSubscriptionResponseSchema.safeParse({
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
    console.warn("Error fetching member subscription:", error);
    return res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch member subscription",
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

    const validationResult = createMemberSubscriptionSchema.safeParse(req.body);
    if (!validationResult.success)
      return res.status(405).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
        },
      });

    const {
      startDate,
      purchaseDate,
      endDate,
      memberId,
      groupId,
      groupSubscriptionId,
    } = validationResult.data;

    const subscription = await MemberSubscriptionModel.create({
      startDate,
      purchaseDate,
      endDate,
      member: new mongoose.Types.ObjectId(memberId),
      group: new mongoose.Types.ObjectId(groupId),
      groupSubscription: new mongoose.Types.ObjectId(groupSubscriptionId),
    });

    const populatedSubscription = await MemberSubscriptionModel.findById(
      subscription._id
    )
      .populate("member", "firstName lastName username")
      .populate("group", "title")
      .populate("groupSubscription", "title price currency type duration")
      .lean();
    if (!populatedSubscription)
      return res
        .status(400)
        .json({ error: "Failed to create member subscription" });

    const transformedSubscription = {
      _id: populatedSubscription._id.toString(),
      startDate: populatedSubscription.startDate.toISOString(),
      purchaseDate: populatedSubscription.purchaseDate.toISOString(),
      endDate: populatedSubscription.endDate.toISOString(),
      memberId: populatedSubscription.member?._id?.toString(),
      groupId: populatedSubscription.group?._id?.toString(),
      groupSubscriptionId:
        populatedSubscription.groupSubscription?._id?.toString(),
      createdAt: populatedSubscription.createdAt.toISOString(),
      updatedAt: populatedSubscription.updatedAt.toISOString(),
    };

    const responseValidation = memberSubscriptionResponseSchema.safeParse({
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
    console.warn("Error creating member subscription:", error);
    return res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to create member subscription",
      },
    });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const paramsValidation = memberSubscriptionParamsSchema.safeParse(
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

    const validationResult = updateMemberSubscriptionSchema.safeParse(req.body);
    if (!validationResult.success)
      return res.status(405).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
        },
      });

    const updateData: any = { ...validationResult.data, updatedAt: new Date() };
    if (validationResult.data.memberId)
      updateData.member = new mongoose.Types.ObjectId(
        validationResult.data.memberId
      );
    if (validationResult.data.groupId)
      updateData.group = new mongoose.Types.ObjectId(
        validationResult.data.groupId
      );
    if (validationResult.data.groupSubscriptionId)
      updateData.groupSubscription = new mongoose.Types.ObjectId(
        validationResult.data.groupSubscriptionId
      );

    delete updateData.memberId;
    delete updateData.groupId;
    delete updateData.groupSubscriptionId;

    const subscription = await MemberSubscriptionModel.findByIdAndUpdate(
      _id,
      updateData,
      { new: true }
    )
      .populate("member", "firstName lastName username")
      .populate("group", "title")
      .populate("groupSubscription", "title price currency type duration")
      .lean();

    if (!subscription)
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Member subscription not found",
        },
      });

    const transformedSubscription = {
      _id: subscription._id.toString(),
      startDate: subscription.startDate.toISOString(),
      purchaseDate: subscription.purchaseDate.toISOString(),
      endDate: subscription.endDate.toISOString(),
      memberId: subscription.member?._id?.toString(),
      groupId: subscription.group?._id?.toString(),
      groupSubscriptionId: subscription.groupSubscription?._id?.toString(),
      createdAt: subscription.createdAt.toISOString(),
      updatedAt: subscription.updatedAt.toISOString(),
    };

    const responseValidation = memberSubscriptionResponseSchema.safeParse({
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
    console.warn("Error updating member subscription:", error);
    return res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to update member subscription",
      },
    });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const paramsValidation = memberSubscriptionParamsSchema.safeParse(
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

    const subscription = await MemberSubscriptionModel.findByIdAndDelete(
      _id
    ).lean();
    if (!subscription)
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Member subscription not found",
        },
      });

    return res.json({ message: "Member subscription deleted successfully" });
  } catch (error) {
    console.warn("Error deleting member subscription:", error);
    return res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to delete member subscription",
      },
    });
  }
});

export default router;
