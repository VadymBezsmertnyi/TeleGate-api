/**
 * @swagger
 * /auth-telegram/login:
 *   get:
 *     summary: Авторизація через Telegram
 *     description: Перенаправляє користувача на Telegram OAuth для авторизації
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Перенаправлення на Telegram OAuth
 *       500:
 *         description: Помилка конфігурації бота
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
