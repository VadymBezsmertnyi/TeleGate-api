import axios from "axios";
import { getTokenPools, getPairById, searchPairs } from "dexscreener-sdk";
import { IPairsResponse } from "./dexscreener.types";

const BASE_URL = "https://api.dexscreener.com/latest/dex";

const fetchFromDexScreener = async <T>(
  endpoint: string,
  params: Record<string, any> = {}
): Promise<T | null> => {
  try {
    const { data } = await axios.get<T>(`${BASE_URL}${endpoint}`, {
      params,
    });
    return data;
  } catch (err: any) {
    console.warn(
      `❌ DexScreener error [${endpoint}]: ${
        err.response?.status || err.message
      }`
    );
    return null;
  }
};

const DexScreenerService = {
  /**
   * Отримати всі торгові пари за токеном (за контрактом)
   */
  getPairsByToken: async (tokenAddress: string, chainId: string) =>
    await getTokenPools(chainId, tokenAddress),

  /**
   * Отримати інформацію про конкретну пару (contract address)
   */
  getPair: async (chainId: string, pairAddress: string) =>
    await getPairById(chainId, pairAddress),

  /**
   * Пошук пар / токенів
   */
  search: async (q: string) => await searchPairs(q),

  /**
   * Отримати дані за токеном через ID токена
   */
  getByTokenId: async (tokenId: string) =>
    fetchFromDexScreener<IPairsResponse>(`/tokens/${tokenId}`),
};

export default DexScreenerService;
