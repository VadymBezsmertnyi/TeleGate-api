import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cron from "node-cron";
import NodeCache from "node-cache";
import swaggerUi from "swagger-ui-express";

// routes
import authTelegramRouter from "./routes/auth-telegram/auth-telegram";
import usersRouter from "./routes/users/users";
import groupsRouter from "./routes/groups/groups";
import membersRouter from "./routes/members/members";
import botConnectRouter from "./routes/bot-telegram/bot-connect";
import botSendMessagesRouter from "./routes/bot-send-messages/bot-send-messages";
import messageTemplatesRouter from "./routes/message-templates/message-templates";
import userPushTokensRouter from "./routes/user-push-tokens/push-tokens";
import revenuecatRouter from "./routes/revenuecat/revenuecat";

// start bot telegram
import startBotTelegram from "./routes/bot-telegram/bot-telegram";

// helpers
import { updateAllExpiredPhotos } from "./routes/bot-telegram/bot-telegram.helper";

// firebase
import { initializeFirebase } from "./helpers/firebase.helper";

// swagger
import { specs } from "./config/swagger";

const app = express();

dotenv.config();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));
app.use("/static", express.static("public"));
app.set("view engine", "ejs");

const PORT = process.env.PORT || 5008;
const db = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster-telegate.oj5buon.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-TeleGate`;
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

mongoose
  .connect(db)
  .then(() => {
    console.warn("🗄️  MongoDB connected successfully");
  })
  .catch((error: Error) => {
    console.warn("❌ MongoDB connection failed:", error);
  });

app.get("/", (req, res) => {
  res.send("TeleGate API is running!");
});

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.listen(PORT, () => {
  const isProduction = process.env.NODE_ENV === "production";
  const baseUrl = isProduction
    ? "https://telegate-api-4b26ec7aa804.herokuapp.com"
    : `http://localhost:${PORT}`;

  console.warn(`🚀 Express is listening at ${baseUrl}`);
  console.warn(`📚 Swagger UI is available at ${baseUrl}/api-docs`);
  console.warn(`🔗 API Base URL: ${baseUrl}/api`);
});

app.use("/api/auth-telegram", authTelegramRouter);
app.use("/api/users", usersRouter);
app.use("/api/users/push-tokens", userPushTokensRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/members", membersRouter);
app.use("/api/bot-telegram", botConnectRouter);
app.use("/api/bot-send-messages", botSendMessagesRouter);
app.use("/api/message-templates", messageTemplatesRouter);
app.use("/api/revenuecat", revenuecatRouter);

startBotTelegram();

// Initialize Firebase
try {
  initializeFirebase();
} catch (error) {
  console.warn("❌ Failed to initialize Firebase:", error);
}

cron.schedule("*/5 * * * *", () => {
  cache.flushAll();
  console.warn("🗑️ NodeCache flushed (cron 5min)");
});

updateAllExpiredPhotos();
cron.schedule("0 2 * * *", async () => {
  try {
    await updateAllExpiredPhotos();
  } catch (error) {
    console.warn("❌ Помилка автоматичного оновлення фото (cron):", error);
  }
});
