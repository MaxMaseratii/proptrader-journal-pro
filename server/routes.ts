import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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
  type InsertTrade 
} from "@shared/schema";
import { z } from "zod";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/users/update-wage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
  // Account routes
  app.get("/api/accounts", isAuthenticated, async (req, res) => {
    try {
      const accounts = await storage.getAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  // Check challenge eligibility for conversion to funded account
  app.get("/api/accounts/:id/challenge-eligibility", isAuthenticated, async (req, res) => {
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
  app.post("/api/accounts/:id/convert-to-funded", isAuthenticated, async (req, res) => {
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
  app.post("/api/accounts/:id/convert-to-live", isAuthenticated, async (req, res) => {
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

  app.get("/api/accounts/:id", isAuthenticated, async (req, res) => {
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

  app.post("/api/accounts", isAuthenticated, async (req, res) => {
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

  app.patch("/api/accounts/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAccountSchema.partial().parse(req.body);
      const account = await storage.updateAccount(id, validatedData);
      res.json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid account data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update account" });
    }
  });

  app.put("/api/accounts/:id", isAuthenticated, async (req, res) => {
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
        currentBalance: account.startingBalance,
        status: 'active',
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
        status: 'withdrawn'
      });

      if (!updatedAccount) {
        return res.status(404).json({ message: "Account not found" });
      }

      res.json(updatedAccount);
    } catch (error) {
      res.status(500).json({ message: "Failed to withdraw account" });
    }
  });

  app.delete("/api/accounts/:id", isAuthenticated, async (req, res) => {
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
  app.get("/api/trades", isAuthenticated, async (req, res) => {
    try {
      const accountId = req.query.accountId ? parseInt(req.query.accountId as string) : undefined;
      const trades = await storage.getTrades(accountId);
      res.json(trades);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trades" });
    }
  });

  app.post("/api/trades", isAuthenticated, async (req, res) => {
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

  app.put("/api/trades/:id", isAuthenticated, async (req, res) => {
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
  app.post("/api/trades/reprocess-sltp", isAuthenticated, async (req, res) => {
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

  app.post("/api/trades/import-csv", isAuthenticated, async (req, res) => {
    try {
      console.log("CSV Import request received:", { 
        accountId: req.body.accountId, 
        csvDataLength: req.body.csvData?.length,
        bodyKeys: Object.keys(req.body),
        bodyType: typeof req.body,
        firstLine: req.body.csvData?.split('\n')[0]
      });
      
      const { accountId, csvData, csvContent, trades, fileName } = req.body;
      const csvText = csvData || csvContent;
      
      // If trades are already processed, use them directly
      if (trades && Array.isArray(trades) && accountId) {
        console.log(`Processing ${trades.length} pre-processed trades for account ${accountId}`);
        
        let recordsImported = 0;
        const errors: string[] = [];
        
        for (const trade of trades) {
          try {
            const tradeData = {
              accountId: parseInt(accountId),
              symbol: trade.symbol || 'UNKNOWN',
              side: trade.side || 'long',
              quantity: trade.quantity || 1,
              entryPrice: trade.entryPrice || 0,
              exitPrice: trade.exitPrice || trade.entryPrice || 0,
              pnl: trade.pnl || 0,
              date: trade.date || new Date().toISOString().split('T')[0],
              status: trade.status || 'closed',
              initialStopLoss: trade.initialStopLoss || null,
              finalStopLoss: trade.finalStopLoss || null,
              initialTakeProfit: trade.initialTakeProfit || null,
              finalTakeProfit: trade.finalTakeProfit || null,
              notes: trade.notes || 'Imported via Universal CSV'
            };
            
            await storage.createTrade(tradeData);
            recordsImported++;
          } catch (error) {
            errors.push(`Failed to import trade: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
        
        return res.json({
          success: true,
          recordsImported,
          errors,
          message: `Successfully imported ${recordsImported} trades`
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
      
      let recordsProcessed = 0;
      let recordsImported = 0;
      const errors: string[] = [];

      // Check if this is a completed trades CSV format (has EnteredAt, ExitedAt, etc.)
      const isCompletedTradesFormat = headers.some(h => 
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
            const row: any = {};
            
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
              
              // Calculate actual P&L for ES futures ($50 per point)
              const pointValue = 50;
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
      console.error("Error stack:", error.stack);
      console.error("Error name:", error.name);
      res.status(500).json({ message: "Failed to import CSV", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

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
      const validatedData = insertJournalEntrySchema.partial().parse(req.body);
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
  app.get("/api/analytics/dashboard/:accountId", async (req, res) => {
    try {
      const accountId = parseInt(req.params.accountId);
      const account = await storage.getAccount(accountId);
      const trades = await storage.getTrades(accountId);
      
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }

      // Calculate analytics
      const totalPnl = trades.reduce((sum, trade) => sum + trade.pnl, 0);
      const winningTrades = trades.filter(trade => trade.pnl > 0);
      const losingTrades = trades.filter(trade => trade.pnl < 0);
      const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
      
      let bestTrade = null;
      let worstTrade = null;
      
      if (trades.length > 0) {
        bestTrade = trades[0];
        worstTrade = trades[0];
        
        for (const trade of trades) {
          if (trade.pnl > bestTrade.pnl) bestTrade = trade;
          if (trade.pnl < worstTrade.pnl) worstTrade = trade;
        }
      }

      const analytics = {
        account,
        totalPnl,
        winRate,
        totalTrades: trades.length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        bestTrade: bestTrade?.pnl || 0,
        worstTrade: worstTrade?.pnl || 0,
        currentBalance: account.currentBalance,
        drawdown: ((account.startingBalance - account.currentBalance) / account.startingBalance) * 100,
        profitTarget: account.profitTarget,
        dailyLossLimit: account.dailyLossLimit,
        riskLimitUsed: Math.abs(worstTrade?.pnl || 0) / account.dailyLossLimit * 100
      };

      res.json(analytics);
    } catch (error) {
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
  app.get("/api/spending", isAuthenticated, async (req, res) => {
    try {
      const accountId = req.query.accountId ? parseInt(req.query.accountId as string) : undefined;
      const spending = await storage.getSpending(accountId);
      res.json(spending);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch spending records" });
    }
  });

  app.post("/api/spending", isAuthenticated, async (req, res) => {
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
  app.get("/api/achievements", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.get("/api/user-stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
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

  // Projection saving routes
  app.post("/api/projections/save", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.get("/api/projections/account/:accountId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const accountId = parseInt(req.params.accountId);
      
      const projections = await storage.getSavedProjections(userId, accountId);
      res.json(projections);
    } catch (error) {
      console.error("Error fetching projections:", error);
      res.status(500).json({ message: "Failed to fetch projections" });
    }
  });

  app.put("/api/projections/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectionId = parseInt(req.params.id);
      
      const updatedProjection = await storage.updateSavedProjection(projectionId, req.body, userId);
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
  app.post("/api/trading-companion/chat", isAuthenticated, async (req, res) => {
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

Recent trades summary: ${userContext.recentTrades.map(trade => 
  `${trade.symbol}: ${trade.pnl > 0 ? '+' : ''}$${trade.pnl} (${trade.type})`
).join(', ') || 'No recent trades'}

Provide helpful, personalized advice based on this data. Keep responses concise (2-3 paragraphs max) and actionable.`;

      // Call DeepSeek API
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-reasoner',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const aiResponse = await response.json();
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
  app.get("/api/strategies", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const strategies = await storage.getTradingStrategies(userId);
      res.json(strategies);
    } catch (error) {
      console.error("Error fetching strategies:", error);
      res.status(500).json({ message: "Failed to fetch strategies" });
    }
  });

  app.post("/api/strategies", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.put("/api/strategies/:id", isAuthenticated, async (req, res) => {
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

  app.delete("/api/strategies/:id", isAuthenticated, async (req, res) => {
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
  app.get("/api/daily-plans", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const accountId = req.query.accountId ? parseInt(req.query.accountId as string) : undefined;
      const plans = await storage.getDailyPlans(userId, accountId);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching daily plans:", error);
      res.status(500).json({ message: "Failed to fetch daily plans" });
    }
  });

  app.get("/api/daily-plans/by-date", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.post("/api/daily-plans", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.put("/api/daily-plans/:id", isAuthenticated, async (req, res) => {
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

  app.delete("/api/daily-plans/:id", isAuthenticated, async (req, res) => {
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
  app.get("/api/daily-plans/:id/rule-tracking", isAuthenticated, async (req, res) => {
    try {
      const dailyPlanId = parseInt(req.params.id);
      const tracking = await storage.getStrategyRuleTracking(dailyPlanId);
      res.json(tracking);
    } catch (error) {
      console.error("Error fetching rule tracking:", error);
      res.status(500).json({ message: "Failed to fetch rule tracking" });
    }
  });

  app.post("/api/daily-plans/:id/rule-tracking", isAuthenticated, async (req, res) => {
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

  app.put("/api/rule-tracking/:id", isAuthenticated, async (req, res) => {
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
  app.get("/api/budget-categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const categories = await storage.getBudgetCategories(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching budget categories:", error);
      res.status(500).json({ message: "Failed to fetch budget categories" });
    }
  });

  app.post("/api/budget-categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.patch("/api/budget-categories/:id", isAuthenticated, async (req: any, res) => {
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

  app.delete("/api/budget-categories/:id", isAuthenticated, async (req: any, res) => {
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
  app.get("/api/budget-plan", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activePlan = await storage.getActiveBudgetPlan(userId);
      res.json(activePlan);
    } catch (error) {
      console.error("Error fetching active budget plan:", error);
      res.status(500).json({ message: "Failed to fetch active budget plan" });
    }
  });

  app.post("/api/budget-plan", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.patch("/api/budget-plan/:id", isAuthenticated, async (req: any, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
