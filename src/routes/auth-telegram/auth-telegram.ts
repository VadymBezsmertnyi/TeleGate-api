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

    console.log("=== LOGIN ROUTE DEBUG ===");
    console.log("Bot ID:", botId);
    console.log("Origin Domain:", originDomain);
    console.log("Redirect URL:", redirectUrl);
    console.log("Telegram OAuth URL:", telegramOAuthUrl);
    console.log("=== END LOGIN DEBUG ===");
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
  console.log("=== REDIRECT ROUTE CALLED ===");
  console.log("Timestamp:", new Date().toISOString());
  try {
    const { id, username, first_name, last_name, photo_url, auth_date, hash } =
      req.query;
    console.log("Redirect params:", JSON.stringify(req.query));
    console.log("Request headers:", JSON.stringify(req.headers));
    console.log("Request URL:", req.url);
    console.log("Request method:", req.method);

    // Check if we have fragment data in URL
    const url = req.url || "";
    const fragmentMatch =
      url.match(/#tgAuthResult=([^&]+)/) || url.match(/#([^&]+)/);

    if (fragmentMatch) {
      console.log("Found fragment data:", fragmentMatch[1]);
      try {
        const encodedData = fragmentMatch[1];
        let decodedData;

        // Custom Base64 decoder fallback
        function customAtob(str: string): string {
          try {
            return atob(str);
          } catch (e) {
            const chars =
              "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            let output = "";
            str = String(str).replace(/=+$/, "");
            if (str.length % 4 === 1) {
              throw new Error("Invalid base64 string");
            }
            for (
              let bc = 0, bs = 0, buffer, i = 0;
              (buffer = str.charAt(i++));

            ) {
              if ((buffer = chars.indexOf(buffer))) {
                bs = bc % 4 ? bs * 64 + buffer : buffer;
                if (bc++ % 4)
                  output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)));
              }
            }
            return output;
          }
        }

        try {
          decodedData = customAtob(encodedData);
          console.log("Base64 decoded:", decodedData);
          console.log("Decoded data type:", typeof decodedData);
        } catch (e) {
          console.log(
            "Base64 decode failed:",
            e instanceof Error ? e.message : String(e)
          );
          try {
            decodedData = decodeURIComponent(encodedData);
            console.log("URL decoded:", decodedData);
          } catch (e2) {
            console.log(
              "URL decode also failed:",
              e2 instanceof Error ? e2.message : String(e2)
            );
            decodedData = encodedData;
            console.log("Using raw data:", decodedData);
          }
        }

        if (decodedData === "false") {
          console.log("Auth failed - received false from Telegram");
          console.log("Possible reasons:");
          console.log("1. User cancelled authorization");
          console.log("2. Bot ID is incorrect");
          console.log("3. Origin domain not allowed");
          console.log("4. Bot not properly configured");
          res.redirect(
            `telegate://auth-error?error=auth_denied&reason=user_cancelled`
          );
          return;
        }

        const authData = JSON.parse(decodedData);
        console.log("Parsed fragment auth data:", JSON.stringify(authData));

        // Use fragment data instead of query params
        const telegramId = parseInt(authData.id);
        const token = `token_${telegramId}_${Date.now()}`;

        let user = await UserModel.findOne({ telegramId }).lean();

        if (user) {
          await UserModel.findByIdAndUpdate(user._id, {
            username: authData.username || user.username,
            firstName: authData.first_name || user.firstName,
            lastName: authData.last_name || user.lastName,
            photoUrl: authData.photo_url || user.photoUrl,
            lastActivityAt: new Date(),
            isActive: true,
            updatedAt: new Date(),
          });
        } else {
          const _id = new mongoose.Types.ObjectId();
          await UserModel.create({
            _id,
            telegramId,
            username: authData.username || null,
            firstName: authData.first_name || null,
            lastName: authData.last_name || null,
            photoUrl: authData.photo_url || null,
            lastActivityAt: new Date(),
            isActive: true,
          });
        }

        const userAgent = req.get("User-Agent") || "";
        const isMobile =
          userAgent.includes("Expo") || userAgent.includes("TeleGate");

        if (isMobile) {
          const deepLink = `telegate://auth-success?token=${token}&userId=${telegramId}&username=${
            authData.username || ""
          }&firstName=${authData.first_name || ""}&lastName=${
            authData.last_name || ""
          }&photoUrl=${authData.photo_url || ""}`;
          res.redirect(deepLink);
        } else {
          res.send(
            TELEGRAM_SUCCESS_PAGE_HTML.replace(
              "<h3>User Data:</h3>",
              `<h3>User Data:</h3>
           <p><strong>ID:</strong> ${telegramId}</p>
           <p><strong>Username:</strong> ${authData.username || "N/A"}</p>
           <p><strong>Name:</strong> ${authData.first_name || ""} ${
                authData.last_name || ""
              }</p>
           <p><strong>Token:</strong> ${token}</p>`
            ).replace(
              "<p><strong>Deep Link (for mobile app):</strong></p>",
              `<p><strong>Deep Link (for mobile app):</strong></p>
           <code style="word-break: break-all;">telegate://auth-success?token=${token}&userId=${telegramId}&username=${
                authData.username || ""
              }&firstName=${authData.first_name || ""}&lastName=${
                authData.last_name || ""
              }&photoUrl=${authData.photo_url || ""}</code>`
            )
          );
        }
        return;
      } catch (error) {
        console.error("Error processing fragment data:", error);
      }
    }

    if (!id || !auth_date || !hash) {
      console.log("Missing required params, sending fragment processor");
      console.log("URL:", req.url);
      console.log("Query params:", req.query);
      console.log("Body:", req.body);
      res.set({
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        ETag: Math.random().toString(),
      });

      console.log("Sending fragment processor HTML");
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
    console.log("=== REDIRECT ROUTE ERROR END ===");
    const userAgent = req.get("User-Agent") || "";
    const isMobileError =
      userAgent.includes("Expo") || userAgent.includes("TeleGate");

    if (isMobileError) res.redirect(`telegate://auth-error?error=server_error`);
    else res.send(TELEGRAM_ERROR_PAGE_HTML);

    return;
  }
  console.log("=== REDIRECT ROUTE SUCCESS END ===");
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
