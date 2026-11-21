/**
 * @swagger
 * tags:
 *   name: Coin Diviner AI - Prediction
 *   description: AI-прогнозування для криптовалют на основі OpenAI
 */

/**
 * @swagger
 * /prediction/generate:
 *   get:
 *     summary: Генерація AI-прогнозу для криптовалюти
 *     description: Створює детальний прогноз за допомогою OpenAI на основі даних токена та ринкових умов
 *     tags: [Coin Diviner AI - Prediction]
 *     parameters:
 *       - in: query
 *         name: coinId
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: MongoDB _id монети з бази даних
 *         example: 68ea23d7ac6c781907849a6c
 *       - in: query
 *         name: language
 *         required: false
 *         schema:
 *           type: string
 *           enum: [uk, en]
 *           default: uk
 *         description: Мова відповіді (українська або англійська)
 *         example: uk
 *     responses:
 *       200:
 *         description: AI-прогноз успішно згенеровано
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: Повний запис передбачення з бази даних
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: ID передбачення
 *                       example: 68ea23d7ac6c781907849a6c
 *                     userId:
 *                       type: string
 *                       description: ID користувача
 *                       example: 68ea23d7ac6c781907849a6d
 *                     coinId:
 *                       type: string
 *                       description: ID монети
 *                       example: 68ea23d7ac6c781907849a6e
 *                     language:
 *                       type: string
 *                       description: Мова прогнозу
 *                       example: uk
 *                     status:
 *                       type: string
 *                       enum: [creating, fetching_data, generating, completed, error]
 *                       description: Статус генерації прогнозу
 *                       example: completed
 *                     prediction:
 *                       type: object
 *                       nullable: true
 *                       description: Структурований AI-прогноз
 *                       properties:
 *                         user_position:
 *                           type: object
 *                           description: Позиція користувача по токену
 *                           properties:
 *                             has_token:
 *                               type: boolean
 *                               description: Чи володіє користувач токеном
 *                             token_amount:
 *                               type: number
 *                               nullable: true
 *                               description: Кількість токенів
 *                             token_buy_price:
 *                               type: number
 *                               nullable: true
 *                               description: Середня ціна покупки (USD)
 *                         forecast:
 *                           type: object
 *                           description: Прогноз руху ціни
 *                           properties:
 *                             next_rise_date:
 *                               type: string
 *                               format: date-time
 *                               nullable: true
 *                               description: Дата ймовірного росту
 *                             next_rise_in_days:
 *                               type: number
 *                               nullable: true
 *                               description: Через скільки днів підйом
 *                             next_fall_date:
 *                               type: string
 *                               format: date-time
 *                               nullable: true
 *                               description: Дата ймовірного падіння
 *                             next_fall_in_days:
 *                               type: number
 *                               nullable: true
 *                               description: Через скільки днів падіння
 *                         recommendation:
 *                           type: object
 *                           description: Рекомендації купівлі/продажу
 *                           properties:
 *                             buy_now:
 *                               type: boolean
 *                               description: Чи варто купити зараз
 *                             buy_confidence:
 *                               type: number
 *                               description: Впевненість у рекомендації (0-100%)
 *                             buy_message:
 *                               type: string
 *                               description: Пояснення рекомендації
 *                             sell_now:
 *                               type: boolean
 *                               description: Чи варто продати зараз
 *                             sell_confidence:
 *                               type: number
 *                               description: Впевненість у рекомендації (0-100%)
 *                             sell_message:
 *                               type: string
 *                               description: Пояснення рекомендації
 *                         market_context:
 *                           type: object
 *                           description: Контекст ринку
 *                           properties:
 *                             sentiment:
 *                               type: string
 *                               enum: [bullish, bearish, neutral]
 *                               description: Загальний настрій ринку
 *                             btc_trend:
 *                               type: string
 *                               enum: [up, down, neutral]
 *                               description: Тренд BTC
 *                             altcoin_trend:
 *                               type: string
 *                               enum: [up, down, neutral]
 *                               description: Тренд альткоїнів
 *                             political_impact:
 *                               type: string
 *                               description: Політичний вплив
 *                             meme_factor:
 *                               type: string
 *                               description: Вплив мем-ринку
 *                             community_activity:
 *                               type: string
 *                               enum: [high, medium, low]
 *                               description: Активність спільноти
 *                             news_sentiment:
 *                               type: string
 *                               enum: [positive, neutral, negative]
 *                               description: Тональність новин
 *                             analysis_summary:
 *                               type: string
 *                               description: Короткий огляд ринку
 *                         risk_and_influence:
 *                           type: object
 *                           description: Ризики та впливи
 *                           properties:
 *                             risk_level:
 *                               type: string
 *                               enum: [low, medium, high]
 *                               description: Рівень ризику інвестиції
 *                             risk_factors:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               description: Фактори ризику
 *                             main_influences:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               description: Основні впливи на ціну
 *                             confidence_level:
 *                               type: number
 *                               description: Впевненість у прогнозі (0-100)
 *                         summary:
 *                           type: object
 *                           description: Підсумок
 *                           properties:
 *                             conclusion:
 *                               type: string
 *                               description: Короткий висновок у 1-2 реченнях
 *                             generated_at:
 *                               type: string
 *                               format: date-time
 *                               description: Дата генерації прогнозу
 *                     tokenData:
 *                       type: object
 *                       description: Дані токена, що використовувались для прогнозу
 *                     error:
 *                       type: string
 *                       nullable: true
 *                       description: Помилка (якщо status = error)
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Дата створення
 *                       example: 2025-10-14T10:30:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Дата останнього оновлення
 *                       example: 2025-10-14T10:30:15.000Z
 *       400:
 *         description: Помилка валідації
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validation error
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
 *                   example: Crypto coin not found
 *       500:
 *         description: Помилка сервера або генерації прогнозу
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */

