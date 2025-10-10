import BinanceService from "../binance";
import { CoinPaprikaService } from "../coinpaprika";
import CoinGeckoService from "../coingecko";
import DexScreenerService from "../dexscreener";

const AggregatorService = {
  searchCoins: async (query: string) => {
    try {
      const paprikaResult = await CoinPaprikaService.search(query);
      if (paprikaResult && paprikaResult.currencies.length > 0)
        return { results: paprikaResult.currencies, source: "coinpaprika" };
    } catch (error) {
      console.warn("❌ CoinPaprika search failed:", error);
    }

    try {
      const geckoResult = await CoinGeckoService.search(query);
      if (geckoResult && geckoResult.coins.length > 0)
        return { results: geckoResult.coins, source: "coingecko" };
    } catch (error) {
      console.warn("❌ CoinGecko search failed:", error);
    }

    return { results: [], source: null };
  },

  getPrice: async (symbolOrAddress: string) => {
    try {
      const binancePrice = await BinanceService.getPrice(symbolOrAddress);
      if (binancePrice && binancePrice.price)
        return { ...binancePrice, source: "binance" };
    } catch (error) {
      console.warn("❌ Binance getPrice failed:", error);
    }

    try {
      const dexResult = await DexScreenerService.search(symbolOrAddress);
      if (dexResult && dexResult.pairs && dexResult.pairs.length > 0) {
        const pair = dexResult.pairs[0];
        return {
          symbol: pair.baseToken.symbol,
          price: parseFloat(pair.priceUsd || "0"),
          source: "dexscreener",
        };
      }
    } catch (error) {
      console.warn("❌ DexScreener search failed:", error);
    }

    try {
      const geckoPrice = await CoinGeckoService.getSimplePrice(
        [symbolOrAddress.toLowerCase()],
        "usd"
      );
      if (geckoPrice && geckoPrice[symbolOrAddress.toLowerCase()])
        return {
          symbol: symbolOrAddress,
          price: geckoPrice[symbolOrAddress.toLowerCase()].usd,
          source: "coingecko",
        };
    } catch (error) {
      console.warn("❌ CoinGecko getSimplePrice failed:", error);
    }

    return null;
  },

  getPriceHistory: async (
    id: string,
    range: "1h" | "1d" | "7d" | "30d" = "7d"
  ) => {
    const rangeMap: Record<string, string> = {
      "1h": "1",
      "1d": "1",
      "7d": "7",
      "30d": "30",
    };

    try {
      const geckoChart = await CoinGeckoService.getMarketChart(
        id,
        "usd",
        rangeMap[range]
      );
      if (geckoChart && geckoChart.prices)
        return { data: geckoChart, source: "coingecko" };
    } catch (error) {
      console.warn("❌ CoinGecko getMarketChart failed:", error);
    }

    try {
      const paprikaTicker = await CoinPaprikaService.getTicker(id);
      if (paprikaTicker) return { data: paprikaTicker, source: "coinpaprika" };
    } catch (error) {
      console.warn("❌ CoinPaprika getTicker failed:", error);
    }

    return null;
  },
};

export default AggregatorService;
