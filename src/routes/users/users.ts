import { Router, Request, Response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

import { userPublicSchema } from "./users.schemas";
import UserModel from "./users.model";
import { validateTelegramToken } from "../../helpers/telegram.helper";
import {
  linkUserWithMembersAndGroups,
  updateUserMembersAndGroups,
  getUserMembersAndGroups,
} from "./users.helper";

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

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken)
      return res.status(500).json({ error: "Bot token not configured" });

    const telegramValidation = await validateTelegramToken(token, botToken);
    if (!telegramValidation.isValid || !telegramValidation.userData)
      return res.status(401).json({ error: "Invalid or expired token" });

    const telegramUser = telegramValidation.userData;
    const now = new Date();

    let user = await UserModel.findOne({
      telegramId: telegramUser.id,
      isActive: true,
    }).lean();

    if (!user) {
      const _id = new mongoose.Types.ObjectId();
      const newUser = await UserModel.create({
        _id,
        telegramId: telegramUser.id,
        username: telegramUser.username || null,
        firstName: telegramUser.first_name || null,
        lastName: telegramUser.last_name || null,
        photoUrl: null,
        lastActivityAt: now,
        isActive: true,
      });

      user = newUser.toObject();

      await linkUserWithMembersAndGroups(
        telegramUser.id,
        _id.toString()
      );
    } else {
      await UserModel.findByIdAndUpdate(user._id, {
        username: telegramUser.username || user.username,
        firstName: telegramUser.first_name || user.firstName,
        lastName: telegramUser.last_name || user.lastName,
        lastActivityAt: now,
        updatedAt: now,
      });

      user = await UserModel.findById(user._id).lean();
      if (!user) return res.status(404).json({ error: "User not found" });

      await updateUserMembersAndGroups(telegramUser.id, user._id.toString());
    }
    if (!user)
      return res.status(500).json({ error: "Failed to create or update user" });

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

router.get("/me/full", async (req: Request, res: Response) => {
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
      return res.status(500).json({ error: "Bot token not configured" });

    const telegramValidation = await validateTelegramToken(token, botToken);
    if (!telegramValidation.isValid || !telegramValidation.userData)
      return res.status(401).json({ error: "Invalid or expired token" });

    const telegramUser = telegramValidation.userData;

    const user = await UserModel.findOne({
      telegramId: telegramUser.id,
      isActive: true,
    }).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const fullUserData = await getUserMembersAndGroups(user._id.toString());
    if (!fullUserData) {
      return res.status(500).json({ error: "Failed to get user data" });
    }

    res.json({
      result: true,
      data: fullUserData,
    });
    return;
  } catch (error) {
    console.error("Error fetching full user data:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
});

export default router;
