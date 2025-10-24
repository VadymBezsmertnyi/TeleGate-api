import { Schema, model } from "mongoose";

const userPositionSM = new Schema(
  {
    has_token: { type: Boolean, required: true },
    token_amount: { type: Number, default: null },
    token_buy_price: { type: Number, default: null },
  },
  { _id: false }
);

const forecastSM = new Schema(
  {
    next_rise_date: { type: String, default: null },
    next_rise_in_days: { type: Number, default: null },
    next_fall_date: { type: String, default: null },
    next_fall_in_days: { type: Number, default: null },
  },
  { _id: false }
);

const recommendationSM = new Schema(
  {
    buy_now: { type: Boolean, required: true },
    buy_confidence: { type: Number, required: true },
    buy_message: { type: String, required: true },
    sell_now: { type: Boolean, required: true },
    sell_confidence: { type: Number, required: true },
    sell_message: { type: String, required: true },
  },
  { _id: false }
);

const marketContextSM = new Schema(
  {
    sentiment: {
      type: String,
      enum: ["bullish", "bearish", "neutral"],
      required: true,
    },
    btc_trend: {
      type: String,
      enum: ["up", "down", "neutral"],
      required: true,
    },
    altcoin_trend: {
      type: String,
      enum: ["up", "down", "neutral"],
      required: true,
    },
    political_impact: { type: String, required: true },
    meme_factor: { type: String, required: true },
    community_activity: {
      type: String,
      enum: ["high", "medium", "low"],
      required: true,
    },
    news_sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      required: true,
    },
    analysis_summary: { type: String, required: true },
    gold_analysis: {
      current_price: { type: Number, default: null },
      price_change_24h: { type: Number, default: null },
      price_change_7d: { type: Number, default: null },
      trend: {
        type: String,
        enum: ["up", "down", "neutral"],
        default: "neutral",
      },
      impact_on_crypto: { type: String, default: "" },
      analyst_forecast: { type: String, default: "" },
      correlation_with_btc: { type: String, default: "" },
    },
    macro_economic_factors: {
      fed_interest_rate: { type: Number, default: null },
      dxy_index: { type: Number, default: null },
      oil_price: { type: Number, default: null },
      sp500_change: { type: Number, default: null },
      nasdaq_change: { type: Number, default: null },
      inflation_rate: { type: Number, default: null },
      unemployment_rate: { type: Number, default: null },
      vix_index: { type: Number, default: null },
    },
    market_metrics: {
      fear_greed_index: { type: Number, default: null },
      btc_dominance: { type: Number, default: null },
      total_market_cap: { type: Number, default: null },
      total_volume_24h: { type: Number, default: null },
      stablecoin_supply: { type: Number, default: null },
      futures_liquidations: { type: Number, default: null },
      whale_movements: { type: String, default: "" },
      upcoming_events: [{ type: String }],
    },
    technical_indicators: {
      rsi: { type: Number, default: null },
      macd: { type: Number, default: null },
      moving_average_50: { type: Number, default: null },
      moving_average_200: { type: Number, default: null },
      bollinger_bands: { type: String, default: "" },
      support_levels: [{ type: Number }],
      resistance_levels: [{ type: Number }],
    },
  },
  { _id: false }
);

const riskAndInfluenceSM = new Schema(
  {
    risk_level: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },
    risk_factors: [{ type: String }],
    main_influences: [{ type: String }],
    confidence_level: { type: Number, required: true },
  },
  { _id: false }
);

const summarySM = new Schema(
  {
    conclusion: { type: String, required: true },
    generated_at: { type: String, required: true },
  },
  { _id: false }
);

const aiPredictionSM = new Schema(
  {
    user_position: { type: userPositionSM, required: true },
    ai_processing_time_ms: { type: Number, default: 0 },
    forecast: { type: forecastSM, required: true },
    recommendation: { type: recommendationSM, required: true },
    market_context: { type: marketContextSM, required: true },
    risk_and_influence: { type: riskAndInfluenceSM, required: true },
    summary: { type: summarySM, required: true },
  },
  { _id: false }
);

const predictionSM = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "coinDivinerAI-auth",
      required: true,
    },
    coinId: {
      type: Schema.Types.ObjectId,
      ref: "coinDivinerAI-crypto-coins",
      required: true,
    },
    language: { type: String, required: true },
    status: {
      type: String,
      enum: ["creating", "fetching_data", "generating", "completed", "error"],
      default: "creating",
      required: true,
    },
    prediction: { type: aiPredictionSM },
    tokenData: { type: Schema.Types.Mixed },
    error: { type: String },
  },
  {
    timestamps: true,
  }
);

predictionSM.index({ userId: 1, createdAt: -1 });
predictionSM.index({ coinId: 1, createdAt: -1 });
predictionSM.index({ status: 1 });

const PredictionModel = model("coinDivinerAI-predictions", predictionSM);

export default PredictionModel;
