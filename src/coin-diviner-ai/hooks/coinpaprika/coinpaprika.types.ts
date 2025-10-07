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

/* {
  "currencies": [
    {
      "id": "disco-disco-by-matt-furie",
      "name": "Disco By Matt Furie",
      "symbol": "DISCO",
      "rank": 7429,
      "is_new": false,
      "is_active": true,
      "type": "token",
      "rev": 1845873191,
      "contract_address": [
        {
          "type": "ERC20",
          "address": "0x787B197F793F7D04366536F6a7a56a799868A64b"
        }
      ]
    },
    {
      "id": "discord-discord",
      "name": "Discord",
      "symbol": "DISCORD",
      "rank": 0,
      "is_new": false,
      "is_active": false,
      "type": "token",
      "rev": 11081445,
      "contract_address": [
        {
          "type": "ERC20",
          "address": "0x422b19a9829fffc858f91b43add8fe98b2d877fc"
        }
      ]
    },
    {
      "id": "discover-discover-crypto",
      "name": "Discover Crypto",
      "symbol": "DISCOVER",
      "rank": 0,
      "is_new": false,
      "is_active": false,
      "type": "token",
      "rev": 0,
      "contract_address": [
        {
          "type": "Other",
          "address": "0x92516394e4c762226bc5c80502bcff4ecd3a0e82"
        }
      ]
    },
    {
      "id": "disco-disco-chicken",
      "name": "DISCO Chicken",
      "symbol": "DISCO",
      "rank": 0,
      "is_new": false,
      "is_active": false,
      "type": "token",
      "rev": 11333411,
      "contract_address": [
        {
          "type": "Other",
          "address": "EW8BUbU9MV3so3z6VUW6E7n6C9eJSFRWY1REidS7pump"
        }
      ]
    },
    {
      "id": "discrd-discord-prestocks",
      "name": "Discord PreStocks",
      "symbol": "DISCRD",
      "rank": 0,
      "is_new": false,
      "is_active": false,
      "type": "token",
      "rev": 11552411,
      "contract_address": [
        {
          "type": "Other",
          "address": "PrekBgzytydXoDTrH5NW9ABP68c96twxML8oV1NnV8d"
        }
      ]
    },
    {
      "id": "disco-discoversecity",
      "name": "DISCOVERSECITY",
      "symbol": "DISCO",
      "rank": 0,
      "is_new": false,
      "is_active": false,
      "type": "token",
      "rev": 0,
      "contract_address": [
        {
          "type": "BEP20",
          "address": "0xf60c4afcb202eb5cf359f5272006f6d03f13cafd"
        }
      ]
    }
  ],
  "exchanges": [],
  "icos": [
    {
      "id": "disc-discoperi",
      "name": "Discoperi ICO",
      "symbol": "DISC",
      "is_new": false,
      "rev": 11056037
    }
  ],
  "people": [
    {
      "id": "disco-",
      "name": "disco987",
      "teams_count": 1
    }
  ],
  "tags": []
} */

export type TExchangeSearchResult = {
  id: string;
  name: string;
  markets: number;
  markets_url: string;
  fiats: string[];
  status: string;
  updated_at: string;
};

export type TIcoSearchResult = {
  id: string;
  name: string;
  symbol: string;
  is_new: boolean;
  rev: number;
};

export type TPersonSearchResult = {
  id: string;
  name: string;
  teams_count: number;
};

export type TCoinSearchResult = {
  currencies: TCoinMainInfo[];
  exchanges: TExchangeSearchResult[];
  icos: TIcoSearchResult[];
  people: TPersonSearchResult[];
  tags: TCoinTag[];
};
