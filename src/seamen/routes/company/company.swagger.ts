/**
 * @swagger
 * components:
 *   schemas:
 *     SeamenCompanyContactSummary:
 *       type: object
 *       properties:
 *         contactId:
 *           type: string
 *           description: Ідентифікатор контакту
 *         fullName:
 *           type: string
 *           description: Ім'я контакту
 *         position:
 *           type: string
 *           nullable: true
 *           description: Посада
 *         email:
 *           type: string
 *           nullable: true
 *           description: Email контакту
 *         success:
 *           type: number
 *           description: Кількість успішних відправок
 *         failed:
 *           type: number
 *           description: Кількість невдалих відправок
 *     SeamenCompanyStatistics:
 *       type: object
 *       properties:
 *         contactCount:
 *           type: number
 *         successEmails:
 *           type: number
 *         failedEmails:
 *           type: number
 *     SeamenCompany:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Ідентифікатор компанії
 *         name:
 *           type: string
 *           description: Назва компанії
 *         category:
 *           type: string
 *           nullable: true
 *           description: Сфера діяльності
 *         website:
 *           type: string
 *           nullable: true
 *           description: Вебсайт компанії
 *         description:
 *           type: string
 *           nullable: true
 *           description: Опис компанії
 *         country:
 *           type: string
 *           nullable: true
 *           description: Країна
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         contacts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SeamenCompanyContactSummary'
 *         statistics:
 *           $ref: '#/components/schemas/SeamenCompanyStatistics'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     SeamenCompanyCreateRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *         category:
 *           type: string
 *           nullable: true
 *         website:
 *           type: string
 *           nullable: true
 *         description:
 *           type: string
 *           nullable: true
 *         country:
 *           type: string
 *           nullable: true
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *     SeamenCompanyUpdateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         category:
 *           type: string
 *           nullable: true
 *         website:
 *           type: string
 *           nullable: true
 *         description:
 *           type: string
 *           nullable: true
 *         country:
 *           type: string
 *           nullable: true
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *   parameters:
 *     SeamenCompanyPasswordToken:
 *       in: query
 *       name: passwordToken
 *       schema:
 *         type: string
 *       required: true
 *       description: Захисний код доступу до API
 */

/**
 * @swagger
 * /seamen/company/all:
 *   get:
 *     summary: Отримання списку компаній
 *     tags: [Seamen Companies]
 *     parameters:
 *       - $ref: '#/components/parameters/SeamenCompanyPasswordToken'
 *     responses:
 *       200:
 *         description: Успішне отримання списку компаній
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SeamenCompany'
 *       400:
 *         description: Некоректні параметри запиту
 *       401:
 *         description: Невірний код доступу
 *       500:
 *         description: Внутрішня помилка сервера
 */

/**
 * @swagger
 * /seamen/company/by-id/{id}:
 *   get:
 *     summary: Отримання компанії за ідентифікатором
 *     tags: [Seamen Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Ідентифікатор компанії
 *       - $ref: '#/components/parameters/SeamenCompanyPasswordToken'
 *     responses:
 *       200:
 *         description: Компанію успішно знайдено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SeamenCompany'
 *       400:
 *         description: Некоректні параметри запиту
 *       401:
 *         description: Невірний код доступу
 *       404:
 *         description: Компанію не знайдено
 *       500:
 *         description: Внутрішня помилка сервера
 */

/**
 * @swagger
 * /seamen/company/create:
 *   post:
 *     summary: Створення нової компанії
 *     tags: [Seamen Companies]
 *     parameters:
 *       - $ref: '#/components/parameters/SeamenCompanyPasswordToken'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SeamenCompanyCreateRequest'
 *     responses:
 *       201:
 *         description: Компанію успішно створено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SeamenCompany'
 *       400:
 *         description: Некоректні дані запиту
 *       401:
 *         description: Невірний код доступу
 *       500:
 *         description: Внутрішня помилка сервера
 */

/**
 * @swagger
 * /seamen/company/update/{id}:
 *   put:
 *     summary: Оновлення інформації про компанію
 *     tags: [Seamen Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Ідентифікатор компанії
 *       - $ref: '#/components/parameters/SeamenCompanyPasswordToken'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SeamenCompanyUpdateRequest'
 *     responses:
 *       200:
 *         description: Компанію успішно оновлено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SeamenCompany'
 *       400:
 *         description: Некоректні дані запиту
 *       401:
 *         description: Невірний код доступу
 *       404:
 *         description: Компанію не знайдено
 *       500:
 *         description: Внутрішня помилка сервера
 */

/**
 * @swagger
 * /seamen/company/delete/{id}:
 *   delete:
 *     summary: Видалення компанії
 *     tags: [Seamen Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Ідентифікатор компанії
 *       - $ref: '#/components/parameters/SeamenCompanyPasswordToken'
 *     responses:
 *       200:
 *         description: Компанію успішно видалено
 *       400:
 *         description: Некоректні параметри запиту
 *       401:
 *         description: Невірний код доступу
 *       404:
 *         description: Компанію не знайдено
 *       500:
 *         description: Внутрішня помилка сервера
 */

