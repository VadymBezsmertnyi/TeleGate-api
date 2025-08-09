import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cron from "node-cron";
import NodeCache from "node-cache";

// routes
import authTelegramRouter from "./routes/auth-telegram/auth-telegram";
import usersRouter from "./routes/users/users";

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

cron.schedule("*/5 * * * *", () => {
  cache.flushAll();
  console.warn("🗑️ NodeCache flushed (cron 5min)");
});
