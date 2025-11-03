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

const dexScreenerTokenSM = new Schema(
  {
    address: { type: String, required: true },
    name: { type: String, required: true },
    symbol: { type: String, required: true },
  },
  { _id: false }
);

const dexScreenerLiquiditySM = new Schema(
  {
    usd: { type: Number },
    base: { type: Number },
    quote: { type: Number },
  },
  { _id: false }
);

const dexScreenerInfoSM = new Schema(
  {
    imageUrl: { type: String },
    websites: [
      {
        url: { type: String },
      },
    ],
    socials: [
      {
        platform: { type: String },
        handle: { type: String },
      },
    ],
  },
  { _id: false }
);

const dexScreenerDataSM = new Schema(
  {
    chainId: { type: String, required: true },
    dexId: { type: String, required: true },
    url: { type: String },
    pairAddress: { type: String, required: true },
    priceNative: { type: String },
    priceUsd: { type: String },
    fdv: { type: Number },
    marketCap: { type: Number },
    pairCreatedAt: { type: Number },
    labels: [{ type: String }],
    volume: { type: Schema.Types.Mixed },
    priceChange: { type: Schema.Types.Mixed },
    baseToken: { type: dexScreenerTokenSM, required: true },
    quoteToken: { type: dexScreenerTokenSM, required: true },
    liquidity: { type: dexScreenerLiquiditySM },
    boosts: {
      active: { type: Number },
    },
    txns: { type: Schema.Types.Mixed },
    info: { type: dexScreenerInfoSM },
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
    dexscreenerData: { type: dexScreenerDataSM },
    source: [{ type: String, enum: ["coinpaprika", "coingecko", "dexscreener"] }],
    lastUpdatedCoinPaprika: { type: Date },
    lastUpdatedCoinGecko: { type: Date },
    lastUpdatedDexScreener: { type: Date },
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
