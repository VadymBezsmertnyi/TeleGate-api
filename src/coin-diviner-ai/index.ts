import dotenv from "dotenv";
import cron from "node-cron";
import { sendTestPushToAllUsers } from "./hooks/push";
import { runAutomationCheck } from "./hooks/automation/automation.scheduler";

dotenv.config();

if (false)
  sendTestPushToAllUsers()
    .then((result) => {
      console.log("Результат відправки тестових пуш-сповіщень:", result);
    })
    .catch((error) => {
      console.error("Помилка при відправці тестових пуш-сповіщень:", error);
    });

runAutomationCheck();

cron.schedule("* * * * *", () => {
  runAutomationCheck();
});
