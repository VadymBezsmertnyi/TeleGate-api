export type TCoinGeckoSearchResult = {
  coins: Array<{
    id: string;
    name: string;
    symbol: string;
    market_cap_rank: number | null;
    thumb: string;
    large: string;
  }>;
  exchanges: any[];
  icos: any[];
  categories: any[];
};
