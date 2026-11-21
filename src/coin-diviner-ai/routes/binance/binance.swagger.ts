/**
 * @swagger
 * /binance/price:
 *   get:
 *     summary: Отримати поточну ціну криптовалюти
 *     description: Повертає актуальну ціну торгової пари на Binance
 *     tags: [Coin Diviner AI - Binance]
 *     parameters:
 *       - in: query
 *         name: symbol
 *         schema:
 *           type: string
 *         required: false
 *         description: Торгова пара (за замовчуванням BTCUSDT)
 *         example: BTCUSDT
 *     responses:
 *       200:
 *         description: Ціна успішно отримана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 symbol:
 *                   type: string
 *                   description: Торгова пара
 *                   example: BTCUSDT
 *                 price:
 *                   type: string
 *                   description: Поточна ціна
 *                   example: "45000.50"
 *       500:
 *         description: Помилка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to fetch price data
 */

/**
 * @swagger
 * /binance/24h-stats:
 *   get:
 *     summary: Отримати статистику за 24 години
 *     description: Повертає детальну статистику торгівлі за останні 24 години - мінімальна/максимальна ціна, обсяги, зміни тощо
 *     tags: [Coin Diviner AI - Binance]
 *     parameters:
 *       - in: query
 *         name: symbol
 *         schema:
 *           type: string
 *         required: false
 *         description: Торгова пара (за замовчуванням BTCUSDT)
 *         example: BTCUSDT
 *     responses:
 *       200:
 *         description: Статистика успішно отримана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 symbol:
 *                   type: string
 *                   description: Торгова пара
 *                   example: BTCUSDT
 *                 priceChange:
 *                   type: string
 *                   description: Зміна ціни за 24 години
 *                   example: "1200.50"
 *                 priceChangePercent:
 *                   type: string
 *                   description: Зміна ціни у відсотках
 *                   example: "2.74"
 *                 weightedAvgPrice:
 *                   type: string
 *                   description: Середньозважена ціна
 *                   example: "44500.25"
 *                 prevClosePrice:
 *                   type: string
 *                   description: Ціна закриття попереднього періоду
 *                   example: "43800.00"
 *                 lastPrice:
 *                   type: string
 *                   description: Остання ціна
 *                   example: "45000.50"
 *                 lastQty:
 *                   type: string
 *                   description: Кількість останньої угоди
 *                   example: "0.05"
 *                 bidPrice:
 *                   type: string
 *                   description: Найкраща ціна на купівлю
 *                   example: "45000.00"
 *                 askPrice:
 *                   type: string
 *                   description: Найкраща ціна на продаж
 *                   example: "45000.50"
 *                 openPrice:
 *                   type: string
 *                   description: Ціна відкриття
 *                   example: "43800.00"
 *                 highPrice:
 *                   type: string
 *                   description: Максимальна ціна за 24 години
 *                   example: "45500.00"
 *                 lowPrice:
 *                   type: string
 *                   description: Мінімальна ціна за 24 години
 *                   example: "43500.00"
 *                 volume:
 *                   type: string
 *                   description: Обсяг торгівлі в базовій валюті
 *                   example: "25000.50"
 *                 quoteVolume:
 *                   type: string
 *                   description: Обсяг торгівлі в котируваній валюті
 *                   example: "1112522500.00"
 *                 openTime:
 *                   type: number
 *                   description: Час відкриття періоду (Unix timestamp)
 *                   example: 1609459200000
 *                 closeTime:
 *                   type: number
 *                   description: Час закриття періоду (Unix timestamp)
 *                   example: 1609545600000
 *                 firstId:
 *                   type: number
 *                   description: ID першої угоди
 *                   example: 1234567
 *                 lastId:
 *                   type: number
 *                   description: ID останньої угоди
 *                   example: 1234890
 *                 count:
 *                   type: number
 *                   description: Кількість угод
 *                   example: 323
 *       500:
 *         description: Помилка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to fetch 24h stats data
 */

