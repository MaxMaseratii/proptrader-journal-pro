import { pgTable, text, serial, integer, real, timestamp, boolean, date, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  firm: text("firm").notNull(),
  startingBalance: real("starting_balance").notNull(),
  maxDrawdown: real("max_drawdown").notNull(),
  maxDrawdownType: text("max_drawdown_type"),
  dailyLossLimit: real("daily_loss_limit"),
  hasDailyLossLimit: boolean("has_daily_loss_limit").default(false),
  dailyLossLimitAmount: real("daily_loss_limit_amount"),
  dailyLossLimitType: text("daily_loss_limit_type"),
  profitTarget: real("profit_target").notNull(),
  status: text("status").notNull().default('active'),
  riskPerTrade: real("risk_per_trade"),
  riskPercentage: real("risk_percentage"),
  riskRewardRatio: real("risk_reward_ratio").default(2.0),
  maxPositionSize: integer("max_position_size"),
  maxTradesPerDay: integer("max_trades_per_day").default(0),
  maxRiskPerDay: real("max_risk_per_day"),
  preferredAssets: text("preferred_assets"),
  primaryTradingAsset: text("primary_trading_asset"),
  secondaryTradingAsset: text("secondary_trading_asset"),
  tertiaryTradingAsset: text("tertiary_trading_asset"),
  accountCost: real("account_cost"),
  purchaseMethod: text("purchase_method"),
  activationCost: real("activation_cost"),
  activationPaid: boolean("activation_paid").default(false),
  includesActivationFee: boolean("includes_activation_fee").default(false),
  numberOfPhases: integer("number_of_phases").default(1),
  phase1Target: real("phase1_target"),
  phase2Target: real("phase2_target"),
  minimumTradingDays: integer("minimum_trading_days"),
  timeLimit: integer("time_limit"),
  daysRequiredToPass: integer("days_required_to_pass"),
  csvAccountId: text("csv_account_id"),
  drawdownType: text("drawdown_type"),
  maxTotalLoss: real("max_total_loss"),
  trailingThreshold: real("trailing_threshold"),
  consistencyRule: real("consistency_rule").default(0),
  consistencyPercentage: real("consistency_percentage"),
  copyTradingAllowed: boolean("copy_trading_allowed").default(true),
  newsTradingAllowed: boolean("news_trading_allowed").default(true),
  personalTradingTimeStart1: text("personal_trading_time_start1"),
  personalTradingTimeEnd1: text("personal_trading_time_end1"),
  personalTradingTimeZone1: text("personal_trading_time_zone1"),
  personalTradingTimeStart2: text("personal_trading_time_start2"),
  personalTradingTimeEnd2: text("personal_trading_time_end2"),
  personalTradingTimeZone2: text("personal_trading_time_zone2"),
  personalTradingTimeStart3: text("personal_trading_time_start3"),
  personalTradingTimeEnd3: text("personal_trading_time_end3"),
  personalTradingTimeZone3: text("personal_trading_time_zone3"),
  tradingSessionStart: text("trading_session_start"),
  tradingSessionEnd: text("trading_session_end"),
  timezone: text("timezone"),
  dailyWorkingHours: real("daily_working_hours"),
  hourlyWages: real("hourly_wages"),
  useIntradayMargins: boolean("use_intraday_margins").default(true),
  allowChallengePayouts: boolean("allow_challenge_payouts").default(false),
  daysRequiredForPayout: integer("days_required_for_payout"),
  winningDayMinimum: real("winning_day_minimum"),
  minimumPayoutAmount: real("minimum_payout_amount"),
  maxNetBalanceForPayout: real("max_net_balance_for_payout"),
  consistencyRulePercent: real("consistency_rule_percent"),
  payoutFrequency: text("payout_frequency"),
  maximumPayoutAllowed: real("maximum_payout_allowed"),
  maximumPayoutPerAccount: real("maximum_payout_per_account"),
  accountBufferRequired: boolean("account_buffer_required").default(false),
  bufferAmount: real("buffer_amount"),
  bufferPercentage: real("buffer_percentage"),
  profitSplit: real("profit_split"),
  fundedPayoutEnabled: boolean("funded_payout_enabled").default(true),
  fundedDaysRequiredForPayout: integer("funded_days_required_for_payout"),
  fundedWinningDayMinimum: real("funded_winning_day_minimum"),
  fundedMinimumPayoutAmount: real("funded_minimum_payout_amount"),
  fundedMaxNetBalanceForPayout: real("funded_max_net_balance_for_payout"),
  fundedPayoutFrequency: text("funded_payout_frequency"),
  fundedProfitSplit: real("funded_profit_split"),
  livePayoutEnabled: boolean("live_payout_enabled").default(true),
  liveDaysRequiredForPayout: integer("live_days_required_for_payout"),
  liveWinningDayMinimum: real("live_winning_day_minimum"),
  liveMinimumPayoutAmount: real("live_minimum_payout_amount"),
  liveMaxNetBalanceForPayout: real("live_max_net_balance_for_payout"),
  livePayoutFrequency: text("live_payout_frequency"),
  liveProfitSplit: real("live_profit_split"),
  tradingCapital: real("trading_capital"),
  riskCalculationPeriod: text("risk_calculation_period"),
  customRiskAmount: real("custom_risk_amount"),
  useRiskPercentage: boolean("use_risk_percentage").default(false),
  riskPerTradeDivider: integer("risk_per_trade_divider").default(1),
  primaryAsset: text("primary_asset"),
  secondaryAsset: text("secondary_asset"),
  tertiaryAsset: text("tertiary_asset"),
  marginSafetyBuffer: real("margin_safety_buffer").default(50.0),
  stopLossPoints: integer("stop_loss_points").default(10),
  disciplineRiskPeriod: text("discipline_risk_period"),
  disciplineRiskPeriodDays: integer("discipline_risk_period_days"),
  maxDailyRiskBudget: real("max_daily_risk_budget"),
  liveAccountAvailable: boolean("live_account_available").default(false),
  transitionTrigger: text("transition_trigger"),
  liveAccountTransitionEnabled: boolean("live_account_transition_enabled").default(false),
  liveAccountTransitionProfitTarget: real("live_account_transition_profit_target"),
  liveAccountTransitionDays: integer("live_account_transition_days"),
  liveAccountTransitionDrawdownLimit: real("live_account_transition_drawdown_limit"),
  parentChallengeId: integer("parent_challenge_id"),
  fundedAccountId: integer("funded_account_id"),
  challengePassedDate: timestamp("challenge_passed_date"),
  transitionStatus: text("transition_status").default('none'),
  accountSource: text("account_source").default('challenge'),
  resetCount: integer("reset_count").default(0),
  totalResetsCost: real("total_resets_cost").default(0),
  lifecycleStatus: text("lifecycle_status").default('C'),
  liveAccountType: text("live_account_type").default('prop_firm'),
  liveAccountConditions: text("live_account_conditions"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  date: date("date").notNull(),
  symbol: text("symbol").notNull(),
  side: text("side").notNull(),
  quantity: real("quantity").notNull(),
  entryPrice: real("entry_price").notNull(),
  exitPrice: real("exit_price"),
  pnl: real("pnl").notNull(),
  status: text("status").notNull().default('closed'),
  notes: text("notes"),
  orderId: text("order_id"),
  fillTime: timestamp("fill_time"),
  exitTime: timestamp("exit_time"),
  orderType: text("order_type"),
  originalQuantity: real("original_quantity"),
  commission: real("commission"),
  riskAmount: real("risk_amount"),
  riskCompliance: boolean("risk_compliance").default(true),
  initialStopLoss: real("initial_stop_loss"),
  initialTakeProfit: real("initial_take_profit"),
  finalStopLoss: real("final_stop_loss"),
  finalTakeProfit: real("final_take_profit"),
  tradeImage: text("trade_image"),
  tradingViewLink: text("trading_view_link"),
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  dailyPlanId: integer("daily_plan_id"),
  date: date("date").notNull(),
  whatWentWrong: text("what_went_wrong"),
  whatWentRight: text("what_went_right"),
  improvementPlan: text("improvement_plan"),
  lessonsLearned: text("lessons_learned"),
  emotionalState: text("emotional_state"),
  marketConditions: text("market_conditions"),
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
  eodDrawdown: real("eod_drawdown").default(0),
  unrealizedProfitDrawdown: real("unrealized_profit_drawdown").default(0),
  drawdownType: text("drawdown_type"),
  consistencyRuleViolation: boolean("consistency_rule_violation").default(false),
  bestTradeProfit: real("best_trade_profit").default(0),
  consistencyRulePercentage: real("consistency_rule_percentage"),
});

