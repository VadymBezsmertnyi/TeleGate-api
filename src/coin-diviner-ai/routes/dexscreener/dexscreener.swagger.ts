/**
 * @swagger
 * /dexscreener/pairs-by-token:
 *   get:
 *     summary: Отримати торгові пари за адресою токена
 *     description: Повертає всі торгові пари (pools) для вказаного токена на певному блокчейні. Включає дані про ціну, обсяг торгівлі, ліквідність та інші метрики з різних DEX
 *     tags: [Coin Diviner AI - DexScreener]
 *     parameters:
 *       - in: query
 *         name: chain
 *         schema:
 *           type: string
 *         required: true
 *         description: ID блокчейну (ethereum, bsc, polygon, solana тощо)
 *         example: ethereum
 *       - in: query
 *         name: address
 *         schema:
 *           type: string
 *         required: true
 *         description: Адреса смарт-контракту токена
 *         example: "0x6B175474E89094C44Da98b954EedeAC495271d0F"
 *     responses:
 *       200:
 *         description: Список торгових пар успішно отримано
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 schemaVersion:
 *                   type: string
 *                   description: Версія схеми даних
 *                   example: "1.0.0"
 *                 pairs:
 *                   type: array
 *                   description: Масив торгових пар
 *                   items:
 *                     type: object
 *                     properties:
 *                       chainId:
 *                         type: string
 *                         description: ID блокчейну
 *                         example: ethereum
 *                       dexId:
 *                         type: string
 *                         description: ID децентралізованої біржі
 *                         example: uniswap
 *                       url:
 *                         type: string
 *                         description: URL пари на DexScreener
 *                         example: https://dexscreener.com/ethereum/0x...
 *                       pairAddress:
 *                         type: string
 *                         description: Адреса торгової пари
 *                       baseToken:
 *                         type: object
 *                         description: Базовий токен пари
 *                         properties:
 *                           address:
 *                             type: string
 *                             description: Адреса токена
 *                           name:
 *                             type: string
 *                             description: Назва токена
 *                           symbol:
 *                             type: string
 *                             description: Символ токена
 *                       quoteToken:
 *                         type: object
 *                         description: Котирувальний токен (зазвичай USDT, USDC, ETH)
 *                         properties:
 *                           address:
 *                             type: string
 *                           name:
 *                             type: string
 *                           symbol:
 *                             type: string
 *                       priceNative:
 *                         type: string
 *                         description: Ціна в нативній валюті
 *                       priceUsd:
 *                         type: string
 *                         description: Ціна в USD
 *                       txns:
 *                         type: object
 *                         description: Кількість транзакцій
 *                         properties:
 *                           m5:
 *                             type: object
 *                             description: За 5 хвилин
 *                             properties:
 *                               buys:
 *                                 type: number
 *                               sells:
 *                                 type: number
 *                           h1:
 *                             type: object
 *                             description: За 1 годину
 *                             properties:
 *                               buys:
 *                                 type: number
 *                               sells:
 *                                 type: number
 *                           h6:
 *                             type: object
 *                             description: За 6 годин
 *                             properties:
 *                               buys:
 *                                 type: number
 *                               sells:
 *                                 type: number
 *                           h24:
 *                             type: object
 *                             description: За 24 години
 *                             properties:
 *                               buys:
 *                                 type: number
 *                               sells:
 *                                 type: number
 *                       volume:
 *                         type: object
 *                         description: Обсяг торгівлі
 *                         properties:
 *                           m5:
 *                             type: number
 *                             description: Обсяг за 5 хвилин (USD)
 *                           h1:
 *                             type: number
 *                             description: Обсяг за 1 годину (USD)
 *                           h6:
 *                             type: number
 *                             description: Обсяг за 6 годин (USD)
 *                           h24:
 *                             type: number
 *                             description: Обсяг за 24 години (USD)
 *                       priceChange:
 *                         type: object
 *                         description: Зміна ціни у відсотках
 *                         properties:
 *                           m5:
 *                             type: number
 *                             description: Зміна за 5 хвилин (%)
 *                           h1:
 *                             type: number
 *                             description: Зміна за 1 годину (%)
 *                           h6:
 *                             type: number
 *                             description: Зміна за 6 годин (%)
 *                           h24:
 *                             type: number
 *                             description: Зміна за 24 години (%)
 *                       liquidity:
 *                         type: object
 *                         description: Ліквідність пари
 *                         properties:
 *                           usd:
 *                             type: number
 *                             description: Ліквідність в USD
 *                           base:
 *                             type: number
 *                             description: Ліквідність базового токена
 *                           quote:
 *                             type: number
 *                             description: Ліквідність котирувального токена
 *                       fdv:
 *                         type: number
 *                         description: Повністю розведена оцінка (Fully Diluted Valuation)
 *                       marketCap:
 *                         type: number
 *                         description: Ринкова капіталізація
 *                       pairCreatedAt:
 *                         type: number
 *                         description: Timestamp створення пари
 *       400:
 *         description: Відсутні обов'язкові параметри
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing chain or address parameter
 *       500:
 *         description: Помилка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to fetch pairs by token
 */

