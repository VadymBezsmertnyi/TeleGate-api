import { Router, Request, Response } from "express";
import mongoose from "mongoose";

import { pushTokenSchema } from "./push-tokens.schemas";
import PushTokenModel from "./push-tokens.model";
import UserModel from "./users.model";
import { validateTelegramToken } from "../../helpers/telegram.helper";
import pushTokensTestRouter from "./push-tokens.test";

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

    const { token: pushToken, platform } = validationResult.data;
    const existingToken = await PushTokenModel.findOne({ token: pushToken });
    if (existingToken) {
      if (existingToken.userId.toString() === user._id.toString()) {
        await PushTokenModel.findByIdAndUpdate(existingToken._id, {
          platform,
          isActive: true,
          updatedAt: new Date(),
        });
        return res.status(200).json({ message: "Token updated successfully" });
      } else
        return res
          .status(409)
          .json({ error: "Token already exists for another user" });
    }

    const _id = new mongoose.Types.ObjectId();
    await PushTokenModel.create({
      _id,
      userId: user._id,
      token: pushToken,
      platform,
      isActive: true,
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

    return res.status(200).json({ message: "Push token deleted successfully" });
  } catch (error) {
    console.error("Error deleting push token:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.use("/test", pushTokensTestRouter);

export default router;
