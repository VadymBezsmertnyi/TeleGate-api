import * as admin from "firebase-admin";
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
  message: string,
  title?: string
): Promise<admin.messaging.BatchResponse> => {
  const app = getFirebaseApp();
  const messaging = app.messaging();

  const messagePayload: admin.messaging.MulticastMessage = {
    tokens,
    notification: {
      title: title || "TeleGate",
      body: message,
    },
    data: {
      message,
      title: title || "TeleGate",
    },
  };

  return await messaging.sendEachForMulticast(messagePayload);
};
