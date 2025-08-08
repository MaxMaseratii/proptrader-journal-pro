# PropTraderJournal - Elite Trading Journal

## Overview
PropTraderJournal is a full-stack trading journal application designed for proprietary trading firms and prop traders. It offers comprehensive tools for tracking trading performance, managing risk, journaling trades, and generating reports. The application features a modern dark-themed UI with real-time analytics, professional welcome page with pricing tiers, and robust user authentication. It aims to provide an independent, production-ready solution for millions of users, eliminating external dependencies where possible and focusing on core trading discipline and performance enhancement.

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

### Recent Critical Fixes (August 2025)
- **Gold Accent Theme Restored (Aug 8, 2025)**: Restored complete gold accent branding throughout application. Logo now features gold tone background with "PropTrader" in gold gradient and "Journal" in black text. Enhanced welcome page, sidebar, and footer with consistent gold styling including buttons, badges, and CTA sections.
- **Hardcoded Account Data Eliminated (Aug 8, 2025)**: Completely removed hardcoded account entries "Main Trading (Live)", "Demo Account (Demo)", "Swing Trading (Live)" from trading-dashboard.tsx and replaced with dynamic API-driven account loading. All account dropdowns now use real accounts from account creation system.
- **Strategy Deletion API Fixed**: Corrected endpoint path from `/api/strategies/` to `/api/trading-strategies/` with confirmed 200 success responses.
- **Account Creation Dialog Integration**: Added account creation dialog to Account Management component with proper state management and user flow.
- **P&L Calculation Bug Fixed**: Corrected critical error where Net P&L was adding losses instead of subtracting them. Formula changed from `totalWinnings + totalLosses` to `totalWinnings - Math.abs(totalLosses)` in dashboard widgets.
- **Authentication Security Enhanced**: Fixed logout functionality - logo and sign-out now properly clear session and redirect to welcome page.
- **Account Selection Improved**: Added mandatory account selection for CSV imports with validation to prevent importing to wrong accounts.
- **UI Layout Optimizations**: Mental Check & Plan widget now uses entire available screen space with flex layout and minimal padding for maximum utilization.
- **Security Grade Implementation**: Renamed and moved security settings from profile page to welcome page as "Security Grade" with A+ ratings and comprehensive security metrics display.
- **Enhanced Pre-Session Psychology Assessment**: Added 4 professional trading assessment sliders (Market Regime Awareness, Risk Respect Level, Humility Check, Professional Trader Mindset) with 40-point scoring system and wisdom guidance text.

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: connect-pg-simple for PostgreSQL session store

### Database Schema
Four main tables:
- `accounts`: Trading account details.
- `trades`: Individual trade records, including `tradeImage` and `tradingViewLink`.
- `journalEntries`: Trading journal for reflection, linked to `dailyPlanId`.
- `dailyStats`: Daily performance metrics.
- `tradingStrategies`: User-defined trading strategies.
- `dailyPlans`: Daily trading plans, immutable except for `additionalNotes`.
- `strategyRuleTracking`: Tracks adherence to strategy rules.

### Core Features
- **Trading Account Management**: Multi-account support, real-time balance, risk monitoring, account status management. Includes comprehensive account creation forms (Account Info & Rules, Financial Tracking, Payout Rules, Risk Settings).
- **Risk Management System**: Daily loss limits, maximum drawdown, position sizing, consecutive loss tracking.
- **Performance Analytics**: P&L tracking, equity curve, win rates, monthly breakdowns, Sharpe ratio, profit factor.
- **Trading Journal**: Daily reflection entries, "What went wrong/right" analysis, improvement plans. Journal entries are linked to daily plans.
- **Reporting System**: Comprehensive trade reports with filtering and export capabilities.
- **Authentication**: Custom email/password authentication with PostgreSQL session storage, designed for scalability without external OAuth dependencies. Integrates Google and GitHub OAuth.
- **Universal CSV Importer**: Supports major trading platforms (Tradovate, MT4/5, Rithmic, CQG, NinjaTrader, Interactive Brokers, FTMO, TopstepTrader, ThinkorSwim, Binance) with intelligent auto-detection and customizable column mapping. Includes account ID consistency validation.
- **Advanced Discipline Analysis**: 20+ behavioral metrics, psychological pattern detection, order-to-trade grouping, risk violation detection. Scores across Order Discipline, Risk Control, Emotional Control, and Consistency.
- **Target & Risk Projection System**: Account-based and simulation modes for projecting profit targets based on R:R ratios. Includes locked projection system.
- **Gamified Goal Tracking**: Achievement system (Bronze/Silver/Gold/Platinum) for risk discipline, stop loss respect, profit targets, and journal consistency.
- **Daily Trading Plan**: Single-page interface for planning, live tracking, journaling, and history. Includes strategy creation and real-time session tracking.
- **Prop Budgeting**: Comprehensive expense tracking with category-based budgeting, receipt upload, and integration with account costs.
- **Global Account Selection System**: Persistent selection for dashboard widgets (Single, Multiple, All Accounts).
- **Payout Eligibility System**: Dynamic checks for total days, payout frequency, max net balance, consistency rules.
- **UI/UX**: Dark-themed with gold/yellow gradients, consistent card styling, rainbow gradient headers. Focus on compact layouts, intuitive workflows, and visual feedback (e.g., animated risk adjustment sliders with emoji feedback). Widgets are always displayed regardless of data availability.

### Critical Implementation Details
- **Risk Calculation**: Risk per trade is calculated as a percentage of the Max Drawdown amount, not starting capital.
- **Stop Loss/Take Profit Tracking**: Advanced algorithm to distinguish initial and final SL/TP levels, tracking movements and discipline.
- **Dashboard Synchronization**: All dashboard widgets use a shared calculation logic for consistency and respond to global account selection changes.
- **Data Persistence**: LocalStorage persistence for all key forms and components (journal, projections, trade entry).

## External Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments.
- **drizzle-orm**: Type-safe database ORM.
- **@tanstack/react-query**: Server state management.
- **@radix-ui/**: Headless UI components.
- **chart.js**: Canvas-based charting library.
- **connect-pg-simple**: PostgreSQL session store.
- **Zod**: Schema validation.
- **DeepSeek R1 API**: For Trading Companion chatbot (Marthy personality).
```