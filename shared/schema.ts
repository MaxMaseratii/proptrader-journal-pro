import { pgTable, text, serial, integer, real, timestamp, boolean, date, varchar, jsonb, index, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from 'drizzle-orm';

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User subscription plans
export const subscriptionPlanEnum = pgEnum("subscription_plan", ["trial", "basic", "premium", "pro"]);

// User authentication and subscription table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  password: varchar("password"), // Match existing column name
  profileImageUrl: varchar("profile_image_url"),
  emailVerified: boolean("email_verified").default(false),
  verificationToken: varchar("verification_token"),
  personalHourlyWage: real("personal_hourly_wage"),
  subscriptionPlan: subscriptionPlanEnum("subscription_plan").default("trial"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status").default("active"),
  trialEndsAt: timestamp("trial_ends_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UpsertUser = typeof users.$inferInsert;

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'challenge', 'funded', 'live'
  firm: text("firm").notNull(),
  startingBalance: real("starting_balance").notNull(),
  // currentBalance removed - now calculated as startingBalance + PnL from trades
  maxDrawdown: real("max_drawdown").notNull(),
  maxDrawdownType: text("max_drawdown_type"), // 'eod', 'unrealized_profit'
  dailyLossLimit: real("daily_loss_limit"),
  hasDailyLossLimit: boolean("has_daily_loss_limit").default(false),
  dailyLossLimitAmount: real("daily_loss_limit_amount"),
  dailyLossLimitType: text("daily_loss_limit_type"), // 'soft_breach', 'hard_breach'
  profitTarget: real("profit_target").notNull(),
  status: text("status").notNull().default('active'), // 'active', 'passed', 'failed', 'withdrawn'
  
  // Risk Management Settings
  riskPerTrade: real("risk_per_trade"), // Dollar amount to risk per trade
  riskPercentage: real("risk_percentage"), // Percentage of account to risk
  riskRewardRatio: real("risk_reward_ratio").default(2.0), // Risk to reward ratio (e.g., 1:2 = 2.0)
  maxPositionSize: integer("max_position_size"), // Maximum contracts per trade
  maxTradesPerDay: integer("max_trades_per_day").default(0), // Maximum trades allowed per day (0 = unlimited)
  maxRiskPerDay: real("max_risk_per_day"), // Maximum risk per day ($)
  preferredAssets: text("preferred_assets"), // JSON array of preferred trading instruments
  
  // Trading Asset Selection
  primaryTradingAsset: text("primary_trading_asset"), // Main trading instrument
  secondaryTradingAsset: text("secondary_trading_asset"), // Secondary trading instrument  
  tertiaryTradingAsset: text("tertiary_trading_asset"), // Third trading instrument
  
  // Financial Tracking
  accountCost: real("account_cost"), // Cost to purchase the account
  purchaseMethod: text("purchase_method"), // 'credit_card', 'paypal', 'crypto', 'bank_transfer', 'other'
  activationCost: real("activation_cost"), // Cost to activate after passing challenge
  activationPaid: boolean("activation_paid").default(false), // Whether activation fee was paid
  includesActivationFee: boolean("includes_activation_fee").default(false), // If account cost includes activation
  
  // Challenge/Evaluation Settings
  numberOfPhases: integer("number_of_phases").default(1),
  phase1Target: real("phase1_target"),
  phase2Target: real("phase2_target"),
  minimumTradingDays: integer("minimum_trading_days"),
  timeLimit: integer("time_limit"), // days, 0 = unlimited
  daysRequiredToPass: integer("days_required_to_pass"), // Number of days required to pass the challenge
  
  // CSV Import Security
  csvAccountId: text("csv_account_id"), // Associated CSV account ID for import validation
  
  // Drawdown Rules
  drawdownType: text("drawdown_type"), // 'daily', 'unrealized', 'trailing', 'balance_based', 'static'
  maxTotalLoss: real("max_total_loss"),
  trailingThreshold: real("trailing_threshold"),
  
  // Trading Rules  
  consistencyRule: real("consistency_rule").default(0),
  consistencyPercentage: real("consistency_percentage"),
  copyTradingAllowed: boolean("copy_trading_allowed").default(true),
  newsTradingAllowed: boolean("news_trading_allowed").default(true),
  
  // Personal Trading Time Settings (Multiple Time Windows)
  personalTradingTimeStart1: text("personal_trading_time_start1"), // e.g. "09:30"
  personalTradingTimeEnd1: text("personal_trading_time_end1"), // e.g. "16:00"
  personalTradingTimeZone1: text("personal_trading_time_zone1"), // e.g. "EST", "PST", "GMT"
  
  personalTradingTimeStart2: text("personal_trading_time_start2"), // Secondary time window
  personalTradingTimeEnd2: text("personal_trading_time_end2"),
  personalTradingTimeZone2: text("personal_trading_time_zone2"),
  
  personalTradingTimeStart3: text("personal_trading_time_start3"), // Tertiary time window
  personalTradingTimeEnd3: text("personal_trading_time_end3"),
  personalTradingTimeZone3: text("personal_trading_time_zone3"),
  
  // Legacy fields (keeping for backward compatibility)
  tradingSessionStart: text("trading_session_start"), // e.g. "09:30"
  tradingSessionEnd: text("trading_session_end"), // e.g. "16:00"
  timezone: text("timezone"), // e.g. "EST", "PST", "GMT"
  dailyWorkingHours: real("daily_working_hours"), // Hours per day trader plans to work
  hourlyWages: real("hourly_wages"), // Expected hourly wage in dollars
  useIntradayMargins: boolean("use_intraday_margins").default(true),
  
  // Payout Settings (flexible for all account types)
  allowChallengePayouts: boolean("allow_challenge_payouts").default(false), // Whether challenge accounts can receive payouts
  daysRequiredForPayout: integer("days_required_for_payout"),
  winningDayMinimum: real("winning_day_minimum"),
  minimumPayoutAmount: real("minimum_payout_amount"),
  maxNetBalanceForPayout: real("max_net_balance_for_payout"),
  consistencyRulePercent: real("consistency_rule_percent"), // Maximum net balance to get payout
  payoutFrequency: text("payout_frequency"), // 'daily', 'weekly', 'bi-weekly', 'monthly', 'on-demand'
  maximumPayoutAllowed: real("maximum_payout_allowed"), // Changed from percentage to dollar amount
  maximumPayoutPerAccount: real("maximum_payout_per_account"), // Maximum payout allowed per account
  accountBufferRequired: boolean("account_buffer_required").default(false),
  bufferAmount: real("buffer_amount"),
  bufferPercentage: real("buffer_percentage"), // New field for percentage buffer
  profitSplit: real("profit_split"),
  
  // Funded Account Payout Settings (separate rules for funded state)
  fundedPayoutEnabled: boolean("funded_payout_enabled").default(true),
  fundedDaysRequiredForPayout: integer("funded_days_required_for_payout"),
  fundedWinningDayMinimum: real("funded_winning_day_minimum"),
  fundedMinimumPayoutAmount: real("funded_minimum_payout_amount"),
  fundedMaxNetBalanceForPayout: real("funded_max_net_balance_for_payout"),
  fundedPayoutFrequency: text("funded_payout_frequency"), // 'daily', 'weekly', 'bi-weekly', 'monthly', 'on-demand'
  fundedProfitSplit: real("funded_profit_split"),
  
  // Live Account Payout Settings (separate rules for live state)
  livePayoutEnabled: boolean("live_payout_enabled").default(true),
  liveDaysRequiredForPayout: integer("live_days_required_for_payout"),
  liveWinningDayMinimum: real("live_winning_day_minimum"),
  liveMinimumPayoutAmount: real("live_minimum_payout_amount"),
  liveMaxNetBalanceForPayout: real("live_max_net_balance_for_payout"),
  livePayoutFrequency: text("live_payout_frequency"), // 'daily', 'weekly', 'bi-weekly', 'monthly', 'on-demand'
  liveProfitSplit: real("live_profit_split"),
  
  // Smart Position Sizing Calculator Settings
  tradingCapital: real("trading_capital"), // Trading capital for risk calculations
  riskCalculationPeriod: text("risk_calculation_period"), // 'weekly', 'bi_weekly', 'monthly', 'custom'
  customRiskAmount: real("custom_risk_amount"), // Fixed dollar amount to risk per trade
  useRiskPercentage: boolean("use_risk_percentage").default(false),
  riskPerTradeDivider: integer("risk_per_trade_divider").default(1), // Number to divide total risk across multiple trades
  primaryAsset: text("primary_asset"), // 'ES', 'MES', 'NQ', 'MNQ', etc.
  secondaryAsset: text("secondary_asset"),
  tertiaryAsset: text("tertiary_asset"),
  marginSafetyBuffer: real("margin_safety_buffer").default(50.0), // Percentage
  stopLossPoints: integer("stop_loss_points").default(10), // Typical stop loss in points
  
  // Discipline Score Calculation Settings
  disciplineRiskPeriod: text("discipline_risk_period"), // 'daily', 'weekly', 'monthly', 'custom'
  disciplineRiskPeriodDays: integer("discipline_risk_period_days"), // Number of days for custom period
  maxDailyRiskBudget: real("max_daily_risk_budget"), // Maximum daily risk budget for discipline scoring
  
  // Live Account Settings
  liveAccountAvailable: boolean("live_account_available").default(false),
  transitionTrigger: text("transition_trigger"),
  
  // Live Account Transition Rules
  liveAccountTransitionEnabled: boolean("live_account_transition_enabled").default(false),
  liveAccountTransitionProfitTarget: real("live_account_transition_profit_target"), // Profit needed to qualify for live account
  liveAccountTransitionDays: integer("live_account_transition_days"), // Days of consistent profit needed
  liveAccountTransitionDrawdownLimit: real("live_account_transition_drawdown_limit"), // Max drawdown allowed during transition period
  
  // Challenge-to-Funded Account Transition
  parentChallengeId: integer("parent_challenge_id"), // For funded accounts, links to original challenge
  fundedAccountId: integer("funded_account_id"), // For challenge accounts, links to funded account
  challengePassedDate: timestamp("challenge_passed_date"), // When challenge was passed
  transitionStatus: text("transition_status").default('none'), // 'none', 'eligible', 'converted', 'funded'
  
  // Account Type Selection and Lifecycle Management
  accountSource: text("account_source").default('challenge'), // 'challenge', 'direct_funded', 'personal_live'
  
  // Account Status Tracking (for display labels)
  resetCount: integer("reset_count").default(0), // Number of times account has been reset
  totalResetsCost: real("total_resets_cost").default(0), // Total cost of all resets
  
  // Account Lifecycle Chain (for status labels like C>F>L, CR1>F, etc.)
  lifecycleStatus: text("lifecycle_status").default('C'), // Current lifecycle status
  
  // Live Account Configuration
  liveAccountType: text("live_account_type").default('prop_firm'), // 'prop_firm', 'personal_live'
  
  // Live Account Conditions (configured when transitioning to live)
  liveAccountConditions: text("live_account_conditions"), // JSON string of live account conditions
  

  
  createdAt: timestamp("created_at").defaultNow(),
});

export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  date: date("date").notNull(),
  symbol: text("symbol").notNull(),
  side: text("side").notNull(), // 'buy', 'sell'
  quantity: real("quantity").notNull(),
  entryPrice: real("entry_price").notNull(),
  exitPrice: real("exit_price"),
  pnl: real("pnl").notNull(),
  status: text("status").notNull().default('closed'), // 'open', 'closed'
  notes: text("notes"),
  // Additional fields for order tracking
  orderId: text("order_id"), // External order ID from CSV
  fillTime: timestamp("fill_time"), // Exact entry fill timestamp
  exitTime: timestamp("exit_time"), // Exact exit fill timestamp
  orderType: text("order_type"), // 'Market', 'Limit', 'Stop'
  originalQuantity: real("original_quantity"), // Original order quantity
  commission: real("commission"), // Trading fees
  riskAmount: real("risk_amount"), // Planned risk for this trade
  riskCompliance: boolean("risk_compliance").default(true), // Whether trade followed risk rules
  initialStopLoss: real("initial_stop_loss"), // Initial stop loss price level set at entry
  initialTakeProfit: real("initial_take_profit"), // Initial take profit price level set at entry
  finalStopLoss: real("final_stop_loss"), // Final stop loss price level when closed (may be different due to trailing, adjustments)
  finalTakeProfit: real("final_take_profit"), // Final take profit price level when closed (may be different due to trailing, adjustments)
  
  // Trade Documentation
  tradeImage: text("trade_image"), // URL or path to uploaded trade screenshot
  tradingViewLink: text("trading_view_link"), // Direct link to TradingView chart (e.g., https://www.tradingview.com/x/PZiEBNk7/)
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  dailyPlanId: integer("daily_plan_id").references(() => dailyPlans.id), // Link to specific daily plan
  date: date("date").notNull(),
  whatWentWrong: text("what_went_wrong"),
  whatWentRight: text("what_went_right"),
  improvementPlan: text("improvement_plan"),
  lessonsLearned: text("lessons_learned"), // Added field that was being used
  emotionalState: text("emotional_state"), // Added field that was being used
  marketConditions: text("market_conditions"), // Added field that was being used
});

