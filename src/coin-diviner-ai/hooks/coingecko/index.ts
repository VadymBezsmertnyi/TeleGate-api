import axios from "axios";
import {
  CoinData,
  CoinMarkets,
  CoinList,
  CoinMarketChart,
  SimplePrice,
} from "@microfox/coingecko-sdk";
import { TCoinGeckoSearchResult } from "./coingecko.types";

const BASE_URL = "https://api.coingecko.com/api/v3";

/**
 * 🔁 Універсальна функція запитів до CoinGecko API
 */
export const fetchFromGecko = async <T>(
  endpoint: string,
  params: Record<string, any> = {}
): Promise<T | null> => {
  try {
    const { data } = await axios.get<T>(`${BASE_URL}${endpoint}`, {
      params,
      headers: process.env.COINGECKO_API_KEY
        ? { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY }
        : {},
    });
    return data;
  } catch (err: any) {
    console.warn(`❌ CoinGecko error [${endpoint}]:`, err.message);
    return null;
  }
};

const CoinGeckoService = {
  /**
   * 🛰 Перевірка підключення
   */
  ping: async () => fetchFromGecko<{ gecko_says: string }>("/ping"),

  /**
   * 📜 Список усіх монет (із платформами)
   */
  getCoinsList: async (): Promise<CoinList | null> =>
    fetchFromGecko<CoinList>("/coins/list", {
      include_platform: true,
      status: "active",
    }),

  /**
   * 💹 Ринкові дані по монетах (топ-100)
   */
  getMarkets: async (
    vs_currency = "usd",
    per_page = 100,
    page = 1
  ): Promise<CoinMarkets | null> =>
    fetchFromGecko<CoinMarkets>("/coins/markets", {
      vs_currency,
      order: "market_cap_desc",
      per_page,
      page,
      sparkline: false,
    }),

  /**
   * 📊 Детальна інформація про монету
   */
  getCoinData: async (id: string): Promise<CoinData | null> =>
    fetchFromGecko<CoinData>(`/coins/${id}`, {
      localization: false,
      tickers: true,
      market_data: true,
      community_data: true,
      developer_data: true,
    }),

  /**
   * 💰 Поточна ціна
   */
  getSimplePrice: async (
    ids: string[],
    vs_currencies = "usd"
  ): Promise<SimplePrice | null> =>
    fetchFromGecko<SimplePrice>("/simple/price", {
      ids: ids.join(","),
      vs_currencies,
      include_market_cap: true,
      include_24hr_vol: true,
      include_24hr_change: true,
    }),

  /**
   * 📈 Історичний графік
   */
  getMarketChart: async (
    id: string,
    vs_currency = "usd",
    days = "30"
  ): Promise<CoinMarketChart | null> =>
    fetchFromGecko<CoinMarketChart>(`/coins/${id}/market_chart`, {
      vs_currency,
      days,
    }),

  /**
   * 🔍 Пошук токенів за назвою або символом
   */
  search: async (query: string): Promise<TCoinGeckoSearchResult | null> =>
    fetchFromGecko<TCoinGeckoSearchResult>("/search", { query }),

  /**
   * 📊 Статистика використання API
   */
  getApiUsage: async () => fetchFromGecko<any>("/api_usage"),
};

export default CoinGeckoService;
