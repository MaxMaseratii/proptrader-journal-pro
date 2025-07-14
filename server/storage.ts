import { 
  accounts, trades, journalEntries, dailyStats, csvImports, spending, users, achievements, userStats, savedProjections,
  type Account, type InsertAccount,
  type Trade, type InsertTrade, 
  type JournalEntry, type InsertJournalEntry,
  type DailyStats, type InsertDailyStats,
  type CsvImport, type InsertCsvImport,
  type Spending, type InsertSpending,
  type User, type UpsertUser,
  type Achievement, type InsertAchievement,
  type UserStats, type InsertUserStats,
  type SavedProjection, type InsertSavedProjection
} from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private accounts: Map<number, Account> = new Map();
  private trades: Map<number, Trade> = new Map();
  private journalEntries: Map<number, JournalEntry> = new Map();
  private dailyStats: Map<number, DailyStats> = new Map();
  private csvImports: Map<number, CsvImport> = new Map();
  private spendingEntries: Map<number, Spending> = new Map();
  private currentId = 1;

  constructor() {
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample accounts with fictional prop firm names
    const account1: Account = {
      id: 1,
      name: "Elite Futures Challenge #150K",
      type: "challenge",
      firm: "Elite Futures Academy",
      startingBalance: 150000,
      currentBalance: 153420.75,
      maxDrawdown: 3000,
      dailyLossLimit: 1500,
      profitTarget: 6000,
      status: "active",
      riskPerTrade: 300,
      riskPercentage: 1.0,
      maxPositionSize: 10000,
      maxTradesPerDay: 5,
      preferredAssets: "ES,NQ,YM",
      createdAt: new Date("2024-09-15"),
      hasDailyLossLimit: true,
      dailyLossLimitType: "soft",
      accountCost: 649,
      purchaseMethod: "credit_card",
      resetCount: 0,
      totalResetsCost: 0,
      activationCost: 199,
      activationPaid: true,
      includesActivationFee: false,
      numberOfPhases: 2,
      phase1Target: 6000,
      phase2Target: 4000,
      minimumTradingDays: 5,
      timeLimit: 30,
      tradingCapital: 3000,
      riskCalculationPeriod: "weekly",
      useRiskPercentage: false,
      customRiskAmount: 300,
      riskRewardRatio: 2.0,
      primaryAsset: "ES",
      useIntradayMargins: true,
      marginSafetyBuffer: 50.0,
      stopLossPoints: 10,
      payoutFrequency: "monthly",
      minimumPayoutAmount: 100,
      profitSplit: 80,
      bufferPercentage: 5.0,
      daysRequiredForPayout: 5,
      maximumPayoutPercentage: 90,
      drawdownType: "eod",
      maxTotalLoss: null,
      trailingThreshold: null,
      consistencyRule: null,
      dailyLossLimitResetTime: null,
      transitionTrigger: null
    };

    const account2: Account = {
      id: 2,
      name: "Pro Capital Funded #100K",
      type: "funded",
      firm: "Pro Capital Trading",
      startingBalance: 100000,
      currentBalance: 107850,
      maxDrawdown: 4000,
      dailyLossLimit: 2000,
      profitTarget: 8000,
      status: "funded",
      riskPerTrade: 200,
      riskPercentage: 0.5,
      maxPositionSize: 25000,
      maxTradesPerDay: 3,
      preferredAssets: "ES,NQ,RTY",
      createdAt: new Date("2024-08-20"),
      hasDailyLossLimit: true,
      dailyLossLimitType: "hard",
      accountCost: 399,
      purchaseMethod: "credit_card",
      resetCount: 0,
      totalResetsCost: 0,
      activationCost: 199,
      activationPaid: true,
      includesActivationFee: false,
      numberOfPhases: 2,
      phase1Target: 8000,
      phase2Target: 5000,
      minimumTradingDays: 5,
      timeLimit: 30,
      tradingCapital: 4000,
      riskCalculationPeriod: "monthly",
      useRiskPercentage: true,
      customRiskAmount: null,
      riskRewardRatio: 1.5,
      primaryAsset: "ES",
      useIntradayMargins: false,
      marginSafetyBuffer: 25.0,
      stopLossPoints: null,
      payoutFrequency: "bi_weekly",
      minimumPayoutAmount: 50,
      profitSplit: 90,
      bufferPercentage: 10.0,
      daysRequiredForPayout: 3,
      maximumPayoutPercentage: 80,
      drawdownType: "eod",
      maxTotalLoss: null,
      trailingThreshold: null,
      consistencyRule: null,
      dailyLossLimitResetTime: null,
      transitionTrigger: null
    };

    const account3: Account = {
      id: 3,
      name: "Apex 50K",
      type: "challenge", 
      firm: "Apex Trader Funding",
      startingBalance: 50000,
      currentBalance: 47850,
      maxDrawdown: 2500,
      dailyLossLimit: 100,
      profitTarget: 5000,
      status: "active",
      riskPerTrade: 50,
      riskPercentage: 2.0,
      maxPositionSize: 5000,
      preferredAssets: "AAPL,MSFT,GOOGL",
      createdAt: new Date(),
    };

    this.accounts.set(1, account1);
    this.accounts.set(2, account2);
    this.accounts.set(3, account3);

    // Create comprehensive sample trades
    const trades = [
      {
        id: 1,
        accountId: 1,
        date: "2024-10-30",
        symbol: "ES",
        side: "buy",
        quantity: 3,
        entryPrice: 5842.75,
        exitPrice: 5855.50,
        pnl: 1912.50,
        status: "closed",
        notes: "Perfect trend following setup, followed all rules"
      },
      {
        id: 2,
        accountId: 1,
        date: "2024-10-30",
        symbol: "NQ",
        side: "buy",
        quantity: 2,
        entryPrice: 20125.25,
        exitPrice: 20185.75,
        pnl: 2421.00,
        status: "closed",
        notes: "Tech breakout, excellent entry timing"
      },
      {
        id: 3,
        accountId: 1,
        date: "2024-10-29",
        symbol: "ES",
        side: "sell",
        quantity: 4,
        entryPrice: 5798.25,
        exitPrice: 5784.00,
        pnl: 2850.00,
        status: "closed",
        notes: "Market reversal pattern worked perfectly"
      },
      {
        id: 4,
        accountId: 2,
        date: "2024-10-30",
        symbol: "NQ",
        side: "buy",
        quantity: 1,
        entryPrice: 20095.50,
        exitPrice: 20145.25,
        pnl: 995.00,
        status: "closed",
        notes: "Morning momentum trade"
      },
      {
        id: 5,
        accountId: 2,
        date: "2024-10-29",
        symbol: "ES",
        side: "buy",
        quantity: 2,
        entryPrice: 5785.75,
        exitPrice: 5812.25,
        pnl: 2650.00,
        status: "closed",
        notes: "Support level bounce, textbook setup"
      },
      {
        id: 6,
        accountId: 1,
        date: "2024-10-28",
        symbol: "RTY",
        side: "sell",
        quantity: 5,
        entryPrice: 2185.40,
        exitPrice: 2178.60,
        pnl: 3400.00,
        status: "closed",
        notes: "Small caps weakness, caught the move"
      },
      {
        id: 3,
        accountId: 1,
        date: "2024-10-03",
        symbol: "ES",
        side: "buy",
        quantity: 5,
        entryPrice: 5700,
        exitPrice: 5800,
        pnl: 1375,
        status: "closed",
        notes: "Perfect entry at support"
      },
      {
        id: 4,
        accountId: 1,
        date: "2024-10-02",
        symbol: "ES",
        side: "buy",
        quantity: 3,
        entryPrice: 5680,
        exitPrice: 5730,
        pnl: 575,
        status: "closed",
        notes: "Conservative trade, good discipline"
      }
    ];

    trades.forEach(trade => this.trades.set(trade.id, trade as Trade));

    // Create comprehensive sample journal entries
    const journalEntries = [
      {
        id: 1,
        accountId: 1,
        date: "2024-10-30",
        whatWentWrong: null,
        whatWentRight: "Outstanding trading day! All setups worked perfectly. Stayed disciplined with position sizing and followed my rules exactly. The ES trend trade was textbook - waited for pullback to key level before entering. NQ breakout was beautifully timed with tech strength.",
        improvementPlan: "Continue with current approach. Maybe work on scaling out positions more efficiently to maximize profits on strong trending moves."
      },
      {
        id: 2,
        accountId: 1,
        date: "2024-10-29",
        whatWentWrong: "Almost got greedy on the ES reversal trade - held too long initially before taking profits",
        whatWentRight: "Good risk management overall. Recognized market structure change quickly and adjusted accordingly. Position sizing was perfect.",
        improvementPlan: "Set clearer profit targets before entering trades to avoid indecision during trade management phase."
      },
      {
        id: 3,
        accountId: 2,
        date: "2024-10-30",
        whatWentWrong: null,
        whatWentRight: "Clean execution on both trades. NQ momentum trade was perfectly timed with the tech sector strength in the morning session.",
        improvementPlan: "Look for more opportunities to trade tech momentum early in the session when volatility is highest."
      },
      {
        id: 4,
        accountId: 1,
        date: "2024-10-28",
        whatWentWrong: "Waited too long to enter the RTY short - could have caught more of the move if I trusted my analysis sooner",
        whatWentRight: "Great market read on small cap weakness relative to large caps. Risk management was on point throughout.",
        improvementPlan: "Trust my analysis more and enter positions with better timing on clear setups. Don't second-guess solid market reads."
      },
      {
        id: 5,
        accountId: 2,
        date: "2024-10-29",
        whatWentWrong: null,
        whatWentRight: "Support level bounce on ES was textbook. Patience paid off waiting for the right level and confirmation.",
        improvementPlan: "Continue focusing on high-probability support/resistance plays. These setups have highest win rate in my strategy."
      }
    ];

    journalEntries.forEach(entry => this.journalEntries.set(entry.id, entry as JournalEntry));

    this.currentId = 5;
  }

  // Account operations
  async getAccounts(): Promise<Account[]> {
    return Array.from(this.accounts.values());
  }

  async getAccount(id: number): Promise<Account | undefined> {
    return this.accounts.get(id);
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const id = this.currentId++;
    const newAccount: Account = { 
      ...account, 
      id, 
      createdAt: new Date() 
    };
    this.accounts.set(id, newAccount);
    return newAccount;
  }

  async updateAccount(id: number, account: Partial<InsertAccount>): Promise<Account | undefined> {
    const existing = this.accounts.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...account };
    this.accounts.set(id, updated);
    return updated;
  }

  async deleteAccount(id: number): Promise<boolean> {
    return this.accounts.delete(id);
  }

  // Trade operations
  async getTrades(accountId?: number): Promise<Trade[]> {
    const allTrades = Array.from(this.trades.values());
    return accountId ? allTrades.filter(trade => trade.accountId === accountId) : allTrades;
  }

  async getTrade(id: number): Promise<Trade | undefined> {
    return this.trades.get(id);
  }

  async createTrade(trade: InsertTrade): Promise<Trade> {
    const id = this.currentId++;
    const newTrade: Trade = { ...trade, id };
    this.trades.set(id, newTrade);
    
    // Update account balance
    const account = this.accounts.get(trade.accountId);
    if (account) {
      account.currentBalance += trade.pnl;
      this.accounts.set(account.id, account);
    }
    
    return newTrade;
  }

  async updateTrade(id: number, trade: Partial<InsertTrade>): Promise<Trade | undefined> {
    const existing = this.trades.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...trade };
    this.trades.set(id, updated);
    return updated;
  }

  async deleteTrade(id: number): Promise<boolean> {
    return this.trades.delete(id);
  }

  // Journal operations
  async getJournalEntries(accountId?: number): Promise<JournalEntry[]> {
    const allEntries = Array.from(this.journalEntries.values());
    return accountId ? allEntries.filter(entry => entry.accountId === accountId) : allEntries;
  }

  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    return this.journalEntries.get(id);
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const id = this.currentId++;
    const newEntry: JournalEntry = { ...entry, id };
    this.journalEntries.set(id, newEntry);
    return newEntry;
  }

  async updateJournalEntry(id: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const existing = this.journalEntries.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...entry };
    this.journalEntries.set(id, updated);
    return updated;
  }

  async deleteJournalEntry(id: number): Promise<boolean> {
    return this.journalEntries.delete(id);
  }

  // Daily stats operations
  async getDailyStats(accountId?: number): Promise<DailyStats[]> {
    const allStats = Array.from(this.dailyStats.values());
    return accountId ? allStats.filter(stat => stat.accountId === accountId) : allStats;
  }

  async getDailyStatsForDateRange(accountId: number, startDate: string, endDate: string): Promise<DailyStats[]> {
    const accountStats = await this.getDailyStats(accountId);
    return accountStats.filter(stat => 
      stat.date >= startDate && stat.date <= endDate
    );
  }

  async createDailyStats(stats: InsertDailyStats): Promise<DailyStats> {
    const id = this.currentId++;
    const newStats: DailyStats = { ...stats, id };
    this.dailyStats.set(id, newStats);
    return newStats;
  }

  async updateDailyStats(id: number, stats: Partial<InsertDailyStats>): Promise<DailyStats | undefined> {
    const existing = this.dailyStats.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...stats };
    this.dailyStats.set(id, updated);
    return updated;
  }

  // CSV Import operations
  async getCsvImports(accountId?: number): Promise<CsvImport[]> {
    const allImports = Array.from(this.csvImports.values());
    return accountId ? allImports.filter(csvImport => csvImport.accountId === accountId) : allImports;
  }

  async createCsvImport(csvImport: InsertCsvImport): Promise<CsvImport> {
    const id = this.currentId++;
    const newImport: CsvImport = { 
      ...csvImport, 
      id,
      importDate: new Date()
    };
    this.csvImports.set(id, newImport);
    return newImport;
  }

  // Spending operations
  async getSpending(accountId?: number): Promise<Spending[]> {
    const allSpending = Array.from(this.spendingEntries.values());
    return accountId ? allSpending.filter(spending => spending.accountId === accountId) : allSpending;
  }

  async createSpending(spendingData: InsertSpending): Promise<Spending> {
    const id = this.currentId++;
    const newSpending: Spending = { 
      ...spendingData, 
      id,
      createdAt: new Date()
    };
    this.spendingEntries.set(id, newSpending);
    return newSpending;
  }

  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    // For in-memory storage, users would be stored in a Map
    // This is a placeholder implementation since we're switching to database
    return undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // For in-memory storage, this would create/update a user
    // This is a placeholder implementation since we're switching to database
    const user: User = {
      id: userData.id || '',
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return user;
  }

  // Achievement operations
  async getAchievements(userId: string): Promise<Achievement[]> {
    return [];
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const id = this.currentId++;
    const newAchievement: Achievement = { 
      ...achievement, 
      id,
      createdAt: new Date(),
      unlockedAt: achievement.isUnlocked ? new Date() : null
    };
    return newAchievement;
  }

  async updateAchievement(id: number, achievement: Partial<InsertAchievement>): Promise<Achievement | undefined> {
    return undefined;
  }

  // User stats operations
  async getUserStats(userId: string): Promise<UserStats | undefined> {
    return undefined;
  }

  async createUserStats(stats: InsertUserStats): Promise<UserStats> {
    const id = this.currentId++;
    const newStats: UserStats = { 
      ...stats, 
      id,
      lastUpdated: new Date()
    };
    return newStats;
  }

  async updateUserStats(userId: string, stats: Partial<InsertUserStats>): Promise<UserStats | undefined> {
    return undefined;
  }

  async updateUserWage(userId: string, personalHourlyWage: number): Promise<User | null> {
    return null;
  }
}

