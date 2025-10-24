import z from "zod";

export const aiPredictionSchema = z
  .object({
    user_position: z.object({
      has_token: z.boolean().describe("Чи користувач володіє токеном"),
      token_amount: z
        .number()
        .nullable()
        .describe("Кількість токенів, які користувач має"),
      token_buy_price: z
        .number()
        .nullable()
        .describe("Середня ціна покупки токена (USD)"),
    }),
    ai_processing_time_ms: z
      .number()
      .describe("Час обробки AI в мілісекундах")
      .default(0)
      .optional(),
    forecast: z.object({
      next_rise_date: z
        .string()
        .nullable()
        .describe("ISO-дата, коли очікується підняття ціни"),
      next_rise_in_days: z
        .number()
        .nullable()
        .describe("Через скільки днів очікується підняття"),
      next_fall_date: z
        .string()
        .nullable()
        .describe("ISO-дата, коли очікується падіння ціни"),
      next_fall_in_days: z
        .number()
        .nullable()
        .describe("Через скільки днів очікується падіння"),
    }),
    recommendation: z.object({
      buy_now: z.boolean().describe("Рекомендація купувати зараз"),
      buy_confidence: z
        .number()
        .describe("Впевненість у рекомендації купівлі (0-100%)"),
      buy_message: z.string().describe("Пояснення причини купівлі"),
      sell_now: z.boolean().describe("Рекомендація продавати зараз"),
      sell_confidence: z
        .number()
        .describe("Впевненість у рекомендації продажу (0-100%)"),
      sell_message: z.string().describe("Пояснення причини продажу"),
    }),
    market_context: z
      .object({
        sentiment: z
          .enum(["bullish", "bearish", "neutral"])
          .describe("Загальний настрій ринку"),
        btc_trend: z
          .enum(["up", "down", "neutral"])
          .describe("Поточна динаміка Bitcoin"),
        altcoin_trend: z
          .enum(["up", "down", "neutral"])
          .describe("Тренд альткоїнів"),
        political_impact: z
          .string()
          .describe(
            "Політичні або макроекономічні фактори, що впливають на ринок"
          ),
        meme_factor: z
          .string()
          .describe(
            "Мем-ефект, соціальна чи віральна активність навколо токена"
          ),
        community_activity: z
          .enum(["high", "medium", "low"])
          .describe("Активність спільноти токена"),
        news_sentiment: z
          .enum(["positive", "neutral", "negative"])
          .describe("Тональність новин (згадок у соцмережах, статтях)"),
        analysis_summary: z
          .string()
          .describe("Коротке пояснення аналітичного стану ринку"),
        gold_analysis: z
          .object({
            current_price: z
              .number()
              .nullable()
              .describe("Поточна ціна золота в USD"),
            price_change_24h: z
              .number()
              .nullable()
              .describe("Зміна ціни золота за 24 години (%)"),
            price_change_7d: z
              .number()
              .nullable()
              .describe("Зміна ціни золота за 7 днів (%)"),
            trend: z.enum(["up", "down", "neutral"]).describe("Тренд золота"),
            impact_on_crypto: z
              .string()
              .describe("Вплив ціни золота на криптовалюти"),
            analyst_forecast: z
              .string()
              .describe("Прогноз аналітиків щодо майбутнього золота"),
            correlation_with_btc: z.string().describe("Кореляція золота з BTC"),
          })
          .default({
            current_price: null,
            price_change_24h: null,
            price_change_7d: null,
            trend: "neutral",
            impact_on_crypto: "",
            analyst_forecast: "",
            correlation_with_btc: "",
          })
          .optional(),
        macro_economic_factors: z
          .object({
            fed_interest_rate: z
              .number()
              .nullable()
              .describe("Процентна ставка ФРС (%)"),
            dxy_index: z.number().nullable().describe("Індекс долара (DXY)"),
            oil_price: z
              .number()
              .nullable()
              .describe("Ціна нафти WTI (USD/барель)"),
            sp500_change: z
              .number()
              .nullable()
              .describe("Зміна S&P 500 за 24г (%)"),
            nasdaq_change: z
              .number()
              .nullable()
              .describe("Зміна NASDAQ за 24г (%)"),
            inflation_rate: z
              .number()
              .nullable()
              .describe("Рівень інфляції (%)"),
            unemployment_rate: z
              .number()
              .nullable()
              .describe("Рівень безробіття (%)"),
            vix_index: z
              .number()
              .nullable()
              .describe("Індекс волатильності VIX"),
          })
          .default({
            fed_interest_rate: null,
            dxy_index: null,
            oil_price: null,
            sp500_change: null,
            nasdaq_change: null,
            inflation_rate: null,
            unemployment_rate: null,
            vix_index: null,
          })
          .optional(),
        market_metrics: z
          .object({
            fear_greed_index: z
              .number()
              .nullable()
              .describe("Індекс страху та жадібності (0-100)"),
            btc_dominance: z
              .number()
              .nullable()
              .describe("Домінування BTC (%)"),
            total_market_cap: z
              .number()
              .nullable()
              .describe("Загальна капіталізація крипто (USD)"),
            total_volume_24h: z
              .number()
              .nullable()
              .describe("Загальний обсяг торгів за 24г (USD)"),
            stablecoin_supply: z
              .number()
              .nullable()
              .describe("Загальна пропозиція стейблкоїнів (USD)"),
            futures_liquidations: z
              .number()
              .nullable()
              .describe("Ліквідації ф'ючерсів за 24г (USD)"),
            whale_movements: z.string().describe("Рух великих інвесторів"),
            upcoming_events: z
              .array(z.string())
              .describe("Майбутні події (халвінг, форки, ETF)"),
          })
          .default({
            fear_greed_index: null,
            btc_dominance: null,
            total_market_cap: null,
            total_volume_24h: null,
            stablecoin_supply: null,
            futures_liquidations: null,
            whale_movements: "",
            upcoming_events: [],
          })
          .optional(),
        technical_indicators: z
          .object({
            rsi: z.number().nullable().describe("RSI індикатор"),
            macd: z.number().nullable().describe("MACD сигнал"),
            moving_average_50: z
              .number()
              .nullable()
              .describe("50-денна середня"),
            moving_average_200: z
              .number()
              .nullable()
              .describe("200-денна середня"),
            bollinger_bands: z
              .string()
              .describe("Позиція відносно смуг Боллінджера"),
            support_levels: z.array(z.number()).describe("Рівні підтримки"),
            resistance_levels: z.array(z.number()).describe("Рівні опору"),
          })
          .default({
            rsi: null,
            macd: null,
            moving_average_50: null,
            moving_average_200: null,
            bollinger_bands: "",
            support_levels: [],
            resistance_levels: [],
          })
          .optional(),
      })
      .default({
        sentiment: "neutral",
        btc_trend: "neutral",
        altcoin_trend: "neutral",
        political_impact: "",
        meme_factor: "",
        community_activity: "medium",
        news_sentiment: "neutral",
        analysis_summary: "",
        gold_analysis: {
          current_price: null,
          price_change_24h: null,
          price_change_7d: null,
          trend: "neutral",
          impact_on_crypto: "",
          analyst_forecast: "",
          correlation_with_btc: "",
        },
        macro_economic_factors: {
          fed_interest_rate: null,
          dxy_index: null,
          oil_price: null,
          sp500_change: null,
          nasdaq_change: null,
          inflation_rate: null,
          unemployment_rate: null,
          vix_index: null,
        },
        market_metrics: {
          fear_greed_index: null,
          btc_dominance: null,
          total_market_cap: null,
          total_volume_24h: null,
          stablecoin_supply: null,
          futures_liquidations: null,
          whale_movements: "",
          upcoming_events: [],
        },
        technical_indicators: {
          rsi: null,
          macd: null,
          moving_average_50: null,
          moving_average_200: null,
          bollinger_bands: "",
          support_levels: [],
          resistance_levels: [],
        },
      }),
    risk_and_influence: z
      .object({
        risk_level: z
          .enum(["low", "medium", "high"])
          .describe("Загальний рівень ризику для токена"),
        risk_factors: z
          .array(z.string())
          .describe("Основні ризики, що можуть вплинути на токен"),
        main_influences: z
          .array(z.string())
          .describe("Головні фактори, що впливають на прогноз"),
        confidence_level: z
          .number()
          .describe("Впевненість AI-моделі у прогнозі (0–100)"),
      })
      .default({
        risk_level: "medium",
        risk_factors: [],
        main_influences: [],
        confidence_level: 0,
      }),
    summary: z
      .object({
        conclusion: z.string().describe("Короткий висновок у 1–2 реченнях"),
        generated_at: z.string().describe("ISO-дата генерації"),
      })
      .default({
        conclusion: "",
        generated_at: new Date().toISOString(),
      }),
  })
  .describe("AI-прогноз для криптовалюти");
