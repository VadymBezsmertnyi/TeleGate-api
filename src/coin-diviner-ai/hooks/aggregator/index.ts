import BinanceService from "../binance";
import { CoinPaprikaService } from "../coinpaprika";
import CoinGeckoService from "../coingecko";
import DexScreenerService from "../dexscreener";
import CryptoCoinModel from "../../routes/aggregator/aggregator.model";
import SearchQueryModel from "../../routes/aggregator/aggregator.search-query.model";
import type {
  TSearchResponse,
  TPriceResponse,
  TPriceHistoryResponse,
  TCoinPaprikaData,
  TCoinGeckoData,
  TCryptoCoin,
  TAllPricesResponse,
} from "../../routes/aggregator/aggregator.types";

const AggregatorService = {
  searchCoins: async (query: string): Promise<TSearchResponse> => {
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
            { name: { $regex: normalizedQuery, $options: "i" } },
            { symbol: { $regex: normalizedQuery, $options: "i" } },
          ],
        }).limit(20);

        if (cachedCoins && cachedCoins.length > 0) {
          const results: TCryptoCoin[] = cachedCoins.map((coin) => ({
            _id: coin._id,
            name: coin.name,
            symbol: coin.symbol,
            coinPaprikaData: coin.coinPaprikaData,
            coinGeckoData: coin.coinGeckoData,
            lastUpdatedCoinPaprika: coin.lastUpdatedCoinPaprika
              ? coin.lastUpdatedCoinPaprika
              : undefined,
            lastUpdatedCoinGecko: coin.lastUpdatedCoinGecko
              ? coin.lastUpdatedCoinGecko
              : undefined,
            createdAt: coin.createdAt,
            updatedAt: coin.updatedAt,
          }));

          const source = cachedCoins[0].coinPaprikaData
            ? ("coinpaprika" as const)
            : ("coingecko" as const);
          return { results, source, cached: true };
        }
      } catch (error) {
        console.warn("❌ Database search failed:", error);
      }
    }

    let resultsToSave: (TCoinPaprikaData | TCoinGeckoData)[] = [];
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

      const savedCoinsIds: string[] = [];

      try {
        for (const result of resultsToSave) {
          const setData: any = {
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

          const savedCoin = await CryptoCoinModel.findOneAndUpdate(
            { symbol: result.symbol, name: result.name },
            { $set: setData },
            { upsert: true, new: true }
          );
          if (savedCoin) savedCoinsIds.push(savedCoin._id.toString());
        }
      } catch (error) {
        console.warn("❌ Failed to save search results:", error);
      }

      try {
        const savedCoins = await CryptoCoinModel.find({
          _id: { $in: savedCoinsIds },
        });

        const results: TCryptoCoin[] = savedCoins.map((coin) => ({
          _id: coin._id,
          name: coin.name,
          symbol: coin.symbol,
          coinPaprikaData: coin.coinPaprikaData,
          coinGeckoData: coin.coinGeckoData,
          lastUpdatedCoinPaprika: coin.lastUpdatedCoinPaprika
            ? coin.lastUpdatedCoinPaprika
            : undefined,
          lastUpdatedCoinGecko: coin.lastUpdatedCoinGecko
            ? coin.lastUpdatedCoinGecko
            : undefined,
          createdAt: coin.createdAt,
          updatedAt: coin.updatedAt,
        }));

        return { results, source: sourceUsed, cached: false };
      } catch (error) {
        console.warn("❌ Failed to fetch saved coins:", error);
      }
    }

    return { results: [], source: null, cached: false };
  },

  getPrice: async (coinId: string): Promise<TPriceResponse | null> => {
    try {
      const coin = await CryptoCoinModel.findById(coinId);
      if (!coin) {
        console.warn("❌ Coin not found in DB:", coinId);
        return null;
      }

      if (coin.binancePair) {
        try {
          const binancePrice = await BinanceService.getPrice(coin.binancePair);
          if (binancePrice && binancePrice.price)
            return {
              symbol: coin.symbol,
              price: binancePrice.price,
              source: "binance" as const,
            };
        } catch (error) {
          console.warn("❌ Binance getPrice failed:", error);
        }
      }

      const contractAddress =
        coin.coinPaprikaData?.contract_address?.[0]?.address;
      if (contractAddress || coin.symbol) {
        try {
          const dexResult = await DexScreenerService.search(
            contractAddress || coin.symbol
          );
          if (dexResult && dexResult.pairs && dexResult.pairs.length > 0) {
            const pair = dexResult.pairs[0];
            return {
              symbol: coin.symbol,
              price: parseFloat(pair.priceUsd || "0"),
              source: "dexscreener" as const,
            };
          }
        } catch (error) {
          console.warn("❌ DexScreener search failed:", error);
        }
      }

      if (coin.coinGeckoData?.id) {
        try {
          const geckoPrice = await CoinGeckoService.getSimplePrice(
            [coin.coinGeckoData.id],
            "usd"
          );
          const priceData = geckoPrice?.[coin.coinGeckoData.id];
          if (
            priceData &&
            priceData.usd !== null &&
            priceData.usd !== undefined
          )
            return {
              symbol: coin.symbol,
              price: priceData.usd,
              source: "coingecko" as const,
            };
        } catch (error) {
          console.warn("❌ CoinGecko getSimplePrice failed:", error);
        }
      }

      return null;
    } catch (error) {
      console.warn("❌ getPrice failed:", error);
      return null;
    }
  },

  getPriceHistory: async (
    coinId: string,
    range: "1h" | "1d" | "7d" | "30d" = "7d"
  ): Promise<TPriceHistoryResponse | null> => {
    try {
      const coin = await CryptoCoinModel.findById(coinId);
      if (!coin) {
        console.warn("❌ Coin not found in DB:", coinId);
        return null;
      }

      const rangeMap: Record<string, string> = {
        "1h": "1",
        "1d": "1",
        "7d": "7",
        "30d": "30",
      };
      if (coin.coinGeckoData?.id) {
        try {
          const geckoChart = await CoinGeckoService.getMarketChart(
            coin.coinGeckoData.id,
            "usd",
            rangeMap[range]
          );
          if (geckoChart && geckoChart.prices)
            return { data: geckoChart, source: "coingecko" as const };
        } catch (error) {
          console.warn("❌ CoinGecko getMarketChart failed:", error);
        }
      }

      if (coin.coinPaprikaData?.id) {
        try {
          const paprikaTicker = await CoinPaprikaService.getTicker(
            coin.coinPaprikaData.id
          );
          if (paprikaTicker)
            return { data: paprikaTicker, source: "coinpaprika" as const };
        } catch (error) {
          console.warn("❌ CoinPaprika getTicker failed:", error);
        }
      }

      return null;
    } catch (error) {
      console.warn("❌ getPriceHistory failed:", error);
      return null;
    }
  },

  getAllPrices: async (coinId: string): Promise<TAllPricesResponse> => {
    try {
      const coin = await CryptoCoinModel.findById(coinId);
      if (!coin) {
        console.warn("❌ Coin not found in DB:", coinId);
        return {
          symbol: "UNKNOWN",
          binance: null,
          dexscreener: null,
          coingecko: null,
        };
      }

      const response: TAllPricesResponse = {
        symbol: coin.symbol,
        binance: null,
        dexscreener: null,
        coingecko: null,
      };

      if (coin.binancePair) {
        try {
          const binancePrice = await BinanceService.getPrice(coin.binancePair);
          if (binancePrice && binancePrice.price) {
            response.binance = {
              price: binancePrice.price,
              updatedAt: new Date(),
              error: null,
            };
          }
        } catch (error: any) {
          response.binance = {
            price: null,
            updatedAt: new Date(),
            error: error.message || "Failed to fetch from Binance",
          };
        }
      }

      const contractAddress =
        coin.coinPaprikaData?.contract_address?.[0]?.address;
      if (contractAddress || coin.symbol) {
        try {
          const dexResult = await DexScreenerService.search(
            contractAddress || coin.symbol
          );
          if (dexResult && dexResult.pairs && dexResult.pairs.length > 0) {
            const pair = dexResult.pairs[0];
            response.dexscreener = {
              price: parseFloat(pair.priceUsd || "0"),
              updatedAt: new Date(),
              error: null,
            };
          }
        } catch (error: any) {
          response.dexscreener = {
            price: null,
            updatedAt: new Date(),
            error: error.message || "Failed to fetch from DexScreener",
          };
        }
      }

      if (coin.coinGeckoData?.id) {
        try {
          const geckoPrice = await CoinGeckoService.getSimplePrice(
            [coin.coinGeckoData.id],
            "usd"
          );
          const priceData = geckoPrice?.[coin.coinGeckoData.id];
          if (
            priceData &&
            priceData.usd !== null &&
            priceData.usd !== undefined
          ) {
            response.coingecko = {
              price: priceData.usd,
              updatedAt: new Date(),
              error: null,
            };
          }
        } catch (error: any) {
          response.coingecko = {
            price: null,
            updatedAt: new Date(),
            error: error.message || "Failed to fetch from CoinGecko",
          };
        }
      }

      return response;
    } catch (error: any) {
      console.warn("❌ getAllPrices failed:", error);
      return {
        symbol: "ERROR",
        binance: null,
        dexscreener: null,
        coingecko: null,
      };
    }
  },
};

export default AggregatorService;
