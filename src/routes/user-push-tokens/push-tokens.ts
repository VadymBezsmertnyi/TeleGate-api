import { Router, Request, Response } from "express";
import mongoose from "mongoose";

import { pushTokenSchema } from "./push-tokens.schemas";
import PushTokenModel from "./push-tokens.model";
import UserModel from "../users/users.model";
import { validateTelegramToken } from "../../helpers/telegram.helper";

const router = Router();

/**
 * @swagger
 * /users/push-tokens:
 *   post:
 *     summary: Реєстрація push-токена користувача
 *     description: Реєструє новий push-токен для отримання сповіщень на конкретній платформі
 *     tags: [Push Tokens]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PushToken'
 *           example:
 *             token: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
 *             platform: "ios"
 *     responses:
 *       201:
 *         description: Токен успішно зареєстровано
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               message: "Push token registered successfully"
 *       200:
 *         description: Токен успішно оновлено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               message: "Token updated successfully"
 *       400:
 *         description: Помилка валідації
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Неавторизований запит
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Користувач не знайдений
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Токен вже існує для іншого користувача
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Внутрішня помилка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /users/push-tokens/{token}:
 *   delete:
 *     summary: Видалення push-токена користувача
 *     description: Видаляє push-токен користувача за токеном
 *     tags: [Push Tokens]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Push-токен для видалення
 *         example: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
 *     responses:
 *       200:
 *         description: Токен успішно видалено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               message: "Push token deleted successfully"
 *       400:
 *         description: Токен не вказано
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Неавторизований запит
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Користувач або токен не знайдений
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Внутрішня помилка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /users/push-tokens:
 *   get:
 *     summary: Отримання push-токенів користувача
 *     description: Повертає всі активні push-токени поточного користувача
 *     tags: [Push Tokens]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Список push-токенів успішно отримано
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Push tokens retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PushTokenResponse'
 *       401:
 *         description: Неавторизований запит
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Користувач не знайдений
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Внутрішня помилка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

export default router;
