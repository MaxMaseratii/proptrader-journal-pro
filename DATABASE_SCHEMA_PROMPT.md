# Complete Database Schema Implementation Prompt

## Database Architecture Overview

**Prompt:**
Create a comprehensive PostgreSQL database schema for a professional trading journal application using Drizzle ORM. The schema should support multi-account trading, advanced analytics, risk management, and user subscription management.

## Core Schema Structure

### 1. Authentication & User Management

```typescript
// Session storage for PostgreSQL-based authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User subscription plans enum
export const subscriptionPlanEnum = pgEnum("subscription_plan", ["trial", "basic", "premium", "pro"]);

// Users table with authentication and subscription management
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  password: varchar("password").notNull(), // bcrypt hashed
  profileImageUrl: varchar("profile_image_url"),
  
  // Email verification
  emailVerified: boolean("email_verified").default(false),
  verificationToken: varchar("verification_token"),
  
  // Personal settings
  personalHourlyWage: real("personal_hourly_wage"),
  
  // Subscription management
  subscriptionPlan: subscriptionPlanEnum("subscription_plan").default("trial"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status").default("active"),
  trialEndsAt: timestamp("trial_ends_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### 2. Trading Account Management

```typescript
// Trading accounts table - supports challenge, funded, and live accounts
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Basic account information
  name: text("name").notNull(),
  type: text("type").notNull(), // 'challenge', 'funded', 'live'
  firm: text("firm").notNull(),
  status: text("status").notNull().default('active'), // 'active', 'passed', 'failed', 'withdrawn'
  
  // Financial parameters
  startingBalance: real("starting_balance").notNull(),
  maxDrawdown: real("max_drawdown").notNull(),
  maxDrawdownType: text("max_drawdown_type"), // 'eod', 'unrealized_profit'
  dailyLossLimit: real("daily_loss_limit"),
  hasDailyLossLimit: boolean("has_daily_loss_limit").default(false),
  dailyLossLimitAmount: real("daily_loss_limit_amount"),
  profitTarget: real("profit_target").notNull(),
  
  // Risk management settings
  riskPerTrade: real("risk_per_trade"),
  riskPercentage: real("risk_percentage"),
  riskRewardRatio: real("risk_reward_ratio").default(2.0),
  maxPositionSize: integer("max_position_size"),
  maxTradesPerDay: integer("max_trades_per_day").default(0),
  maxRiskPerDay: real("max_risk_per_day"),
  
  // Trading preferences
  primaryTradingAsset: text("primary_trading_asset"),
  secondaryTradingAsset: text("secondary_trading_asset"),
  preferredAssets: text("preferred_assets"), // JSON array
  
  // Account costs and fees
  accountCost: real("account_cost"),
  purchaseMethod: text("purchase_method"),
  activationCost: real("activation_cost"),
  activationPaid: boolean("activation_paid").default(false),
  
  // Challenge/evaluation settings
  numberOfPhases: integer("number_of_phases").default(1),
  phase1Target: real("phase1_target"),
  phase2Target: real("phase2_target"),
  minimumTradingDays: integer("minimum_trading_days"),
  timeLimit: integer("time_limit"), // days
  daysRequiredToPass: integer("days_required_to_pass"),
  
  // CSV import security
  csvAccountId: text("csv_account_id"), // For import validation
  
  // Payout settings
  daysRequiredForPayout: integer("days_required_for_payout"),
  minimumPayoutAmount: real("minimum_payout_amount"),
  maxNetBalanceForPayout: real("max_net_balance_for_payout"),
  payoutFrequency: text("payout_frequency"), // 'daily', 'weekly', 'monthly'
  profitSplit: real("profit_split"),
  
  // Account lifecycle
  parentChallengeId: integer("parent_challenge_id"),
  fundedAccountId: integer("funded_account_id"),
  challengePassedDate: timestamp("challenge_passed_date"),
  transitionStatus: text("transition_status").default('none'),
  
  createdAt: timestamp("created_at").defaultNow(),
});
```

### 3. Trade Management

```typescript
// Individual trade records
export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  
  // Basic trade information
  date: date("date").notNull(),
  symbol: text("symbol").notNull(),
  side: text("side").notNull(), // 'buy', 'sell'
  quantity: real("quantity").notNull(),
  entryPrice: real("entry_price").notNull(),
  exitPrice: real("exit_price"),
  pnl: real("pnl").notNull(),
  status: text("status").notNull().default('closed'), // 'open', 'closed'
  
  // Order details
  orderId: text("order_id"), // External order ID from CSV
  fillTime: timestamp("fill_time"),
  exitTime: timestamp("exit_time"),
  orderType: text("order_type"), // 'Market', 'Limit', 'Stop'
  originalQuantity: real("original_quantity"),
  commission: real("commission"),
  
  // Risk management
  riskAmount: real("risk_amount"),
  riskCompliance: boolean("risk_compliance").default(true),
  initialStopLoss: real("initial_stop_loss"),
  initialTakeProfit: real("initial_take_profit"),
  finalStopLoss: real("final_stop_loss"),
  finalTakeProfit: real("final_take_profit"),
  
  // Documentation
  notes: text("notes"),
  tradeImage: text("trade_image"), // Screenshot URL
  tradingViewLink: text("trading_view_link"),
  
  createdAt: timestamp("created_at").defaultNow(),
});
```

### 4. Journal & Daily Planning

```typescript
// Daily trading plans
export const dailyPlans = pgTable("daily_plans", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  date: date("date").notNull(),
  
  // Pre-market planning
  marketBias: text("market_bias"), // 'bullish', 'bearish', 'neutral'
  keyLevels: text("key_levels"), // JSON array of support/resistance
  tradingStrategy: text("trading_strategy"),
  riskBudget: real("risk_budget"),
  profitTarget: real("profit_target"),
  maxTrades: integer("max_trades"),
  
  // Session goals
  primarySetup: text("primary_setup"),
  secondarySetup: text("secondary_setup"),
  avoidanceRules: text("avoidance_rules"),
  marketEvents: text("market_events"), // Economic calendar events
  
  // Execution tracking
  planCompleted: boolean("plan_completed").default(false),
  goalsAchieved: boolean("goals_achieved").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Trading journal entries
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  dailyPlanId: integer("daily_plan_id").references(() => dailyPlans.id),
  date: date("date").notNull(),
  
  // Reflection content
  whatWentWrong: text("what_went_wrong"),
  whatWentRight: text("what_went_right"),
  improvementPlan: text("improvement_plan"),
  lessonsLearned: text("lessons_learned"),
  
  // Psychological tracking
  emotionalState: text("emotional_state"), // 'confident', 'nervous', 'excited', etc.
  disciplineScore: integer("discipline_score"), // 1-10 rating
  stressLevel: integer("stress_level"), // 1-10 rating
  
  // Market analysis
  marketConditions: text("market_conditions"),
  volatility: text("volatility"), // 'low', 'medium', 'high'
  
  // Media attachments
  attachments: text("attachments"), // JSON array of image URLs
  
  createdAt: timestamp("created_at").defaultNow(),
});
```

### 5. Performance Analytics

```typescript
// Daily statistics and performance metrics
export const dailyStats = pgTable("daily_stats", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  date: date("date").notNull(),
  
  // Balance tracking
  startingBalance: real("starting_balance").notNull(),
  endingBalance: real("ending_balance").notNull(),
  dailyPnl: real("daily_pnl").notNull(),
  
  // Trade statistics
  tradesCount: integer("trades_count").notNull().default(0),
  winningTrades: integer("winning_trades").default(0),
  losingTrades: integer("losing_trades").default(0),
  winRate: real("win_rate").notNull().default(0),
  
  // Risk metrics
  maxDailyLoss: real("max_daily_loss").notNull(),
  eodDrawdown: real("eod_drawdown").default(0),
  unrealizedProfitDrawdown: real("unrealized_profit_drawdown").default(0),
  drawdownType: text("drawdown_type"),
  
  // Performance metrics
  bestTradeProfit: real("best_trade_profit").default(0),
  worstTradeLoss: real("worst_trade_loss").default(0),
  averageWin: real("average_win").default(0),
  averageLoss: real("average_loss").default(0),
  profitFactor: real("profit_factor").default(0),
  
  // Rule compliance
  consistencyRuleViolation: boolean("consistency_rule_violation").default(false),
  riskRuleViolations: integer("risk_rule_violations").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
});
```

### 6. CSV Import Management

```typescript
// CSV import history and tracking
export const csvImports = pgTable("csv_imports", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  
  // Import details
  fileName: text("file_name").notNull(),
  brokerPlatform: text("broker_platform"), // Auto-detected platform
  importDate: timestamp("import_date").defaultNow(),
  
  // Processing results
  recordsProcessed: integer("records_processed").notNull(),
  recordsImported: integer("records_imported").notNull(),
  recordsSkipped: integer("records_skipped").default(0),
  recordsErrored: integer("records_errored").default(0),
  
  // Status and errors
  status: text("status").notNull().default('completed'), // 'processing', 'completed', 'failed'
  errors: text("errors"), // JSON array of import errors
  duplicatesFound: integer("duplicates_found").default(0),
  
  // File metadata
  fileSize: integer("file_size"),
  fileHash: text("file_hash"), // For duplicate detection
  
  createdAt: timestamp("created_at").defaultNow(),
});
```

### 7. Spending & Budget Management

```typescript
// Spending categories enum
export const spendingCategoryEnum = pgEnum("spending_category", [
  "account_purchase", "monthly_fees", "reset_costs", "activation_fees", 
  "software", "education", "hardware", "other"
]);

