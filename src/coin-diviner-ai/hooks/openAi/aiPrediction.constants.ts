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
    buy_confidence: 0, //Впевненість у рекомендації купівлі (0-100%)
    buy_message: "", //Пояснення причини купівлі
    sell_now: false, //Рекомендація продавати зараз
    sell_confidence: 0, //Впевненість у рекомендації продажу (0-100%)
    sell_message: "", //Пояснення причини продажу
  },
};

/**
 * 🌍 MARKET CONTEXT
 * Аналіз поточного стану ринку, вплив BTC, політичних та соціальних факторів
 */
export const MARKET_CONTEXT = {
  market_context: {
    sentiment: "neutral" as "bullish" | "bearish" | "neutral", // Загальний настрій ринку
    btc_trend: "neutral" as "up" | "down" | "neutral", // Поточна динаміка Bitcoin
    altcoin_trend: "neutral" as "up" | "down" | "neutral", // Тренд альткоїнів
    political_impact: "", // Політичні або макроекономічні фактори, що впливають на ринок
    meme_factor: "", // Мем-ефект, соціальна чи віральна активність навколо токена
    community_activity: "medium" as "high" | "medium" | "low", // Активність спільноти токена
    news_sentiment: "neutral" as "positive" | "neutral" | "negative", // Тональність новин (згадок у соцмережах, статтях)
    analysis_summary: "", // Коротке пояснення аналітичного стану ринку
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
    conclusion: "", // Загальне резюме або короткий висновок AI (1-2 речення)
    generated_at: new Date().toISOString(), // Дата та час створення прогнозу (ISO формат)
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