// Switch to DatabaseStorage for authentication support
import { db } from "./db";
import { eq, and } from "drizzle-orm";

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
      .set({
        personalHourlyWage,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user || null;
  }

  // Account operations
  async getAccounts(): Promise<Account[]> {
    return await db.select().from(accounts);
  }

  async getAccount(id: number): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account || undefined;
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const [newAccount] = await db.insert(accounts).values(account).returning();
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
    return result.rowCount > 0;
  }

  // Trade operations
  async getTrades(accountId?: number): Promise<Trade[]> {
    if (accountId) {
      return await db.select().from(trades).where(eq(trades.accountId, accountId));
    }
    return await db.select().from(trades);
  }

  async getTrade(id: number): Promise<Trade | undefined> {
    const [trade] = await db.select().from(trades).where(eq(trades.id, id));
    return trade || undefined;
  }

  async createTrade(trade: InsertTrade): Promise<Trade> {
    const [newTrade] = await db.insert(trades).values(trade).returning();
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
    return result.rowCount > 0;
  }

  // Journal operations
  async getJournalEntries(accountId?: number): Promise<JournalEntry[]> {
    if (accountId) {
      return await db.select().from(journalEntries).where(eq(journalEntries.accountId, accountId));
    }
    return await db.select().from(journalEntries);
  }

  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    return entry || undefined;
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [newEntry] = await db.insert(journalEntries).values(entry).returning();
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
    return result.rowCount > 0;
  }

  // Daily stats operations
  async getDailyStats(accountId?: number): Promise<DailyStats[]> {
    if (accountId) {
      return await db.select().from(dailyStats).where(eq(dailyStats.accountId, accountId));
    }
    return await db.select().from(dailyStats);
  }

  async getDailyStatsForDateRange(accountId: number, startDate: string, endDate: string): Promise<DailyStats[]> {
    // Implementation would filter by date range
    return await db.select().from(dailyStats).where(eq(dailyStats.accountId, accountId));
  }

  async createDailyStats(stats: InsertDailyStats): Promise<DailyStats> {
    const [newStats] = await db.insert(dailyStats).values(stats).returning();
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
      return await db.select().from(csvImports).where(eq(csvImports.accountId, accountId));
    }
    return await db.select().from(csvImports);
  }

  async createCsvImport(csvImport: InsertCsvImport): Promise<CsvImport> {
    const [newImport] = await db.insert(csvImports).values(csvImport).returning();
    return newImport;
  }

  // Spending operations
  async getSpending(accountId?: number): Promise<Spending[]> {
    if (accountId) {
      return await db.select().from(spending).where(eq(spending.accountId, accountId));
    }
    return await db.select().from(spending);
  }

  async createSpending(spendingData: InsertSpending): Promise<Spending> {
    const [newSpending] = await db.insert(spending).values(spendingData).returning();
    return newSpending;
  }

  // Achievement operations
  async getAchievements(userId: string): Promise<Achievement[]> {
    return await db.select().from(achievements).where(eq(achievements.userId, userId));
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db.insert(achievements).values(achievement).returning();
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
    const [newStats] = await db.insert(userStats).values(stats).returning();
    return newStats;
  }

  async updateUserStats(userId: string, stats: Partial<InsertUserStats>): Promise<UserStats | undefined> {
    const [updatedStats] = await db
      .update(userStats)
      .set({ ...stats, lastUpdated: new Date() })
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
    const [newProjection] = await db.insert(savedProjections).values({
      ...projection,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return newProjection;
  }

  async updateSavedProjection(id: number, projection: Partial<InsertSavedProjection>, userId: string): Promise<SavedProjection | undefined> {
    const [updatedProjection] = await db
      .update(savedProjections)
      .set({ ...projection, updatedAt: new Date() })
      .where(and(eq(savedProjections.id, id), eq(savedProjections.userId, userId)))
      .returning();
    return updatedProjection || undefined;
  }
}

export const storage = new DatabaseStorage();
