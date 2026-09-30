# PropTrader Journal Pro - Trading Journal Application

Elite trading journal designed specifically for prop firm traders and futures traders. Track performance, manage risk, and pass challenges with professional-grade analytics.

## Application Structure

### Frontend (client/)
- **client/src/** - React TypeScript application
  - components/ - UI components and trading interface
  - pages/ - Application pages and routes
  - lib/ - Utilities and client-side logic
  - hooks/ - React hooks for state management
  - contexts/ - React context providers

### Backend (server/)
- **server/** - Express.js server with TypeScript
  - index.ts - Main server entry point
  - routes.ts - API route definitions
  - db.ts - Database connection and setup
  - auth.ts - Authentication logic
  - storage.ts - File and data storage
  - vite.ts - Vite development server setup

### Database Schema (shared/)
- **shared/schema.ts** - Drizzle ORM table definitions
- Includes tables for: accounts, trades, journal entries, daily stats, projections, strategies, daily plans, and more

## Key Features

- Advanced trading journal for prop traders
- Real-time dashboard with performance analytics
- CSV import for trade data
- Risk management and position sizing
- Account tracking and challenge management
- Discipline scoring system
- Achievement badges and statistics
- Strategy management
- Daily planning and reflective journal
- Payout tracking and calculations

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Express.js, TypeScript, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Build Tools**: Vite, esbuild
- **Auth**: Passport.js (local, GitHub, Google OAuth)
- **Payment**: Stripe integration
- **File Upload**: Uppy, AWS S3
- **Charts**: Recharts, Chart.js, Lightweight Charts
- **State Management**: React Query, React Context

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Production

```bash
npm run start
```

## Configuration Files

- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite bundler configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `drizzle.config.ts` - Database migration configuration

## Database

Uses PostgreSQL with Drizzle ORM for type-safe database access.

### Setup Database

```bash
npm run db:push
```

## Environment Variables

Create a `.env` file with necessary credentials:
- DATABASE_URL
- API Keys for third-party services
- OAuth credentials
- Stripe keys
- File storage credentials

## Notes

This application was extracted from Replit. For the complete list of all source files, see EXTRACTION_MANIFEST.md.

## License

MIT
