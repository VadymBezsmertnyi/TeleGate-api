import { Response } from "express";

export enum ErrorCode {
  VALIDATION_ERROR = 1001,
  INVALID_CREDENTIALS = 1002,
  USER_ALREADY_EXISTS = 1003,
  MISSING_AUTH_HEADER = 1004,
  INVALID_AUTH_HEADER = 1005,
  MISSING_TOKEN = 1006,
  INVALID_TOKEN = 1007,
  EXPIRED_TOKEN = 1008,
  INVALID_REFRESH_TOKEN = 1009,
  EXPIRED_REFRESH_TOKEN = 1010,
  USER_NOT_FOUND = 1011,
  DATA_VALIDATION_ERROR = 1012,
  INVALID_USER_ID = 1013,
  SERVER_ERROR = 1014,
}

export const returnError = (
  res: Response,
  statusCode: number,
  errorMessage: string,
  code: ErrorCode,
  details?: any
) => {
  const response: any = {
    error: errorMessage,
    code,
    message: errorMessage,
  };
  if (details) response.details = details;

  return res.status(statusCode).json(response);
};
