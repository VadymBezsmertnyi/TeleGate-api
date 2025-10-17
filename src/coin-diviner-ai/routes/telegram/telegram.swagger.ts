/**
 * @swagger
 * /telegram/webhook:
 *   post:
 *     summary: Отримати оновлення від Telegram бота
 *     description: Ендпоінт для прийому вебхуків від Telegram Bot API. Обробляє всі вхідні повідомлення, команди та події від користувачів бота Coin Diviner AI
 *     tags: [Coin Diviner AI - Telegram]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Об'єкт Update від Telegram API
 *             properties:
 *               update_id:
 *                 type: number
 *                 description: Унікальний ідентифікатор оновлення
 *                 example: 123456789
 *               message:
 *                 type: object
 *                 description: Нове вхідне повідомлення
 *                 properties:
 *                   message_id:
 *                     type: number
 *                   from:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       first_name:
 *                         type: string
 *                       username:
 *                         type: string
 *                   chat:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       type:
 *                         type: string
 *                   text:
 *                     type: string
 *                     description: Текст повідомлення
 *                   date:
 *                     type: number
 *                     description: Unix timestamp
 *     responses:
 *       200:
 *         description: Вебхук успішно оброблено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Webhook received
 *       500:
 *         description: Помилка сервера або відсутній токен бота
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 *                 code:
 *                   type: string
 *                   example: SERVER_ERROR
 */

/**
 * @swagger
 * /telegram/set-webhook:
 *   post:
 *     summary: Встановити URL вебхука для Telegram бота
 *     description: Налаштовує URL вебхука для Telegram Bot API через метод setWebhook. Після налаштування всі оновлення від бота будуть надходити на вказану адресу
 *     tags: [Coin Diviner AI - Telegram]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - webhookUrl
 *             properties:
 *               webhookUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL вебхука (має бути HTTPS). Telegram буде надсилати POST запити з оновленнями на цю адресу
 *                 example: https://your-domain.com/coin-diviner-ai/api/telegram/webhook
 *     responses:
 *       200:
 *         description: Вебхук успішно встановлено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Вебхук встановлено успішно
 *                 webhookUrl:
 *                   type: string
 *                   example: https://your-domain.com/coin-diviner-ai/api/telegram/webhook
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
 *                 code:
 *                   type: string
 *                   example: VALIDATION_ERROR
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Помилка налаштування вебхука
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to set webhook
 *                 code:
 *                   type: string
 *                   example: WEBHOOK_SETUP_FAILED
 *                 details:
 *                   type: string
 */
