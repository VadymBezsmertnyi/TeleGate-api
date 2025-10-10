import { Schema, model } from "mongoose";

const contractAddressSchema = new Schema(
  {
    type: { type: String, required: true },
    address: { type: String, required: true },
  },
  { _id: false }
);

const coinPaprikaDataSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    symbol: { type: String, required: true },
    rank: { type: Number },
    is_new: { type: Boolean },
    is_active: { type: Boolean },
    type: { type: String },
    rev: { type: Number },
    contract_address: [contractAddressSchema],
  },
  { _id: false }
);

const coinGeckoDataSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    api_symbol: { type: String },
    symbol: { type: String, required: true },
    market_cap_rank: { type: Number },
    thumb: { type: String },
    large: { type: String },
  },
  { _id: false }
);

const cryptoCoinSchema = new Schema(
  {
    coinId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    symbol: { type: String, required: true },
    coinPaprikaData: { type: coinPaprikaDataSchema },
    coinGeckoData: { type: coinGeckoDataSchema },
    lastUpdatedCoinPaprika: { type: Date },
    lastUpdatedCoinGecko: { type: Date },
  },
  {
    timestamps: true,
  }
);

cryptoCoinSchema.index({ coinId: 1 });
cryptoCoinSchema.index({ symbol: 1 });
cryptoCoinSchema.index({ name: 1 });

const CryptoCoinModel = model("coinDivinerAI-crypto-coins", cryptoCoinSchema);

export default CryptoCoinModel;
