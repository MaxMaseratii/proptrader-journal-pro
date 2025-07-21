// COMPLETE DEBUG VERSION FOR CALENDAR DAY SELECTION
// Replace the relevant parts in your dashboard.tsx with these functions

// 1. ENHANCED getDayData with debugging
const getDayData = (clickedDate, tradesData = []) => {
  console.log('=== getDayData DEBUG START ===');
  console.log('Clicked date:', clickedDate.toDateString());
  console.log('Available trades:', tradesData.length);
  console.log('selectedAccountIds:', selectedAccountIds);
  
  const dayTrades = getTradesForDate(clickedDate, tradesData, selectedAccountIds);
  console.log('Filtered day trades:', dayTrades.length);
  console.log('Day trades data:', dayTrades);
  
  const totalDayTrades = dayTrades.length;
  const wins = dayTrades.filter(t => (t.pnl || 0) > 0).length;
  const losses = dayTrades.filter(t => (t.pnl || 0) <= 0).length;
  const dayPnL = dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const avgRiskPerTrade = dayTrades.length > 0 ? 
    dayTrades.reduce((sum, t) => sum + Math.abs(t.pnl || 0), 0) / dayTrades.length : 0;
  
  const result = {
    date: clickedDate,
    totalDayTrades,
    wins,
    losses,
    dayPnL,
    avgRiskPerTrade: Math.round(avgRiskPerTrade),
    avgRewardRatio: Math.round(avgRiskPerTrade * 1.5), // Simple calculation
    maxDailyRisk: avgRiskPerTrade * 5,
    disciplineScore: 85,
    winRate: totalDayTrades > 0 ? (wins / totalDayTrades) * 100 : 0,
    hoursWorked: 6.5,
    hoursPlanned: 8,
    trades: dayTrades
  };
  
  console.log('Final day data result:', result);
  console.log('=== getDayData DEBUG END ===');
  return result;
};

// 2. ENHANCED getTradesForDate with debugging
const getTradesForDate = (date, trades = [], selectedAccountIds) => {
  console.log('=== getTradesForDate DEBUG START ===');
  console.log('Target date:', date.toDateString());
  console.log('Target date ISO:', date.toISOString());
  console.log('All trades count:', trades.length);
  console.log('Selected account IDs:', selectedAccountIds);
  
  const dateStr = date.toISOString().split('T')[0];
  console.log('Date string for filtering:', dateStr);
  
  const filteredTrades = trades.filter(trade => {
    console.log('Checking trade:', trade.id, 'date:', trade.date, 'accountId:', trade.accountId);
    const matchesDate = trade.date === dateStr;
    const matchesAccount = selectedAccountIds.length === 0 || selectedAccountIds.includes(trade.accountId);
    console.log('Matches date:', matchesDate, 'Matches account:', matchesAccount);
    return matchesDate && matchesAccount;
  });
  
  console.log('Filtered trades result:', filteredTrades.length);
  console.log('=== getTradesForDate DEBUG END ===');
  return filteredTrades;
};

// 3. ENHANCED onClick handler with full debugging
const enhancedOnDayClick = (date) => {
  console.log('=== CALENDAR CLICK DEBUG START ===');
  console.log('Clicked date:', date.toDateString());
  console.log('Current selectedDate:', selectedDate.toDateString());
  console.log('Current selectedDayData:', selectedDayData);
  console.log('Available trades:', trades?.length || 0);
  console.log('Setting new selectedDate...');
  
  setSelectedDate(date);
  
  console.log('Calculating new day data...');
  const dayData = getDayData(date, trades || []);
  
  console.log('Setting new selectedDayData...');
  setSelectedDayData(dayData);
  
  console.log('=== CALENDAR CLICK DEBUG END ===');
};

// 4. USAGE IN CALENDAR COMPONENTS
// Replace your current onDayClick handlers with:
onDayClick={(date) => enhancedOnDayClick(date)}

// 5. DEBUG THE WIDGETS - Add this to your Section 1 widgets
console.log('WIDGET RENDER DEBUG:');
console.log('selectedDayData exists:', !!selectedDayData);
if (selectedDayData) {
  console.log('selectedDayData content:', selectedDayData);
}

// 6. TEST APPROACH:
// Step 1: Replace getDayData and getTradesForDate with debug versions
// Step 2: Replace onDayClick handlers with enhancedOnDayClick
// Step 3: Add console.log to widget renders
// Step 4: Click a calendar day and check browser console
// Step 5: Look for all the debug messages and identify where it breaks

// EXPECTED DEBUG OUTPUT WHEN CLICKING:
// ==> CALENDAR CLICK DEBUG START
// ==> getTradesForDate DEBUG START  
// ==> getDayData DEBUG START
// ==> WIDGET RENDER DEBUG (showing selectedDayData updated)

// If you don't see these messages, the click isn't working
// If you see messages but widgets don't update, it's a React re-render issue