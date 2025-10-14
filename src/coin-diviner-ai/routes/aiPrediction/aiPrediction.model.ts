import { Schema, model } from "mongoose";

const aiPredictionSM = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "coinDivinerAI-auth",
      required: true,
      index: true,
    },
    coinId: {
      type: Schema.Types.ObjectId,
      ref: "coinDivinerAI-cryptoCoin",
      required: true,
      index: true,
    },
    language: {
      type: String,
      enum: ["uk", "en"],
      default: "uk",
    },
    status: {
      type: String,
      enum: [
        "creating",
        "fetching_data",
        "generating_ai",
        "completed",
        "error",
      ],
      default: "creating",
      index: true,
    },
    predictionData: {
      user_position: {
        has_token: { type: Boolean },
        token_amount: { type: Number, default: null },
        token_buy_price: { type: Number, default: null },
      },
      forecast: {
        next_rise_date: { type: String, default: null },
        next_rise_in_days: { type: Number, default: null },
        next_fall_date: { type: String, default: null },
        next_fall_in_days: { type: Number, default: null },
      },
      recommendation: {
        buy_now: { type: Boolean },
        buy_confidence: { type: Number },
        buy_message: { type: String },
        sell_now: { type: Boolean },
        sell_confidence: { type: Number },
        sell_message: { type: String },
      },
      market_context: {
        sentiment: { type: String, enum: ["bullish", "bearish", "neutral"] },
        btc_trend: { type: String, enum: ["up", "down", "neutral"] },
        altcoin_trend: { type: String, enum: ["up", "down", "neutral"] },
        political_impact: { type: String },
        meme_factor: { type: String },
        community_activity: { type: String, enum: ["high", "medium", "low"] },
        news_sentiment: {
          type: String,
          enum: ["positive", "neutral", "negative"],
        },
        analysis_summary: { type: String },
      },
      risk_and_influence: {
        risk_level: { type: String, enum: ["low", "medium", "high"] },
        risk_factors: [{ type: String }],
        main_influences: [{ type: String }],
        confidence_level: { type: Number },
      },
      summary: {
        conclusion: { type: String },
        generated_at: { type: String },
      },
    },
    tokenData: {
      type: Schema.Types.Mixed,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

aiPredictionSM.index({ userId: 1, coinId: 1, createdAt: -1 });
aiPredictionSM.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AiPredictionModel = model("coinDivinerAI-aiPrediction", aiPredictionSM);

export default AiPredictionModel;
