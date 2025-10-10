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
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: Символ або адреса контракту
 *         example: BTCUSDT
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
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: ID монети (наприклад, bitcoin)
 *         example: bitcoin
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
