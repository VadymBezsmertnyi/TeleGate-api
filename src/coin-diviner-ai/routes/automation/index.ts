import { Router, Request, Response } from "express";
import dotenv from "dotenv";

// schemas
import {
  createAutomationSchema,
  updateAutomationSchema,
  automationResponseSchema,
  automationListResponseSchema,
  deleteResponseSchema,
} from "./automation.schemas";
import {
  notFoundErrorSchema,
  serverErrorSchema,
  validationErrorSchema,
} from "../aggregator/aggregator.schemas";

// types
import type {
  TCreateAutomation,
  TUpdateAutomation,
  TAutomationResponse,
  TAutomationListResponse,
  TDeleteResponse,
} from "./automation.types";
import type {
  TNotFoundError,
  TServerError,
  TValidationError,
} from "../aggregator/aggregator.types";
import { ErrorCode } from "../auth/auth.helps";

// models
import AutomationModel from "./automation.model";
import CryptoCoinModel from "../aggregator/aggregator.model";
import AuthModel from "../auth/auth.model";

// hooks
import AggregatorService from "../../hooks/aggregator";
import { checkAuth } from "../../hooks/auth";
import { getDataAutomationData } from "./automation.helps";

// swagger
import "./automation.swagger";

dotenv.config();
const router = Router();

