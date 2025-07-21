// CALENDAR DAY SELECTION IMPLEMENTATION
// This is the current code from dashboard.tsx

// 1. STATE MANAGEMENT
const [selectedDate, setSelectedDate] = useState(new Date());
const [selectedDayData, setSelectedDayData] = useState(null);

// 2. DAY DATA CALCULATION FUNCTION
const getDayData = (clickedDate, tradesData = []) => {
  const dayTrades = getTradesForDate(clickedDate, tradesData, selectedAccountIds);
  
  const totalDayTrades = dayTrades.length;
  const wins = dayTrades.filter(t => (t.pnl || 0) > 0).length;
  const losses = dayTrades.filter(t => (t.pnl || 0) <= 0).length;
  const dayPnL = dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const avgRiskPerTrade = dayTrades.length > 0 ? 
    dayTrades.reduce((sum, t) => sum + Math.abs(t.pnl || 0), 0) / dayTrades.length : 0;
  const avgRewardRatio = wins > 0 ? 
    dayTrades.filter(t => (t.pnl || 0) > 0).reduce((sum, t) => sum + (t.pnl || 0), 0) / wins : 0;
  
  return {
    date: clickedDate,
    totalDayTrades,
    wins,
    losses,
    dayPnL,
    avgRiskPerTrade: Math.round(avgRiskPerTrade),
    avgRewardRatio: Math.round(avgRewardRatio),
    maxDailyRisk: avgRiskPerTrade * 5,
    disciplineScore: 85,
    winRate: totalDayTrades > 0 ? (wins / totalDayTrades) * 100 : 0,
    hoursWorked: 6.5,
    hoursPlanned: 8,
    trades: dayTrades
  };
};

// 3. CALENDAR COMPONENT INTERFACES
interface WeeklyCalendarViewProps extends CalendarViewProps {
  currentWeekStart: Date;
  onDayClick?: (date: Date) => void;
}

interface MonthlyCalendarViewProps extends CalendarViewProps {
  currentMonth: Date;
  onDayClick?: (date: Date) => void;
}

interface YearlyCalendarViewProps extends CalendarViewProps {
  currentYear: Date;
  onDayClick?: (date: Date) => void;
}

