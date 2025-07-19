import { pgTable, text, serial, integer, real, timestamp, boolean, date, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'challenge', 'funded', 'live'
  firm: text("firm").notNull(),
  startingBalance: real("starting_balance").notNull(),
  // currentBalance removed - now calculated as startingBalance + PnL from trades
  maxDrawdown: real("max_drawdown").notNull(),
  dailyLossLimit: real("daily_loss_limit"),
  hasDailyLossLimit: boolean("has_daily_loss_limit").default(false),
  dailyLossLimitType: text("daily_loss_limit_type"), // 'soft', 'hard'
  profitTarget: real("profit_target").notNull(),
  status: text("status").notNull().default('active'), // 'active', 'passed', 'failed', 'withdrawn'
  
  // Risk Management Settings
  riskPerTrade: real("risk_per_trade"), // Dollar amount to risk per trade
  riskPercentage: real("risk_percentage"), // Percentage of account to risk
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
  drawdownType: text("drawdown_type"), // 'daily', 'unrealized', 'trailing', 'balance_based'
  maxTotalLoss: real("max_total_loss"),
  trailingThreshold: real("trailing_threshold"),
  
  // Trading Rules
  consistencyRule: boolean("consistency_rule").default(false),
  consistencyPercentage: real("consistency_percentage"),
  copyTradingAllowed: boolean("copy_trading_allowed").default(true),
  newsTradingAllowed: boolean("news_trading_allowed").default(true),
  
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
  riskRewardRatio: real("risk_reward_ratio").default(2.0),
  primaryAsset: text("primary_asset"), // 'ES', 'MES', 'NQ', 'MNQ', etc.
  secondaryAsset: text("secondary_asset"),
  tertiaryAsset: text("tertiary_asset"),
  useIntradayMargins: boolean("use_intraday_margins").default(true),
  marginSafetyBuffer: real("margin_safety_buffer").default(50.0), // Percentage
  stopLossPoints: integer("stop_loss_points").default(10), // Typical stop loss in points
  
  // Discipline Score Calculation Settings
  disciplineRiskPeriod: text("discipline_risk_period"), // 'daily', 'weekly', 'monthly', 'custom'
  disciplineRiskPeriodDays: integer("discipline_risk_period_days"), // Number of days for custom period
  maxDailyRiskBudget: real("max_daily_risk_budget"), // Maximum daily risk budget for discipline scoring
  enhancedPayoutsAvailable: boolean("enhanced_payouts_available").default(false),
  
  // Live Account Settings
  liveAccountAvailable: boolean("live_account_available").default(false),
  transitionTrigger: text("transition_trigger"),
  
  // Live Account Transition Rules
  liveAccountTransitionEnabled: boolean("live_account_transition_enabled").default(false),
  liveAccountTransitionProfitTarget: real("live_account_transition_profit_target"), // Profit needed to qualify for live account
  liveAccountTransitionDays: integer("live_account_transition_days"), // Days of consistent profit needed
  liveAccountTransitionDrawdownLimit: real("live_account_transition_drawdown_limit"), // Max drawdown allowed during transition period
  
  // Challenge-to-Funded Account Transition
  parentChallengeId: integer("parent_challenge_id").references(() => accounts.id), // For funded accounts, links to original challenge
  fundedAccountId: integer("funded_account_id").references(() => accounts.id), // For challenge accounts, links to funded account
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
  fillTime: timestamp("fill_time"), // Exact fill timestamp
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
  date: date("date").notNull(),
  whatWentWrong: text("what_went_wrong"),
  whatWentRight: text("what_went_right"),
  improvementPlan: text("improvement_plan"),
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
});

export const insertDailyStatsSchema = createInsertSchema(dailyStats).omit({
  id: true,
});

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

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  personalHourlyWage: real("personal_hourly_wage"), // Desired hourly wage for trading profitability calculations
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

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

export const insertSavedProjectionSchema = createInsertSchema(savedProjections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectionAdjustmentSchema = createInsertSchema(projectionAdjustmentHistory).omit({
  id: true,
  createdAt: true,
});

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
  
  // Session Tracking
  tradingStartTime: timestamp("trading_start_time"),
  tradingEndTime: timestamp("trading_end_time"),
  sessionDuration: integer("session_duration"), // in milliseconds
  
  // Plan Status
  isPlanSaved: boolean("is_plan_saved").default(false),
  isCompleted: boolean("is_completed").default(false),
  
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

// Types
export type TradingStrategy = typeof tradingStrategies.$inferSelect;
export type InsertTradingStrategy = z.infer<typeof insertTradingStrategySchema>;
export type DailyPlan = typeof dailyPlans.$inferSelect;
export type InsertDailyPlan = z.infer<typeof insertDailyPlanSchema>;
export type StrategyRuleTracking = typeof strategyRuleTracking.$inferSelect;
export type InsertStrategyRuleTracking = z.infer<typeof insertStrategyRuleTrackingSchema>;
