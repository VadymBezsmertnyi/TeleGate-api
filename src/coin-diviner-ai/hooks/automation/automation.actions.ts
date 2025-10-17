import AutomationModel from "../../routes/automation/automation.model";
import AuthModel from "../../routes/auth/auth.model";
import CryptoCoinModel from "../../routes/aggregator/aggregator.model";
import NotificationSettingsModel from "../../routes/notification/notification.model";
import { sendPushNotification } from "../../helpers/firebase.helper";
import { sendSmsTurboSMS } from "../../helpers/sms/sms.helpers";
import { sendMessageToChatId } from "../../helpers/telegram/telegram.helpers";
import { generateAutomationMessage } from "../openAi";

import type { ITriggerResult } from "./automation.types";

/**
 * Виконує дії для спрацьованих автоматизацій: генерує повідомлення через AI та відправляє сповіщення
 */
export const executeAutomationActions = async (
  triggeredAutomations: ITriggerResult[]
): Promise<void> => {
  try {
    for (const trigger of triggeredAutomations) {
      const { automation, currentPrice } = trigger;

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
            notificationType
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
        defaultMessage = `${coin.symbol}: ${
          automation.type === "price_rise"
            ? `Ціна впала до $${currentPrice} (корекція після піднімання)`
            : `Ціна піднялася до $${currentPrice} (відскок після падіння)`
        }`;
      }

      const finalMessage = aiMessage || defaultMessage;

      const notificationSettings = await NotificationSettingsModel.findOne({
        userId: automation.userId,
      }).lean();
      await sendNotifications(
        user,
        automation,
        finalMessage,
        coin,
        notificationSettings
      );
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
  coin: { name: string; symbol: string },
  notificationSettings: {
    pushTokens: { token: string; platform: string; failureCount: number }[];
    smsPhone?: string | null;
    telegram?: {
      chatId?: string | null;
      firstName?: string | null;
      lastName?: string | null;
    } | null;
  } | null
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
        if (chatId) await sendMessageToChatId(chatId, message);
      }
    } catch (error) {
      console.warn(
        `Failed to send ${notificationType} notification for automation:`,
        error
      );
    }
  }
};
