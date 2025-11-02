import { Pair } from "dexscreener-sdk";

export interface IPairsResponse {
  schemaVersion: string;
  pairs: Pair[] | null;
}
