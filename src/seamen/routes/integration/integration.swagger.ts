/**
 * @swagger
 * components:
 *   schemas:
 *     SeamenIntegrationEmailData:
 *       type: object
 *       required:
 *         - type
 *         - host
 *         - port
 *         - secure
 *         - user
 *         - pass
 *       properties:
 *         type:
 *           type: string
 *           enum: ["email"]
 *           description: Тип інтеграції
 *         host:
 *           type: string
 *           description: SMTP хост
 *           example: "smtp.example.com"
 *         port:
 *           type: number
 *           description: SMTP порт
 *           example: 465
 *         secure:
 *           type: boolean
 *           description: Використання захищеного з'єднання
 *           example: true
 *         user:
 *           type: string
 *           description: Логін користувача SMTP
 *           example: "mailer@example.com"
 *         pass:
 *           type: string
 *           description: Пароль користувача SMTP
 *           example: "secret_password"
 *     SeamenIntegration:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Ідентифікатор інтеграції
 *         name:
 *           type: string
 *           description: Назва інтеграції
 *         description:
 *           type: string
 *           nullable: true
 *           description: Опис інтеграції
 *         data:
 *           $ref: '#/components/schemas/SeamenIntegrationEmailData'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Дата створення
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Дата оновлення
 *     SeamenIntegrationCreateRequest:
 *       type: object
 *       required:
 *         - name
 *         - data
 *       properties:
 *         name:
 *           type: string
 *           description: Назва інтеграції
 *         description:
 *           type: string
 *           nullable: true
 *           description: Опис інтеграції
 *         data:
 *           $ref: '#/components/schemas/SeamenIntegrationEmailData'
 *     SeamenIntegrationUpdateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         data:
 *           $ref: '#/components/schemas/SeamenIntegrationEmailData'
 *   parameters:
 *     SeamenIntegrationPasswordToken:
 *       in: query
 *       name: passwordToken
 *       schema:
 *         type: string
 *       required: true
 *       description: Захисний код доступу до API
 */

/**
 * @swagger
 * /seamen/integration/all:
 *   get:
 *     summary: Отримання списку інтеграцій
 *     tags: [Seamen Integrations]
 *     parameters:
 *       - $ref: '#/components/parameters/SeamenIntegrationPasswordToken'
 *     responses:
 *       200:
 *         description: Успішне отримання списку інтеграцій
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SeamenIntegration'
 *       400:
 *         description: Некоректні параметри запиту
 *       401:
 *         description: Невірний код доступу
 *       500:
 *         description: Внутрішня помилка сервера
 */

/**
 * @swagger
 * /seamen/integration/by-id/{id}:
 *   get:
 *     summary: Отримання інтеграції за ідентифікатором
 *     tags: [Seamen Integrations]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Ідентифікатор інтеграції
 *       - $ref: '#/components/parameters/SeamenIntegrationPasswordToken'
 *     responses:
 *       200:
 *         description: Інтеграцію успішно знайдено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SeamenIntegration'
 *       400:
 *         description: Некоректні параметри запиту
 *       401:
 *         description: Невірний код доступу
 *       404:
 *         description: Інтеграцію не знайдено
 *       500:
 *         description: Внутрішня помилка сервера
 */

/**
 * @swagger
 * /seamen/integration/create:
 *   post:
 *     summary: Створення нової інтеграції
 *     tags: [Seamen Integrations]
 *     parameters:
 *       - $ref: '#/components/parameters/SeamenIntegrationPasswordToken'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SeamenIntegrationCreateRequest'
 *     responses:
 *       201:
 *         description: Інтеграцію успішно створено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SeamenIntegration'
 *       400:
 *         description: Некоректні дані запиту
 *       401:
 *         description: Невірний код доступу
 *       500:
 *         description: Внутрішня помилка сервера
 */

/**
 * @swagger
 * /seamen/integration/update/{id}:
 *   put:
 *     summary: Оновлення інтеграції
 *     tags: [Seamen Integrations]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Ідентифікатор інтеграції
 *       - $ref: '#/components/parameters/SeamenIntegrationPasswordToken'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SeamenIntegrationUpdateRequest'
 *     responses:
 *       200:
 *         description: Інтеграцію успішно оновлено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SeamenIntegration'
 *       400:
 *         description: Некоректні дані запиту
 *       401:
 *         description: Невірний код доступу
 *       404:
 *         description: Інтеграцію не знайдено
 *       500:
 *         description: Внутрішня помилка сервера
 */

/**
 * @swagger
 * /seamen/integration/delete/{id}:
 *   delete:
 *     summary: Видалення інтеграції
 *     tags: [Seamen Integrations]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Ідентифікатор інтеграції
 *       - $ref: '#/components/parameters/SeamenIntegrationPasswordToken'
 *     responses:
 *       200:
 *         description: Інтеграцію успішно видалено
 *       400:
 *         description: Некоректні параметри запиту
 *       401:
 *         description: Невірний код доступу
 *       404:
 *         description: Інтеграцію не знайдено
 *       500:
 *         description: Внутрішня помилка сервера
 */

