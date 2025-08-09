import { Router, Request, Response } from "express";
import { createHash, createHmac } from "crypto";
import dotenv from "dotenv";
import mongoose from "mongoose";

// constants
import {
  TELEGRAM_CLOSE_PAGE_HTML,
  TELEGRAM_CLOSE_PAGE_ERROR_HTML,
  TELEGRAM_FRAGMENT_PROCESSOR_HTML,
  TELEGRAM_SUCCESS_PAGE_HTML,
  TELEGRAM_ERROR_PAGE_HTML,
} from "./auth-telegram.constants";

// models
import UserModel from "../users/users.model";
import axios from "axios";

dotenv.config();
const router = Router();

function validateTelegramAuth(authData: any, botToken: string): boolean {
  const { hash, ...dataToCheck } = authData;
  if (!hash) return false;

  const dataCheckString = Object.keys(dataToCheck)
    .filter(
      (key) => dataToCheck[key] !== undefined && dataToCheck[key] !== null
    )
    .sort()
    .map((key) => `${key}=${dataToCheck[key]}`)
    .join("\n");
  const secretKey = createHash("sha256").update(botToken).digest();
  const hmac = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return hmac === hash;
}

router.get("/login", async (req: Request, res: Response) => {
  try {
    const botId =
      process.env.TELEGRAM_BOT_ID || process.env.EXPO_PUBLIC_TELEGRAM_BOT_ID;
    const originDomain =
      process.env.TELEGRAM_ORIGIN_DOMAIN ||
      process.env.EXPO_PUBLIC_TELEGRAM_ORIGIN_DOMAIN;
    const redirectUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/auth-telegram/redirect`;
    if (!botId) return res.status(500).json({ error: "Bot ID not configured" });

    const validOriginDomain = originDomain || req.get("host") || "localhost";
    const telegramOAuthUrl = `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${encodeURIComponent(
      validOriginDomain
    )}&embed=1&request_access=write&return_to=${encodeURIComponent(
      redirectUrl
    )}`;

    res.redirect(telegramOAuthUrl);
    return;
  } catch (error) {
    console.error("Error redirecting to Telegram OAuth:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
});

router.get("/close", async (req: Request, res: Response) => {
  try {
    const authData = req.query["auth-data"];
    const error = req.query["error"];
    const isSuccess = authData && !error;
    if (isSuccess) res.send(TELEGRAM_CLOSE_PAGE_HTML);
    else res.send(TELEGRAM_CLOSE_PAGE_ERROR_HTML);
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/redirect", async (req: Request, res: Response) => {
  try {
    const { id, username, first_name, last_name, photo_url, auth_date, hash } =
      req.query;

    if (!id || !auth_date || !hash) {
      res.set({
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        ETag: Math.random().toString(),
      });

      res.send(TELEGRAM_FRAGMENT_PROCESSOR_HTML);
      return;
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      res.redirect(`telegate://auth-error?error=server_config`);
      return;
    }

    const authData = {
      id: id as string,
      username: username as string,
      first_name: first_name as string,
      last_name: last_name as string,
      photo_url: photo_url as string,
      auth_date: auth_date as string,
      hash: hash as string,
    };

    if (!validateTelegramAuth(authData, botToken)) {
      res.redirect(`telegate://auth-error?error=invalid_signature`);
      return;
    }

    const authDateTimestamp = parseInt(auth_date as string);
    const now = Math.floor(Date.now() / 1000);
    const maxAge = 24 * 60 * 60;
    if (now - authDateTimestamp > maxAge) {
      res.redirect(`telegate://auth-error?error=expired`);
      return;
    }

    const telegramId = parseInt(id as string);
    const token = `token_${telegramId}_${Date.now()}`;

    let user = await UserModel.findOne({ telegramId }).lean();

    if (user) {
      await UserModel.findByIdAndUpdate(user._id, {
        username: (username as string) || user.username,
        firstName: (first_name as string) || user.firstName,
        lastName: (last_name as string) || user.lastName,
        photoUrl: (photo_url as string) || user.photoUrl,
        lastActivityAt: new Date(),
        isActive: true,
        updatedAt: new Date(),
      });
    } else {
      const _id = new mongoose.Types.ObjectId();
      await UserModel.create({
        _id,
        telegramId,
        username: (username as string) || null,
        firstName: (first_name as string) || null,
        lastName: (last_name as string) || null,
        photoUrl: (photo_url as string) || null,
        lastActivityAt: new Date(),
        isActive: true,
      });
    }

    const userAgent = req.get("User-Agent") || "";
    const isMobile =
      userAgent.includes("Expo") || userAgent.includes("TeleGate");
    if (isMobile) {
      const deepLink = `telegate://auth-success?token=${token}&userId=${telegramId}&username=${
        (username as string) || ""
      }&firstName=${(first_name as string) || ""}&lastName=${
        (last_name as string) || ""
      }&photoUrl=${(photo_url as string) || ""}`;

      res.redirect(deepLink);
    } else {
      res.send(
        TELEGRAM_SUCCESS_PAGE_HTML.replace(
          "<h3>User Data:</h3>",
          `<h3>User Data:</h3>
         <p><strong>ID:</strong> ${telegramId}</p>
         <p><strong>Username:</strong> ${(username as string) || "N/A"}</p>
         <p><strong>Name:</strong> ${(first_name as string) || ""} ${
            (last_name as string) || ""
          }</p>
         <p><strong>Token:</strong> ${token}</p>`
        ).replace(
          "<p><strong>Deep Link (for mobile app):</strong></p>",
          `<p><strong>Deep Link (for mobile app):</strong></p>
         <code style="word-break: break-all;">telegate://auth-success?token=${token}&userId=${telegramId}&username=${
            (username as string) || ""
          }&firstName=${(first_name as string) || ""}&lastName=${
            (last_name as string) || ""
          }&photoUrl=${(photo_url as string) || ""}</code>`
        )
      );
    }
    return;
  } catch (error) {
    console.error("Error during redirect:", error);
    const userAgent = req.get("User-Agent") || "";
    const isMobileError =
      userAgent.includes("Expo") || userAgent.includes("TeleGate");

    if (isMobileError) res.redirect(`telegate://auth-error?error=server_error`);
    else res.send(TELEGRAM_ERROR_PAGE_HTML);

    return;
  }
});

