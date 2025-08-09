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

// helpers
import { validateTelegramToken } from "../../helpers/telegram.helper";

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

router.get("/me", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res
        .status(401)
        .json({ error: "Missing or invalid authorization header" });

    const token = authHeader.substring(7);
    if (!token) return res.status(401).json({ error: "Missing token" });

    let user = await UserModel.findOne({
      accessToken: token,
      isActive: true,
    }).lean();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken)
      return res.status(500).json({ error: "Bot token not configured" });

    if (!user) {
      const telegramValidation = await validateTelegramToken(token, botToken);
      if (!telegramValidation.isValid || !telegramValidation.userData)
        return res.status(401).json({ error: "Invalid or expired token" });

      const telegramUser = telegramValidation.userData;
      const now = new Date();
      const _id = new mongoose.Types.ObjectId();
      const newUser = await UserModel.create({
        _id,
        telegramId: telegramUser.id,
        username: telegramUser.username || null,
        firstName: telegramUser.first_name || null,
        lastName: telegramUser.last_name || null,
        photoUrl: null,
        accessToken: token,
        authDate: now,
        lastActivityAt: now,
        isActive: true,
      });

      user = newUser.toObject();
    } else {
      const now = new Date();
      const tokenAge = now.getTime() - user.authDate.getTime();
      const maxTokenAge = 30 * 24 * 60 * 60 * 1000;

      if (tokenAge > maxTokenAge) {
        const telegramValidation = await validateTelegramToken(token, botToken);

        if (!telegramValidation.isValid) {
          await UserModel.findByIdAndUpdate(user._id, { isActive: false });
          return res.status(401).json({ error: "Token expired and invalid" });
        }

        await UserModel.findByIdAndUpdate(user._id, {
          authDate: now,
          lastActivityAt: now,
          updatedAt: now,
        });
      } else
        await UserModel.findByIdAndUpdate(user._id, {
          lastActivityAt: now,
          updatedAt: now,
        });
    }

    console.log("User data:", user);
    const userData = {
      id: user.telegramId,
      username: user.username,
      first_name: user.firstName,
      last_name: user.lastName,
      photo_url: user.photoUrl,
    };

    res.json(userData);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
  return;
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
    const authDate = new Date(authDateTimestamp * 1000);

    let user = await UserModel.findOne({ telegramId }).lean();

    if (user) {
      await UserModel.findByIdAndUpdate(user._id, {
        username: (username as string) || user.username,
        firstName: (first_name as string) || user.firstName,
        lastName: (last_name as string) || user.lastName,
        photoUrl: (photo_url as string) || user.photoUrl,
        accessToken: token,
        authDate,
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
        accessToken: token,
        authDate,
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
    const authDate = new Date(authDateTimestamp * 1000);

    let user = await UserModel.findOne({ telegramId }).lean();

    if (user) {
      await UserModel.findByIdAndUpdate(user._id, {
        username: (username as string) || user.username,
        firstName: (first_name as string) || user.firstName,
        lastName: (last_name as string) || user.lastName,
        photoUrl: (photo_url as string) || user.photoUrl,
        accessToken: token,
        authDate,
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
        accessToken: token,
        authDate,
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

export default router;
