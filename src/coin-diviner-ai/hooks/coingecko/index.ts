import {
  CoinData,
  CoinMarkets,
  CoinList,
  CoinMarketChart,
  SimplePrice,
  createCoinGeckoSDK,
} from "@microfox/coingecko-sdk";

const client = createCoinGeckoSDK({
  apiKey: process.env.COINGECKO_API_KEY,
});

const CoinGeckoService = {
  /**
   * Перевірка підключення
   */
  ping: async () => client.ping(),

  /**
   * Список усіх монет (з platform'ами)
   */
  getCoinsList: async (): Promise<CoinList> =>
    client.getCoinsList({ include_platform: true, status: "active" }),

  /**
   * Ринкові дані по монетах (наприклад топ 100)
   */
  getMarkets: async (
    vs_currency = "usd",
    per_page = 100,
    page = 1
  ): Promise<CoinMarkets> => {
    return client.getCoinsMarkets({
      vs_currency,
      include_tokens: "true",
      order: "market_cap_desc",
      per_page,
      page,
      sparkline: false,
    });
  },

  /**
   * Отримати дані про конкретну монету
   */
  getCoinData: async (id: string): Promise<CoinData> => {
    return client.getCoinData(id, {
      localization: false,
      tickers: true,
      market_data: true,
      community_data: true,
      developer_data: true,
    });
  },

  /**
   * Поточна ціна (спрощений запит)
   */
  getSimplePrice: async (
    ids: string[],
    vs_currencies = "usd"
  ): Promise<SimplePrice> => {
    return client.getSimplePrice({
      ids: ids.join(","),
      include_tokens: "true",
      vs_currencies,
      include_market_cap: true,
      include_24hr_vol: true,
      include_24hr_change: true,
    });
  },

  /**
   * Історичний графік (для побудови лінії цін)
   */
  getMarketChart: async (
    id: string,
    vs_currency = "usd",
    days = "30"
  ): Promise<CoinMarketChart> => {
    return client.getCoinMarketChart(id, { vs_currency, days });
  },
};

export default CoinGeckoService;
