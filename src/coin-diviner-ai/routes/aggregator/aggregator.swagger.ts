/**
 * @swagger
 * tags:
 *   name: Coin Diviner AI - Aggregator
 *   description: Агрегація даних з різних джерел (Binance, CoinGecko, CoinPaprika, DexScreener)
 */

/**
 * @swagger
 * /coin-diviner-ai/api/aggregator/search:
 *   get:
 *     summary: Пошук монет/токенів
 *     tags: [Coin Diviner AI - Aggregator]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Пошуковий запит (назва або символ монети)
 *     responses:
 *       200:
 *         description: Результати пошуку
 *       400:
 *         description: Відсутній параметр query
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /coin-diviner-ai/api/aggregator/price:
 *   get:
 *     summary: Отримати поточну ціну монети/токена
 *     tags: [Coin Diviner AI - Aggregator]
 *     parameters:
 *       - in: query
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Символ або адреса контракту
 *     responses:
 *       200:
 *         description: Поточна ціна монети
 *       400:
 *         description: Відсутній параметр symbol
 *       404:
 *         description: Монету не знайдено
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /coin-diviner-ai/api/aggregator/price-history:
 *   get:
 *     summary: Отримати історію ціни монети/токена
 *     tags: [Coin Diviner AI - Aggregator]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID монети (наприклад, bitcoin)
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
 *       400:
 *         description: Відсутній параметр id
 *       404:
 *         description: Дані не знайдено
 *       500:
 *         description: Помилка сервера
 */
