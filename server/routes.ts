import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAccountSchema, insertTradeSchema, insertJournalEntrySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Account routes
  app.get("/api/accounts", async (req, res) => {
    try {
      const accounts = await storage.getAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  app.get("/api/accounts/:id", async (req, res) => {
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

  app.post("/api/accounts", async (req, res) => {
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

  app.put("/api/accounts/:id", async (req, res) => {
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
  app.get("/api/trades", async (req, res) => {
    try {
      const accountId = req.query.accountId ? parseInt(req.query.accountId as string) : undefined;
      const trades = await storage.getTrades(accountId);
      res.json(trades);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trades" });
    }
  });

  app.post("/api/trades", async (req, res) => {
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

      // Process each row (skip header)
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

          // Only import filled orders
          if (row.Status?.trim() !== 'Filled') {
            continue;
          }

          // Parse trade data from actual CSV format
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

          if (!symbol || !quantity || !price) {
            errors.push(`Row ${i}: Missing required trade data`);
            continue;
          }

          // Calculate P&L for ES futures ($50 per point)
          // For this simplified version, we'll use a base price to calculate P&L
          const basePrice = 6000; // Approximate baseline
          const pointValue = 50; // ES point value
          const pnl = side === 'buy' 
            ? (price - basePrice) * quantity * pointValue * 0.01 // Convert to reasonable P&L
            : (basePrice - price) * quantity * pointValue * 0.01;

          // Check risk compliance
          const riskAmount = account.riskPerTrade || 100;
          const actualRisk = Math.abs(pnl);
          const riskCompliance = actualRisk <= riskAmount;

          const trade = {
            accountId,
            date,
            symbol: symbol.replace(/[^A-Z]/g, ''), // Clean symbol
            side,
            quantity,
            entryPrice: price,
            exitPrice: price,
            pnl,
            status: 'closed',
            orderId: row.orderId || row['Order ID'] || '',
            orderType: row.Type || 'Market',
            originalQuantity: quantity,
            riskAmount,
            riskCompliance,
            notes: `Imported from ${fileName}`
          };

          const createdTrade = await storage.createTrade(trade);
          importedTrades.push(createdTrade);
          recordsImported++;

        } catch (error) {
          errors.push(`Row ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
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

  const httpServer = createServer(app);
  return httpServer;
}
