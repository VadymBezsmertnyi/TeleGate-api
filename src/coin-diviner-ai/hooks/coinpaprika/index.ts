import axios from "axios";

const API_BASE = "https://api.coinpaprika.com/v1";

export const fetchFromPaprika = async (
  endpoint: string,
  params: Record<string, any> = {}
) => {
  try {
    const { data } = await axios.get(`${API_BASE}${endpoint}`, {
      params,
      headers: process.env.COINPAPRIKA_API_KEY
        ? { Authorization: `Bearer ${process.env.COINPAPRIKA_API_KEY}` }
        : {},
    });
    return data;
  } catch (err: any) {
    console.warn(`❌ Paprika error [${endpoint}]:`, err.message);
    return null;
  }
};

export const CoinPaprikaService = {
  /**
   * Отримати всі доступні платформи (Ethereum, Tron, Binance Smart Chain і т.д.)
   */
  getPlatforms: async () => {
    return fetchFromPaprika("/contracts/platforms");
  },

  /**
   * Отримати список всіх монет (можна відфільтрувати за platform_id)
   * Напр. platform_id = "eth-ethereum" → усі токени ERC-20
   */
  getAllCoins: async (platform_id?: string) => {
    const all = await fetchFromPaprika("/coins");
    return platform_id
      ? all.filter((c: any) => c.platform?.id === platform_id)
      : all;
  },

  /**
   * Отримати детальну інформацію про монету/токен
   * (назва, опис, категорія, соц. посилання, логотип тощо)
   */
  getCoinInfo: async (coinId: string) => {
    return fetchFromPaprika(`/coins/${coinId}`);
  },

  /**
   * Отримати дані ринку по монеті (ціна, об’єм, капіталізація)
   */
  getTicker: async (coinId: string) => {
    return fetchFromPaprika(`/tickers/${coinId}`);
  },
};
