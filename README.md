# TeleGate API

> **Project Status: Discontinued / Portfolio Archive**

The backend of TeleGate, a platform for managing Telegram communities. It is a multi-module Node.js/TypeScript API that also hosted the backends of two related experiments, Coin Diviner AI and Seamen.

## Project Background

I built TeleGate primarily as a hands-on way to learn the Telegram ecosystem. Along the way I explored the Telegram API and bots, the way they interact with external services, and how to automate workflows around them. I implemented a range of features to gain practical experience rather than to chase a commercial goal.

## Key Features

- Sign-in through Telegram with access and refresh tokens
- Telegram bot connection management and message templates
- Group and member management with subscriptions
- Push notifications through Firebase Cloud Messaging
- Coin Diviner AI module: crypto market data from several sources, AI-assisted analysis, portfolio tracking, favorites, and automation rules
- Seamen module: company and contact management with email and SMS
- Subscription tracking with RevenueCat

## Tech Stack

- Node.js, TypeScript, Express 5
- MongoDB with Mongoose, Node-Cache
- JWT authentication, bcrypt
- Telegraf (Telegram bots)
- Firebase Admin
- OpenAI
- Binance, CoinGecko, CoinPaprika, DexScreener, Moralis, and Solana RPC clients
- RevenueCat, Twilio, TurboSMS, Nodemailer
- Swagger for API documentation

## Project Timeline

- Started: August 2025
- Discontinued: February 2026
- Status: Discontinued — Portfolio Archive

## Project Status

The project is discontinued and no longer maintained. I closed it because it lost its relevance for me, not because it could not be finished technically. The main learning goal of the project was achieved. The related production services are not maintained, some external integrations may no longer work, and the code is not intended to run in production without new credentials and infrastructure. Credentials and environment files are not included; `.env.example` lists the variable names.

## Portfolio Note

I keep this repository as an example of my hands-on experience and growth as a developer. No license has been chosen, so all rights are reserved by the author.