// Spending records
export const spending = pgTable("spending", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  accountId: integer("account_id").references(() => accounts.id), // Optional link to account
  
  // Expense details
  description: text("description").notNull(),
  amount: real("amount").notNull(),
  currency: varchar("currency").default("USD"),
  category: spendingCategoryEnum("category").notNull(),
  date: date("date").notNull(),
  
  // Additional information
  vendor: text("vendor"),
  receiptUrl: text("receipt_url"),
  notes: text("notes"),
  isRecurring: boolean("is_recurring").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Budget planning
export const budgetPlans = pgTable("budget_plans", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Budget period
  month: integer("month").notNull(), // 1-12
  year: integer("year").notNull(),
  
  // Category budgets
  accountPurchaseBudget: real("account_purchase_budget").default(0),
  monthlyFeesBudget: real("monthly_fees_budget").default(0),
  resetCostsBudget: real("reset_costs_budget").default(0),
  softwareBudget: real("software_budget").default(0),
  educationBudget: real("education_budget").default(0),
  otherBudget: real("other_budget").default(0),
  
  // Total budget
  totalBudget: real("total_budget").notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
});
```

### 8. Strategy & Rule Management

```typescript
// Trading strategies
export const tradingStrategies = pgTable("trading_strategies", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Strategy details
  name: text("name").notNull(),
  description: text("description"),
  rules: text("rules"), // JSON array of strategy rules
  
  // Performance tracking
  totalTrades: integer("total_trades").default(0),
  winRate: real("win_rate").default(0),
  profitFactor: real("profit_factor").default(0),
  averageReturn: real("average_return").default(0),
  
  // Strategy settings
  isActive: boolean("is_active").default(true),
  riskPerTrade: real("risk_per_trade"),
  maxDailyTrades: integer("max_daily_trades"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Strategy rule tracking
export const strategyRuleTracking = pgTable("strategy_rule_tracking", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  strategyId: integer("strategy_id").references(() => tradingStrategies.id).notNull(),
  date: date("date").notNull(),
  
  // Rule compliance
  rulesFollowed: integer("rules_followed").default(0),
  rulesViolated: integer("rules_violated").default(0),
  compliancePercentage: real("compliance_percentage").default(0),
  
  // Specific rule tracking
  ruleViolations: text("rule_violations"), // JSON array of violated rules
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
});
```

## Database Indexes and Optimization

```typescript
// Add these indexes for optimal performance
export const userEmailIndex = index("idx_users_email").on(users.email);
export const accountUserIndex = index("idx_accounts_user_id").on(accounts.userId);
export const tradeAccountDateIndex = index("idx_trades_account_date").on(trades.accountId, trades.date);
export const journalAccountDateIndex = index("idx_journal_account_date").on(journalEntries.accountId, journalEntries.date);
export const dailyStatsAccountDateIndex = index("idx_daily_stats_account_date").on(dailyStats.accountId, dailyStats.date);
export const spendingUserDateIndex = index("idx_spending_user_date").on(spending.userId, spending.date);
```

## Schema Validation with Zod

```typescript
// Generate Zod schemas for type-safe validation
export const insertUserSchema = createInsertSchema(users);
export const insertAccountSchema = createInsertSchema(accounts);
export const insertTradeSchema = createInsertSchema(trades);
export const insertJournalEntrySchema = createInsertSchema(journalEntries);
export const insertDailyPlanSchema = createInsertSchema(dailyPlans);
export const insertSpendingSchema = createInsertSchema(spending);

// TypeScript types
export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Trade = typeof trades.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type DailyPlan = typeof dailyPlans.$inferSelect;
export type Spending = typeof spending.$inferSelect;

export type InsertUser = typeof users.$inferInsert;
export type InsertAccount = typeof accounts.$inferInsert;
export type InsertTrade = typeof trades.$inferInsert;
```

## Database Configuration

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

This schema provides:
- Complete user authentication and subscription management
- Multi-account trading support with advanced risk rules
- Comprehensive trade tracking and analytics
- Daily planning and journaling capabilities
- CSV import management with broker detection
- Spending and budget tracking
- Strategy and rule compliance monitoring
- Performance analytics and reporting
- Optimal database indexing for performance
- Type-safe validation with Zod schemas