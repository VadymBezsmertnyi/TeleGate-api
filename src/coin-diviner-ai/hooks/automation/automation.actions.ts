import AutomationModel from "../../routes/automation/automation.model";
import AuthModel from "../../routes/auth/auth.model";
import CryptoCoinModel from "../../routes/aggregator/aggregator.model";
import NotificationSettingsModel from "../../routes/notification/notification.model";
import { sendPushNotification } from "../../helpers/firebase.helper";
import { sendSmsTurboSMS } from "../../helpers/sms/sms.helpers";
import { sendMessageToChatId } from "../../helpers/telegram/telegram.helpers";
import { generateAutomationMessage } from "../openAi";

import type { ITriggerResult } from "./automation.types";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";

/**
 * Виконує дії для спрацьованих автоматизацій: генерує повідомлення через AI та відправляє сповіщення
 */
export const executeAutomationActions = async (
  triggeredAutomations: ITriggerResult[]
): Promise<void> => {
  try {
    for (const trigger of triggeredAutomations) {
      const { automation, currentPrice } = trigger;
      if (!automation.isActive) continue;

      const user = await AuthModel.findById(automation.userId).lean();
      if (!user) {
        console.warn(
          `User not found for automation ${automation._id.toString()}`
        );
        continue;
      }

      const coin = await CryptoCoinModel.findById(automation.coinId).lean();
      if (!coin) {
        console.warn(
          `Coin not found for automation ${automation._id.toString()}`
        );
        continue;
      }

      let aiMessage = "";
      if (automation.use_ai) {
        for (const notificationType of automation.enabled_notifications) {
          const message = await generateAutomationMessage(
            coin.symbol,
            currentPrice,
            automation.type,
            automation.target_price,
            notificationType,
            automation.activation_price
          );

          if (message) {
            aiMessage = message;
            break;
          }
        }
      }

      let defaultMessage = "";
      if (automation.target_price) {
        defaultMessage = `${coin.symbol}: ${
          automation.type === "price_rise" ? "Ціна піднялася" : "Ціна впала"
        } до $${currentPrice} (цільова: $${automation.target_price})`;
      } else {
        const extremePrice = automation.continuation_price;
        const activationInfo = automation.activation_price
          ? ` (активація: $${automation.activation_price})`
          : "";
        defaultMessage = `${coin.symbol}: ${
          automation.type === "price_rise"
            ? `Корекція до $${currentPrice} (з максимуму $${extremePrice})${activationInfo}`
            : `Відскок до $${currentPrice} (з мінімуму $${extremePrice})${activationInfo}`
        }`;
      }

      const finalMessage = aiMessage || defaultMessage;

      const notificationSettings = await NotificationSettingsModel.findOne({
        userId: automation.userId,
      }).lean();
      const telegramMessage = generateTelegramMessage(
        coin,
        automation,
        currentPrice
      );
      await sendNotifications(
        user,
        automation,
        finalMessage,
        telegramMessage,
        coin,
        notificationSettings,
        automation._id.toString()
      );
      // Деактивуємо автоматизацію одразу після відправки
      await AutomationModel.findByIdAndUpdate(automation._id, {
        isActive: false,
        "notifications.push_sent": automation.enabled_notifications.includes(
          "push"
        )
          ? true
          : automation.notifications.push_sent,
        "notifications.sms_sent": automation.enabled_notifications.includes(
          "sms"
        )
          ? true
          : automation.notifications.sms_sent,
        "notifications.telegram_sent":
          automation.enabled_notifications.includes("telegram")
            ? true
            : automation.notifications.telegram_sent,
        "notifications.push_sent_at": automation.enabled_notifications.includes(
          "push"
        )
          ? new Date()
          : automation.notifications.push_sent_at,
        "notifications.sms_sent_at": automation.enabled_notifications.includes(
          "sms"
        )
          ? new Date()
          : automation.notifications.sms_sent_at,
        "notifications.telegram_sent_at":
          automation.enabled_notifications.includes("telegram")
            ? new Date()
            : automation.notifications.telegram_sent_at,
      });
    }
  } catch (error) {
    console.warn("Error in executeAutomationActions:", error);
  }
};