export const csvImports = pgTable("csv_imports", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  fileName: text("file_name").notNull(),
  importDate: timestamp("import_date").defaultNow(),
  recordsProcessed: integer("records_processed").notNull(),
  recordsImported: integer("records_imported").notNull(),
  status: text("status").notNull().default('completed'),
  errors: text("errors"),
});

export const spending = pgTable("spending", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull(),
  spendingType: text("spending_type").notNull(),
  amount: real("amount").notNull(),
  description: text("description").notNull(),
  paymentMethod: text("payment_method").notNull(),
  date: date("date").notNull(),
  isRecurring: boolean("is_recurring").default(false),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const budgetCategories = pgTable("budget_categories", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  emoji: text("emoji").default('📊'),
  icon: text("icon").default('DollarSign'),
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
  budgetPeriod: text("budget_period").notNull(),
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
  achievementType: text("achievement_type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  badge: text("badge").notNull(),
  level: integer("level").notNull().default(1),
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

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  password: varchar("password"),
  profileImageUrl: varchar("profile_image_url"),
  emailVerified: boolean("email_verified").default(false),
  verificationToken: varchar("verification_token"),
  resetToken: varchar("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  planId: varchar("plan_id").default('starter'),
  personalHourlyWage: real("personal_hourly_wage").default(25.0),
  role: varchar("role").default('user'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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
  status: varchar("status").notNull().default("active"),
  isLocked: boolean("is_locked").default(false),
  actualPnl: real("actual_pnl").default(0),
  suggestedAdjustments: text("suggested_adjustments"),
  hasPendingSuggestions: boolean("has_pending_suggestions").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  lockedAt: timestamp("locked_at"),
});

export const projectionAdjustmentHistory = pgTable("projection_adjustment_history", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  projectionId: integer("projection_id").notNull(),
  adjustmentType: varchar("adjustment_type").notNull(),
  oldValues: text("old_values").notNull(),
  newValues: text("new_values").notNull(),
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

export const promoCodes = pgTable("promo_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discount: real("discount").notNull(),
  description: text("description"),
  maxUsage: integer("max_usage"),
  currentUsage: integer("current_usage").default(0),
  isActive: boolean("is_active").default(true),
  userEligibility: text("user_eligibility").default("everyone"),
  planEligibility: text("plan_eligibility").default("all_plans"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPromoCodeSchema = createInsertSchema(promoCodes).omit({
  id: true,
  currentUsage: true,
  createdAt: true,
});

export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;

export const tradingStrategies = pgTable("trading_strategies", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  rules: jsonb("rules").notNull(),
  riskRewardRatio: real("risk_reward_ratio").default(2.0),
  expectedWinRate: real("expected_win_rate").default(50.0),
  riskAmountUsd: real("risk_amount_usd").default(100.0),
  expectedValue: real("expected_value"),
  tradingAssets: jsonb("trading_assets"),
  sessionTimes: text("session_times"),
  maxTradesPerDay: integer("max_trades_per_day").default(3),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dailyPlans = pgTable("daily_plans", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  accountId: integer("account_id").references(() => accounts.id),
  strategyId: integer("strategy_id").references(() => tradingStrategies.id),
  date: date("date").notNull(),
  riskAmount: real("risk_amount").notNull(),
  targetProfit: real("target_profit").notNull(),
  maxTrades: integer("max_trades").notNull(),
  plannedTrades: integer("planned_trades").notNull(),
  riskRewardRatio: real("risk_reward_ratio").notNull(),
  maxRiskPercentage: real("max_risk_percentage"),
  plannedHours: real("planned_hours"),
  hourlyWage: real("hourly_wage"),
  tradeTime: text("trade_time"),
  actualPnL: real("actual_pnl").default(0),
  tradesExecuted: integer("trades_executed").default(0),
  wins: integer("wins").default(0),
  losses: integer("losses").default(0),
  actualRR: real("actual_rr").default(0),
  hoursWorked: real("hours_worked").default(0),
  riskUsed: real("risk_used").default(0),
  biggestWin: real("biggest_win").default(0),
  biggestLoss: real("biggest_loss").default(0),
  whatWentWrong: text("what_went_wrong"),
  whatWentRight: text("what_went_right"),
  lessonsLearned: text("lessons_learned"),
  improvementPlan: text("improvement_plan"),
  emotionalState: text("emotional_state"),
  marketConditions: text("market_conditions"),
  tomorrowPlan: text("tomorrow_plan"),
  tradeSetupLinks: text("trade_setup_links"),
  tradingStartTime: timestamp("trading_start_time"),
  tradingEndTime: timestamp("trading_end_time"),
  sessionDuration: integer("session_duration"),
  isPlanSaved: boolean("is_plan_saved").default(false),
  isCompleted: boolean("is_completed").default(false),
  additionalNotes: text("additional_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const strategyRuleTracking = pgTable("strategy_rule_tracking", {
  id: serial("id").primaryKey(),
  dailyPlanId: integer("daily_plan_id").references(() => dailyPlans.id).notNull(),
  ruleDescription: text("rule_description").notNull(),
  isFollowed: boolean("is_followed").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

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

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"),
  isRead: boolean("is_read").default(false),
  priority: text("priority").default("normal"),
  actionUrl: text("action_url"),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

export const userNotificationSettings = pgTable("user_notification_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  emailNotifications: boolean("email_notifications").default(true),
  accountMilestones: boolean("account_milestones").default(true),
  payoutAlerts: boolean("payout_alerts").default(true),
  riskWarnings: boolean("risk_warnings").default(true),
  systemUpdates: boolean("system_updates").default(true),
  achievementNotifications: boolean("achievement_notifications").default(true),
  emailFrequency: text("email_frequency").default("immediate"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertUserNotificationSettingsSchema = createInsertSchema(userNotificationSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const watchlists = pgTable("watchlists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false),
  category: text("category").default("default"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const watchlistSymbols = pgTable("watchlist_symbols", {
  id: serial("id").primaryKey(),
  watchlistId: integer("watchlist_id").references(() => watchlists.id).notNull(),
  symbol: text("symbol").notNull(),
  exchange: text("exchange"),
  name: text("name"),
  category: text("category"),
  addedAt: timestamp("added_at").defaultNow(),
  alertPrice: real("alert_price"),
  alertEnabled: boolean("alert_enabled").default(false),
  notes: text("notes"),
});

export const riskRules = pgTable("risk_rules", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  accountId: integer("account_id").references(() => accounts.id),
  ruleType: text("rule_type").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  condition: text("condition").notNull(),
  threshold: real("threshold").notNull(),
  action: text("action").notNull(),
  isActive: boolean("is_active").default(true),
  priority: text("priority").default("medium"),
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
  severity: text("severity").notNull(),
  isResolved: boolean("is_resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  notes: text("notes"),
});

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
