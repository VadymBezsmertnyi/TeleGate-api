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
import groupSubscriptionsRouter from "./routes/group-subscriptions/group-subscriptions";
import memberSubscriptionsRouter from "./routes/member-subscriptions/member-subscriptions";
import botConnectRouter from "./routes/bot-telegram/bot-connect";
import botSendMessagesRouter from "./routes/bot-send-messages/bot-send-messages";
import messageTemplatesRouter from "./routes/message-templates/message-templates";
import userPushTokensRouter from "./routes/user-push-tokens/push-tokens";
import revenuecatRouter from "./routes/revenuecat/revenuecat";

// Coin Diviner AI - routes
import coinDivinerAiAuthRouter from "./coin-diviner-ai/routes/auth";
import coinDivinerAiCoinPaprikaRouter from "./coin-diviner-ai/routes/coinpaprica";
import coinDivinerAiBinanceRouter from "./coin-diviner-ai/routes/binance";
import coinDivinerAiCoingeckoRouter from "./coin-diviner-ai/routes/coingecko";
import coinDivinerAiDexScreenerRouter from "./coin-diviner-ai/routes/dexscreener";
import coinDivinerAiAggregatorRouter from "./coin-diviner-ai/routes/aggregator";
import coinDivinerAiPredictionRouter from "./coin-diviner-ai/routes/aiPrediction";
import coinDivinerAiPortfolioRouter from "./coin-diviner-ai/routes/portfolio";
import coinDivinerAiAutomationRouter from "./coin-diviner-ai/routes/automation";
import coinDivinerAiFavoritesRouter from "./coin-diviner-ai/routes/favorites";
import coinDivinerAiNotificationRouter from "./coin-diviner-ai/routes/notification";
import coinDivinerAiTelegramRouter from "./coin-diviner-ai/routes/telegram";
import coinDivinerAiRedirectRouter from "./coin-diviner-ai/routes/redirect";

// start bot telegram
import startBotTelegram from "./routes/bot-telegram/bot-telegram";

// helpers
import { updateAllExpiredPhotos } from "./routes/bot-telegram/bot-telegram.helper";

// firebase
import { initializeFirebase } from "./helpers/firebase.helper";
import { initializeCoinDivinerFirebase } from "./coin-diviner-ai/helpers/firebase.helper";

// swagger
import { specs } from "./config/swagger";
import { updateUserSubscriptionsFromRevenueCat } from "./routes/revenuecat/revenuecat.helper";

// Coin Diviner AI - main file
import "./coin-diviner-ai";

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
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
);

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
app.use("/api/group-subscriptions", groupSubscriptionsRouter);
app.use("/api/member-subscriptions", memberSubscriptionsRouter);
app.use("/api/bot-telegram", botConnectRouter);
app.use("/api/bot-send-messages", botSendMessagesRouter);
app.use("/api/message-templates", messageTemplatesRouter);
app.use("/api/revenuecat", revenuecatRouter);
// Coin Diviner AI - routes
app.use("/coin-diviner-ai/api/auth", coinDivinerAiAuthRouter);
app.use("/coin-diviner-ai/api/coinpaprika", coinDivinerAiCoinPaprikaRouter);
app.use("/coin-diviner-ai/api/binance", coinDivinerAiBinanceRouter);
app.use("/coin-diviner-ai/api/coingecko", coinDivinerAiCoingeckoRouter);
app.use("/coin-diviner-ai/api/dexscreener", coinDivinerAiDexScreenerRouter);
app.use("/coin-diviner-ai/api/aggregator", coinDivinerAiAggregatorRouter);
app.use("/coin-diviner-ai/api/ai-prediction", coinDivinerAiPredictionRouter);
app.use("/coin-diviner-ai/api/portfolio", coinDivinerAiPortfolioRouter);
app.use("/coin-diviner-ai/api/automation", coinDivinerAiAutomationRouter);
app.use("/coin-diviner-ai/api/favorites", coinDivinerAiFavoritesRouter);
app.use("/coin-diviner-ai/api/notification", coinDivinerAiNotificationRouter);
app.use("/coin-diviner-ai/api/telegram", coinDivinerAiTelegramRouter);
app.use("/coin-diviner-ai/api/redirect", coinDivinerAiRedirectRouter);

const startHelps = () => {
  try {
    startBotTelegram(); // Start bot telegram
    updateAllExpiredPhotos(); // Initial photo cache update
    updateUserSubscriptionsFromRevenueCat(); // Initial subscription update
    cache.flushAll(); // Initial cache flush
  } catch (error) {
    console.warn("❌ Failed to start bot telegram:", error);
  }
};

try {
  initializeFirebase(); // Initialize Firebase
} catch (error) {
  console.warn("❌ Failed to initialize Firebase:", error);
}

try {
  initializeCoinDivinerFirebase();
} catch (error) {
  console.warn("❌ Failed to initialize Coin Diviner AI Firebase:", error);
}

startHelps(); // Start bot and initial tasks

cron.schedule("*/5 * * * *", () => {
  cache.flushAll();
  console.warn("🗑️ NodeCache flushed (cron 5min)");
});

cron.schedule("0 2 * * *", async () => {
  try {
    await updateAllExpiredPhotos();
  } catch (error) {
    console.warn("❌ Помилка автоматичного оновлення фото (cron):", error);
  }
});

cron.schedule("0 6 * * *", async () => {
  try {
    const result = await updateUserSubscriptionsFromRevenueCat();
    console.warn("✅ Оновлення підписок з RevenueCat завершено:", result);
  } catch (error) {
    console.warn("❌ Помилка автоматичного оновлення підписок (cron):", error);
  }
});
