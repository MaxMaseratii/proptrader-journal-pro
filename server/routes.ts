import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAccountSchema, insertTradeSchema, insertJournalEntrySchema, insertSpendingSchema, type InsertTrade } from "@shared/schema";
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
  // Account routes
  app.get("/api/accounts", isAuthenticated, async (req, res) => {
    try {
      const accounts = await storage.getAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accounts" });
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

  app.delete("/api/accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAccount(id);
      if (!deleted) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.status(204).send();
    } catch (error) {
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

  app.put("/api/trades/:id", async (req, res) => {
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

  app.post("/api/trades/import-csv", isAuthenticated, async (req, res) => {
    try {
      const { accountId, csvData } = req.body;
      
      if (!accountId || !csvData) {
        return res.status(400).json({ message: "Account ID and CSV content are required" });
      }

      const account = await storage.getAccount(parseInt(accountId));
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }

      // Parse CSV content
      const lines = csvData.split('\n').filter((line: string) => line.trim());
      const headers = lines[0].split(',').map((h: string) => h.trim());
      
      let recordsProcessed = 0;
      let recordsImported = 0;
      const errors: string[] = [];

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
          
          // Parse date from format like "6/27/25"
          let date = new Date().toISOString().split('T')[0];
          if (row.Date) {
            const dateParts = row.Date.split('/');
            if (dateParts.length === 3) {
              const month = dateParts[0].padStart(2, '0');
              const day = dateParts[1].padStart(2, '0');
              const year = '20' + dateParts[2];
              date = `${year}-${month}-${day}`;
            }
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

              // Enhanced stop loss and take profit detection using price levels
              const hasStopLoss = buyOrder.orderType === 'Stop' || sellOrder.orderType === 'Stop' ||
                                 (buyOrder.text && buyOrder.text.includes('Exit')) || 
                                 (sellOrder.text && sellOrder.text.includes('Exit'));
              const hasTakeProfit = (buyOrder.orderType === 'Limit' && buyOrder.side === 'sell') || 
                                   (sellOrder.orderType === 'Limit' && sellOrder.side === 'sell');
              
              // Determine actual SL/TP price levels
              const stopLossPrice = hasStopLoss ? (sellOrder.stopPrice || sellOrder.price) : null;
              const takeProfitPrice = hasTakeProfit ? (sellOrder.limitPrice || sellOrder.price) : null;

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
                orderType: 'Sequential Match',
                originalQuantity: quantityToClose,
                riskAmount,
                riskCompliance,
                initialStopLoss: stopLossPrice,
                initialTakeProfit: takeProfitPrice,
                finalStopLoss: stopLossPrice,
                finalTakeProfit: takeProfitPrice,
                notes: `Imported - Entry: ${buyOrder.price}, Exit: ${sellOrder.price}, Qty: ${quantityToClose}${hasStopLoss ? ' [SL]' : ''}${hasTakeProfit ? ' [TP]' : ''}`
              };

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

          // Parse order data
          const symbol = row.Product || row.Contract || '';
          const side = row['B/S']?.trim() === 'Buy' ? 'buy' : 'sell';
          const quantity = parseFloat(row['Filled Qty']) || parseFloat(row.filledQty) || 0;
          const price = parseFloat(row['Avg Fill Price']) || parseFloat(row.avgPrice) || 0;
          const fillTime = row['Fill Time'] || row.Timestamp || '';
          
          // Parse date from format like "6/12/25"
          let date = new Date().toISOString().split('T')[0];
          if (row.Date) {
            const dateParts = row.Date.split('/');
            if (dateParts.length === 3) {
              const month = dateParts[0].padStart(2, '0');
              const day = dateParts[1].padStart(2, '0');
              const year = '20' + dateParts[2];
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

  const httpServer = createServer(app);
  return httpServer;
}
