/**
 * @swagger
 * /users/push-tokens:
 *   post:
 *     summary: Реєстрація push-токена користувача
 *     description: Реєструє новий push-токен для отримання сповіщень на конкретній платформі
 *     tags: [Users Push Tokens]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PushToken'
 *           example:
 *             token: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
 *             platform: "ios"
 *     responses:
 *       201:
 *         description: Токен успішно зареєстровано
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               message: "Push token registered successfully"
 *       200:
 *         description: Токен успішно оновлено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               message: "Token updated successfully"
 *       400:
 *         description: Помилка валідації
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Неавторизований запит
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Користувач не знайдений
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Токен вже існує для іншого користувача
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Внутрішня помилка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /users/push-tokens/{token}:
 *   delete:
 *     summary: Видалення push-токена користувача
 *     description: Видаляє push-токен користувача за токеном
 *     tags: [Users Push Tokens]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Push-токен для видалення
 *         example: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
 *     responses:
 *       200:
 *         description: Токен успішно видалено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               message: "Push token deleted successfully"
 *       400:
 *         description: Токен не вказано
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Неавторизований запит
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Користувач або токен не знайдений
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Внутрішня помилка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /users/push-tokens:
 *   get:
 *     summary: Отримання push-токенів користувача
 *     description: Повертає всі активні push-токени поточного користувача
 *     tags: [Users Push Tokens]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Список push-токенів успішно отримано
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Push tokens retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PushTokenResponse'
 *       401:
 *         description: Неавторизований запит
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Користувач не знайдений
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Внутрішня помилка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /users/push-tokens/test-notification:
 *   post:
 *     summary: Відправка тестового push-повідомлення всім користувачам
 *     description: Відправляє тестове push-повідомлення всім користувачам з активними токенами
 *     tags: [Users Push Tokens]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *                 description: Текст повідомлення
 *                 example: "Це тестове повідомлення"
 *               title:
 *                 type: string
 *                 description: Заголовок повідомлення (необов'язково)
 *                 example: "TeleGate Test"
 *     responses:
 *       200:
 *         description: Тестове повідомлення успішно відправлено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Test notification sent successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalTokens:
 *                       type: number
 *                       description: Загальна кількість токенів
 *                       example: 10
 *                     successCount:
 *                       type: number
 *                       description: Кількість успішно відправлених повідомлень
 *                       example: 8
 *                     failureCount:
 *                       type: number
 *                       description: Кількість невдалих відправлень
 *                       example: 2
 *                     sentMessage:
 *                       type: string
 *                       description: Відправлений текст повідомлення
 *                       example: "Це тестове повідомлення"
 *                     sentTitle:
 *                       type: string
 *                       description: Відправлений заголовок повідомлення
 *                       example: "TeleGate"
 *       400:
 *         description: Помилка валідації
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Неавторизований запит
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Користувач не знайдений або немає активних токенів
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Внутрішня помилка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
