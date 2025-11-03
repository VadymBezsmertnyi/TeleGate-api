import BinanceService from "../binance";
import { CoinPaprikaService } from "../coinpaprika";
import CoinGeckoService from "../coingecko";
import DexScreenerService from "../dexscreener";
import CryptoCoinModel from "../../routes/aggregator/aggregator.model";
import SearchQueryModel from "../../routes/aggregator/aggregator.search-query.model";
import type {
  TSearchResponse,
  TPriceResponse,
  TCoinPaprikaData,
  TCoinGeckoData,
  TDexScreenerData,
  TCryptoCoin,
  TAllPricesResponse,
  TAllPriceHistoryResponse,
} from "../../routes/aggregator/aggregator.types";

const isTokenAddress = (address: string): boolean => {
  if (!address || typeof address !== "string") return false;

  const trimmed = address.trim();
  const evmRegex = /^0x[a-fA-F0-9]{40}$/;
  if (evmRegex.test(trimmed)) return true;

  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  if (base58Regex.test(trimmed) && trimmed.length >= 32 && trimmed.length <= 44)
    return true;

  return false;
};

const AggregatorService = {
  searchCoins: async (
    query: string,
    deepSearch: boolean = false
  ): Promise<TSearchResponse> => {
    const originalQuery = query.trim();
    const normalizedQuery = query.toLowerCase().trim();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let shouldSearchInDB = false;
    let searchQueryRecord: any = null;

    try {
      searchQueryRecord = await SearchQueryModel.findOne({
        query: normalizedQuery,
      });

      if (deepSearch && searchQueryRecord?.lastDeepSearch) {
        if (searchQueryRecord.lastDeepSearch >= oneDayAgo)
          shouldSearchInDB = true;
      } else if (
        !deepSearch &&
        searchQueryRecord &&
        searchQueryRecord.lastSearched >= oneHourAgo
      )
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
          const results: TCryptoCoin[] = cachedCoins.map((coin) => {
            const sources: ("coinpaprika" | "coingecko" | "dexscreener")[] =
              coin.source && Array.isArray(coin.source)
                ? (coin.source as (
                    | "coinpaprika"
                    | "coingecko"
                    | "dexscreener"
                  )[])
                : [];
            if (sources.length === 0) {
              if (coin.coinPaprikaData) sources.push("coinpaprika");
              if (coin.coinGeckoData) sources.push("coingecko");
              if (coin.dexscreenerData) sources.push("dexscreener");
            }

            return {
              _id: coin._id,
              name: coin.name,
              symbol: coin.symbol,
              coinPaprikaData: coin.coinPaprikaData,
              coinGeckoData: coin.coinGeckoData,
              dexscreenerData: coin.dexscreenerData,
              lastUpdatedCoinPaprika: coin.lastUpdatedCoinPaprika
                ? coin.lastUpdatedCoinPaprika
                : undefined,
              lastUpdatedCoinGecko: coin.lastUpdatedCoinGecko
                ? coin.lastUpdatedCoinGecko
                : undefined,
              lastUpdatedDexScreener: coin.lastUpdatedDexScreener
                ? coin.lastUpdatedDexScreener
                : undefined,
              createdAt: coin.createdAt,
              updatedAt: coin.updatedAt,
              source: sources.length > 0 ? sources : undefined,
            };
          });

          return {
            results,
            cached: true,
            deepSearch: false,
            wasDeepSearch: searchQueryRecord?.isDeepSearch || false,
            lastDeepSearchDate: searchQueryRecord?.lastDeepSearch || null,
          };
        }
      } catch (error) {
        console.warn("❌ Database search failed:", error);
      }
    }

    let paprikaResults: TCoinPaprikaData[] = [];
    let geckoResults: TCoinGeckoData[] = [];
    let dexResults: TDexScreenerData[] = [];

    if (deepSearch) {
      const [paprikaData, geckoData, dexData] = await Promise.allSettled([
        CoinPaprikaService.search(query),
        CoinGeckoService.search(query),
        DexScreenerService.search(query),
      ]);
      if (paprikaData.status === "fulfilled" && paprikaData.value?.currencies)
        paprikaResults = paprikaData.value.currencies;
      if (geckoData.status === "fulfilled" && geckoData.value?.coins)
        geckoResults = geckoData.value.coins;
      if (dexData.status === "fulfilled" && dexData.value?.pairs) {
        const uniquePairs = new Map<string, any>();
        for (const pair of dexData.value.pairs) {
          const key = `${pair.baseToken.symbol.toLowerCase()}-${pair.baseToken.name.toLowerCase()}`;
          if (!uniquePairs.has(key)) {
            uniquePairs.set(key, {
              chainId: pair.chainId,
              dexId: pair.dexId,
              url: pair.url,
              pairAddress: pair.pairAddress,
              priceNative: pair.priceNative,
              priceUsd: pair.priceUsd,
              fdv: pair.fdv,
              marketCap: pair.marketCap,
              pairCreatedAt: pair.pairCreatedAt,
              labels: pair.labels,
              volume: pair.volume,
              priceChange: pair.priceChange,
              baseToken: pair.baseToken,
              quoteToken: pair.quoteToken,
              liquidity: pair.liquidity,
              boosts: pair.boosts,
              txns: pair.txns,
              info: pair.info,
            });
          }
        }
        dexResults = Array.from(uniquePairs.values());
      }
    } else {
      try {
        const paprikaResult = await CoinPaprikaService.search(query);
        if (paprikaResult && paprikaResult.currencies.length > 0)
          paprikaResults = paprikaResult.currencies;
      } catch (error) {
        console.warn("❌ CoinPaprika search failed:", error);
      }

      if (paprikaResults.length === 0) {
        if (isTokenAddress(originalQuery)) {
          try {
            const dexResult = await DexScreenerService.getByTokenId(
              originalQuery
            );
            if (dexResult && dexResult.pairs && dexResult.pairs.length > 0) {
              const pair = dexResult.pairs[0];
              const dexData: TDexScreenerData = {
                chainId: pair.chainId,
                dexId: pair.dexId,
                url: pair.url,
                pairAddress: pair.pairAddress,
                priceNative: pair.priceNative,
                priceUsd: pair.priceUsd,
                fdv: pair.fdv,
                marketCap: pair.marketCap,
                pairCreatedAt: pair.pairCreatedAt,
                labels: pair.labels,
                volume: pair.volume,
                priceChange: pair.priceChange,
                baseToken: pair.baseToken,
                quoteToken: pair.quoteToken,
                liquidity: pair.liquidity,
                boosts: pair.boosts,
                txns: pair.txns,
                info: pair.info,
              };
              dexResults.push(dexData);
              const mockGeckoResult: TCoinGeckoData = {
                id: pair.baseToken.address,
                symbol: pair.baseToken.symbol,
                name: pair.baseToken.name,
                api_symbol: pair.baseToken.symbol,
                market_cap_rank: null,
                thumb: pair.info?.imageUrl || "",
                large: pair.info?.imageUrl || "",
              };
              geckoResults.push(mockGeckoResult);
            }
          } catch (error) {
            console.warn("❌ DexScreener getByTokenId failed:", error);
          }
        } else {
          try {
            const geckoResult = await CoinGeckoService.search(query);
            if (geckoResult && geckoResult.coins.length > 0)
              geckoResults = geckoResult.coins;
          } catch (error) {
            console.warn("❌ CoinGecko search failed:", error);
          }

          if (geckoResults.length === 0) {
            try {
              const dexResult = await DexScreenerService.search(query);
              if (dexResult && dexResult.pairs && dexResult.pairs.length > 0) {
                const uniquePairs = new Map<string, any>();
                for (const pair of dexResult.pairs) {
                  const key = `${pair.baseToken.symbol.toLowerCase()}-${pair.baseToken.name.toLowerCase()}`;
                  if (!uniquePairs.has(key)) {
                    uniquePairs.set(key, {
                      chainId: pair.chainId,
                      dexId: pair.dexId,
                      url: pair.url,
                      pairAddress: pair.pairAddress,
                      priceNative: pair.priceNative,
                      priceUsd: pair.priceUsd,
                      fdv: pair.fdv,
                      marketCap: pair.marketCap,
                      pairCreatedAt: pair.pairCreatedAt,
                      labels: pair.labels,
                      volume: pair.volume,
                      priceChange: pair.priceChange,
                      baseToken: pair.baseToken,
                      quoteToken: pair.quoteToken,
                      liquidity: pair.liquidity,
                      boosts: pair.boosts,
                      txns: pair.txns,
                      info: pair.info,
                    });
                  }
                }
                dexResults = Array.from(uniquePairs.values());
              }
            } catch (error) {
              console.warn("❌ DexScreener search failed:", error);
            }
          }
        }
      }
    }

    const normalizeKey = (symbol: string, name: string): string => {
      const normSymbol = symbol.toLowerCase().trim().replace(/\s+/g, "");
      const normName = name.toLowerCase().trim().replace(/\s+/g, "");
      return `${normSymbol}-${normName}`;
    };

    const normalizeAddress = (address: string): string => {
      return address.toLowerCase().trim();
    };

    const getContractAddress = (
      paprika?: TCoinPaprikaData,
      gecko?: TCoinGeckoData,
      dex?: TDexScreenerData
    ): string | null => {
      if (dex?.baseToken.address)
        return normalizeAddress(dex.baseToken.address);
      if (paprika?.contract_address?.[0]?.address)
        return normalizeAddress(paprika.contract_address[0].address);
      if (gecko?.id && isTokenAddress(gecko.id))
        return normalizeAddress(gecko.id);

      return null;
    };

    const coinMap = new Map<
      string,
      {
        paprika?: TCoinPaprikaData;
        gecko?: TCoinGeckoData;
        dex?: TDexScreenerData;
      }
    >();

    const addressMap = new Map<string, string>();

    paprikaResults.forEach((coin) => {
      const key = normalizeKey(coin.symbol, coin.name);
      const address = coin.contract_address?.[0]?.address
        ? normalizeAddress(coin.contract_address[0].address)
        : null;

      if (address && addressMap.has(address)) {
        const existingKey = addressMap.get(address)!;
        const existing = coinMap.get(existingKey);
        if (existing) coinMap.set(existingKey, { ...existing, paprika: coin });
      } else {
        const existing = coinMap.get(key);
        if (existing) coinMap.set(key, { ...existing, paprika: coin });
        else coinMap.set(key, { paprika: coin });
        if (address) addressMap.set(address, key);
      }
    });

    geckoResults.forEach((coin) => {
      const key = normalizeKey(coin.symbol, coin.name);
      const address =
        coin.id && isTokenAddress(coin.id) ? normalizeAddress(coin.id) : null;

      if (address && addressMap.has(address)) {
        const existingKey = addressMap.get(address)!;
        const existing = coinMap.get(existingKey);
        if (existing) coinMap.set(existingKey, { ...existing, gecko: coin });
      } else {
        const existing = coinMap.get(key);
        if (existing) coinMap.set(key, { ...existing, gecko: coin });
        else coinMap.set(key, { gecko: coin });
        if (address) addressMap.set(address, key);
      }
    });

    dexResults.forEach((pair) => {
      const key = normalizeKey(pair.baseToken.symbol, pair.baseToken.name);
      const address = normalizeAddress(pair.baseToken.address);

      if (address && addressMap.has(address)) {
        const existingKey = addressMap.get(address)!;
        const existing = coinMap.get(existingKey);
        if (existing) coinMap.set(existingKey, { ...existing, dex: pair });
      } else {
        const existing = coinMap.get(key);
        if (existing) coinMap.set(key, { ...existing, dex: pair });
        else coinMap.set(key, { dex: pair });
        addressMap.set(address, key);
      }
    });

    if (coinMap.size > 0) {
      try {
        const updateData: any = {
          query: normalizedQuery,
          lastSearched: new Date(),
        };

        if (deepSearch) {
          updateData.isDeepSearch = true;
          updateData.lastDeepSearch = new Date();
        }

        await SearchQueryModel.findOneAndUpdate(
          { query: normalizedQuery },
          updateData,
          { upsert: true, new: true }
        );
      } catch (error) {
        console.warn("❌ Failed to update search query:", error);
      }

      const savedCoinsIds: string[] = [];

      try {
        for (const [, data] of coinMap.entries()) {
          const { paprika, gecko, dex } = data;
          const name =
            paprika?.name || gecko?.name || dex?.baseToken.name || "";
          const symbol =
            paprika?.symbol || gecko?.symbol || dex?.baseToken.symbol || "";

          const contractAddress = getContractAddress(paprika, gecko, dex);
          let existingCoin = null;

          const normalizedSymbol = symbol.toLowerCase().trim();
          const normalizedName = name.toLowerCase().trim();

          if (contractAddress) {
            const normalizedAddress = normalizeAddress(contractAddress);

            existingCoin = await CryptoCoinModel.findOne({
              $or: [
                {
                  "coinPaprikaData.contract_address.address": normalizedAddress,
                },
                { "dexscreenerData.baseToken.address": normalizedAddress },
                { "coinGeckoData.id": normalizedAddress },
                {
                  $and: [
                    {
                      symbol: {
                        $regex: new RegExp(`^${normalizedSymbol}$`, "i"),
                      },
                    },
                    {
                      name: { $regex: new RegExp(`^${normalizedName}$`, "i") },
                    },
                  ],
                },
              ],
            });
          } else
            existingCoin = await CryptoCoinModel.findOne({
              $and: [
                {
                  symbol: { $regex: new RegExp(`^${normalizedSymbol}$`, "i") },
                },
                { name: { $regex: new RegExp(`^${normalizedName}$`, "i") } },
              ],
            });

          if (!existingCoin && contractAddress) {
            const normalizedAddress = normalizeAddress(contractAddress);
            const coinsWithSameAddress = await CryptoCoinModel.find({
              $or: [
                {
                  "coinPaprikaData.contract_address.address": normalizedAddress,
                },
                { "dexscreenerData.baseToken.address": normalizedAddress },
                { "coinGeckoData.id": normalizedAddress },
              ],
            });

            if (coinsWithSameAddress.length > 0)
              existingCoin = coinsWithSameAddress[0];
          }

          const sources: Set<string> = new Set(existingCoin?.source || []);
          if (paprika) sources.add("coinpaprika");
          if (gecko) sources.add("coingecko");
          if (dex) sources.add("dexscreener");

          const finalName = existingCoin?.name || name;
          const finalSymbol = existingCoin?.symbol || symbol;

          const setData: any = {
            name: finalName,
            symbol: finalSymbol,
            source: Array.from(sources),
          };
          if (paprika) {
            setData.coinPaprikaData = paprika;
            setData.lastUpdatedCoinPaprika = new Date();
          }
          if (gecko) {
            setData.coinGeckoData = gecko;
            setData.lastUpdatedCoinGecko = new Date();
          }
          if (dex) {
            setData.dexscreenerData = dex;
            setData.lastUpdatedDexScreener = new Date();
          }

          let savedCoin;
          if (existingCoin) {
            savedCoin = await CryptoCoinModel.findByIdAndUpdate(
              existingCoin._id,
              { $set: setData },
              { new: true }
            );
          } else {
            savedCoin = await CryptoCoinModel.findOneAndUpdate(
              { symbol: finalSymbol, name: finalName },
              { $set: setData },
              { upsert: true, new: true }
            );
          }

          if (savedCoin) savedCoinsIds.push(savedCoin._id.toString());
        }
      } catch (error) {
        console.warn("❌ Failed to save search results:", error);
      }

      try {
        const savedCoins = await CryptoCoinModel.find({
          _id: { $in: savedCoinsIds },
        });

        const results: TCryptoCoin[] = savedCoins.map((coin) => {
          const sources: ("coinpaprika" | "coingecko" | "dexscreener")[] =
            coin.source && Array.isArray(coin.source)
              ? (coin.source as ("coinpaprika" | "coingecko" | "dexscreener")[])
              : [];
          if (sources.length === 0) {
            if (coin.coinPaprikaData) sources.push("coinpaprika");
            if (coin.coinGeckoData) sources.push("coingecko");
            if (coin.dexscreenerData) sources.push("dexscreener");
          }

          return {
            _id: coin._id,
            name: coin.name,
            symbol: coin.symbol,
            coinPaprikaData: coin.coinPaprikaData,
            coinGeckoData: coin.coinGeckoData,
            dexscreenerData: coin.dexscreenerData,
            lastUpdatedCoinPaprika: coin.lastUpdatedCoinPaprika
              ? coin.lastUpdatedCoinPaprika
              : undefined,
            lastUpdatedCoinGecko: coin.lastUpdatedCoinGecko
              ? coin.lastUpdatedCoinGecko
              : undefined,
            lastUpdatedDexScreener: coin.lastUpdatedDexScreener
              ? coin.lastUpdatedDexScreener
              : undefined,
            createdAt: coin.createdAt,
            updatedAt: coin.updatedAt,
            source: sources.length > 0 ? sources : undefined,
          };
        });

        return {
          results,
          cached: false,
          deepSearch,
          wasDeepSearch: deepSearch,
          lastDeepSearchDate: deepSearch ? new Date() : null,
        };
      } catch (error) {
        console.warn("❌ Failed to fetch saved coins:", error);
      }
    }

    return {
      results: [],
      cached: false,
      deepSearch,
      wasDeepSearch: false,
      lastDeepSearchDate: null,
    };
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

      if (coin.dexscreenerData?.baseToken?.address) {
        try {
          const dexResult = await DexScreenerService.getByTokenId(
            coin.dexscreenerData.baseToken.address
          );
          if (dexResult && dexResult.pairs && dexResult.pairs.length > 0) {
            const pair = dexResult.pairs.find(
              (p) =>
                p.baseToken.address.toLowerCase() ===
                coin.dexscreenerData!.baseToken.address.toLowerCase()
            );
            if (pair)
              return {
                symbol: coin.symbol,
                price: parseFloat(pair.priceUsd || "0"),
                source: "dexscreener" as const,
              };
          }
        } catch (error) {
          console.warn("❌ DexScreener getByTokenId failed:", error);
        }
      }

      const contractAddress =
        coin.coinPaprikaData?.contract_address?.[0]?.address;
      if (contractAddress && isTokenAddress(contractAddress)) {
        try {
          const dexResult = await DexScreenerService.getByTokenId(
            contractAddress
          );
          if (dexResult && dexResult.pairs && dexResult.pairs.length > 0) {
            const pair = dexResult.pairs.find(
              (p) =>
                p.baseToken.address.toLowerCase() ===
                contractAddress.toLowerCase()
            );
            if (pair)
              return {
                symbol: coin.symbol,
                price: parseFloat(pair.priceUsd || "0"),
                source: "dexscreener" as const,
              };
          }
        } catch (error) {
          console.warn("❌ DexScreener getByTokenId failed:", error);
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
  ): Promise<TAllPriceHistoryResponse | null> => {
    try {
      const coin = await CryptoCoinModel.findById(coinId);
      if (!coin) {
        console.warn("❌ Coin not found in DB:", coinId);
        return null;
      }

      const response: TAllPriceHistoryResponse = {
        symbol: coin.symbol,
        coingecko: null,
        coinpaprika: null,
      };

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
          if (geckoChart && geckoChart.prices) {
            response.coingecko = {
              data: geckoChart,
              updatedAt: new Date(),
              error: null,
            };
          }
        } catch (error: any) {
          response.coingecko = {
            data: null,
            updatedAt: new Date(),
            error: error.message || "Failed to fetch from CoinGecko",
          };
        }
      }

      if (coin.coinPaprikaData?.id) {
        try {
          const paprikaTicker = await CoinPaprikaService.getTicker(
            coin.coinPaprikaData.id
          );
          if (paprikaTicker) {
            response.coinpaprika = {
              data: paprikaTicker,
              updatedAt: new Date(),
              error: null,
            };
          }
        } catch (error: any) {
          response.coinpaprika = {
            data: null,
            updatedAt: new Date(),
            error: error.message || "Failed to fetch from CoinPaprika",
          };
        }
      }

      return response;
    } catch (error) {
      console.warn("❌ getPriceHistory failed:", error);
      return null;
    }
  },

  getAllPrices: async (coinId: string): Promise<TAllPricesResponse> => {
    try {
      let coin = await CryptoCoinModel.findById(coinId);
      if (!coin) {
        console.warn("❌ Coin not found in DB:", coinId);
        return {
          symbol: "UNKNOWN",
          binance: null,
          dexscreener: null,
          coingecko: null,
        };
      }

      const updateData: any = {};
      let needsUpdate = false;

      const coinSymbol = coin.symbol;
      const coinName = coin.name;

      if (!coin.coinPaprikaData) {
        try {
          const paprikaResult = await CoinPaprikaService.search(coinName);
          if (paprikaResult && paprikaResult.currencies.length > 0) {
            const coinData = paprikaResult.currencies.find(
              (c) =>
                c.symbol.toLowerCase() === coinSymbol.toLowerCase() &&
                c.name.toLowerCase() === coinName.toLowerCase()
            );
            if (coinData) {
              updateData.coinPaprikaData = coinData;
              updateData.lastUpdatedCoinPaprika = new Date();
              needsUpdate = true;
            }
          }
        } catch (error) {
          console.warn("❌ Failed to fetch CoinPaprika data:", error);
        }
      }

      if (!coin.coinGeckoData) {
        try {
          const geckoResult = await CoinGeckoService.search(coinName);
          if (geckoResult && geckoResult.coins.length > 0) {
            const coinData = geckoResult.coins.find(
              (c) =>
                c.symbol.toLowerCase() === coinSymbol.toLowerCase() &&
                c.name.toLowerCase() === coinName.toLowerCase()
            );
            if (coinData) {
              updateData.coinGeckoData = coinData;
              updateData.lastUpdatedCoinGecko = new Date();
              needsUpdate = true;
            }
          }
        } catch (error) {
          console.warn("❌ Failed to fetch CoinGecko data:", error);
        }
      }

      if (needsUpdate) {
        const updatedCoin = await CryptoCoinModel.findByIdAndUpdate(
          coinId,
          { $set: updateData },
          { new: true }
        );
        if (updatedCoin) coin = updatedCoin;
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

      if (coin.dexscreenerData?.baseToken?.address) {
        try {
          const dexResult = await DexScreenerService.getByTokenId(
            coin.dexscreenerData.baseToken.address
          );
          if (dexResult && dexResult.pairs && dexResult.pairs.length > 0) {
            const pair = dexResult.pairs.find(
              (p) =>
                p.baseToken.address.toLowerCase() ===
                coin.dexscreenerData!.baseToken.address.toLowerCase()
            );
            if (pair)
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

      const contractAddress =
        coin.coinPaprikaData?.contract_address?.[0]?.address;
      if (
        !response.dexscreener &&
        contractAddress &&
        isTokenAddress(contractAddress)
      ) {
        try {
          const dexResult = await DexScreenerService.getByTokenId(
            contractAddress
          );
          if (dexResult && dexResult.pairs && dexResult.pairs.length > 0) {
            const pair = dexResult.pairs.find(
              (p) =>
                p.baseToken.address.toLowerCase() ===
                contractAddress.toLowerCase()
            );
            if (pair)
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

  getAllPriceHistory: async (
    coinId: string,
    range: "1h" | "1d" | "7d" | "30d" = "1d"
  ): Promise<TAllPriceHistoryResponse> => {
    try {
      let coin = await CryptoCoinModel.findById(coinId);
      if (!coin) {
        console.warn("❌ Coin not found in DB:", coinId);
        return {
          symbol: "UNKNOWN",
          coingecko: null,
          coinpaprika: null,
        };
      }

      const updateData: any = {};
      let needsUpdate = false;

      const coinSymbol = coin.symbol;
      const coinName = coin.name;

      if (!coin.coinPaprikaData) {
        try {
          const paprikaResult = await CoinPaprikaService.search(coinName);
          if (paprikaResult && paprikaResult.currencies.length > 0) {
            const coinData = paprikaResult.currencies.find(
              (c) =>
                c.symbol.toLowerCase() === coinSymbol.toLowerCase() &&
                c.name.toLowerCase() === coinName.toLowerCase()
            );
            if (coinData) {
              updateData.coinPaprikaData = coinData;
              updateData.lastUpdatedCoinPaprika = new Date();
              needsUpdate = true;
            }
          }
        } catch (error) {
          console.warn("❌ Failed to fetch CoinPaprika data:", error);
        }
      }

      if (!coin.coinGeckoData) {
        try {
          const geckoResult = await CoinGeckoService.search(coinName);
          if (geckoResult && geckoResult.coins.length > 0) {
            const coinData = geckoResult.coins.find(
              (c) =>
                c.symbol.toLowerCase() === coinSymbol.toLowerCase() &&
                c.name.toLowerCase() === coinName.toLowerCase()
            );
            if (coinData) {
              updateData.coinGeckoData = coinData;
              updateData.lastUpdatedCoinGecko = new Date();
              needsUpdate = true;
            }
          }
        } catch (error) {
          console.warn("❌ Failed to fetch CoinGecko data:", error);
        }
      }

      if (needsUpdate) {
        const updatedCoin = await CryptoCoinModel.findByIdAndUpdate(
          coinId,
          { $set: updateData },
          { new: true }
        );
        if (updatedCoin) coin = updatedCoin;
      }
      const response: TAllPriceHistoryResponse = {
        symbol: coin.symbol,
        coingecko: null,
        coinpaprika: null,
      };
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
          if (geckoChart && geckoChart.prices) {
            response.coingecko = {
              data: geckoChart,
              updatedAt: new Date(),
              error: null,
            };
          }
        } catch (error: any) {
          response.coingecko = {
            data: null,
            updatedAt: new Date(),
            error: error.message || "Failed to fetch from CoinGecko",
          };
        }
      }

      if (coin.coinPaprikaData?.id) {
        try {
          const paprikaTicker = await CoinPaprikaService.getTicker(
            coin.coinPaprikaData.id
          );
          if (paprikaTicker) {
            response.coinpaprika = {
              data: paprikaTicker,
              updatedAt: new Date(),
              error: null,
            };
          }
        } catch (error: any) {
          response.coinpaprika = {
            data: null,
            updatedAt: new Date(),
            error: error.message || "Failed to fetch from CoinPaprika",
          };
        }
      }

      return response;
    } catch (error: any) {
      console.warn("❌ getAllPriceHistory failed:", error);
      return {
        symbol: "ERROR",
        coingecko: null,
        coinpaprika: null,
      };
    }
  },
};

export default AggregatorService;