router.post("/redirect", async (req: Request, res: Response) => {
  try {
    const params = { ...req.query, ...req.body };
    const { id, username, first_name, last_name, photo_url, auth_date, hash } =
      params;
    if (!id || !auth_date || !hash) {
      res.send(TELEGRAM_FRAGMENT_PROCESSOR_HTML);
      return;
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      res.redirect(`telegate://auth-error?error=server_config`);
      return;
    }

    const authData = {
      id: id as string,
      username: username as string,
      first_name: first_name as string,
      last_name: last_name as string,
      photo_url: photo_url as string,
      auth_date: auth_date as string,
      hash: hash as string,
    };
    if (!validateTelegramAuth(authData, botToken)) {
      res.redirect(`telegate://auth-error?error=invalid_signature`);
      return;
    }

    const authDateTimestamp = parseInt(auth_date as string);
    const now = Math.floor(Date.now() / 1000);
    const maxAge = 24 * 60 * 60;
    if (now - authDateTimestamp > maxAge) {
      res.redirect(`telegate://auth-error?error=expired`);
      return;
    }

    const telegramId = parseInt(id as string);
    const token = `token_${telegramId}_${Date.now()}`;

    let user = await UserModel.findOne({ telegramId }).lean();

    if (user) {
      await UserModel.findByIdAndUpdate(user._id, {
        username: (username as string) || user.username,
        firstName: (first_name as string) || user.firstName,
        lastName: (last_name as string) || user.lastName,
        photoUrl: (photo_url as string) || user.photoUrl,
        lastActivityAt: new Date(),
        isActive: true,
        updatedAt: new Date(),
      });
    } else {
      const _id = new mongoose.Types.ObjectId();
      await UserModel.create({
        _id,
        telegramId,
        username: (username as string) || null,
        firstName: (first_name as string) || null,
        lastName: (last_name as string) || null,
        photoUrl: (photo_url as string) || null,
        lastActivityAt: new Date(),
        isActive: true,
      });
    }

    res.redirect(
      `telegate://auth-success?token=${token}&userId=${telegramId}&username=${
        (username as string) || ""
      }&firstName=${(first_name as string) || ""}&lastName=${
        (last_name as string) || ""
      }&photoUrl=${(photo_url as string) || ""}`
    );
  } catch (error) {
    console.error("Error during POST redirect:", error);
    res.redirect(`telegate://auth-error?error=server_error`);
  }
});

router.get("/user-groups/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken)
      return res.status(500).json({ error: "Bot token not configured" });
    if (!userId || isNaN(parseInt(userId)))
      return res.status(400).json({ error: "Invalid user ID" });
    const telegramUserId = parseInt(userId);
    const { data } = await axios(
      `https://api.telegram.org/bot${botToken}/getChat?chat_id=${telegramUserId}`
    );
    if (!data || !data.ok)
      return res.status(404).json({ error: "User not found" });

    // Тут мав би бути код для отримання всіх груп де користувач є власником
    // Але Telegram Bot API не дозволяє отримати список всіх груп користувача
    // Потрібно зберігати інформацію про групи в базі даних при додаванні бота в групи

    return res.json({
      success: true,
      message: "Feature requires bot to be added to groups to track them",
      userInfo: data.result,
      groups: [],
    });
  } catch (error) {
    console.error("Error fetching user groups:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
