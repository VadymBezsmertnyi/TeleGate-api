import { Response } from "express";
import { TelegramErrorCode, TelegramErrorResponse } from "./telegram.types";

export const returnTelegramError = (
  res: Response,
  statusCode: number,
  message: string,
  code: TelegramErrorCode,
  details?: any
): Response => {
  const errorResponse: TelegramErrorResponse = {
    message,
    code,
  };
  if (details) errorResponse.details = details;
  return res.status(statusCode).json(errorResponse);
};
