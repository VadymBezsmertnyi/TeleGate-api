/**
 * @swagger
 * components:
 *   schemas:
 *     SeamenCompanyContactTemplate:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Ідентифікатор шаблону
 *         name:
 *           type: string
 *           nullable: true
 *           description: Назва шаблону
*     SeamenCompanyContactSendHistory:
*       type: object
*       properties:
*         type:
*           type: string
*           enum: ["template", "custom"]
*           description: Тип відправки
*         template:
*           $ref: '#/components/schemas/SeamenCompanyContactTemplate'
*         subject:
*           type: string
*           nullable: true
*           description: Тема листа
*         content:
*           type: string
*           nullable: true
*           description: Текст листа
*         status:
*           type: string
*           enum: ["success", "failed"]
*           description: Статус відправки
*         sentAt:
*           type: string
*           format: date-time
*           description: Час відправлення
*         errorMessage:
*           type: string
*           nullable: true
*           description: Повідомлення про помилку
 *     SeamenCompanyContact:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Ідентифікатор контакту
 *         company:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *               nullable: true
 *           description: Інформація про компанію
 *         fullName:
 *           type: string
 *           description: Ім'я контакту
 *         position:
 *           type: string
 *           nullable: true
 *           description: Посада контакту
 *         email:
 *           type: string
 *           nullable: true
 *           description: Email контакту
 *         phone:
 *           type: string
 *           nullable: true
 *           description: Телефон контакту
 *         notes:
 *           type: string
 *           nullable: true
 *           description: Додаткові нотатки
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         sendHistory:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SeamenCompanyContactSendHistory'
 *         statistics:
 *           type: object
 *           properties:
 *             success:
 *               type: number
 *             failed:
 *               type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     SeamenCompanyContactCreateRequest:
 *       type: object
 *       required:
 *         - companyId
 *         - fullName
 *       properties:
 *         companyId:
 *           type: string
 *         fullName:
 *           type: string
 *         position:
 *           type: string
 *           nullable: true
 *         email:
 *           type: string
 *           nullable: true
 *         phone:
 *           type: string
 *           nullable: true
 *         notes:
 *           type: string
 *           nullable: true
 *         tags:
 *           type: array
 *           items:
 *             type: string
*         sendHistory:
*           type: array
*           items:
*             type: object
*             properties:
*               type:
*                 type: string
*                 enum: ["template", "custom"]
*               templateId:
*                 type: string
*               subject:
*                 type: string
*               content:
*                 type: string
*               status:
*                 type: string
*                 enum: ["success", "failed"]
*               sentAt:
*                 type: string
*                 format: date-time
*               errorMessage:
*                 type: string
*                 nullable: true
 *     SeamenCompanyContactUpdateRequest:
 *       type: object
 *       properties:
 *         companyId:
 *           type: string
 *         fullName:
 *           type: string
 *         position:
 *           type: string
 *           nullable: true
 *         email:
 *           type: string
 *           nullable: true
 *         phone:
 *           type: string
 *           nullable: true
 *         notes:
 *           type: string
 *           nullable: true
 *         tags:
 *           type: array
 *           items:
 *             type: string
*         sendHistory:
*           type: array
*           items:
*             type: object
*             properties:
*               type:
*                 type: string
*                 enum: ["template", "custom"]
*               templateId:
*                 type: string
*               subject:
*                 type: string
*               content:
*                 type: string
*               status:
*                 type: string
*                 enum: ["success", "failed"]
*               sentAt:
*                 type: string
*                 format: date-time
*               errorMessage:
*                 type: string
*                 nullable: true
 *   parameters:
 *     SeamenCompanyContactPasswordToken:
 *       in: query
 *       name: passwordToken
 *       schema:
 *         type: string
 *       required: true
 *       description: Захисний код доступу до API
 */

/**
 * @swagger
 * /seamen/company-contact/all:
 *   get:
 *     summary: Отримання списку контактів компаній
 *     tags: [Seamen Company Contacts]
 *     parameters:
 *       - $ref: '#/components/parameters/SeamenCompanyContactPasswordToken'
 *     responses:
 *       200:
 *         description: Успішне отримання списку контактів
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SeamenCompanyContact'
 *       400:
 *         description: Некоректні параметри запиту
 *       401:
 *         description: Невірний код доступу
 *       500:
 *         description: Внутрішня помилка сервера
 */

/**
 * @swagger
 * /seamen/company-contact/by-id/{id}:
 *   get:
 *     summary: Отримання контакту компанії за ідентифікатором
 *     tags: [Seamen Company Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Ідентифікатор контакту
 *       - $ref: '#/components/parameters/SeamenCompanyContactPasswordToken'
 *     responses:
 *       200:
 *         description: Контакт успішно знайдено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SeamenCompanyContact'
 *       400:
 *         description: Некоректні параметри запиту
 *       401:
 *         description: Невірний код доступу
 *       404:
 *         description: Контакт не знайдено
 *       500:
 *         description: Внутрішня помилка сервера
 */

/**
 * @swagger
 * /seamen/company-contact/create:
 *   post:
 *     summary: Створення нового контакту компанії
 *     tags: [Seamen Company Contacts]
 *     parameters:
 *       - $ref: '#/components/parameters/SeamenCompanyContactPasswordToken'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SeamenCompanyContactCreateRequest'
 *     responses:
 *       201:
 *         description: Контакт успішно створено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SeamenCompanyContact'
 *       400:
 *         description: Некоректні дані запиту
 *       401:
 *         description: Невірний код доступу
 *       404:
 *         description: Компанію або шаблон не знайдено
 *       500:
 *         description: Внутрішня помилка сервера
 */

/**
 * @swagger
 * /seamen/company-contact/update/{id}:
 *   put:
 *     summary: Оновлення контакту компанії
 *     tags: [Seamen Company Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Ідентифікатор контакту
 *       - $ref: '#/components/parameters/SeamenCompanyContactPasswordToken'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SeamenCompanyContactUpdateRequest'
 *     responses:
 *       200:
 *         description: Контакт успішно оновлено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SeamenCompanyContact'
 *       400:
 *         description: Некоректні дані запиту
 *       401:
 *         description: Невірний код доступу
 *       404:
 *         description: Контакт, компанію або шаблон не знайдено
 *       500:
 *         description: Внутрішня помилка сервера
 */

/**
 * @swagger
 * /seamen/company-contact/delete/{id}:
 *   delete:
 *     summary: Видалення контакту компанії
 *     tags: [Seamen Company Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Ідентифікатор контакту
 *       - $ref: '#/components/parameters/SeamenCompanyContactPasswordToken'
 *     responses:
 *       200:
 *         description: Контакт успішно видалено
 *       400:
 *         description: Некоректні параметри запиту
 *       401:
 *         description: Невірний код доступу
 *       404:
 *         description: Контакт не знайдено
 *       500:
 *         description: Внутрішня помилка сервера
 */

