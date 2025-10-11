import { Schema, model } from "mongoose";

const contractAddressSM = new Schema(
  {
    type: { type: String, required: true },
    address: { type: String, required: true },
  },
  { _id: false }
);

const coinPaprikaDataSM = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    symbol: { type: String, required: true },
    rank: { type: Number },
    is_new: { type: Boolean },
    is_active: { type: Boolean },
    type: { type: String },
    rev: { type: Number },
    contract_address: [contractAddressSM],
  },
  { _id: false }
);

const coinGeckoDataSM = new Schema(
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

const cryptoCoinSM = new Schema(
  {
    name: { type: String, required: true },
    symbol: { type: String, required: true },
    binancePair: { type: String },
    coinPaprikaData: { type: coinPaprikaDataSM },
    coinGeckoData: { type: coinGeckoDataSM },
    lastUpdatedCoinPaprika: { type: Date },
    lastUpdatedCoinGecko: { type: Date },
  },
  {
    timestamps: true,
  }
);

cryptoCoinSM.index({ symbol: 1, name: 1 }, { unique: true });
cryptoCoinSM.index({ symbol: 1 });
cryptoCoinSM.index({ name: 1 });

const CryptoCoinModel = model("coinDivinerAI-crypto-coins", cryptoCoinSM);

export default CryptoCoinModel;
