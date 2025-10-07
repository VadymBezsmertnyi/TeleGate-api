export enum ECoinType {
  COIN = "coin",
  TOKEN = "token",
}

export type TCoinMainInfo = {
  id: string;
  name: string;
  symbol: string;
  rank: number;
  is_new: boolean;
  is_active: boolean;
  type: ECoinType;
};

export type TCoinTag = {
  id: string;
  name: string;
  coin_counter: number;
  ico_counter: number;
};

export type TCoinTeam = {
  id: string;
  name: string;
  position: string;
};

export type TCoinLink = {
  explorer: string[];
  facebook: string[];
  reddit: string[];
  source_code: string[];
  website: string[];
  youtube: string[];
};

export type TCoinLinkExtended = {
  url: string;
  type: string;
  stats?: { [key: string]: number };
};

export type TCoinWhitepaper = {
  link: string;
  thumbnail: string;
};

export type TCoinFullInfo = {
  id: string;
  name: string;
  symbol: string;
  rank: number;
  is_new: boolean;
  is_active: boolean;
  type: ECoinType;
  description: string;
  logo: string;
  tags: TCoinTag[];
  team: TCoinTeam[];
  links: TCoinLink;
  open_source: boolean;
  started_at: string;
  development_status: string;
  hardware_wallet: boolean;
  proof_type: string;
  org_structure: string;
  hash_algorithm: string;
  links_extended: TCoinLinkExtended[];
  whitepaper: TCoinWhitepaper;
  first_data_at: string;
  last_data_at: string;
};

export type TCoinQuoteItem = {
  price: number;
  volume_24h: number;
  volume_24h_change_24h: number;
  market_cap: number;
  market_cap_change_24h: number;
  percent_change_15m: number;
  percent_change_30m: number;
  percent_change_1h: number;
  percent_change_6h: number;
  percent_change_12h: number;
  percent_change_24h: number;
  percent_change_7d: number;
  percent_change_30d: number;
  percent_change_1y: number;
  ath_price: number;
  ath_date: string;
  percent_from_price_ath: number;
};

export type TCoinQuotes = {
  USD: TCoinQuoteItem;
  [key: string]: TCoinQuoteItem; // Додаткові валюти
};

export type TCoinTicker = {
  id: string;
  name: string;
  symbol: string;
  rank: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  beta_value: number;
  first_data_at: string;
  last_updated: string;
  quotes: TCoinQuotes;
};
