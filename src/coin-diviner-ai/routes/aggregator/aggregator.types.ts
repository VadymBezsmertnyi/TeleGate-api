export type TContractAddress = {
  type: string;
  address: string;
};

export type TCoinPaprikaData = {
  id: string;
  name: string;
  symbol: string;
  rank?: number;
  is_new?: boolean;
  is_active?: boolean;
  type?: string;
  rev?: number;
  contract_address?: TContractAddress[];
};

export type TCoinGeckoData = {
  id: string;
  name: string;
  api_symbol?: string;
  symbol: string;
  market_cap_rank?: number | null;
  thumb?: string;
  large?: string;
};

export type TCryptoCoin = {
  _id?: string;
  coinId: string;
  name: string;
  symbol: string;
  coinPaprikaData?: TCoinPaprikaData;
  coinGeckoData?: TCoinGeckoData;
  lastUpdatedCoinPaprika?: Date;
  lastUpdatedCoinGecko?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TSearchQuery = {
  _id?: string;
  query: string;
  lastSearched: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TSearchCoinsResult = {
  results: (TCoinPaprikaData | TCoinGeckoData)[];
  source: "coinpaprika" | "coingecko" | null;
  cached: boolean;
};

export type TPriceResult = {
  symbol: string;
  price: number;
  source: "binance" | "dexscreener" | "coingecko";
};

export type TPriceHistoryResult = {
  data: any;
  source: "coingecko" | "coinpaprika";
};