const generateTelegramMessage = (
  coin: { name: string; symbol: string },
  automation: {
    type: string;
    target_price: number | null;
    activation_price?: number | null;
    continuation_price?: number | null;
    prices?: {
      dexscreener?: { price: number } | null;
      binance?: { price: number } | null;
      coingecko?: { price: number } | null;
    };
  },
  currentPrice: number
): string => {
  const priceInfo =
    automation.prices?.dexscreener?.price ||
    automation.prices?.binance?.price ||
    automation.prices?.coingecko?.price;

  if (automation.target_price) {
    const priceChange =
      ((currentPrice - automation.target_price) / automation.target_price) *
      100;
    const emoji = automation.type === "price_rise" ? "📈" : "📉";

    return (
      `${emoji} Спрацювання автоматизації\n\n` +
      `💰 Монета: ${coin.name} (${coin.symbol})\n` +
      `💵 Поточна ціна: $${currentPrice}\n` +
      `🎯 Цільова ціна: $${automation.target_price}\n` +
      `📊 Зміна: ${priceChange > 0 ? "+" : ""}${priceChange.toFixed(2)}%\n\n` +
      `${
        automation.type === "price_rise"
          ? "✅ Ціна досягла цільового рівня піднімання!"
          : "⚠️ Ціна досягла цільового рівня падіння!"
      }`
    );
  } else {
    const extremePrice = automation.continuation_price || priceInfo;
    const priceChange = extremePrice
      ? ((currentPrice - extremePrice) / extremePrice) * 100
      : 0;
    const emoji = automation.type === "price_rise" ? "📉" : "📈";
    const extremeLabel =
      automation.type === "price_rise" ? "максимум" : "мінімум";

    return (
      `${emoji} Спрацювання автоматизації\n\n` +
      `💰 Монета: ${coin.name} (${coin.symbol})\n` +
      `💵 Поточна ціна: $${currentPrice}\n` +
      `📍 ${extremeLabel.charAt(0).toUpperCase() + extremeLabel.slice(1)}: $${
        extremePrice || "N/A"
      }\n` +
      (automation.activation_price
        ? `🎯 Ціна активації: $${automation.activation_price}\n`
        : "") +
      `📊 Зміна: ${priceChange > 0 ? "+" : ""}${priceChange.toFixed(2)}%\n\n` +
      `${
        automation.type === "price_rise"
          ? "⚠️ Зафіксовано корекцію від максимуму!"
          : "✅ Зафіксовано відскок від мінімуму!"
      }`
    );
  }
};

const sendNotifications = async (
  user: {
    _id: unknown;
    phone?: string | null;
  },
  automation: {
    enabled_notifications: ("push" | "sms" | "telegram")[];
    userId: unknown;
  },
  message: string,
  telegramMessage: string,
  coin: { name: string; symbol: string },
  notificationSettings: {
    pushTokens: { token: string; platform: string; failureCount: number }[];
    smsPhone?: string | null;
    telegram?: {
      chatId?: string | null;
      firstName?: string | null;
      lastName?: string | null;
    } | null;
  } | null,
  automationId: string
): Promise<void> => {
  const notificationTitle = `Автоматизація: ${coin.symbol}`;

  for (const notificationType of automation.enabled_notifications) {
    try {
      if (notificationType === "push" && notificationSettings?.pushTokens) {
        const activeTokens = notificationSettings.pushTokens
          .filter((t) => t.failureCount < 3)
          .map((t) => t.token);
        if (activeTokens.length > 0)
          await sendPushNotification(activeTokens, message, notificationTitle);
      } else if (notificationType === "sms") {
        const phone = notificationSettings?.smsPhone || user.phone;
        if (phone) await sendSmsTurboSMS(message, phone);
      } else if (notificationType === "telegram") {
        const chatId = notificationSettings?.telegram?.chatId;
        const baseUrl = process.env.API_BASE_URL_COIN_DIVINER_AI || null;
        if (chatId && baseUrl) {
          const inlineKeyboard: InlineKeyboardButton[][] = [
            [
              {
                text: "📱 Перейти в Coin Diviner AI",
                url: `${baseUrl}/api/redirect/coin-diviner-ai`,
              },
            ],
            [
              {
                text: "💹 Перейти в Binance",
                url: `${baseUrl}/api/redirect/binance`,
              },
            ],
            [
              {
                text: "❌ Закрити меню",
                callback_data: "close_menu",
              },
            ],
          ];
          await sendMessageToChatId(chatId, telegramMessage, inlineKeyboard);
        }
      }
    } catch (error) {
      console.warn(
        `Failed to send ${notificationType} notification for automation:`,
        error
      );
    }
  }
};
