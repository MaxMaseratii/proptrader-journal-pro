import { 
  accounts, 
  trades, 
  journalEntries, 
  dailyStats, 
  csvImports, 
  spending, 
  users, 
  achievements, 
  userStats, 
  savedProjections,
  tradingStrategies,
  dailyPlans,
  strategyRuleTracking,
  budgetCategories,
  budgetPlans,
  type Account,
  type Trade,
  type JournalEntry,
  type DailyStats,
  type CsvImport,
  type Spending,
  type User,
  type Achievement,
  type UserStats,
  type SavedProjection,
  type TradingStrategy,
  type DailyPlan,
  type StrategyRuleTracking,
  type BudgetCategory,
  type BudgetPlan,
  type InsertAccount,
  type InsertTrade,
  type InsertJournalEntry,
  type InsertDailyStats,
  type InsertCsvImport,
  type InsertSpending,
  type UpsertUser,
  type InsertAchievement,
  type InsertUserStats,
  type InsertSavedProjection,
  type InsertTradingStrategy,
  type InsertDailyPlan,
  type InsertStrategyRuleTracking,
  type InsertBudgetCategory,
  type InsertBudgetPlan,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, gte, lte, sum, sql } from "drizzle-orm";

// Interface for all storage operations
export interface IStorage {
  // Account operations
  getAccounts(): Promise<Account[]>;
  getAccount(id: number): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: number, account: Partial<InsertAccount>): Promise<Account | undefined>;
  deleteAccount(id: number): Promise<boolean>;

  // Trade operations
  getTrades(accountId?: number): Promise<Trade[]>;
  getTrade(id: number): Promise<Trade | undefined>;
  createTrade(trade: InsertTrade): Promise<Trade>;
  updateTrade(id: number, trade: Partial<InsertTrade>): Promise<Trade | undefined>;
  deleteTrade(id: number): Promise<boolean>;

  // Journal operations
  getJournalEntries(accountId?: number): Promise<JournalEntry[]>;
  getJournalEntry(id: number): Promise<JournalEntry | undefined>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: number): Promise<boolean>;

  // Daily stats operations
  getDailyStats(accountId?: number): Promise<DailyStats[]>;
  getDailyStatsForDateRange(accountId: number, startDate: string, endDate: string): Promise<DailyStats[]>;
  createDailyStats(stats: InsertDailyStats): Promise<DailyStats>;
  updateDailyStats(id: number, stats: Partial<InsertDailyStats>): Promise<DailyStats | undefined>;

  // CSV Import operations
  getCsvImports(accountId?: number): Promise<CsvImport[]>;
  createCsvImport(csvImport: InsertCsvImport): Promise<CsvImport>;

  // Spending operations
  getSpending(accountId?: number): Promise<Spending[]>;
  createSpending(spending: InsertSpending): Promise<Spending>;

  // User operations for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserWage(userId: string, personalHourlyWage: number): Promise<User | null>;

  // Achievement operations
  getAchievements(userId: string): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  updateAchievement(id: number, achievement: Partial<InsertAchievement>): Promise<Achievement | undefined>;
  
  // User stats operations
  getUserStats(userId: string): Promise<UserStats | undefined>;
  createUserStats(stats: InsertUserStats): Promise<UserStats>;
  updateUserStats(userId: string, stats: Partial<InsertUserStats>): Promise<UserStats | undefined>;

  // Saved projection operations
  getSavedProjections(userId: string, accountId?: number): Promise<SavedProjection[]>;
  createSavedProjection(projection: InsertSavedProjection): Promise<SavedProjection>;
  updateSavedProjection(id: number, projection: Partial<InsertSavedProjection>, userId: string): Promise<SavedProjection | undefined>;
  
  // Challenge-to-Funded Account Transition operations
  checkChallengeEligibility(accountId: number): Promise<{ eligible: boolean, reason?: string }>;
  convertToFundedAccount(challengeAccountId: number, fundedAccountData: Partial<InsertAccount>): Promise<{ challengeAccount: Account, fundedAccount: Account }>;
  
  // Funded-to-Live Account Transition operations
  convertToLiveAccount(fundedAccountId: number, liveAccountData: Partial<InsertAccount>): Promise<{ fundedAccount: Account, liveAccount: Account }>;
  
  // Trading Strategy operations
  getTradingStrategies(userId: string): Promise<TradingStrategy[]>;
  getTradingStrategy(id: number): Promise<TradingStrategy | undefined>;
  createTradingStrategy(strategy: InsertTradingStrategy): Promise<TradingStrategy>;
  updateTradingStrategy(id: number, strategy: Partial<InsertTradingStrategy>): Promise<TradingStrategy | undefined>;
  deleteTradingStrategy(id: number): Promise<boolean>;
  
  // Daily Plan operations
  getDailyPlans(userId: string, accountId?: number): Promise<DailyPlan[]>;
  getDailyPlan(id: number): Promise<DailyPlan | undefined>;
  getDailyPlanByDate(userId: string, date: string): Promise<DailyPlan | undefined>;
  createDailyPlan(plan: InsertDailyPlan): Promise<DailyPlan>;
  updateDailyPlan(id: number, plan: Partial<InsertDailyPlan>): Promise<DailyPlan | undefined>;
  deleteDailyPlan(id: number): Promise<boolean>;
  
  // Strategy Rule Tracking operations
  getStrategyRuleTracking(dailyPlanId: number): Promise<StrategyRuleTracking[]>;
  createStrategyRuleTracking(tracking: InsertStrategyRuleTracking): Promise<StrategyRuleTracking>;
  updateStrategyRuleTracking(id: number, tracking: Partial<InsertStrategyRuleTracking>): Promise<StrategyRuleTracking | undefined>;
  
  // Budget Category operations
  getBudgetCategories(userId: string): Promise<BudgetCategory[]>;
  createBudgetCategory(category: InsertBudgetCategory): Promise<BudgetCategory>;
  updateBudgetCategory(id: number, category: Partial<InsertBudgetCategory>): Promise<BudgetCategory | undefined>;
  deleteBudgetCategory(id: number): Promise<boolean>;
  
  // Budget Plan operations
  getActiveBudgetPlan(userId: string): Promise<BudgetPlan | undefined>;
  createBudgetPlan(plan: InsertBudgetPlan): Promise<BudgetPlan>;
  updateBudgetPlan(id: number, plan: Partial<InsertBudgetPlan>): Promise<BudgetPlan | undefined>;
}

