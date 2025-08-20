# PropTraderJournal - AI Implementation Prompt

Build a comprehensive trading journal for prop traders with React 18 + TypeScript + Vite frontend, Node.js + Express + PostgreSQL + Drizzle ORM backend.

## Core Features
**Authentication:** Session-based auth with bcrypt, email verification, Stripe subscriptions (trial/basic/premium/pro)
**Multi-Account Trading:** Support challenge/funded/live accounts with individual risk rules and drawdown tracking
**Universal CSV Import:** AI-powered import supporting 37+ brokers (IBKR, ThinkorSwim, MT4/5, NinjaTrader, Tradovate, etc.) with automatic format detection
**Real-time Dashboard:** Interactive widgets showing P&L, win rates, risk metrics, account balances, calendar views
**Risk Management:** Position sizing, daily loss limits, drawdown monitoring, rule compliance tracking
**Trading Journal:** Daily entries with emotional state tracking, lessons learned, improvement plans
**Performance Analytics:** Equity curves, monthly breakdowns, win rates, profit factors, Sharpe ratios
**Spending Tracker:** Prop account costs, reset fees, budget planning with ROI calculations

## Tech Stack
Frontend: React 18, TypeScript, Vite, Wouter routing, TanStack Query, shadcn/ui, Tailwind CSS, Chart.js
Backend: Node.js, Express, TypeScript ESM, PostgreSQL, Drizzle ORM, bcrypt, express-session, Stripe
Database: PostgreSQL with 15+ optimized tables (users, accounts, trades, journal_entries, daily_stats, csv_imports, spending)

## Key Database Schema
- **users:** Authentication, subscriptions, Stripe integration, email verification
- **accounts:** Trading accounts with risk rules, drawdown limits, profit targets, firm details
- **trades:** Individual trades with P&L, risk compliance, order details, documentation
- **journal_entries:** Daily reflections linked to accounts and daily plans
- **daily_stats:** Performance metrics, drawdown tracking, rule violations
- **csv_imports:** Import history with broker detection and error tracking

## UI/UX Design
Dark theme with gold/yellow accents, gradient backgrounds (gray-900 to black), card-based layouts with glassmorphism effects, responsive mobile design, hover animations, profit/loss color coding (green/red), loading states and error handling.

## Authentication Flow
Session-based with PostgreSQL storage, bcrypt password hashing (12 salt rounds), email verification with tokens, Stripe customer creation for paid plans, trial period (7 days), secure cookies with httpOnly/secure flags.

## Critical Components
**Dashboard:** Real-time analytics widgets, account selection, calendar view, quick actions
**CSV Import:** File upload, broker detection, data preview, column mapping, batch processing
**Trading Journal:** Rich text entries, emotional tracking, image attachments, calendar integration
**Account Management:** Multi-step forms, risk configuration, prop firm templates
**Performance Reports:** Interactive charts, export functionality, custom date ranges

## API Endpoints
Auth: /api/auth/{signup,login,logout,verify-email,user}
Data: /api/{accounts,trades,journal-entries,analytics,csv-import,spending}
Features: Account CRUD, trade management, analytics aggregation, file processing, real-time data

## Security & Performance
Rate limiting (1000 req/15min), compression, session security, input validation with Zod, database indexing, query optimization, error handling, HTTPS ready, production deployment configs.

## Deployment Config
Express server on port 5000, Vite dev proxy, PostgreSQL connection pooling, environment variables for DATABASE_URL/SESSION_SECRET/Stripe keys, npm scripts for dev/build/db operations.

Implementation: Follow package.json dependencies, create project structure (client/src, server, shared), implement auth first, then core features, use consolidated prompts for detailed code.