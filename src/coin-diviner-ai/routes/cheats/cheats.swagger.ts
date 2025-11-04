/**
 * @swagger
 * /cheats/moralis/new-pump-tokens:
 *   get:
 *     summary: Отримати нові pump токени через Moralis
 *     description: Виконує отримання нових pump токенів за допомогою Moralis API та повертає результат
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