router.post("/create", async (req: Request, res: Response) => {
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

    const validationResult = createAutomationSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: validationResult.error.issues,
        code: ErrorCode.INVALID_PARAMS,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const {
      coinId,
      type,
      target_price,
      activation_price,
      use_ai,
      enabled_notifications,
    }: TCreateAutomation = validationResult.data;
    if (target_price && activation_price) {
      const errorResponse: TValidationError = {
        message:
          "Не можна використовувати target_price та activation_price одночасно",
        errors: [
          {
            code: "custom",
            message:
              "Не можна використовувати target_price та activation_price одночасно",
            path: ["target_price", "activation_price"],
          },
        ],
        code: ErrorCode.INVALID_PARAMS,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const cryptoCoin = await CryptoCoinModel.findById(coinId);
    if (!cryptoCoin) {
      const errorResponse: TNotFoundError = {
        message: "Crypto coin not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const allPrices = await AggregatorService.getAllPrices(coinId);
    const prices = {
      binance: allPrices?.binance?.price
        ? {
            price: allPrices.binance.price,
            updatedAt:
              allPrices.binance.updatedAt instanceof Date
                ? allPrices.binance.updatedAt.toISOString()
                : new Date().toISOString(),
          }
        : null,
      dexscreener: allPrices?.dexscreener?.price
        ? {
            price: allPrices.dexscreener.price,
            updatedAt:
              allPrices.dexscreener.updatedAt instanceof Date
                ? allPrices.dexscreener.updatedAt.toISOString()
                : new Date().toISOString(),
          }
        : null,
      coingecko: allPrices?.coingecko?.price
        ? {
            price: allPrices.coingecko.price,
            updatedAt:
              allPrices.coingecko.updatedAt instanceof Date
                ? allPrices.coingecko.updatedAt.toISOString()
                : new Date().toISOString(),
          }
        : null,
    };
    const newAutomation = await AutomationModel.create({
      userId: user._id,
      coinId: cryptoCoin._id,
      type,
      target_price: target_price || null,
      activation_price: activation_price || null,
      use_ai: use_ai || false,
      enabled_notifications: enabled_notifications || ["push"],
      prices,
      isActive: true,
      notifications: {
        push_sent: false,
        sms_sent: false,
        telegram_sent: false,
        push_sent_at: null,
        sms_sent_at: null,
        telegram_sent_at: null,
      },
      continuation_count: 0,
    });
    const automation = await AutomationModel.findById(newAutomation._id).lean();
    if (!automation) {
      const errorResponse: TServerError = {
        message: "Failed to create automation",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    const responseData: TAutomationResponse = {
      success: true,
      data: getDataAutomationData(automation),
    };
    const responseValidation = automationResponseSchema.safeParse(responseData);
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
    console.warn("Create automation error:", error);

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

    const filter: any = { userId: user._id };
    if (req.query.isActive !== undefined)
      filter.isActive = req.query.isActive === "true";
    if (req.query.coinId) filter.coinId = req.query.coinId;

    const view = req.query.view as string | undefined;
    const shouldPopulateCoin = view === "all";
    let query = AutomationModel.find(filter).sort({ createdAt: -1 });
    if (shouldPopulateCoin) query = query.populate("coinId");

    const automations = await query.lean();
    const data = automations
      .map((automation) => getDataAutomationData(automation))
      .filter((automation) => automation !== null);
    const responseData: TAutomationListResponse = { success: true, data };
    const responseValidation =
      automationListResponseSchema.safeParse(responseData);
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
    console.warn("Get automations list error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.put("/update", async (req: Request, res: Response) => {
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

    const validationResult = updateAutomationSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: validationResult.error.issues,
        code: ErrorCode.INVALID_PARAMS,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const {
      automationId,
      isActive,
      target_price,
      activation_price,
      use_ai,
      enabled_notifications,
      continuation_price,
    }: TUpdateAutomation = validationResult.data;
    const automation = await AutomationModel.findOne({
      _id: automationId,
      userId: user._id,
    });
    if (!automation) {
      const errorResponse: TNotFoundError = {
        message: "Automation not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const finalTargetPrice =
      target_price !== undefined ? target_price : automation.target_price;
    const finalActivationPrice =
      activation_price !== undefined
        ? activation_price
        : automation.activation_price;
    if (finalTargetPrice && finalActivationPrice) {
      const errorResponse: TValidationError = {
        message:
          "Не можна використовувати target_price та activation_price одночасно",
        errors: [
          {
            code: "custom",
            message:
              "Не можна використовувати target_price та activation_price одночасно",
            path: ["target_price", "activation_price"],
          },
        ],
        code: ErrorCode.INVALID_PARAMS,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }
    if (isActive !== undefined) {
      automation.isActive = isActive;
      // При активації автоматизації скидаємо continuation_price та лічильник
      if (isActive) {
        automation.set("continuation_price", null);
        automation.continuation_count = 0;
        // Скидаємо статуси сповіщень
        automation.notifications.push_sent = false;
        automation.notifications.sms_sent = false;
        automation.notifications.telegram_sent = false;
        automation.set("notifications.push_sent_at", null);
        automation.set("notifications.sms_sent_at", null);
        automation.set("notifications.telegram_sent_at", null);
      }
    }
    if (target_price !== undefined)
      automation.set("target_price", target_price);
    if (activation_price !== undefined)
      automation.set("activation_price", activation_price);
    if (use_ai !== undefined) automation.use_ai = use_ai;
    if (enabled_notifications !== undefined)
      automation.enabled_notifications = enabled_notifications;
    if (continuation_price !== undefined)
      automation.set("continuation_price", continuation_price);

    await automation.save();

    const updatedAutomation = await AutomationModel.findById(
      automationId
    ).lean();
    if (!updatedAutomation) {
      const errorResponse: TServerError = {
        message: "Failed to update automation",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    const responseData: TAutomationResponse = {
      success: true,
      data: getDataAutomationData(updatedAutomation),
    };

    const responseValidation = automationResponseSchema.safeParse(responseData);
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
    console.warn("Update automation error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.delete("/delete/:automationId", async (req: Request, res: Response) => {
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

    const { automationId } = req.params;
    if (!automationId) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: [
          {
            code: "invalid_type",
            message: "automationId is required",
            path: ["automationId"],
          },
        ],
        code: ErrorCode.INVALID_PARAMS,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const automation = await AutomationModel.findOne({
      _id: automationId,
      userId: user._id,
    });

    if (!automation) {
      const errorResponse: TNotFoundError = {
        message: "Automation not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    await AutomationModel.findByIdAndDelete(automationId);

    const responseData: TDeleteResponse = {
      success: true,
      message: "Automation deleted successfully",
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
    console.warn("Delete automation error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.get("/by-id/:automationId", async (req: Request, res: Response) => {
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

    const { automationId } = req.params;
    if (!automationId) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: [
          {
            code: "invalid_type",
            message: "automationId is required",
            path: ["automationId"],
          },
        ],
        code: ErrorCode.INVALID_PARAMS,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const automation = await AutomationModel.findOne({
      _id: automationId,
      userId: user._id,
    })
      .populate("coinId")
      .lean();
    if (!automation) {
      const errorResponse: TNotFoundError = {
        message: "Automation not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const responseData: TAutomationResponse = {
      success: true,
      data: getDataAutomationData(automation),
    };
    const responseValidation = automationResponseSchema.safeParse(responseData);
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
    console.warn("Get automation by id error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.post("/continue", async (req: Request, res: Response) => {
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

    const { automationId } = req.body;
    if (!automationId) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: [
          {
            code: "invalid_type",
            message: "automationId is required",
            path: ["automationId"],
          },
        ],
        code: ErrorCode.INVALID_PARAMS,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const automation = await AutomationModel.findOne({
      _id: automationId,
      userId: user._id,
    });
    if (!automation) {
      const errorResponse: TNotFoundError = {
        message: "Automation not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const allPrices = await AggregatorService.getAllPrices(
      automation.coinId.toString()
    );
    const current_price =
      allPrices?.binance?.price ||
      allPrices?.dexscreener?.price ||
      allPrices?.coingecko?.price ||
      null;
    if (current_price) automation.set("continuation_price", current_price);

    automation.continuation_count = (automation.continuation_count || 0) + 1;
    automation.isActive = true;
    automation.notifications.push_sent = false;
    automation.notifications.sms_sent = false;

    await automation.save();

    const updatedAutomation = await AutomationModel.findById(
      automationId
    ).lean();
    if (!updatedAutomation) {
      const errorResponse: TServerError = {
        message: "Failed to continue automation",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    const responseData: TAutomationResponse = {
      success: true,
      data: getDataAutomationData(updatedAutomation),
    };

    const responseValidation = automationResponseSchema.safeParse(responseData);
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
    console.warn("Continue automation error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

export default router;
