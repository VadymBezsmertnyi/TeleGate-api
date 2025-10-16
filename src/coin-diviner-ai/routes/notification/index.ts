import { Router, Request, Response } from "express";

import {
  createNotificationSchema,
  sendNotificationSchema,
  updateNotificationSchema,
  notificationResponseSchema,
  notificationListResponseSchema,
  deleteNotificationResponseSchema,
} from "./notification.schemas";
import {
  notFoundErrorSchema,
  serverErrorSchema,
  validationErrorSchema,
} from "../aggregator/aggregator.schemas";

import type {
  TCreateNotification,
  TSendNotification,
  TUpdateNotification,
  TNotificationResponse,
  TNotificationListResponse,
  TDeleteNotificationResponse,
} from "./notification.types";
import type {
  TNotFoundError,
  TServerError,
  TValidationError,
} from "../aggregator/aggregator.types";

import NotificationModel from "./notification.model";
import AuthModel from "../auth/auth.model";

import { checkAuth } from "../../hooks/auth";
import {
  sendPushNotification,
  sendSmsNotification,
  sendTelegramNotification,
} from "./notification.helpers";

import "./notification.swagger";

const router = Router();

router.post("/create", async (req: Request, res: Response) => {
  try {
    const decoded = checkAuth(req);
    if ("message" in decoded) return res.status(401).json(decoded);

    const user = await AuthModel.findById(decoded.userId);
    if (!user) {
      const errorResponse: TNotFoundError = {
        message: "User not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const validationResult = createNotificationSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: validationResult.error.issues,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const { type, title, message, metadata }: TCreateNotification =
      validationResult.data;

    const notification = await NotificationModel.create({
      userId: user._id,
      type,
      title,
      message,
      metadata: metadata || {},
    });

    const notificationData = await NotificationModel.findById(
      notification._id
    ).lean();
    if (!notificationData) {
      const errorResponse: TServerError = {
        message: "Failed to retrieve notification",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    const responseData: TNotificationResponse = {
      success: true,
      data: {
        _id: notificationData._id.toString(),
        userId: notificationData.userId.toString(),
        type: notificationData.type,
        status: notificationData.status,
        title: notificationData.title,
        message: notificationData.message,
        metadata: notificationData.metadata,
        sentAt: notificationData.sentAt?.toISOString(),
        createdAt: notificationData.createdAt.toISOString(),
        updatedAt: notificationData.updatedAt.toISOString(),
      },
    };

    const responseValidation =
      notificationResponseSchema.safeParse(responseData);
    if (!responseValidation.success) {
      console.warn("Response validation failed:", responseValidation.error);
      const errorResponse: TServerError = {
        message: "Invalid response format",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    return res.status(201).json(responseValidation.data);
  } catch (error) {
    console.warn("Create notification error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.post("/send", async (req: Request, res: Response) => {
  try {
    const decoded = checkAuth(req);
    if ("message" in decoded) return res.status(401).json(decoded);

    const user = await AuthModel.findById(decoded.userId);
    if (!user) {
      const errorResponse: TNotFoundError = {
        message: "User not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const validationResult = sendNotificationSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: validationResult.error.issues,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const { notificationId }: TSendNotification = validationResult.data;

    const notification = await NotificationModel.findOne({
      _id: notificationId,
      userId: user._id,
    });

    if (!notification) {
      const errorResponse: TNotFoundError = {
        message: "Notification not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    try {
      if (notification.type === "push") {
        const pushToken = notification.metadata?.pushToken;
        if (!pushToken) {
          throw new Error("Push token is required for push notifications");
        }
        await sendPushNotification(
          pushToken,
          notification.title || "",
          notification.message
        );
      } else if (notification.type === "sms") {
        const phoneNumber = notification.metadata?.phoneNumber || user.phone;
        if (!phoneNumber) {
          throw new Error("Phone number is required for SMS notifications");
        }
        await sendSmsNotification(phoneNumber, notification.message);
      } else if (notification.type === "telegram") {
        const telegramChatId = notification.metadata?.telegramChatId;
        if (!telegramChatId) {
          throw new Error(
            "Telegram chat ID is required for Telegram notifications"
          );
        }
        await sendTelegramNotification(telegramChatId, notification.message);
      }

      notification.status = "sent";
      notification.sentAt = new Date();
      await notification.save();
    } catch (sendError) {
      notification.status = "failed";
      notification.metadata = {
        ...notification.metadata,
        errorMessage: String(sendError),
      };
      await notification.save();

      const errorResponse: TServerError = {
        message: "Failed to send notification: " + sendError,
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    const notificationData = await NotificationModel.findById(
      notification._id
    ).lean();
    if (!notificationData) {
      const errorResponse: TServerError = {
        message: "Failed to retrieve notification",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    const responseData: TNotificationResponse = {
      success: true,
      data: {
        _id: notificationData._id.toString(),
        userId: notificationData.userId.toString(),
        type: notificationData.type,
        status: notificationData.status,
        title: notificationData.title,
        message: notificationData.message,
        metadata: notificationData.metadata,
        sentAt: notificationData.sentAt?.toISOString(),
        createdAt: notificationData.createdAt.toISOString(),
        updatedAt: notificationData.updatedAt.toISOString(),
      },
    };

    const responseValidation =
      notificationResponseSchema.safeParse(responseData);
    if (!responseValidation.success) {
      console.warn("Response validation failed:", responseValidation.error);
      const errorResponse: TServerError = {
        message: "Invalid response format",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    return res.status(200).json(responseValidation.data);
  } catch (error) {
    console.warn("Send notification error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.get("/list", async (req: Request, res: Response) => {
  try {
    const decoded = checkAuth(req);
    if ("message" in decoded) return res.status(401).json(decoded);

    const user = await AuthModel.findById(decoded.userId);
    if (!user) {
      const errorResponse: TNotFoundError = {
        message: "User not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const { type, status, limit = "50" } = req.query;
    const filter: any = { userId: user._id };

    if (type && ["push", "sms", "telegram"].includes(type as string)) {
      filter.type = type;
    }

    if (status && ["pending", "sent", "failed"].includes(status as string)) {
      filter.status = status;
    }

    const limitNum = Math.min(parseInt(limit as string) || 50, 100);

    const notifications = await NotificationModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .lean();

    const responseData: TNotificationListResponse = {
      success: true,
      data: notifications.map((notification) => ({
        _id: notification._id.toString(),
        userId: notification.userId.toString(),
        type: notification.type,
        status: notification.status,
        title: notification.title,
        message: notification.message,
        metadata: notification.metadata,
        sentAt: notification.sentAt?.toISOString(),
        createdAt: notification.createdAt.toISOString(),
        updatedAt: notification.updatedAt.toISOString(),
      })),
    };

    const responseValidation =
      notificationListResponseSchema.safeParse(responseData);
    if (!responseValidation.success) {
      console.warn("Response validation failed:", responseValidation.error);
      const errorResponse: TServerError = {
        message: "Invalid response format",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    return res.status(200).json(responseValidation.data);
  } catch (error) {
    console.warn("Get notifications list error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.get("/by-id/:notificationId", async (req: Request, res: Response) => {
  try {
    const decoded = checkAuth(req);
    if ("message" in decoded) return res.status(401).json(decoded);

    const user = await AuthModel.findById(decoded.userId);
    if (!user) {
      const errorResponse: TNotFoundError = {
        message: "User not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const { notificationId } = req.params;
    if (!notificationId) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: [
          {
            code: "invalid_type",
            message: "notificationId is required",
            path: ["notificationId"],
          },
        ],
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const notification = await NotificationModel.findOne({
      _id: notificationId,
      userId: user._id,
    }).lean();

    if (!notification) {
      const errorResponse: TNotFoundError = {
        message: "Notification not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const responseData: TNotificationResponse = {
      success: true,
      data: {
        _id: notification._id.toString(),
        userId: notification.userId.toString(),
        type: notification.type,
        status: notification.status,
        title: notification.title,
        message: notification.message,
        metadata: notification.metadata,
        sentAt: notification.sentAt?.toISOString(),
        createdAt: notification.createdAt.toISOString(),
        updatedAt: notification.updatedAt.toISOString(),
      },
    };

    const responseValidation =
      notificationResponseSchema.safeParse(responseData);
    if (!responseValidation.success) {
      console.warn("Response validation failed:", responseValidation.error);
      const errorResponse: TServerError = {
        message: "Invalid response format",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    return res.status(200).json(responseValidation.data);
  } catch (error) {
    console.warn("Get notification by id error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.put("/update/:notificationId", async (req: Request, res: Response) => {
  try {
    const decoded = checkAuth(req);
    if ("message" in decoded) return res.status(401).json(decoded);

    const user = await AuthModel.findById(decoded.userId);
    if (!user) {
      const errorResponse: TNotFoundError = {
        message: "User not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const { notificationId } = req.params;
    if (!notificationId) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: [
          {
            code: "invalid_type",
            message: "notificationId is required",
            path: ["notificationId"],
          },
        ],
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const validationResult = updateNotificationSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: validationResult.error.issues,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const updateData: TUpdateNotification = validationResult.data;

    const notification = await NotificationModel.findOne({
      _id: notificationId,
      userId: user._id,
    });

    if (!notification) {
      const errorResponse: TNotFoundError = {
        message: "Notification not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    if (updateData.status) notification.status = updateData.status;
    if (updateData.title !== undefined) notification.title = updateData.title;
    if (updateData.message) notification.message = updateData.message;
    if (updateData.metadata)
      notification.metadata = {
        ...notification.metadata,
        ...updateData.metadata,
      };
    if (updateData.sentAt) notification.sentAt = updateData.sentAt;

    await notification.save();

    const notificationData = await NotificationModel.findById(
      notification._id
    ).lean();
    if (!notificationData) {
      const errorResponse: TServerError = {
        message: "Failed to retrieve notification",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    const responseData: TNotificationResponse = {
      success: true,
      data: {
        _id: notificationData._id.toString(),
        userId: notificationData.userId.toString(),
        type: notificationData.type,
        status: notificationData.status,
        title: notificationData.title,
        message: notificationData.message,
        metadata: notificationData.metadata,
        sentAt: notificationData.sentAt?.toISOString(),
        createdAt: notificationData.createdAt.toISOString(),
        updatedAt: notificationData.updatedAt.toISOString(),
      },
    };

    const responseValidation =
      notificationResponseSchema.safeParse(responseData);
    if (!responseValidation.success) {
      console.warn("Response validation failed:", responseValidation.error);
      const errorResponse: TServerError = {
        message: "Invalid response format",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    return res.status(200).json(responseValidation.data);
  } catch (error) {
    console.warn("Update notification error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.delete(
  "/delete/:notificationId",
  async (req: Request, res: Response) => {
    try {
      const decoded = checkAuth(req);
      if ("message" in decoded) return res.status(401).json(decoded);

      const user = await AuthModel.findById(decoded.userId);
      if (!user) {
        const errorResponse: TNotFoundError = {
          message: "User not found",
        };
        const validatedError = notFoundErrorSchema.parse(errorResponse);
        return res.status(404).json(validatedError);
      }

      const { notificationId } = req.params;
      if (!notificationId) {
        const errorResponse: TValidationError = {
          message: "Validation error",
          errors: [
            {
              code: "invalid_type",
              message: "notificationId is required",
              path: ["notificationId"],
            },
          ],
        };
        const validatedError = validationErrorSchema.parse(errorResponse);
        return res.status(400).json(validatedError);
      }

      const notification = await NotificationModel.findOneAndDelete({
        _id: notificationId,
        userId: user._id,
      });

      if (!notification) {
        const errorResponse: TNotFoundError = {
          message: "Notification not found",
        };
        const validatedError = notFoundErrorSchema.parse(errorResponse);
        return res.status(404).json(validatedError);
      }

      const responseData: TDeleteNotificationResponse = {
        success: true,
        message: "Notification deleted successfully",
      };

      const responseValidation =
        deleteNotificationResponseSchema.safeParse(responseData);
      if (!responseValidation.success) {
        console.warn("Response validation failed:", responseValidation.error);
        const errorResponse: TServerError = {
          message: "Invalid response format",
        };
        const validatedError = serverErrorSchema.parse(errorResponse);
        return res.status(500).json(validatedError);
      }

      return res.status(200).json(responseValidation.data);
    } catch (error) {
      console.warn("Delete notification error:", error);

      const errorResponse: TServerError = {
        message: "Server error: " + error,
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }
  }
);

export default router;
