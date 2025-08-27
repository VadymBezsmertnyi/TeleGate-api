/**
 * @swagger
 * /revenuecat/user-subscriptions:
 *   get:
 *     summary: Отримати підписки користувачів з RevenueCat
 *     description: |
 *       Отримує всі підписки користувачів з RevenueCat, які існують в системі.
 *
 *       Логіка роботи:
 *       1. Отримує всі проекти з RevenueCat
 *       2. Для кожного проекту отримує всіх клієнтів
 *       3. Фільтрує анонімних користувачів (RCAnonymousID)
 *       4. Шукає користувача в базі даних за telegramId
 *       5. Якщо користувач знайдений, отримує його підписки
 *       6. Повертає зібрані дані
 *     tags:
 *       - RevenueCat
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Успішно отримано підписки користувачів
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RevenueCatUserSubscriptionsResponse'
 *             example:
 *               success: true
 *               data:
 *                 - projectId: "proj_123456"
 *                   projectName: "TeleGate App"
 *                   customerId: "123456789"
 *                   telegramId: 123456789
 *                   subscriptions:
 *                     subscriptions:
 *                       - id: "sub_123456"
 *                         product_id: "premium_monthly"
 *                         purchase_date: "2024-01-01T00:00:00Z"
 *                         expires_date: "2024-02-01T00:00:00Z"
 *                         unsubscribe_detected_at: null
 *               totalUsers: 1
 *       401:
 *         description: Необхідна авторизація
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Authentication required"
 *       500:
 *         description: Внутрішня помилка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Internal Server Error"
 *
 * /revenuecat/customers/{projectId}:
 *   get:
 *     summary: Отримання клієнтів RevenueCat
 *     description: Отримує список всіх клієнтів з конкретного проекту RevenueCat (включаючи анонімних та зареєстрованих користувачів)
 *     tags: [RevenueCat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID проекту RevenueCat
 *         example: "proje27c8296"
 *     responses:
 *       200:
 *         description: Список клієнтів успішно отримано
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RevenueCatCustomersResponse'
 *       401:
 *         description: Неавторизований запит
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Project ID не вказано
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
 * /revenuecat/projects:
 *   get:
 *     summary: Отримання проектів RevenueCat
 *     description: Отримує список всіх проектів RevenueCat
 *     tags: [RevenueCat]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Список проектів успішно отримано
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RevenueCatProjectsResponse'
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
 * /revenuecat/customers/{projectId}/{customerId}/subscriptions:
 *   get:
 *     summary: Отримання підписок клієнта RevenueCat
 *     description: Отримує список всіх підписок конкретного клієнта з проекту RevenueCat
 *     tags: [RevenueCat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID проекту RevenueCat
 *         example: "proje27c8296"
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID клієнта RevenueCat
 *         example: "886363509"
 *     responses:
 *       200:
 *         description: Список підписок клієнта успішно отримано
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subscriptions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: ID підписки
 *                       product_id:
 *                         type: string
 *                         description: ID продукту
 *                       store:
 *                         type: string
 *                         description: Магазин (APP_STORE, PLAY_STORE, etc.)
 *                       purchase_date:
 *                         type: string
 *                         format: date-time
 *                         description: Дата покупки
 *                       expires_date:
 *                         type: string
 *                         format: date-time
 *                         description: Дата закінчення
 *                       is_active:
 *                         type: boolean
 *                         description: Чи активна підписка
 *       401:
 *         description: Неавторизований запит
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Project ID або Customer ID не вказано
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Клієнт не знайдений
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
 * /revenuecat/projects/{projectId}/offerings:
 *   get:
 *     summary: Отримання офірів проекту RevenueCat
 *     description: Отримує список всіх офірів (offerings) у конкретному проекті RevenueCat
 *     tags: [RevenueCat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID проекту RevenueCat
 *         example: "proje27c8296"
 *     responses:
 *       200:
 *         description: Список всіх офірів проекту успішно отримано
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 offerings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: ID офера
 *                       identifier:
 *                         type: string
 *                         description: Ідентифікатор офера
 *                       description:
 *                         type: string
 *                         description: Опис офера
 *                       metadata:
 *                         type: object
 *                         description: Метадані офера
 *                       packages:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               description: ID пакета
 *                             identifier:
 *                               type: string
 *                               description: Ідентифікатор пакета
 *                             platform_product_identifier:
 *                               type: string
 *                               description: Ідентифікатор продукту на платформі
 *                 current_offering_id:
 *                   type: string
 *                   description: ID поточного офера
 *       401:
 *         description: Неавторизований запит
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Project ID не вказано
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Проект не знайдений
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
 * /revenuecat/projects/{projectId}/offerings/{offeringId}/packages:
 *   get:
 *     summary: Отримання пакетів офера RevenueCat
 *     description: Отримує список всіх пакетів конкретного офера в проекті RevenueCat
 *     tags: [RevenueCat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID проекту RevenueCat
 *         example: "proje27c8296"
 *       - in: path
 *         name: offeringId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID офера RevenueCat
 *         example: "offering_123"
 *     responses:
 *       200:
 *         description: Список пакетів офера успішно отримано
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 packages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: ID пакета
 *                       identifier:
 *                         type: string
 *                         description: Ідентифікатор пакета
 *                       platform_product_identifier:
 *                         type: string
 *                         description: Ідентифікатор продукту на платформі
 *                       store_product:
 *                         type: object
 *                         description: Інформація про продукт в магазині
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: ID продукту в магазині
 *                           title:
 *                             type: string
 *                             description: Назва продукту
 *                           description:
 *                             type: string
 *                             description: Опис продукту
 *                           price:
 *                             type: number
 *                             description: Ціна продукту
 *                           currency_code:
 *                             type: string
 *                             description: Код валюти
 *                           subscription_period:
 *                             type: string
 *                             description: Період підписки
 *       401:
 *         description: Неавторизований запит
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Project ID або Offering ID не вказано
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Офер не знайдений
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
 * /revenuecat/projects/{projectId}/products:
 *   get:
 *     summary: Отримання продуктів проекту RevenueCat
 *     description: Отримує список всіх продуктів у конкретному проекті RevenueCat
 *     tags: [RevenueCat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID проекту RevenueCat
 *         example: "proje27c8296"
 *     responses:
 *       200:
 *         description: Список продуктів проекту успішно отримано
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: ID продукту
 *                       identifier:
 *                         type: string
 *                         description: Ідентифікатор продукту
 *                       display_name:
 *                         type: string
 *                         description: Відображувана назва продукту
 *                       description:
 *                         type: string
 *                         description: Опис продукту
 *                       product_type:
 *                         type: string
 *                         description: Тип продукту (subscription, non_subscription, etc.)
 *                       store:
 *                         type: string
 *                         description: Магазин (APP_STORE, PLAY_STORE, etc.)
 *                       price:
 *                         type: number
 *                         description: Ціна продукту
 *                       currency_code:
 *                         type: string
 *                         description: Код валюти
 *                       subscription_period:
 *                         type: string
 *                         description: Період підписки (для subscription продуктів)
 *                       subscription_group:
 *                         type: string
 *                         description: Група підписки
 *                       is_family_shareable:
 *                         type: boolean
 *                         description: Чи можна ділитися з сім'єю
 *       401:
 *         description: Неавторизований запит
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Project ID не вказано
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Проект не знайдений
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
 * /revenuecat/customers/anonymous/{projectId}:
 *   delete:
 *     summary: Видалення анонімних користувачів RevenueCat
 *     description: Видаляє всіх анонімних користувачів (з ID що містять "RCAnonymousID") з конкретного проекту
 *     tags: [RevenueCat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID проекту RevenueCat
 *         example: "proje27c8296"
 *     responses:
 *       200:
 *         description: Анонімні користувачі успішно видалені
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Successfully deleted 3 anonymous customers"
 *                 deletedCount:
 *                   type: number
 *                   description: Кількість видалених користувачів
 *                   example: 3
 *                 deletedCustomers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "$RCAnonymousID:b492d2dbc9d84548b4cf7b2336542e6d"
 *                       last_seen_at:
 *                         type: number
 *                         example: 1755666598613
 *                       last_seen_country:
 *                         type: string
 *                         example: "UA"
 *       401:
 *         description: Неавторизований запит
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Project ID не вказано
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
 * /revenuecat/webhook:
 *   post:
 *     summary: Webhook RevenueCat
 *     description: Обробляє webhook події від RevenueCat (покупки, підписки, скасування тощо)
 *     tags: [RevenueCat]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RevenueCatWebhookPayload'
 *     responses:
 *       200:
 *         description: Webhook успішно оброблено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Webhook received successfully"
 *                 data:
 *                   $ref: '#/components/schemas/RevenueCatWebhookPayload'
 *       401:
 *         description: Неавторизований запит або невірний токен
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
