# Complete Build Prompt: PropTraderJournal - Elite Trading Journal

## PROJECT OVERVIEW
Build a comprehensive proprietary trading journal application designed for prop traders and trading firms. This is a production-ready application that serves millions of users worldwide with complete data integrity, advanced analytics, and psychological trading insights.

## CRITICAL REQUIREMENTS
- **ZERO HARDCODED DATA**: All data must come from user input (account creation, CSV imports, manual entries)
- **PRODUCTION-LEVEL DATA INTEGRITY**: Built for millions of users with proper error handling
- **COMPLETE AUTHENTICATION**: Uses Replit Auth with PostgreSQL session storage
- **REAL-TIME SYNCHRONIZATION**: All widgets and components must sync with account selection
- **COMPREHENSIVE PERSISTENCE**: All forms remember user input between sessions using localStorage

## TECHNICAL ARCHITECTURE

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Library**: shadcn/ui components with Tailwind CSS
- **Charts**: Chart.js for performance visualization
- **Build Tool**: Vite with HMR support

### Backend Stack
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: connect-pg-simple for PostgreSQL sessions

### Database Schema (shared/schema.ts)
```typescript
// Users table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  personalHourlyWage: decimal("personal_hourly_wage", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sessions table (mandatory for Replit Auth)
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Accounts table - Core entity
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // 'challenge', 'funded', 'live'
  firm: varchar("firm"),
  size: decimal("size", { precision: 15, scale: 2 }),
  status: varchar("status").default('active'),
  
  // Financial tracking
  accountCost: decimal("account_cost", { precision: 10, scale: 2 }),
  purchaseMethod: varchar("purchase_method"),
  resetCount: integer("reset_count").default(0),
  totalResetsCost: decimal("total_resets_cost", { precision: 10, scale: 2 }),
  activationCost: decimal("activation_cost", { precision: 10, scale: 2 }),
  activationPaid: boolean("activation_paid").default(false),
  includesActivationFee: boolean("includes_activation_fee").default(false),
  
  // Risk settings
  riskPerTrade: decimal("risk_per_trade", { precision: 10, scale: 2 }),
  riskRewardRatio: decimal("risk_reward_ratio", { precision: 5, scale: 2 }),
  maxDailyTrades: integer("max_daily_trades"),
  dailyLossLimit: decimal("daily_loss_limit", { precision: 10, scale: 2 }),
  maxDrawdown: decimal("max_drawdown", { precision: 15, scale: 2 }),
  profitTarget: decimal("profit_target", { precision: 15, scale: 2 }),
  
  // Payout rules
  daysRequiredForPayout: integer("days_required_for_payout"),
  winningDayMinimum: decimal("winning_day_minimum", { precision: 10, scale: 2 }),
  minimumPayoutAmount: decimal("minimum_payout_amount", { precision: 10, scale: 2 }),
  maxNetBalanceForPayout: decimal("max_net_balance_for_payout", { precision: 15, scale: 2 }),
  consistencyRulePercent: decimal("consistency_rule_percent", { precision: 5, scale: 2 }),
  profitSplit: decimal("profit_split", { precision: 5, scale: 2 }),
  
  // Trading assets
  tradingAssets: text("trading_assets").array(),
  
  // CSV import security
  csvAccountId: varchar("csv_account_id"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trades table
export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id),
  userId: varchar("user_id").references(() => users.id),
  
  // Trade details
  symbol: varchar("symbol").notNull(),
  side: varchar("side").notNull(), // 'long', 'short'
  quantity: decimal("quantity", { precision: 15, scale: 8 }),
  entryPrice: decimal("entry_price", { precision: 15, scale: 8 }),
  exitPrice: decimal("exit_price", { precision: 15, scale: 8 }),
  
  // Stop loss and take profit tracking
  initialStopLoss: decimal("initial_stop_loss", { precision: 15, scale: 8 }),
  finalStopLoss: decimal("final_stop_loss", { precision: 15, scale: 8 }),
  initialTakeProfit: decimal("initial_take_profit", { precision: 15, scale: 8 }),
  finalTakeProfit: decimal("final_take_profit", { precision: 15, scale: 8 }),
  
  // P&L and risk
  pnl: decimal("pnl", { precision: 15, scale: 2 }),
  riskAmount: decimal("risk_amount", { precision: 15, scale: 2 }),
  riskRewardRatio: decimal("risk_reward_ratio", { precision: 5, scale: 2 }),
  
  // Timestamps
  date: date("date").notNull(),
  entryTime: time("entry_time"),
  exitTime: time("exit_time"),
  
  // Trade documentation
  tradeImage: varchar("trade_image"),
  tradingViewLink: varchar("trading_view_link"),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Journal entries table
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id),
  userId: varchar("user_id").references(() => users.id),
  date: date("date").notNull(),
  
  // Journal content
  whatWentWrong: text("what_went_wrong"),
  whatWentRight: text("what_went_right"),
  lessonsLearned: text("lessons_learned"),
  improvementPlan: text("improvement_plan"),
  emotionalState: varchar("emotional_state"),
  marketConditions: text("market_conditions"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Spending records table
export const spendingRecords = pgTable("spending_records", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id),
  userId: varchar("user_id").references(() => users.id),
  
  // Spending details
  description: varchar("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category").notNull(),
  date: date("date").notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Projections table (shared/projection-schema.ts)
export const projections = pgTable("projections", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id),
  userId: varchar("user_id").references(() => users.id),
  
  // Projection settings
  mode: varchar("mode").notNull(), // 'account' or 'simulation'
  startingCapital: decimal("starting_capital", { precision: 15, scale: 2 }),
  riskPerTrade: decimal("risk_per_trade", { precision: 10, scale: 2 }),
  riskRewardRatio: decimal("risk_reward_ratio", { precision: 5, scale: 2 }),
  profitTarget: decimal("profit_target", { precision: 15, scale: 2 }),
  maxDrawdown: decimal("max_drawdown", { precision: 15, scale: 2 }),
  
  // Risk management
  riskCuttingPercent: decimal("risk_cutting_percent", { precision: 5, scale: 2 }),
  compoundingPercent: decimal("compounding_percent", { precision: 5, scale: 2 }),
  maxLossPerDay: decimal("max_loss_per_day", { precision: 10, scale: 2 }),
  extraDaysIfLoss: integer("extra_days_if_loss"),
  maxDailyTrades: integer("max_daily_trades"),
  
  // Projection data
  projectionData: jsonb("projection_data"), // Array of ProjectionDay objects
  isLocked: boolean("is_locked").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

## AUTHENTICATION IMPLEMENTATION

### Replit Auth Setup (server/replitAuth.ts)
```typescript
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import connectPg from "connect-pg-simple";