export const dailyStats = pgTable("daily_stats", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  date: date("date").notNull(),
  startingBalance: real("starting_balance").notNull(),
  endingBalance: real("ending_balance").notNull(),
  dailyPnl: real("daily_pnl").notNull(),
  tradesCount: integer("trades_count").notNull().default(0),
  winRate: real("win_rate").notNull().default(0),
  maxDailyLoss: real("max_daily_loss").notNull(),
  // Drawdown tracking fields
  eodDrawdown: real("eod_drawdown").default(0), // End of day drawdown amount
  unrealizedProfitDrawdown: real("unrealized_profit_drawdown").default(0), // Unrealized profit drawdown amount
  drawdownType: text("drawdown_type"), // 'eod' or 'unrealized_profit'
  consistencyRuleViolation: boolean("consistency_rule_violation").default(false), // Whether consistency rule was violated this day
  bestTradeProfit: real("best_trade_profit").default(0), // Best single trade profit for the day
  consistencyRulePercentage: real("consistency_rule_percentage"), // The percentage limit for best trade
});

export const csvImports = pgTable("csv_imports", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  fileName: text("file_name").notNull(),
  importDate: timestamp("import_date").defaultNow(),
  recordsProcessed: integer("records_processed").notNull(),
  recordsImported: integer("records_imported").notNull(),
  status: text("status").notNull().default('completed'), // 'processing', 'completed', 'failed'
  errors: text("errors"), // JSON array of import errors
});

