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
 *     summary: Отримати детальну інформацію про монету
 *     description: Повертає повну інформацію про криптовалюту - опис, теги, команду, соціальні посилання, white paper тощо
 *     tags: [Coin Diviner AI - CoinPaprika]
 *     parameters:
 *       - in: path
 *         name: coinId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID монети
 *         example: btc-bitcoin
 *     responses:
 *       200:
 *         description: Детальна інформація про монету успішно отримана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - id
 *                 - name
 *                 - symbol
 *                 - rank
 *                 - type
 *                 - description
 *                 - logo
 *                 - tags
 *                 - team
 *                 - links
 *               properties:
 *                 id:
 *                   type: string
 *                   example: btc-bitcoin
 *                 name:
 *                   type: string
 *                   example: Bitcoin
 *                 symbol:
 *                   type: string
 *                   example: BTC
 *                 rank:
 *                   type: number
 *                   example: 1
 *                 is_new:
 *                   type: boolean
 *                   example: false
 *                 is_active:
 *                   type: boolean
 *                   example: true
 *                 type:
 *                   type: string
 *                   enum: [coin, token]
 *                   example: coin
 *                 description:
 *                   type: string
 *                   description: Детальний опис монети/токена
 *                 logo:
 *                   type: string
 *                   description: URL логотипу
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       coin_counter:
 *                         type: number
 *                       ico_counter:
 *                         type: number
 *                 team:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       position:
 *                         type: string
 *                 links:
 *                   type: object
 *                   properties:
 *                     explorer:
 *                       type: array
 *                       items:
 *                         type: string
 *                     facebook:
 *                       type: array
 *                       items:
 *                         type: string
 *                     reddit:
 *                       type: array
 *                       items:
 *                         type: string
 *                     source_code:
 *                       type: array
 *                       items:
 *                         type: string
 *                     website:
 *                       type: array
 *                       items:
 *                         type: string
 *                     youtube:
 *                       type: array
 *                       items:
 *                         type: string
 *                 open_source:
 *                   type: boolean
 *                 started_at:
 *                   type: string
 *                   format: date-time
 *                 development_status:
 *                   type: string
 *                 hardware_wallet:
 *                   type: boolean
 *                 proof_type:
 *                   type: string
 *                   description: Тип консенсусу (PoW, PoS тощо)
 *                 org_structure:
 *                   type: string
 *                 hash_algorithm:
 *                   type: string
 *                 links_extended:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       url:
 *                         type: string
 *                       type:
 *                         type: string
 *                       stats:
 *                         type: object
 *                 whitepaper:
 *                   type: object
 *                   properties:
 *                     link:
 *                       type: string
 *                     thumbnail:
 *                       type: string
 *                 first_data_at:
 *                   type: string
 *                   format: date-time
 *                 last_data_at:
 *                   type: string
 *                   format: date-time
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
 *     summary: Отримати ринкові дані монети
 *     description: Повертає актуальні ринкові дані - ціну, обсяги торгівлі, капіталізацію, зміни цін за різні періоди (15m, 1h, 24h, 7d, 30d, 1y), ATH тощо
 *     tags: [Coin Diviner AI - CoinPaprika]
 *     parameters:
 *       - in: path
 *         name: coinId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID монети
 *         example: btc-bitcoin
 *     responses:
 *       200:
 *         description: Ринкові дані успішно отримано
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - id
 *                 - name
 *                 - symbol
 *                 - rank
 *                 - circulating_supply
 *                 - total_supply
 *                 - max_supply
 *                 - quotes
 *               properties:
 *                 id:
 *                   type: string
 *                   example: btc-bitcoin
 *                 name:
 *                   type: string
 *                   example: Bitcoin
 *                 symbol:
 *                   type: string
 *                   example: BTC
 *                 rank:
 *                   type: number
 *                   example: 1
 *                 circulating_supply:
 *                   type: number
 *                   description: Кількість монет в обігу
 *                   example: 19000000
 *                 total_supply:
 *                   type: number
 *                   description: Загальна кількість монет
 *                   example: 19000000
 *                 max_supply:
 *                   type: number
 *                   description: Максимальна можлива кількість монет
 *                   example: 21000000
 *                 beta_value:
 *                   type: number
 *                   description: Бета коефіцієнт
 *                 first_data_at:
 *                   type: string
 *                   format: date-time
 *                   description: Дата першої інформації про монету
 *                 last_updated:
 *                   type: string
 *                   format: date-time
 *                   description: Час останнього оновлення
 *                 quotes:
 *                   type: object
 *                   description: Котирування в різних валютах (за замовчуванням USD)
 *                   properties:
 *                     USD:
 *                       type: object
 *                       properties:
 *                         price:
 *                           type: number
 *                           description: Поточна ціна в USD
 *                           example: 45000.50
 *                         volume_24h:
 *                           type: number
 *                           description: Обсяг торгів за 24 години
 *                         volume_24h_change_24h:
 *                           type: number
 *                           description: Зміна обсягу за 24 години (%)
 *                         market_cap:
 *                           type: number
 *                           description: Ринкова капіталізація
 *                         market_cap_change_24h:
 *                           type: number
 *                           description: Зміна капіталізації за 24 години (%)
 *                         percent_change_15m:
 *                           type: number
 *                           description: Зміна ціни за 15 хвилин (%)
 *                         percent_change_30m:
 *                           type: number
 *                           description: Зміна ціни за 30 хвилин (%)
 *                         percent_change_1h:
 *                           type: number
 *                           description: Зміна ціни за 1 годину (%)
 *                         percent_change_6h:
 *                           type: number
 *                           description: Зміна ціни за 6 годин (%)
 *                         percent_change_12h:
 *                           type: number
 *                           description: Зміна ціни за 12 годин (%)
 *                         percent_change_24h:
 *                           type: number
 *                           description: Зміна ціни за 24 години (%)
 *                         percent_change_7d:
 *                           type: number
 *                           description: Зміна ціни за 7 днів (%)
 *                         percent_change_30d:
 *                           type: number
 *                           description: Зміна ціни за 30 днів (%)
 *                         percent_change_1y:
 *                           type: number
 *                           description: Зміна ціни за 1 рік (%)
 *                         ath_price:
 *                           type: number
 *                           description: Історичний максимум ціни (All Time High)
 *                         ath_date:
 *                           type: string
 *                           format: date-time
 *                           description: Дата досягнення ATH
 *                         percent_from_price_ath:
 *                           type: number
 *                           description: Відсоток від ATH (%)
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