// Must handle multiple domains and refresh tokens
// Session storage MUST use PostgreSQL, not memory
// Implement proper token refresh and expiration handling
```

### Protected Routes Pattern
```typescript
// All API routes must use isAuthenticated middleware
app.get('/api/accounts', isAuthenticated, async (req, res) => {
  const userId = req.user.claims.sub;
  // Implementation
});
```

## CORE FEATURES TO IMPLEMENT

### 1. Dashboard Page (client/src/pages/dashboard.tsx)
**Critical Widget Requirements:**
- **Weekly Performance Calendar**: 7-day grid showing daily P&L, risk metrics, and targets
- **Account Discipline Analysis**: Real-time discipline scoring with comprehensive metrics
- **Risk Management**: Live risk usage with color coding (red >90%, orange >70%, yellow >50%, green safe)
- **Trading Charts Preview**: Interactive charts with hover tooltips showing trade details
- **Active Trading Days**: Shows unique trading days and working hours calculations
- **Recent Trading Activity**: Latest trades with P&L coloring
- **Investment ROI**: Financial tracking with total spent vs profits
- **Personal Hourly Wages**: Profitability per hour worked
- **Account Selection**: Global dropdown affecting all widgets except Payout Status

**Dashboard Data Flow:**
```typescript
// Daily target calculation (CRITICAL - user reported bug)
const dailyTarget = (() => {
  if (projections && projections.length > 0) {
    const accountProjections = projections.filter(p => 
      selectedAccountIds.includes(p.accountId)
    );
    
    if (accountProjections.length > 0) {
      return accountProjections.reduce((sum, proj) => {
        const riskPerTrade = proj.riskPerTrade || 0;
        const riskRewardRatio = proj.riskRewardRatio || 2.0;
        return sum + (riskPerTrade * riskRewardRatio); // Single trade target
      }, 0) / accountProjections.length;
    }
  }
  
  // Fallback to account settings
  return selectedAccounts.reduce((sum, acc) => {
    const riskPerTrade = acc.riskPerTrade || 0;
    const riskRewardRatio = acc.riskRewardRatio || 2.0;
    return sum + (riskPerTrade * riskRewardRatio);
  }, 0) / selectedAccounts.length;
})();
```

### 2. Account Management (client/src/pages/projections.tsx)
**Account Creation Form - 4 Tabs:**
1. **Account Info & Rules**: Name, type, firm, size, profit target, consistency rules
2. **Financial Tracking**: Cost, purchase method, reset count, activation costs
3. **Payout Rules**: Days required, winning day minimum, profit split, max net balance
4. **Risk Settings**: Risk per trade, RR ratio, daily loss limit, max drawdown

**Payout Eligibility Logic:**
```typescript
// Challenge accounts: Focus on passing challenge
// Funded/Live accounts: Check all requirements
const isPayoutEligible = (account, trades) => {
  if (account.type === 'challenge') return false;
  
  const netBalance = account.size + totalPnl;
  const hasExceededMaxNet = netBalance > account.maxNetBalanceForPayout;
  const hasMinimumPayout = (netBalance - account.maxNetBalanceForPayout) >= account.minimumPayoutAmount;
  
  return hasExceededMaxNet && hasMinimumPayout;
};
```

### 3. Trading Interface (client/src/pages/trades.tsx)
**Dual Interface:**
- **Manual Trade Entry**: Complete form with trade documentation (images, TradingView links)
- **CSV Import**: Universal importer supporting all major platforms (Tradovate, MT4/5, etc.)

**CSV Import Features:**
- Platform auto-detection
- Column mapping interface
- Account ID validation security
- Advanced SL/TP tracking algorithm
- Real-time preview with analytics

### 4. Advanced Analytics (client/src/pages/analytics.tsx)
**5-Tab System:**
1. **Overview**: Basic performance metrics
2. **Detailed Analysis**: Advanced calculations (Sharpe ratio, profit factor, Kelly criterion)
3. **Comparison**: Multi-account comparisons
4. **Reports**: Export functionality (JSON, CSV, Excel, PDF)
5. **Discipline Analysis**: Comprehensive psychological analysis

### 5. Discipline Analysis System (client/src/lib/discipline-calculator.ts)
**Comprehensive Scoring Algorithm:**
```typescript
export const calculateComprehensiveDisciplineMetrics = (trades: Trade[]) => {
  // 6 weighted categories:
  // Risk Management (25%)
  // Emotional Control (20%)
  // Strategy Adherence (20%)
  // Market Analysis (15%)
  // Time Management (10%)
  // Continuous Learning (10%)
  
  return {
    disciplineScore: overallScore,
    riskManagementScore,
    emotionalControlScore,
    strategyAdherenceScore,
    marketAnalysisScore,
    timeManagementScore,
    continuousLearningScore
  };
};
```

### 6. Projection System (client/src/pages/projections.tsx)
**Dual Mode System:**
- **Account Mode**: Uses existing account data
- **Simulation Mode**: Custom projection from scratch

**Risk Adjustment Features:**
- Animated sliders with emoji feedback
- Risk cutting: 🛡️🔒🏛️ (protective theme)
- Compounding: 🔒📈🚀💎🔥 (growth theme)
- Real-time effect preview
- Projection saving and locking system

### 7. Data Persistence (localStorage Integration)
**Forms with Persistence:**
- Trading journal entries
- Projection settings
- Trade entry form
- Account preferences

**Implementation Pattern:**
```typescript
// Save form data on change
useEffect(() => {
  localStorage.setItem('trade-entry-form', JSON.stringify(formData));
}, [formData]);

