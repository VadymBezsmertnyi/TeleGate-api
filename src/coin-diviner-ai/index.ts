import dotenv from "dotenv";
import cron from "node-cron";
import { sendTestPushToAllUsers } from "./hooks/push";
import { runAutomationCheck } from "./hooks/automation/automation.scheduler";
import { checkWalletsSpy } from "./hooks/wallets-spy";

dotenv.config();

if (false)
  sendTestPushToAllUsers()
    .then((result) => {
      console.warn("Результат відправки тестових пуш-сповіщень:", result);
    })
    .catch((error) => {
      console.error("Помилка при відправці тестових пуш-сповіщень:", error);
    });

/**
 * Запускає перевірку автоматизацій та шпигунство за гаманцями при старті сервера.
 */
const startHooksWithServer = async () => {
  await runAutomationCheck();
  await checkWalletsSpy();
};
startHooksWithServer();

/**
 * Планує періодичну перевірку автоматизацій кожну хвилину.
 */
cron.schedule("* * * * *", () => {
  runAutomationCheck();
});

/**
 * Планує шпигунство за гаманцями кожні 10 хвилин.
 */
cron.schedule("*/10 * * * *", () => {
  checkWalletsSpy();
});
