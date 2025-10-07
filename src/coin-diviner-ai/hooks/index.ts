export const getChainIdFromType = (type: string): string | null => {
  const map: Record<string, string> = {
    ERC20: "ethereum",
    BEP20: "bsc",
    TRC20: "tron",
    MATIC: "polygon",
    POLYGON: "polygon",
    SOL: "solana",
    ARB: "arbitrum",
    OPT: "optimism",
    AVAX: "avax",
    BASE: "base",
  };

  return map[type.toUpperCase()] || null;
};