export const spending = pgTable("spending", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull(),
  spendingType: text("spending_type").notNull(), // 'account_purchase', 'account_reset', 'activation_fee', 'subscription', 'other'
  amount: real("amount").notNull(),
  description: text("description").notNull(),
  paymentMethod: text("payment_method").notNull(), // 'credit_card', 'debit_card', 'paypal', 'bank_transfer', 'crypto', 'other'
  date: date("date").notNull(),
  isRecurring: boolean("is_recurring").default(false),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const budgetCategories = pgTable("budget_categories", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'trading' or 'personal'
  emoji: text("emoji").default('📊'), // Emoji character for distinctive symbols
  icon: text("icon").default('DollarSign'), // Lucide icon name (fallback)
  color: text("color").default('text-gray-500'),
  budgetAmount: real("budget_amount").notNull().default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const budgetPlans = pgTable("budget_plans", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  budgetPeriod: text("budget_period").notNull(), // 'weekly', 'monthly', 'yearly'
  totalBudget: real("total_budget").notNull(),
  tradingBudget: real("trading_budget").notNull(),
  personalBudget: real("personal_budget").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  achievementType: text("achievement_type").notNull(), // 'risk_discipline', 'stop_loss_respect', 'profit_target', 'consistency', 'journal_streak'
  title: text("title").notNull(),
  description: text("description").notNull(),
  badge: text("badge").notNull(), // emoji or icon identifier
  level: integer("level").notNull().default(1), // bronze=1, silver=2, gold=3, platinum=4
  progress: integer("progress").notNull().default(0),
  target: integer("target").notNull(),
  isUnlocked: boolean("is_unlocked").default(false),
  unlockedAt: timestamp("unlocked_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  riskDisciplineScore: integer("risk_discipline_score").notNull().default(0),
  stopLossRespectStreak: integer("stop_loss_respect_streak").notNull().default(0),
  profitTargetHitStreak: integer("profit_target_hit_streak").notNull().default(0),
  journalStreakDays: integer("journal_streak_days").notNull().default(0),
  totalPoints: integer("total_points").notNull().default(0),
  level: integer("level").notNull().default(1),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
}).refine(data => data.dailyPlanId !== null, {
  message: "Journal entries must be connected to a daily plan. Please create a daily plan first.",
  path: ["dailyPlanId"]
});

export const insertDailyStatsSchema = createInsertSchema(dailyStats).omit({
  id: true,
});

// Daily drawdown summary type for dashboard widgets
export type DailyDrawdownSummary = {
  date: string;
  eodDrawdown: number;
  unrealizedProfitDrawdown: number;
  drawdownType: 'eod' | 'unrealized_profit' | 'eod_violation' | null;
  consistencyRuleViolation: boolean;
  bestTradeProfit: number;
  totalDayPnL: number;
};

export const insertBudgetCategorySchema = createInsertSchema(budgetCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBudgetPlanSchema = createInsertSchema(budgetPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type BudgetCategory = typeof budgetCategories.$inferSelect;
export type BudgetPlan = typeof budgetPlans.$inferSelect;
export type InsertBudgetCategory = z.infer<typeof insertBudgetCategorySchema>;
export type InsertBudgetPlan = z.infer<typeof insertBudgetPlanSchema>;

export const insertCsvImportSchema = createInsertSchema(csvImports).omit({
  id: true,
  importDate: true,
});

export const insertSpendingSchema = createInsertSchema(spending).omit({
  id: true,
  createdAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
  lastUpdated: true,
});

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Trade = typeof trades.$inferSelect;
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type DailyStats = typeof dailyStats.$inferSelect;
export type InsertDailyStats = z.infer<typeof insertDailyStatsSchema>;
export type CsvImport = typeof csvImports.$inferSelect;
export type InsertCsvImport = z.infer<typeof insertCsvImportSchema>;
export type Spending = typeof spending.$inferSelect;
export type InsertSpending = z.infer<typeof insertSpendingSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;



// Projection tables
export const savedProjections = pgTable("saved_projections", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  accountId: integer("account_id").notNull(),
  userId: varchar("user_id").notNull(),
  startingCapital: real("starting_capital").notNull(),
  riskPerTrade: real("risk_per_trade").notNull(),
  rewardRiskRatio: real("reward_risk_ratio").notNull(),
  targetProfit: real("target_profit").notNull(),
  projectedDays: integer("projected_days").notNull(),
  compoundingEnabled: boolean("compounding_enabled").default(false),
  compoundingPercentage: real("compounding_percentage").default(0),
  riskCuttingEnabled: boolean("risk_cutting_enabled").default(false),
  riskCuttingPercentage: real("risk_cutting_percentage").default(0),
  status: varchar("status").notNull().default("active"), // active, completed, failed
  isLocked: boolean("is_locked").default(false),
  actualPnl: real("actual_pnl").default(0),
  suggestedAdjustments: text("suggested_adjustments"), // JSON string of suggestions
  hasPendingSuggestions: boolean("has_pending_suggestions").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  lockedAt: timestamp("locked_at"),
});

export const projectionAdjustmentHistory = pgTable("projection_adjustment_history", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  projectionId: integer("projection_id").notNull(),
  adjustmentType: varchar("adjustment_type").notNull(), // manual, auto-suggestion, system
  oldValues: text("old_values").notNull(), // JSON string
  newValues: text("new_values").notNull(), // JSON string
  reason: text("reason"),
  acceptedByUser: boolean("accepted_by_user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSavedProjectionSchema = createInsertSchema(savedProjections);
export const insertProjectionAdjustmentSchema = createInsertSchema(projectionAdjustmentHistory);

export type SavedProjection = typeof savedProjections.$inferSelect;
export type InsertSavedProjection = z.infer<typeof insertSavedProjectionSchema>;
export type ProjectionAdjustmentHistory = typeof projectionAdjustmentHistory.$inferSelect;
export type InsertProjectionAdjustment = z.infer<typeof insertProjectionAdjustmentSchema>;

// Trading Strategies
export const tradingStrategies = pgTable("trading_strategies", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  rules: jsonb("rules").notNull(), // Array of strategy rules
  riskRewardRatio: real("risk_reward_ratio").default(2.0),
  expectedWinRate: real("expected_win_rate").default(50.0), // percentage
  riskAmountUsd: real("risk_amount_usd").default(100.0),
  expectedValue: real("expected_value"), // calculated field: (winRate * RR - (1-winRate)) * riskAmount
  tradingAssets: jsonb("trading_assets"), // Array of trading instruments
  sessionTimes: text("session_times"), // JSON string for trading session times
  maxTradesPerDay: integer("max_trades_per_day").default(3),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Daily Plans
export const dailyPlans = pgTable("daily_plans", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  accountId: integer("account_id").references(() => accounts.id),
  strategyId: integer("strategy_id").references(() => tradingStrategies.id),
  date: date("date").notNull(),
  
  // Financial Planning
  riskAmount: real("risk_amount").notNull(),
  targetProfit: real("target_profit").notNull(),
  maxTrades: integer("max_trades").notNull(),
  plannedTrades: integer("planned_trades").notNull(),
  riskRewardRatio: real("risk_reward_ratio").notNull(),
  maxRiskPercentage: real("max_risk_percentage"),
  plannedHours: real("planned_hours"),
  hourlyWage: real("hourly_wage"),
  tradeTime: text("trade_time"), // Planned trading time
  
  // Actual Results
  actualPnL: real("actual_pnl").default(0),
  tradesExecuted: integer("trades_executed").default(0),
  wins: integer("wins").default(0),
  losses: integer("losses").default(0),
  actualRR: real("actual_rr").default(0),
  hoursWorked: real("hours_worked").default(0),
  riskUsed: real("risk_used").default(0),
  biggestWin: real("biggest_win").default(0),
  biggestLoss: real("biggest_loss").default(0),
  
  // Journal Integration
  whatWentWrong: text("what_went_wrong"),
  whatWentRight: text("what_went_right"),
  lessonsLearned: text("lessons_learned"),
  improvementPlan: text("improvement_plan"),
  emotionalState: text("emotional_state"),
  marketConditions: text("market_conditions"),
  tomorrowPlan: text("tomorrow_plan"),
  tradeSetupLinks: text("trade_setup_links"), // JSON array of trade setup links with descriptions
  
  // Session Tracking
  tradingStartTime: timestamp("trading_start_time"),
  tradingEndTime: timestamp("trading_end_time"),
  sessionDuration: integer("session_duration"), // in milliseconds
  
  // Plan Status
  isPlanSaved: boolean("is_plan_saved").default(false),
  isCompleted: boolean("is_completed").default(false),
  additionalNotes: text("additional_notes"), // Only field that can be edited after plan is saved
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Strategy Rule Adherence Tracking
export const strategyRuleTracking = pgTable("strategy_rule_tracking", {
  id: serial("id").primaryKey(),
  dailyPlanId: integer("daily_plan_id").references(() => dailyPlans.id).notNull(),
  ruleDescription: text("rule_description").notNull(),
  isFollowed: boolean("is_followed").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertTradingStrategySchema = createInsertSchema(tradingStrategies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDailyPlanSchema = createInsertSchema(dailyPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStrategyRuleTrackingSchema = createInsertSchema(strategyRuleTracking).omit({
  id: true,
  createdAt: true,
});

// Notifications System
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // 'account_milestone', 'payout_ready', 'risk_warning', 'system_update', 'achievement'
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"), // Additional notification data (account info, amounts, etc.)
  isRead: boolean("is_read").default(false),
  priority: text("priority").default("normal"), // 'low', 'normal', 'high', 'urgent'
  actionUrl: text("action_url"), // URL to navigate when notification is clicked
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

// User notification preferences
export const userNotificationSettings = pgTable("user_notification_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  emailNotifications: boolean("email_notifications").default(true),
  accountMilestones: boolean("account_milestones").default(true),
  payoutAlerts: boolean("payout_alerts").default(true),
  riskWarnings: boolean("risk_warnings").default(true),
  systemUpdates: boolean("system_updates").default(true),
  achievementNotifications: boolean("achievement_notifications").default(true),
  emailFrequency: text("email_frequency").default("immediate"), // 'immediate', 'daily', 'weekly', 'never'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for notifications
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertUserNotificationSettingsSchema = createInsertSchema(userNotificationSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Watchlists System
export const watchlists = pgTable("watchlists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false),
  category: text("category").default("default"), // 'default', 'forex', 'crypto', 'indices', 'commodities'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const watchlistSymbols = pgTable("watchlist_symbols", {
  id: serial("id").primaryKey(),
  watchlistId: integer("watchlist_id").references(() => watchlists.id).notNull(),
  symbol: text("symbol").notNull(),
  exchange: text("exchange"),
  name: text("name"),
  category: text("category"), // 'forex', 'crypto', 'indices', 'commodities', 'stocks'
  addedAt: timestamp("added_at").defaultNow(),
  alertPrice: real("alert_price"), // Price alert level
  alertEnabled: boolean("alert_enabled").default(false),
  notes: text("notes"),
});

// Risk Rules System
export const riskRules = pgTable("risk_rules", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  accountId: integer("account_id").references(() => accounts.id),
  ruleType: text("rule_type").notNull(), // 'daily_loss', 'max_drawdown', 'position_size', 'max_trades'
  name: text("name").notNull(),
  description: text("description"),
  condition: text("condition").notNull(), // 'greater_than', 'less_than', 'equals'
  threshold: real("threshold").notNull(),
  action: text("action").notNull(), // 'alert', 'block_trading', 'close_positions'
  isActive: boolean("is_active").default(true),
  priority: text("priority").default("medium"), // 'low', 'medium', 'high', 'critical'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const riskAlerts = pgTable("risk_alerts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  accountId: integer("account_id").references(() => accounts.id),
  ruleId: integer("rule_id").references(() => riskRules.id),
  triggeredAt: timestamp("triggered_at").defaultNow(),
  currentValue: real("current_value").notNull(),
  threshold: real("threshold").notNull(),
  severity: text("severity").notNull(), // 'warning', 'critical', 'emergency'
  isResolved: boolean("is_resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  notes: text("notes"),
});

// Insert schemas for new tables
export const insertWatchlistSchema = createInsertSchema(watchlists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWatchlistSymbolSchema = createInsertSchema(watchlistSymbols).omit({
  id: true,
  addedAt: true,
});

export const insertRiskRuleSchema = createInsertSchema(riskRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRiskAlertSchema = createInsertSchema(riskAlerts).omit({
  id: true,
  triggeredAt: true,
});

// Types
export type TradingStrategy = typeof tradingStrategies.$inferSelect;
export type InsertTradingStrategy = z.infer<typeof insertTradingStrategySchema>;
export type DailyPlan = typeof dailyPlans.$inferSelect;
export type InsertDailyPlan = z.infer<typeof insertDailyPlanSchema>;
export type StrategyRuleTracking = typeof strategyRuleTracking.$inferSelect;
export type InsertStrategyRuleTracking = z.infer<typeof insertStrategyRuleTrackingSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type UserNotificationSettings = typeof userNotificationSettings.$inferSelect;
export type InsertUserNotificationSettings = z.infer<typeof insertUserNotificationSettingsSchema>;
export type Watchlist = typeof watchlists.$inferSelect;
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;
export type WatchlistSymbol = typeof watchlistSymbols.$inferSelect;
export type InsertWatchlistSymbol = z.infer<typeof insertWatchlistSymbolSchema>;
export type RiskRule = typeof riskRules.$inferSelect;
export type InsertRiskRule = z.infer<typeof insertRiskRuleSchema>;
export type RiskAlert = typeof riskAlerts.$inferSelect;
export type InsertRiskAlert = z.infer<typeof insertRiskAlertSchema>;