// Production-ready DatabaseStorage implementation
export class DatabaseStorage implements IStorage {
  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserWage(userId: string, personalHourlyWage: number): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({ personalHourlyWage })
      .where(eq(users.id, userId))
      .returning();
    return user || null;
  }

  // Account operations
  async getAccounts(): Promise<Account[]> {
    return await db.select().from(accounts).orderBy(desc(accounts.createdAt));
  }

  async getAccount(id: number): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account || undefined;
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const [newAccount] = await db
      .insert(accounts)
      .values(account)
      .returning();
    return newAccount;
  }

  async updateAccount(id: number, account: Partial<InsertAccount>): Promise<Account | undefined> {
    const [updatedAccount] = await db
      .update(accounts)
      .set(account)
      .where(eq(accounts.id, id))
      .returning();
    return updatedAccount || undefined;
  }

  async deleteAccount(id: number): Promise<boolean> {
    const result = await db.delete(accounts).where(eq(accounts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Trade operations
  async getTrades(accountId?: number): Promise<Trade[]> {
    if (accountId) {
      return await db.select().from(trades)
        .where(eq(trades.accountId, accountId))
        .orderBy(desc(trades.date));
    }
    return await db.select().from(trades).orderBy(desc(trades.date));
  }

  async getTrade(id: number): Promise<Trade | undefined> {
    const [trade] = await db.select().from(trades).where(eq(trades.id, id));
    return trade || undefined;
  }

  async createTrade(trade: InsertTrade): Promise<Trade> {
    const [newTrade] = await db
      .insert(trades)
      .values(trade)
      .returning();
    return newTrade;
  }

  async updateTrade(id: number, trade: Partial<InsertTrade>): Promise<Trade | undefined> {
    const [updatedTrade] = await db
      .update(trades)
      .set(trade)
      .where(eq(trades.id, id))
      .returning();
    return updatedTrade || undefined;
  }

  async deleteTrade(id: number): Promise<boolean> {
    const result = await db.delete(trades).where(eq(trades.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Journal operations
  async getJournalEntries(accountId?: number): Promise<JournalEntry[]> {
    if (accountId) {
      return await db.select().from(journalEntries)
        .where(eq(journalEntries.accountId, accountId))
        .orderBy(desc(journalEntries.date));
    }
    return await db.select().from(journalEntries).orderBy(desc(journalEntries.date));
  }

  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    return entry || undefined;
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [newEntry] = await db
      .insert(journalEntries)
      .values(entry)
      .returning();
    return newEntry;
  }

  async updateJournalEntry(id: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const [updatedEntry] = await db
      .update(journalEntries)
      .set(entry)
      .where(eq(journalEntries.id, id))
      .returning();
    return updatedEntry || undefined;
  }

  async deleteJournalEntry(id: number): Promise<boolean> {
    const result = await db.delete(journalEntries).where(eq(journalEntries.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Daily stats operations
  async getDailyStats(accountId?: number): Promise<DailyStats[]> {
    if (accountId) {
      return await db.select().from(dailyStats)
        .where(eq(dailyStats.accountId, accountId))
        .orderBy(desc(dailyStats.date));
    }
    return await db.select().from(dailyStats).orderBy(desc(dailyStats.date));
  }

  async getDailyStatsForDateRange(accountId: number, startDate: string, endDate: string): Promise<DailyStats[]> {
    return await db.select().from(dailyStats)
      .where(
        and(
          eq(dailyStats.accountId, accountId),
          gte(dailyStats.date, startDate),
          lte(dailyStats.date, endDate)
        )
      )
      .orderBy(asc(dailyStats.date));
  }

  async createDailyStats(stats: InsertDailyStats): Promise<DailyStats> {
    const [newStats] = await db
      .insert(dailyStats)
      .values(stats)
      .returning();
    return newStats;
  }

  async updateDailyStats(id: number, stats: Partial<InsertDailyStats>): Promise<DailyStats | undefined> {
    const [updatedStats] = await db
      .update(dailyStats)
      .set(stats)
      .where(eq(dailyStats.id, id))
      .returning();
    return updatedStats || undefined;
  }

  // CSV Import operations
  async getCsvImports(accountId?: number): Promise<CsvImport[]> {
    if (accountId) {
      return await db.select().from(csvImports)
        .where(eq(csvImports.accountId, accountId))
        .orderBy(desc(csvImports.importDate));
    }
    return await db.select().from(csvImports).orderBy(desc(csvImports.importDate));
  }

  async createCsvImport(csvImport: InsertCsvImport): Promise<CsvImport> {
    const [newImport] = await db
      .insert(csvImports)
      .values(csvImport)
      .returning();
    return newImport;
  }

  // Spending operations
  async getSpending(accountId?: number): Promise<Spending[]> {
    if (accountId) {
      return await db.select().from(spending)
        .where(eq(spending.accountId, accountId))
        .orderBy(desc(spending.date));
    }
    return await db.select().from(spending).orderBy(desc(spending.date));
  }

  async createSpending(spendingData: InsertSpending): Promise<Spending> {
    const [newSpending] = await db
      .insert(spending)
      .values(spendingData)
      .returning();
    return newSpending;
  }

  // Achievement operations
  async getAchievements(userId: string): Promise<Achievement[]> {
    return await db.select().from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.createdAt));
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db
      .insert(achievements)
      .values(achievement)
      .returning();
    return newAchievement;
  }

  async updateAchievement(id: number, achievement: Partial<InsertAchievement>): Promise<Achievement | undefined> {
    const [updatedAchievement] = await db
      .update(achievements)
      .set(achievement)
      .where(eq(achievements.id, id))
      .returning();
    return updatedAchievement || undefined;
  }
  
  // User stats operations
  async getUserStats(userId: string): Promise<UserStats | undefined> {
    const [stats] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    return stats || undefined;
  }

  async createUserStats(stats: InsertUserStats): Promise<UserStats> {
    const [newStats] = await db
      .insert(userStats)
      .values(stats)
      .returning();
    return newStats;
  }

  async updateUserStats(userId: string, stats: Partial<InsertUserStats>): Promise<UserStats | undefined> {
    const [updatedStats] = await db
      .update(userStats)
      .set(stats)
      .where(eq(userStats.userId, userId))
      .returning();
    return updatedStats || undefined;
  }

  // Saved projection operations
  async getSavedProjections(userId: string, accountId?: number): Promise<SavedProjection[]> {
    if (accountId) {
      return await db.select().from(savedProjections)
        .where(and(eq(savedProjections.userId, userId), eq(savedProjections.accountId, accountId)));
    }
    
    return await db.select().from(savedProjections).where(eq(savedProjections.userId, userId));
  }

  async createSavedProjection(projection: InsertSavedProjection): Promise<SavedProjection> {
    const [newProjection] = await db.insert(savedProjections).values(projection).returning();
    return newProjection;
  }

  async updateSavedProjection(id: number, projection: Partial<InsertSavedProjection>, userId: string): Promise<SavedProjection | undefined> {
    const [updatedProjection] = await db
      .update(savedProjections)
      .set(projection)
      .where(and(eq(savedProjections.id, id), eq(savedProjections.userId, userId)))
      .returning();
    return updatedProjection || undefined;
  }

  // Challenge-to-Funded Account Transition operations
  async checkChallengeEligibility(accountId: number): Promise<{ eligible: boolean, reason?: string }> {
    const account = await this.getAccount(accountId);
    if (!account) {
      return { eligible: false, reason: "Account not found" };
    }

    if (account.type !== 'challenge') {
      return { eligible: false, reason: "Only challenge accounts can be converted to funded accounts" };
    }

    if (account.transitionStatus === 'converted') {
      return { eligible: false, reason: "Account has already been converted to funded" };
    }

    // Calculate current balance (starting balance + total P&L)
    const tradesResult = await db.select({ totalPnl: sum(trades.pnl) }).from(trades)
      .where(eq(trades.accountId, accountId));
    
    const totalPnl = tradesResult[0]?.totalPnl || 0;
    const currentBalance = account.startingBalance + totalPnl;

    // Check if profit target is reached
    const profitTarget = account.profitTarget || 0;
    const profitRequired = account.startingBalance + profitTarget;
    
    if (currentBalance < profitRequired) {
      return { 
        eligible: false, 
        reason: `Profit target not reached. Current: $${currentBalance.toFixed(2)}, Required: $${profitRequired.toFixed(2)}` 
      };
    }

    // Check maximum drawdown
    const maxDrawdown = account.maxDrawdown || 0;
    const maxDrawdownAmount = account.startingBalance * (maxDrawdown / 100);
    const lowestBalance = account.startingBalance; // This should be calculated from daily stats
    
    if ((account.startingBalance - lowestBalance) > maxDrawdownAmount) {
      return { 
        eligible: false, 
        reason: `Maximum drawdown exceeded. Max allowed: $${maxDrawdownAmount.toFixed(2)}` 
      };
    }

    // Check consistency rules if enabled
    if (account.consistencyRule && account.consistencyPercentage) {
      const maxDailyProfitAllowed = profitTarget * (account.consistencyPercentage / 100);
      
      // Get daily P&L to check for consistency rule violations
      const dailyPnlResult = await db.select({ 
        date: trades.date, 
        dailyPnl: sum(trades.pnl) 
      }).from(trades)
      .where(eq(trades.accountId, accountId))
      .groupBy(trades.date);
      
      const maxDailyProfit = Math.max(...dailyPnlResult.map(d => d.dailyPnl || 0));
      
      if (maxDailyProfit > maxDailyProfitAllowed) {
        return { 
          eligible: false, 
          reason: `Consistency rule violated. Max daily profit: $${maxDailyProfit.toFixed(2)}, Allowed: $${maxDailyProfitAllowed.toFixed(2)}` 
        };
      }
    }

    return { eligible: true };
  }

  async convertToFundedAccount(challengeAccountId: number, fundedAccountData: Partial<InsertAccount>): Promise<{ challengeAccount: Account, fundedAccount: Account }> {
    const challengeAccount = await this.getAccount(challengeAccountId);
    if (!challengeAccount) {
      throw new Error("Challenge account not found");
    }

    const eligibility = await this.checkChallengeEligibility(challengeAccountId);
    if (!eligibility.eligible) {
      throw new Error(`Challenge not eligible for conversion: ${eligibility.reason}`);
    }

    // Create funded account with new rules but same name
    const fundedAccount = await this.createAccount({
      name: challengeAccount.name,
      firm: challengeAccount.firm,
      type: 'funded',
      startingBalance: fundedAccountData.startingBalance || challengeAccount.startingBalance,
      profitTarget: fundedAccountData.profitTarget || challengeAccount.profitTarget,
      maxDrawdown: fundedAccountData.maxDrawdown || challengeAccount.maxDrawdown,
      dailyLossLimit: fundedAccountData.dailyLossLimit || challengeAccount.dailyLossLimit,
      
      // Payout settings (specific to funded accounts)
      daysRequiredForPayout: fundedAccountData.daysRequiredForPayout || 5,
      winningDayMinimum: fundedAccountData.winningDayMinimum || 200,
      minimumPayoutAmount: fundedAccountData.minimumPayoutAmount || 100,
      maxNetBalanceForPayout: fundedAccountData.maxNetBalanceForPayout || 2000,
      consistencyRulePercent: fundedAccountData.consistencyRulePercent || 50,
      payoutFrequency: fundedAccountData.payoutFrequency || 'weekly',
      maximumPayoutPercentage: fundedAccountData.maximumPayoutPercentage || 90,
      profitSplit: fundedAccountData.profitSplit || 80,
      
      // Link to challenge account
      parentChallengeId: challengeAccountId,
      transitionStatus: 'funded',
      
      // Copy other settings from challenge account
      primaryAsset: challengeAccount.primaryAsset,
      secondaryAsset: challengeAccount.secondaryAsset,
      tertiaryAsset: challengeAccount.tertiaryAsset,
      riskPerTrade: challengeAccount.riskPerTrade,
      riskRewardRatio: challengeAccount.riskRewardRatio,
      consistencyRule: fundedAccountData.consistencyRule ?? challengeAccount.consistencyRule,
      consistencyPercentage: fundedAccountData.consistencyPercentage ?? challengeAccount.consistencyPercentage,
      copyTradingAllowed: fundedAccountData.copyTradingAllowed ?? challengeAccount.copyTradingAllowed,
      newsTradingAllowed: fundedAccountData.newsTradingAllowed ?? challengeAccount.newsTradingAllowed,
      
      ...fundedAccountData
    });

    // Update challenge account to mark as converted
    const updatedChallengeAccount = await this.updateAccount(challengeAccountId, {
      transitionStatus: 'converted',
      fundedAccountId: fundedAccount.id,
      challengePassedDate: new Date()
    });

    return { 
      challengeAccount: updatedChallengeAccount!, 
      fundedAccount 
    };
  }

  // Convert funded account to live account
  async convertToLiveAccount(fundedAccountId: number, liveAccountData: Partial<InsertAccount>): Promise<{ fundedAccount: Account, liveAccount: Account }> {
    const fundedAccount = await this.getAccount(fundedAccountId);
    if (!fundedAccount) {
      throw new Error("Funded account not found");
    }
    
    if (fundedAccount.type !== 'funded') {
      throw new Error("Only funded accounts can be converted to live accounts");
    }

    // Create live account with new rules but same name
    const liveAccount = await this.createAccount({
      name: fundedAccount.name,
      firm: fundedAccount.firm,
      type: 'live',
      startingBalance: fundedAccount.startingBalance, // Keep current balance
      profitTarget: 0, // Live accounts typically don't have profit targets
      maxDrawdown: liveAccountData.maxDrawdown || fundedAccount.maxDrawdown,
      dailyLossLimit: liveAccountData.dailyLossLimit || fundedAccount.dailyLossLimit,
      
      // Live account specific settings
      liveAccountType: liveAccountData.liveAccountType || 'prop_firm',
      profitSplit: liveAccountData.profitSplit || 90,
      payoutFrequency: liveAccountData.payoutFrequency || 'on-demand',
      minimumPayoutAmount: liveAccountData.minimumPayoutAmount || 500,
      
      // Link to funded account
      parentFundedId: fundedAccountId,
      transitionStatus: 'live',
      
      // Copy other settings from funded account
      primaryAsset: fundedAccount.primaryAsset,
      secondaryAsset: fundedAccount.secondaryAsset,
      tertiaryAsset: fundedAccount.tertiaryAsset,
      riskPerTrade: fundedAccount.riskPerTrade,
      riskRewardRatio: fundedAccount.riskRewardRatio,
      copyTradingAllowed: liveAccountData.copyTradingAllowed ?? fundedAccount.copyTradingAllowed,
      newsTradingAllowed: liveAccountData.newsTradingAllowed ?? fundedAccount.newsTradingAllowed,
      
      ...liveAccountData
    });

    // Update funded account to mark as converted
    const updatedFundedAccount = await this.updateAccount(fundedAccountId, {
      transitionStatus: 'converted',
      liveAccountId: liveAccount.id,
      fundedToLiveDate: new Date()
    });

    return { 
      fundedAccount: updatedFundedAccount!, 
      liveAccount 
    };
  }

  // Trading Strategy operations
  async getTradingStrategies(userId: string): Promise<TradingStrategy[]> {
    return await db.select().from(tradingStrategies)
      .where(eq(tradingStrategies.userId, userId))
      .orderBy(desc(tradingStrategies.createdAt));
  }

  async getTradingStrategy(id: number): Promise<TradingStrategy | undefined> {
    const [strategy] = await db.select().from(tradingStrategies).where(eq(tradingStrategies.id, id));
    return strategy || undefined;
  }

  async createTradingStrategy(strategy: InsertTradingStrategy): Promise<TradingStrategy> {
    const [newStrategy] = await db
      .insert(tradingStrategies)
      .values(strategy)
      .returning();
    return newStrategy;
  }

  async updateTradingStrategy(id: number, strategy: Partial<InsertTradingStrategy>): Promise<TradingStrategy | undefined> {
    const [updatedStrategy] = await db
      .update(tradingStrategies)
      .set({ ...strategy, updatedAt: new Date() })
      .where(eq(tradingStrategies.id, id))
      .returning();
    return updatedStrategy || undefined;
  }

  async deleteTradingStrategy(id: number): Promise<boolean> {
    // Check if strategy is used in any daily plans
    const referencedPlans = await db.select({ id: dailyPlans.id })
      .from(dailyPlans)
      .where(eq(dailyPlans.strategyId, id))
      .limit(1);
    
    if (referencedPlans.length > 0) {
      throw new Error("Cannot delete strategy: it is being used in daily plans. Please delete the associated daily plans first.");
    }
    
    const result = await db.delete(tradingStrategies).where(eq(tradingStrategies.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Daily Plan operations
  async getDailyPlans(userId: string, accountId?: number): Promise<DailyPlan[]> {
    let query = db.select().from(dailyPlans)
      .where(eq(dailyPlans.userId, userId));
    
    if (accountId) {
      query = db.select().from(dailyPlans)
        .where(and(eq(dailyPlans.userId, userId), eq(dailyPlans.accountId, accountId)));
    }
    
    return await query.orderBy(desc(dailyPlans.date));
  }

  async getDailyPlan(id: number): Promise<DailyPlan | undefined> {
    const [plan] = await db.select().from(dailyPlans).where(eq(dailyPlans.id, id));
    return plan || undefined;
  }

  async getDailyPlanByDate(userId: string, date: string): Promise<DailyPlan | undefined> {
    const [plan] = await db.select().from(dailyPlans)
      .where(and(eq(dailyPlans.userId, userId), eq(dailyPlans.date, date)));
    return plan || undefined;
  }

  async createDailyPlan(plan: InsertDailyPlan): Promise<DailyPlan> {
    const [newPlan] = await db
      .insert(dailyPlans)
      .values(plan)
      .returning();
    return newPlan;
  }

  async updateDailyPlan(id: number, plan: Partial<InsertDailyPlan>): Promise<DailyPlan | undefined> {
    const [updatedPlan] = await db
      .update(dailyPlans)
      .set({ ...plan, updatedAt: new Date() })
      .where(eq(dailyPlans.id, id))
      .returning();
    return updatedPlan || undefined;
  }

  async deleteDailyPlan(id: number): Promise<boolean> {
    const result = await db.delete(dailyPlans).where(eq(dailyPlans.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Strategy Rule Tracking operations
  async getStrategyRuleTracking(dailyPlanId: number): Promise<StrategyRuleTracking[]> {
    return await db.select().from(strategyRuleTracking)
      .where(eq(strategyRuleTracking.dailyPlanId, dailyPlanId))
      .orderBy(asc(strategyRuleTracking.createdAt));
  }

  async createStrategyRuleTracking(tracking: InsertStrategyRuleTracking): Promise<StrategyRuleTracking> {
    const [newTracking] = await db
      .insert(strategyRuleTracking)
      .values(tracking)
      .returning();
    return newTracking;
  }

  async updateStrategyRuleTracking(id: number, tracking: Partial<InsertStrategyRuleTracking>): Promise<StrategyRuleTracking | undefined> {
    const [updatedTracking] = await db
      .update(strategyRuleTracking)
      .set(tracking)
      .where(eq(strategyRuleTracking.id, id))
      .returning();
    return updatedTracking || undefined;
  }

  // Budget Category operations
  async getBudgetCategories(userId: string): Promise<BudgetCategory[]> {
    return await db.select().from(budgetCategories)
      .where(eq(budgetCategories.userId, userId))
      .orderBy(asc(budgetCategories.name));
  }

  async createBudgetCategory(category: InsertBudgetCategory): Promise<BudgetCategory> {
    const [newCategory] = await db
      .insert(budgetCategories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateBudgetCategory(id: number, category: Partial<InsertBudgetCategory>): Promise<BudgetCategory | undefined> {
    const [updatedCategory] = await db
      .update(budgetCategories)
      .set({ ...category, updatedAt: new Date() })
      .where(eq(budgetCategories.id, id))
      .returning();
    return updatedCategory || undefined;
  }

  async deleteBudgetCategory(id: number): Promise<boolean> {
    const result = await db.delete(budgetCategories).where(eq(budgetCategories.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Budget Plan operations
  async getActiveBudgetPlan(userId: string): Promise<BudgetPlan | undefined> {
    const [plan] = await db.select().from(budgetPlans)
      .where(and(eq(budgetPlans.userId, userId), eq(budgetPlans.isActive, true)))
      .orderBy(desc(budgetPlans.createdAt));
    return plan || undefined;
  }

  async createBudgetPlan(plan: InsertBudgetPlan): Promise<BudgetPlan> {
    // Deactivate existing plans first
    await db.update(budgetPlans)
      .set({ isActive: false })
      .where(eq(budgetPlans.userId, plan.userId));
    
    const [newPlan] = await db
      .insert(budgetPlans)
      .values({ ...plan, isActive: true })
      .returning();
    return newPlan;
  }

  async updateBudgetPlan(id: number, plan: Partial<InsertBudgetPlan>): Promise<BudgetPlan | undefined> {
    const [updatedPlan] = await db
      .update(budgetPlans)
      .set({ ...plan, updatedAt: new Date() })
      .where(eq(budgetPlans.id, id))
      .returning();
    return updatedPlan || undefined;
  }
}

export const storage = new DatabaseStorage();