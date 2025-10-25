import { Router, Request, Response } from "express";

// schemas
import {
  createOrUpdatePortfolioSchema,
  addTransactionSchema,
  updateTransactionSchema,
  deleteTransactionSchema,
  portfolioResponseSchema,
  portfolioListResponseSchema,
  deleteResponseSchema,
  completePortfolioSchema,
  updateCompletedPortfolioSchema,
  portfolioStatsResponseSchema,
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
  TUpdateTransaction,
  TDeleteTransaction,
  TPortfolioResponse,
  TPortfolioListResponse,
  TDeleteResponse,
  TCompletePortfolio,
  TUpdateCompletedPortfolio,
  TPortfolioStatsResponse,
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
import UserBalanceModel from "../user-balance/user-balance.model";

// hooks
import { checkAuth } from "../../hooks/auth";
import {
  getDataPortfolioData,
  calculatePortfolioStats,
} from "./portfolio.helps";

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
      portfolio.purchases.push(transaction);
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
    portfolio.purchases.push(transaction);
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
    portfolio.sales.push(transaction);
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
    let query = PortfolioModel.find({
      userId: user._id,
      $or: [{ status: "open" }, { status: { $exists: false } }],
    }).sort({
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

router.patch("/update-transaction", async (req: Request, res: Response) => {
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

    const validationResult = updateTransactionSchema.safeParse(req.body);
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
      transactionId,
      transactionType,
      amount_usd,
      amount_crypto,
      price_per_unit,
    }: TUpdateTransaction = validationResult.data;
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

    const transactionsArray =
      transactionType === "purchase" ? portfolio.purchases : portfolio.sales;
    const transactionIndex = transactionsArray.findIndex(
      (t) => t._id.toString() === transactionId
    );
    if (transactionIndex === -1) {
      const errorResponse: TNotFoundError = {
        message: "Transaction not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    transactionsArray[transactionIndex].amount_usd = amount_usd;
    transactionsArray[transactionIndex].amount_crypto = amount_crypto;
    transactionsArray[transactionIndex].price_per_unit = price_per_unit;

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
    console.warn("Update transaction error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.delete("/delete-transaction", async (req: Request, res: Response) => {
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

    const validationResult = deleteTransactionSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: validationResult.error.issues,
        code: ErrorCode.INVALID_PARAMS,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const { portfolioId, transactionId, transactionType }: TDeleteTransaction =
      validationResult.data;
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

    const transactionsArray =
      transactionType === "purchase" ? portfolio.purchases : portfolio.sales;
    const transactionIndex = transactionsArray.findIndex(
      (t) => t._id.toString() === transactionId
    );
    if (transactionIndex === -1) {
      const errorResponse: TNotFoundError = {
        message: "Transaction not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    transactionsArray.splice(transactionIndex, 1);
    await portfolio.save();

    const responseData: TDeleteResponse = {
      success: true,
      message: "Transaction deleted successfully",
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
    console.warn("Delete transaction error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.post("/complete", async (req: Request, res: Response) => {
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

    const validationResult = completePortfolioSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: validationResult.error.issues,
        code: ErrorCode.INVALID_PARAMS,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const { portfolioId, completionPrice }: TCompletePortfolio =
      validationResult.data;

    const portfolio = await PortfolioModel.findOne({
      _id: portfolioId,
      userId: user._id,
      status: "open",
    });

    if (!portfolio) {
      const errorResponse: TNotFoundError = {
        message: "Open portfolio not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    // Calculate portfolio statistics
    const stats = calculatePortfolioStats(portfolio);

    portfolio.status = "completed";
    portfolio.completionDate = new Date();
    portfolio.completionPrice = completionPrice;
    portfolio.totalPurchases = stats.totalPurchases;
    portfolio.totalSales = stats.totalSales;
    portfolio.totalCryptoPurchased = stats.totalCryptoPurchased;
    portfolio.totalCryptoSold = stats.totalCryptoSold;
    portfolio.profitLoss = stats.profitLoss;
    portfolio.profitLossPercentage = stats.profitLossPercentage;
    await portfolio.save();

    let userBalance = await UserBalanceModel.findOne({ userId: user._id });
    if (!userBalance) {
      userBalance = await UserBalanceModel.create({
        userId: user._id,
        balance: 0,
        transactions: [],
        portfolioTransactions: [],
      });
    }

    userBalance.portfolioTransactions.push(portfolio._id);
    await userBalance.save();

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
    console.warn("Complete portfolio error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.patch("/update-completed", async (req: Request, res: Response) => {
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

    const validationResult = updateCompletedPortfolioSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: validationResult.error.issues,
        code: ErrorCode.INVALID_PARAMS,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const { portfolioId, completionPrice }: TUpdateCompletedPortfolio =
      validationResult.data;

    const portfolio = await PortfolioModel.findOne({
      _id: portfolioId,
      userId: user._id,
      status: "completed",
    });

    if (!portfolio) {
      const errorResponse: TNotFoundError = {
        message: "Completed portfolio not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    // Recalculate portfolio statistics
    const stats = calculatePortfolioStats(portfolio);

    portfolio.completionPrice = completionPrice;
    portfolio.totalPurchases = stats.totalPurchases;
    portfolio.totalSales = stats.totalSales;
    portfolio.totalCryptoPurchased = stats.totalCryptoPurchased;
    portfolio.totalCryptoSold = stats.totalCryptoSold;
    portfolio.profitLoss = stats.profitLoss;
    portfolio.profitLossPercentage = stats.profitLossPercentage;
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
    console.warn("Update completed portfolio error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.get("/completed", async (req: Request, res: Response) => {
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
    let query = PortfolioModel.find({
      userId: user._id,
      status: "completed",
    }).sort({
      completionDate: -1,
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
    console.warn("Get completed portfolios error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

// GET /portfolio/stats - отримати статистику по торгових сесіях
router.get("/stats", async (req: Request, res: Response) => {
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

    // Отримуємо відкриті торгові сесії
    const openPortfolios = await PortfolioModel.find({
      userId: user._id,
      $or: [
        { status: "open" },
        { status: { $exists: false } }, // для старих записів без статусу
      ],
    }).lean();

    // Отримуємо завершені торгові сесії
    const completedPortfolios = await PortfolioModel.find({
      userId: user._id,
      status: "completed",
    }).lean();

    // Розраховуємо три окремі метрики для відкритих сесій
    let totalInvestedInOpenSessions = 0; // Скільки вложили (тільки покупки)
    let totalReceivedFromOpenSessions = 0; // Скільки вже отримали (тільки продажі)
    let totalProfitLossFromOpenSessions = 0; // Прибуток/збиток (продажі - покупки)
    for (const portfolio of openPortfolios) {
      const totalPurchases = portfolio.purchases.reduce(
        (sum, purchase) => sum + purchase.amount_usd,
        0
      );
      const totalSales = portfolio.sales.reduce(
        (sum, sale) => sum + sale.amount_usd,
        0
      );
      const profitLoss = totalSales - totalPurchases;

      // Додаємо до відповідних метрик
      totalInvestedInOpenSessions += totalPurchases; // Всього вложили
      totalReceivedFromOpenSessions += totalSales; // Всього отримали
      totalProfitLossFromOpenSessions += profitLoss; // Загальний прибуток/збиток
    }

    // Розраховуємо загальний прибуток/збиток від завершених сесій
    let totalProfitLossFromCompletedSessions = 0;
    for (const portfolio of completedPortfolios) {
      totalProfitLossFromCompletedSessions += portfolio.profitLoss || 0;
    }

    const data = {
      totalInvestedInOpenSessions,
      totalReceivedFromOpenSessions,
      totalProfitLossFromOpenSessions,
      totalProfitLossFromCompletedSessions,
      openSessionsCount: openPortfolios.length,
      completedSessionsCount: completedPortfolios.length,
    };

    const responseData: TPortfolioStatsResponse = {
      success: true,
      data,
    };

    const responseValidation =
      portfolioStatsResponseSchema.safeParse(responseData);
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
    console.warn("Get portfolio stats error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

export default router;
