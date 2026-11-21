/**
 * @swagger
 * tags:
 *   name: User Balance
 *   description: Управління балансом користувача та транзакціями
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserBalanceTransaction:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID транзакції
 *         type:
 *           type: string
 *           enum: [deposit, withdrawal]
 *           description: Тип транзакції
 *         amount:
 *           type: number
 *           description: Сума транзакції
 *         description:
 *           type: string
 *           description: Опис транзакції
 *         date:
 *           type: string
 *           format: date-time
 *           description: Дата транзакції
 *
 *     UserBalance:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID балансу
 *         userId:
 *           type: string
 *           description: ID користувача
 *         balance:
 *           type: number
 *           description: Поточний баланс
 *         transactions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UserBalanceTransaction'
 *           description: Список транзакцій
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     AddTransactionRequest:
 *       type: object
 *       required:
 *         - type
 *         - amount
 *       properties:
 *         type:
 *           type: string
 *           enum: [deposit, withdrawal]
 *           description: Тип транзакції
 *         amount:
 *           type: number
 *           description: Сума транзакції
 *         description:
 *           type: string
 *           description: Опис транзакції (необов'язково)
 *
 *     UserBalanceResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           $ref: '#/components/schemas/UserBalance'
 */

/**
 * @swagger
 * /coin-diviner-ai/api/user-balance/add-transaction:
 *   post:
 *     summary: Додати транзакцію до балансу
 *     tags: [User Balance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddTransactionRequest'
 *     responses:
 *       200:
 *         description: Транзакція додана успішно
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserBalanceResponse'
 *       400:
 *         description: Помилка валідації
 *       401:
 *         description: Не авторизовано
 *       404:
 *         description: Користувач не знайдений
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /coin-diviner-ai/api/user-balance/get-balance:
 *   get:
 *     summary: Отримати баланс користувача
 *     tags: [User Balance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Баланс отримано успішно
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserBalanceResponse'
 *       401:
 *         description: Не авторизовано
 *       404:
 *         description: Користувач не знайдений
 *       500:
 *         description: Помилка сервера
 */
