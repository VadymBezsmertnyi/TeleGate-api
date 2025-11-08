/**
 * @swagger
 * components:
 *   schemas:
 *     SeamenEmailSendResult:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Адреса отримувача
 *         contactId:
 *           type: string
 *           description: Ідентифікатор контакту
 *         status:
 *           type: string
 *           enum: ["success", "failed"]
 *           description: Статус відправки для конкретного контакту
 *         error:
 *           type: string
 *           nullable: true
 *           description: Опис помилки, якщо відправка не вдалася
 *     SeamenEmailSendResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Підсумкове повідомлення
 *         results:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SeamenEmailSendResult'
 *   parameters:
 *     SeamenEmailPasswordToken:
 *       in: query
 *       name: passwordToken
 *       schema:
 *         type: string
 *       required: true
 *       description: Захисний код доступу до API
 */

/**
 * @swagger
 * /seamen/email/send:
 *   post:
 *     summary: Відправлення електронних листів через інтеграцію
 *     tags: [Seamen Emails]
 *     parameters:
 *       - $ref: '#/components/parameters/SeamenEmailPasswordToken'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - integrationId
 *               - companyId
 *               - to
 *               - subject
 *               - html
 *             properties:
 *               integrationId:
 *                 type: string
 *                 description: Ідентифікатор інтеграції
 *               companyId:
 *                 type: string
 *                 description: Ідентифікатор компанії
 *               to:
 *                 type: array
 *                 description: Список отримувачів
 *                 items:
 *                   type: string
 *                   format: email
 *               subject:
 *                 type: string
 *                 description: Тема листа
 *               html:
 *                 type: string
 *                 description: Вміст листа у форматі HTML
 *               templateId:
 *                 type: string
 *                 description: Ідентифікатор шаблону, якщо лист створено зі шаблону
 *     responses:
 *       200:
 *         description: Результати відправки листів
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SeamenEmailSendResponse'
 *       400:
 *         description: Некоректні параметри або дані запиту
 *       401:
 *         description: Невірний код доступу
 *       404:
 *         description: Інтеграцію або шаблон не знайдено
 *       500:
 *         description: Внутрішня помилка сервера
 */

