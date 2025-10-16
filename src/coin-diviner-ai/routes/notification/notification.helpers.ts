import admin from "firebase-admin";

export const sendPushNotification = async (
  pushToken: string,
  title: string,
  message: string
): Promise<void> => {
  try {
    const payload = {
      notification: {
        title,
        body: message,
      },
      token: pushToken,
    };

    await admin.messaging().send(payload);
  } catch (error) {
    console.warn("Send push notification error:", error);
    throw error;
  }
};

export const sendSmsNotification = async (
  phoneNumber: string,
  message: string
): Promise<void> => {
  try {
  } catch (error) {
    console.warn("Send SMS notification error:", error);
    throw error;
  }
};

export const sendTelegramNotification = async (
  chatId: string,
  message: string
): Promise<void> => {
  try {
  } catch (error) {
    console.warn("Send Telegram notification error:", error);
    throw error;
  }
};
