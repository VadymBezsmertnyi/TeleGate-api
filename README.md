# TeleGate API

A comprehensive Node.js/TypeScript backend service providing authentication, user management, Telegram bot integration, and advanced cryptocurrency analysis with AI-powered predictions.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Main Modules](#main-modules)
- [Security Considerations](#security-considerations)

## 🎯 Overview

TeleGate API is a multi-module backend platform designed to support mobile and web applications with the following core capabilities:

1. **TeleGate Core** - User authentication via Telegram, group management, member subscriptions, and push notifications
2. **Coin Diviner AI** - Cryptocurrency analysis platform with AI predictions, portfolio tracking, and multi-source market data aggregation
3. **Seamen Module** - Company/contact management with email integration and automation

The API leverages modern technologies and integrates with 15+ external services to deliver real-time crypto market insights and user engagement features.

## ✨ Features

### Authentication & User Management

- **Telegram OAuth Authentication** - Secure sign-in via Telegram Bot
- **JWT Token Management** - Refresh and access token system
- **User Profiles** - Comprehensive user data management
- **Push Notifications** - Real-time alerts via Firebase Cloud Messaging

### Telegram Bot Integration

- **Bot Connection Management** - Establish and manage bot sessions
- **Message Templates** - Predefined message formats for broadcasts
- **Group Subscriptions** - User subscriptions to group channels
- **Automated Messaging** - Scheduled and triggered message delivery
- **Photo Cache Management** - Automatic photo expiration and updates

### Cryptocurrency Analysis (Coin Diviner AI)

- **Multi-Source Data Aggregation** - CoinGecko, CoinPaprika, Binance, DexScreener
- **AI-Powered Predictions** - OpenAI integration for market analysis
- **Portfolio Tracking** - User cryptocurrency holdings and performance
- **Blockchain Integration** - Solana and multi-chain support via Moralis
- **Automation Rules** - Create custom trading alerts and automations
- **Favorites Management** - Save and track favorite tokens

### Payment & Subscriptions

- **RevenueCat Integration** - In-app purchase management
- **Subscription Tracking** - User subscription lifecycle management
- **Premium Features** - Token-gated premium analysis features

### Seamen Module

- **Company Management** - Create and manage company profiles
- **Contact Management** - Organize company contacts
- **Email Integration** - Send emails with templates via Nodemailer
- **SMS Integration** - SMS notifications and alerts

## 🛠 Technology Stack

### Core Framework

- **Runtime:** Node.js
- **Language:** TypeScript 5.9.2
- **Framework:** Express.js 5.1.0
- **Dev Tool:** Nodemon (auto-reload)

### Database & Caching

- **Primary Database:** MongoDB 8.17.1 (Mongoose ORM)
- **In-Memory Cache:** Node-Cache 5.1.2
- **Session Storage:** MongoDB

### Authentication & Security

- **JWT (JSON Web Tokens)** - Token-based authentication
- **bcrypt 6.0.0** - Password hashing
- **CORS** - Cross-origin resource sharing

### External APIs & Services

| Service            | Purpose                    | Package                       |
| ------------------ | -------------------------- | ----------------------------- |
| **Telegram**       | Bot communication          | telegraf 4.16.3               |
| **Firebase Admin** | Push notifications         | firebase-admin 13.4.0         |
| **OpenAI**         | AI predictions & analysis  | openai 6.1.0                  |
| **Binance API**    | Cryptocurrency market data | binance-api-node 0.12.9       |
| **CoinGecko**      | Token price data           | @microfox/coingecko-sdk 1.3.0 |
| **CoinPaprika**    | Crypto market info         | -                             |
| **DexScreener**    | DEX trading data           | dexscreener-sdk 1.0.3         |
| **Moralis**        | Blockchain data            | -                             |
| **Solana**         | Blockchain RPC             | @solana/kit 5.0.0             |
| **RevenueCat**     | Subscription management    | -                             |
| **Twilio**         | SMS delivery               | twilio 5.10.3                 |
| **TurboSMS**       | SMS alerts                 | -                             |
| **Nodemailer**     | Email service              | nodemailer 7.0.10             |

### Validation & Documentation

- **Zod 4.0.16** - TypeScript-first schema validation
- **Swagger/OpenAPI** - Interactive API documentation
- **swagger-jsdoc 6.2.8** - API spec generation
- **swagger-ui-express 5.0.1** - Swagger UI server

### Task Scheduling

- **node-cron 4.2.1** - Scheduled background jobs
- **Automated Tasks:**
  - Cache flushing (every 5 minutes)
  - Photo expiration updates (daily at 2 AM)
  - Subscription synchronization (daily at 6 AM)

### Utilities

- **axios 1.11.0** - HTTP client
- **striptags 3.2.0** - HTML tag removal
- **multer 2.0.0** - File upload handling

## 📁 Project Structure

```
TeleGate-api/
├── src/
│   ├── index.ts                          # Application entry point
│   ├── config/
│   │   └── swagger.ts                    # Swagger/OpenAPI configuration
│   ├── helpers/
│   │   ├── auth.ts                       # Authentication utilities
│   │   ├── firebase.helper.ts            # Firebase initialization
│   │   └── telegram.helper.ts            # Telegram utilities
│   ├── routes/
│   │   ├── auth-telegram/                # Telegram OAuth routes
│   │   ├── users/                        # User management
│   │   ├── groups/                       # Group management
│   │   ├── members/                      # Member management
│   │   ├── group-subscriptions/          # Group subscription routes
│   │   ├── member-subscriptions/         # Member subscription routes
│   │   ├── bot-telegram/                 # Bot connection & control
│   │   ├── bot-send-messages/            # Message broadcasting
│   │   ├── message-templates/            # Message templates
│   │   ├── user-push-tokens/             # Push token management
│   │   ├── revenuecat/                   # Subscription sync
│   │   ├── messages/                     # Message history
│   │   └── notification/                 # Notification management
│   ├── coin-diviner-ai/                  # AI Cryptocurrency Module
│   │   ├── index.ts                      # Module initialization
│   │   ├── helpers/
│   │   │   ├── firebase.helper.ts        # Firebase config
│   │   │   └── sms/                      # SMS helpers
│   │   ├── hooks/                        # API integration logic
│   │   │   ├── aggregator/               # Data aggregation
│   │   │   ├── auth/                     # Authentication
│   │   │   ├── automation/               # Automation rules
│   │   │   ├── binance/                  # Binance API
│   │   │   ├── coingecko/                # CoinGecko API
│   │   │   ├── coinpaprika/              # CoinPaprika API
│   │   │   ├── dexscreener/              # DexScreener API
│   │   │   ├── openAi/                   # OpenAI integration
│   │   │   ├── push/                     # Push notifications
│   │   │   └── twilio/                   # Twilio SMS
│   │   └── routes/                       # AI module routes
│   │       ├── auth/                     # User authentication
│   │       ├── aggregator/               # Data aggregation
│   │       ├── aiPrediction/             # AI predictions
│   │       ├── portfolio/                # Portfolio tracking
│   │       ├── automation/               # Automation management
│   │       ├── favorites/                # Favorite tokens
│   │       ├── notification/             # Notifications
│   │       └── user-balance/             # Balance tracking
│   └── seamen/                           # Company Management Module
│       └── routes/
│           ├── template/                 # Email templates
│           ├── company/                  # Company profiles
│           ├── company-contact/          # Contact management
│           ├── integration/              # Integration config
│           └── email/                    # Email sending
├── build/                                # Compiled JavaScript (generated)
├── package.json                          # Dependencies
├── tsconfig.json                         # TypeScript configuration
├── nodemon.json                          # Nodemon configuration
└── .env                                  # Environment variables
```

## 💻 Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB instance
- Git

### Steps

1. **Clone the repository:**

```bash
git clone <repository-url>
cd TeleGate-api
```

2. **Install dependencies:**

```bash
npm install
# or
yarn install
```

3. **Create environment configuration:**

```bash
cp .env.example .env
```

## ⚙️ Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
# Database Configuration
MONGO_DB_USERNAME=your_mongo_user
MONGO_DB_PASSWORD=your_mongo_password

# Telegram Bot (Main)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_BOT_ID=your_bot_id
TELEGRAM_BOT_USERNAME=your_bot_username
TELEGRAM_ORIGIN_DOMAIN=your_domain.com
AUTH_REDIRECT_SCHEME=telegate

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_SERVICE_ACCOUNT_KEY=path_to_service_account.json

# Authentication
JWT_SECRET_KEY_TOKEN=your_jwt_secret_token
JWT_SECRET_KEY_REFRESH_TOKEN=your_jwt_refresh_secret

# OpenAI (AI Predictions)
OPENAI_API_KEY=your_openai_api_key
OPENAI_ORG_ID=your_org_id
OPENAI_PROJECT_ID=your_project_id

# Binance API (Crypto Market Data)
BINANCE_API_KEY=your_binance_api_key
BINANCE_API_SECRET=your_binance_api_secret

# CoinGecko API
COINGECKO_API_KEY=your_coingecko_api_key

# Blockchain APIs
MORALIS_API_KEY=your_moralis_api_key
SOLANA_RPC_URL=your_solana_rpc_endpoint

# SMS Services
TURBO_SMS_API_TOKEN=your_turbo_sms_token
TURBO_SMS_API_URL_SEND=https://api.turbosms.ua/message/send.json
TURBO_SMS_API_URL_BALANCE=https://api.turbosms.ua/user/balance.json
TURBO_SMS_SENDER=sender_name

# Twilio (Coin Diviner AI)
TWILIO_ACCOUNT_SID_COIN_DIVINER_AI=your_twilio_sid
TWILIO_AUTH_TOKEN_COIN_DIVINER_AI=your_twilio_token

# Telegram Bot (Coin Diviner AI)
TELEGRAM_BOT_TOKEN_COIN_DIVINER_AI=your_ai_bot_token

# RevenueCat (Subscriptions)
REVENUECAT_API_KEY_V1=your_revenuecat_key
REVENUECAT_API_KEY_V1_READ_ONLY=your_revenuecat_read_only_key
REVENUECAT_AUTHORIZATION=your_revenuecat_auth_token

# Seamen Module
SEAMEN_PASSWORD=your_seamen_password

# Server
PORT=5008
NODE_ENV=development
```

### ⚠️ Security Notes

- **Never commit `.env` file to version control** (already in `.gitignore`)
- Use `.env.example` with placeholder values for documentation
- Rotate API keys regularly
- Use secrets management service (AWS Secrets Manager, HashiCorp Vault) in production
- Implement pre-commit hooks to prevent secret leaks (git-secrets, husky)

## 🚀 Running the Application

### Development Mode

```bash
npm run start:dev
```

- Runs with Nodemon for automatic reload
- Watches for TypeScript file changes
- Default port: 5008

### Production Build

```bash
npm run build
```

- Compiles TypeScript to JavaScript in `build/` directory

### Production Run

```bash
npm start
```

- Runs compiled code from `build/` directory
- Set `NODE_ENV=production`

### Testing

```bash
npm test
```

(Currently no test suite configured - this is a placeholder)

## 📚 API Documentation

Once the server is running, access the interactive Swagger UI:

```
http://localhost:5008/api-docs
```

### Main API Endpoints

**Authentication:**

- `POST /api/auth-telegram/verify` - Verify Telegram login
- `POST /api/auth-telegram/refresh` - Refresh JWT tokens

**Users:**

- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/push-tokens` - Register push token

**Groups:**

- `GET /api/groups` - List all groups
- `POST /api/groups` - Create new group
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group

**Telegram Bot:**

- `POST /api/bot-telegram/connect` - Connect bot session
- `POST /api/bot-send-messages` - Broadcast messages
- `GET /api/message-templates` - Get message templates

**Coin Diviner AI:**

- `GET /coin-diviner-ai/api/aggregator` - Aggregate market data
- `GET /coin-diviner-ai/api/binance/ticker` - Binance ticker data
- `GET /coin-diviner-ai/api/coingecko/price` - CoinGecko prices
- `POST /coin-diviner-ai/api/ai-prediction` - Get AI predictions
- `GET /coin-diviner-ai/api/portfolio` - User portfolio
- `GET /coin-diviner-ai/api/favorites` - Favorite tokens

**Seamen:**

- `POST /seamen/api/company` - Create company
- `GET /seamen/api/company` - List companies
- `POST /seamen/api/email` - Send email
- `GET /seamen/api/template` - Email templates

## 🔌 Main Modules

### 1. TeleGate Core

Handles user authentication, group management, and messaging infrastructure.

**Key Features:**

- Telegram OAuth integration
- JWT-based session management
- Group & member subscriptions
- Push notifications
- Message templates & broadcasting

### 2. Coin Diviner AI

Advanced cryptocurrency analysis platform with AI predictions.

**Key Features:**

- Multi-source market data aggregation (5+ sources)
- AI-powered price predictions
- Portfolio tracking across blockchains
- Automated trading alerts
- Favorite token watchlists
- Real-time blockchain data

**Supported Data Sources:**

- Binance (CEX)
- CoinGecko (Price data)
- CoinPaprika (Market info)
- DexScreener (DEX data)
- Moralis (Blockchain data)
- Solana RPC (On-chain data)

### 3. Seamen

Company and contact management with email automation.

**Key Features:**

- Company profile management
- Contact organization
- Email templates
- Automated email sending
- Integration management

## 🔐 Security Considerations

### Current Implementation

- JWT token-based authentication
- bcrypt password hashing (if used)
- CORS protection
- Firebase authentication layer
- Input validation via Zod schemas

### Recommendations

1. **Secrets Management:**
   - Use AWS Secrets Manager or HashiCorp Vault
   - Never commit `.env` files
   - Rotate API keys quarterly
   - Implement secret scanning in CI/CD

2. **API Security:**
   - Implement rate limiting
   - Add request validation
   - Use HTTPS in production
   - Implement API versioning

3. **Database:**
   - Use MongoDB authentication
   - Enable network access control
   - Regular backups
   - Encrypt sensitive fields

4. **Monitoring:**
   - Log all API requests
   - Monitor failed authentication attempts
   - Track API key usage
   - Set up alerts for unusual activity

## 📝 Development Notes

### Code Organization

- Routes are organized by feature/module
- Each route module has:
  - Main route handler
  - Helper functions
  - Type definitions
  - Swagger documentation
  - Input schemas (Zod)
  - Constants

### TypeScript Usage

- Strict mode enabled
- Full type coverage for external APIs
- Custom types for domain models

### Background Jobs

- Cache flushing every 5 minutes
- Photo expiration checks daily at 2 AM
- Subscription sync from RevenueCat daily at 6 AM

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/feature-name`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/feature-name`
4. Submit a pull request

### Code Style

- Follow TypeScript best practices
- Use meaningful variable names
- Document complex functions
- Add Swagger documentation for new endpoints

## 📄 License

ISC

## 🆘 Support

For issues or questions, please refer to the project documentation or create an issue in the repository.

---

**Last Updated:** May 15, 2026
**Current Version:** 1.0.0
