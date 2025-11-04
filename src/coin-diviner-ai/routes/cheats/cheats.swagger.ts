/**
 * @swagger
 * /coin-diviner-ai/api/cheats/test:
 *   get:
 *     summary: Тестовий роут для перевірки роботи cheats функцій
 *     description: Виконує тестування функції getNewPumpTokens та повертає результат
 *     tags: [Coin Diviner AI - Cheats]
 *     responses:
 *       200:
 *         description: Роут працює успішно
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Повідомлення про успішне виконання
 *                   example: Cheats route is working!
 *       500:
 *         description: Помилка сервера або виконання функції
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Повідомлення про помилку
 *                   example: Failed to process request
 */
