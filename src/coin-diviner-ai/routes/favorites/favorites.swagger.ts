/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: Управління улюбленими криптовалютами
 */

/**
 * @swagger
 * /coin-diviner-ai/favorites/add:
 *   post:
 *     summary: Додати криптовалюту до улюблених
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coinId
 *             properties:
 *               coinId:
 *                 type: string
 *                 description: ID криптовалюти
 *                 example: 68e9d873ac6c781907849713
 *     responses:
 *       200:
 *         description: Криптовалюту додано до улюблених
 *       400:
 *         description: Помилка валідації або монета вже в улюблених
 *       401:
 *         description: Не авторизовано
 *       404:
 *         description: Користувача або монету не знайдено
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /coin-diviner-ai/favorites/list:
 *   get:
 *     summary: Отримати список улюблених криптовалют
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: view
 *         schema:
 *           type: string
 *           enum: [main, all]
 *         description: |
 *           Режим відображення даних:
 *           - main: тільки дані улюблених (без populate, швидший запит)
 *           - all: з повними даними про криптовалюту (включає populate)
 *         example: all
 *     responses:
 *       200:
 *         description: Список улюблених криптовалют
 *       401:
 *         description: Не авторизовано
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /coin-diviner-ai/favorites/remove/{coinId}:
 *   delete:
 *     summary: Видалити криптовалюту з улюблених
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: coinId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID криптовалюти
 *         example: 68e9d873ac6c781907849713
 *     responses:
 *       200:
 *         description: Криптовалюту видалено з улюблених
 *       401:
 *         description: Не авторизовано
 *       404:
 *         description: Улюблену криптовалюту не знайдено
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /coin-diviner-ai/favorites/check/{coinId}:
 *   get:
 *     summary: Перевірити чи є криптовалюта в улюблених
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: coinId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID криптовалюти
 *         example: 68e9d873ac6c781907849713
 *     responses:
 *       200:
 *         description: Статус улюбленої криптовалюти
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 isFavorite:
 *                   type: boolean
 *                   description: Чи є монета в улюблених
 *       401:
 *         description: Не авторизовано
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /coin-diviner-ai/favorites/toggle:
 *   post:
 *     summary: Перемикнути статус улюбленої криптовалюти (додати або видалити)
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coinId
 *             properties:
 *               coinId:
 *                 type: string
 *                 description: ID криптовалюти
 *                 example: 68e9d873ac6c781907849713
 *     responses:
 *       200:
 *         description: Статус улюбленої криптовалюти змінено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 isFavorite:
 *                   type: boolean
 *                   description: Новий статус (true = додано, false = видалено)
 *       400:
 *         description: Помилка валідації
 *       401:
 *         description: Не авторизовано
 *       404:
 *         description: Користувача або монету не знайдено
 *       500:
 *         description: Помилка сервера
 */
