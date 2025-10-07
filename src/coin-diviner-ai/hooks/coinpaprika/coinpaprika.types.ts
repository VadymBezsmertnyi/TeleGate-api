export type TCoinMainInfo = {
  id: string;
  name: string;
  symbol: string;
  rank: number;
  is_new: boolean;
  is_active: boolean;
  type: "coin" | "token";
};
