import NotificationSettingsModel from "../../routes/notification/notification.model";
import { sendPushNotification } from "../../helpers/firebase.helper";
import * as admin from "firebase-admin";

interface SendTestPushResult {
  success: boolean;
  totalUsers: number;
  totalTokens: number;
  successCount: number;
  failureCount: number;
  errors?: string[];
}

export const handleFailedTokens = async (
  tokens: string[],
  response: admin.messaging.BatchResponse
) => {
  try {
    const failedTokens: string[] = [];
    const successTokens: string[] = [];

    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        failedTokens.push(tokens[idx]);
      } else {
        successTokens.push(tokens[idx]);
      }
    });

    const allTokens = [...failedTokens, ...successTokens];
    if (allTokens.length === 0) return;

    const settings = await NotificationSettingsModel.find({
      "pushTokens.token": { $in: allTokens },
    });

    for (const setting of settings) {
      let tokensToRemove: string[] = [];
      let hasChanges = false;

      setting.pushTokens.forEach((tokenObj) => {
        if (successTokens.includes(tokenObj.token)) {
          if (tokenObj.failureCount > 0) {
            tokenObj.failureCount = 0;
            hasChanges = true;
          }
        } else if (failedTokens.includes(tokenObj.token)) {
          tokenObj.failureCount = (tokenObj.failureCount || 0) + 1;
          hasChanges = true;

          if (tokenObj.failureCount > 3) tokensToRemove.push(tokenObj.token);
        }
      });

      if (tokensToRemove.length > 0) {
        tokensToRemove.forEach((tokenToRemove) => {
          const tokenIndex = setting.pushTokens.findIndex(
            (t) => t.token === tokenToRemove
          );
          if (tokenIndex !== -1) setting.pushTokens.splice(tokenIndex, 1);
        });
        console.warn(
          `Видалено ${tokensToRemove.length} токенів через перевищення ліміту помилок`
        );
        hasChanges = true;
      }

      if (hasChanges) await setting.save();
    }
  } catch (error) {
    console.warn("Помилка обробки невдалих токенів:", error);
  }
};

export const sendTestPushToAllUsers = async (
  title?: string,
  message?: string
): Promise<SendTestPushResult> => {
  try {
    const allNotificationSettings = await NotificationSettingsModel.find({
      "enabledTypes.push": true,
    });
    if (!allNotificationSettings || allNotificationSettings.length === 0)
      return {
        success: false,
        totalUsers: 0,
        totalTokens: 0,
        successCount: 0,
        failureCount: 0,
        errors: ["Не знайдено користувачів з увімкненими пуш-сповіщеннями"],
      };

    const allTokens: string[] = [];
    allNotificationSettings.forEach((settings) => {
      if (settings.pushTokens && settings.pushTokens.length > 0) {
        settings.pushTokens.forEach((tokenObj) => {
          if (tokenObj.token) {
            allTokens.push(tokenObj.token);
          }
        });
      }
    });
    if (allTokens.length === 0)
      return {
        success: false,
        totalUsers: allNotificationSettings.length,
        totalTokens: 0,
        successCount: 0,
        failureCount: 0,
        errors: ["Не знайдено пуш-токенів для відправки"],
      };

    const testTitle = title || "Тестове сповіщення";
    const testMessage =
      message || "Це тестове повідомлення для перевірки пуш-сповіщень";
    const response = await sendPushNotification(
      allTokens,
      testMessage,
      testTitle
    );

    await handleFailedTokens(allTokens, response);

    return {
      success: response.successCount > 0,
      totalUsers: allNotificationSettings.length,
      totalTokens: allTokens.length,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.warn("Помилка відправки тестових пуш-сповіщень:", error);
    return {
      success: false,
      totalUsers: 0,
      totalTokens: 0,
      successCount: 0,
      failureCount: 0,
      errors: [
        error instanceof Error ? error.message : "Невідома помилка сервера",
      ],
    };
  }
};

export const sendTestPushToUsersByIds = async (
  userIds: string[],
  title?: string,
  message?: string
): Promise<SendTestPushResult> => {
  try {
    const notificationSettings = await NotificationSettingsModel.find({
      userId: { $in: userIds },
      "enabledTypes.push": true,
    });

    if (!notificationSettings || notificationSettings.length === 0) {
      return {
        success: false,
        totalUsers: 0,
        totalTokens: 0,
        successCount: 0,
        failureCount: 0,
        errors: ["Не знайдено користувачів з увімкненими пуш-сповіщеннями"],
      };
    }

    const allTokens: string[] = [];
    notificationSettings.forEach((settings) => {
      if (settings.pushTokens && settings.pushTokens.length > 0) {
        settings.pushTokens.forEach((tokenObj) => {
          if (tokenObj.token) {
            allTokens.push(tokenObj.token);
          }
        });
      }
    });

    if (allTokens.length === 0) {
      return {
        success: false,
        totalUsers: notificationSettings.length,
        totalTokens: 0,
        successCount: 0,
        failureCount: 0,
        errors: ["Не знайдено пуш-токенів для відправки"],
      };
    }

    const testTitle = title || "Тестове сповіщення";
    const testMessage =
      message || "Це тестове повідомлення для перевірки пуш-сповіщень";

    const response = await sendPushNotification(
      allTokens,
      testMessage,
      testTitle
    );

    await handleFailedTokens(allTokens, response);

    return {
      success: response.successCount > 0,
      totalUsers: notificationSettings.length,
      totalTokens: allTokens.length,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.warn(
      "Помилка відправки тестових пуш-сповіщень для користувачів:",
      error
    );
    return {
      success: false,
      totalUsers: 0,
      totalTokens: 0,
      successCount: 0,
      failureCount: 0,
      errors: [
        error instanceof Error ? error.message : "Невідома помилка сервера",
      ],
    };
  }
};
