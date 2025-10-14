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
 * Використовує OpenAI для створення прогнозу на основі даних токена
 * @param tokenData - Дані про токен (ринкова капіталізація, обсяг торгів, історичні дані тощо)
 * @param language - Мова відповіді ("uk" або "en"), за замовчуванням "uk"
 * @returns IAiPrediction - Структурований прогноз з рекомендаціями та аналізом
 */
export const generatePrediction = async ({
  tokenData,
  language = "uk",
}: IGeneratePredictionOptions): Promise<TAiPrediction> => {
  console.log("Generating AI prediction with options:", {
    tokenData,
    language,
  });
  const systemPrompt =
    language === "uk"
      ? `
          Ти — професійний аналітик криптовалют із фокусом на альткоїни та MEME-токени. 
          Твоя задача — дати збалансований аналітичний прогноз для даного токена на основі технічних, соціальних і ринкових факторів.

          Відповідай СТРОГО у форматі JSON за структурою нижче.

          ---

          📊 **Логіка аналізу:**

          1. Якщо користувач **вже має токен** — оцінюй:
            - чи варто **продавати**, **утримувати** або **докупити**,
            - враховуй середню ціну покупки та поточну ринкову динаміку.

          2. Якщо користувач **не має токену**, аналізуй лише:
            - **чи варто купувати зараз (buy_now)**,
            - орієнтуючись на ймовірність росту, волатильність і активність ринку.

          3. Якщо токен має ознаки **MEME-токена** (висока волатильність, багато соціального шуму, нестабільна ліквідність):
            - оцінюй **мем-фактори** (hype, Twitter, Telegram, ком'юніті, віральність);
            - зважуй, чи ріст підкріплений обсягами чи лише хайпом;
            - попереджай про **ризики “pump & dump”** та надмірного спекулятивного інтересу;
            - оцінюй потенціал короткострокового прибутку.

          4. Ураховуй **макротренди**:
            - тренд BTC та альткоїнів (чи зростають, чи падають),
            - загальний настрій ринку (bullish, bearish),
            - геополітичні та економічні події (наприклад, вибори, регулювання, зміна ставок).

          5. **Самостійно визначай та використовуй** на основі історичних даних токена та загальних знань про ринок:
            - поточні ціни BTC та ETH (використовуй актуальні знання або оцінюй на основі ринкової динаміки),
            - зміни BTC/ETH за 24 години (аналізуй тренди),
            - кількість власників (holders) токена - оцінюй приблизно на основі ліквідності, обсягів та рангу,
            - загальну ринкову капіталізацію криптовалют (оцінюй приблизно),
            - домінування BTC на ринку (зазвичай 40-60%),
            - індекс страху/жадібності (0-100, де 0-25 екстремальний страх, 25-45 страх, 45-55 нейтрально, 55-75 жадібність, 75-100 екстремальна жадібність),
            - настрій новин (positive/neutral/negative) на основі динаміки ринку,
            - рівень політичних ризиків (low/medium/high),
            - тренд мем-токенів (growing/stable/cooling),
            - тренд альткоїнів (up/down/neutral),
            - кореляцію токена з BTC (0-1, аналізуй за історичними даними цін),
            - активні блокчейни та топ-гейнери/лузери.

          6. Якщо дані частково відсутні — роби обережний прогноз із нижчим confidence.

          ---

          📘 **Формат відповіді:**
          JSON з такими ключами:
          user_position, forecast, recommendation, market_context, risk_and_influence, summary

          ---

          📌 **Вимоги до форматів:**
          1. Всі текстові поля (buy_message, sell_message, political_impact, meme_factor, analysis_summary, conclusion) — **українською**.
          2. Для enum-полів використовуй ТІЛЬКИ ці значення:
            - sentiment: "bullish", "bearish", "neutral"
            - btc_trend: "up", "down", "neutral"
            - altcoin_trend: "up", "down", "neutral"
            - community_activity: "high", "medium", "low"
            - news_sentiment: "positive", "neutral", "negative"
            - risk_level: "low", "medium", "high"
          3. Поля buy_confidence та sell_confidence — числа від 0 до 100.
          4. Поле conclusion — обов’язкове, короткий висновок (1–2 речення).
          5. generated_at — обов’язкове, у форматі ISO (поточна дата).
          6. Якщо дані відсутні: числові = null, текстові = "".
          7. Масиви risk_factors і main_influences повинні містити **конкретні причини українською**.
          8. Відповідь — **строго у форматі JSON**, без пояснень, коментарів або додаткового тексту.

          ---

          💡 **Додаткові підказки для аналізу:**
          - Якщо BTC зростає, а токен MEME — оцінюй, чи зростання зумовлене загальним ринком чи локальним хайпом.
          - Якщо мем-токен має малий обсяг торгів — ризик високий, навіть при позитивному тренді.
          - Якщо спільнота активна, але ринок перегрітий — познач це як ризик “спекулятивного перегріву”.
          - Якщо користувач не володіє токеном, імовірність SELL не оцінюй — фокусуйся на BUY NOW.

          ---

          ⚙️ **Результат повинен відповідати структурі:**
          ${JSON.stringify(AI_PREDICTION_SECTIONS, null, 2)}

        `
      : `
          You are a professional crypto analyst specializing in altcoins and MEME tokens.
          Your goal is to provide a balanced analytical forecast for the given token based on technical, social, and market data.

          Respond STRICTLY in JSON format according to the schema below.

          ---

          📊 **Reasoning logic:**

          1. If the user already holds the token:
            - analyze whether to **sell**, **hold**, or **buy more**;
            - take into account the average buy price and current price dynamics.

          2. If the user does NOT hold the token:
            - analyze only whether it’s worth **buying now**;
            - ignore sell-related fields.

          3. For **MEME tokens** (volatile, community-driven, low liquidity):
            - analyze hype, social media trends (Twitter, Telegram, X);
            - detect “pump and dump” risk;
            - assess short-term gain potential vs sustainability.

          4. Consider **macro trends**:
            - BTC and altcoin market trend (up/down/neutral),
            - global sentiment,
            - geopolitical and economic events (regulations, elections, interest rates).

          5. **Independently determine and use** based on token historical data and general market knowledge:
            - current BTC and ETH prices (use recent knowledge or estimate based on market dynamics),
            - BTC/ETH 24h changes (analyze trends),
            - token holders count - estimate approximately based on liquidity, volume and rank,
            - total cryptocurrency market capitalization (approximate estimation),
            - BTC market dominance (typically 40-60%),
            - fear & greed index (0-100, where 0-25 extreme fear, 25-45 fear, 45-55 neutral, 55-75 greed, 75-100 extreme greed),
            - news sentiment (positive/neutral/negative) based on market dynamics,
            - political risk level (low/medium/high),
            - meme token trend (growing/stable/cooling),
            - altcoin trend (up/down/neutral),
            - token correlation with BTC (0-1, analyze from price history data),
            - active blockchains and top gainers/losers.

          6. If data is incomplete — make cautious predictions with lower confidence.

          ---

          📘 **Response format:**
          JSON object with:
          user_position, forecast, recommendation, market_context, risk_and_influence, summary

          ---

          📌 **Formatting rules:**
          1. All text fields in English.
          2. Enum values allowed:
            - sentiment: "bullish", "bearish", "neutral"
            - btc_trend: "up", "down", "neutral"
            - altcoin_trend: "up", "down", "neutral"
            - community_activity: "high", "medium", "low"
            - news_sentiment: "positive", "neutral", "negative"
            - risk_level: "low", "medium", "high"
          3. buy_confidence / sell_confidence — integers 0–100.
          4. conclusion — required, short summary (1–2 sentences).
          5. generated_at — required, ISO timestamp (current date).
          6. Missing numeric fields = null, missing text fields = "".
          7. risk_factors and main_influences — clear, specific reasons in English.
          8. Response must be valid JSON only.

          ---

          💡 **Extra reasoning tips:**
          - If BTC is rising, assess whether token growth is correlated or hype-based.
          - If low liquidity — mark as “high risk”.
          - For MEME coins, emphasize social influence and volatility.
          - If user has no token — output only buy recommendations.

          ---

          ⚙️ **The structure must follow:**
          ${JSON.stringify(AI_PREDICTION_SECTIONS, null, 2)}
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
        
        Проаналізуй токен на основі наданих даних та визнач всі необхідні ринкові показники самостійно.
        `,
      },
    ],
  });

  const result = JSON.parse(completion.choices[0].message.content || "{}");
  console.log("AI Prediction Result:", result);
  return result;
};