// Load on component mount
useEffect(() => {
  const saved = localStorage.getItem('trade-entry-form');
  if (saved) {
    setFormData(JSON.parse(saved));
  }
}, []);
```

## STYLING AND THEMING

### Color Scheme (Tailwind CSS)
```css
:root {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --card: 0 0% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 0 0% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 0 0% 9%;
  --secondary: 0 0% 14.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 0 0% 14.9%;
  --muted-foreground: 0 0% 63.9%;
  --accent: 0 0% 14.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 14.9%;
  --input: 0 0% 14.9%;
  --ring: 0 0% 83.1%;
  --gold: 45 100% 50%;
  --chart-1: 12 76% 61%;
  --chart-2: 173 58% 39%;
  --chart-3: 197 37% 24%;
  --chart-4: 43 74% 66%;
  --chart-5: 27 87% 67%;
}
```

### Widget Styling Pattern
```typescript
// Golden widget style with glass morphism
const widgetStyle = `
  bg-gradient-to-br from-black/95 via-gray-900/90 to-black/95 
  border border-gray-700 rounded-lg p-6
  hover:border-gold hover:shadow-lg hover:shadow-gold/50
  transition-all duration-300
`;
```

## WELCOME PAGE (client/src/pages/welcome.tsx)
**Professional Landing Page:**
- Tradezella-inspired design
- Pricing tiers: Basic ($9.99), Pro ($14.99), Premium ($29.99)
- 15-day free trials
- Feature showcase with real data snapshots
- User testimonials
- SEO optimization

## NAVIGATION STRUCTURE
```typescript
// Sidebar navigation items
const navigationItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Accounts • Risk Management & Target Projection Planning", path: "/projections", icon: Target },
  { name: "Trading Journal", path: "/journal", icon: BookOpen },
  { name: "Trade Management", path: "/trades", icon: TrendingUp },
  { name: "Advanced Analytics", path: "/analytics", icon: Brain },
  { name: "MMM Disciplinary Coach", path: "/disciplinary-assistant", icon: GraduationCap },
  { name: "Payouts", path: "/payouts", icon: Wallet },
  { name: "Spending", path: "/spending", icon: CreditCard },
  { name: "Reports", path: "/reports", icon: FileText },
  { name: "Achievements", path: "/achievements", icon: Trophy },
];
```

## CRITICAL IMPLEMENTATION NOTES

### 1. Data Integrity Requirements
- **NO HARDCODED VALUES**: All data from user input only
- **Proper Error Handling**: Production-ready error states
- **Data Validation**: Zod schemas for all forms
- **Authentication**: All API routes protected

### 2. Performance Optimization
- **React Query**: Proper caching and invalidation
- **Lazy Loading**: Components loaded on demand
- **Memoization**: Expensive calculations cached
- **Database Indexing**: Proper indexes for queries

### 3. User Experience
- **Real-time Updates**: Immediate UI feedback
- **Responsive Design**: Mobile-first approach
- **Loading States**: Skeleton screens and spinners
- **Error Boundaries**: Graceful error handling

### 4. Security
- **CSRF Protection**: Proper token validation
- **Input Sanitization**: All user inputs validated
- **Session Management**: Secure session handling
- **Domain Validation**: Replit Auth domain restrictions

## DEPLOYMENT CONFIGURATION

### Environment Variables Required
```env
DATABASE_URL=postgresql://...
SESSION_SECRET=your-session-secret
REPL_ID=your-repl-id
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=your-domain.replit.dev
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --bundle --platform=node --outfile=dist/index.js",
    "start": "NODE_ENV=production node dist/index.js",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

