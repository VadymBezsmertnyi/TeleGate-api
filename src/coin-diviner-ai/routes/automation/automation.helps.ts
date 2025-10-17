import { TAutomationRecord } from "./automation.types";

export const getDataAutomationData = (automation: any) => {
  if (!automation || typeof automation !== "object" || !automation._id)
    return null;

  const responseData: TAutomationRecord = {
    ...automation,
    prices: {
      ...automation.prices,
      binance: automation.prices?.binance
        ? {
            price: automation.prices.binance.price ?? null,
            updatedAt: automation.prices.binance.updatedAt
              ? new Date(automation.prices.binance.updatedAt).toISOString()
              : null,
          }
        : null,
      dexscreener: automation.prices?.dexscreener
        ? {
            price: automation.prices.dexscreener.price ?? null,
            updatedAt: automation.prices.dexscreener.updatedAt
              ? new Date(automation.prices.dexscreener.updatedAt).toISOString()
              : null,
          }
        : null,
      coingecko: automation.prices?.coingecko
        ? {
            price: automation.prices.coingecko.price ?? null,
            updatedAt: automation.prices.coingecko.updatedAt
              ? new Date(automation.prices.coingecko.updatedAt).toISOString()
              : null,
          }
        : null,
    },
    notifications: {
      ...automation.notifications,
      push_sent_at: automation.notifications.push_sent_at
        ? new Date(automation.notifications.push_sent_at).toISOString()
        : null,
      sms_sent_at: automation.notifications.sms_sent_at
        ? new Date(automation.notifications.sms_sent_at).toISOString()
        : null,
      telegram_sent_at: automation.notifications.telegram_sent_at
        ? new Date(automation.notifications.telegram_sent_at).toISOString()
        : null,
    },
    _id: automation._id.toString(),
    userId: automation.userId.toString(),
    coinId: automation.coinId.toString(),
    createdAt: automation.createdAt.toISOString(),
    updatedAt: automation.updatedAt.toISOString(),
  };

  return responseData;
};
