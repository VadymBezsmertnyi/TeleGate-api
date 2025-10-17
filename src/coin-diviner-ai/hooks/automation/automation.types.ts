import type { Types } from "mongoose";

export interface IAutomation {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  coinId: Types.ObjectId;
  type: "price_drop" | "price_rise";
  target_price: number | null;
  isActive: boolean;
  use_ai: boolean;
  enabled_notifications: ("push" | "sms" | "telegram")[];
  prices: {
    binance: { price: number; updatedAt: Date } | null;
    dexscreener: { price: number; updatedAt: Date } | null;
    coingecko: { price: number; updatedAt: Date } | null;
  };
  notifications: {
    push_sent: boolean;
    sms_sent: boolean;
    telegram_sent: boolean;
    push_sent_at: Date | null;
    sms_sent_at: Date | null;
    telegram_sent_at: Date | null;
  };
  continuation_price: number | null;
  continuation_count: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  phone?: string;
  isBlocked: boolean;
  isVerified: boolean;
  role: "user" | "admin";
}

export interface ICoinPrice {
  coinId: string;
  symbol: string;
  currentPrice: number | null;
  source: "binance" | "dexscreener" | "coingecko";
}

export interface ITriggerResult {
  triggered: boolean;
  automation: IAutomation;
  currentPrice: number;
  priceSource: "binance" | "dexscreener" | "coingecko";
  reason: string;
}

export interface IAutomationCheckResult {
  coinId: string;
  prices: {
    binance: number | null;
    dexscreener: number | null;
    coingecko: number | null;
  };
  triggeredAutomations: ITriggerResult[];
}

export interface IAiAutomationMessage {
  message: string;
  coinSymbol: string;
  currentPrice: number;
  triggerType: "price_drop" | "price_rise";
  targetPrice: number | null;
}