/**
 * @swagger
 * /binance/klines:
 *   get:
 *     summary: Отримати свічкові дані (Klines/Candlesticks)
 *     description: Повертає історичні дані свічок для побудови графіків. Кожна свічка містить ціни відкриття, закриття, максимум, мінімум та обсяги
 *     tags: [Coin Diviner AI - Binance]
 *     parameters:
 *       - in: query
 *         name: symbol
 *         schema:
 *           type: string
 *         required: false
 *         description: Торгова пара (за замовчуванням BTCUSDT)
 *         example: BTCUSDT
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M]
 *         required: false
 *         description: Інтервал свічок (за замовчуванням 1d)
 *         example: 1d
 *     responses:
 *       200:
 *         description: Свічкові дані успішно отримані
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   openTime:
 *                     type: number
 *                     description: Час відкриття свічки (Unix timestamp)
 *                     example: 1609459200000
 *                   open:
 *                     type: string
 *                     description: Ціна відкриття
 *                     example: "43800.00"
 *                   high:
 *                     type: string
 *                     description: Максимальна ціна
 *                     example: "45500.00"
 *                   low:
 *                     type: string
 *                     description: Мінімальна ціна
 *                     example: "43500.00"
 *                   close:
 *                     type: string
 *                     description: Ціна закриття
 *                     example: "45000.50"
 *                   volume:
 *                     type: string
 *                     description: Обсяг торгівлі в базовій валюті
 *                     example: "25000.50"
 *                   closeTime:
 *                     type: number
 *                     description: Час закриття свічки (Unix timestamp)
 *                     example: 1609545600000
 *                   quoteVolume:
 *                     type: string
 *                     description: Обсяг торгівлі в котируваній валюті
 *                     example: "1112522500.00"
 *                   trades:
 *                     type: number
 *                     description: Кількість угод
 *                     example: 323
 *                   baseAssetVolume:
 *                     type: string
 *                     description: Обсяг купівель базового активу
 *                     example: "12500.25"
 *                   quoteAssetVolume:
 *                     type: string
 *                     description: Обсяг купівель котируваного активу
 *                     example: "556261250.00"
 *       500:
 *         description: Помилка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to fetch klines data
 */

/**
 * @swagger
 * /binance/exchange-info:
 *   get:
 *     summary: Отримати інформацію про біржу
 *     description: Повертає повну інформацію про біржу Binance - список торгових пар, їх параметри, ліміти, фільтри, часову зону сервера тощо
 *     tags: [Coin Diviner AI - Binance]
 *     responses:
 *       200:
 *         description: Інформація про біржу успішно отримана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timezone:
 *                   type: string
 *                   description: Часова зона сервера
 *                   example: UTC
 *                 serverTime:
 *                   type: number
 *                   description: Час сервера (Unix timestamp)
 *                   example: 1609459200000
 *                 rateLimits:
 *                   type: array
 *                   description: Ліміти запитів до API
 *                   items:
 *                     type: object
 *                     properties:
 *                       rateLimitType:
 *                         type: string
 *                         example: REQUEST_WEIGHT
 *                       interval:
 *                         type: string
 *                         example: MINUTE
 *                       intervalNum:
 *                         type: number
 *                         example: 1
 *                       limit:
 *                         type: number
 *                         example: 1200
 *                 exchangeFilters:
 *                   type: array
 *                   description: Фільтри біржі
 *                   items:
 *                     type: object
 *                 symbols:
 *                   type: array
 *                   description: Список торгових пар
 *                   items:
 *                     type: object
 *                     properties:
 *                       symbol:
 *                         type: string
 *                         description: Назва торгової пари
 *                         example: BTCUSDT
 *                       status:
 *                         type: string
 *                         description: Статус торгової пари
 *                         example: TRADING
 *                       baseAsset:
 *                         type: string
 *                         description: Базовий актив
 *                         example: BTC
 *                       baseAssetPrecision:
 *                         type: number
 *                         description: Точність базового активу
 *                         example: 8
 *                       quoteAsset:
 *                         type: string
 *                         description: Котируваний актив
 *                         example: USDT
 *                       quoteAssetPrecision:
 *                         type: number
 *                         description: Точність котируваного активу
 *                         example: 8
 *                       orderTypes:
 *                         type: array
 *                         description: Доступні типи ордерів
 *                         items:
 *                           type: string
 *                         example: [LIMIT, MARKET, STOP_LOSS, STOP_LOSS_LIMIT]
 *                       icebergAllowed:
 *                         type: boolean
 *                         description: Чи дозволені Iceberg ордери
 *                         example: true
 *                       ocoAllowed:
 *                         type: boolean
 *                         description: Чи дозволені OCO ордери
 *                         example: true
 *                       isSpotTradingAllowed:
 *                         type: boolean
 *                         description: Чи дозволена спот торгівля
 *                         example: true
 *                       isMarginTradingAllowed:
 *                         type: boolean
 *                         description: Чи дозволена маржинальна торгівля
 *                         example: true
 *                       filters:
 *                         type: array
 *                         description: Фільтри торгової пари (ліміти цін, кількості тощо)
 *                         items:
 *                           type: object
 *                       permissions:
 *                         type: array
 *                         description: Дозволи для торгової пари
 *                         items:
 *                           type: string
 *                         example: [SPOT, MARGIN]
 *       500:
 *         description: Помилка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to fetch exchange info
 */

