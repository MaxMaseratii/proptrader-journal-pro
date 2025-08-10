// Script to create comprehensive mock account with realistic trade data
import { db } from './server/db.js';
import { accounts, trades } from './shared/schema.js';

async function createMockAccount() {
  console.log('Creating comprehensive mock trading account...');
  
  // Create mock account
  const [account] = await db.insert(accounts).values({
    name: "FTMO $100K Challenge",
    type: "challenge", 
    firm: "FTMO",
    startingBalance: 100000.00,
    maxDrawdown: 10000.00,
    maxDrawdownType: "EOD",
    dailyLossLimit: 5000.00,
    hasDailyLossLimit: true,
    dailyLossLimitAmount: 5000.00,
    dailyLossLimitType: "hard_breach",
    profitTarget: 10000.00,
    status: "active",
    
    // Risk Management Settings
    riskPerTrade: 1000.00,
    riskPercentage: 1.0,
    riskRewardRatio: 2.0,
    maxPositionSize: 5,
    maxTradesPerDay: 10,
    maxRiskPerDay: 3000.00,
    
    // Trading Assets
    primaryTradingAsset: "NQ (Nasdaq 100)",
    secondaryTradingAsset: "ES (S&P 500)",
    tertiaryTradingAsset: "YM (Dow Jones)",
    
    // Financial Info
    accountCost: 540.00,
    purchaseMethod: "credit_card",
    activationCost: 0.00,
    activationPaid: false,
    includesActivationFee: true,
    
    // Challenge Settings
    numberOfPhases: 2,
    phase1Target: 10000.00,
    phase2Target: 5000.00,
    minimumTradingDays: 5,
    timeLimit: 30,
    daysRequiredToPass: 5,
    
    // CSV Security
    csvAccountId: "FTMO-100K-001",
    
    // Drawdown Rules
    drawdownType: "trailing",
    maxTotalLoss: 10000.00,
    trailingThreshold: 1500.00,
    
    // Trading Rules
    consistencyRule: true,
    consistencyPercentage: 30.0,
    copyTradingAllowed: false,
    newsTradingAllowed: true,
    
    // Personal Trading Times
    personalTradingTimeStart1: "09:30",
    personalTradingTimeEnd1: "16:00", 
    personalTradingTimeZone1: "EST",
    
    personalTradingTimeStart2: "19:00",
    personalTradingTimeEnd2: "21:00",
    personalTradingTimeZone2: "EST",
    
    personalTradingTimeStart3: "06:30",
    personalTradingTimeEnd3: "08:30",
    personalTradingTimeZone3: "EST"
  }).returning();

  console.log('Mock account created:', account);

  // Create realistic trade data
  const mockTrades = [
    // Day 1 - Strong Start
    {
      accountId: account.id,
      symbol: "NQ",
      side: "long",
      quantity: 2,
      entryPrice: 15250.75,
      exitPrice: 15285.50,
      entryTime: new Date('2025-08-01T10:30:00Z'),
      exitTime: new Date('2025-08-01T11:15:00Z'),
      pnl: 1395.00,
      commission: 8.50,
      netPnl: 1386.50,
      strategy: "Breakout",
      notes: "Clean breakout above resistance with strong volume",
      platform: "NinjaTrader",
      tradeImage: null,
      tradingViewLink: "https://tradingview.com/chart/NQ/example1"
    },
    {
      accountId: account.id,
      symbol: "ES",
      side: "short",
      quantity: 3,
      entryPrice: 4285.25,
      exitPrice: 4270.00,
      entryTime: new Date('2025-08-01T14:20:00Z'),
      exitTime: new Date('2025-08-01T15:45:00Z'),
      pnl: 2287.50,
      commission: 12.75,
      netPnl: 2274.75,
      strategy: "Trend Following",
      notes: "Perfect trend reversal setup with RSI divergence",
      platform: "NinjaTrader",
      tradeImage: null,
      tradingViewLink: "https://tradingview.com/chart/ES/example2"
    },
    
    // Day 2 - Mixed Results
    {
      accountId: account.id,
      symbol: "NQ",
      side: "long",
      quantity: 1,
      entryPrice: 15180.50,
      exitPrice: 15155.25,
      entryTime: new Date('2025-08-02T09:45:00Z'),
      exitTime: new Date('2025-08-02T10:20:00Z'),
      pnl: -505.00,
      commission: 4.25,
      netPnl: -509.25,
      strategy: "Support Bounce",
      notes: "Support failed to hold, quick exit to minimize loss",
      platform: "NinjaTrader",
      tradeImage: null,
      tradingViewLink: "https://tradingview.com/chart/NQ/example3"
    },
    {
      accountId: account.id,
      symbol: "YM",
      side: "short",
      quantity: 2,
      entryPrice: 34250.00,
      exitPrice: 34195.50,
      entryTime: new Date('2025-08-02T13:10:00Z'),
      exitTime: new Date('2025-08-02T14:30:00Z'),
      pnl: 1090.00,
      commission: 10.00,
      netPnl: 1080.00,
      strategy: "Momentum",
      notes: "Strong momentum breakdown after consolidation",
      platform: "NinjaTrader",
      tradeImage: null,
      tradingViewLink: "https://tradingview.com/chart/YM/example4"
    },
    
    // Day 3 - Challenging Day
    {
      accountId: account.id,
      symbol: "ES",
      side: "long",
      quantity: 2,
      entryPrice: 4290.75,
      exitPrice: 4275.25,
      entryTime: new Date('2025-08-03T11:00:00Z'),
      exitTime: new Date('2025-08-03T11:35:00Z'),
      pnl: -775.00,
      commission: 8.50,
      netPnl: -783.50,
      strategy: "Reversal",
      notes: "False reversal signal, market continued down",
      platform: "NinjaTrader",
      tradeImage: null,
      tradingViewLink: "https://tradingview.com/chart/ES/example5"
    },
    {
      accountId: account.id,
      symbol: "NQ", 
      side: "short",
      quantity: 3,
      entryPrice: 15120.00,
      exitPrice: 15055.75,
      entryTime: new Date('2025-08-03T15:15:00Z'),
      exitTime: new Date('2025-08-03T16:00:00Z'),
      pnl: 3862.50,
      commission: 12.75,
      netPnl: 3849.75,
      strategy: "End of Day",
      notes: "Excellent EOD breakdown, perfect timing",
      platform: "NinjaTrader",
      tradeImage: null,
      tradingViewLink: "https://tradingview.com/chart/NQ/example6"
    },
    
    // Day 4 - Steady Performance
    {
      accountId: account.id,
      symbol: "ES",
      side: "long",
      quantity: 2,
      entryPrice: 4265.50,
      exitPrice: 4285.75,
      entryTime: new Date('2025-08-04T10:15:00Z'),
      exitTime: new Date('2025-08-04T12:20:00Z'),
      pnl: 1012.50,
      commission: 8.50,
      netPnl: 1004.00,
      strategy: "Range Trading",
      notes: "Clean range bounce from support to resistance",
      platform: "NinjaTrader",
      tradeImage: null,
      tradingViewLink: "https://tradingview.com/chart/ES/example7"
    },
    {
      accountId: account.id,
      symbol: "NQ",
      side: "short",
      quantity: 1,
      entryPrice: 15195.25,
      exitPrice: 15210.50,
      entryTime: new Date('2025-08-04T14:45:00Z'),
      exitTime: new Date('2025-08-04T15:10:00Z'),
      pnl: -305.00,
      commission: 4.25,
      netPnl: -309.25,
      strategy: "Scalping",
      notes: "Quick scalp attempt that didn't work, fast exit",
      platform: "NinjaTrader",
      tradeImage: null,
      tradingViewLink: "https://tradingview.com/chart/NQ/example8"
    },
    
    // Day 5 - Strong Finish
    {
      accountId: account.id,
      symbol: "YM",
      side: "long",
      quantity: 3,
      entryPrice: 34180.50,
      exitPrice: 34235.25,
      entryTime: new Date('2025-08-05T09:30:00Z'),
      exitTime: new Date('2025-08-05T11:45:00Z'),
      pnl: 1642.50,
      commission: 15.00,
      netPnl: 1627.50,
      strategy: "Gap Fill",
      notes: "Perfect gap fill play with strong follow-through",
      platform: "NinjaTrader",
      tradeImage: null,
      tradingViewLink: "https://tradingview.com/chart/YM/example9"
    },
    {
      accountId: account.id,
      symbol: "ES",
      side: "short",
      quantity: 2,
      entryPrice: 4295.75,
      exitPrice: 4260.25,
      entryTime: new Date('2025-08-05T13:30:00Z'),
      exitTime: new Date('2025-08-05T15:55:00Z'),
      pnl: 1775.00,
      commission: 8.50,
      netPnl: 1766.50,
      strategy: "Trend Following",
      notes: "Excellent trend continuation trade, held for full move",
      platform: "NinjaTrader",
      tradeImage: null,
      tradingViewLink: "https://tradingview.com/chart/ES/example10"
    }
  ];

  // Insert all trades
  await db.insert(trades).values(mockTrades);
  
  console.log(`Created ${mockTrades.length} realistic trades`);
  console.log('Mock data creation complete!');
  
  // Calculate and display summary stats
  const totalPnL = mockTrades.reduce((sum, trade) => sum + trade.netPnl, 0);
  const winningTrades = mockTrades.filter(trade => trade.netPnl > 0).length;
  const totalTrades = mockTrades.length;
  const winRate = (winningTrades / totalTrades * 100).toFixed(1);
  
  console.log('Trading Summary:');
  console.log(`Total P&L: $${totalPnL.toFixed(2)}`);
  console.log(`Win Rate: ${winRate}% (${winningTrades}/${totalTrades})`);
  console.log(`Account Balance: $${(account.startingBalance + totalPnL).toFixed(2)}`);
  console.log(`Progress to Target: ${(totalPnL / account.profitTarget * 100).toFixed(1)}%`);
}

createMockAccount().catch(console.error);