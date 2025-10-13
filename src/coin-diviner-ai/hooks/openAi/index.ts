import OpenAI from "openai";

// types
import {
  TAiPrediction,
  IGeneratePredictionOptions,
} from "./aiPrediction.types";

// constants
import { AI_PREDICTION_SECTIONS } from "./aiPrediction.constants";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_ORG_ID = process.env.OPENAI_ORG_ID || "";
const OPENAI_PROJECT_ID = process.env.OPENAI_PROJECT_ID || "";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  organization: OPENAI_ORG_ID,
  project: OPENAI_PROJECT_ID,
});

/**
 * 🧙‍♂️ Генерація AI-прогнозу для криптовалюти
 * Використовує OpenAI для створення прогнозу на основі даних токена та ринку
 * @param tokenData - Дані про токен (ринкова капіталізація, обсяг торгів, соціальні метрики тощо)
 * @param marketData - Дані про ринок (тренди BTC, політичні фактори, активність мем-ринку тощо)
 * @param language - Мова відповіді ("uk" або "en"), за замовчуванням "uk"
 * @returns IAiPrediction - Структурований прогноз з рекомендаціями та аналізом
 */
export const generatePrediction = async ({
  tokenData,
  marketData,
  language = "uk",
}: IGeneratePredictionOptions): Promise<TAiPrediction> => {
  const systemPrompt =
    language === "uk"
      ? `
        Ти — аналітик криптовалют. 
        Відповідай українською мовою у форматі JSON за структурою нижче.
        Пояснення та коментарі всередині текстових полів також мають бути українською.
        Якщо дані відсутні, встав null або "".
      `
      : `
        You are a professional crypto market analyst.
        Respond strictly in JSON format according to the schema below.
        All commentary and message fields must be written in English.
        If data is missing, use null or "".
      `;

  const completion = await openai.chat.completions.create({
    model: "gpt-5-nano",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `${systemPrompt}\n\nSchema:\n${JSON.stringify(
          AI_PREDICTION_SECTIONS,
          null,
          2
        )}`,
      },
      {
        role: "user",
        content: `
        Token data:
        ${JSON.stringify(tokenData, null, 2)}

        Market data:
        ${JSON.stringify(marketData, null, 2)}
        `,
      },
    ],
  });

  const result = JSON.parse(completion.choices[0].message.content || "{}");
  console.log("AI Prediction Result:", result);
  return result;
};
