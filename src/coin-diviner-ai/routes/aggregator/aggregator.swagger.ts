/**
 * @swagger
 * tags:
 *   name: Coin Diviner AI - Aggregator
 *   description: Агрегація даних з різних джерел (Binance, CoinGecko, CoinPaprika, DexScreener)
 */

/**
 * @swagger
 * /aggregator/search:
 *   get:
 *     summary: Пошук монет/токенів
 *     tags: [Coin Diviner AI - Aggregator]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: Пошуковий запит (назва або символ монети)
 *         example: bitcoin
 *     responses:
 *       200:
 *         description: Результати пошуку
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                 source:
 *                   type: string
 *                   enum: [coinpaprika, coingecko]
 *                   nullable: true
 *                 cached:
 *                   type: boolean
 *       400:
 *         description: Помилка валідації
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Помилка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /aggregator/price:
 *   get:
 *     summary: Отримати поточну ціну монети/токена
 *     tags: [Coin Diviner AI - Aggregator]
 *     parameters:
 *       - in: query
 *         name: coinId
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: MongoDB _id монети з бази даних
 *         example: 68e9d873ac6c781907849713
 *     responses:
 *       200:
 *         description: Поточна ціна монети
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 symbol:
 *                   type: string
 *                 price:
 *                   type: number
 *                 source:
 *                   type: string
 *                   enum: [binance, dexscreener, coingecko]
 *       400:
 *         description: Помилка валідації
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Монету не знайдено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Помилка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /aggregator/price-history:
 *   get:
 *     summary: Отримати історію ціни монети/токена
 *     tags: [Coin Diviner AI - Aggregator]
 *     parameters:
 *       - in: query
 *         name: coinId
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: MongoDB _id монети з бази даних
 *         example: 68e9d873ac6c781907849713
 *       - in: query
 *         name: range
 *         required: false
 *         schema:
 *           type: string
 *           enum: [1h, 1d, 7d, 30d]
 *           default: 7d
 *         description: Часовий діапазон
 *     responses:
 *       200:
 *         description: Історія цін
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                 source:
 *                   type: string
 *                   enum: [coingecko, coinpaprika]
 *       400:
 *         description: Помилка валідації
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Дані не знайдено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Помилка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /aggregator/all-prices:
 *   get:
 *     summary: Отримати ціни з усіх доступних сервісів (Binance, DexScreener, CoinGecko)
 *     tags: [Coin Diviner AI - Aggregator]
 *     parameters:
 *       - in: query
 *         name: coinId
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: MongoDB _id монети з бази даних
 *         example: 68e9d873ac6c781907849713
 *     responses:
 *       200:
 *         description: Ціни з усіх сервісів
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 symbol:
 *                   type: string
 *                   description: Символ монети
 *                   example: DISCO
 *                 binance:
 *                   type: object
 *                   nullable: true
 *                   description: Ціна з Binance (якщо є binancePair)
 *                   properties:
 *                     price:
 *                       type: number
 *                       nullable: true
 *                       description: Ціна в USD
 *                       example: 0.0012545
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Час оновлення
 *                     error:
 *                       type: string
 *                       nullable: true
 *                       description: Повідомлення про помилку (якщо є)
 *                 dexscreener:
 *                   type: object
 *                   nullable: true
 *                   description: Ціна з DexScreener
 *                   properties:
 *                     price:
 *                       type: number
 *                       nullable: true
 *                       description: Ціна в USD
 *                       example: 0.0012545
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Час оновлення
 *                     error:
 *                       type: string
 *                       nullable: true
 *                       description: Повідомлення про помилку (якщо є)
 *                 coingecko:
 *                   type: object
 *                   nullable: true
 *                   description: Ціна з CoinGecko (якщо є coinGeckoData.id)
 *                   properties:
 *                     price:
 *                       type: number
 *                       nullable: true
 *                       description: Ціна в USD
 *                       example: 0.0012545
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Час оновлення
 *                     error:
 *                       type: string
 *                       nullable: true
 *                       description: Повідомлення про помилку (якщо є)
 *       400:
 *         description: Помилка валідації
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Помилка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /aggregator/all-price-history:
 *   get:
 *     summary: Отримати історію цін з усіх доступних сервісів (CoinGecko, CoinPaprika)
 *     description: Автоматично оновлює відсутні дані про монету перед запитом історії
 *     tags: [Coin Diviner AI - Aggregator]
 *     parameters:
 *       - in: query
 *         name: coinId
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: MongoDB _id монети з бази даних
 *         example: 68e9d873ac6c781907849713
 *       - in: query
 *         name: range
 *         required: false
 *         schema:
 *           type: string
 *           enum: [1h, 1d, 7d, 30d]
 *           default: 1d
 *         description: Часовий діапазон
 *     responses:
 *       200:
 *         description: Історія цін з усіх сервісів
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 symbol:
 *                   type: string
 *                 coingecko:
 *                   type: object
 *                   nullable: true
 *                 coinpaprika:
 *                   type: object
 *                   nullable: true
 *       400:
 *         description: Помилка валідації
 *       500:
 *         description: Помилка сервера
 */
