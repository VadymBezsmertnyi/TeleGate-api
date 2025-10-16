/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Управління сповіщеннями користувачів
 */

/**
 * @swagger
 * /coin-diviner-ai/api/notification/create:
 *   post:
 *     summary: Створити нове сповіщення
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - message
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [push, sms, telegram]
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               metadata:
 *                 type: object
 *                 properties:
 *                   pushToken:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *                   telegramChatId:
 *                     type: string
 *     responses:
 *       201:
 *         description: Сповіщення успішно створено
 *       400:
 *         description: Помилка валідації
 *       401:
 *         description: Не авторизовано
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /coin-diviner-ai/api/notification/send:
 *   post:
 *     summary: Відправити сповіщення
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notificationId
 *             properties:
 *               notificationId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Сповіщення успішно відправлено
 *       400:
 *         description: Помилка валідації
 *       401:
 *         description: Не авторизовано
 *       404:
 *         description: Сповіщення не знайдено
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /coin-diviner-ai/api/notification/list:
 *   get:
 *     summary: Отримати список сповіщень користувача
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [push, sms, telegram]
 *         description: Фільтр за типом сповіщення
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, sent, failed]
 *         description: Фільтр за статусом
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Кількість записів
 *     responses:
 *       200:
 *         description: Список сповіщень успішно отримано
 *       401:
 *         description: Не авторизовано
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /coin-diviner-ai/api/notification/by-id/{notificationId}:
 *   get:
 *     summary: Отримати сповіщення за ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Сповіщення успішно отримано
 *       401:
 *         description: Не авторизовано
 *       404:
 *         description: Сповіщення не знайдено
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /coin-diviner-ai/api/notification/update/{notificationId}:
 *   put:
 *     summary: Оновити сповіщення
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, sent, failed]
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               metadata:
 *                 type: object
 *                 properties:
 *                   pushToken:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *                   telegramChatId:
 *                     type: string
 *                   errorCode:
 *                     type: string
 *                   errorMessage:
 *                     type: string
 *     responses:
 *       200:
 *         description: Сповіщення успішно оновлено
 *       400:
 *         description: Помилка валідації
 *       401:
 *         description: Не авторизовано
 *       404:
 *         description: Сповіщення не знайдено
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /coin-diviner-ai/api/notification/delete/{notificationId}:
 *   delete:
 *     summary: Видалити сповіщення
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Сповіщення успішно видалено
 *       401:
 *         description: Не авторизовано
 *       404:
 *         description: Сповіщення не знайдено
 *       500:
 *         description: Помилка сервера
 */
