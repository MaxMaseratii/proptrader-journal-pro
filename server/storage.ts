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
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, gte, lte } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();