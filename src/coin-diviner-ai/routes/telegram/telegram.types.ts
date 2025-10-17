export enum TelegramErrorCode {
  SERVER_ERROR = "SERVER_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  BOT_TOKEN_MISSING = "BOT_TOKEN_MISSING",
  WEBHOOK_URL_MISSING = "WEBHOOK_URL_MISSING",
  WEBHOOK_SETUP_FAILED = "WEBHOOK_SETUP_FAILED",
}

export interface TelegramErrorResponse {
  message: string;
  code: TelegramErrorCode;
  details?: any;
}
