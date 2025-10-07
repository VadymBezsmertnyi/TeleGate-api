/**
 * @swagger
 * /coinpaprika/platforms:
 *   get:
 *     summary: Отримати список платформ
 *     description: Повертає список всіх доступних криптовалютних платформ (platform_id). Наприклад "eth-ethereum", "trx-tron", "bsc-binance-smart-chain" тощо
 *     tags: [Coin Diviner AI - CoinPaprika]
 *     responses:
 *       200:
 *         description: Список platform_id успішно отримано
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 example: eth-ethereum
 *               example: ["eth-ethereum", "trx-tron", "bsc-binance-smart-chain", "sol-solana"]
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
 * /coinpaprika/coins:
 *   get:
 *     summary: Отримати список монет
 *     description: Повертає список всіх криптовалют з основною інформацією. Можна відфільтрувати за platform_id (наприклад, "eth-ethereum" для токенів ERC-20)
 *     tags: [Coin Diviner AI - CoinPaprika]
 *     parameters:
 *       - in: query
 *         name: platform_id
 *         schema:
 *           type: string
 *         required: false
 *         description: ID платформи для фільтрації монет (наприклад, "eth-ethereum")
 *         example: eth-ethereum
 *     responses:
 *       200:
 *         description: Список монет успішно отримано
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 required:
 *                   - id
 *                   - name
 *                   - symbol
 *                   - rank
 *                   - is_new
 *                   - is_active
 *                   - type
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Унікальний ID монети/токена
 *                     example: btc-bitcoin
 *                   name:
 *                     type: string
 *                     description: Назва монети/токена
 *                     example: Bitcoin
 *                   symbol:
 *                     type: string
 *                     description: Символ (тікер) монети/токена
 *                     example: BTC
 *                   rank:
 *                     type: number
 *                     description: Ранг монети за капіталізацією
 *                     example: 1
 *                   is_new:
 *                     type: boolean
 *                     description: Чи є монета новою
 *                     example: false
 *                   is_active:
 *                     type: boolean
 *                     description: Чи є монета активною
 *                     example: true
 *                   type:
 *                     type: string
 *                     enum: [coin, token]
 *                     description: Тип криптовалюти (coin - власний блокчейн, token - токен на іншій платформі)
 *                     example: coin
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
 * /coinpaprika/coins/{coinId}:
 *   get:
 *     summary: Отримати інформацію про монету
 *     description: Повертає детальну інформацію про конкретну криптовалюту
 *     tags: [Coin Diviner AI - CoinPaprika]
 *     parameters:
 *       - in: path
 *         name: coinId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID монети (наприклад, btc-bitcoin)
 *     responses:
 *       200:
 *         description: Інформація про монету успішно отримана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID монети
 *                 name:
 *                   type: string
 *                   description: Назва монети
 *                 symbol:
 *                   type: string
 *                   description: Символ монети
 *                 rank:
 *                   type: number
 *                   description: Ранг монети
 *                 description:
 *                   type: string
 *                   description: Опис монети
 *                 type:
 *                   type: string
 *                   description: Тип монети
 *                 is_active:
 *                   type: boolean
 *                   description: Чи є монета активною
 *       404:
 *         description: Монету не знайдено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Coin not found
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
 * /coinpaprika/tickers/{coinId}:
 *   get:
 *     summary: Отримати ticker інформацію про монету
 *     description: Повертає актуальні ринкові дані (ціна, обсяг, зміни) для конкретної криптовалюти
 *     tags: [Coin Diviner AI - CoinPaprika]
 *     parameters:
 *       - in: path
 *         name: coinId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID монети (наприклад, btc-bitcoin)
 *     responses:
 *       200:
 *         description: Ticker інформацію успішно отримано
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID монети
 *                 name:
 *                   type: string
 *                   description: Назва монети
 *                 symbol:
 *                   type: string
 *                   description: Символ монети
 *                 rank:
 *                   type: number
 *                   description: Ранг монети
 *                 circulating_supply:
 *                   type: number
 *                   description: Обіг монет
 *                 total_supply:
 *                   type: number
 *                   description: Загальна кількість монет
 *                 max_supply:
 *                   type: number
 *                   description: Максимальна кількість монет
 *                 quotes:
 *                   type: object
 *                   description: Котирування в різних валютах
 *       404:
 *         description: Ticker не знайдено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ticker not found
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
