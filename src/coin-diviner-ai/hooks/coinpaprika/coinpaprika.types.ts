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
