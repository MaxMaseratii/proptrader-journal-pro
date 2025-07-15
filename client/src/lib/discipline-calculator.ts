import type { Trade, Account } from "@shared/schema";

export interface DisciplineMetrics {
  totalTrades: number;
  winRate: number;
  disciplineScore: number;
  riskManagementScore: number;
  emotionalControlScore: number;
  consistencyScore: number;
  stopModificationRate: number;
  excessLosses: number;
  marketAnalysisScore: number;
  timeManagementScore: number;
  learningScore: number;
}

export const calculateComprehensiveDisciplineMetrics = (
  accountTrades: Trade[], 
  accounts: Account[] = [],
  selectedAccountId?: string
): DisciplineMetrics => {
  if (accountTrades.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      disciplineScore: 0,
      riskManagementScore: 0,
      emotionalControlScore: 0,
      consistencyScore: 0,
      stopModificationRate: 0,
      excessLosses: 0,
      marketAnalysisScore: 0,
      timeManagementScore: 0,
      learningScore: 0,
    };
  }

  const totalTrades = accountTrades.length;
  const winningTrades = accountTrades.filter(t => t.pnl > 0);
  const losingTrades = accountTrades.filter(t => t.pnl < 0);
  const winRate = winningTrades.length / totalTrades;
  
  const totalPnL = accountTrades.reduce((sum, trade) => sum + trade.pnl, 0);
  const totalWins = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0);
  const totalLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0));
  const avgWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;
  const riskRewardRatio = avgLoss > 0 ? avgWin / avgLoss : 0;

  // Advanced Behavioral Analysis
  let maxConsecutiveLosses = 0;
  let currentLossStreak = 0;
  let revengeTradesCount = 0;
  let fomoTradesCount = 0;
  let stopLossViolations = 0;
  let overTradingDays = 0;
  let impulsiveTradesCount = 0;
  
  // Time-based analysis
  const timeOfDayPatterns: { [key: string]: number } = {};
  const dailyTradeCount: { [key: string]: number } = {};
  
  accountTrades.forEach((trade, index) => {
    const tradeDate = new Date(trade.date);
    const hour = tradeDate.getHours();
    const dateKey = tradeDate.toDateString();
    
    // Time patterns
    const timeSlot = hour < 10 ? 'morning' : hour < 14 ? 'midday' : hour < 18 ? 'afternoon' : 'evening';
    timeOfDayPatterns[timeSlot] = (timeOfDayPatterns[timeSlot] || 0) + 1;
    
    // Daily trade frequency
    dailyTradeCount[dateKey] = (dailyTradeCount[dateKey] || 0) + 1;
    
    if (trade.pnl < 0) {
      currentLossStreak++;
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLossStreak);
      
      // Detect revenge trading (increased position size after loss)
      if (index > 0 && accountTrades[index - 1].pnl < 0) {
        if (trade.quantity > accountTrades[index - 1].quantity * 1.5) {
          revengeTradesCount++;
        }
        
        // Check for impulsive trading (same day as previous loss)
        const prevDate = new Date(accountTrades[index - 1].date).toDateString();
        if (tradeDate.toDateString() === prevDate) {
          impulsiveTradesCount++;
        }
      }
      
      // Check for stop loss violations (if we have stop loss data)
      if (trade.initialStopLoss && trade.finalStopLoss) {
        if (trade.finalStopLoss !== trade.initialStopLoss) {
          stopLossViolations++;
        }
      }
    } else {
      currentLossStreak = 0;
      
      // Check for FOMO trades (quick entries after winning trades)
      if (index > 0 && accountTrades[index - 1].pnl > 0) {
        const prevDate = new Date(accountTrades[index - 1].date);
        const timeDiff = tradeDate.getTime() - prevDate.getTime();
        if (timeDiff < 30 * 60 * 1000) { // within 30 minutes
          fomoTradesCount++;
        }
      }
    }
  });
  
  // Calculate overtrading
  Object.values(dailyTradeCount).forEach(count => {
    if (count > 10) overTradingDays++;
  });

  // Advanced Discipline Scoring with comprehensive analysis
  const riskManagementScore = Math.min(100, Math.max(0, 
    (riskRewardRatio >= 2 ? 90 : riskRewardRatio >= 1.5 ? 75 : riskRewardRatio >= 1 ? 55 : 35) +
    (maxConsecutiveLosses <= 3 ? 10 : maxConsecutiveLosses <= 5 ? 5 : 0) -
    (stopLossViolations * 5)
  ));

  const emotionalControlScore = Math.min(100, Math.max(0,
    85 - (revengeTradesCount * 12) - (fomoTradesCount * 8) - (impulsiveTradesCount * 6) - 
    (maxConsecutiveLosses > 5 ? 25 : maxConsecutiveLosses > 3 ? 15 : 0) + 
    (winRate >= 0.6 ? 15 : winRate >= 0.5 ? 10 : 0)
  ));

  // Advanced consistency scoring
  const avgPositionSize = accountTrades.reduce((sum, t) => sum + t.quantity, 0) / totalTrades;
  const positionSizeVariance = accountTrades.reduce((sum, t) => sum + Math.pow(t.quantity - avgPositionSize, 2), 0) / totalTrades;
  const sizeConsistency = Math.min(100, Math.max(0, 100 - (Math.sqrt(positionSizeVariance) / avgPositionSize) * 100));
  
  const consistencyScore = Math.min(100, Math.max(0,
    (sizeConsistency * 0.4) + 
    (Math.max(0, 100 - overTradingDays * 10) * 0.3) +
    (Math.max(0, 100 - impulsiveTradesCount * 5) * 0.3)
  ));

  // Stop modification rate with comprehensive analysis
  const stopModificationRate = Math.min(75, 
    (stopLossViolations / totalTrades * 100) + 
    (revengeTradesCount * 3) + 
    (maxConsecutiveLosses > 3 ? 20 : 0)
  );

  // Market analysis score with timing and pattern recognition
  const marketAnalysisScore = Math.min(100, Math.max(0,
    (winRate * 50) + 
    (riskRewardRatio >= 2 ? 35 : riskRewardRatio >= 1.5 ? 25 : riskRewardRatio >= 1 ? 15 : 5) +
    (Math.max(0, 100 - fomoTradesCount * 8) * 0.15)
  ));

  // Advanced time management scoring
  const avgTradesPerDay = totalTrades / Math.max(1, Object.keys(dailyTradeCount).length);
  const timeManagementScore = Math.min(100, Math.max(0,
    (avgTradesPerDay <= 8 ? 90 : avgTradesPerDay <= 15 ? 75 : avgTradesPerDay <= 25 ? 60 : 40) -
    (overTradingDays * 8) +
    (Object.keys(timeOfDayPatterns).length === 1 ? -10 : 0) // penalty for trading only one time slot
  ));

  // Learning score with comprehensive improvement tracking
  const quarterSize = Math.floor(totalTrades / 4);
  let learningScore = 60;
  
  if (quarterSize > 0) {
    const q1Trades = accountTrades.slice(0, quarterSize);
    const q4Trades = accountTrades.slice(-quarterSize);
    
    const q1WinRate = q1Trades.filter(t => t.pnl > 0).length / q1Trades.length;
    const q4WinRate = q4Trades.filter(t => t.pnl > 0).length / q4Trades.length;
    
    const q1AvgWin = q1Trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / q1Trades.filter(t => t.pnl > 0).length || 0;
    const q4AvgWin = q4Trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / q4Trades.filter(t => t.pnl > 0).length || 0;
    
    const winRateImprovement = (q4WinRate - q1WinRate) * 100;
    const profitabilityImprovement = q1AvgWin > 0 ? ((q4AvgWin - q1AvgWin) / q1AvgWin) * 100 : 0;
    
    learningScore = Math.min(100, Math.max(0, 
      60 + (winRateImprovement * 2) + (profitabilityImprovement * 0.5)
    ));
  }

  // Account-specific discipline assessment
  const selectedAccounts = accounts.filter(acc => 
    selectedAccountId ? acc.id === parseInt(selectedAccountId) : true
  );
  
  const currentAccount = selectedAccountId ? accounts.find(acc => acc.id === parseInt(selectedAccountId)) : null;
  
  // Calculate account status bonuses/penalties
  let accountStatusBonus = 0;
  let accountStatusPenalty = 0;
  
  if (currentAccount) {
    // Single account assessment
    if (currentAccount.status === 'funded' || currentAccount.status === 'live') {
      accountStatusBonus = 15;
    } else if (currentAccount.status === 'failed') {
      accountStatusPenalty = 25;
    }
  } else {
    // Multi-account assessment
    selectedAccounts.forEach(account => {
      if (account.status === 'funded' || account.status === 'live') {
        accountStatusBonus += 15;
      } else if (account.status === 'failed') {
        accountStatusPenalty += 25;
      }
    });
  }
  
  // Apply account status adjustments (but don't let bonuses exceed reasonable limits)
  const accountStatusAdjustment = Math.min(25, accountStatusBonus) - accountStatusPenalty;
  
  // Performance-based scoring adjustments
  let performanceMultiplier = 1.0;
  
  if (totalPnL > 0) {
    // Reward profitable accounts
    performanceMultiplier = Math.min(1.4, 1.0 + (totalPnL / 10000)); // Max 40% bonus for very profitable accounts
  } else if (totalPnL < 0) {
    // Penalize losing accounts
    performanceMultiplier = Math.max(0.6, 1.0 + (totalPnL / 10000)); // Max 40% penalty for losing accounts
  }
  
  // Win rate adjustment
  const winRateMultiplier = winRate > 0.5 ? 1.0 + ((winRate - 0.5) * 0.5) : 1.0 - ((0.5 - winRate) * 0.5);
  
  // Overall discipline score (weighted average with performance adjustments)
  const baseDisciplineScore = (
    riskManagementScore * 0.25 +
    emotionalControlScore * 0.20 +
    consistencyScore * 0.20 +
    marketAnalysisScore * 0.15 +
    timeManagementScore * 0.10 +
    learningScore * 0.10
  );
  
  // Apply all performance adjustments
  const disciplineScore = Math.max(0, Math.min(100, 
    (baseDisciplineScore * performanceMultiplier * winRateMultiplier) + accountStatusAdjustment
  ));
  
  // Calculate excess losses (actual trading losses, not account costs)
  const tradingExcessLosses = (avgLoss * revengeTradesCount) + (avgLoss * fomoTradesCount * 0.5);
  const totalExcessLosses = Math.max(0, tradingExcessLosses);



  return {
    totalTrades,
    winRate,
    disciplineScore,
    riskManagementScore,
    emotionalControlScore,
    consistencyScore,
    stopModificationRate,
    excessLosses: totalExcessLosses,
    marketAnalysisScore,
    timeManagementScore,
    learningScore,
  };
};