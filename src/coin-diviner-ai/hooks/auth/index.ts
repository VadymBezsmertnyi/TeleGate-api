import { Request } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { z } from "zod";

// schemas
import { validationErrorSchema } from "../../routes/aggregator/aggregator.schemas";

// types
import { TValidationError } from "../../routes/aggregator/aggregator.types";
import { ErrorCode } from "../../routes/auth/auth.helps";

dotenv.config();

const SECRET_KEY_TOKEN = process.env.JWT_SECRET_KEY_TOKEN as string;
const SECRET_KEY_REFRESH_TOKEN = process.env
  .JWT_SECRET_KEY_REFRESH_TOKEN as string;

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY_TOKEN);
    const verify = z
      .object({
        userId: z.string(),
        iat: z.number(),
        exp: z.number(),
      })
      .safeParse(decoded);
    if (!verify.success) return { error: "INVALID_TOKEN" as const };
    return verify.data;
  } catch (error: any) {
    if (error.name === "TokenExpiredError")
      return { error: "EXPIRED_TOKEN" as const };

    return { error: "INVALID_TOKEN" as const };
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY_REFRESH_TOKEN);
    const verify = z
      .object({
        userId: z.string(),
        iat: z.number(),
        exp: z.number(),
      })
      .safeParse(decoded);
    if (!verify.success) return { error: "INVALID_REFRESH_TOKEN" as const };
    return verify.data;
  } catch (error: any) {
    if (error.name === "TokenExpiredError")
      return { error: "EXPIRED_REFRESH_TOKEN" as const };

    return { error: "INVALID_REFRESH_TOKEN" as const };
  }
};

export const setToken = (
  userId: string,
  time_token: "7d" | "30d",
  secretKeyToken: string
) => {
  const token = jwt.sign({ userId }, secretKeyToken, { expiresIn: time_token });
  return token;
};

export const setTokens = (userId: string) => {
  const accessToken = setToken(userId, "7d", SECRET_KEY_TOKEN);
  const refreshToken = setToken(userId, "30d", SECRET_KEY_REFRESH_TOKEN);
  return { accessToken, refreshToken };
};

export const checkAuth = (
  req: Request
): TValidationError | { userId: string; iat: number; exp: number } => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const errorResponse: TValidationError = {
      message: "Missing or invalid authorization header",
      errors: [],
      code: ErrorCode.MISSING_AUTH_HEADER,
    };
    const validatedError = validationErrorSchema.parse(errorResponse);
    return validatedError;
  }

  const token = authHeader.substring(7);
  if (!token) {
    const errorResponse: TValidationError = {
      message: "Missing token",
      errors: [],
      code: ErrorCode.MISSING_TOKEN,
    };
    const validatedError = validationErrorSchema.parse(errorResponse);
    return validatedError;
  }

  const decoded = verifyToken(token);
  if (!decoded || "error" in decoded) {
    const errorCode =
      decoded && "error" in decoded && decoded.error === "EXPIRED_TOKEN"
        ? ErrorCode.EXPIRED_TOKEN
        : ErrorCode.INVALID_TOKEN;
    const errorMessage =
      errorCode === ErrorCode.EXPIRED_TOKEN ? "Token expired" : "Invalid token";
    const errorResponse: TValidationError = {
      message: errorMessage,
      errors: [],
      code: errorCode,
    };
    const validatedError = validationErrorSchema.parse(errorResponse);
    return validatedError;
  }

  return decoded;
};
