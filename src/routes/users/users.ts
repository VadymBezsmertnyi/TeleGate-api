import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

import { userPublicSchema } from "./users.schemas";
import UserModel from "./users.model";
import { validateTelegramToken } from "../../helpers/telegram.helper";

dotenv.config();
const router = Router();

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
    const resultCheckZod = userPublicSchema.safeParse(userData);
    if (!resultCheckZod.success)
      return res.status(500).json({ error: "Data validation error" });

    res.json(resultCheckZod.data);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
  return;
});

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await UserModel.findOne({
      telegramId: parseInt(id),
      isActive: true,
    }).lean();

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const userData = {
      id: user.telegramId,
      username: user.username,
      first_name: user.firstName,
      last_name: user.lastName,
      photo_url: user.photoUrl,
    };

    const resultCheckZod = userPublicSchema.safeParse(userData);
    if (!resultCheckZod.success) {
      res.status(500).json({ error: "Data validation error" });
      return;
    }

    res.send({
      result: true,
      data: {
        user: resultCheckZod.data,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send({ message: "Internal server error", error });
  }
});

router.get("/", async (req: Request, res: Response) => {
  const { limit = 20, offset = 0 } = req.query as {
    limit?: number;
    offset?: number;
  };

  try {
    const users = await UserModel.find({ isActive: true })
      .sort({ lastActivityAt: -1 })
      .limit(Number(limit))
      .skip(Number(offset))
      .lean();

    const usersData = users.map((user) => ({
      id: user.telegramId,
      username: user.username,
      first_name: user.firstName,
      last_name: user.lastName,
      photo_url: user.photoUrl,
    }));

    const totalCount = await UserModel.countDocuments({ isActive: true });

    res.send({
      result: true,
      data: {
        users: usersData,
        count: usersData.length,
        total: totalCount,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send({ message: "Internal server error", error });
  }
});

router.put("/deactivate/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await UserModel.findOneAndUpdate(
      { telegramId: parseInt(id) },
      {
        isActive: false,
        updatedAt: new Date(),
      },
      { new: true }
    ).lean();

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.send({
      result: true,
      data: {
        user: {
          id: user.telegramId,
          isActive: user.isActive,
        },
      },
    });
  } catch (error) {
    console.error("Error deactivating user:", error);
    res.status(500).send({ message: "Internal server error", error });
  }
});

export default router;
