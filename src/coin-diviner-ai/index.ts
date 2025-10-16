import dotenv from "dotenv";
import { sendTestPushToAllUsers } from "./hooks/push";

dotenv.config();

if (false)
  sendTestPushToAllUsers()
    .then((result) => {
      console.log("Результат відправки тестових пуш-сповіщень:", result);
    })
    .catch((error) => {
      console.error("Помилка при відправці тестових пуш-сповіщень:", error);
    });
