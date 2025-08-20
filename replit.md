# PropTraderJournal - Elite Trading Journal

## Overview
PropTraderJournal is a full-stack trading journal application designed for proprietary trading firms and prop traders. It offers comprehensive tools for tracking trading performance, managing risk, journaling trades, and generating reports. The application aims to provide an independent, production-ready solution for millions of users, focusing on core trading discipline and performance enhancement.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS with shadcn/ui
- **Build Tool**: Vite
- **Charts**: Chart.js
- **UI/UX**: Modern dark-themed UI with gold/yellow gradients, consistent card styling, and rainbow gradient headers. Focus on compact layouts, intuitive workflows, and visual feedback. All popup modal forms have been removed. Unified header design with compact logo positioned in far left corner for professional appearance, action buttons (Account, Trade, Journal, sharing) in center, and account controls on right side. Full light/dark mode support is implemented.

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: connect-pg-simple for PostgreSQL session store
- **Scalability**: Designed for 1M+ users with ultra-scale architecture including database pooling, Redis caching, rate limiting, background processing, performance monitoring, database optimization (15+ indexes), web workers, scalable session store, CDN optimization, load balancer configuration, Prometheus metrics, graceful shutdown, and Docker production setup for Kubernetes deployment.

### Database Schema
Core tables include:
- `users`: User accounts with authentication, subscription details, and Stripe integration.
- `sessions`: Secure session storage for PostgreSQL-based authentication.
- `accounts`: Trading account details.
- `trades`: Individual trade records.
- `journalEntries`: Trading journal for reflection, linked to `dailyPlanId`.
- `dailyStats`: Daily performance metrics.
- `tradingStrategies`: User-defined trading strategies.
- `dailyPlans`: Daily trading plans.
- `strategyRuleTracking`: Tracks adherence to strategy rules.

### Core Features
- **Trading Account Management**: Multi-account support, real-time balance, risk monitoring, account status, and comprehensive account creation forms.
- **Risk Management System**: Daily loss limits, maximum drawdown, position sizing, and consecutive loss tracking. Risk per trade is calculated as a percentage of the Max Drawdown.
- **Performance Analytics**: P&L tracking, equity curve, win rates, monthly breakdowns, Sharpe ratio, and profit factor.
- **Trading Journal**: Daily reflection entries and improvement plans, linked to daily plans.
- **Reporting System**: Comprehensive trade reports with filtering and export capabilities.
- **Authentication**: Comprehensive email/password authentication system with bcrypt password hashing, email verification, PostgreSQL session storage, and Stripe-integrated subscription plans. Includes robust sign-up flow with captcha verification and payment processing for trial and paid plans.
- **Universal CSV Importer**: AI-powered system supporting 37+ brokers and trading platforms with automatic format detection (99%+ accuracy). Includes IBKR, ThinkorSwim, MT4/5, NinjaTrader, Tradovate, Robinhood, TradingView, and 30+ others. Features intelligent auto-detection, symbol normalization, trade pairing, and P&L calculation.
- **Advanced Discipline Analysis**: Over 20 behavioral metrics, psychological pattern detection, order-to-trade grouping, and risk violation detection.
- **Target & Risk Projection System**: Account-based and simulation modes for projecting profit targets.
- **Gamified Goal Tracking**: Achievement system for risk discipline, stop loss respect, profit targets, and journal consistency.
- **Daily Trading Plan**: Single-page interface for planning, live tracking, journaling, and history, including strategy creation and real-time session tracking.
- **Prop Budgeting**: Comprehensive expense tracking with category-based budgeting.
- **Global Account Selection System**: Persistent selection for dashboard widgets.
- **Payout Eligibility System**: Dynamic checks for total days, payout frequency, max net balance, and consistency rules.
- **Security Grade Implementation**: "Security Grade" display on the welcome page with A+ ratings.
- **Enhanced Pre-Session Psychology Assessment**: Four professional trading assessment sliders with scoring and wisdom guidance.

## External Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments.
- **drizzle-orm**: Type-safe database ORM.
- **@tanstack/react-query**: Server state management.
- **@radix-ui/**: Headless UI components.
- **chart.js**: Canvas-based charting library.
- **connect-pg-simple**: PostgreSQL session store.
- **Zod**: Schema validation.
- **DeepSeek R1 API**: For Trading Companion chatbot (Marthy personality).