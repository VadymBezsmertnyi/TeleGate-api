import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TeleGate API",
      version: "1.0.0",
      description: "API для управління Telegram групами та push-сповіщеннями",
      contact: {
        name: "TeleGate Support",
        email: "support@telegate.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5008/api",
        description: "Development server",
      },
      {
        url: "https://telegate-api-4b26ec7aa804.herokuapp.com/api",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Telegram токен авторизації",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "number",
              description: "Telegram ID користувача",
            },
            username: {
              type: "string",
              nullable: true,
              description: "Username користувача",
            },
            first_name: {
              type: "string",
              nullable: true,
              description: "Ім'я користувача",
            },
            last_name: {
              type: "string",
              nullable: true,
              description: "Прізвище користувача",
            },
            photo_url: {
              type: "string",
              nullable: true,
              description: "URL фото користувача",
            },
          },
        },
        PushToken: {
          type: "object",
          properties: {
            token: {
              type: "string",
              description: "Push-токен для сповіщень",
            },
            platform: {
              type: "string",
              enum: ["ios", "android", "web"],
              description: "Платформа пристрою",
            },
          },
          required: ["token", "platform"],
        },
        PushTokenResponse: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "ID токена",
            },
            token: {
              type: "string",
              description: "Push-токен",
            },
            platform: {
              type: "string",
              enum: ["ios", "android", "web"],
            },
            isActive: {
              type: "boolean",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Повідомлення про помилку",
            },
            details: {
              type: "array",
              items: {
                type: "object",
              },
              description: "Деталі помилки валідації",
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Повідомлення про успіх",
            },
            data: {
              type: "object",
              description: "Дані відповіді",
            },
          },
        },
        RevenueCatSubscriberAttribute: {
          type: "object",
          properties: {
            updated_at_ms: {
              type: "number",
              description: "Timestamp оновлення атрибута",
            },
            value: {
              type: "string",
              description: "Значення атрибута",
            },
          },
          required: ["updated_at_ms", "value"],
        },
        RevenueCatSubscriberAttributes: {
          type: "object",
          properties: {
            $apnsTokens: {
              $ref: "#/components/schemas/RevenueCatSubscriberAttribute",
            },
            $deviceVersion: {
              $ref: "#/components/schemas/RevenueCatSubscriberAttribute",
            },
            $displayName: {
              $ref: "#/components/schemas/RevenueCatSubscriberAttribute",
            },
            $idfv: {
              $ref: "#/components/schemas/RevenueCatSubscriberAttribute",
            },
            $mediaSource: {
              $ref: "#/components/schemas/RevenueCatSubscriberAttribute",
            },
            $email: {
              $ref: "#/components/schemas/RevenueCatSubscriberAttribute",
            },
            $phoneNumber: {
              $ref: "#/components/schemas/RevenueCatSubscriberAttribute",
            },
          },
        },
        RevenueCatEvent: {
          type: "object",
          properties: {
            aliases: {
              type: "array",
              items: { type: "string" },
              description: "Аліаси користувача",
            },
            app_id: {
              type: "string",
              description: "ID додатку",
            },
            app_user_id: {
              type: "string",
              description: "ID користувача в додатку",
            },
            country_code: {
              type: "string",
              description: "Код країни",
            },
            environment: {
              type: "string",
              enum: ["SANDBOX", "PRODUCTION"],
              description: "Середовище",
            },
            event_timestamp_ms: {
              type: "number",
              description: "Timestamp події",
            },
            id: {
              type: "string",
              description: "ID події",
            },
            original_app_user_id: {
              type: "string",
              description: "Оригінальний ID користувача",
            },
            period_type: {
              type: "string",
              enum: ["NORMAL", "TRIAL", "INTRO"],
              description: "Тип періоду",
            },
            product_id: {
              type: "string",
              description: "ID продукту",
            },
            purchased_at_ms: {
              type: "number",
              description: "Timestamp покупки",
            },
            store: {
              type: "string",
              enum: ["APP_STORE", "PLAY_STORE", "STRIPE", "PROMOTIONAL"],
              description: "Магазин",
            },
            type: {
              type: "string",
              enum: [
                "INITIAL_PURCHASE",
                "RENEWAL",
                "CANCELLATION",
                "UNCANCELLATION",
                "NON_RENEWING_PURCHASE",
                "EXPIRATION",
                "BILLING_ISSUE",
                "PRODUCT_CHANGE",
                "TEST",
              ],
              description: "Тип події",
            },
          },
          required: [
            "aliases",
            "app_id",
            "app_user_id",
            "country_code",
            "environment",
            "event_timestamp_ms",
            "id",
            "original_app_user_id",
            "period_type",
            "product_id",
            "purchased_at_ms",
            "store",
            "type",
          ],
        },
        RevenueCatWebhookPayload: {
          type: "object",
          properties: {
            api_version: {
              type: "string",
              description: "Версія API",
            },
            event: {
              $ref: "#/components/schemas/RevenueCatEvent",
            },
          },
          required: ["api_version", "event"],
        },
        RevenueCatProject: {
          type: "object",
          properties: {
            created_at: {
              type: "number",
              description: "Timestamp створення проекту",
            },
            id: {
              type: "string",
              description: "ID проекту",
            },
            name: {
              type: "string",
              description: "Назва проекту",
            },
            object: {
              type: "string",
              enum: ["project"],
              description: "Тип об'єкта",
            },
          },
          required: ["created_at", "id", "name", "object"],
        },
        RevenueCatCustomer: {
          type: "object",
          properties: {
            experiment: {
              type: "string",
              nullable: true,
              description: "Експеримент",
            },
            first_seen_at: {
              type: "number",
              description: "Timestamp першого побачення",
            },
            id: {
              type: "string",
              description: "ID користувача",
            },
            last_seen_app_version: {
              type: "string",
              description: "Версія додатку при останньому використанні",
            },
            last_seen_at: {
              type: "number",
              description: "Timestamp останнього побачення",
            },
            last_seen_country: {
              type: "string",
              description: "Країна останнього використання",
            },
            last_seen_platform: {
              type: "string",
              enum: ["iOS", "android"],
              description: "Платформа останнього використання",
            },
            last_seen_platform_version: {
              type: "string",
              description: "Версія платформи останнього використання",
            },
            object: {
              type: "string",
              enum: ["customer"],
              description: "Тип об'єкта",
            },
            project_id: {
              type: "string",
              description: "ID проекту",
            },
          },
          required: [
            "experiment",
            "first_seen_at",
            "id",
            "last_seen_app_version",
            "last_seen_at",
            "last_seen_country",
            "last_seen_platform",
            "last_seen_platform_version",
            "object",
            "project_id",
          ],
        },
        RevenueCatProjectsResponse: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                $ref: "#/components/schemas/RevenueCatProject",
              },
            },
            next_page: {
              type: "string",
              nullable: true,
              description: "URL наступної сторінки",
            },
            object: {
              type: "string",
              enum: ["list"],
              description: "Тип об'єкта",
            },
            url: {
              type: "string",
              description: "URL запиту",
            },
          },
          required: ["items", "next_page", "object", "url"],
        },
        RevenueCatCustomersResponse: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                $ref: "#/components/schemas/RevenueCatCustomer",
              },
            },
            next_page: {
              type: "string",
              nullable: true,
              description: "URL наступної сторінки",
            },
            object: {
              type: "string",
              enum: ["list"],
              description: "Тип об'єкта",
            },
            url: {
              type: "string",
              description: "URL запиту",
            },
          },
          required: ["items", "next_page", "object", "url"],
        },
        RevenueCatSubscription: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "ID підписки",
            },
            product_id: {
              type: "string",
              description: "ID продукту",
            },
            purchase_date: {
              type: "string",
              format: "date-time",
              description: "Дата покупки",
            },
            expires_date: {
              type: "string",
              format: "date-time",
              description: "Дата закінчення",
            },
            unsubscribe_detected_at: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "Дата виявлення відписки",
            },
          },
        },
        RevenueCatUserSubscription: {
          type: "object",
          properties: {
            projectId: {
              type: "string",
              description: "ID проекту RevenueCat",
            },
            projectName: {
              type: "string",
              description: "Назва проекту RevenueCat",
            },
            customerId: {
              type: "string",
              description: "ID клієнта в RevenueCat",
            },
            telegramId: {
              type: "number",
              description: "Telegram ID користувача",
            },
            subscriptions: {
              type: "object",
              properties: {
                subscriptions: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/RevenueCatSubscription",
                  },
                },
              },
            },
          },
          required: [
            "projectId",
            "projectName",
            "customerId",
            "telegramId",
            "subscriptions",
          ],
        },
        RevenueCatUserSubscriptionsResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              description: "Статус успішності запиту",
            },
            data: {
              type: "array",
              items: {
                $ref: "#/components/schemas/RevenueCatUserSubscription",
              },
              description: "Масив підписок користувачів",
            },
            totalUsers: {
              type: "number",
              description: "Загальна кількість користувачів з підписками",
            },
          },
          required: ["success", "data", "totalUsers"],
        },
      },
    },
  },
  apis: ["./src/routes/**/*.swagger.ts"],
};

export const specs = swaggerJsdoc(options);
