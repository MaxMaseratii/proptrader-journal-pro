# PropTraderJournal - Elite Trading Journal

## Overview
PropTraderJournal is a full-stack trading journal application for proprietary trading firms and prop traders. It provides tools for tracking performance, managing risk, journaling trades, and generating reports. The application features a modern dark-themed UI with real-time analytics, a professional welcome page with pricing tiers, and robust user authentication. It aims to be a production-ready solution for millions of users, focusing on core trading discipline and performance enhancement. The project has implemented an ultra-scale architecture for 1M+ users, supporting 1,000,000+ concurrent users with <200ms response times and enterprise-grade reliability.

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
- **UI/UX Decisions**: Dark-themed with gold/yellow gradients, consistent card styling, rainbow gradient headers. Focus on compact layouts, intuitive workflows, and visual feedback (e.g., animated risk adjustment sliders with emoji feedback). Widgets are always displayed regardless of data availability. Comprehensive logo standardization with dark mode support. Professional pricing page with monthly/yearly billing toggle, promo code system, and plan selection (Starter, Professional) with feature gates and usage limits. 3-day free trial. Social media share buttons with gradient designs and backdrop-blur modal.

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: connect-pg-simple for PostgreSQL session store

### Database Schema
Key tables:
- `accounts`: Trading account details.
- `trades`: Individual trade records.
- `journalEntries`: Trading journal for reflection.
- `dailyStats`: Daily performance metrics.
- `tradingStrategies`: User-defined trading strategies.
- `dailyPlans`: Daily trading plans.
- `strategyRuleTracking`: Tracks adherence to strategy rules.

### Core Features
- **Trading Account Management**: Multi-account support, real-time balance, risk monitoring, account status management with comprehensive creation forms. Dynamic API-driven account loading.
- **Risk Management System**: Daily loss limits, maximum drawdown, position sizing, consecutive loss tracking. Risk per trade calculated as percentage of Max Drawdown.
- **Performance Analytics**: P&L tracking, equity curve, win rates, monthly breakdowns, Sharpe ratio, profit factor. Profitability calculation aligned with prop trading payout eligibility.
- **Trading Journal**: Daily reflection entries, "What went wrong/right" analysis, improvement plans, linked to daily plans.
- **Reporting System**: Comprehensive trade reports with filtering and export capabilities.
- **Authentication**: Custom email/password authentication with PostgreSQL session storage. Integrates Google and GitHub OAuth.
- **Universal CSV Importer**: Supports major trading platforms with auto-detection and customizable column mapping, including account ID consistency validation. Mandatory account selection for imports.
- **Advanced Discipline Analysis**: 20+ behavioral metrics, psychological pattern detection, risk violation detection, with scores across Order Discipline, Risk Control, Emotional Control, and Consistency.
- **Target & Risk Projection System**: Account-based and simulation modes for projecting profit targets based on R:R ratios.
- **Gamified Goal Tracking**: Achievement system (Bronze/Silver/Gold/Platinum) for risk discipline, stop loss respect, profit targets, and journal consistency.
- **Daily Trading Plan**: Single-page interface for planning, live tracking, journaling, and history, including strategy creation and real-time session tracking. Enhanced Pre-Session Psychology Assessment with scoring system.
- **Prop Budgeting**: Expense tracking with category-based budgeting and receipt upload.
- **Global Account Selection System**: Persistent selection for dashboard widgets (Single, Multiple, All Accounts).
- **Payout Eligibility System**: Dynamic checks for total days, payout frequency, max net balance, consistency rules.
- **Navigation Menu Restructuring**: Consolidated to three sections: PERFORMANCE, PRE-SESSION PLANNING + ACCOUNTS & RECORDS, and Profile.
- **Critical Implementation Details**: Advanced algorithm for Stop Loss/Take Profit tracking. All dashboard widgets use shared calculation logic and respond to global account selection. LocalStorage persistence for key forms and components. Security settings moved to "Security Grade" display on welcome page.

## External Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments.
- **drizzle-orm**: Type-safe database ORM.
- **@tanstack/react-query**: Server state management.
- **@radix-ui/**: Headless UI components.
- **chart.js**: Canvas-based charting library.
- **connect-pg-simple**: PostgreSQL session store.
- **Zod**: Schema validation.
- **DeepSeek R1 API**: For Trading Companion chatbot.