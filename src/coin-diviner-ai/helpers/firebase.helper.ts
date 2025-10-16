import * as admin from "firebase-admin";
import path from "path";

let firebaseApp: admin.app.App | null = null;

export const initializeCoinDivinerFirebase = () => {
  if (firebaseApp) return firebaseApp;

  try {
    const serviceAccountPath = path.join(
      __dirname,
      "../../../keys/coin-diviner-ai-firebase-adminsdk-fbsvc-1e77602030.json"
    );
    firebaseApp = admin.initializeApp(
      {
        credential: admin.credential.cert(serviceAccountPath),
      },
      "coin-diviner-ai"
    );
    console.warn("Coin Diviner AI Firebase Admin SDK initialized successfully");
    return firebaseApp;
  } catch (error) {
    console.warn(
      "Failed to initialize Coin Diviner AI Firebase Admin SDK:",
      error
    );
    throw error;
  }
};

export const getCoinDivinerFirebaseApp = () => {
  if (!firebaseApp) return initializeCoinDivinerFirebase();

  return firebaseApp;
};

export const sendPushNotification = async (
  tokens: string[],
  message: string,
  title?: string
): Promise<admin.messaging.BatchResponse> => {
  const app = getCoinDivinerFirebaseApp();
  const messaging = app.messaging();

  const messagePayload: admin.messaging.MulticastMessage = {
    tokens,
    notification: {
      title: title || "Coin Diviner AI",
      body: message,
    },
    data: {
      message,
      title: title || "Coin Diviner AI",
    },
  };

  return await messaging.sendEachForMulticast(messagePayload);
};
