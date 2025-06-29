# PropTracker Pro - Trading Dashboard

## Overview

PropTracker Pro is a full-stack trading dashboard application designed for proprietary trading account management. It provides comprehensive tools for tracking trading performance, managing risk, journaling trades, and generating reports. The application features a modern dark-themed UI with real-time analytics and visualization capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite for development and production builds
- **Charts**: Chart.js for data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript (ESM modules)
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: connect-pg-simple for PostgreSQL session store
- **Development**: Hot module replacement with Vite integration

### Database Schema
The application uses PostgreSQL with four main tables:
- **accounts**: Trading account information (balance, drawdown limits, profit targets)
- **trades**: Individual trade records (entry/exit prices, P&L, symbols)
- **journalEntries**: Trading journal for reflection and improvement
- **dailyStats**: Daily performance metrics and statistics

## Key Components

### Trading Account Management
- Multi-account support for challenge and funded accounts
- Real-time balance tracking and risk monitoring
- Account status management (active, passed, failed, withdrawn)
- Firm-specific configurations and limits

### Risk Management System
- Daily loss limit monitoring with percentage tracking
- Maximum drawdown calculations and alerts
- Position sizing and risk metrics
- Consecutive loss tracking and win rate analysis

### Performance Analytics
- P&L tracking with equity curve visualization
- Win rate calculations and trade statistics
- Monthly performance breakdowns
- Sharpe ratio and profit factor calculations

### Trading Journal
- Daily reflection entries with structured prompts
- "What went wrong" and "What went right" analysis
- Improvement plan tracking
- Account-specific journal entries

### Reporting System
- Comprehensive trade reports with date range filtering
- Performance summaries and analytics
- Daily breakdown reports
- Export capabilities for external analysis

## Data Flow

1. **Client Request**: React components trigger API calls via TanStack Query
2. **Server Processing**: Express routes handle requests and validate data with Zod schemas
3. **Database Operations**: Drizzle ORM executes PostgreSQL queries
4. **Response**: JSON data flows back through the query client to update UI state
5. **Real-time Updates**: Query invalidation ensures fresh data across components

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe database ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Headless UI components for accessibility
- **chart.js**: Canvas-based charting library for performance visualization

### Development Tools
- **drizzle-kit**: Database schema management and migrations
- **tsx**: TypeScript execution for development server
- **esbuild**: Fast bundling for production builds
- **@replit/vite-plugin-***: Replit-specific development enhancements

## Deployment Strategy

### Development Mode
- Vite dev server with HMR for frontend development
- Express server with tsx for TypeScript execution
- Database migrations via `drizzle-kit push`
- Environment-based configuration with DATABASE_URL

### Production Build
- Vite builds React frontend to `dist/public`
- esbuild bundles Express server to `dist/index.js`
- Static file serving from built frontend
- Production-ready PostgreSQL connection

### Environment Configuration
- `NODE_ENV` for environment detection
- `DATABASE_URL` for PostgreSQL connection string
- Replit-specific plugins for development environment
- Error handling and logging middleware

## Changelog

```
Changelog:
- June 29, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```