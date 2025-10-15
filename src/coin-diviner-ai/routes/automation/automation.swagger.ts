/**
 * @swagger
 * tags:
 *   name: Automation
 *   description: Автоматизація перевірки крипти
 */

/**
 * @swagger
 * /coin-diviner-ai/automation/create:
 *   post:
 *     summary: Створити нову автоматизацію
 *     tags: [Automation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coinId
 *               - type
 *               - target_price
 *             properties:
 *               coinId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [price_drop, price_rise]
 *               target_price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Автоматизацію створено
 *       400:
 *         description: Помилка валідації
 *       401:
 *         description: Не авторизовано
 *       404:
 *         description: Користувача або монету не знайдено
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /coin-diviner-ai/automation/list:
 *   get:
 *     summary: Отримати список автоматизацій користувача
 *     tags: [Automation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Фільтр по активності
 *       - in: query
 *         name: coinId
 *         schema:
 *           type: string
 *         description: Фільтр по монеті
 *     responses:
 *       200:
 *         description: Список автоматизацій
 *       401:
 *         description: Не авторизовано
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /coin-diviner-ai/automation/update:
 *   put:
 *     summary: Оновити автоматизацію
 *     tags: [Automation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - automationId
 *             properties:
 *               automationId:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               target_price:
 *                 type: number
 *               continuation_price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Автоматизацію оновлено
 *       400:
 *         description: Помилка валідації
 *       401:
 *         description: Не авторизовано
 *       404:
 *         description: Автоматизацію не знайдено
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /coin-diviner-ai/automation/delete/{automationId}:
 *   delete:
 *     summary: Видалити автоматизацію
 *     tags: [Automation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: automationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Автоматизацію видалено
 *       401:
 *         description: Не авторизовано
 *       404:
 *         description: Автоматизацію не знайдено
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /coin-diviner-ai/automation/by-id/{automationId}:
 *   get:
 *     summary: Отримати автоматизацію за ID
 *     tags: [Automation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: automationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Дані автоматизації
 *       401:
 *         description: Не авторизовано
 *       404:
 *         description: Автоматизацію не знайдено
 *       500:
 *         description: Помилка сервера
 */

/**
 * @swagger
 * /coin-diviner-ai/automation/continue:
 *   post:
 *     summary: Продовжити автоматизацію
 *     tags: [Automation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - automationId
 *             properties:
 *               automationId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Автоматизацію продовжено
 *       401:
 *         description: Не авторизовано
 *       404:
 *         description: Автоматизацію не знайдено
 *       500:
 *         description: Помилка сервера
 */
