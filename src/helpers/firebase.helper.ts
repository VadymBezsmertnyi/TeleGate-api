import admin from "firebase-admin";
import path from "path";

let firebaseApp: admin.app.App | null = null;

export const initializeFirebase = () => {
  if (firebaseApp) return firebaseApp;

  try {
    const serviceAccountPath = path.join(
      __dirname,
      "../../keys/telegate-f59d5-firebase-adminsdk-fbsvc-5dfe4845b4.json"
    );

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
      projectId: "telegate-f59d5",
    });

    console.warn("Firebase Admin SDK initialized successfully");
    return firebaseApp;
  } catch (error) {
    console.warn("Failed to initialize Firebase Admin SDK:", error);
    throw error;
  }
};

export const getFirebaseApp = () => {
  if (!firebaseApp) return initializeFirebase();

  return firebaseApp;
};

export const sendPushNotification = async (
  tokens: string[],
  notification: {
    title: string;
    body: string;
  },
  data?: Record<string, string>
) => {
  try {
    const app = getFirebaseApp();
    const messaging = app.messaging();

    const message = {
      notification,
      data,
      tokens,
    };

    const response = await messaging.sendEachForMulticast(message);

    console.warn(
      `Successfully sent messages: ${response.successCount}/${tokens.length}`
    );

    if (response.failureCount > 0) {
      const failedTokens = response.responses
        .map((resp, idx) => (!resp.success ? tokens[idx] : null))
        .filter(Boolean);

      console.warn("Failed tokens:", failedTokens);
    }

    return response;
  } catch (error) {
    console.warn("Error sending push notification:", error);
    throw error;
  }
};
