/**
 * @swagger
 * /auth/login:
 *   get:
 *     summary: Авторизація адміністратора
 *     description: Перевіряє логін та пароль адміністратора для Coin Diviner AI
 *     tags: [Coin Diviner AI - Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - login
 *               - password
 *             properties:
 *               login:
 *                 type: string
 *                 description: Логін адміністратора
 *               password:
 *                 type: string
 *                 description: Пароль адміністратора
 *     responses:
 *       200:
 *         description: Успішна авторизація
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *       401:
 *         description: Невірні облікові дані
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 *       500:
 *         description: Помилка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
