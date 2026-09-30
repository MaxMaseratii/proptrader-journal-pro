import Queue from 'bull';
import { storage } from './storage';
import { CacheService } from './redis';

// Create job queues for background processing
export const csvProcessingQueue = new Queue('csv processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export const analyticsQueue = new Queue('analytics processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 25,
  },
});

// CSV Processing Job Handler
csvProcessingQueue.process('import-csv', async (job) => {
  const { userId, accountId, trades, fileName } = job.data;
  
  console.log(`Processing CSV import for user ${userId}, account ${accountId}`);
  
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
        fillTime: trade.fillTime ? new Date(trade.fillTime) : new Date(),
        exitTime: trade.exitTime ? new Date(trade.exitTime) : new Date(),
        initialStopLoss: trade.initialStopLoss || null,
        finalStopLoss: trade.finalStopLoss || null,
        initialTakeProfit: trade.initialTakeProfit || null,
        finalTakeProfit: trade.finalTakeProfit || null,
        tradeImage: trade.tradeImage || null,
        tradingViewLink: trade.tradingViewLink || null,
        notes: trade.notes || 'Imported via Universal CSV'
      };
      
      await storage.createTrade(tradeData);
      recordsImported++;
    } catch (error) {
      errors.push(`Failed to import trade: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Invalidate cache for this user and account
  await CacheService.invalidatePattern(`trades:${userId}:${accountId}*`);
  await CacheService.invalidatePattern(`dashboard:${userId}:${accountId}*`);
  await CacheService.invalidatePattern(`accounts:${userId}*`);

  return {
    success: true,
    recordsImported,
    errors,
    message: `Successfully imported ${recordsImported} trades`
  };
});

// Analytics Processing Job Handler
analyticsQueue.process('calculate-analytics', async (job) => {
  const { userId, accountId } = job.data;
  
  console.log(`Calculating analytics for user ${userId}, account ${accountId}`);
  
  const account = await storage.getAccount(accountId);
  const trades = await storage.getTrades(accountId);
  
  if (!account) {
    throw new Error('Account not found');
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
    currentBalance: account.startingBalance + totalPnl,
    drawdown: Math.max(0, ((account.startingBalance - (account.startingBalance + totalPnl)) / account.startingBalance) * 100),
    profitTarget: account.profitTarget,
    dailyLossLimit: account.dailyLossLimit,
    riskLimitUsed: account.dailyLossLimit ? (Math.abs(worstTrade?.pnl || 0) / account.dailyLossLimit * 100) : 0
  };

  // Cache the analytics for 5 minutes
  await CacheService.set(CacheService.getDashboardKey(userId, accountId.toString()), analytics, 300);

  return analytics;
});

// Error handling
csvProcessingQueue.on('failed', (job, err) => {
  console.error(`CSV processing job ${job.id} failed:`, err);
});

analyticsQueue.on('failed', (job, err) => {
  console.error(`Analytics job ${job.id} failed:`, err);
});

// Job completion logging
csvProcessingQueue.on('completed', (job) => {
  console.log(`CSV processing job ${job.id} completed successfully`);
});

analyticsQueue.on('completed', (job) => {
  console.log(`Analytics job ${job.id} completed successfully`);
});