## FINAL VERIFICATION CHECKLIST

### Before Deployment
- [ ] All forms have data persistence
- [ ] Dashboard widgets sync with account selection
- [ ] Daily target calculation works correctly (risk × RR, not × max trades)
- [ ] Payout eligibility logic implemented
- [ ] CSV import security validation
- [ ] Discipline calculator synchronized across components
- [ ] Authentication works on official Replit domain
- [ ] All API routes protected with isAuthenticated
- [ ] Database schema matches requirements
- [ ] Error handling in all components
- [ ] Mobile responsive design
- [ ] Performance optimization complete

### Post-Deployment Testing
- [ ] User registration and login flow
- [ ] Account creation with all 4 tabs
- [ ] Trade entry (manual and CSV import)
- [ ] Dashboard widget synchronization
- [ ] Projection system functionality
- [ ] Journal persistence
- [ ] Analytics calculations
- [ ] Discipline analysis accuracy
- [ ] Payout calculations
- [ ] Spending tracking
- [ ] Report generation
- [ ] Achievement system

## SUCCESS METRICS
- Dashboard shows correct daily target (risk × RR ratio)
- All widgets respond to account selection changes
- Forms remember user input between sessions
- CSV imports work for all major platforms
- Discipline scores synchronized across components
- Payout eligibility calculated correctly
- Real-time data updates throughout application
- Production-ready performance and security

Build this application with the exact specifications above. The result should be a professional, production-ready trading journal that serves millions of users with complete data integrity and comprehensive functionality.