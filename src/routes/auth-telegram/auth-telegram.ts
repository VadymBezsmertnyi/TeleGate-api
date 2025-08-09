import { Router, Request, Response } from "express";
import { createHash, createHmac } from "crypto";
import dotenv from "dotenv";

// constants
import {
  TELEGRAM_CLOSE_PAGE_HTML,
  TELEGRAM_CLOSE_PAGE_ERROR_HTML,
  TELEGRAM_FRAGMENT_PROCESSOR_HTML,
  TELEGRAM_SUCCESS_PAGE_HTML,
  TELEGRAM_ERROR_PAGE_HTML,
} from "./auth-telegram.constants";

dotenv.config();
const router = Router();

interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  created_at: number;
}

const userTokens = new Map<string, TelegramUser>();

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

    const user = userTokens.get(token);
    if (!user)
      return res.status(401).json({ error: "Invalid or expired token" });

    const now = Math.floor(Date.now() / 1000);
    const tokenAge = now - Math.floor(user.created_at / 1000);
    const maxTokenAge = 30 * 24 * 60 * 60;
    if (tokenAge > maxTokenAge) {
      userTokens.delete(token);
      return res.status(401).json({ error: "Token expired" });
    }

    const userData = {
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      photo_url: user.photo_url,
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

    const authDate = parseInt(auth_date as string);
    const now = Math.floor(Date.now() / 1000);
    const maxAge = 24 * 60 * 60;
    if (now - authDate > maxAge) {
      res.redirect(`telegate://auth-error?error=expired`);
      return;
    }

    const user = {
      id: parseInt(id as string),
      username: username as string,
      first_name: first_name as string,
      last_name: last_name as string,
      photo_url: photo_url as string,
    };
    const token = `token_${user.id}_${Date.now()}`;

    const telegramUser: TelegramUser = {
      id: user.id,
      username: user.username || undefined,
      first_name: user.first_name || undefined,
      last_name: user.last_name || undefined,
      photo_url: user.photo_url || undefined,
      created_at: Date.now(),
    };

    userTokens.set(token, telegramUser);

    const userAgent = req.get("User-Agent") || "";
    const isMobile =
      userAgent.includes("Expo") || userAgent.includes("TeleGate");
    if (isMobile) {
      const deepLink = `telegate://auth-success?token=${token}&userId=${
        user.id
      }&username=${user.username || ""}&firstName=${
        user.first_name || ""
      }&lastName=${user.last_name || ""}&photoUrl=${user.photo_url || ""}`;

      res.redirect(deepLink);
    } else {
      res.send(
        TELEGRAM_SUCCESS_PAGE_HTML.replace(
          "<h3>User Data:</h3>",
          `<h3>User Data:</h3>
         <p><strong>ID:</strong> ${user.id}</p>
         <p><strong>Username:</strong> ${user.username || "N/A"}</p>
         <p><strong>Name:</strong> ${user.first_name} ${user.last_name}</p>
         <p><strong>Token:</strong> ${token}</p>`
        ).replace(
          "<p><strong>Deep Link (for mobile app):</strong></p>",
          `<p><strong>Deep Link (for mobile app):</strong></p>
         <code style="word-break: break-all;">telegate://auth-success?token=${token}&userId=${
            user.id
          }&username=${user.username || ""}&firstName=${
            user.first_name || ""
          }&lastName=${user.last_name || ""}&photoUrl=${
            user.photo_url || ""
          }</code>`
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

    const authDate = parseInt(auth_date as string);
    const now = Math.floor(Date.now() / 1000);
    const maxAge = 24 * 60 * 60;
    if (now - authDate > maxAge) {
      res.redirect(`telegate://auth-error?error=expired`);
      return;
    }

    const user = {
      id: parseInt(id as string),
      username: username as string,
      first_name: first_name as string,
      last_name: last_name as string,
      photo_url: photo_url as string,
    };
    const token = `token_${user.id}_${Date.now()}`;

    const telegramUser: TelegramUser = {
      id: user.id,
      username: user.username || undefined,
      first_name: user.first_name || undefined,
      last_name: user.last_name || undefined,
      photo_url: user.photo_url || undefined,
      created_at: Date.now(),
    };

    userTokens.set(token, telegramUser);

    res.redirect(
      `telegate://auth-success?token=${token}&userId=${user.id}&username=${
        user.username || ""
      }&firstName=${user.first_name || ""}&lastName=${
        user.last_name || ""
      }&photoUrl=${user.photo_url || ""}`
    );
  } catch (error) {
    console.error("Error during POST redirect:", error);
    res.redirect(`telegate://auth-error?error=server_error`);
  }
});

export default router;
