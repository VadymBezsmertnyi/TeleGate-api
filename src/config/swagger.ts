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
      },
    },
  },
  apis: [
    "./src/routes/**/*.ts",
    "./src/routes/**/*.js",
  ],
};

export const specs = swaggerJsdoc(options);
