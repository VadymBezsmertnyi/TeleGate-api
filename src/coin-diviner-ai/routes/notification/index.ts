import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import {
  notificationSettingsSchema,
  updateNotificationSettingsSchema,
  addPushTokenSchema,
  removePushTokenSchema,
} from "./notification.schemas";
import NotificationSettingsModel from "./notification.model";
import { checkAuth } from "../../hooks/auth";
import {
  returnNotificationError,
  NotificationErrorCode,
} from "./notification.helpers";
import "./notification.swagger";

dotenv.config();
const router = Router();

router.get("/settings", async (req: Request, res: Response) => {
  try {
    const decoded = checkAuth(req);
    if ("message" in decoded) return res.status(401).json(decoded);

    let settings = await NotificationSettingsModel.findOne({
      userId: decoded.userId,
    });
    if (!settings)
      settings = await NotificationSettingsModel.create({
        userId: decoded.userId,
        pushTokens: [],
        enabledTypes: {
          push: true,
          sms: false,
          telegram: false,
        },
      });

    const resultCheckZod = notificationSettingsSchema.safeParse(settings);
    if (!resultCheckZod.success)
      return returnNotificationError(
        res,
        405,
        "Data validation error",
        NotificationErrorCode.DATA_VALIDATION_ERROR
      );

    return res.status(200).json({ data: resultCheckZod.data });
  } catch (error) {
    console.warn("Get notification settings error:", error);
    return returnNotificationError(
      res,
      500,
      "Server error",
      NotificationErrorCode.SERVER_ERROR
    );
  }
});

router.put("/settings", async (req: Request, res: Response) => {
  try {
    const decoded = checkAuth(req);
    if ("message" in decoded) return res.status(401).json(decoded);

    const validationResult = updateNotificationSettingsSchema.safeParse(
      req.body
    );
    if (!validationResult.success)
      return returnNotificationError(
        res,
        400,
        "Validation error",
        NotificationErrorCode.VALIDATION_ERROR,
        validationResult.error.issues
      );

    let settings = await NotificationSettingsModel.findOne({
      userId: decoded.userId,
    });
    if (!settings)
      settings = await NotificationSettingsModel.create({
        userId: decoded.userId,
        pushTokens: [],
        enabledTypes: {
          push: true,
          sms: false,
          telegram: false,
        },
      });

    const updateData: any = {};
    if (validationResult.data.smsPhone !== undefined)
      updateData.smsPhone = validationResult.data.smsPhone;
    if (validationResult.data.telegramChatId !== undefined)
      updateData.telegramChatId = validationResult.data.telegramChatId;
    if (validationResult.data.enabledTypes)
      updateData.enabledTypes = {
        ...settings.enabledTypes,
        ...validationResult.data.enabledTypes,
      };

    const updatedSettings = await NotificationSettingsModel.findByIdAndUpdate(
      settings._id,
      updateData,
      { new: true }
    );
    const resultCheckZod =
      notificationSettingsSchema.safeParse(updatedSettings);
    if (!resultCheckZod.success)
      return returnNotificationError(
        res,
        405,
        "Data validation error",
        NotificationErrorCode.DATA_VALIDATION_ERROR
      );

    return res.status(200).json({
      message: "Notification settings updated successfully",
      data: resultCheckZod.data,
    });
  } catch (error) {
    console.warn("Update notification settings error:", error);
    return returnNotificationError(
      res,
      500,
      "Server error",
      NotificationErrorCode.SERVER_ERROR
    );
  }
});

router.post("/push-token", async (req: Request, res: Response) => {
  try {
    const decoded = checkAuth(req);
    if ("message" in decoded) return res.status(401).json(decoded);

    const validationResult = addPushTokenSchema.safeParse(req.body);
    if (!validationResult.success)
      return returnNotificationError(
        res,
        400,
        "Validation error",
        NotificationErrorCode.VALIDATION_ERROR,
        validationResult.error.issues
      );

    let settings = await NotificationSettingsModel.findOne({
      userId: decoded.userId,
    });
    if (!settings)
      settings = await NotificationSettingsModel.create({
        userId: decoded.userId,
        pushTokens: [],
        enabledTypes: {
          push: true,
          sms: false,
          telegram: false,
        },
      });

    const existingTokenIndex = settings.pushTokens.findIndex(
      (t) => t.token === validationResult.data.token
    );
    if (
      existingTokenIndex !== -1 &&
      settings.pushTokens &&
      settings.pushTokens.length > 0
    ) {
      settings.pushTokens[existingTokenIndex].token =
        validationResult.data.token;
      settings.pushTokens[existingTokenIndex].platform =
        validationResult.data.platform;
      if (validationResult.data.deviceId !== undefined)
        settings.pushTokens[existingTokenIndex].deviceId =
          validationResult.data.deviceId;
    } else settings.pushTokens.push(validationResult.data as any);

    await settings.save();

    const resultCheckZod = notificationSettingsSchema.safeParse(settings);
    if (!resultCheckZod.success)
      return returnNotificationError(
        res,
        405,
        "Data validation error",
        NotificationErrorCode.DATA_VALIDATION_ERROR
      );

    return res.status(200).json({
      message: "Push token added successfully",
      data: resultCheckZod.data,
    });
  } catch (error) {
    console.warn("Add push token error:", error);
    return returnNotificationError(
      res,
      500,
      "Server error",
      NotificationErrorCode.SERVER_ERROR
    );
  }
});

router.delete("/push-token", async (req: Request, res: Response) => {
  try {
    const decoded = checkAuth(req);
    if ("message" in decoded) return res.status(401).json(decoded);

    const validationResult = removePushTokenSchema.safeParse(req.body);
    if (!validationResult.success) {
      return returnNotificationError(
        res,
        400,
        "Validation error",
        NotificationErrorCode.VALIDATION_ERROR,
        validationResult.error.issues
      );
    }

    const settings = await NotificationSettingsModel.findOne({
      userId: decoded.userId,
    });

    if (!settings) {
      return returnNotificationError(
        res,
        404,
        "Settings not found",
        NotificationErrorCode.SETTINGS_NOT_FOUND
      );
    }

    const tokenIndex = settings.pushTokens.findIndex(
      (t) => t.token === validationResult.data.token
    );

    if (tokenIndex === -1) {
      return returnNotificationError(
        res,
        404,
        "Push token not found",
        NotificationErrorCode.PUSH_TOKEN_NOT_FOUND
      );
    }

    settings.pushTokens.splice(tokenIndex, 1);
    await settings.save();

    return res.status(200).json({
      message: "Push token removed successfully",
    });
  } catch (error) {
    console.warn("Remove push token error:", error);
    return returnNotificationError(
      res,
      500,
      "Server error",
      NotificationErrorCode.SERVER_ERROR
    );
  }
});

export default router;
