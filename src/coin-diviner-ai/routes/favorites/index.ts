import { Router, Request, Response } from "express";
import dotenv from "dotenv";

import {
  addFavoriteSchema,
  favoriteResponseSchema,
  favoriteListResponseSchema,
  deleteResponseSchema,
  checkFavoriteResponseSchema,
} from "./favorites.schemas";
import {
  notFoundErrorSchema,
  serverErrorSchema,
  validationErrorSchema,
} from "../aggregator/aggregator.schemas";

import type {
  TAddFavorite,
  TFavoriteResponse,
  TFavoriteListResponse,
  TDeleteResponse,
  TCheckFavoriteResponse,
} from "./favorites.types";
import type {
  TNotFoundError,
  TServerError,
  TValidationError,
} from "../aggregator/aggregator.types";
import { ErrorCode } from "../auth/auth.helps";

import FavoriteModel from "./favorites.model";
import CryptoCoinModel from "../aggregator/aggregator.model";
import AuthModel from "../auth/auth.model";

import { checkAuth } from "../../hooks/auth";
import { getDataFavoriteData } from "./favorites.helps";

import "./favorites.swagger";

dotenv.config();
const router = Router();

router.post("/add", async (req: Request, res: Response) => {
  try {
    const decoded = checkAuth(req);
    if ("message" in decoded) return res.status(401).json(decoded);

    const user = await AuthModel.findById(decoded.userId);
    if (!user) {
      const errorResponse: TNotFoundError = {
        message: "User not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const validationResult = addFavoriteSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: validationResult.error.issues,
        code: ErrorCode.INVALID_PARAMS,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const { coinId }: TAddFavorite = validationResult.data;

    const cryptoCoin = await CryptoCoinModel.findById(coinId);
    if (!cryptoCoin) {
      const errorResponse: TNotFoundError = {
        message: "Crypto coin not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const existingFavorite = await FavoriteModel.findOne({
      userId: user._id,
      coinId: cryptoCoin._id,
    });

    if (existingFavorite) {
      const errorResponse: TValidationError = {
        message: "Монета вже в улюблених",
        errors: [
          {
            code: "custom",
            message: "Монета вже додана до улюблених",
            path: ["coinId"],
          },
        ],
        code: ErrorCode.INVALID_PARAMS,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const newFavorite = await FavoriteModel.create({
      userId: user._id,
      coinId: cryptoCoin._id,
    });

    const favorite = await FavoriteModel.findById(newFavorite._id)
      .populate("coinId")
      .lean();
    if (!favorite) {
      const errorResponse: TServerError = {
        message: "Failed to create favorite",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    const data = getDataFavoriteData(favorite);
    const responseData: TFavoriteResponse = { success: true, data };
    const responseValidation = favoriteResponseSchema.safeParse(responseData);
    if (!responseValidation.success) {
      console.warn("❌ Response validation failed:", responseValidation.error);
      const errorResponse: TServerError = {
        message: "Invalid response format",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    return res.status(200).json(responseValidation.data);
  } catch (error) {
    console.warn("Add favorite error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.get("/list", async (req: Request, res: Response) => {
  try {
    const decoded = checkAuth(req);
    if ("message" in decoded) return res.status(401).json(decoded);

    const user = await AuthModel.findById(decoded.userId);
    if (!user) {
      const errorResponse: TNotFoundError = {
        message: "User not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const view = req.query.view as string | undefined;
    const shouldPopulateCoin = view === "all";

    let query = FavoriteModel.find({ userId: user._id }).sort({
      createdAt: -1,
    });
    if (shouldPopulateCoin) query = query.populate("coinId");

    const favorites = await query.lean();
    const data = favorites
      .map((favorite) => getDataFavoriteData(favorite))
      .filter((favorite) => favorite !== null);
    const responseData: TFavoriteListResponse = { success: true, data };
    const responseValidation =
      favoriteListResponseSchema.safeParse(responseData);
    if (!responseValidation.success) {
      console.warn("❌ Response validation failed:", responseValidation.error);
      const errorResponse: TServerError = {
        message: "Invalid response format",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    return res.status(200).json(responseValidation.data);
  } catch (error) {
    console.warn("Get favorites list error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.delete("/remove/:coinId", async (req: Request, res: Response) => {
  try {
    const decoded = checkAuth(req);
    if ("message" in decoded) return res.status(401).json(decoded);

    const user = await AuthModel.findById(decoded.userId);
    if (!user) {
      const errorResponse: TNotFoundError = {
        message: "User not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const { coinId } = req.params;
    if (!coinId) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: [
          {
            code: "invalid_type",
            message: "coinId is required",
            path: ["coinId"],
          },
        ],
        code: ErrorCode.INVALID_PARAMS,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const favorite = await FavoriteModel.findOne({
      userId: user._id,
      coinId,
    });

    if (!favorite) {
      const errorResponse: TNotFoundError = {
        message: "Favorite not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    await FavoriteModel.deleteOne({ _id: favorite._id });

    const responseData: TDeleteResponse = {
      success: true,
      message: "Favorite removed successfully",
    };
    const responseValidation = deleteResponseSchema.safeParse(responseData);
    if (!responseValidation.success) {
      console.warn("❌ Response validation failed:", responseValidation.error);
      const errorResponse: TServerError = {
        message: "Invalid response format",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    return res.status(200).json(responseValidation.data);
  } catch (error) {
    console.warn("Remove favorite error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.get("/check/:coinId", async (req: Request, res: Response) => {
  try {
    const decoded = checkAuth(req);
    if ("message" in decoded) return res.status(401).json(decoded);

    const user = await AuthModel.findById(decoded.userId);
    if (!user) {
      const errorResponse: TNotFoundError = {
        message: "User not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const { coinId } = req.params;
    if (!coinId) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: [
          {
            code: "invalid_type",
            message: "coinId is required",
            path: ["coinId"],
          },
        ],
        code: ErrorCode.INVALID_PARAMS,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const favorite = await FavoriteModel.findOne({
      userId: user._id,
      coinId,
    });

    const responseData: TCheckFavoriteResponse = {
      success: true,
      isFavorite: !!favorite,
    };
    const responseValidation =
      checkFavoriteResponseSchema.safeParse(responseData);
    if (!responseValidation.success) {
      console.warn("❌ Response validation failed:", responseValidation.error);
      const errorResponse: TServerError = {
        message: "Invalid response format",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    return res.status(200).json(responseValidation.data);
  } catch (error) {
    console.warn("Check favorite error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.post("/toggle", async (req: Request, res: Response) => {
  try {
    const decoded = checkAuth(req);
    if ("message" in decoded) return res.status(401).json(decoded);

    const user = await AuthModel.findById(decoded.userId);
    if (!user) {
      const errorResponse: TNotFoundError = {
        message: "User not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const validationResult = addFavoriteSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: validationResult.error.issues,
        code: ErrorCode.INVALID_PARAMS,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const { coinId }: TAddFavorite = validationResult.data;

    const cryptoCoin = await CryptoCoinModel.findById(coinId);
    if (!cryptoCoin) {
      const errorResponse: TNotFoundError = {
        message: "Crypto coin not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const existingFavorite = await FavoriteModel.findOne({
      userId: user._id,
      coinId: cryptoCoin._id,
    });

    if (existingFavorite) {
      await FavoriteModel.deleteOne({ _id: existingFavorite._id });

      const responseData: TCheckFavoriteResponse = {
        success: true,
        isFavorite: false,
      };
      const responseValidation =
        checkFavoriteResponseSchema.safeParse(responseData);
      if (!responseValidation.success) {
        console.warn(
          "❌ Response validation failed:",
          responseValidation.error
        );
        const errorResponse: TServerError = {
          message: "Invalid response format",
        };
        const validatedError = serverErrorSchema.parse(errorResponse);
        return res.status(500).json(validatedError);
      }

      return res.status(200).json(responseValidation.data);
    }

    await FavoriteModel.create({
      userId: user._id,
      coinId: cryptoCoin._id,
    });

    const responseData: TCheckFavoriteResponse = {
      success: true,
      isFavorite: true,
    };
    const responseValidation =
      checkFavoriteResponseSchema.safeParse(responseData);
    if (!responseValidation.success) {
      console.warn("❌ Response validation failed:", responseValidation.error);
      const errorResponse: TServerError = {
        message: "Invalid response format",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    return res.status(200).json(responseValidation.data);
  } catch (error) {
    console.warn("Toggle favorite error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

export default router;
