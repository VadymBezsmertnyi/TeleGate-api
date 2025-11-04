export interface PumpTokenResponse {
  result: PumpToken[];
  pageSize: number;
  page: number;
  cursor: string;
}

export interface PumpToken {
  tokenAddress: string;
  name: string;
  symbol: string;
  logo: string | null;
  decimals: string;
  priceNative: string | null;
  priceUsd: string | null;
  liquidity: string | null;
  fullyDilutedValuation: string | null;
  createdAt: string;
}
