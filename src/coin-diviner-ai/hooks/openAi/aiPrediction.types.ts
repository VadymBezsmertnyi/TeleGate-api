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
  holders?: number | null; // кількість власників (якщо є)

  // === Додаткова інформація ===
  launch_date?: string | null; // дата запуску токена
  is_meme?: boolean; // чи є мем-токеном
  verified_on_dexscreener?: boolean; // перевірка лістингу на DEX
  coingecko_rank?: number | null; // рейтинг з CoinGecko
  paprika_rank?: number | null; // рейтинг з CoinPaprika
}

export interface IMarketData {
  btc_price_usd: number; // поточна ціна BTC
  btc_change_24h: number; // зміна ціни BTC за 24 год (%)
  eth_price_usd: number; // поточна ціна ETH
  eth_change_24h: number; // зміна ETH за 24 год (%)
  total_market_cap_usd: number; // загальна капа ринку
  total_volume_24h_usd: number; // сумарний добовий обсяг
  btc_dominance_percent: number; // домінування BTC (%)
  fear_greed_index: number; // індекс страху/жадібності (0–100)

  // === Геополітичний та соціальний контекст ===
  global_news_sentiment?: "positive" | "neutral" | "negative"; // загальний настрій новин
  political_risk_level?: "low" | "medium" | "high"; // рівень політичних ризиків
  meme_market_trend?: "growing" | "stable" | "cooling"; // активність мем-ринку
  altcoin_trend?: "up" | "down" | "neutral"; // стан альткоїн-ринку

  // === Для AI-кореляції ===
  correlation_with_btc?: number; // коефіцієнт кореляції (0–1)
  active_blockchains?: string[]; // які мережі зараз ростуть
  top_gainers?: string[]; // топ-монети за приростом
  top_losers?: string[]; // топ-монети за падінням
}

export interface IGeneratePredictionOptions {
  tokenData: ITokenData;
  marketData: IMarketData;
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
