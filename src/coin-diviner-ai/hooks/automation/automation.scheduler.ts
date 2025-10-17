import { checkActiveAutomations } from "./automation.triggers";
import { executeAutomationActions } from "./automation.actions";

let isRunning = false;

/**
 * Запускає перевірку автоматизацій та виконує дії для спрацьованих
 */
export const runAutomationCheck = async (): Promise<void> => {
  if (isRunning) return;

  isRunning = true;
  try {
    const results = await checkActiveAutomations();
    if (results.length === 0) return;

    for (const result of results) {
      if (result.triggeredAutomations.length > 0)
        await executeAutomationActions(result.triggeredAutomations);
    }
  } catch (error) {
    console.warn("Error running automation check:", error);
  } finally {
    isRunning = false;
  }
};
