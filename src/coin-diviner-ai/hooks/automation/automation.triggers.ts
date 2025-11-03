import AutomationModel from "../../routes/automation/automation.model";
import AggregatorService from "../aggregator";
import DexScreenerService from "../dexscreener";
import CryptoCoinModel from "../../routes/aggregator/aggregator.model";

import type {
  IAutomationDocument,
  ITriggerResult,
  IAutomationCheckResult,
} from "./automation.types";

/**
 * Перевіряє всі активні автоматизації та повертає список спрацьованих
 */
export const checkActiveAutomations = async (): Promise<
  IAutomationCheckResult[]
> => {
  try {
    const activeAutomations = await AutomationModel.find({
      isActive: true,
    }).lean();
    if (!activeAutomations || activeAutomations.length === 0) return [];

    const uniqueCoinIds = [
      ...new Set(activeAutomations.map((a) => a.coinId.toString())),
    ];
    const coinPricesMap = new Map<
      string,
      {
        binance: number | null;
        dexscreener: number | null;
        coingecko: number | null;
      }
    >();

    for (const coinId of uniqueCoinIds) {
      let dexscreenerPrice: number | null = null;
      let binancePrice: number | null = null;
      let coingeckoPrice: number | null = null;

      try {
        const coin = await CryptoCoinModel.findById(coinId);
        if (!coin) {
          coinPricesMap.set(coinId, {
            binance: null,
            dexscreener: null,
            coingecko: null,
          });
          continue;
        }

        try {
          const allPrices = await AggregatorService.getAllPrices(coinId);
          dexscreenerPrice = allPrices.dexscreener?.price || null;
          binancePrice = allPrices.binance?.price || null;
          coingeckoPrice = allPrices.coingecko?.price || null;
        } catch (error) {
          console.warn(`Failed to fetch all prices for ${coinId}:`, error);
        }

        if (
          dexscreenerPrice === null &&
          coin.dexscreenerData?.baseToken?.address
        ) {
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
              if (pair) {
                const priceValue = parseFloat(pair.priceUsd || "0");
                if (priceValue && priceValue > 0) dexscreenerPrice = priceValue;
              }
            }
          } catch (dexError) {
            console.warn(`DexScreener failed for ${coinId}:`, dexError);
          }
        }

        coinPricesMap.set(coinId, {
          binance: binancePrice,
          dexscreener: dexscreenerPrice,
          coingecko: coingeckoPrice,
        });
      } catch (error) {
        console.warn(`Failed to fetch prices for coin ${coinId}:`, error);
        coinPricesMap.set(coinId, {
          binance: null,
          dexscreener: null,
          coingecko: null,
        });
      }
    }

    const results: IAutomationCheckResult[] = [];
    for (const coinId of uniqueCoinIds) {
      const prices = coinPricesMap.get(coinId);
      if (!prices) continue;

      const coinAutomations = activeAutomations.filter(
        (a) => a.coinId.toString() === coinId
      );
      const triggeredAutomations: ITriggerResult[] = [];
      for (const automation of coinAutomations) {
        const currentPrice =
          prices.dexscreener || prices.binance || prices.coingecko;
        if (!currentPrice) continue;

        let triggerResult: ITriggerResult | null = null;
        if (automation.type === "price_rise")
          triggerResult = await checkPriceRise(
            automation as unknown as IAutomationDocument,
            currentPrice,
            prices.dexscreener
              ? "dexscreener"
              : prices.binance
              ? "binance"
              : "coingecko"
          );
        else if (automation.type === "price_drop")
          triggerResult = await checkPriceDrop(
            automation as unknown as IAutomationDocument,
            currentPrice,
            prices.dexscreener
              ? "dexscreener"
              : prices.binance
              ? "binance"
              : "coingecko"
          );
        if (triggerResult && triggerResult.triggered)
          triggeredAutomations.push(triggerResult);
      }

      if (triggeredAutomations.length > 0) {
        results.push({
          coinId,
          prices,
          triggeredAutomations,
        });
      }
    }

    return results;
  } catch (error) {
    console.warn("Error in checkActiveAutomations:", error);
    return [];
  }
};

/**
 * Перевіряє чи спрацювала автоматизація на піднімання ціни
 */
