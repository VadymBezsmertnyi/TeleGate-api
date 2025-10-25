import { Router, Request, Response } from "express";

import {
  addUserBalanceTransactionSchema,
  updateUserBalanceTransactionSchema,
  deleteUserBalanceTransactionSchema,
  userBalanceResponseSchema,
  deleteResponseSchema,
} from "./user-balance.schemas";
import {
  notFoundErrorSchema,
  serverErrorSchema,
  validationErrorSchema,
} from "../aggregator/aggregator.schemas";

import type {
  TAddUserBalanceTransaction,
  TUpdateUserBalanceTransaction,
  TDeleteUserBalanceTransaction,
  TUserBalanceResponse,
  TDeleteResponse,
} from "./user-balance.types";
import type {
  TNotFoundError,
  TServerError,
  TValidationError,
} from "../aggregator/aggregator.types";
import { ErrorCode } from "../auth/auth.helps";

import UserBalanceModel from "./user-balance.model";
import AuthModel from "../auth/auth.model";

import { checkAuth } from "../../hooks/auth";
import { getDataUserBalanceData } from "./user-balance.helps";

import "./user-balance.swagger";

const router = Router();

router.post("/add-transaction", async (req: Request, res: Response) => {
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

    const validationResult = addUserBalanceTransactionSchema.safeParse(
      req.body
    );
    if (!validationResult.success) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: validationResult.error.issues,
        code: ErrorCode.INVALID_PARAMS,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const { type, amount, description }: TAddUserBalanceTransaction =
      validationResult.data;

    let userBalance = await UserBalanceModel.findOne({
      userId: user._id,
    });

    if (!userBalance) {
      userBalance = await UserBalanceModel.create({
        userId: user._id,
        balance: type === "deposit" ? amount : -amount,
        transactions: [
          {
            type,
            amount,
            description,
            date: new Date(),
          },
        ],
      });
    } else {
      if (type === "deposit") {
        userBalance.balance += amount;
      } else {
        userBalance.balance -= amount;
      }
      userBalance.transactions.push({
        type,
        amount,
        description,
        date: new Date(),
      });
      await userBalance.save();
    }

    const userBalanceData = await UserBalanceModel.findById(
      userBalance._id
    ).lean();
    if (!userBalanceData) {
      const errorResponse: TServerError = {
        message: "Failed to retrieve user balance",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    const responseData: TUserBalanceResponse = {
      success: true,
      data: getDataUserBalanceData(userBalanceData),
    };

    const responseValidation =
      userBalanceResponseSchema.safeParse(responseData);
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
    console.warn("Add transaction error:", error);

    const errorResponse: TServerError = {
      message: "Server error: " + error,
    };
    const validatedError = serverErrorSchema.parse(errorResponse);
    return res.status(500).json(validatedError);
  }
});

router.get("/get-balance", async (req: Request, res: Response) => {
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

    const userBalance = await UserBalanceModel.findOne({
      userId: user._id,
    })
      .populate({
        path: "portfolioTransactions",
        populate: {
          path: "coinId",
          select: "name symbol coinGeckoData",
        },
      })
      .lean();

    if (!userBalance) {
      const emptyBalance = {
        _id: user._id.toString(),
        userId: user._id.toString(),
        balance: 0,
        transactions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const responseData: TUserBalanceResponse = {
        success: true,
        data: emptyBalance,
      };

      const responseValidation =
        userBalanceResponseSchema.safeParse(responseData);
      if (!responseValidation.success) {
        console.warn("Response validation failed:", responseValidation.error);
        const errorResponse: TServerError = {
          message: "Invalid response format",
        };
        const validatedError = serverErrorSchema.parse(errorResponse);
        return res.status(500).json(validatedError);
      }

      return res.status(200).json(responseValidation.data);
    }

    const processedData = getDataUserBalanceData(userBalance);
    // Очищуємо зайві строки (ObjectId) з БД, використовуючи оброблені дані
    if (processedData && processedData.portfolioTransactions) {
      const validPortfolioIds = processedData.portfolioTransactions.map(
        (pt) => pt._id
      );

      if (
        validPortfolioIds.length !== userBalance.portfolioTransactions.length
      ) {
        await UserBalanceModel.updateOne(
          { _id: userBalance._id },
          { portfolioTransactions: validPortfolioIds }
        );
      }
    }

    const responseData: TUserBalanceResponse = {
      success: true,
      data: processedData,
    };

    const responseValidation =
      userBalanceResponseSchema.safeParse(responseData);
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
    console.warn("Get balance error:", error);

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

    const validationResult = updateUserBalanceTransactionSchema.safeParse(
      req.body
    );
    if (!validationResult.success) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: validationResult.error.issues,
        code: ErrorCode.INVALID_PARAMS,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const { transactionId, type, amount, description }: TUpdateUserBalanceTransaction =
      validationResult.data;

    const userBalance = await UserBalanceModel.findOne({
      userId: user._id,
    });

    if (!userBalance) {
      const errorResponse: TNotFoundError = {
        message: "User balance not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const transactionIndex = userBalance.transactions.findIndex(
      (t) => t._id.toString() === transactionId
    );

    if (transactionIndex === -1) {
      const errorResponse: TNotFoundError = {
        message: "Transaction not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const oldTransaction = userBalance.transactions[transactionIndex];
    const oldAmount = oldTransaction.amount;
    const oldType = oldTransaction.type;

    // Update transaction
    userBalance.transactions[transactionIndex] = {
      ...oldTransaction,
      type,
      amount,
      description,
    };

    // Recalculate balance
    if (oldType === "deposit") {
      userBalance.balance -= oldAmount;
    } else {
      userBalance.balance += oldAmount;
    }

    if (type === "deposit") {
      userBalance.balance += amount;
    } else {
      userBalance.balance -= amount;
    }

    await userBalance.save();

    const userBalanceData = await UserBalanceModel.findById(
      userBalance._id
    ).lean();
    if (!userBalanceData) {
      const errorResponse: TServerError = {
        message: "Failed to retrieve user balance",
      };
      const validatedError = serverErrorSchema.parse(errorResponse);
      return res.status(500).json(validatedError);
    }

    const responseData: TUserBalanceResponse = {
      success: true,
      data: getDataUserBalanceData(userBalanceData),
    };

    const responseValidation =
      userBalanceResponseSchema.safeParse(responseData);
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

    const validationResult = deleteUserBalanceTransactionSchema.safeParse(
      req.body
    );
    if (!validationResult.success) {
      const errorResponse: TValidationError = {
        message: "Validation error",
        errors: validationResult.error.issues,
        code: ErrorCode.INVALID_PARAMS,
      };
      const validatedError = validationErrorSchema.parse(errorResponse);
      return res.status(400).json(validatedError);
    }

    const { transactionId }: TDeleteUserBalanceTransaction =
      validationResult.data;

    const userBalance = await UserBalanceModel.findOne({
      userId: user._id,
    });

    if (!userBalance) {
      const errorResponse: TNotFoundError = {
        message: "User balance not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const transactionIndex = userBalance.transactions.findIndex(
      (t) => t._id.toString() === transactionId
    );

    if (transactionIndex === -1) {
      const errorResponse: TNotFoundError = {
        message: "Transaction not found",
      };
      const validatedError = notFoundErrorSchema.parse(errorResponse);
      return res.status(404).json(validatedError);
    }

    const transaction = userBalance.transactions[transactionIndex];
    
    // Recalculate balance
    if (transaction.type === "deposit") {
      userBalance.balance -= transaction.amount;
    } else {
      userBalance.balance += transaction.amount;
    }

    // Remove transaction
    userBalance.transactions.splice(transactionIndex, 1);
    await userBalance.save();

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

export default router;