// 4. WEEKLY CALENDAR VIEW (Example of click handler)
const WeeklyCalendarView = ({ currentWeekStart, trades, accounts, selectedAccountIds, onDayClick }) => {
  // ... week generation code ...
  
  return (
    <div className="bg-gray-800/40 rounded-lg border border-gray-600/30 p-4">
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(date => {
          const metrics = getDayMetrics(date, trades, selectedAccountIds);
          const isToday = date.toDateString() === today.toDateString();
          const isCurrentMonth = date.getMonth() === currentWeekStart.getMonth();
          
          return (
            <div
              key={date.toISOString()}
              className={`
                relative p-3 rounded-lg border transition-all duration-200 h-24 cursor-pointer
                ${selectedDate.toDateString() === date.toDateString()
                  ? 'border-amber-400 bg-amber-900/20 shadow-lg'
                  : isToday 
                  ? 'border-teal-400/60 bg-gradient-to-br from-teal-900/30 via-gray-800/40 to-teal-900/30' 
                  : isCurrentMonth
                  ? 'border-gray-600/40 bg-gradient-to-br from-gray-800/40 via-gray-700/40 to-gray-800/40'
                  : 'border-gray-700/30 bg-gradient-to-br from-gray-900/30 via-gray-800/30 to-gray-900/30 opacity-60'
                }
                hover:border-amber-400/60
              `}
              onClick={() => {
                console.log('Weekly calendar clicked:', date.toDateString());
                onDayClick && onDayClick(date);
              }}
            >
              {/* Day content */}
              <div className="text-sm font-semibold mb-1">
                {date.getDate()}
              </div>
              <div className={`text-xs font-bold mb-1 ${
                metrics.totalPnL > 0 ? 'text-green-400' : 
                metrics.totalPnL < 0 ? 'text-red-400' : 'text-gray-400'
              }`}>
                {metrics.totalPnL > 0 ? '+' : ''}${Math.abs(metrics.totalPnL).toFixed(0)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 5. CALENDAR USAGE WITH onDayClick PROP
{calendarViewMode === 'weekly' && (
  <WeeklyCalendarView 
    currentWeekStart={currentWeekStart}
    trades={trades}
    accounts={accounts}
    selectedAccountIds={selectedAccountIds}
    onDayClick={(date) => {
      console.log('Day clicked in weekly view:', date.toDateString());
      setSelectedDate(date);
      const dayData = getDayData(date, trades || []);
      console.log('Setting day data:', dayData);
      setSelectedDayData(dayData);
    }}
  />
)}

// 6. SECTION 1 WIDGETS THAT USE selectedDayData
// Widget 1: Day P&L vs Net Balance
{selectedDayData ? (
  <>
    <p className="widget-label">Day P&L ({selectedDayData.date.toLocaleDateString()})</p>
    <p className={`widget-value ${getValueColor(selectedDayData.dayPnL)}`}>
      {formatCurrency(selectedDayData.dayPnL)}
    </p>
    <p className="widget-description">Selected day profit/loss</p>
  </>
) : (
  <>
    <p className="widget-label">Net Balance</p>
    <p className={`widget-value ${getValueColor(calculateNetBalance())}`}>
      {formatCurrency(calculateNetBalance())}
    </p>
    <p className="widget-description">Starting balance + Total P&L</p>
  </>
)}

// Widget 2: Day Trades vs Total P&L
{selectedDayData ? (
  <>
    <p className="widget-label">Day Trades</p>
    <p className="widget-value text-white">
      {selectedDayData.totalDayTrades}
    </p>
    <p className="widget-description">W: {selectedDayData.wins} | L: {selectedDayData.losses}</p>
  </>
) : (
  <>
    <p className="widget-label">Total P&L</p>
    <p className={`widget-value ${getValueColor(combinedAnalytics?.totalPnl || 0)}`}>
      {formatCurrency(combinedAnalytics?.totalPnl || 0)}
    </p>
    <p className="widget-description">Net profit/loss</p>
  </>
)}

// Widget 3: Day Win Rate vs Win Rate
{selectedDayData ? (
  <>
    <p className="widget-label">Day Win Rate</p>
    <p className={`widget-value ${selectedDayData.winRate > 50 ? 'text-green-400' : selectedDayData.winRate < 50 ? 'text-red-400' : 'text-white'}`}>
      {Math.round(selectedDayData.winRate)}%
    </p>
    <p className="widget-description">Day performance rate</p>
  </>
) : (
  <>
    <p className="widget-label">Win Rate</p>
    <p className={`widget-value ${(combinedAnalytics?.winRate || 0) > 50 ? 'text-green-400' : (combinedAnalytics?.winRate || 0) < 50 ? 'text-red-400' : 'text-white'}`}>
      {formatPercentage(combinedAnalytics?.winRate || 0)}
    </p>
    <p className="widget-description">Winning trades percentage</p>
  </>
)}

// Widget 4: Day Risk vs Total Trades
{selectedDayData ? (
  <>
    <p className="widget-label">Day Risk</p>
    <p className="widget-value text-orange-400">
      {formatCurrency(selectedDayData.avgRiskPerTrade * selectedDayData.totalDayTrades)}
    </p>
    <p className="widget-description">Total risk taken</p>
  </>
) : (
  <>
    <p className="widget-label">Total Trades</p>
    <p className="widget-value text-white">
      {combinedAnalytics?.totalTrades || 0}
    </p>
    <p className="widget-description">All executed trades</p>
  </>
)}

// POTENTIAL ISSUES TO CHECK:
// 1. Are console logs appearing when you click calendar days?
// 2. Is selectedDate state being updated?
// 3. Is selectedDayData state being updated?
// 4. Is getTradesForDate function working correctly?
// 5. Are the widgets re-rendering when selectedDayData changes?
// 6. Is the selectedDate visual highlighting working (amber border)?

// DEBUGGING STEPS:
// 1. Open browser console (F12 → Console)
// 2. Click on a calendar day
// 3. Look for console messages: "Weekly calendar clicked: [date]" and "Setting day data: [object]"
// 4. Check if Section 1 widgets switch from showing account totals to showing day-specific data
// 5. Verify the clicked day gets amber border highlighting