/**
 * @swagger
 * /dexscreener/pair:
 *   get:
 *     summary: Отримати інформацію про торгову пару
 *     description: Повертає детальну інформацію про конкретну торгову пару за її адресою на певному блокчейні
 *     tags: [Coin Diviner AI - DexScreener]
 *     parameters:
 *       - in: query
 *         name: chain
 *         schema:
 *           type: string
 *         required: true
 *         description: ID блокчейну (ethereum, bsc, polygon, solana тощо)
 *         example: ethereum
 *       - in: query
 *         name: pairAddress
 *         schema:
 *           type: string
 *         required: true
 *         description: Адреса торгової пари (pool address)
 *         example: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"
 *     responses:
 *       200:
 *         description: Інформація про пару успішно отримана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 schemaVersion:
 *                   type: string
 *                   description: Версія схеми даних
 *                 pair:
 *                   type: object
 *                   description: Дані про торгову пару (структура аналогічна pairs-by-token)
 *                   properties:
 *                     chainId:
 *                       type: string
 *                       example: ethereum
 *                     dexId:
 *                       type: string
 *                       example: uniswap
 *                     url:
 *                       type: string
 *                     pairAddress:
 *                       type: string
 *                     baseToken:
 *                       type: object
 *                       properties:
 *                         address:
 *                           type: string
 *                         name:
 *                           type: string
 *                         symbol:
 *                           type: string
 *                     quoteToken:
 *                       type: object
 *                       properties:
 *                         address:
 *                           type: string
 *                         name:
 *                           type: string
 *                         symbol:
 *                           type: string
 *                     priceNative:
 *                       type: string
 *                     priceUsd:
 *                       type: string
 *                     txns:
 *                       type: object
 *                     volume:
 *                       type: object
 *                     priceChange:
 *                       type: object
 *                     liquidity:
 *                       type: object
 *                     fdv:
 *                       type: number
 *                     marketCap:
 *                       type: number
 *       400:
 *         description: Відсутні обов'язкові параметри
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing chain or pairAddress parameter
 *       500:
 *         description: Помилка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to fetch pair data
 */

/**
 * @swagger
 * /dexscreener/search:
 *   get:
 *     summary: Пошук торгових пар та токенів
 *     description: Виконує пошук торгових пар та токенів за назвою, символом або адресою контракту. Повертає результати з усіх підтримуваних блокчейнів та DEX
 *     tags: [Coin Diviner AI - DexScreener]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Пошуковий запит (назва токена, символ або адреса контракту)
 *         example: PEPE
 *     responses:
 *       200:
 *         description: Результати пошуку успішно отримані
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 schemaVersion:
 *                   type: string
 *                   description: Версія схеми даних
 *                 pairs:
 *                   type: array
 *                   description: Знайдені торгові пари
 *                   items:
 *                     type: object
 *                     properties:
 *                       chainId:
 *                         type: string
 *                         description: ID блокчейну
 *                         example: ethereum
 *                       dexId:
 *                         type: string
 *                         description: ID децентралізованої біржі
 *                         example: uniswap
 *                       url:
 *                         type: string
 *                         description: URL пари на DexScreener
 *                       pairAddress:
 *                         type: string
 *                         description: Адреса торгової пари
 *                       baseToken:
 *                         type: object
 *                         description: Базовий токен
 *                         properties:
 *                           address:
 *                             type: string
 *                           name:
 *                             type: string
 *                           symbol:
 *                             type: string
 *                       quoteToken:
 *                         type: object
 *                         description: Котирувальний токен
 *                         properties:
 *                           address:
 *                             type: string
 *                           name:
 *                             type: string
 *                           symbol:
 *                             type: string
 *                       priceNative:
 *                         type: string
 *                         description: Ціна в нативній валюті
 *                       priceUsd:
 *                         type: string
 *                         description: Ціна в USD
 *                         example: "0.00012345"
 *                       txns:
 *                         type: object
 *                         description: Статистика транзакцій
 *                       volume:
 *                         type: object
 *                         description: Обсяги торгівлі
 *                         properties:
 *                           h24:
 *                             type: number
 *                             description: Обсяг за 24 години
 *                       priceChange:
 *                         type: object
 *                         description: Зміни ціни
 *                         properties:
 *                           h24:
 *                             type: number
 *                             description: Зміна за 24 години (%)
 *                       liquidity:
 *                         type: object
 *                         description: Ліквідність
 *                         properties:
 *                           usd:
 *                             type: number
 *                             description: Ліквідність в USD
 *                       fdv:
 *                         type: number
 *                         description: Повністю розведена оцінка
 *                       marketCap:
 *                         type: number
 *                         description: Ринкова капіталізація
 *                       pairCreatedAt:
 *                         type: number
 *                         description: Timestamp створення пари
 *                       info:
 *                         type: object
 *                         description: Додаткова інформація
 *                         properties:
 *                           imageUrl:
 *                             type: string
 *                             description: URL зображення токена
 *                           websites:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 label:
 *                                   type: string
 *                                 url:
 *                                   type: string
 *                           socials:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 type:
 *                                   type: string
 *                                 url:
 *                                   type: string
 *       400:
 *         description: Відсутній пошуковий запит
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing search query parameter
 *       500:
 *         description: Помилка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to perform search
 */
