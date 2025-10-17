import AutomationModel from "../../routes/automation/automation.model";
import AggregatorService from "../aggregator";

import type {
  IAutomationDocument,
  ITriggerResult,
  IAutomationCheckResult,
} from "./automation.types";

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
      try {
        const prices = await AggregatorService.getAllPrices(coinId);
        coinPricesMap.set(coinId, {
          binance: prices.binance?.price || null,
          dexscreener: prices.dexscreener?.price || null,
          coingecko: prices.coingecko?.price || null,
        });
      } catch (dexError) {
        try {
          const coingeckoPrice = await AggregatorService.getPrice(coinId);
          coinPricesMap.set(coinId, {
            binance: null,
            dexscreener: null,
            coingecko:
              coingeckoPrice?.source === "coingecko"
                ? coingeckoPrice.price
                : null,
          });
        } catch (geckoError) {
          console.warn(
            `Failed to fetch prices for coin ${coinId}:`,
            geckoError
          );
          coinPricesMap.set(coinId, {
            binance: null,
            dexscreener: null,
            coingecko: null,
          });
        }
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

    if (!automation.continuation_price) {
      await AutomationModel.findByIdAndUpdate(automation._id, {
        continuation_price: currentPrice,
      });

      return {
        triggered: false,
        automation,
        currentPrice,
        priceSource,
        reason: "Встановлено початкову ціну для відстеження",
      };
    }

    if (currentPrice < automation.continuation_price)
      return {
        triggered: true,
        automation,
        currentPrice,
        priceSource,
        reason: `Ціна впала з ${automation.continuation_price} до ${currentPrice} (корекція після піднімання)`,
      };

    await AutomationModel.findByIdAndUpdate(automation._id, {
      continuation_price: currentPrice,
    });

    return {
      triggered: false,
      automation,
      currentPrice,
      priceSource,
      reason: "Ціна продовжує рости або стабільна, оновлено поточну ціну",
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
    if (!automation.continuation_price) {
      await AutomationModel.findByIdAndUpdate(automation._id, {
        continuation_price: currentPrice,
      });

      return {
        triggered: false,
        automation,
        currentPrice,
        priceSource,
        reason: "Встановлено початкову ціну для відстеження",
      };
    }
    if (currentPrice > automation.continuation_price)
      return {
        triggered: true,
        automation,
        currentPrice,
        priceSource,
        reason: `Ціна піднялася з ${automation.continuation_price} до ${currentPrice} (відскок після падіння)`,
      };

    await AutomationModel.findByIdAndUpdate(automation._id, {
      continuation_price: currentPrice,
    });

    return {
      triggered: false,
      automation,
      currentPrice,
      priceSource,
      reason: "Ціна продовжує падати або стабільна, оновлено поточну ціну",
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
