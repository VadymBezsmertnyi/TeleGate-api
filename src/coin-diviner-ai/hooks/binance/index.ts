import Binance, {
  CandleChartInterval_LT,
  DailyStatsResult,
} from "binance-api-node";

const client = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_SECRET,
});

const BinanceService = {
  /**
   * Отримати поточну ціну по парі (наприклад BTCUSDT)
   */
  getPrice: async (symbol: string) => {
    const price = await client.prices({ symbol });
    return { symbol, price: parseFloat(price[symbol]) };
  },

  /**
   * Отримати 24-годинну статистику (зміни, обсяг, high/low)
   * Якщо повертається масив - беремо перший елемент
   * Якщо повертається об'єкт - працюємо з ним напряму
   */
  get24hStats: async (symbol: string) => {
    const stats = await client.dailyStats({ symbol });
    if (!stats) return null;
    if (Array.isArray(stats) && stats.length > 0) {
      const first = stats[0];
      if (!first) return null;

      return {
        symbol,
        priceChangePercent: parseFloat(first.priceChangePercent),
        volume: parseFloat(first.volume),
        lastPrice: parseFloat(first.lastPrice),
        highPrice: parseFloat(first.highPrice),
        lowPrice: parseFloat(first.lowPrice),
      };
    }

    const statsObj = stats as DailyStatsResult;

    return {
      symbol,
      priceChangePercent: parseFloat(statsObj.priceChangePercent),
      volume: parseFloat(statsObj.volume),
      lastPrice: parseFloat(statsObj.lastPrice),
      highPrice: parseFloat(statsObj.highPrice),
      lowPrice: parseFloat(statsObj.lowPrice),
    };
  },

  /**
   * Отримати історичні дані (свічки OHLC)
   * interval: "1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1M"
   */
  getKlines: async (
    symbol: string,
    interval: CandleChartInterval_LT = "1d",
    limit = 30
  ) => {
    const candles = await client.candles({ symbol, interval, limit });
    return candles.map((c) => ({
      openTime: c.openTime,
      open: parseFloat(c.open),
      high: parseFloat(c.high),
      low: parseFloat(c.low),
      close: parseFloat(c.close),
      volume: parseFloat(c.volume),
      closeTime: c.closeTime,
    }));
  },

  /**
   * Отримати список усіх доступних торгових пар
   */
  getExchangeInfo: async () => {
    const info = await client.exchangeInfo();
    return info.symbols.map((s) => ({
      symbol: s.symbol,
      baseAsset: s.baseAsset,
      quoteAsset: s.quoteAsset,
      status: s.status,
    }));
  },
};

export default BinanceService;