/**
 * @swagger
 * /prediction/list:
 *   get:
 *     summary: Отримати список всіх передбачень користувача
 *     description: Повертає всі AI-прогнози поточного користувача, відсортовані за датою створення (найновіші спочатку)
 *     tags: [Coin Diviner AI - Prediction]
 *     responses:
 *       200:
 *         description: Список передбачень успішно отримано
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   description: Масив записів передбачень
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: ID передбачення
 *                         example: 68ea23d7ac6c781907849a6c
 *                       userId:
 *                         type: string
 *                         description: ID користувача
 *                         example: 68ea23d7ac6c781907849a6d
 *                       coinId:
 *                         type: string
 *                         description: ID монети
 *                         example: 68ea23d7ac6c781907849a6e
 *                       language:
 *                         type: string
 *                         description: Мова прогнозу
 *                         example: uk
 *                       status:
 *                         type: string
 *                         enum: [creating, fetching_data, generating, completed, error]
 *                         description: Статус генерації прогнозу
 *                         example: completed
 *                       prediction:
 *                         type: object
 *                         nullable: true
 *                         description: Об'єкт прогнозу (якщо status = completed)
 *                       tokenData:
 *                         type: object
 *                         description: Дані токена, що використовувались для прогнозу
 *                       error:
 *                         type: string
 *                         nullable: true
 *                         description: Помилка (якщо status = error)
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Дата створення
 *                         example: 2025-10-14T10:30:00.000Z
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Дата останнього оновлення
 *                         example: 2025-10-14T10:30:15.000Z
 *       401:
 *         description: Не авторизовано
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: Користувача не знайдено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Помилка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */

/**
 * @swagger
 * /prediction/by-id/{predictionId}:
 *   get:
 *     summary: Отримати передбачення за ID
 *     description: Повертає конкретне AI-передбачення користувача за його ID
 *     tags: [Coin Diviner AI - Prediction]
 *     parameters:
 *       - in: path
 *         name: predictionId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB _id передбачення
 *         example: 68ea23d7ac6c781907849a6c
 *     responses:
 *       200:
 *         description: Передбачення успішно отримано
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: Запис передбачення з усіма деталями
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: ID передбачення
 *                       example: 68ea23d7ac6c781907849a6c
 *                     userId:
 *                       type: string
 *                       description: ID користувача
 *                       example: 68ea23d7ac6c781907849a6d
 *                     coinId:
 *                       type: string
 *                       description: ID монети
 *                       example: 68ea23d7ac6c781907849a6e
 *                     language:
 *                       type: string
 *                       description: Мова прогнозу
 *                       example: uk
 *                     status:
 *                       type: string
 *                       enum: [creating, fetching_data, generating, completed, error]
 *                       description: Статус генерації прогнозу
 *                       example: completed
 *                     prediction:
 *                       type: object
 *                       nullable: true
 *                       description: Повний об'єкт AI-прогнозу (структура як у /generate)
 *                       properties:
 *                         user_position:
 *                           type: object
 *                         forecast:
 *                           type: object
 *                         recommendation:
 *                           type: object
 *                         market_context:
 *                           type: object
 *                         risk_and_influence:
 *                           type: object
 *                         summary:
 *                           type: object
 *                     tokenData:
 *                       type: object
 *                       description: Дані токена, що використовувались для прогнозу
 *                     error:
 *                       type: string
 *                       nullable: true
 *                       description: Помилка (якщо status = error)
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Дата створення
 *                       example: 2025-10-14T10:30:00.000Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Дата останнього оновлення
 *                       example: 2025-10-14T10:30:15.000Z
 *       400:
 *         description: Помилка валідації
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validation error
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Не авторизовано
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: Передбачення не знайдено або не належить користувачу
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Prediction not found
 *       500:
 *         description: Помилка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */
