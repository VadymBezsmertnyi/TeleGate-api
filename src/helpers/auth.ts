import { Request } from "express";
import UserModel from "../routes/users/users.model";
import { validateTelegramToken } from "./telegram.helper";

export const getAuthenticatedUser = async (req: Request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.substring(7);
  if (!token) return null;

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return null;

  const telegramValidation = await validateTelegramToken(token, botToken);
  if (!telegramValidation.isValid || !telegramValidation.userData) return null;

  const user = await UserModel.findOne({
    telegramId: telegramValidation.userId,
    isActive: true,
  }).lean();

  return user;
};
