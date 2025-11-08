/**
 * @swagger
 * components:
 *   schemas:
 *     SeamenTemplate:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Ідентифікатор шаблону
 *           example: "650f1c2a9b1d4f00123abcd4"
 *         name:
 *           type: string
 *           description: Назва шаблону
 *           example: "Лист-запрошення"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Короткий опис шаблону
 *           example: "Використовується для перших контактів із судноплавними компаніями"
 *         content:
 *           type: string
 *           description: Основний вміст листа у форматі HTML
 *           example: "<p>Доброго дня...</p>"
 *         urls:
 *           type: array
 *           description: Пов'язані посилання
 *           items:
 *             type: string
 *           example:
 *             - "https://example.com/manual"
 *             - "https://example.com/presentation"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Дата створення
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Дата останнього оновлення
 *     SeamenTemplateCreateRequest:
 *       type: object
 *       required:
 *         - name
 *         - content
 *       properties:
 *         name:
 *           type: string
 *           description: Назва шаблону
 *           example: "Лист-запрошення"
 *         description:
 *           type: string
 *           nullable: true
 *           description: Короткий опис шаблону
 *           example: "Використовується для перших контактів із судноплавними компаніями"
 *         content:
 *           type: string
 *           description: Основний вміст листа у форматі HTML
 *           example: "<p>Доброго дня...</p>"
 *         urls:
 *           type: array
 *           description: Пов'язані посилання
 *           items:
 *             type: string
 *           example:
 *             - "https://example.com/manual"
 *             - "https://example.com/presentation"
 *     SeamenTemplateUpdateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Назва шаблону
 *         description:
 *           type: string
 *           nullable: true
 *           description: Короткий опис шаблону
 *         content:
 *           type: string
 *           description: Основний вміст листа у форматі HTML
 *         urls:
 *           type: array
 *           description: Пов'язані посилання
 *           items:
 *             type: string
 *   parameters:
 *     SeamenPasswordToken:
 *       in: query
 *       name: passwordToken
 *       schema:
 *         type: string
 *       required: true
 *       description: Захисний код доступу до API
 */

/**
 * @swagger
 * /seamen/template/all:
 *   get:
 *     summary: Отримання списку шаблонів листів
 *     tags: [Seamen Templates]
 *     parameters:
 *       - $ref: '#/components/parameters/SeamenPasswordToken'
 *     responses:
 *       200:
 *         description: Успішне отримання списку шаблонів
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SeamenTemplate'
 *       400:
 *         description: Некоректні параметри запиту
 *       401:
 *         description: Невірний код доступу
 *       500:
 *         description: Внутрішня помилка сервера
 */

/**
 * @swagger
 * /seamen/template/by-id/{id}:
 *   get:
 *     summary: Отримання шаблону за ідентифікатором
 *     tags: [Seamen Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Ідентифікатор шаблону
 *       - $ref: '#/components/parameters/SeamenPasswordToken'
 *     responses:
 *       200:
 *         description: Шаблон успішно знайдено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SeamenTemplate'
 *       400:
 *         description: Некоректні параметри запиту
 *       401:
 *         description: Невірний код доступу
 *       404:
 *         description: Шаблон не знайдено
 *       500:
 *         description: Внутрішня помилка сервера
 */

/**
 * @swagger
 * /seamen/template/create:
 *   post:
 *     summary: Створення нового шаблону листа
 *     tags: [Seamen Templates]
 *     parameters:
 *       - $ref: '#/components/parameters/SeamenPasswordToken'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SeamenTemplateCreateRequest'
 *     responses:
 *       201:
 *         description: Шаблон успішно створено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SeamenTemplate'
 *       400:
 *         description: Некоректні дані запиту
 *       401:
 *         description: Невірний код доступу
 *       500:
 *         description: Внутрішня помилка сервера
 */

/**
 * @swagger
 * /seamen/template/update/{id}:
 *   put:
 *     summary: Оновлення існуючого шаблону листа
 *     tags: [Seamen Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Ідентифікатор шаблону
 *       - $ref: '#/components/parameters/SeamenPasswordToken'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SeamenTemplateUpdateRequest'
 *     responses:
 *       200:
 *         description: Шаблон успішно оновлено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SeamenTemplate'
 *       400:
 *         description: Некоректні дані запиту
 *       401:
 *         description: Невірний код доступу
 *       404:
 *         description: Шаблон не знайдено
 *       500:
 *         description: Внутрішня помилка сервера
 */

/**
 * @swagger
 * /seamen/template/delete/{id}:
 *   delete:
 *     summary: Видалення шаблону листа
 *     tags: [Seamen Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Ідентифікатор шаблону
 *       - $ref: '#/components/parameters/SeamenPasswordToken'
 *     responses:
 *       200:
 *         description: Шаблон успішно видалено
 *       400:
 *         description: Некоректні параметри запиту
 *       401:
 *         description: Невірний код доступу
 *       404:
 *         description: Шаблон не знайдено
 *       500:
 *         description: Внутрішня помилка сервера
 */