/**
 * @swagger
 * /binance/exchange-info/{symbol}:
 *   get:
 *     summary: Отримати інформацію про конкретну торгову пару
 *     description: Повертає детальну інформацію про конкретну торгову пару на Binance - статус, базовий та котируваний актив, типи ордерів, фільтри, ліміти тощо
 *     tags: [Coin Diviner AI - Binance]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         schema:
 *           type: string
 *         required: true
 *         description: Торгова пара (наприклад, BTCUSDT, ETHUSDT)
 *         example: BTCUSDT
 *     responses:
 *       200:
 *         description: Інформація про торгову пару успішно отримана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 symbol:
 *                   type: string
 *                   description: Назва торгової пари
 *                   example: BTCUSDT
 *                 status:
 *                   type: string
 *                   description: Статус торгової пари
 *                   example: TRADING
 *                 baseAsset:
 *                   type: string
 *                   description: Базовий актив
 *                   example: BTC
 *                 baseAssetPrecision:
 *                   type: number
 *                   description: Точність базового активу (кількість десяткових знаків)
 *                   example: 8
 *                 quoteAsset:
 *                   type: string
 *                   description: Котируваний актив
 *                   example: USDT
 *                 quoteAssetPrecision:
 *                   type: number
 *                   description: Точність котируваного активу
 *                   example: 8
 *                 orderTypes:
 *                   type: array
 *                   description: Доступні типи ордерів для цієї пари
 *                   items:
 *                     type: string
 *                   example: [LIMIT, MARKET, STOP_LOSS, STOP_LOSS_LIMIT, TAKE_PROFIT, TAKE_PROFIT_LIMIT]
 *                 icebergAllowed:
 *                   type: boolean
 *                   description: Чи дозволені Iceberg ордери (приховані великі ордери)
 *                   example: true
 *                 ocoAllowed:
 *                   type: boolean
 *                   description: Чи дозволені OCO ордери (One-Cancels-the-Other)
 *                   example: true
 *                 isSpotTradingAllowed:
 *                   type: boolean
 *                   description: Чи дозволена спот торгівля
 *                   example: true
 *                 isMarginTradingAllowed:
 *                   type: boolean
 *                   description: Чи дозволена маржинальна торгівля
 *                   example: true
 *                 filters:
 *                   type: array
 *                   description: Фільтри та ліміти для торгової пари (мінімальна/максимальна ціна, кількість, нотаріальна вартість тощо)
 *                   items:
 *                     type: object
 *                     properties:
 *                       filterType:
 *                         type: string
 *                         description: Тип фільтру
 *                         example: PRICE_FILTER
 *                       minPrice:
 *                         type: string
 *                         description: Мінімальна ціна (для PRICE_FILTER)
 *                         example: "0.01000000"
 *                       maxPrice:
 *                         type: string
 *                         description: Максимальна ціна (для PRICE_FILTER)
 *                         example: "1000000.00000000"
 *                       tickSize:
 *                         type: string
 *                         description: Крок зміни ціни (для PRICE_FILTER)
 *                         example: "0.01000000"
 *                       minQty:
 *                         type: string
 *                         description: Мінімальна кількість (для LOT_SIZE)
 *                         example: "0.00001000"
 *                       maxQty:
 *                         type: string
 *                         description: Максимальна кількість (для LOT_SIZE)
 *                         example: "9000.00000000"
 *                       stepSize:
 *                         type: string
 *                         description: Крок зміни кількості (для LOT_SIZE)
 *                         example: "0.00001000"
 *                 permissions:
 *                   type: array
 *                   description: Дозволи для торгової пари
 *                   items:
 *                     type: string
 *                   example: [SPOT, MARGIN]
 *       404:
 *         description: Торгову пару не знайдено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Symbol not found
 *       500:
 *         description: Помилка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to fetch exchange info
 */
