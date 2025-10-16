/**
 * @swagger
 * /notification/settings:
 *   get:
 *     summary: Отримати налаштування сповіщень
 *     description: Повертає налаштування сповіщень для авторизованого користувача
 *     tags: [Coin Diviner AI - Notification]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Налаштування сповіщень отримано
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439011
 *                     userId:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439011
 *                     pushTokens:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           token:
 *                             type: string
 *                           platform:
 *                             type: string
 *                             enum: [ios, android, web]
 *                           deviceId:
 *                             type: string
 *                     smsPhone:
 *                       type: string
 *                       nullable: true
 *                       example: +380123456789
 *                     telegramChatId:
 *                       type: string
 *                       nullable: true
 *                       example: 123456789
 *                     enabledTypes:
 *                       type: object
 *                       properties:
 *                         push:
 *                           type: boolean
 *                         sms:
 *                           type: boolean
 *                         telegram:
 *                           type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Відсутній або невірний токен
 *       500:
 *         description: Помилка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Server error
 *                 code:
 *                   type: number
 *                   example: 2005
 *                 message:
 *                   type: string
 *                   example: Server error
 */

/**
 * @swagger
 * /notification/settings:
 *   put:
 *     summary: Оновити налаштування сповіщень
 *     description: Оновлює налаштування сповіщень для авторизованого користувача
 *     tags: [Coin Diviner AI - Notification]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               smsPhone:
 *                 type: string
 *                 nullable: true
 *                 example: +380123456789
 *               telegramChatId:
 *                 type: string
 *                 nullable: true
 *                 example: 123456789
 *               enabledTypes:
 *                 type: object
 *                 properties:
 *                   push:
 *                     type: boolean
 *                   sms:
 *                     type: boolean
 *                   telegram:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Налаштування успішно оновлено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notification settings updated successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Помилка валідації даних
 *       401:
 *         description: Відсутній або невірний токен
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /notification/push-token:
 *   post:
 *     summary: Додати або оновити push токен
 *     description: Додає новий або оновлює існуючий push токен для авторизованого користувача
 *     tags: [Coin Diviner AI - Notification]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - platform
 *             properties:
 *               token:
 *                 type: string
 *                 description: Firebase push токен
 *               platform:
 *                 type: string
 *                 enum: [ios, android, web]
 *                 description: Платформа пристрою
 *               deviceId:
 *                 type: string
 *                 description: ID пристрою (опціонально)
 *     responses:
 *       200:
 *         description: Push токен успішно додано або оновлено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Push token added successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Помилка валідації даних
 *       401:
 *         description: Відсутній або невірний токен
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /notification/push-token:
 *   delete:
 *     summary: Видалити push токен
 *     description: Видаляє push токен для авторизованого користувача
 *     tags: [Coin Diviner AI - Notification]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Firebase push токен для видалення
 *     responses:
 *       200:
 *         description: Push токен успішно видалено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Push token removed successfully
 *       400:
 *         description: Помилка валідації даних
 *       401:
 *         description: Відсутній або невірний токен
 *       404:
 *         description: Push токен не знайдено
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /notification/send:
 *   post:
 *     summary: Відправити сповіщення користувачу
 *     description: Відправляє сповіщення користувачу через обрані канали (push, sms, telegram)
 *     tags: [Coin Diviner AI - Notification]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - title
 *               - body
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID користувача
 *                 example: 507f1f77bcf86cd799439011
 *               title:
 *                 type: string
 *                 description: Заголовок сповіщення
 *                 example: Нове повідомлення
 *               body:
 *                 type: string
 *                 description: Текст сповіщення
 *                 example: У вас нове повідомлення від системи
 *               data:
 *                 type: object
 *                 description: Додаткові дані (опціонально)
 *               types:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [push, sms, telegram]
 *                 description: Типи сповіщень для відправки
 *                 default: [push]
 *     responses:
 *       200:
 *         description: Сповіщення успішно відправлено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notification sent successfully
 *                 results:
 *                   type: object
 *                   properties:
 *                     push:
 *                       type: object
 *                     sms:
 *                       type: object
 *                     telegram:
 *                       type: object
 *       400:
 *         description: Помилка валідації даних
 *       401:
 *         description: Відсутній або невірний токен
 *       404:
 *         description: Налаштування користувача не знайдено
 *       500:
 *         description: Помилка сервера
 */
