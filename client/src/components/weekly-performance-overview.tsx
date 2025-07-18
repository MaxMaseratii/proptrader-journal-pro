import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklyPerformanceOverviewProps {
  trades?: any[];
  selectedAccount?: any;
  className?: string;
}

export function WeeklyPerformanceOverview({ trades = [], selectedAccount, className }: WeeklyPerformanceOverviewProps) {
  // Get current week dates
  const today = new Date();
  const currentWeek = [];
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    currentWeek.push(date);
  }

  // Calculate weekly performance
  const weeklyData = currentWeek.map(date => {
    const dateStr = date.toISOString().split('T')[0];
    const dayTrades = trades.filter(trade => trade.date === dateStr);
    const dayPnL = dayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return {
      day: dayNames[date.getDay()],
      date: date.getDate(),
      pnl: dayPnL,
      trades: dayTrades.length,
      isToday: dateStr === today.toISOString().split('T')[0],
      isFuture: date > today
    };
  });

  const weeklyPnL = weeklyData.reduce((sum, day) => sum + day.pnl, 0);
  const weeklyTrades = weeklyData.reduce((sum, day) => sum + day.trades, 0);
  const profitableDays = weeklyData.filter(day => day.pnl > 0).length;

  return (
    <Card className={cn("bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Weekly Performance Overview
          </div>
          <Badge variant={weeklyPnL >= 0 ? "default" : "destructive"}>
            {weeklyPnL >= 0 ? '+' : ''}${weeklyPnL.toFixed(2)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weekly Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-gray-800/30 rounded">
            <div className={cn(
              "text-lg font-bold",
              weeklyPnL >= 0 ? "text-green-400" : "text-red-400"
            )}>
              {weeklyPnL >= 0 ? '+' : ''}${weeklyPnL.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400">Week P&L</div>
          </div>
          <div className="text-center p-2 bg-gray-800/30 rounded">
            <div className="text-lg font-bold text-white">{weeklyTrades}</div>
            <div className="text-xs text-gray-400">Total Trades</div>
          </div>
          <div className="text-center p-2 bg-gray-800/30 rounded">
            <div className="text-lg font-bold text-blue-400">{profitableDays}</div>
            <div className="text-xs text-gray-400">Profit Days</div>
          </div>
        </div>

        {/* Daily Breakdown */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-300 mb-2">Daily P&L Breakdown</div>
          <div className="grid grid-cols-7 gap-1">
            {weeklyData.map((day, index) => (
              <div
                key={index}
                className={cn(
                  "text-center p-2 rounded-lg border transition-all",
                  day.isToday 
                    ? "border-blue-400 bg-blue-900/30" 
                    : day.isFuture 
                    ? "border-gray-600 bg-gray-800/20" 
                    : "border-gray-700 bg-gray-800/30",
                  day.pnl > 0 ? "bg-green-900/20" : day.pnl < 0 ? "bg-red-900/20" : ""
                )}
              >
                <div className="text-xs font-medium text-gray-300">{day.day}</div>
                <div className="text-xs text-gray-400">{day.date}</div>
                {!day.isFuture && (
                  <>
                    <div className={cn(
                      "text-sm font-bold mt-1",
                      day.pnl > 0 ? "text-green-400" : day.pnl < 0 ? "text-red-400" : "text-gray-400"
                    )}>
                      {day.pnl === 0 ? '-' : (day.pnl > 0 ? '+' : '') + day.pnl.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-500">{day.trades}T</div>
                  </>
                )}
                {day.isFuture && (
                  <div className="text-xs text-gray-500 mt-1">-</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Week Progress */}
        <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg">
          <div className="flex items-center gap-2">
            {weeklyPnL >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className="text-sm text-gray-300">
              {profitableDays}/7 profitable days
            </span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">{weeklyTrades} trades</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default WeeklyPerformanceOverview;