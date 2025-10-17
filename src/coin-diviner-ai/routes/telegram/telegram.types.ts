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

export interface TelegramUser {
  id?: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramChat {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  type?: string;
}

export interface TelegramMessageEntity {
  offset?: number;
  length?: number;
  type?: string;
}

export interface TelegramMessage {
  message_id?: number;
  from?: TelegramUser;
  chat?: TelegramChat;
  date?: number;
  text?: string;
  entities?: TelegramMessageEntity[];
}

export interface TelegramCallbackQuery {
  id?: string;
  from?: TelegramUser;
  message?: TelegramMessage;
  data?: string;
  chat_instance?: string;
}

export interface TelegramWebhookUpdate {
  update_id?: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}
