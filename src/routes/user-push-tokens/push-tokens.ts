import { Router, Request, Response } from "express";
import mongoose from "mongoose";

import { pushTokenSchema, testNotificationSchema } from "./push-tokens.schemas";
import PushTokenModel from "./push-tokens.model";
import UserModel from "../users/users.model";
import { validateTelegramToken } from "../../helpers/telegram.helper";
import { sendPushNotification } from "../../helpers/firebase.helper";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res
        .status(401)
        .json({ error: "Missing or invalid authorization header" });

    const token = authHeader.substring(7);
    if (!token) return res.status(401).json({ error: "Missing token" });

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken)
      return res.status(501).json({ error: "Bot token not configured" });

    const telegramValidation = await validateTelegramToken(token, botToken);
    if (!telegramValidation.isValid || !telegramValidation.userData)
      return res.status(401).json({ error: "Invalid or expired token" });

    const telegramUser = telegramValidation.userData;

    const user = await UserModel.findOne({
      telegramId: telegramUser.id,
      isActive: true,
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const validationResult = pushTokenSchema.safeParse(req.body);
    if (!validationResult.success)
      return res.status(400).json({
        error: "Validation error",
        details: validationResult.error.issues,
      });

    const {
      token: pushToken,
      platform,
      deviceBrand,
      deviceModel,
      isSimulator,
    } = validationResult.data;
    const existingToken = await PushTokenModel.findOne({ token: pushToken });
    if (existingToken) {
      if (existingToken.userId.toString() === user._id.toString()) {
        await PushTokenModel.findByIdAndUpdate(existingToken._id, {
          platform,
          deviceBrand,
          deviceModel,
          isSimulator,
          isActive: true,
          updatedAt: new Date(),
        });
        await UserModel.findByIdAndUpdate(user._id, {
          $addToSet: { pushTokens: existingToken._id },
        });

        return res.status(200).json({ message: "Token updated successfully" });
      } else
        return res
          .status(409)
          .json({ error: "Token already exists for another user" });
    }

    const _id = new mongoose.Types.ObjectId();
    const newPushToken = await PushTokenModel.create({
      _id,
      userId: user._id,
      token: pushToken,
      platform,
      deviceBrand,
      deviceModel,
      isSimulator,
      isActive: true,
    });
    await UserModel.findByIdAndUpdate(user._id, {
      $addToSet: { pushTokens: newPushToken._id },
    });

    return res
      .status(201)
      .json({ message: "Push token registered successfully" });
  } catch (error) {
    console.error("Error registering push token:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:token", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res
        .status(401)
        .json({ error: "Missing or invalid authorization header" });

    const token = authHeader.substring(7);
    if (!token) return res.status(401).json({ error: "Missing token" });

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken)
      return res.status(501).json({ error: "Bot token not configured" });

    const telegramValidation = await validateTelegramToken(token, botToken);
    if (!telegramValidation.isValid || !telegramValidation.userData)
      return res.status(401).json({ error: "Invalid or expired token" });

    const telegramUser = telegramValidation.userData;
    const { token: pushToken } = req.params;
    if (!pushToken)
      return res.status(400).json({ error: "Push token is required" });

    const user = await UserModel.findOne({
      telegramId: telegramUser.id,
      isActive: true,
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const pushTokenDoc = await PushTokenModel.findOne({
      token: pushToken,
      userId: user._id,
    });
    if (!pushTokenDoc)
      return res.status(404).json({ error: "Push token not found" });

    await PushTokenModel.findByIdAndDelete(pushTokenDoc._id);
    await UserModel.findByIdAndUpdate(user._id, {
      $pull: { pushTokens: pushTokenDoc._id },
    });

    return res.status(200).json({ message: "Push token deleted successfully" });
  } catch (error) {
    console.error("Error deleting push token:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res
        .status(401)
        .json({ error: "Missing or invalid authorization header" });

    const token = authHeader.substring(7);
    if (!token) return res.status(401).json({ error: "Missing token" });

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken)
      return res.status(501).json({ error: "Bot token not configured" });

    const telegramValidation = await validateTelegramToken(token, botToken);
    if (!telegramValidation.isValid || !telegramValidation.userData)
      return res.status(401).json({ error: "Invalid or expired token" });

    const telegramUser = telegramValidation.userData;
    const user = await UserModel.findOne({
      telegramId: telegramUser.id,
      isActive: true,
    }).populate("pushTokens");
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.status(200).json({
      message: "Push tokens retrieved successfully",
      data: user.pushTokens || [],
    });
  } catch (error) {
    console.error("Error fetching push tokens:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/test-notification", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res
        .status(401)
        .json({ error: "Missing or invalid authorization header" });

    const token = authHeader.substring(7);
    if (!token) return res.status(401).json({ error: "Missing token" });

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken)
      return res.status(501).json({ error: "Bot token not configured" });

    const telegramValidation = await validateTelegramToken(token, botToken);
    if (!telegramValidation.isValid || !telegramValidation.userData)
      return res.status(401).json({ error: "Invalid or expired token" });

    const telegramUser = telegramValidation.userData;
    const user = await UserModel.findOne({
      telegramId: telegramUser.id,
      isActive: true,
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const validationResult = testNotificationSchema.safeParse(req.body);
    if (!validationResult.success)
      return res.status(400).json({
        error: "Validation error",
        details: validationResult.error.issues,
      });

    const { message, title } = validationResult.data;
    const allActiveTokens = await PushTokenModel.find({ isActive: true });
    const tokens = allActiveTokens.map((token) => token.token);
    if (tokens.length === 0)
      return res.status(404).json({
        error: "No active push tokens found",
        message: "No users have registered push tokens",
      });

    const response = await sendPushNotification(tokens, message, title);
    if (response.failureCount > 0) {
      const failedTokens = response.responses
        .map((resp, idx) => (!resp.success ? tokens[idx] : null))
        .filter(Boolean);
      if (failedTokens.length > 0) {
        const failedTokenDocs = await PushTokenModel.find({
          token: { $in: failedTokens },
        });
        if (failedTokenDocs.length > 0) {
          const failedTokenIds = failedTokenDocs.map((doc) => doc._id);
          const deleteResult = await PushTokenModel.deleteMany({
            _id: { $in: failedTokenIds },
          });
          await UserModel.updateMany(
            { pushTokens: { $exists: true } },
            { $pull: { pushTokens: { $in: failedTokenIds } } }
          );
          console.warn(
            `Removed ${deleteResult.deletedCount} invalid tokens from database`
          );
        }
      }
    }

    return res.status(200).json({
      message: "Test notification sent successfully",
      data: {
        totalTokens: tokens.length,
        successCount: response.successCount,
        failureCount: response.failureCount,
        sentMessage: message,
        sentTitle: title || "TeleGate",
      },
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
