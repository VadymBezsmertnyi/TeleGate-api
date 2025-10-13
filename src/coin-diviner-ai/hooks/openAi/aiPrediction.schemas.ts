import z from "zod";

export const aiPredictionSchema = z
  .object({
    user_position: z.object({
      has_token: z.boolean().describe("Чи користувач володіє токеном"),
      token_amount: z
        .number()
        .nullable()
        .describe("Кількість токенів, які користувач має"),
      token_buy_price: z
        .number()
        .nullable()
        .describe("Середня ціна покупки токена (USD)"),
    }),
    forecast: z.object({
      next_rise_date: z
        .string()
        .nullable()
        .describe("ISO-дата, коли очікується підняття ціни"),
      next_rise_in_days: z
        .number()
        .nullable()
        .describe("Через скільки днів очікується підняття"),
      next_fall_date: z
        .string()
        .nullable()
        .describe("ISO-дата, коли очікується падіння ціни"),
      next_fall_in_days: z
        .number()
        .nullable()
        .describe("Через скільки днів очікується падіння"),
    }),
    recommendation: z.object({
      buy_now: z.boolean().describe("Рекомендація купувати зараз"),
      buy_now_percent: z.number().describe("Ймовірність прибутку (у %)"),
      buy_now_message: z.string().describe("Пояснення причини купівлі"),
      sell_now: z.boolean().describe("Рекомендація продавати зараз"),
      sell_now_percent: z.number().describe("Ймовірність падіння ціни (у %)"),
      sell_now_message: z.string().describe("Пояснення причини продажу"),
    }),
    market_context: z.object({
      market_sentiment: z
        .enum(["bullish", "bearish", "neutral"])
        .describe("Загальний настрій ринку"),
      btc_trend: z
        .enum(["up", "down", "neutral"])
        .describe("Поточна динаміка Bitcoin"),
      altcoin_trend: z
        .enum(["up", "down", "neutral"])
        .describe("Тренд альткоїнів"),
      political_impact: z
        .string()
        .describe(
          "Політичні або макроекономічні фактори, що впливають на ринок"
        ),
      meme_factor_impact: z
        .string()
        .describe("Мем-ефект, соціальна чи віральна активність навколо токена"),
      community_activity: z
        .enum(["high", "medium", "low"])
        .describe("Активність спільноти токена"),
      news_sentiment: z
        .enum(["positive", "neutral", "negative"])
        .describe("Тональність новин (згадок у соцмережах, статтях)"),
      market_analysis_message: z
        .string()
        .describe("Коротке пояснення аналітичного стану ринку"),
    }),
    risk_and_influence: z.object({
      risk_level: z
        .enum(["low", "medium", "high"])
        .describe("Загальний рівень ризику для токена"),
      risk_factors: z
        .array(z.string())
        .describe("Основні ризики, що можуть вплинути на токен"),
      main_influences: z
        .array(z.string())
        .describe("Головні фактори, що впливають на прогноз"),
      confidence_level: z
        .number()
        .describe("Впевненість AI-моделі у прогнозі (0–100)"),
    }),
    summary: z.object({
      conclusion: z.string().describe("Короткий висновок у 1–2 реченнях"),
      generated_at: z.string().describe("ISO-дата генерації"),
    }),
  })
  .describe("AI-прогноз для криптовалюти");
