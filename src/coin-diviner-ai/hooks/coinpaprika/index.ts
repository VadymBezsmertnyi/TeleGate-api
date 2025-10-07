import axios from "axios";
import { TCoinFullInfo, TCoinMainInfo, TCoinTicker } from "./coinpaprika.types";

const API_BASE = "https://api.coinpaprika.com/v1";

export const fetchFromPaprika = async <T>(
  endpoint: string,
  params: Record<string, any> = {}
): Promise<T | null> => {
  try {
    const { data } = await axios.get<T>(`${API_BASE}${endpoint}`, {
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
   * Напр. "eth-ethereum", "trx-tron", "bsc-binance-smart-chain" тощо
   * @returns список platform_id
   */
  getPlatforms: async () => fetchFromPaprika<string[]>("/contracts"),

  /**
   * Отримати список всіх монет (можна відфільтрувати за platform_id)
   * Напр. platform_id = "eth-ethereum" → усі токени ERC-20
   * @returns список монет/токенів з основною інформацією
   */
  getAllCoins: async (platform_id?: string) => {
    const all = await fetchFromPaprika<TCoinMainInfo[]>("/coins");
    return platform_id && all
      ? all.filter((c: TCoinMainInfo) => c.id === platform_id)
      : all;
  },

  /**
   * Отримати детальну інформацію про монету/токен
   * (назва, опис, категорія, соц. посилання, логотип тощо)
   * @returns детальна інформація про монету/токен
   */
  getCoinInfo: async (coinId: string) =>
    fetchFromPaprika<TCoinFullInfo>(`/coins/${coinId}`),

  /**
   * Отримати дані ринку по монеті (ціна, об’єм, капіталізація)
   */
  getTicker: async (coinId: string) =>
    fetchFromPaprika<TCoinTicker>(`/tickers/${coinId}`),

  /**
   * Пошук монет/токенів за назвою або символом
   */
  search: async (query: string) => {
    return fetchFromPaprika(`/search`, { q: query });
  },
};
