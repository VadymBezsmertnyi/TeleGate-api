import z from "zod";
import { aiPredictionSchema } from "./aiPrediction.schemas";

export interface ITokenData {
  id: string; // унікальний id токена (CoinGecko або CoinPaprika)
  symbol: string; // символ (наприклад: "DISCO")
  name: string; // назва токена ("Disco By Matt Furie")
  contractAddress?: string | null; // адреса контракту (ERC20, BEP20)
  network?: string; // мережа (Ethereum, BSC, Tron, Polygon)

  // === Поточні ринкові показники ===
  current_price_usd?: number | null; // поточна ціна в USD
  price_change_24h?: number | null; // зміна ціни за 24 год (в %)
  price_change_7d?: number | null; // зміна за 7 днів
  market_cap?: number | null; // ринкова капіталізація
  volume_24h?: number | null; // обсяг торгів за 24 години
  liquidity_usd?: number | null; // ліквідність (якщо доступна з DexScreener)
  holders?: number | null; // кількість власників (AI визначає самостійно)

  // === Додаткова інформація ===
  launch_date?: string | null; // дата запуску токена
  is_meme?: boolean; // чи є мем-токеном
  verified_on_dexscreener?: boolean; // перевірка лістингу на DEX
  coingecko_rank?: number | null; // рейтинг з CoinGecko
  paprika_rank?: number | null; // рейтинг з CoinPaprika

  // === Повна інформація про ціни з різних джерел ===
  price_sources?: {
    binance?: { price: number; updatedAt: string } | null; // ціна та час оновлення з Binance
    dexscreener?: { price: number; updatedAt: string } | null; // ціна та час оновлення з DexScreener
    coingecko?: { price: number; updatedAt: string } | null; // ціна та час оновлення з CoinGecko
  };

  // === Історичні дані ===
  price_history?: {
    prices?: Array<[number, number]>; // масив [timestamp, price]
    market_caps?: Array<[number, number]>; // масив [timestamp, market_cap]
    total_volumes?: Array<[number, number]>; // масив [timestamp, volume]
  };

  // === Детальна статистика з CoinPaprika ===
  paprika_stats?: {
    beta_value?: number | null; // бета-коефіцієнт волатильності
    percent_change_15m?: number | null; // зміна за 15 хвилин
    percent_change_30m?: number | null; // зміна за 30 хвилин
    percent_change_1h?: number | null; // зміна за 1 годину
    percent_change_6h?: number | null; // зміна за 6 годин
    percent_change_12h?: number | null; // зміна за 12 годин
    percent_change_30d?: number | null; // зміна за 30 днів
    percent_change_1y?: number | null; // зміна за рік
    ath_price?: number | null; // максимальна історична ціна
    ath_date?: string | null; // дата досягнення ATH
    percent_from_ath?: number | null; // відсток від ATH
    volume_24h_change?: number | null; // зміна обсягу за 24 год (%)
  };

  // === Транзакції користувача ===
  user_transactions?: {
    has_positions: boolean; // чи є у користувача транзакції з цією монетою
    total_purchases: number; // кількість покупок
    total_sales: number; // кількість продажів
    purchases?: Array<{
      amount_usd: number;
      amount_crypto: number;
      price_per_unit: number;
      date: string;
    }>;
    sales?: Array<{
      amount_usd: number;
      amount_crypto: number;
      price_per_unit: number;
      date: string;
    }>;
    average_buy_price?: number | null; // середня ціна покупки
    min_buy_price?: number | null; // мінімальна ціна покупки
    max_buy_price?: number | null; // максимальна ціна покупки
    total_invested_usd?: number | null; // загальна інвестована сума
    total_crypto_amount?: number | null; // загальна кількість купленої криптовалюти
    remaining_crypto_amount?: number | null; // залишок криптовалюти після продажів
    current_profit_loss?: number | null; // поточний прибуток/збиток в USD
    current_profit_loss_percent?: number | null; // поточний прибуток/збиток у %
  };
}

export interface IGeneratePredictionOptions {
  tokenData: ITokenData;
  language?: "uk" | "en"; // за замовчуванням буде 'uk'
}

/* export interface IAiPrediction {
  user_position: {
    has_token: boolean; // чи користувач володіє токеном
    token_amount: number | null; // кількість токенів
    token_buy_price: number | null; // середня ціна покупки (USD)
  };

  forecast: {
    next_rise_date: string | null; // ISO-дата ймовірного росту (2025-10-15T12:00:00Z)
    next_rise_in_days: number | null; // через скільки днів підйом
    next_fall_date: string | null; // ISO-дата ймовірного падіння
    next_fall_in_days: number | null; // через скільки днів падіння
  };

  recommendation: {
    buy_now: boolean; // чи варто купити зараз
    buy_confidence: number; // 0–100% впевненості
    buy_message: string; // пояснення чому

    sell_now: boolean; // чи варто продати зараз
    sell_confidence: number; // 0–100% впевненості
    sell_message: string; // пояснення чому
  };

  market_context: {
    sentiment: "bullish" | "bearish" | "neutral"; // загальний настрій ринку
    btc_trend: "up" | "down" | "neutral"; // тренд BTC
    altcoin_trend: "up" | "down" | "neutral"; // тренд альткоїнів
    political_impact: string; // політичний вплив ("США знижує ставки")
    meme_factor: string; // вплив мем-ринку ("активність росте")
    community_activity: "high" | "medium" | "low"; // активність спільноти токена
    news_sentiment: "positive" | "neutral" | "negative"; // тональність новин
    analysis_summary: string; // короткий огляд ринку
  };

  risk_and_influence: {
    risk_level: "low" | "medium" | "high"; // рівень ризику інвестиції
    risk_factors: string[]; // ["low liquidity", "new token", "meme-based"]
    main_influences: string[]; // ["BTC trend", "Elon Musk tweet"]
    confidence_level: number; // впевненість у прогнозі (0–100)
  };

  summary: {
    conclusion: string; // короткий висновок у 1–2 реченнях
    generated_at: string; // ISO-дата генерації
  };
}
 */

export type TAiPrediction = z.infer<typeof aiPredictionSchema>;
