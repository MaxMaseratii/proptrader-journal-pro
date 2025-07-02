# PropJournal Pro - Elite Trading Journal

## Overview

PropJournal Pro is a full-stack trading journal application designed specifically for proprietary trading firms and prop traders. It provides comprehensive tools for tracking trading performance, managing risk, journaling trades, and generating reports. The application features a modern dark-themed UI with real-time analytics, professional welcome page with pricing tiers, and complete user authentication via Replit Auth.

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
- June 29, 2025. Enhanced account creation with financial tracking:
  * Added purchase method tracking (credit card, PayPal, crypto, etc.)
  * Added reset count and cost tracking for failed accounts
  * Added activation cost and payment status tracking
  * Added option to specify if activation fee is included in purchase price
- June 29, 2025. Enhanced dashboard with financial analytics:
  * Added financial tracking summary showing total spent on accounts
  * Added total activation costs and combined investment totals
  * Added account type counters (Challenge, Failed, Live, Funded)
  * Moved Create Account button to top-right of accounts page
  * Moved trader profile and subscription info to sidebar
  * Moved trading calendar to bottom of dashboard in compact format
- June 29, 2025. Updated database schema:
  * Added financial tracking fields: accountCost, purchaseMethod, resetCount, totalResetsCost
  * Added activation tracking: activationCost, activationPaid, includesActivationFee
- June 29, 2025. Implemented advanced analytics and reporting system:
  * Created comprehensive Analytics page with advanced performance metrics
  * Added Sharpe ratio, profit factor, expectancy, and Kelly criterion calculations
  * Implemented disciplined trading score analysis with risk violation tracking
  * Created tabbed interface with Overview, Detailed Analysis, and Comparison views
  * Added time-based performance analysis (daily, weekly, monthly breakdowns)
  * Enhanced Reports page with integrated report generator and export capabilities
  * Added customizable report generation with multiple export formats (JSON, CSV, Excel, PDF)
  * Implemented quick export functionality and report templates
  * Added "Advanced Analytics" navigation item with Brain icon to sidebar
  * Integrated comprehensive chart visualizations for performance tracking
- June 30, 2025. Complete rebrand and authentication system overhaul:
  * Rebranded application from "PropTracker Pro" to "PropJournal Pro - Elite Trading Journal"
  * Implemented complete user authentication system using Replit Auth and PostgreSQL
  * Created professional welcome page inspired by Tradezella with pricing tiers and features
  * Added user sign-up flow with Free, Pro Trader ($9.99/month), and Firm Elite ($14.99/month) plans
  * Implemented authentication routing - welcome page for unauthenticated users
  * Protected all API routes with authentication middleware
  * Added professional testimonials, feature showcases, and call-to-action sections
  * Updated sidebar branding and added logout functionality
  * Enhanced SEO with proper meta tags and descriptions focused on prop trading journal
- July 1, 2025. Enhanced navigation and payment system:
  * Added CSV import route (/csv-import) to main application routing
  * Updated pricing structure to $9.99/month for Pro Trader and $14.99/month for Firm Elite
  * Ensured all clickable elements have proper navigation functionality
  * Enhanced dropdown navigation for trade views with full year selection
  * Maintained unique design identity with glass morphism effects and proper color scheme
- July 1, 2025. Enhanced trading management with manual entry integration:
  * Added spending page with complete financial overview and entry form
  * Added spending navigation item to sidebar with credit card icon
  * Integrated manual trade entry into trades page using tabbed interface
  * Added "Add Trade" and "View All Trades" tabs for better user experience
  * Made manual trade entry easily accessible from main navigation
  * Both manual spending entry and manual trade entry now fully functional
- July 1, 2025. Advanced Target & Risk Projection System:
  * Created comprehensive "Target & Risk Projection" page positioned under Dashboard
  * Implemented dual-mode functionality: Account-based and Simulation modes
  * Account mode: Select existing accounts, uses real trading data for projections
  * Simulation mode: Complete custom projection from scratch
  * Real-time calculation of days needed to reach profit targets based on RR ratios
  * Interactive settings panel with starting capital, risk per trade, RR ratio configuration
  * Daily projection timeline table showing risk, reward, and cumulative targets
  * Visual progress tracking with actual vs projected performance comparison
  * Support for multiple account selection and compounding effects
  * Professional UI matching application's gold/black/blue color scheme
- July 1, 2025. Animated Risk Adjustment Slider with Emoji Feedback:
  * Implemented interactive animated sliders for risk cutting and compounding percentages
  * Added dynamic emoji feedback that changes based on risk levels (😐😌😟😰😱 for risk cutting, 🔒📈🚀💎🔥 for compounding)
  * Created smooth CSS animations with bounce effects for emoji hover states
  * Added real-time visual preview showing before/after risk amounts when settings change
  * Implemented gradient slider animations with hover effects and ripple animations
  * Added contextual badges with color-coded feedback (red for risk cutting, green for compounding)
  * Live effect preview panel shows immediate impact of slider adjustments on trading amounts
- July 1, 2025. Fixed Risk Cutting Emoji Theme & CSV Import Error:
  * Changed risk cutting emojis from fear-based (😟😰😱) to protective/responsible theme (🛡️🔒🏛️)
  * Fixed CSV import authentication error by adding isAuthenticated middleware and correcting parameter names
  * Risk cutting now properly represents account protection and responsible trading behavior
- July 1, 2025. Gamified Goal Tracking with Achievement System:
  * Created comprehensive achievement system with Bronze/Silver/Gold/Platinum levels
  * Added achievement categories: Risk Discipline, Stop Loss Respect, Profit Targets, Journal Consistency
  * Implemented user stats tracking: discipline score, streak counters, total points, user level
  * Created achievement badges and progress tracking with visual feedback
  * Added default achievements: Risk Guardian, Iron Discipline, Target Master, Consistent Learner
  * Achievement system promotes responsible trading behaviors and prevents emotional trading
  * Added achievements page with filtering, progress bars, and unlocked achievement tracking
  * Integrated trophy icon in sidebar navigation for easy access to achievement center
- July 2, 2025. Advanced Platform Features & Dashboard Enhancements:
  * Created advanced platform with 5 comprehensive features: customizable drag-and-drop dashboard, AI trading mentor chatbot, strategy export/sharing, real-time data integration, community forum
  * Fixed CSV import routing issue - corrected endpoint from /api/csv-import to /api/trades/import-csv for proper functionality
  * Verified dashboard color enhancement system - all numbers properly colored (gold for zero, green for positive, pink for negative)
  * Confirmed Trade Analysis Calendar with multiple view modes (yearly, weekly, daily, monthly navigation)
  * Validated projection saving system with complete database schema for locked projections and adjustment suggestions
  * All 5 requested dashboard enhancement tasks successfully implemented and verified working
- July 2, 2025. Major UI/UX and Functionality Fixes:
  * Implemented complete Advanced Analytics features - removed "coming soon" placeholders and added comprehensive Detailed Analysis and Comparison tabs
  * Updated Risk Management color coding system: red (90%+ usage), orange (70%+ usage), yellow (50%+ usage), green (safe usage)
  * Removed FTT prop firm payout rules (5-day, 10-day payouts) and replaced with user account data display
  * Fixed Discipline Analysis Select component error by changing empty string value to "all" for All Accounts option
  * Fixed CSV import format error by supporting both csvData and csvContent parameters in backend
  * Removed Advanced Platform dashboard entirely from application routing and navigation
  * Moved user profile to Analytics section with initials-only display and colored dropdown menu icons
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```