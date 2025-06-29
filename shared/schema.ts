import { pgTable, text, serial, integer, real, timestamp, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'challenge', 'funded', 'live'
  firm: text("firm").notNull(),
  startingBalance: real("starting_balance").notNull(),
  currentBalance: real("current_balance").notNull(),
  maxDrawdown: real("max_drawdown").notNull(),
  dailyLossLimit: real("daily_loss_limit").notNull(),
  profitTarget: real("profit_target").notNull(),
  status: text("status").notNull().default('active'), // 'active', 'passed', 'failed', 'withdrawn'
  
  // Risk Management Settings
  riskPerTrade: real("risk_per_trade"), // Dollar amount to risk per trade
  riskPercentage: real("risk_percentage"), // Percentage of account to risk
  maxPositionSize: integer("max_position_size"), // Maximum contracts per trade
  preferredAssets: text("preferred_assets"), // JSON array of preferred trading instruments
  
  // Challenge/Evaluation Settings
  accountCost: real("account_cost"),
  numberOfPhases: integer("number_of_phases").default(1),
  phase1Target: real("phase1_target"),
  phase2Target: real("phase2_target"),
  minimumTradingDays: integer("minimum_trading_days"),
  timeLimit: integer("time_limit"), // days, 0 = unlimited
  
  // Drawdown Rules
  drawdownType: text("drawdown_type"), // 'daily', 'unrealized', 'trailing', 'balance_based'
  maxTotalLoss: real("max_total_loss"),
  trailingThreshold: real("trailing_threshold"),
  
  // Trading Rules
  consistencyRule: boolean("consistency_rule").default(false),
  consistencyPercentage: real("consistency_percentage"),
  copyTradingAllowed: boolean("copy_trading_allowed").default(true),
  newsTradingAllowed: boolean("news_trading_allowed").default(true),
  
  // Payout Settings (for funded accounts)
  daysRequiredForPayout: integer("days_required_for_payout"),
  winningDayMinimum: real("winning_day_minimum"),
  minimumPayoutAmount: real("minimum_payout_amount"),
  payoutFrequency: text("payout_frequency"), // 'daily', 'weekly', 'bi-weekly', 'monthly', 'on-demand'
  maximumPayoutPercentage: real("maximum_payout_percentage"),
  accountBufferRequired: boolean("account_buffer_required").default(false),
  bufferAmount: real("buffer_amount"),
  profitSplit: real("profit_split"),
  enhancedPayoutsAvailable: boolean("enhanced_payouts_available").default(false),
  
  // Live Account Settings
  liveAccountAvailable: boolean("live_account_available").default(false),
  transitionTrigger: text("transition_trigger"),
  activationCost: real("activation_cost"),
  
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
