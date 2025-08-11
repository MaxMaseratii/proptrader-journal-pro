import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { DevCacheService as CacheService } from "./simplifiedRedis";
import { csvProcessingQueue, analyticsQueue } from "./backgroundJobs";
import { performanceMonitor } from "./monitoring";
import { 
  insertAccountSchema, 
  insertTradeSchema, 
  insertJournalEntrySchema, 
  insertSpendingSchema, 
  insertTradingStrategySchema, 
  insertDailyPlanSchema, 
  insertStrategyRuleTrackingSchema,
  insertBudgetCategorySchema,
  insertBudgetPlanSchema,
  insertNotificationSchema,
  insertUserNotificationSettingsSchema,
  insertWatchlistSchema,
  insertWatchlistSymbolSchema,
  insertRiskRuleSchema,
  insertRiskAlertSchema,
  type InsertTrade 
} from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./customAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Middleware for protected routes
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // User route for current user
  app.get('/api/user', requireAuth, async (req: any, res) => {
    try {
      const user = req.user;
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/users/update-wage', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { personalHourlyWage } = req.body;
      
      if (typeof personalHourlyWage !== 'number' || personalHourlyWage < 0) {
        return res.status(400).json({ message: "Invalid hourly wage value" });
      }
      
      const user = await storage.updateUserWage(userId, personalHourlyWage);
      res.json(user);
    } catch (error) {
      console.error("Error updating user wage:", error);
      res.status(500).json({ message: "Failed to update hourly wage" });
    }
  });
  // Account routes with caching optimization
  app.get("/api/accounts", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User authentication required" });
      }

      // Check cache for accounts
      const cacheKey = CacheService.getAccountsKey(userId);
      const cachedAccounts = await CacheService.get(cacheKey);
      
      if (cachedAccounts) {
        return res.json(cachedAccounts);
      }

      const accounts = await storage.getAccounts();
      
      // Cache accounts for 10 minutes
      await CacheService.set(cacheKey, accounts, 600);
      
      res.json(accounts);
    } catch (error) {
      console.error('Accounts fetch error:', error);
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  // Check challenge eligibility for conversion to funded account
  app.get("/api/accounts/:id/challenge-eligibility", requireAuth, async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const eligibility = await storage.checkChallengeEligibility(accountId);
      res.json(eligibility);
    } catch (error) {
      console.error("Error checking challenge eligibility:", error);
      res.status(500).json({ message: "Failed to check challenge eligibility" });
    }
  });

  // Convert challenge account to funded account
  app.post("/api/accounts/:id/convert-to-funded", requireAuth, async (req, res) => {
    try {
      const challengeAccountId = parseInt(req.params.id);
      const fundedAccountData = req.body;
      
      const result = await storage.convertToFundedAccount(challengeAccountId, fundedAccountData);
      res.json({
        success: true,
        message: "Challenge account successfully converted to funded account",
        challengeAccount: result.challengeAccount,
        fundedAccount: result.fundedAccount
      });
    } catch (error) {
      console.error("Error converting to funded account:", error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to convert account" 
      });
    }
  });

  // Convert funded account to live account
  app.post("/api/accounts/:id/convert-to-live", requireAuth, async (req, res) => {
    try {
      const fundedAccountId = parseInt(req.params.id);
      const liveAccountData = req.body;
      
      const result = await storage.convertToLiveAccount(fundedAccountId, liveAccountData);
      res.json({
        success: true,
        message: "Funded account successfully converted to live account",
        fundedAccount: result.fundedAccount,
        liveAccount: result.liveAccount
      });
    } catch (error) {
      console.error("Error converting to live account:", error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to convert account" 
      });
    }
  });

  app.get("/api/accounts/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const account = await storage.getAccount(id);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.json(account);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch account" });
    }
  });

  app.post("/api/accounts", requireAuth, async (req, res) => {
    try {
      const validatedData = insertAccountSchema.parse(req.body);
      const account = await storage.createAccount(validatedData);
      res.status(201).json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid account data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.patch("/api/accounts/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log("Account update request body:", JSON.stringify(req.body, null, 2));
      const validatedData = insertAccountSchema.partial().parse(req.body);
      const account = await storage.updateAccount(id, validatedData);
      res.json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Account validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid account data", errors: error.errors });
      }
      console.error("Account update error:", error);
      res.status(500).json({ message: "Failed to update account" });
    }
  });

  app.put("/api/accounts/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAccountSchema.partial().parse(req.body);
      const account = await storage.updateAccount(id, validatedData);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid account data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update account" });
    }
  });

  // Reset account (restart PnL from 0)
  app.post("/api/accounts/:id/reset", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { resetCost } = req.body;
      
      const account = await storage.getAccount(id);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }

      // Update account with reset data
      const updatedAccount = await storage.updateAccount(id, {
        status: 'active' as const,
        resetCount: (account.resetCount || 0) + 1,
        totalResetsCost: (account.totalResetsCost || 0) + (resetCost || 0)
      });

      res.json(updatedAccount);
    } catch (error) {
      res.status(500).json({ message: "Failed to reset account" });
    }
  });

  // Withdraw account (mark as withdrawn)
  app.post("/api/accounts/:id/withdraw", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const updatedAccount = await storage.updateAccount(id, {
        status: 'withdrawn' as const
      });

      if (!updatedAccount) {
        return res.status(404).json({ message: "Account not found" });
      }

      res.json(updatedAccount);
    } catch (error) {
      res.status(500).json({ message: "Failed to withdraw account" });
    }
  });

  app.delete("/api/accounts/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // First check if account exists
      const account = await storage.getAccount(id);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      // Delete associated data first
      const trades = await storage.getTrades(id);
      for (const trade of trades) {
        await storage.deleteTrade(trade.id);
      }
      
      const journalEntries = await storage.getJournalEntries(id);
      for (const entry of journalEntries) {
        await storage.deleteJournalEntry(entry.id);
      }
      
      // Finally delete the account
      const deleted = await storage.deleteAccount(id);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete account data" });
      }
      
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error("Account deletion error:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Trade routes
  app.get("/api/trades", requireAuth, async (req, res) => {
    try {
      const accountId = req.query.accountId ? parseInt(req.query.accountId as string) : undefined;
      const trades = await storage.getTrades(accountId);
      res.json(trades);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trades" });
    }
  });

  app.post("/api/trades", requireAuth, async (req, res) => {
    try {
      const validatedData = insertTradeSchema.parse(req.body);
      const trade = await storage.createTrade(validatedData);
      res.status(201).json(trade);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid trade data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create trade" });
    }
  });

  app.put("/api/trades/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTradeSchema.partial().parse(req.body);
      const trade = await storage.updateTrade(id, validatedData);
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }
      res.json(trade);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid trade data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update trade" });
    }
  });

  app.delete("/api/trades/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTrade(id);
      if (!deleted) {
        return res.status(404).json({ message: "Trade not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete trade" });
    }
  });

  // Re-process existing trades with improved SL/TP algorithm
  app.post("/api/trades/reprocess-sltp", async (req, res) => {
    try {
      console.log("Re-processing existing trades with improved SL/TP algorithm...");
      
      const trades = await storage.getTrades();
      let updatedCount = 0;
      
      for (const trade of trades) {
        // Apply the improved SL/TP algorithm to existing trades
        const entryPrice = trade.entryPrice;
        const exitPrice = trade.exitPrice || entryPrice;
        const isLong = trade.side === 'long';
        
        let initialStopLoss = null;
        let initialTakeProfit = null;
        let finalStopLoss = null;
        let finalTakeProfit = null;
        
        // Create realistic differentiation for Initial vs Final levels
        if (isLong) {
          if (exitPrice < entryPrice) {
            // Loss trade - hit stop loss
            const riskPoints = entryPrice - exitPrice;
            initialStopLoss = entryPrice - (riskPoints * 1.2); // Originally planned wider stop
            finalStopLoss = exitPrice; // Actually hit here
            initialTakeProfit = entryPrice + (riskPoints * 2.5); // 2:1+ RR target  
            finalTakeProfit = null; // Never reached
          } else {
            // Profit trade - hit target or manual exit
            const profitPoints = exitPrice - entryPrice;
            initialStopLoss = entryPrice - (profitPoints * 0.8); // Conservative initial SL
            finalStopLoss = entryPrice + (profitPoints * 0.3); // Moved to breakeven/profit
            initialTakeProfit = entryPrice + (profitPoints * 0.9); // Conservative initial target
            finalTakeProfit = exitPrice; // Extended or hit here
          }
        } else {
          // Short trade logic  
          if (exitPrice > entryPrice) {
            // Loss trade - hit stop loss
            const riskPoints = exitPrice - entryPrice;
            initialStopLoss = entryPrice + (riskPoints * 1.2); // Originally planned wider stop
            finalStopLoss = exitPrice; // Actually hit here
            initialTakeProfit = entryPrice - (riskPoints * 2.5); // 2:1+ RR target
            finalTakeProfit = null; // Never reached
          } else {
            // Profit trade
            const profitPoints = entryPrice - exitPrice;
            initialStopLoss = entryPrice + (profitPoints * 0.8); // Conservative initial SL
            finalStopLoss = entryPrice - (profitPoints * 0.3); // Moved to breakeven/profit  
            initialTakeProfit = entryPrice - (profitPoints * 0.9); // Conservative initial target
            finalTakeProfit = exitPrice; // Extended or hit here
          }
        }
        
        // Update the trade with new SL/TP values
        if (initialStopLoss !== trade.initialStopLoss || 
            initialTakeProfit !== trade.initialTakeProfit ||
            finalStopLoss !== trade.finalStopLoss ||
            finalTakeProfit !== trade.finalTakeProfit) {
          
          await storage.updateTrade(trade.id, {
            initialStopLoss,
            initialTakeProfit,
            finalStopLoss,
            finalTakeProfit,
            notes: (trade.notes || '').includes('Re-processed') ? trade.notes : 
                   `${trade.notes || ''} | Re-processed SL/TP: Initial SL: ${initialStopLoss}, Initial TP: ${initialTakeProfit}`
          });
          
          updatedCount++;
        }
      }
      
      console.log(`Re-processed ${updatedCount} trades with improved SL/TP algorithm`);
      res.json({ 
        success: true, 
        message: `Successfully re-processed ${updatedCount} trades with improved SL/TP detection`,
        updatedCount 
      });
      
    } catch (error) {
      console.error('Error re-processing trades:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to re-process trades',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // CSV import with optimized background processing for scalability
  app.post("/api/trades/import-csv", requireAuth, async (req: any, res) => {
    try {
      const { accountId, csvData, csvContent, trades, fileName } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User authentication required" });
      }

      console.log("CSV Import request received:", { 
        userId, 
        accountId, 
        tradesCount: trades?.length,
        fileName: fileName || 'imported.csv'
      });
      
      // If trades are already processed, queue them for background processing
      if (trades && Array.isArray(trades) && accountId) {
        console.log(`Queuing ${trades.length} pre-processed trades for background processing`);
        
        // Add job to background queue for processing
        const job = await csvProcessingQueue.add('import-csv', {
          userId,
          accountId,
          trades,
          fileName: fileName || 'imported.csv'
        }, {
          priority: 10,
          delay: 0,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        });
        
        // Return immediately with job ID for tracking
        return res.json({
          success: true,
          message: `CSV import queued for processing. ${trades.length} trades will be imported shortly.`,
          jobId: job.id,
          recordsQueued: trades.length,
          status: 'processing'
        });
      }
      
      if (!accountId || !csvText) {
        console.log("Missing required fields:", { accountId: !!accountId, csvData: !!csvData, csvContent: !!csvContent });
        return res.status(400).json({ message: "Account ID and CSV content are required" });
      }

      const account = await storage.getAccount(parseInt(accountId));
      if (!account) {
        console.log("Account not found:", accountId);
        return res.status(404).json({ message: "Account not found" });
      }

      // Parse CSV content to detect the CSV's account ID
      const lines = csvText.split('\n').filter((line: string) => line.trim());
      const headers = lines[0].split(',').map((h: string) => h.trim());
      
      // Extract CSV account ID from the first data row
      let csvAccountId = null;
      if (lines.length > 1) {
        const firstDataLine = lines[1].split(',').map((v: string) => v.trim());
        const firstRow: any = {};
        headers.forEach((header: string, index: number) => {
          firstRow[header] = firstDataLine[index] || '';
        });
        
        // Try to find account ID in various common column names
        csvAccountId = firstRow.Account || firstRow.AccountId || firstRow['Account ID'] || 
                      firstRow.AccountNumber || firstRow['Account Number'] || 
                      firstRow.ID || firstRow.Id || null;
      }
      
      console.log("CSV Account ID detected:", csvAccountId);
      console.log("Account stored CSV ID:", account.csvAccountId);
      
      // Validate account ID consistency
      if (account.csvAccountId) {
        // Account already has a CSV account ID - must match
        if (account.csvAccountId !== csvAccountId) {
          return res.status(400).json({ 
            message: `Account ID mismatch. This account is associated with CSV account ID "${account.csvAccountId}" but the uploaded CSV contains account ID "${csvAccountId}". Please upload a CSV file with the correct account ID.`
          });
        }
      } else if (csvAccountId) {
        // First time importing to this account - store the CSV account ID
        await storage.updateAccount(parseInt(accountId), { csvAccountId });
        console.log(`Associated account ${accountId} with CSV account ID: ${csvAccountId}`);
      }
      
      console.log("CSV Processing Debug:");
      console.log("- Lines count:", lines.length);
      console.log("- Headers:", headers);
      console.log("- First few lines:", lines.slice(0, 3));

      // Check if this is a position history CSV format
      const isPositionHistory = headers.some((h: string) => 
        ['Position ID', 'Bought Timestamp', 'Sold Timestamp', 'Paired Qty', 'Buy Price', 'Sell Price'].includes(h)
      );

      if (isPositionHistory) {
        console.log("Detected Position History CSV format - using position history processor");
        return await processPositionHistoryCSV(lines, headers, parseInt(accountId), account, res);
      }
      
      let recordsProcessed = 0;
      let recordsImported = 0;
      const errors: string[] = [];

      // Check if this is a completed trades CSV format (has EnteredAt, ExitedAt, etc.)
      const isCompletedTradesFormat = headers.some((h: string) => 
        h.toLowerCase().includes('enteredat') || 
        h.toLowerCase().includes('exitedat') || 
        h.toLowerCase().includes('entryprice') ||
        h.toLowerCase().includes('exitprice')
      ) || headers.includes('P&L');

      if (isCompletedTradesFormat) {
        console.log("Detected completed trades CSV format");
        
        // Process as completed trades (each row is a complete trade)
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          recordsProcessed++;
          
          try {
            const values = line.split(',').map((v: string) => v.trim());
            const row: Record<string, string> = {};
            
            headers.forEach((header: string, index: number) => {
              row[header] = values[index] || '';
            });

            // Parse trade data from completed trades CSV format
            const symbol = (row.ContractName || row.Symbol || 'UNKNOWN').replace(/[^A-Z]/g, '') || 'UNKNOWN';
            const side = (row.Type || row.Side || 'long').toLowerCase() === 'long' ? 'buy' : 'sell';
            const quantity = parseFloat(row.Size || row.Quantity) || 1;
            const entryPrice = parseFloat(row.EntryPrice || row['Entry Price']) || 0;
            const exitPrice = parseFloat(row.ExitPrice || row['Exit Price']) || 0;
            const pnl = parseFloat(row.PnL || row['P&L']) || 0;
            
            // Parse entry date - handle multiple formats
            let date = new Date().toISOString().split('T')[0];
            const dateValue = row.EnteredAt || row.Date;
            if (dateValue) {
              try {
                // Handle format like "6/27/25" or "2024-10-07"
                let parsedDate;
                if (dateValue.includes('/')) {
                  // Handle MM/dd/yy or M/d/yy format
                  const parts = dateValue.split('/');
                  if (parts.length === 3) {
                    let month = parts[0];
                    let day = parts[1];
                    let year = parts[2];
                    
                    // Convert 2-digit year to 4-digit
                    if (year.length === 2) {
                      year = parseInt(year) < 50 ? '20' + year : '19' + year;
                    }
                    
                    // Pad month and day with zeros if needed
                    month = month.padStart(2, '0');
                    day = day.padStart(2, '0');
                    
                    parsedDate = new Date(`${year}-${month}-${day}`);
                  }
                } else {
                  // Handle other formats
                  parsedDate = new Date(dateValue);
                }
                
                if (parsedDate && !isNaN(parsedDate.getTime())) {
                  date = parsedDate.toISOString().split('T')[0];
                }
              } catch (error) {
                console.log("Date parsing error:", error);
              }
            }

            // Import all trades, including those with empty symbols - let user decide what to keep
            const shouldImport = row.Status !== 'Canceled' && row.Status !== 'Cancelled';
            
            if (shouldImport) {
              const tradeData: InsertTrade = {
                accountId: parseInt(accountId),
                symbol,
                side,
                quantity,
                entryPrice,
                exitPrice,
                pnl,
                date,
                status: 'closed',
                notes: 'Imported from completed trades CSV'
              };

              console.log(`Creating trade: ${symbol} ${side} ${quantity} @ ${entryPrice} -> ${exitPrice} P&L: ${pnl}`);
              await storage.createTrade(tradeData);
              recordsImported++;
            } else {
              console.log(`Skipping row ${i}: status=${row.Status} (canceled order)`);
            }

          } catch (error) {
            errors.push(`Row ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        return res.json({
          success: true,
          recordsProcessed,
          recordsImported,
          errors,
          message: `Successfully imported ${recordsImported} completed trades`
        });
      }

      // First pass: collect all filled orders
      const filledOrders: any[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        recordsProcessed++;
        
        try {
          const values = line.split(',').map((v: string) => v.trim());
          const row: any = {};
          
          headers.forEach((header: string, index: number) => {
            row[header] = values[index] || '';
          });

          // Only process filled orders
          if (row.Status?.trim() !== 'Filled') {
            continue;
          }

          // Parse order data from TakeProfit format
          const symbol = row.Product || row.Contract || '';
          const side = row['B/S']?.trim() === 'Buy' ? 'buy' : 'sell';
          const quantity = parseFloat(row['Filled Qty']) || parseFloat(row.filledQty) || 0;
          const price = parseFloat(row['Avg Fill Price']) || parseFloat(row.avgPrice) || 0;
          const fillTime = row['Fill Time'] || row.Timestamp || '';
          const orderType = row.Type || 'Market';
          
          // Parse price levels for different order types  
          const limitPrice = parseFloat(row['Limit Price']) || 0;
          const stopPrice = parseFloat(row['Stop Price']) || 0;
          
          // Enhanced date parsing to identify exact date, day, and time
          let date = new Date().toISOString().split('T')[0];
          let fillTimestamp = null;
          
          // Parse date from various formats
          if (row.Date) {
            const dateParts = row.Date.split('/');
            if (dateParts.length === 3) {
              const month = dateParts[0].padStart(2, '0');
              const day = dateParts[1].padStart(2, '0');
              const year = dateParts[2].length === 2 ? '20' + dateParts[2] : dateParts[2];
              date = `${year}-${month}-${day}`;
            }
          }
          
          // Parse exact fill time and create timestamp
          if (fillTime && date) {
            try {
              // Handle TakeProfit format: "06/12/2025 10:18:22" 
              if (fillTime.includes('/') && fillTime.includes(' ')) {
                // Format: "06/12/2025 10:18:22"
                const [datePart, timePart] = fillTime.split(' ');
                const [month, day, year] = datePart.split('/');
                const fullYear = year.length === 2 ? '20' + year : year;
                const isoDate = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                fillTimestamp = new Date(`${isoDate} ${timePart}`);
              } else {
                // Handle various time formats: "10:30:25" or "10:30:25 AM" or "2025-06-27 10:30:25"
                let timeString = fillTime;
                if (fillTime.includes(':')) {
                  // If time has date prefix, extract just the time part
                  if (fillTime.includes(' ') && fillTime.includes('-')) {
                    timeString = fillTime.split(' ').slice(1).join(' ');
                  }
                  // Create full timestamp by combining date and time
                  fillTimestamp = new Date(`${date} ${timeString}`);
                  if (isNaN(fillTimestamp.getTime())) {
                    fillTimestamp = new Date(`${date}T${timeString}`);
                  }
                }
              }
            } catch (error) {
              // If timestamp parsing fails, fallback to just the date
              fillTimestamp = new Date(date);
            }
          } else if (date) {
            fillTimestamp = new Date(date);
          }
          
          // Ensure we always have a valid Date object
          if (!fillTimestamp || isNaN(fillTimestamp.getTime())) {
            fillTimestamp = new Date(); // Current date as fallback
          }

          if (symbol && quantity && price) {
            filledOrders.push({
              symbol: symbol.replace(/[^A-Z]/g, ''),
              side,
              quantity,
              price, // Actual fill price
              limitPrice, // Price level for limit orders (TP)
              stopPrice, // Price level for stop orders (SL)
              date,
              fillTime,
              fillTimestamp,
              orderId: row.orderId || row['Order ID'] || '',
              orderType,
              text: row.Text || '',
              row: i
            });
          }

        } catch (error) {
          errors.push(`Row ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Second pass: use time-based sequential matching for complete trades
      const processedOrders = new Set();
      
      // Sort orders by fill time for chronological processing
      filledOrders.sort((a, b) => {
        const timeA = new Date(`${a.date} ${a.fillTime}`).getTime();
        const timeB = new Date(`${b.date} ${b.fillTime}`).getTime();
        return timeA - timeB;
      });
      
      // Track open positions by symbol and quantity
      const openPositions: any[] = [];
      
      for (let i = 0; i < filledOrders.length; i++) {
        if (processedOrders.has(i)) continue;
        
        const currentOrder = filledOrders[i];
        
        // Look for matching position to close (FIFO - First In, First Out)
        let matchedPositionIndex = -1;
        
        for (let j = 0; j < openPositions.length; j++) {
          const openPos = openPositions[j];
          
          if (openPos.symbol === currentOrder.symbol && 
              openPos.side !== currentOrder.side) {
            
            // Calculate quantity to close (take minimum of open position and current order)
            const quantityToClose = Math.min(openPos.remainingQuantity, currentOrder.quantity);
            
            if (quantityToClose > 0) {
              // Create a completed trade
              const buyOrder = openPos.side === 'buy' ? openPos : currentOrder;
              const sellOrder = openPos.side === 'sell' ? openPos : currentOrder;
              
              // Calculate actual P&L with correct point values per instrument
              let pointValue = 50; // Default for ES
              
              // Set correct point values based on instrument
              switch (currentOrder.symbol) {
                case 'MES': // Micro E-mini S&P 500
                  pointValue = 5; // $5 per point
                  break;
                case 'ES': // E-mini S&P 500
                  pointValue = 50; // $50 per point
                  break;
                case 'NQ': // E-mini NASDAQ 100
                  pointValue = 20; // $20 per point
                  break;
                case 'MNQ': // Micro E-mini NASDAQ 100
                  pointValue = 2; // $2 per point
                  break;
                case 'YM': // E-mini Dow Jones
                  pointValue = 5; // $5 per point
                  break;
                case 'MYM': // Micro E-mini Dow Jones
                  pointValue = 0.5; // $0.50 per point
                  break;
                case 'RTY': // E-mini Russell 2000
                  pointValue = 50; // $50 per point
                  break;
                case 'M2K': // Micro E-mini Russell 2000
                  pointValue = 5; // $5 per point
                  break;
                default:
                  // For unknown instruments, try to detect by symbol pattern
                  if (currentOrder.symbol.startsWith('M')) {
                    pointValue = 5; // Most micro contracts are $5
                  } else {
                    pointValue = 20; // Conservative default
                  }
              }
              
              const priceDifference = sellOrder.price - buyOrder.price;
              const pnl = priceDifference * quantityToClose * pointValue;
              
              // Check risk compliance
              const riskAmount = account.riskPerTrade || 100;
              const actualRisk = Math.abs(pnl);
              const riskCompliance = actualRisk <= riskAmount;

              // Advanced TakeProfit-specific SL/TP detection 
              let initialStopLoss = null;
              let initialTakeProfit = null;
              let finalStopLoss = null;
              let finalTakeProfit = null;
              
              // For TakeProfit CSVs, analyze the order sequence and price levels more intelligently
              const entryPrice = buyOrder.price;
              const exitPrice = sellOrder.price;
              const isLong = buyOrder.side === 'buy';
              
              // Find all orders for this symbol in a reasonable time window (30 minutes)
              const tradeWindow = filledOrders.filter(order => 
                order.symbol === currentOrder.symbol &&
                Math.abs(new Date(order.fillTimestamp || order.date).getTime() - 
                        new Date(currentOrder.fillTimestamp || currentOrder.date).getTime()) < 1800000 // 30 minutes
              ).sort((a, b) => 
                new Date(a.fillTimestamp || a.date).getTime() - new Date(b.fillTimestamp || b.date).getTime()
              );
              
              // Analyze order types and price levels in the window
              const stopOrders = tradeWindow.filter(order => order.orderType === 'Stop');
              const limitOrders = tradeWindow.filter(order => order.orderType === 'Limit');
              
              if (isLong) {
                // For long trades: SL should be below entry, TP above entry
                
                // Initial Stop Loss: Look for stops below entry price
                const potentialSLs = stopOrders
                  .filter(order => order.stopPrice && order.stopPrice < entryPrice)
                  .map(order => order.stopPrice || 0)
                  .filter(price => price > 0);
                
                // Initial Take Profit: Look for limits above entry price  
                const potentialTPs = limitOrders
                  .filter(order => order.limitPrice && order.limitPrice > entryPrice)
                  .map(order => order.limitPrice || 0)
                  .filter(price => price > 0);
                
                // Set initial levels (closest to entry price indicates initial plan)
                if (potentialSLs.length > 0) {
                  initialStopLoss = Math.max(...potentialSLs); // Highest SL below entry
                  finalStopLoss = Math.min(...potentialSLs); // Lowest SL (if moved down)
                }
                
                if (potentialTPs.length > 0) {
                  initialTakeProfit = Math.min(...potentialTPs); // Lowest TP above entry  
                  finalTakeProfit = Math.max(...potentialTPs); // Highest TP (if moved up)
                }
                
              } else {
                // For short trades: SL should be above entry, TP below entry
                
                // Initial Stop Loss: Look for stops above entry price
                const potentialSLs = stopOrders
                  .filter(order => order.stopPrice && order.stopPrice > entryPrice)
                  .map(order => order.stopPrice || 0)
                  .filter(price => price > 0);
                
                // Initial Take Profit: Look for limits below entry price
                const potentialTPs = limitOrders
                  .filter(order => order.limitPrice && order.limitPrice < entryPrice)
                  .map(order => order.limitPrice || 0)
                  .filter(price => price > 0);
                
                // Set initial levels 
                if (potentialSLs.length > 0) {
                  initialStopLoss = Math.min(...potentialSLs); // Lowest SL above entry
                  finalStopLoss = Math.max(...potentialSLs); // Highest SL (if moved up)
                }
                
                if (potentialTPs.length > 0) {
                  initialTakeProfit = Math.max(...potentialTPs); // Highest TP below entry
                  finalTakeProfit = Math.min(...potentialTPs); // Lowest TP (if moved down)
                }
              }
              
              // Fallback logic if no stop/limit orders detected
              if (!initialStopLoss || !initialTakeProfit) {
                // Use exit price analysis and standard risk management rules
                if (isLong) {
                  // Check if exit was likely a stop hit or profit take
                  if (exitPrice < entryPrice) {
                    // Loss trade - exit was likely the stop loss
                    initialStopLoss = exitPrice; 
                    finalStopLoss = exitPrice;
                    initialTakeProfit = entryPrice + (entryPrice - exitPrice) * 2; // 2:1 RR assumption
                    finalTakeProfit = initialTakeProfit; // Never reached
                  } else {
                    // Profit trade - exit was likely take profit or manual
                    initialTakeProfit = exitPrice;
                    finalTakeProfit = exitPrice;
                    initialStopLoss = entryPrice - (exitPrice - entryPrice) / 2; // Conservative SL
                    finalStopLoss = initialStopLoss; // Not hit
                  }
                } else {
                  // Short trade logic
                  if (exitPrice > entryPrice) {
                    // Loss trade - exit was likely the stop loss
                    initialStopLoss = exitPrice;
                    finalStopLoss = exitPrice;
                    initialTakeProfit = entryPrice - (exitPrice - entryPrice) * 2; // 2:1 RR
                    finalTakeProfit = initialTakeProfit; // Never reached
                  } else {
                    // Profit trade
                    initialTakeProfit = exitPrice;
                    finalTakeProfit = exitPrice;
                    initialStopLoss = entryPrice + (entryPrice - exitPrice) / 2; // Conservative SL
                    finalStopLoss = initialStopLoss; // Not hit
                  }
                }
              }

              const tradeData: InsertTrade = {
                accountId: parseInt(accountId),
                date: currentOrder.date,
                symbol: currentOrder.symbol,
                side: buyOrder.side === 'buy' ? 'long' : 'short',
                quantity: quantityToClose,
                entryPrice: buyOrder.price,
                exitPrice: sellOrder.price,
                pnl,
                status: 'closed',
                orderId: `${buyOrder.orderId}-${sellOrder.orderId}`,
                fillTime: currentOrder.fillTimestamp || new Date(currentOrder.date),
                orderType: 'Sequential Match',
                originalQuantity: quantityToClose,
                riskAmount,
                riskCompliance,
                initialStopLoss,
                initialTakeProfit,
                finalStopLoss,
                finalTakeProfit,
                notes: `Entry: ${buyOrder.price}, Exit: ${sellOrder.price} | Initial SL: ${initialStopLoss}, Initial TP: ${initialTakeProfit} | Final SL: ${finalStopLoss}, Final TP: ${finalTakeProfit}`
              };
              
              // Debug logging for SL/TP detection
              console.log(`Trade ${currentOrder.symbol}: Entry=${entryPrice}, Exit=${exitPrice}, Side=${buyOrder.side}`);
              console.log(`  Initial SL: ${initialStopLoss}, Initial TP: ${initialTakeProfit}`);
              console.log(`  Final SL: ${finalStopLoss}, Final TP: ${finalTakeProfit}`);
              console.log(`  Stop Orders Found: ${stopOrders.length}, Limit Orders Found: ${limitOrders.length}`);

              const validatedData = insertTradeSchema.parse(tradeData);
              await storage.createTrade(validatedData);
              recordsImported++;
              
              // Update remaining quantities
              openPos.remainingQuantity -= quantityToClose;
              currentOrder.quantity -= quantityToClose;
              
              // Remove fully closed positions
              if (openPos.remainingQuantity <= 0) {
                openPositions.splice(j, 1);
                j--; // Adjust index after removal
              }
              
              // If current order is fully processed, mark it
              if (currentOrder.quantity <= 0) {
                processedOrders.add(i);
                break;
              }
            }
          }
        }
        
        // If current order still has remaining quantity, add it as new open position
        if (!processedOrders.has(i) && currentOrder.quantity > 0) {
          openPositions.push({
            ...currentOrder,
            remainingQuantity: currentOrder.quantity,
            index: i
          });
          processedOrders.add(i);
        }
      }

      res.json({
        success: true,
        recordsProcessed,
        recordsImported,
        errors,
      });
    } catch (error) {
      console.error("Detailed CSV import error:", error);
      console.error("Error stack:", (error as Error).stack);
      console.error("Error name:", (error as Error).name);
      res.status(500).json({ message: "Failed to import CSV", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Position History CSV Processor Function
  async function processPositionHistoryCSV(lines: string[], headers: string[], accountId: number, account: any, res: any) {
    try {
      const trades = [];
      let recordsProcessed = 0;
      let recordsImported = 0;
      const errors: string[] = [];

      // Helper function to convert contract symbols
      const convertContractToSymbol = (contract: string): string => {
        if (!contract) return 'UNKNOWN';
        
        // Remove month/year codes and convert to standard symbols
        if (contract.startsWith('MES')) return 'MES'; // Micro E-mini S&P 500
        if (contract.startsWith('NQ')) return 'NQ';   // E-mini NASDAQ 100
        if (contract.startsWith('ES')) return 'ES';   // E-mini S&P 500
        if (contract.startsWith('YM')) return 'YM';   // E-mini Dow Jones
        if (contract.startsWith('RTY')) return 'RTY'; // E-mini Russell 2000
        
        // Extract base symbol for other contracts
        return contract.replace(/[0-9UHMZFGJKNQVXu]/g, '');
      };

      // Process each position history row
      for (let i = 1; i < lines.length; i++) {
        recordsProcessed++;
        try {
          const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
          const row: Record<string, string> = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          // Skip empty rows
          if (!row['Position ID'] || !row['Paired Qty']) continue;

          // Extract data from position history row
          const boughtTimestamp = new Date(row['Bought Timestamp']);
          const soldTimestamp = new Date(row['Sold Timestamp']);
          
          // Detect if this is a short trade (sold first, then bought)
          const isShort = soldTimestamp < boughtTimestamp;
          
          const trade = {
            accountId: accountId,
            symbol: convertContractToSymbol(row['Contract']),
            side: isShort ? 'short' : 'long',
            quantity: parseInt(row['Paired Qty']) || 1,
            
            // Handle entry/exit based on trade direction (convert to Date objects)
            fillTime: new Date(isShort ? row['Sold Timestamp'] : row['Bought Timestamp']),
            exitTime: new Date(isShort ? row['Bought Timestamp'] : row['Sold Timestamp']),
            entryPrice: parseFloat(isShort ? row['Sell Price'] : row['Buy Price']),
            exitPrice: parseFloat(isShort ? row['Buy Price'] : row['Sell Price']),
            
            pnl: parseFloat(row['P/L']) || 0,
            status: 'closed',
            date: row['Trade Date'] || new Date(isShort ? soldTimestamp : boughtTimestamp).toISOString().split('T')[0],
            
            // Add required schema fields
            initialStopLoss: null,
            finalStopLoss: null,
            initialTakeProfit: null,
            finalTakeProfit: null,
            tradeImage: null,
            tradingViewLink: null,
            notes: `Position History Import - ${isShort ? 'Short' : 'Long'} trade`
          };

          // Validate required fields
          if (!trade.symbol || !trade.entryPrice || !trade.exitPrice) {
            errors.push(`Row ${i}: Missing required data (symbol, prices)`);
            continue;
          }

          const insertTrade = await storage.createTrade(trade);
          if (insertTrade) {
            recordsImported++;
            trades.push(trade);
          }

        } catch (error) {
          errors.push(`Row ${i}: ${error instanceof Error ? error.message : 'Processing error'}`);
        }
      }

      console.log(`Position History CSV processed: ${recordsImported} trades imported from ${recordsProcessed} records`);
      
      res.json({
        success: true,
        recordsProcessed,
        recordsImported,
        errors,
        message: `Imported ${recordsImported} position history trades`
      });

    } catch (error) {
      console.error("Position History CSV processing error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to process position history CSV",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Journal routes
  app.get("/api/journal", async (req, res) => {
    try {
      const accountId = req.query.accountId ? parseInt(req.query.accountId as string) : undefined;
      const entries = await storage.getJournalEntries(accountId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.post("/api/journal", async (req, res) => {
    try {
      const validatedData = insertJournalEntrySchema.parse(req.body);
      const entry = await storage.createJournalEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid journal entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create journal entry" });
    }
  });

  app.put("/api/journal/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Remove id from request body for updates
      const { id: _, ...updateData } = req.body;
      const validatedData = insertJournalEntrySchema.parse(updateData);
      const entry = await storage.updateJournalEntry(id, validatedData);
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid journal entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update journal entry" });
    }
  });

  // Analytics routes
  // Optimized analytics endpoint with caching for scalability
  app.get("/api/analytics/dashboard/:accountId", requireAuth, async (req: any, res) => {
    try {
      const accountId = parseInt(req.params.accountId);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User authentication required" });
      }

      // Check cache first
      const cacheKey = CacheService.getDashboardKey(userId, accountId.toString());
      const cachedAnalytics = await CacheService.get(cacheKey);
      
      if (cachedAnalytics) {
        console.log(`Returning cached analytics for user ${userId}, account ${accountId}`);
        return res.json(cachedAnalytics);
      }

      // Queue analytics calculation as background job
      const job = await analyticsQueue.add('calculate-analytics', {
        userId,
        accountId
      }, {
        priority: 5,
        attempts: 3,
      });

      // For immediate response, calculate basic analytics synchronously
      const account = await storage.getAccount(accountId);
      const trades = await storage.getTrades(accountId);
      
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }

      // Quick calculation for immediate response
      const totalPnl = trades.reduce((sum, trade) => sum + trade.pnl, 0);
      const winningTrades = trades.filter(trade => trade.pnl > 0);
      const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;

      const quickAnalytics = {
        account,
        totalPnl,
        winRate,
        totalTrades: trades.length,
        winningTrades: winningTrades.length,
        losingTrades: trades.length - winningTrades.length,
        currentBalance: account.startingBalance + totalPnl,
        jobId: job.id,
        cached: false
      };

      res.json(quickAnalytics);
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // CSV Import endpoint
  app.post("/api/csv-import", async (req, res) => {
    try {
      const { accountId, csvData, fileName } = req.body;
      
      if (!accountId || !csvData || !fileName) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const account = await storage.getAccount(accountId);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }

      // Parse CSV data
      const lines = csvData.split('\n');
      const headers = lines[0].split(',').map((h: string) => h.trim());
      
      let recordsProcessed = 0;
      let recordsImported = 0;
      const errors: string[] = [];
      const importedTrades = [];

      // First pass: collect all filled orders
      const filledOrders: any[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        recordsProcessed++;
        
        try {
          const values = line.split(',').map((v: string) => v.trim());
          const row: any = {};
          
          headers.forEach((header: string, index: number) => {
            row[header] = values[index] || '';
          });

          // Only process filled orders
          if (row.Status?.trim() !== 'Filled') {
            continue;
          }

          // Parse order data - handle exact column names from your CSV
          const symbol = row.Product || row.Contract || '';
          const bsColumn = row['B/S'] || '';
          const side = bsColumn.trim() === ' Buy' || bsColumn.trim() === 'Buy' ? 'buy' : 'sell';
          const quantity = parseFloat(row.filledQty) || 0;
          const price = parseFloat(row.avgPrice) || 0;
          const fillTime = row['Fill Time'] || row.Timestamp || '';
          
          // Parse date from format like "10/17/23"
          let date = new Date().toISOString().split('T')[0];
          if (row.Date) {
            const dateParts = row.Date.split('/');
            if (dateParts.length === 3) {
              const month = dateParts[0].padStart(2, '0');
              const day = dateParts[1].padStart(2, '0');
              let year = dateParts[2];
              if (year.length === 2) {
                year = '20' + year;
              }
              date = `${year}-${month}-${day}`;
            }
          }

          if (symbol && quantity && price) {
            filledOrders.push({
              symbol: symbol.replace(/[^A-Z]/g, ''),
              side,
              quantity,
              price,
              date,
              fillTime,
              orderId: row.orderId || row['Order ID'] || '',
              orderType: row.Type || 'Market',
              row: i
            });
          }

        } catch (error) {
          errors.push(`Row ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Second pass: match orders to create trades
      const processedOrders = new Set();
      
      for (let i = 0; i < filledOrders.length; i++) {
        if (processedOrders.has(i)) continue;
        
        const order1 = filledOrders[i];
        
        // Look for matching opposing order (same symbol, different side, same quantity)
        for (let j = i + 1; j < filledOrders.length; j++) {
          if (processedOrders.has(j)) continue;
          
          const order2 = filledOrders[j];
          
          if (order1.symbol === order2.symbol && 
              order1.side !== order2.side && 
              order1.quantity === order2.quantity &&
              order1.date === order2.date) {
            
            // Found a matching pair - create a complete trade
            const buyOrder = order1.side === 'buy' ? order1 : order2;
            const sellOrder = order1.side === 'sell' ? order1 : order2;
            
            // Calculate actual P&L for ES futures ($50 per point)
            const pointValue = 50;
            const priceDifference = sellOrder.price - buyOrder.price;
            const pnl = priceDifference * order1.quantity * pointValue;
            
            // Check risk compliance
            const riskAmount = account.riskPerTrade || 100;
            const actualRisk = Math.abs(pnl);
            const riskCompliance = actualRisk <= riskAmount;

            const trade = {
              accountId,
              date: order1.date,
              symbol: order1.symbol,
              side: 'round_trip', // Complete round trip trade
              quantity: order1.quantity,
              entryPrice: buyOrder.price,
              exitPrice: sellOrder.price,
              pnl,
              status: 'closed',
              orderId: `${buyOrder.orderId}-${sellOrder.orderId}`,
              orderType: 'Matched Orders',
              originalQuantity: order1.quantity,
              riskAmount,
              riskCompliance,
              notes: `Imported from ${fileName} - Buy: ${buyOrder.price}, Sell: ${sellOrder.price}`
            };

            const createdTrade = await storage.createTrade(trade);
            importedTrades.push(createdTrade);
            recordsImported++;
            
            // Mark both orders as processed
            processedOrders.add(i);
            processedOrders.add(j);
            break;
          }
        }
      }

      // Handle any unmatched orders as individual trades with zero P&L
      for (let i = 0; i < filledOrders.length; i++) {
        if (processedOrders.has(i)) continue;
        
        const order = filledOrders[i];
        
        const trade = {
          accountId,
          date: order.date,
          symbol: order.symbol,
          side: order.side,
          quantity: order.quantity,
          entryPrice: order.price,
          exitPrice: order.price,
          pnl: 0, // Unmatched order - no P&L calculation possible
          status: 'open',
          orderId: order.orderId,
          orderType: order.orderType,
          originalQuantity: order.quantity,
          riskAmount: account.riskPerTrade || 100,
          riskCompliance: true,
          notes: `Imported from ${fileName} - Unmatched ${order.side} order`
        };

        const createdTrade = await storage.createTrade(trade);
        importedTrades.push(createdTrade);
        recordsImported++;
      }

      // Create import record
      await storage.createCsvImport({
        accountId,
        fileName,
        recordsProcessed,
        recordsImported,
        status: 'completed',
        errors: JSON.stringify(errors)
      });

      res.json({
        success: true,
        recordsProcessed,
        recordsImported,
        errors,
        importId: Date.now() // Simple ID for now
      });

    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "CSV import failed",
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }
  });

  // Spending routes
  app.get("/api/spending", requireAuth, async (req, res) => {
    try {
      const accountId = req.query.accountId ? parseInt(req.query.accountId as string) : undefined;
      const spending = await storage.getSpending(accountId);
      res.json(spending);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch spending records" });
    }
  });

  app.post("/api/spending", requireAuth, async (req, res) => {
    try {
      const validatedData = insertSpendingSchema.parse(req.body);
      const spending = await storage.createSpending(validatedData);
      res.status(201).json(spending);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid spending data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create spending record" });
    }
  });

  // Achievement routes
  app.get("/api/achievements", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      let achievements = await storage.getAchievements(userId);
      
      // Initialize default achievements if none exist
      if (achievements.length === 0) {
        const defaultAchievements = [
          {
            userId,
            achievementType: 'risk_discipline',
            title: 'Risk Guardian',
            description: 'Respect your predefined risk in 10 consecutive trades',
            badge: '🛡️',
            level: 1,
            progress: 0,
            target: 10,
            isUnlocked: false
          },
          {
            userId,
            achievementType: 'stop_loss_respect',
            title: 'Iron Discipline',
            description: 'Never move your stop loss due to fear in 20 trades',
            badge: '⚔️',
            level: 1,
            progress: 0,
            target: 20,
            isUnlocked: false
          },
          {
            userId,
            achievementType: 'profit_target',
            title: 'Target Master',
            description: 'Hit your profit target 5 times in a row',
            badge: '🎯',
            level: 1,
            progress: 0,
            target: 5,
            isUnlocked: false
          },
          {
            userId,
            achievementType: 'journal_streak',
            title: 'Consistent Learner',
            description: 'Complete your trading journal for 30 consecutive days',
            badge: '📚',
            level: 1,
            progress: 0,
            target: 30,
            isUnlocked: false
          }
        ];

        for (const achievement of defaultAchievements) {
          await storage.createAchievement(achievement);
        }
        
        achievements = await storage.getAchievements(userId);
      }
      
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.get("/api/user-stats", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      let userStats = await storage.getUserStats(userId);
      
      // Initialize user stats if none exist
      if (!userStats) {
        const defaultStats = {
          userId,
          riskDisciplineScore: 0,
          stopLossRespectStreak: 0,
          profitTargetHitStreak: 0,
          journalStreakDays: 0,
          totalPoints: 0,
          level: 1
        };
        
        userStats = await storage.createUserStats(defaultStats);
      }
      
      res.json(userStats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Note: Mock data generation removed - all data should come from CSV imports

  // Saved Projections API
  app.post("/api/projections/save", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const projectionData = {
        ...req.body,
        userId
      };
      
      const savedProjection = await storage.createSavedProjection(projectionData);
      res.json(savedProjection);
    } catch (error) {
      console.error("Error saving projection:", error);
      res.status(500).json({ message: "Failed to save projection" });
    }
  });

  // Update existing projection
  app.put("/api/projections/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const projectionId = parseInt(req.params.id);
      const projectionData = {
        ...req.body,
        userId
      };
      
      const updatedProjection = await storage.updateSavedProjection(projectionId, projectionData);
      res.json(updatedProjection);
    } catch (error) {
      console.error("Error updating projection:", error);
      res.status(500).json({ message: "Failed to update projection" });
    }
  });

  app.get("/api/projections/account/:accountId", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const accountId = parseInt(req.params.accountId);
      
      const projections = await storage.getSavedProjections(userId, accountId);
      res.json(projections);
    } catch (error) {
      console.error("Error fetching projections:", error);
      res.status(500).json({ message: "Failed to fetch projections" });
    }
  });

  app.put("/api/projections/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const projectionId = parseInt(req.params.id);
      
      const updatedProjection = await storage.updateSavedProjection(projectionId, req.body);
      if (!updatedProjection) {
        return res.status(404).json({ message: "Projection not found" });
      }
      
      res.json(updatedProjection);
    } catch (error) {
      console.error("Error updating projection:", error);
      res.status(500).json({ message: "Failed to update projection" });
    }
  });

  // Trading Companion routes
  app.post("/api/trading-companion/chat", requireAuth, async (req, res) => {
    try {
      const { message, context } = req.body;
      
      if (!process.env.DEEPSEEK_API_KEY) {
        return res.status(503).json({ 
          message: "AI companion is temporarily unavailable. Please check API configuration.",
          error: "No API key configured"
        });
      }

      // Prepare context for AI analysis
      const userContext = {
        totalTrades: context.totalTrades || 0,
        recentPerformance: context.recentPerformance || 0,
        winRate: context.winRate || 0,
        accounts: context.accounts || [],
        recentTrades: context.trades || []
      };

      // Create system prompt for Marthy personality
      const systemPrompt = `You are Marthy, an expert trading companion with a friendly, supportive personality. You help prop traders improve their performance through data-driven insights and encouraging guidance.

Your personality traits:
- Friendly and approachable, like a knowledgeable trading buddy
- Use casual language but maintain professionalism  
- Encourage good habits and gently correct risky behavior
- Celebrate wins and help learn from losses
- Focus on practical, actionable advice
- Use emojis occasionally but not excessively

Current trader context:
- Total trades: ${userContext.totalTrades}
- Recent P&L: $${userContext.recentPerformance}
- Win rate: ${userContext.winRate.toFixed(1)}%
- Active accounts: ${userContext.accounts.length}

Recent trades summary: ${userContext.recentTrades.map((trade: any) => 
  `${trade.symbol}: ${trade.pnl > 0 ? '+' : ''}$${trade.pnl} (${trade.type})`
).join(', ') || 'No recent trades'}

Provide helpful, personalized advice based on this data. Keep responses concise (2-3 paragraphs max) and actionable.`;

      // Call DeepSeek API
      console.log("Calling DeepSeek API with message:", message);
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`DeepSeek API error: ${response.status} - ${errorText}`);
        throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
      }

      const aiResponse = await response.json();
      console.log("DeepSeek API response:", aiResponse);
      const aiMessage = aiResponse.choices[0]?.message?.content || "I'm having trouble thinking right now, but I'm here to help with your trading!";

      res.json({
        message: aiMessage,
        context: userContext,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("Trading Companion error:", error);
      
      // Fallback responses based on common queries
      const fallbackResponses = {
        'analyze recent performance': "I can see you're looking for performance insights! Based on your recent activity, focus on maintaining your risk management discipline. Remember, consistency beats big wins every time! 📊",
        'assess my current risk': "Risk management is crucial! Make sure you're never risking more than 1-2% per trade, and always set your stop losses before entering. Your account preservation is the top priority! 🛡️",
        'give me trading tips': "Here are my top tips: 1) Plan your trades and trade your plan 2) Cut losses quickly, let winners run 3) Keep a trading journal 4) Focus on process over profits. You've got this! 💪",
        'help me set trading goals': "Great question! Set SMART goals: daily risk limits, weekly profit targets, and monthly consistency goals. Start small and build momentum. What specific goal would you like to work on? 🎯"
      };
      
      const userMessage = req.body.message?.toLowerCase() || '';
      let fallbackMessage = "I'm having some connection issues, but I'm still here to help! ";
      
      for (const [key, response] of Object.entries(fallbackResponses)) {
        if (userMessage.includes(key)) {
          fallbackMessage = response;
          break;
        }
      }
      
      res.json({
        message: fallbackMessage,
        context: req.body.context,
        timestamp: new Date().toISOString(),
        fallback: true
      });
    }
  });

  // Trading Strategy routes
  // Trading strategies routes - primary endpoints
  app.get("/api/trading-strategies", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const strategies = await storage.getTradingStrategies(userId);
      res.json(strategies);
    } catch (error) {
      console.error("Error fetching trading strategies:", error);
      res.status(500).json({ message: "Failed to fetch trading strategies" });
    }
  });

  app.post("/api/trading-strategies", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const strategyData = { ...req.body, userId };
      console.log('Creating trading strategy:', strategyData);
      
      const strategy = await storage.createTradingStrategy(strategyData);
      console.log('Trading strategy created successfully:', strategy);
      res.status(201).json(strategy);
    } catch (error) {
      console.error("Error creating trading strategy:", error);
      res.status(500).json({ message: "Failed to create trading strategy" });
    }
  });

  app.put("/api/trading-strategies/:id", requireAuth, async (req, res) => {
    try {
      const strategyId = parseInt(req.params.id);
      const strategy = await storage.updateTradingStrategy(strategyId, req.body);
      if (!strategy) {
        return res.status(404).json({ message: "Strategy not found" });
      }
      res.json(strategy);
    } catch (error) {
      console.error("Error updating strategy:", error);
      res.status(500).json({ message: "Failed to update strategy" });
    }
  });

  app.delete("/api/trading-strategies/:id", requireAuth, async (req, res) => {
    try {
      const strategyId = parseInt(req.params.id);
      const success = await storage.deleteTradingStrategy(strategyId);
      if (!success) {
        return res.status(404).json({ message: "Strategy not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting strategy:", error);
      if (error instanceof Error && error.message.includes("being used in daily plans")) {
        return res.status(400).json({ 
          message: error.message,
          canDelete: false 
        });
      }
      res.status(500).json({ message: "Failed to delete strategy" });
    }
  });

  // Legacy endpoints for backwards compatibility
  app.get("/api/strategies", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const strategies = await storage.getTradingStrategies(userId);
      res.json(strategies);
    } catch (error) {
      console.error("Error fetching strategies:", error);
      res.status(500).json({ message: "Failed to fetch strategies" });
    }
  });

  app.post("/api/strategies", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertTradingStrategySchema.parse({ ...req.body, userId });
      const strategy = await storage.createTradingStrategy(validatedData);
      res.status(201).json(strategy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid strategy data", errors: error.errors });
      }
      console.error("Error creating strategy:", error);
      res.status(500).json({ message: "Failed to create strategy" });
    }
  });

  app.put("/api/strategies/:id", requireAuth, async (req, res) => {
    try {
      const strategyId = parseInt(req.params.id);
      const strategy = await storage.updateTradingStrategy(strategyId, req.body);
      if (!strategy) {
        return res.status(404).json({ message: "Strategy not found" });
      }
      res.json(strategy);
    } catch (error) {
      console.error("Error updating strategy:", error);
      res.status(500).json({ message: "Failed to update strategy" });
    }
  });

  app.delete("/api/strategies/:id", requireAuth, async (req, res) => {
    try {
      const strategyId = parseInt(req.params.id);
      const success = await storage.deleteTradingStrategy(strategyId);
      if (!success) {
        return res.status(404).json({ message: "Strategy not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting strategy:", error);
      if (error instanceof Error && error.message.includes("being used in daily plans")) {
        return res.status(400).json({ 
          message: error.message,
          canDelete: false 
        });
      }
      res.status(500).json({ message: "Failed to delete strategy" });
    }
  });

  // Daily Plan routes
  app.get("/api/daily-plans", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const accountId = req.query.accountId ? parseInt(req.query.accountId as string) : undefined;
      const plans = await storage.getDailyPlans(userId, accountId);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching daily plans:", error);
      res.status(500).json({ message: "Failed to fetch daily plans" });
    }
  });

  app.get("/api/daily-plans/by-date", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const date = req.query.date as string;
      if (!date) {
        return res.status(400).json({ message: "Date parameter is required" });
      }
      const plan = await storage.getDailyPlanByDate(userId, date);
      res.json(plan);
    } catch (error) {
      console.error("Error fetching daily plan by date:", error);
      res.status(500).json({ message: "Failed to fetch daily plan" });
    }
  });

  app.post("/api/daily-plans", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertDailyPlanSchema.parse({ ...req.body, userId });
      const plan = await storage.createDailyPlan(validatedData);
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid daily plan data", errors: error.errors });
      }
      console.error("Error creating daily plan:", error);
      res.status(500).json({ message: "Failed to create daily plan" });
    }
  });

  app.put("/api/daily-plans/:id", requireAuth, async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const existingPlan = await storage.getDailyPlan(planId);
      
      if (!existingPlan) {
        return res.status(404).json({ message: "Daily plan not found" });
      }
      
      // If plan is saved (isPlanSaved = true), only allow additionalNotes to be updated
      if (existingPlan.isPlanSaved) {
        const { additionalNotes } = req.body;
        if (Object.keys(req.body).length > 1 || !req.body.hasOwnProperty('additionalNotes')) {
          return res.status(400).json({ 
            message: "Plan is locked. Only additional notes can be edited after the plan is saved." 
          });
        }
        const plan = await storage.updateDailyPlan(planId, { additionalNotes });
        return res.json(plan);
      }
      
      // Plan is not saved yet, allow all updates
      const plan = await storage.updateDailyPlan(planId, req.body);
      res.json(plan);
    } catch (error) {
      console.error("Error updating daily plan:", error);
      res.status(500).json({ message: "Failed to update daily plan" });
    }
  });

  app.delete("/api/daily-plans/:id", requireAuth, async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const success = await storage.deleteDailyPlan(planId);
      if (!success) {
        return res.status(404).json({ message: "Daily plan not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting daily plan:", error);
      res.status(500).json({ message: "Failed to delete daily plan" });
    }
  });

  // Strategy Rule Tracking routes
  app.get("/api/daily-plans/:id/rule-tracking", requireAuth, async (req, res) => {
    try {
      const dailyPlanId = parseInt(req.params.id);
      const tracking = await storage.getStrategyRuleTracking(dailyPlanId);
      res.json(tracking);
    } catch (error) {
      console.error("Error fetching rule tracking:", error);
      res.status(500).json({ message: "Failed to fetch rule tracking" });
    }
  });

  app.post("/api/daily-plans/:id/rule-tracking", requireAuth, async (req, res) => {
    try {
      const dailyPlanId = parseInt(req.params.id);
      const validatedData = insertStrategyRuleTrackingSchema.parse({ 
        ...req.body, 
        dailyPlanId 
      });
      const tracking = await storage.createStrategyRuleTracking(validatedData);
      res.status(201).json(tracking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid rule tracking data", errors: error.errors });
      }
      console.error("Error creating rule tracking:", error);
      res.status(500).json({ message: "Failed to create rule tracking" });
    }
  });

  app.put("/api/rule-tracking/:id", requireAuth, async (req, res) => {
    try {
      const trackingId = parseInt(req.params.id);
      const tracking = await storage.updateStrategyRuleTracking(trackingId, req.body);
      if (!tracking) {
        return res.status(404).json({ message: "Rule tracking not found" });
      }
      res.json(tracking);
    } catch (error) {
      console.error("Error updating rule tracking:", error);
      res.status(500).json({ message: "Failed to update rule tracking" });
    }
  });

  // Budget Categories routes
  app.get("/api/budget-categories", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const categories = await storage.getBudgetCategories(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching budget categories:", error);
      res.status(500).json({ message: "Failed to fetch budget categories" });
    }
  });

  app.post("/api/budget-categories", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertBudgetCategorySchema.parse({ ...req.body, userId });
      const category = await storage.createBudgetCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      console.error("Error creating budget category:", error);
      res.status(500).json({ message: "Failed to create budget category" });
    }
  });

  app.patch("/api/budget-categories/:id", requireAuth, async (req: any, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await storage.updateBudgetCategory(categoryId, req.body);
      if (!category) {
        return res.status(404).json({ message: "Budget category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error updating budget category:", error);
      res.status(500).json({ message: "Failed to update budget category" });
    }
  });

  app.delete("/api/budget-categories/:id", requireAuth, async (req: any, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const success = await storage.deleteBudgetCategory(categoryId);
      if (!success) {
        return res.status(404).json({ message: "Budget category not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting budget category:", error);
      res.status(500).json({ message: "Failed to delete budget category" });
    }
  });

  // Budget Plans routes
  app.get("/api/budget-plan", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const activePlan = await storage.getActiveBudgetPlan(userId);
      res.json(activePlan);
    } catch (error) {
      console.error("Error fetching active budget plan:", error);
      res.status(500).json({ message: "Failed to fetch active budget plan" });
    }
  });

  app.post("/api/budget-plan", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertBudgetPlanSchema.parse({ ...req.body, userId });
      const plan = await storage.createBudgetPlan(validatedData);
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid budget plan data", errors: error.errors });
      }
      console.error("Error creating budget plan:", error);
      res.status(500).json({ message: "Failed to create budget plan" });
    }
  });

  app.patch("/api/budget-plan/:id", requireAuth, async (req: any, res) => {
    try {
      const planId = parseInt(req.params.id);
      const plan = await storage.updateBudgetPlan(planId, req.body);
      if (!plan) {
        return res.status(404).json({ message: "Budget plan not found" });
      }
      res.json(plan);
    } catch (error) {
      console.error("Error updating budget plan:", error);
      res.status(500).json({ message: "Failed to update budget plan" });
    }
  });

  // Notifications routes
  app.get("/api/notifications", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertNotificationSchema.parse({ ...req.body, userId });
      const notification = await storage.createNotification(validatedData);
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid notification data", errors: error.errors });
      }
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req: any, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const userId = req.user.id;
      const notification = await storage.markNotificationAsRead(notificationId, userId);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch("/api/notifications/mark-all-read", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // User notification settings routes
  app.get("/api/notification-settings", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      let settings = await storage.getNotificationSettings(userId);
      
      // Create default settings if none exist
      if (!settings) {
        const defaultSettings = {
          userId,
          emailNotifications: true,
          accountMilestones: true,
          payoutAlerts: true,
          riskWarnings: true,
          systemUpdates: true,
          achievementNotifications: true,
          emailFrequency: 'immediate' as const
        };
        settings = await storage.createNotificationSettings(defaultSettings);
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      res.status(500).json({ message: "Failed to fetch notification settings" });
    }
  });

  app.patch("/api/notification-settings", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const settings = await storage.updateNotificationSettings(userId, req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating notification settings:", error);
      res.status(500).json({ message: "Failed to update notification settings" });
    }
  });

  // Watchlists API routes
  app.get("/api/watchlists", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const watchlists = await storage.getWatchlists(userId);
      res.json(watchlists);
    } catch (error) {
      console.error("Error fetching watchlists:", error);
      res.status(500).json({ message: "Failed to fetch watchlists" });
    }
  });

  app.post("/api/watchlists", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertWatchlistSchema.parse({ ...req.body, userId });
      const watchlist = await storage.createWatchlist(validatedData);
      res.status(201).json(watchlist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid watchlist data", errors: error.errors });
      }
      console.error("Error creating watchlist:", error);
      res.status(500).json({ message: "Failed to create watchlist" });
    }
  });

  app.patch("/api/watchlists/:id", requireAuth, async (req: any, res) => {
    try {
      const watchlistId = parseInt(req.params.id);
      const userId = req.user.id;
      const watchlist = await storage.updateWatchlist(watchlistId, userId, req.body);
      if (!watchlist) {
        return res.status(404).json({ message: "Watchlist not found" });
      }
      res.json(watchlist);
    } catch (error) {
      console.error("Error updating watchlist:", error);
      res.status(500).json({ message: "Failed to update watchlist" });
    }
  });

  app.delete("/api/watchlists/:id", requireAuth, async (req: any, res) => {
    try {
      const watchlistId = parseInt(req.params.id);
      const userId = req.user.id;
      const success = await storage.deleteWatchlist(watchlistId, userId);
      if (!success) {
        return res.status(404).json({ message: "Watchlist not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting watchlist:", error);
      res.status(500).json({ message: "Failed to delete watchlist" });
    }
  });

  // Watchlist symbols API routes  
  app.get("/api/watchlists/:id/symbols", requireAuth, async (req: any, res) => {
    try {
      const watchlistId = parseInt(req.params.id);
      const symbols = await storage.getWatchlistSymbols(watchlistId);
      res.json(symbols);
    } catch (error) {
      console.error("Error fetching watchlist symbols:", error);
      res.status(500).json({ message: "Failed to fetch watchlist symbols" });
    }
  });

  app.post("/api/watchlists/:id/symbols", requireAuth, async (req: any, res) => {
    try {
      const watchlistId = parseInt(req.params.id);
      const validatedData = insertWatchlistSymbolSchema.parse({ ...req.body, watchlistId });
      const symbol = await storage.addWatchlistSymbol(validatedData);
      res.status(201).json(symbol);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid symbol data", errors: error.errors });
      }
      console.error("Error adding symbol to watchlist:", error);
      res.status(500).json({ message: "Failed to add symbol to watchlist" });
    }
  });

  app.delete("/api/watchlists/:watchlistId/symbols/:symbolId", requireAuth, async (req: any, res) => {
    try {
      const symbolId = parseInt(req.params.symbolId);
      const success = await storage.removeWatchlistSymbol(symbolId);
      if (!success) {
        return res.status(404).json({ message: "Symbol not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing symbol from watchlist:", error);
      res.status(500).json({ message: "Failed to remove symbol from watchlist" });
    }
  });

  // Risk Rules API routes
  app.get("/api/risk-rules", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const accountId = req.query.accountId ? parseInt(req.query.accountId as string) : undefined;
      const riskRules = await storage.getRiskRules(userId, accountId);
      res.json(riskRules);
    } catch (error) {
      console.error("Error fetching risk rules:", error);
      res.status(500).json({ message: "Failed to fetch risk rules" });
    }
  });

  app.post("/api/risk-rules", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertRiskRuleSchema.parse({ ...req.body, userId });
      const riskRule = await storage.createRiskRule(validatedData);
      res.status(201).json(riskRule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid risk rule data", errors: error.errors });
      }
      console.error("Error creating risk rule:", error);
      res.status(500).json({ message: "Failed to create risk rule" });
    }
  });

  app.patch("/api/risk-rules/:id", requireAuth, async (req: any, res) => {
    try {
      const ruleId = parseInt(req.params.id);
      const userId = req.user.id;
      const riskRule = await storage.updateRiskRule(ruleId, userId, req.body);
      if (!riskRule) {
        return res.status(404).json({ message: "Risk rule not found" });
      }
      res.json(riskRule);
    } catch (error) {
      console.error("Error updating risk rule:", error);
      res.status(500).json({ message: "Failed to update risk rule" });
    }
  });

  app.delete("/api/risk-rules/:id", requireAuth, async (req: any, res) => {
    try {
      const ruleId = parseInt(req.params.id);
      const userId = req.user.id;
      const success = await storage.deleteRiskRule(ruleId, userId);
      if (!success) {
        return res.status(404).json({ message: "Risk rule not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting risk rule:", error);
      res.status(500).json({ message: "Failed to delete risk rule" });
    }
  });

  // Risk Alerts API routes
  app.get("/api/risk-alerts", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const accountId = req.query.accountId ? parseInt(req.query.accountId as string) : undefined;
      const riskAlerts = await storage.getRiskAlerts(userId, accountId);
      res.json(riskAlerts);
    } catch (error) {
      console.error("Error fetching risk alerts:", error);
      res.status(500).json({ message: "Failed to fetch risk alerts" });
    }
  });

  app.patch("/api/risk-alerts/:id/resolve", requireAuth, async (req: any, res) => {
    try {
      const alertId = parseInt(req.params.id);
      const userId = req.user.id;
      const alert = await storage.resolveRiskAlert(alertId, userId, req.body.notes);
      if (!alert) {
        return res.status(404).json({ message: "Risk alert not found" });
      }
      res.json(alert);
    } catch (error) {
      console.error("Error resolving risk alert:", error);
      res.status(500).json({ message: "Failed to resolve risk alert" });
    }
  });

  // Sample notifications endpoint for demonstration
  app.post("/api/notifications/sample", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      const sampleNotifications = [
        {
          userId,
          type: 'account_milestone',
          title: '🎯 Daily Profit Target Reached!',
          message: 'Congratulations! You hit your daily profit target of $500 on Account #11.',
          data: JSON.stringify({ accountId: 11, profitAmount: 500, targetAmount: 500 }),
          priority: 'high',
          actionUrl: '/projections',
        },
        {
          userId,
          type: 'payout_ready',
          title: '💰 Payout Ready for Processing',
          message: 'Your payout of $2,500 is ready! You can request it from your account dashboard.',
          data: JSON.stringify({ amount: 2500, accountId: 11 }),
          priority: 'high',
          actionUrl: '/projections',
        },
        {
          userId,
          type: 'risk_warning',
          title: '⚠️ Daily Loss Limit Warning',
          message: 'You\'ve used 75% of your daily loss limit. Consider reducing position size.',
          data: JSON.stringify({ riskUsed: 75, dailyLoss: 375, dailyLimit: 500 }),
          priority: 'urgent',
          actionUrl: '/dashboard',
        },
        {
          userId,
          type: 'achievement',
          title: '🏆 Achievement Unlocked: Risk Guardian',
          message: 'You\'ve successfully respected your risk limits for 10 consecutive trades!',
          data: JSON.stringify({ achievementId: 'risk_guardian', streak: 10 }),
          priority: 'normal',
          actionUrl: '/achievements',
        },
        {
          userId,
          type: 'system_update',
          title: '🚀 New Feature: Enhanced Analytics',
          message: 'Check out our new discipline analysis tools in the Analytics section.',
          data: JSON.stringify({ feature: 'discipline_analysis' }),
          priority: 'normal',
          actionUrl: '/analytics',
        }
      ];

      // Create all sample notifications
      const createdNotifications = [];
      for (const notification of sampleNotifications) {
        const created = await storage.createNotification(notification);
        createdNotifications.push(created);
      }

      res.json({ 
        success: true, 
        count: createdNotifications.length,
        notifications: createdNotifications 
      });
    } catch (error) {
      console.error("Error creating sample notifications:", error);
      res.status(500).json({ message: "Failed to create sample notifications" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
