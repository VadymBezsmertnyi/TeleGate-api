/**
 * @swagger
 * tags:
 *   name: Portfolio
 *   description: Управління портфелем криптовалют користувача
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID транзакції
 *         amount_usd:
 *           type: number
 *           description: Сума в доларах США
 *         amount_crypto:
 *           type: number
 *           description: Кількість криптовалюти
 *         price_per_unit:
 *           type: number
 *           description: Ціна за одиницю
 *         date:
 *           type: string
 *           format: date-time
 *           description: Дата транзакції
 *
 *     Portfolio:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID портфоліо
 *         userId:
 *           type: string
 *           description: ID користувача
 *         coinId:
 *           type: string
 *           description: ID криптовалюти
 *         purchases:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Transaction'
 *           description: Список покупок
 *         sales:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Transaction'
 *           description: Список продажів
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateOrUpdatePortfolioRequest:
 *       type: object
 *       required:
 *         - coinId
 *         - amount_usd
 *         - amount_crypto
 *         - price_per_unit
 *       properties:
 *         coinId:
 *           type: string
 *           description: ID криптовалюти
 *         amount_usd:
 *           type: number
 *           description: Сума в доларах США
 *         amount_crypto:
 *           type: number
 *           description: Кількість криптовалюти
 *         price_per_unit:
 *           type: number
 *           description: Ціна за одиницю
 *
 *     AddTransactionRequest:
 *       type: object
 *       required:
 *         - portfolioId
 *         - amount_usd
 *         - amount_crypto
 *         - price_per_unit
 *       properties:
 *         portfolioId:
 *           type: string
 *           description: ID портфоліо
 *         amount_usd:
 *           type: number
 *           description: Сума в доларах США
 *         amount_crypto:
 *           type: number
 *           description: Кількість криптовалюти
 *         price_per_unit:
 *           type: number
 *           description: Ціна за одиницю
 *
 *     UpdateTransactionRequest:
 *       type: object
 *       required:
 *         - portfolioId
 *         - transactionId
 *         - transactionType
 *         - amount_usd
 *         - amount_crypto
 *         - price_per_unit
 *       properties:
 *         portfolioId:
 *           type: string
 *           description: ID портфоліо
 *         transactionId:
 *           type: string
 *           description: ID транзакції
 *         transactionType:
 *           type: string
 *           enum: [purchase, sale]
 *           description: Тип транзакції
 *         amount_usd:
 *           type: number
 *           description: Сума в доларах США
 *         amount_crypto:
 *           type: number
 *           description: Кількість криптовалюти
 *         price_per_unit:
 *           type: number
 *           description: Ціна за одиницю
 *
 *     DeleteTransactionRequest:
 *       type: object
 *       required:
 *         - portfolioId
 *         - transactionId
 *         - transactionType
 *       properties:
 *         portfolioId:
 *           type: string
 *           description: ID портфоліо
 *         transactionId:
 *           type: string
 *           description: ID транзакції
 *         transactionType:
 *           type: string
 *           enum: [purchase, sale]
 *           description: Тип транзакції
 *
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /coin-diviner-ai/api/portfolio/create-or-update:
 *   post:
 *     summary: Створити або оновити портфоліо
 *     tags: [Portfolio]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrUpdatePortfolioRequest'
 *     responses:
 *       200:
 *         description: Портфоліо успішно створено або оновлено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Portfolio'
 *       400:
 *         description: Помилка валідації
 *       401:
 *         description: Не авторизовано
 *       404:
 *         description: Користувача або монету не знайдено
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /coin-diviner-ai/api/portfolio/add-purchase:
 *   post:
 *     summary: Додати покупку до портфоліо
 *     tags: [Portfolio]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddTransactionRequest'
 *     responses:
 *       200:
 *         description: Покупку успішно додано
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Portfolio'
 *       400:
 *         description: Помилка валідації
 *       401:
 *         description: Не авторизовано
 *       404:
 *         description: Портфоліо не знайдено
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /coin-diviner-ai/api/portfolio/add-sale:
 *   post:
 *     summary: Додати продаж до портфоліо
 *     tags: [Portfolio]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddTransactionRequest'
 *     responses:
 *       200:
 *         description: Продаж успішно додано
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Portfolio'
 *       400:
 *         description: Помилка валідації
 *       401:
 *         description: Не авторизовано
 *       404:
 *         description: Портфоліо не знайдено
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /coin-diviner-ai/api/portfolio/clear/{portfolioId}:
 *   delete:
 *     summary: Очистити портфоліо від покупок та продажів
 *     tags: [Portfolio]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: portfolioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID портфоліо
 *     responses:
 *       200:
 *         description: Портфоліо успішно очищено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Помилка валідації
 *       401:
 *         description: Не авторизовано
 *       404:
 *         description: Портфоліо не знайдено
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /coin-diviner-ai/api/portfolio/list:
 *   get:
 *     summary: Отримати всі портфоліо користувача
 *     tags: [Portfolio]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Список портфоліо
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Portfolio'
 *       401:
 *         description: Не авторизовано
 *       404:
 *         description: Користувача не знайдено
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /coin-diviner-ai/api/portfolio/by-id/{portfolioId}:
 *   get:
 *     summary: Отримати портфоліо за ID
 *     tags: [Portfolio]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: portfolioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID портфоліо
 *     responses:
 *       200:
 *         description: Дані портфоліо
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Portfolio'
 *       400:
 *         description: Помилка валідації
 *       401:
 *         description: Не авторизовано
 *       404:
 *         description: Портфоліо не знайдено
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /coin-diviner-ai/api/portfolio/update-transaction:
 *   patch:
 *     summary: Редагувати транзакцію в портфоліо
 *     tags: [Portfolio]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTransactionRequest'
 *     responses:
 *       200:
 *         description: Транзакцію успішно оновлено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Portfolio'
 *       400:
 *         description: Помилка валідації
 *       401:
 *         description: Не авторизовано
 *       404:
 *         description: Портфоліо або транзакцію не знайдено
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /coin-diviner-ai/api/portfolio/delete-transaction:
 *   delete:
 *     summary: Видалити транзакцію з портфоліо
 *     tags: [Portfolio]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeleteTransactionRequest'
 *     responses:
 *       200:
 *         description: Транзакцію успішно видалено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Помилка валідації
 *       401:
 *         description: Не авторизовано
 *       404:
 *         description: Портфоліо або транзакцію не знайдено
 *       500:
 *         description: Помилка сервера
 */
