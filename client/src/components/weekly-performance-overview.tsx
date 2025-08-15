import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface WeeklyPerformanceOverviewProps {
  trades?: any[];
  selectedAccount?: any;
  className?: string;
}

export function WeeklyPerformanceOverview({ trades = [], selectedAccount, className }: WeeklyPerformanceOverviewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Start from Monday
    const start = new Date(today);
    start.setDate(today.getDate() - daysToSubtract);
    return start;
  });

  // Get week dates (Monday to Sunday)
  const currentWeek = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + i);
    currentWeek.push(date);
  }

  // Calculate weekly performance
  const weeklyData = currentWeek.map((date, index) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayTrades = trades.filter(trade => trade.date === dateStr);
    const dayPnL = dayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    
    return {
      day: dayNames[index],
      date: date.getDate(),
      pnl: dayPnL,
      trades: dayTrades.length,
      isToday: dateStr === today.toISOString().split('T')[0],
      isFuture: date > today,
      isWeekend: index >= 5 // Saturday and Sunday
    };
  });

  const weeklyPnL = weeklyData.reduce((sum, day) => sum + day.pnl, 0);
  const weeklyTrades = weeklyData.reduce((sum, day) => sum + day.trades, 0);
  const profitableDays = weeklyData.filter(day => day.pnl > 0).length;

  const formatWeekRange = () => {
    const start = currentWeek[0];
    const end = currentWeek[6];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (start.getMonth() === end.getMonth()) {
      return `${monthNames[start.getMonth()]} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
    } else {
      return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newStart);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-lg p-4 backdrop-blur-sm">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-yellow-400" />
          <h3 className="text-sm font-semibold text-white">Weekly Risk & Performance</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateWeek('prev')}
            className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span className="text-xs text-gray-300 min-w-[120px] text-center">
            {formatWeekRange()}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateWeek('next')}
            className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Week Summary Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-gray-800/40 rounded">
          <div className={cn(
            "text-lg font-bold",
            weeklyPnL >= 0 ? "text-green-500" : "text-red-500"
          )}>
            {weeklyPnL >= 0 ? '+' : ''}${weeklyPnL.toFixed(0)}
          </div>
          <div className="text-xs text-gray-400">Week P&L</div>
        </div>
        <div className="text-center p-2 bg-gray-800/40 rounded">
          <div className="text-lg font-bold text-white">{weeklyTrades}</div>
          <div className="text-xs text-gray-400">Trades</div>
        </div>
        <div className="text-center p-2 bg-gray-800/40 rounded">
          <div className="text-lg font-bold text-blue-400">{profitableDays}/7</div>
          <div className="text-xs text-gray-400">Win Days</div>
        </div>
      </div>

      {/* Simplified Daily Grid */}
      <div className="grid grid-cols-7 gap-1">
        {weeklyData.map((day, index) => (
          <div
            key={index}
            className={cn(
              "text-center p-2 rounded border transition-all duration-200",
              day.isToday 
                ? "border-yellow-400 bg-yellow-900/20" 
                : day.isFuture 
                ? "border-gray-600 bg-gray-800/10" 
                : day.isWeekend
                ? "border-gray-600 bg-gray-800/20"
                : "border-gray-700 bg-gray-800/30",
              !day.isFuture && day.pnl !== 0 && (day.pnl > 0 ? "border-green-500/50" : "border-red-500/50")
            )}
          >
            <div className="text-xs font-medium text-gray-300">{day.day}</div>
            <div className="text-xs text-gray-500 mb-1">{day.date}</div>
            {!day.isFuture ? (
              <div className={cn(
                "text-xs font-bold",
                day.pnl > 0 ? "text-green-500" : day.pnl < 0 ? "text-red-500" : "text-gray-400"
              )}>
                {day.pnl === 0 ? '—' : (day.pnl > 0 ? '+' : '') + day.pnl.toFixed(0)}
              </div>
            ) : (
              <div className="text-xs text-gray-600">—</div>
            )}
          </div>
        ))}
      </div>

      {/* Performance Indicator */}
      <div className="flex items-center justify-center mt-4 p-2 bg-gray-800/30 rounded">
        <div className="flex items-center gap-2">
          {weeklyPnL >= 0 ? (
            <TrendingUp className="w-3 h-3 text-green-500" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-500" />
          )}
          <span className="text-xs text-gray-300">
            {profitableDays > 3 ? 'Strong Week' : profitableDays > 1 ? 'Mixed Week' : 'Challenging Week'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default WeeklyPerformanceOverview;