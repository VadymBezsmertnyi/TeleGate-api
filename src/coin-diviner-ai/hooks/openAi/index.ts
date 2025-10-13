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
        Ти — професійний аналітик криптовалют. 
        Відповідай СТРОГО у форматі JSON за структурою нижче.
        
        ВАЖЛИВО:
        1. Всі текстові поля (buy_message, sell_message, political_impact, meme_factor, analysis_summary, conclusion) мають бути українською
        2. Для enum-полів використовуй ТІЛЬКИ такі значення:
           - sentiment: "bullish", "bearish", "neutral"
           - btc_trend: "up", "down", "neutral"
           - altcoin_trend: "up", "down", "neutral"
           - community_activity: "high", "medium", "low"
           - news_sentiment: "positive", "neutral", "negative"
           - risk_level: "low", "medium", "high"
        3. buy_confidence та sell_confidence — числа від 0 до 100
        4. conclusion — обов'язкове поле з коротким висновком (1-2 речення)
        5. generated_at — обов'язкове поле в ISO форматі (використовуй поточну дату)
        6. Якщо дані відсутні для числових полів — null, для текстових — ""
        7. Масиви risk_factors та main_influences мають містити конкретні фактори українською
      `
      : `
        You are a professional crypto market analyst.
        Respond STRICTLY in JSON format according to the schema below.
        
        IMPORTANT:
        1. All text fields (buy_message, sell_message, political_impact, meme_factor, analysis_summary, conclusion) must be in English
        2. For enum fields use ONLY these values:
           - sentiment: "bullish", "bearish", "neutral"
           - btc_trend: "up", "down", "neutral"
           - altcoin_trend: "up", "down", "neutral"
           - community_activity: "high", "medium", "low"
           - news_sentiment: "positive", "neutral", "negative"
           - risk_level: "low", "medium", "high"
        3. buy_confidence and sell_confidence — numbers from 0 to 100
        4. conclusion — required field with short summary (1-2 sentences)
        5. generated_at — required field in ISO format (use current date)
        6. If data is missing for numeric fields — null, for text fields — ""
        7. Arrays risk_factors and main_influences should contain specific factors
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
