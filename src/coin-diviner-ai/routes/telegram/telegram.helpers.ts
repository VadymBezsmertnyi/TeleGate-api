import { Response } from "express";
import {
  TelegramErrorCode,
  TelegramErrorResponse,
  TelegramWebhookUpdate,
} from "./telegram.types";
import NotificationSettingsModel from "../notification/notification.model";
import AuthModel from "../auth/auth.model";

export const returnTelegramError = (
  res: Response,
  statusCode: number,
  message: string,
  code: TelegramErrorCode,
  details?: any
): Response => {
  const errorResponse: TelegramErrorResponse = {
    message,
    code,
  };
  if (details) errorResponse.details = details;
  return res.status(statusCode).json(errorResponse);
};

interface UpdateTelegramUserResult {
  success: boolean;
  userId?: string;
  message?: string;
}

export const updateTelegramUserData = async (
  webhookData: TelegramWebhookUpdate
): Promise<UpdateTelegramUserResult> => {
  try {
    const username =
      webhookData.message?.from?.username ||
      webhookData.callback_query?.from?.username;
    const chatId =
      webhookData.message?.chat?.id ||
      webhookData.callback_query?.message?.chat?.id;
    const firstName =
      webhookData.message?.from?.first_name ||
      webhookData.callback_query?.from?.first_name;
    const lastName =
      webhookData.message?.from?.last_name ||
      webhookData.callback_query?.from?.last_name;
    if (!username)
      return {
        success: false,
        message: "Username not found in webhook data",
      };
    if (!chatId)
      return {
        success: false,
        message: "Chat ID not found in webhook data",
      };

    const cleanUsername = username.replace(/^@/, "");
    const notificationSettings = await NotificationSettingsModel.findOne({
      "telegram.username": cleanUsername,
    });
    if (!notificationSettings)
      return {
        success: false,
        message: "User not found by username",
      };

    const user = await AuthModel.findById(notificationSettings.userId);
    if (!user)
      return {
        success: false,
        message: "Auth user not found",
      };

    const updatedSettings = await NotificationSettingsModel.findByIdAndUpdate(
      notificationSettings._id,
      {
        telegram: {
          chatId: chatId.toString(),
          firstName: firstName || "",
          lastName: lastName || "",
          username: cleanUsername,
        },
      },
      { new: true }
    );
    if (!updatedSettings)
      return {
        success: false,
        message: "Failed to update notification settings",
      };

    return {
      success: true,
      userId: user._id.toString(),
      message: "Telegram user data updated successfully",
    };
  } catch (error) {
    console.warn("Update telegram user data error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
