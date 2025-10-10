import BinanceService from "../binance";
import { CoinPaprikaService } from "../coinpaprika";
import CoinGeckoService from "../coingecko";
import DexScreenerService from "../dexscreener";
import CryptoCoinModel from "../../routes/aggregator/aggregator.model";
import SearchQueryModel from "../../routes/aggregator/aggregator.search-query.model";

const AggregatorService = {
  searchCoins: async (query: string) => {
    const normalizedQuery = query.toLowerCase().trim();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let shouldSearchInDB = false;

    try {
      const searchQuery = await SearchQueryModel.findOne({
        query: normalizedQuery,
      });
      if (searchQuery && searchQuery.lastSearched >= oneHourAgo)
        shouldSearchInDB = true;
    } catch (error) {
      console.warn("❌ SearchQuery check failed:", error);
    }

    if (shouldSearchInDB) {
      try {
        const cachedCoins = await CryptoCoinModel.find({
          $or: [
            { coinId: normalizedQuery },
            { name: { $regex: normalizedQuery, $options: "i" } },
            { symbol: { $regex: normalizedQuery, $options: "i" } },
          ],
        }).limit(20);

        if (cachedCoins && cachedCoins.length > 0) {
          const results = cachedCoins.map((coin) => {
            if (coin.coinPaprikaData) return coin.coinPaprikaData;
            if (coin.coinGeckoData) return coin.coinGeckoData;
            return null;
          });

          const validResults = results.filter((r) => r !== null);
          if (validResults.length > 0) {
            const source = cachedCoins[0].coinPaprikaData
              ? "coinpaprika"
              : "coingecko";
            return { results: validResults, source, cached: true };
          }
        }
      } catch (error) {
        console.warn("❌ Database search failed:", error);
      }
    }

    let resultsToSave: any[] = [];
    let sourceUsed: "coinpaprika" | "coingecko" | null = null;

    try {
      const paprikaResult = await CoinPaprikaService.search(query);
      if (paprikaResult && paprikaResult.currencies.length > 0) {
        resultsToSave = paprikaResult.currencies;
        sourceUsed = "coinpaprika";
      }
    } catch (error) {
      console.warn("❌ CoinPaprika search failed:", error);
    }

    if (resultsToSave.length === 0) {
      try {
        const geckoResult = await CoinGeckoService.search(query);
        if (geckoResult && geckoResult.coins.length > 0) {
          resultsToSave = geckoResult.coins;
          sourceUsed = "coingecko";
        }
      } catch (error) {
        console.warn("❌ CoinGecko search failed:", error);
      }
    }

    if (resultsToSave.length > 0 && sourceUsed) {
      try {
        await SearchQueryModel.findOneAndUpdate(
          { query: normalizedQuery },
          { query: normalizedQuery, lastSearched: new Date() },
          { upsert: true, new: true }
        );
      } catch (error) {
        console.warn("❌ Failed to update search query:", error);
      }

      try {
        for (const result of resultsToSave) {
          const coinId = result.id;
          const setData: any = {
            coinId,
            name: result.name,
            symbol: result.symbol,
          };

          if (sourceUsed === "coinpaprika") {
            setData.coinPaprikaData = result;
            setData.lastUpdatedCoinPaprika = new Date();
          } else if (sourceUsed === "coingecko") {
            setData.coinGeckoData = result;
            setData.lastUpdatedCoinGecko = new Date();
          }

          await CryptoCoinModel.findOneAndUpdate(
            { coinId },
            { $set: setData },
            { upsert: true, new: true }
          );
        }
      } catch (error) {
        console.warn("❌ Failed to save search results:", error);
      }

      return { results: resultsToSave, source: sourceUsed, cached: false };
    }

    return { results: [], source: null, cached: false };
  },

  getPrice: async (symbolOrAddress: string) => {
    try {
      const binancePrice = await BinanceService.getPrice(symbolOrAddress);
      if (binancePrice && binancePrice.price) {
        return { ...binancePrice, source: "binance" };
      }
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
      if (geckoPrice && geckoPrice[symbolOrAddress.toLowerCase()]) {
        return {
          symbol: symbolOrAddress,
          price: geckoPrice[symbolOrAddress.toLowerCase()].usd,
          source: "coingecko",
        };
      }
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
      if (geckoChart && geckoChart.prices) {
        return { data: geckoChart, source: "coingecko" };
      }
    } catch (error) {
      console.warn("❌ CoinGecko getMarketChart failed:", error);
    }

    try {
      const paprikaTicker = await CoinPaprikaService.getTicker(id);
      if (paprikaTicker) {
        return { data: paprikaTicker, source: "coinpaprika" };
      }
    } catch (error) {
      console.warn("❌ CoinPaprika getTicker failed:", error);
    }

    return null;
  },
};

export default AggregatorService;
