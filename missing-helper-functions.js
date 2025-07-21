// MISSING HELPER FUNCTIONS FOR CALENDAR DAY SELECTION

// This function might be missing or not working correctly
const getTradesForDate = (targetDate, trades = [], selectedAccountIds = []) => {
  if (!trades || trades.length === 0) return [];
  
  // Convert target date to YYYY-MM-DD format
  const targetDateStr = targetDate.toISOString().split('T')[0];
  
  return trades.filter(trade => {
    // Filter by date
    const tradeDateStr = new Date(trade.date).toISOString().split('T')[0];
    const dateMatch = tradeDateStr === targetDateStr;
    
    // Filter by selected accounts if specified
    const accountMatch = selectedAccountIds.length === 0 || selectedAccountIds.includes(trade.accountId);
    
    return dateMatch && accountMatch;
  });
};

// Alternative simpler approach - you could try this in the getDayData function
const getDayDataSimplified = (clickedDate, tradesData = []) => {
  console.log('getDayData called with:', clickedDate.toDateString(), 'trades:', tradesData.length);
  
  // Simple date filtering - just match the date part
  const targetDateStr = clickedDate.toISOString().split('T')[0];
  const dayTrades = tradesData.filter(trade => {
    const tradeDateStr = new Date(trade.date).toISOString().split('T')[0];
    return tradeDateStr === targetDateStr;
  });
  
  console.log('Found trades for date:', dayTrades.length);
  
  const totalDayTrades = dayTrades.length;
  const wins = dayTrades.filter(t => (t.pnl || 0) > 0).length;
  const losses = dayTrades.filter(t => (t.pnl || 0) <= 0).length;
  const dayPnL = dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  
  const result = {
    date: clickedDate,
    totalDayTrades,
    wins,
    losses,
    dayPnL,
    avgRiskPerTrade: 50, // Fixed value for testing
    avgRewardRatio: 150, // Fixed value for testing
    maxDailyRisk: 250, // Fixed value for testing
    disciplineScore: 85,
    winRate: totalDayTrades > 0 ? (wins / totalDayTrades) * 100 : 0,
    hoursWorked: 6.5,
    hoursPlanned: 8,
    trades: dayTrades
  };
  
  console.log('Returning day data:', result);
  return result;
};

// DEBUGGING APPROACH:
// 1. Replace the current getDayData function with getDayDataSimplified
// 2. Check console logs when clicking calendar days
// 3. See if selectedDayData gets populated with the simplified data
// 4. If it works, then the issue is in the original getDayData or getTradesForDate function