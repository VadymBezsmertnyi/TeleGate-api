/**
 * @swagger
 * /coingecko/ping:
 *   get:
 *     summary: Перевірка підключення до CoinGecko API
 *     description: Перевіряє доступність та працездатність CoinGecko API
 *     tags: [Coin Diviner AI - CoinGecko]
 *     responses:
 *       200:
 *         description: Сервіс доступний
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 gecko_says:
 *                   type: string
 *                   description: Відповідь від CoinGecko
 *                   example: "(V3) To the Moon!"
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
 * /coingecko/coins-list:
 *   get:
 *     summary: Отримати список всіх монет
 *     description: Повертає список всіх доступних криптовалют на CoinGecko з їх ID, символом, назвою та платформами
 *     tags: [Coin Diviner AI - CoinGecko]
 *     responses:
 *       200:
 *         description: Список монет успішно отримано
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Унікальний ID монети
 *                     example: bitcoin
 *                   symbol:
 *                     type: string
 *                     description: Символ (тікер) монети
 *                     example: btc
 *                   name:
 *                     type: string
 *                     description: Назва монети
 *                     example: Bitcoin
 *                   platforms:
 *                     type: object
 *                     description: Платформи та адреси контрактів (для токенів)
 *                     additionalProperties:
 *                       type: string
 *                     example:
 *                       ethereum: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"
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
 * /coingecko/markets:
 *   get:
 *     summary: Отримати ринкові дані монет
 *     description: Повертає топ монет з ринковими даними - ціна, ринкова капіталізація, обсяг торгів, зміни цін тощо. Підтримує пагінацію
 *     tags: [Coin Diviner AI - CoinGecko]
 *     parameters:
 *       - in: query
 *         name: vs_currency
 *         schema:
 *           type: string
 *         required: false
 *         description: Валюта для відображення цін (за замовчуванням usd)
 *         example: usd
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: string
 *         required: false
 *         description: Кількість результатів на сторінку (за замовчуванням 100)
 *         example: "100"
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         required: false
 *         description: Номер сторінки (за замовчуванням 1)
 *         example: "1"
 *     responses:
 *       200:
 *         description: Ринкові дані успішно отримані
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID монети
 *                     example: bitcoin
 *                   symbol:
 *                     type: string
 *                     description: Символ монети
 *                     example: btc
 *                   name:
 *                     type: string
 *                     description: Назва монети
 *                     example: Bitcoin
 *                   image:
 *                     type: string
 *                     description: URL зображення монети
 *                     example: https://assets.coingecko.com/coins/images/1/large/bitcoin.png
 *                   current_price:
 *                     type: number
 *                     description: Поточна ціна
 *                     example: 45000.50
 *                   market_cap:
 *                     type: number
 *                     description: Ринкова капіталізація
 *                     example: 850000000000
 *                   market_cap_rank:
 *                     type: number
 *                     description: Ранг за капіталізацією
 *                     example: 1
 *                   fully_diluted_valuation:
 *                     type: number
 *                     description: Повністю розбавлена вартість
 *                     example: 945000000000
 *                   total_volume:
 *                     type: number
 *                     description: Загальний обсяг торгів за 24 години
 *                     example: 25000000000
 *                   high_24h:
 *                     type: number
 *                     description: Максимальна ціна за 24 години
 *                     example: 46000.00
 *                   low_24h:
 *                     type: number
 *                     description: Мінімальна ціна за 24 години
 *                     example: 44000.00
 *                   price_change_24h:
 *                     type: number
 *                     description: Зміна ціни за 24 години
 *                     example: 1200.50
 *                   price_change_percentage_24h:
 *                     type: number
 *                     description: Відсоткова зміна ціни за 24 години
 *                     example: 2.74
 *                   market_cap_change_24h:
 *                     type: number
 *                     description: Зміна капіталізації за 24 години
 *                     example: 22500000000
 *                   market_cap_change_percentage_24h:
 *                     type: number
 *                     description: Відсоткова зміна капіталізації за 24 години
 *                     example: 2.72
 *                   circulating_supply:
 *                     type: number
 *                     description: Кількість монет в обігу
 *                     example: 19000000
 *                   total_supply:
 *                     type: number
 *                     description: Загальна кількість монет
 *                     example: 21000000
 *                   max_supply:
 *                     type: number
 *                     description: Максимальна кількість монет
 *                     example: 21000000
 *                   ath:
 *                     type: number
 *                     description: Історичний максимум (All Time High)
 *                     example: 69000.00
 *                   ath_change_percentage:
 *                     type: number
 *                     description: Відсоток від ATH
 *                     example: -34.78
 *                   ath_date:
 *                     type: string
 *                     format: date-time
 *                     description: Дата досягнення ATH
 *                     example: "2021-11-10T14:24:11.849Z"
 *                   atl:
 *                     type: number
 *                     description: Історичний мінімум (All Time Low)
 *                     example: 67.81
 *                   atl_change_percentage:
 *                     type: number
 *                     description: Відсоток від ATL
 *                     example: 66288.45
 *                   atl_date:
 *                     type: string
 *                     format: date-time
 *                     description: Дата досягнення ATL
 *                     example: "2013-07-06T00:00:00.000Z"
 *                   last_updated:
 *                     type: string
 *                     format: date-time
 *                     description: Час останнього оновлення
 *                     example: "2024-01-15T10:30:00.000Z"
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
 * /coingecko/coin/{id}:
 *   get:
 *     summary: Отримати детальну інформацію про монету
 *     description: Повертає повну інформацію про криптовалюту - опис, ринкові дані, дані спільноти, дані розробників, тікери, посилання тощо
 *     tags: [Coin Diviner AI - CoinGecko]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID монети (наприклад, bitcoin, ethereum)
 *         example: bitcoin
 *     responses:
 *       200:
 *         description: Детальна інформація про монету успішно отримана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: bitcoin
 *                 symbol:
 *                   type: string
 *                   example: btc
 *                 name:
 *                   type: string
 *                   example: Bitcoin
 *                 web_slug:
 *                   type: string
 *                   example: bitcoin
 *                 asset_platform_id:
 *                   type: string
 *                   nullable: true
 *                   description: ID платформи (null для власних блокчейнів)
 *                 description:
 *                   type: object
 *                   description: Опис монети різними мовами
 *                   properties:
 *                     en:
 *                       type: string
 *                       description: Опис англійською
 *                 links:
 *                   type: object
 *                   description: Посилання на різні ресурси
 *                   properties:
 *                     homepage:
 *                       type: array
 *                       items:
 *                         type: string
 *                     blockchain_site:
 *                       type: array
 *                       items:
 *                         type: string
 *                     official_forum_url:
 *                       type: array
 *                       items:
 *                         type: string
 *                     chat_url:
 *                       type: array
 *                       items:
 *                         type: string
 *                     announcement_url:
 *                       type: array
 *                       items:
 *                         type: string
 *                     twitter_screen_name:
 *                       type: string
 *                     facebook_username:
 *                       type: string
 *                     telegram_channel_identifier:
 *                       type: string
 *                     subreddit_url:
 *                       type: string
 *                     repos_url:
 *                       type: object
 *                 image:
 *                   type: object
 *                   properties:
 *                     thumb:
 *                       type: string
 *                     small:
 *                       type: string
 *                     large:
 *                       type: string
 *                 country_origin:
 *                   type: string
 *                 genesis_date:
 *                   type: string
 *                   format: date
 *                   description: Дата створення
 *                 sentiment_votes_up_percentage:
 *                   type: number
 *                   description: Відсоток позитивних голосів
 *                 sentiment_votes_down_percentage:
 *                   type: number
 *                   description: Відсоток негативних голосів
 *                 market_cap_rank:
 *                   type: number
 *                   description: Ранг за капіталізацією
 *                 coingecko_rank:
 *                   type: number
 *                   description: Загальний ранг на CoinGecko
 *                 coingecko_score:
 *                   type: number
 *                   description: Загальний рейтинг на CoinGecko
 *                 developer_score:
 *                   type: number
 *                   description: Рейтинг розробки
 *                 community_score:
 *                   type: number
 *                   description: Рейтинг спільноти
 *                 liquidity_score:
 *                   type: number
 *                   description: Рейтинг ліквідності
 *                 public_interest_score:
 *                   type: number
 *                   description: Рейтинг публічного інтересу
 *                 market_data:
 *                   type: object
 *                   description: Детальні ринкові дані
 *                 community_data:
 *                   type: object
 *                   description: Дані спільноти (Twitter, Reddit, Telegram тощо)
 *                 developer_data:
 *                   type: object
 *                   description: Дані розробників (GitHub активність)
 *                 tickers:
 *                   type: array
 *                   description: Список тікерів на різних біржах
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
 * /coingecko/simple/price:
 *   get:
 *     summary: Отримати спрощені цінові дані
 *     description: Повертає поточну ціну, ринкову капіталізацію, обсяг торгів та зміну ціни за 24 години для однієї або кількох монет. Швидкий метод для отримання основних даних
 *     tags: [Coin Diviner AI - CoinGecko]
 *     parameters:
 *       - in: query
 *         name: ids
 *         schema:
 *           type: string
 *         required: true
 *         description: ID монет через кому (наприклад, bitcoin,ethereum,solana)
 *         example: bitcoin,ethereum
 *       - in: query
 *         name: vs_currencies
 *         schema:
 *           type: string
 *         required: false
 *         description: Валюти для відображення цін через кому (за замовчуванням usd)
 *         example: usd
 *     responses:
 *       200:
 *         description: Цінові дані успішно отримані
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: object
 *                 properties:
 *                   usd:
 *                     type: number
 *                     description: Ціна в USD
 *                     example: 45000.50
 *                   usd_market_cap:
 *                     type: number
 *                     description: Ринкова капіталізація в USD
 *                     example: 850000000000
 *                   usd_24h_vol:
 *                     type: number
 *                     description: Обсяг торгів за 24 години в USD
 *                     example: 25000000000
 *                   usd_24h_change:
 *                     type: number
 *                     description: Зміна ціни за 24 години у відсотках
 *                     example: 2.74
 *               example:
 *                 bitcoin:
 *                   usd: 45000.50
 *                   usd_market_cap: 850000000000
 *                   usd_24h_vol: 25000000000
 *                   usd_24h_change: 2.74
 *                 ethereum:
 *                   usd: 2500.75
 *                   usd_market_cap: 300000000000
 *                   usd_24h_vol: 15000000000
 *                   usd_24h_change: 3.21
 *       400:
 *         description: Відсутній обов'язковий параметр
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bad request: 'ids' query parameter is required"
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
 * /coingecko/search:
 *   get:
 *     summary: Пошук криптовалют
 *     description: Виконує пошук монет, бірж, ICO та категорій за назвою або символом. Повертає знайдені криптовалюти з основною інформацією та зображеннями
 *     tags: [Coin Diviner AI - CoinGecko]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Пошуковий запит (назва або символ криптовалюти)
 *         example: bitcoin
 *     responses:
 *       200:
 *         description: Результати пошуку успішно отримані
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - coins
 *                 - exchanges
 *                 - icos
 *                 - categories
 *               properties:
 *                 coins:
 *                   type: array
 *                   description: Знайдені криптовалюти
 *                   items:
 *                     type: object
 *                     required:
 *                       - id
 *                       - name
 *                       - symbol
 *                       - market_cap_rank
 *                       - thumb
 *                       - large
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Унікальний ID монети
 *                         example: bitcoin
 *                       name:
 *                         type: string
 *                         description: Назва монети
 *                         example: Bitcoin
 *                       symbol:
 *                         type: string
 *                         description: Символ (тікер) монети
 *                         example: BTC
 *                       market_cap_rank:
 *                         type: number
 *                         nullable: true
 *                         description: Ранг за ринковою капіталізацією
 *                         example: 1
 *                       thumb:
 *                         type: string
 *                         description: URL мініатюри зображення монети
 *                         example: https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png
 *                       large:
 *                         type: string
 *                         description: URL великого зображення монети
 *                         example: https://assets.coingecko.com/coins/images/1/large/bitcoin.png
 *                 exchanges:
 *                   type: array
 *                   description: Знайдені біржі
 *                   items:
 *                     type: object
 *                   example: []
 *                 icos:
 *                   type: array
 *                   description: Знайдені ICO
 *                   items:
 *                     type: object
 *                   example: []
 *                 categories:
 *                   type: array
 *                   description: Знайдені категорії
 *                   items:
 *                     type: object
 *                   example: []
 *       400:
 *         description: Відсутній обов'язковий параметр пошуку
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bad request: 'query' parameter is required"
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
 * /coingecko/api-usage:
 *   get:
 *     summary: Отримати статистику використання CoinGecko API
 *     description: Повертає інформацію про поточне використання API - план, ліміти та кількість запитів
 *     tags: [Coin Diviner AI - CoinGecko]
 *     responses:
 *       200:
 *         description: Статистика API успішно отримана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 plan:
 *                   type: string
 *                   description: Тарифний план
 *                   example: Other
 *                 rate_limit_request_per_minute:
 *                   type: number
 *                   description: Ліміт запитів на хвилину
 *                   example: 1000
 *                 monthly_call_credit:
 *                   type: number
 *                   description: Місячний кредит запитів
 *                   example: 1000000
 *                 current_total_monthly_calls:
 *                   type: number
 *                   description: Загальна кількість запитів за поточний місяць
 *                   example: 104
 *                 current_remaining_monthly_calls:
 *                   type: number
 *                   description: Залишилось запитів за місяць
 *                   example: 999896
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