export const checkPriceRise = async (
  automation: IAutomationDocument,
  currentPrice: number,
  priceSource: "binance" | "dexscreener" | "coingecko"
): Promise<ITriggerResult> => {
  try {
    if (automation.target_price) {
      if (currentPrice >= automation.target_price)
        return {
          triggered: true,
          automation,
          currentPrice,
          priceSource,
          reason: `Ціна досягла або перевищила цільове значення ${automation.target_price}`,
        };

      return {
        triggered: false,
        automation,
        currentPrice,
        priceSource,
        reason: "Ціна не досягла цільового значення",
      };
    }

    if (automation.activation_price) {
      if (currentPrice < automation.activation_price)
        return {
          triggered: false,
          automation,
          currentPrice,
          priceSource,
          reason: `Очікування активації (поточна: ${currentPrice}, поріг: ${automation.activation_price})`,
        };

      if (!automation.continuation_price) {
        await AutomationModel.findByIdAndUpdate(automation._id, {
          continuation_price: currentPrice,
        });

        return {
          triggered: false,
          automation,
          currentPrice,
          priceSource,
          reason: `Активовано! Встановлено початкову ціну ${currentPrice} для відстеження максимуму`,
        };
      }
    }

    if (!automation.continuation_price) {
      await AutomationModel.findByIdAndUpdate(automation._id, {
        continuation_price: currentPrice,
      });

      return {
        triggered: false,
        automation,
        currentPrice,
        priceSource,
        reason: "Встановлено початкову ціну для відстеження максимуму",
      };
    }

    if (currentPrice > automation.continuation_price) {
      await AutomationModel.findByIdAndUpdate(automation._id, {
        continuation_price: currentPrice,
      });

      return {
        triggered: false,
        automation,
        currentPrice,
        priceSource,
        reason: `Оновлено максимум з ${automation.continuation_price} до ${currentPrice}`,
      };
    }

    const priceChangePercent =
      ((automation.continuation_price - currentPrice) /
        automation.continuation_price) *
      100;

    if (priceChangePercent >= 0.1)
      return {
        triggered: true,
        automation,
        currentPrice,
        priceSource,
        reason: `Ціна впала з максимуму ${
          automation.continuation_price
        } до ${currentPrice} (корекція -${priceChangePercent.toFixed(2)}%)`,
      };

    return {
      triggered: false,
      automation,
      currentPrice,
      priceSource,
      reason: "Корекція менше 0.1%, продовжуємо відстеження",
    };
  } catch (error) {
    console.warn("Error in checkPriceRise:", error);
    return {
      triggered: false,
      automation,
      currentPrice,
      priceSource,
      reason: "Помилка перевірки",
    };
  }
};

/**
 * Перевіряє чи спрацювала автоматизація на падіння ціни
 */
export const checkPriceDrop = async (
  automation: IAutomationDocument,
  currentPrice: number,
  priceSource: "binance" | "dexscreener" | "coingecko"
): Promise<ITriggerResult> => {
  try {
    if (automation.target_price) {
      if (currentPrice <= automation.target_price)
        return {
          triggered: true,
          automation,
          currentPrice,
          priceSource,
          reason: `Ціна досягла або впала нижче цільового значення ${automation.target_price}`,
        };

      return {
        triggered: false,
        automation,
        currentPrice,
        priceSource,
        reason: "Ціна не досягла цільового значення",
      };
    }

    if (automation.activation_price) {
      if (currentPrice > automation.activation_price)
        return {
          triggered: false,
          automation,
          currentPrice,
          priceSource,
          reason: `Очікування активації (поточна: ${currentPrice}, поріг: ${automation.activation_price})`,
        };

      if (!automation.continuation_price) {
        await AutomationModel.findByIdAndUpdate(automation._id, {
          continuation_price: currentPrice,
        });

        return {
          triggered: false,
          automation,
          currentPrice,
          priceSource,
          reason: `Активовано! Встановлено початкову ціну ${currentPrice} для відстеження мінімуму`,
        };
      }
    }

    if (!automation.continuation_price) {
      await AutomationModel.findByIdAndUpdate(automation._id, {
        continuation_price: currentPrice,
      });

      return {
        triggered: false,
        automation,
        currentPrice,
        priceSource,
        reason: "Встановлено початкову ціну для відстеження мінімуму",
      };
    }

    if (currentPrice < automation.continuation_price) {
      await AutomationModel.findByIdAndUpdate(automation._id, {
        continuation_price: currentPrice,
      });

      return {
        triggered: false,
        automation,
        currentPrice,
        priceSource,
        reason: `Оновлено мінімум з ${automation.continuation_price} до ${currentPrice}`,
      };
    }

    const priceChangePercent =
      ((currentPrice - automation.continuation_price) /
        automation.continuation_price) *
      100;

    if (priceChangePercent >= 0.1) {
      return {
        triggered: true,
        automation,
        currentPrice,
        priceSource,
        reason: `Ціна піднялася з мінімуму ${
          automation.continuation_price
        } до ${currentPrice} (відскок +${priceChangePercent.toFixed(2)}%)`,
      };
    }

    return {
      triggered: false,
      automation,
      currentPrice,
      priceSource,
      reason: "Відскок менше 0.1%, продовжуємо відстеження",
    };
  } catch (error) {
    console.warn("Error in checkPriceDrop:", error);
    return {
      triggered: false,
      automation,
      currentPrice,
      priceSource,
      reason: "Помилка перевірки",
    };
  }
};
