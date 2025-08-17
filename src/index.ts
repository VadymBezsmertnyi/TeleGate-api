import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cron from "node-cron";
import NodeCache from "node-cache";

// routes
import authTelegramRouter from "./routes/auth-telegram/auth-telegram";
import usersRouter from "./routes/users/users";
import groupsRouter from "./routes/groups/groups";
import membersRouter from "./routes/members/members";
import botConnectRouter from "./routes/bot-telegram/bot-connect";
import botSendMessagesRouter from "./routes/bot-send-messages/bot-send-messages";
import messageTemplatesRouter from "./routes/message-templates/message-templates";
import userPushTokensRouter from "./routes/user-push-tokens/push-tokens";

// start bot telegram
import startBotTelegram from "./routes/bot-telegram/bot-telegram";

// firebase
import { initializeFirebase } from "./helpers/firebase.helper";

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
    console.warn("Connect to db: success");
  })
  .catch((error: Error) => {
    console.warn("Connect to db: failed", error);
  });

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  return console.warn(`Express is listening at http://localhost:${PORT}`);
});

app.use("/api/auth-telegram", authTelegramRouter);
app.use("/api/users", usersRouter);
app.use("/api/users/push-tokens", userPushTokensRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/members", membersRouter);
app.use("/api/bot-telegram", botConnectRouter);
app.use("/api/bot-send-messages", botSendMessagesRouter);
app.use("/api/message-templates", messageTemplatesRouter);

startBotTelegram();

// Initialize Firebase
try {
  initializeFirebase();
} catch (error) {
  console.warn("Failed to initialize Firebase:", error);
}

cron.schedule("*/5 * * * *", () => {
  cache.flushAll();
  console.warn("🗑️ NodeCache flushed (cron 5min)");
});
