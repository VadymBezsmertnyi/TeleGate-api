import { Response } from "express";

export enum NotificationErrorCode {
  VALIDATION_ERROR = 2001,
  SETTINGS_NOT_FOUND = 2002,
  INVALID_SETTINGS_ID = 2003,
  DATA_VALIDATION_ERROR = 2004,
  SERVER_ERROR = 2005,
  PUSH_TOKEN_NOT_FOUND = 2006,
  PUSH_TOKEN_ALREADY_EXISTS = 2007,
  INVALID_USER_ID = 2008,
  USER_NOT_FOUND = 2009,
  NOTIFICATION_SEND_FAILED = 2010,
}

export const returnNotificationError = (
  res: Response,
  statusCode: number,
  errorMessage: string,
  code: NotificationErrorCode,
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
