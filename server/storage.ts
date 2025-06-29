import { 
  accounts, trades, journalEntries, dailyStats, csvImports,
  type Account, type InsertAccount,
  type Trade, type InsertTrade, 
  type JournalEntry, type InsertJournalEntry,
  type DailyStats, type InsertDailyStats,
  type CsvImport, type InsertCsvImport
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
}

export class MemStorage implements IStorage {
  private accounts: Map<number, Account> = new Map();
  private trades: Map<number, Trade> = new Map();
  private journalEntries: Map<number, JournalEntry> = new Map();
  private dailyStats: Map<number, DailyStats> = new Map();
  private currentId = 1;

  constructor() {
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample accounts
    const account1: Account = {
      id: 1,
      name: "GT Account #3831",
      type: "challenge",
      firm: "PropFirm Pro",
      startingBalance: 150000,
      currentBalance: 148337.50,
      maxDrawdown: 7500,
      dailyLossLimit: 150,
      profitTarget: 15000,
      status: "active",
      createdAt: new Date(),
    };

    const account2: Account = {
      id: 2,
      name: "LeMans #3940",
      type: "funded",
      firm: "PropFirm Pro",
      startingBalance: 300000,
      currentBalance: 315250,
      maxDrawdown: 15000,
      dailyLossLimit: 300,
      profitTarget: 0,
      status: "active",
      createdAt: new Date(),
    };

    const account3: Account = {
      id: 3,
      name: "Daytona #2155",
      type: "challenge",
      firm: "PropFirm Pro",
      startingBalance: 50000,
      currentBalance: 47850,
      maxDrawdown: 2500,
      dailyLossLimit: 100,
      profitTarget: 5000,
      status: "active",
      createdAt: new Date(),
    };

    this.accounts.set(1, account1);
    this.accounts.set(2, account2);
    this.accounts.set(3, account3);

    // Create sample trades
    const trades = [
      {
        id: 1,
        accountId: 1,
        date: "2024-10-07",
        symbol: "ES",
        side: "sell",
        quantity: 10,
        entryPrice: 5800,
        exitPrice: 5900,
        pnl: -7000,
        status: "closed",
        notes: "Revenge trading - should have stopped earlier"
      },
      {
        id: 2,
        accountId: 1,
        date: "2024-10-04",
        symbol: "ES",
        side: "buy",
        quantity: 5,
        entryPrice: 5750,
        exitPrice: 5850,
        pnl: 1400,
        status: "closed",
        notes: "Good setup, followed rules"
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

    // Create sample journal entries
    const journalEntries = [
      {
        id: 1,
        accountId: 1,
        date: "2024-10-07",
        whatWentWrong: "I made a revenge trade after initial loss. Violated risk management rules by increasing position size instead of accepting the loss.",
        whatWentRight: "At least I closed the position before it got worse and didn't let it run overnight.",
        improvementPlan: "Stick to original position sizing. Take a break after any loss > $500. Review rules before next session."
      },
      {
        id: 2,
        accountId: 1,
        date: "2024-10-04",
        whatWentWrong: "Entered slightly early without perfect setup confirmation.",
        whatWentRight: "Followed my trading plan, proper position sizing, took profit at target.",
        improvementPlan: "Wait for complete setup confirmation before entry. No FOMO trades."
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
}

export const storage = new MemStorage();
