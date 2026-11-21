/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Отримання профілю поточного користувача
 *     description: Повертає дані поточного авторизованого користувача
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Дані користувача успішно отримано
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             example:
 *               id: 123456789
 *               username: "john_doe"
 *               first_name: "John"
 *               last_name: "Doe"
 *               photo_url: "https://t.me/i/userpic/320/john_doe.jpg"
 *       401:
 *         description: Неавторизований запит
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
 * /users/me/full:
 *   get:
 *     summary: Отримання повного профілю користувача
 *     description: Повертає повні дані користувача включаючи групи та учасників
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Повні дані користувача успішно отримано
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     members:
 *                       type: array
 *                       items:
 *                         type: object
 *                     groups:
 *                       type: array
 *                       items:
 *                         type: object
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
