/**
 * 🧍‍♂️ USER POSITION
 * Структура даних для зберігання інформації про позицію користувача щодо певного токена.
 * Використовується для персоналізації AI-прогнозів та рекомендацій.
 */
export const USER_POSITION = {
  user_position: {
    has_token: true, //Чи є у користувача токен у портфелі
    token_amount: null as number | null, //Кількість токенів, які користувач має
    token_buy_price: null as number | null, //Середня ціна покупки токена (USD)
  },
};

/**
 * 🔮 FORECAST
 * Прогноз поведінки ціни криптовалюти
 */
export const FORECAST = {
  forecast: {
    next_rise_date: null as string | null, //ISO-дата, коли очікується підняття ціни
    next_rise_in_days: null as number | null, //Через скільки днів очікується підняття
    next_fall_date: null as string | null, //ISO-дата, коли очікується падіння ціни
    next_fall_in_days: null as number | null, //Через скільки днів очікується падіння
  },
};

/**
 * 💰 RECOMMENDATION
 * AI-рекомендації для дій користувача
 */
export const RECOMMENDATION = {
  recommendation: {
    buy_now: false, //Рекомендація купувати зараз
    buy_now_percent: 0, //Ймовірність прибутку (у %)
    buy_now_message: "", //Пояснення причини купівлі
    sell_now: false, //Рекомендація продавати зараз
    sell_now_percent: 0, //Ймовірність падіння ціни (у %)
    sell_now_message: "", //Пояснення причини продажу
  },
};

/**
 * 🌍 MARKET CONTEXT
 * Аналіз поточного стану ринку, вплив BTC, політичних та соціальних факторів
 */
export const MARKET_CONTEXT = {
  market_context: {
    market_sentiment: "neutral" as "bullish" | "bearish" | "neutral", // Загальний настрій ринку
    btc_trend: "neutral" as "up" | "down" | "neutral", // Поточна динаміка Bitcoin
    altcoin_trend: "neutral" as "up" | "down" | "neutral", // Тренд альткоїнів
    political_impact: "", // Політичні або макроекономічні фактори, що впливають на ринок
    meme_factor_impact: "", // Мем-ефект, соціальна чи віральна активність навколо токена
    community_activity: "medium" as "high" | "medium" | "low", // Активність спільноти токена
    news_sentiment: "neutral" as "positive" | "neutral" | "negative", // Тональність новин (згадок у соцмережах, статтях)
    market_analysis_message: "", // Коротке пояснення аналітичного стану ринку
  },
};

/**
 * ⚠️ RISK AND INFLUENCE
 * Рівень ризику, впливові фактори та впевненість AI-моделі
 */
export const RISK_AND_INFLUENCE = {
  risk_and_influence: {
    risk_level: "medium" as "low" | "medium" | "high", // Загальний рівень ризику для токена
    risk_factors: [] as string[], // Основні ризики, що можуть вплинути на токен
    main_influences: [] as string[], // Основні фактори впливу на токен (ринок, новини, спільнота тощо)
    confidence_level: 0, // Впевненість AI у своєму прогнозі (0–100%)
  },
};

/**
 * 🧠 SUMMARY
 * Короткий підсумок передбачення та дата його створення
 */
export const SUMMARY = {
  summary: {
    ai_summary: "", // Загальне резюме або короткий висновок AI
    ai_generated_at: new Date().toISOString(), // Дата та час створення прогнозу
  },
};

/**
 * 🧩 AI_PREDICTION_SECTIONS
 * Об'єднання всіх секцій у єдину структуру для зручності використання
 */
export const AI_PREDICTION_SECTIONS = {
  ...USER_POSITION,
  ...FORECAST,
  ...RECOMMENDATION,
  ...MARKET_CONTEXT,
  ...RISK_AND_INFLUENCE,
  ...SUMMARY,
};
