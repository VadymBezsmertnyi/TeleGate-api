import { Router, Request, Response } from "express";

// schemas
import {
  createOrUpdatePortfolioSchema,
  addTransactionSchema,
  portfolioResponseSchema,
  portfolioListResponseSchema,
  deleteResponseSchema,
} from "./portfolio.schemas";
import {
  notFoundErrorSchema,
  serverErrorSchema,
  validationErrorSchema,
} from "../aggregator/aggregator.schemas";

// types
import type {
  TCreateOrUpdatePortfolio,
  TAddTransaction,
  TPortfolioResponse,
  TPortfolioListResponse,
  TDeleteResponse,
} from "./portfolio.types";
import type {
  TNotFoundError,
  TServerError,
  TValidationError,
} from "../aggregator/aggregator.types";
import { ErrorCode } from "../auth/auth.helps";

// models
import PortfolioModel from "./portfolio.model";
import AuthModel from "../auth/auth.model";
import CryptoCoinModel from "../aggregator/aggregator.model";

// hooks
import { checkAuth } from "../../hooks/auth";
import { getDataPortfolioData } from "./portfolio.helps";

// swagger
import "./portfolio.swagger";

const router = Router();

router.post("/create-or-update", async (req: Request, res: Response) => {
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

    const validationResult = createOrUpdatePortfolioSchema.safeParse(req.body);
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
      amount_usd,
      amount_crypto,
      price_per_unit,
    }: TCreateOrUpdatePortfolio = validationResult.data;

    const cryptoCoin = await CryptoCoinModel.findById(coinId);
    if (!cryptoCoin) {
      const errorResponse: TNotFoundError = {
        message: "Crypto coin not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    let portfolio = await PortfolioModel.findOne({
      userId: user._id,
      coinId: cryptoCoin._id,
    });

    const transaction = {
      amount_usd,
      amount_crypto,
      price_per_unit,
      date: new Date(),
    };

    if (!portfolio) {
      portfolio = await PortfolioModel.create({
        userId: user._id,
        coinId: cryptoCoin._id,
        purchases: [transaction],
        sales: [],
      });
    } else {
      portfolio.purchases.push(transaction as any);
      await portfolio.save();
    }

    const portfolioData = await PortfolioModel.findById(portfolio._id).lean();
    if (!portfolioData) {
      const errorResponse: TServerError = {
        message: "Failed to retrieve portfolio",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    const responseData: TPortfolioResponse = {
      success: true,
      data: getDataPortfolioData(portfolioData),
    };

    const responseValidation = portfolioResponseSchema.safeParse(responseData);
    if (!responseValidation.success) {
      console.warn("Response validation failed:", responseValidation.error);
      const errorResponse: TServerError = {
        message: "Invalid response format",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    return res.status(200).json(responseValidation.data);
  } catch (error) {
    console.warn("Create or update portfolio error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.post("/add-purchase", async (req: Request, res: Response) => {
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

    const validationResult = addTransactionSchema.safeParse(req.body);
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
      portfolioId,
      amount_usd,
      amount_crypto,
      price_per_unit,
    }: TAddTransaction = validationResult.data;

    const portfolio = await PortfolioModel.findOne({
      _id: portfolioId,
      userId: user._id,
    });

    if (!portfolio) {
      const errorResponse: TNotFoundError = {
        message: "Portfolio not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const transaction = {
      amount_usd,
      amount_crypto,
      price_per_unit,
      date: new Date(),
    };

    portfolio.purchases.push(transaction as any);
    await portfolio.save();

    const portfolioData = await PortfolioModel.findById(portfolio._id).lean();
    if (!portfolioData) {
      const errorResponse: TServerError = {
        message: "Failed to retrieve portfolio",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    const responseData: TPortfolioResponse = {
      success: true,
      data: getDataPortfolioData(portfolioData),
    };

    const responseValidation = portfolioResponseSchema.safeParse(responseData);
    if (!responseValidation.success) {
      console.warn("Response validation failed:", responseValidation.error);
      const errorResponse: TServerError = {
        message: "Invalid response format",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    return res.status(200).json(responseValidation.data);
  } catch (error) {
    console.warn("Add purchase error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.post("/add-sale", async (req: Request, res: Response) => {
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

    const validationResult = addTransactionSchema.safeParse(req.body);
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
      portfolioId,
      amount_usd,
      amount_crypto,
      price_per_unit,
    }: TAddTransaction = validationResult.data;

    const portfolio = await PortfolioModel.findOne({
      _id: portfolioId,
      userId: user._id,
    });

    if (!portfolio) {
      const errorResponse: TNotFoundError = {
        message: "Portfolio not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const transaction = {
      amount_usd,
      amount_crypto,
      price_per_unit,
      date: new Date(),
    };

    portfolio.sales.push(transaction as any);
    await portfolio.save();

    const portfolioData = await PortfolioModel.findById(portfolio._id).lean();
    if (!portfolioData) {
      const errorResponse: TServerError = {
        message: "Failed to retrieve portfolio",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    const responseData: TPortfolioResponse = {
      success: true,
      data: getDataPortfolioData(portfolioData),
    };

    const responseValidation = portfolioResponseSchema.safeParse(responseData);
    if (!responseValidation.success) {
      console.warn("Response validation failed:", responseValidation.error);
      const errorResponse: TServerError = {
        message: "Invalid response format",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    return res.status(200).json(responseValidation.data);
  } catch (error) {
    console.warn("Add sale error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.delete("/clear/:portfolioId", async (req: Request, res: Response) => {
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

    const { portfolioId } = req.params;
    if (!portfolioId) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: [
          {
            code: "invalid_type",
            message: "portfolioId is required",
            path: ["portfolioId"],
          },
        ],
        code: ErrorCode.INVALID_PARAMS,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const portfolio = await PortfolioModel.findOne({
      _id: portfolioId,
      userId: user._id,
    });

    if (!portfolio) {
      const errorResponse: TNotFoundError = {
        message: "Portfolio not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    portfolio.purchases.splice(0, portfolio.purchases.length);
    portfolio.sales.splice(0, portfolio.sales.length);
    await portfolio.save();

    const responseData: TDeleteResponse = {
      success: true,
      message: "Portfolio cleared successfully",
    };

    const responseValidation = deleteResponseSchema.safeParse(responseData);
    if (!responseValidation.success) {
      console.warn("Response validation failed:", responseValidation.error);
      const errorResponse: TServerError = {
        message: "Invalid response format",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    return res.status(200).json(responseValidation.data);
  } catch (error) {
    console.warn("Clear portfolio error:", error);

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
    let query = PortfolioModel.find({ userId: user._id }).sort({
      createdAt: -1,
    });
    if (shouldPopulateCoin) query = query.populate("coinId");

    const portfolios = await query.lean();
    const data = portfolios
      .map((portfolio) => getDataPortfolioData(portfolio))
      .filter((portfolio) => portfolio !== null);

    const responseData: TPortfolioListResponse = {
      success: true,
      data,
    };

    const responseValidation =
      portfolioListResponseSchema.safeParse(responseData);
    if (!responseValidation.success) {
      console.warn("Response validation failed:", responseValidation.error);
      const errorResponse: TServerError = {
        message: "Invalid response format",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    return res.status(200).json(responseValidation.data);
  } catch (error) {
    console.warn("Get portfolios list error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.get("/by-id/:portfolioId", async (req: Request, res: Response) => {
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

    const { portfolioId } = req.params;
    if (!portfolioId) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: [
          {
            code: "invalid_type",
            message: "portfolioId is required",
            path: ["portfolioId"],
          },
        ],
        code: ErrorCode.INVALID_PARAMS,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const portfolio = await PortfolioModel.findOne({
      _id: portfolioId,
      userId: user._id,
    })
      .populate("coinId")
      .lean();

    if (!portfolio) {
      const errorResponse: TNotFoundError = {
        message: "Portfolio not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const responseData: TPortfolioResponse = {
      success: true,
      data: getDataPortfolioData(portfolio),
    };

    const responseValidation = portfolioResponseSchema.safeParse(responseData);
    if (!responseValidation.success) {
      console.warn("Response validation failed:", responseValidation.error);
      const errorResponse: TServerError = {
        message: "Invalid response format",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    return res.status(200).json(responseValidation.data);
  } catch (error) {
    console.warn("Get portfolio by id error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

export default router;
