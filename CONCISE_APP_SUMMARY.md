# PropTraderJournal - AI Implementation Prompt

**App Name:** PropTraderJournal
**Logo:** Crown icon (Lucide Crown) + gold gradient text "PropTrader Journal" with tagline "Elite Trading Performance"
**Brand Colors:** Dark theme (gray-900/black backgrounds) with gold/amber accents (#FBBF24, #F59E0B)

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

## Account Creation Form Design
**Step 1: Basic Information**
- Account Name (text input)
- Account Type (select: Challenge/Funded/Live)
- Prop Firm (select with popular firms: FTMO, TopStep, MyForexFunds, etc.)
- Starting Balance (currency input with $ formatting)

**Step 2: Risk Parameters**
- Max Drawdown (currency + percentage inputs)
- Drawdown Type (select: End-of-Day/Unrealized Profit)
- Daily Loss Limit (toggle + currency input)
- Profit Target (currency input)
- Risk Per Trade (percentage input with slider)

**Step 3: Trading Preferences**
- Primary Trading Asset (select: Forex/Futures/Stocks/Crypto)
- Secondary Assets (multi-select)
- Max Position Size (number input)
- Max Trades Per Day (number input, 0 = unlimited)
- Trading Hours (time range picker)

**Step 4: Account Details**
- Account Cost (currency input)
- Purchase Method (select: Credit Card/PayPal/Wire)
- CSV Account ID (text input for import validation)
- Notes (textarea)

**Form Features:** Real-time validation, progress indicator, save draft functionality, prop firm templates (auto-fill common rules), responsive design with mobile optimization.

## UI/UX Design
Dark theme with gold/yellow accents, gradient backgrounds (gray-900 to black), card-based layouts with glassmorphism effects, responsive mobile design, hover animations, profit/loss color coding (green/red), loading states and error handling. Header design: compact logo (far left), center action buttons, right-side user controls.

## Authentication Flow
Session-based with PostgreSQL storage, bcrypt password hashing (12 salt rounds), email verification with tokens, Stripe customer creation for paid plans, trial period (7 days), secure cookies with httpOnly/secure flags.

## Page Structure & Integration

**1. Authentication Pages (/login, /signup)**
- Login: Email/password with "Remember me", password visibility toggle, "Sign up" link
- SignUp: Comprehensive form with subscription plan selection, terms agreement, demo captcha
- Integration: Session-based auth, email verification, Stripe customer creation

**2. Dashboard (/) - Main Hub**
- Header: Logo, account dropdown (global selection), quick action buttons (Trade/Journal/Share), user menu
- Overview Cards: Total P&L, Win Rate, Total Trades, Active Accounts (color-coded: green profits, red losses)
- Account Grid: Cards showing each account with balance, status badges, firm logos
- Quick Actions: "Add Trade", "Import CSV", "Journal Entry" buttons
- Integration: Real-time data from analytics API, account switching updates all widgets

**3. Account Management (/accounts)**
- Account Creation Form: Multi-step wizard (Basic Info → Risk Rules → Trading Preferences → Costs)
- Fields: Name, Type (Challenge/Funded/Live), Firm, Starting Balance, Max Drawdown, Daily Loss Limit, Profit Target, Risk Per Trade %, Trading Assets, Account Cost, CSV Account ID
- Account Dashboard: Status cards, balance tracking, risk monitoring, phase progression
- Integration: Form validation, automatic balance calculations, CSV import validation

**4. CSV Import (/csv-import)**
- Drag-drop file uploader, platform auto-detection (37+ brokers), data preview table
- Column mapping interface, validation with error reporting, import progress tracking
- Integration: Backend processing, account validation, duplicate detection, trade creation

**5. Trading Journal (/journal)**
- Daily entry form: Date picker, "What went right/wrong", improvement plans, emotional state sliders
- Image uploads for trade screenshots, calendar integration, search/filter functionality
- Integration: Linked to daily plans, account selection, calendar date synchronization

**6. Performance Analytics (/performance)**
- Interactive charts (Chart.js): Equity curve, monthly heatmap, win rate analysis
- Metrics dashboard: Sharpe ratio, profit factor, drawdown analysis, time-based performance
- Integration: Real-time data aggregation, exportable reports, date range filtering

## API Endpoints
Auth: /api/auth/{signup,login,logout,verify-email,user}
Data: /api/{accounts,trades,journal-entries,analytics,csv-import,spending}
Features: Account CRUD, trade management, analytics aggregation, file processing, real-time data

## Security & Performance
Rate limiting (1000 req/15min), compression, session security, input validation with Zod, database indexing, query optimization, error handling, HTTPS ready, production deployment configs.

## Deployment Config
Express server on port 5000, Vite dev proxy, PostgreSQL connection pooling, environment variables for DATABASE_URL/SESSION_SECRET/Stripe keys, npm scripts for dev/build/db operations.

Implementation: Follow package.json dependencies, create project structure (client/src, server, shared), implement auth first, then core features, use consolidated prompts for detailed code.