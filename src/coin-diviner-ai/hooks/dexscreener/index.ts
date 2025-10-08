import { getTokenPools, getPairById, searchPairs } from "dexscreener-sdk";

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
};

export default DexScreenerService;
