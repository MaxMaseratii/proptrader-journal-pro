import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Trade } from "@shared/schema";

interface TradeCalendarProps {
  trades: Trade[];
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
}

export default function TradeCalendar({ trades, currentDate = new Date(), onDateChange }: TradeCalendarProps) {
  const { calendarData, monthName, year } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long' });
    
    // Get first day of month and days in month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

    // Group trades by date
    const tradesByDate = trades.reduce((acc, trade) => {
      const tradeDate = new Date(trade.date);
      if (tradeDate.getFullYear() === year && tradeDate.getMonth() === month) {
        const day = tradeDate.getDate();
        if (!acc[day]) {
          acc[day] = [];
        }
        acc[day].push(trade);
      }
      return acc;
    }, {} as Record<number, Trade[]>);

    // Create calendar grid
    const calendarGrid = [];
    const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - startingDayOfWeek + 1;
      const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;
      const dayTrades = isValidDay ? tradesByDate[dayNumber] || [] : [];
      
      const totalPnL = dayTrades.reduce((sum, trade) => sum + trade.pnl, 0);
      const tradeCount = dayTrades.length;
      
      calendarGrid.push({
        day: dayNumber,
        isValidDay,
        trades: dayTrades,
        totalPnL,
        tradeCount,
        isToday: isValidDay && 
          dayNumber === new Date().getDate() && 
          month === new Date().getMonth() && 
          year === new Date().getFullYear()
      });
    }

    return { 
      calendarData: calendarGrid, 
      monthName, 
      year 
    };
  }, [trades, currentDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    onDateChange?.(newDate);
  };

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-green-500';
    if (pnl < 0) return 'text-red-500';
    return 'text-gray-400';
  };

  const getBgColor = (pnl: number, hasAnyTrades: boolean) => {
    if (!hasAnyTrades) return 'bg-gray-900';
    if (pnl > 1000) return 'bg-green-800/40';
    if (pnl > 0) return 'bg-green-700/30';
    if (pnl < -1000) return 'bg-red-800/40';
    if (pnl < 0) return 'bg-red-700/30';
    return 'bg-gray-800/50';
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="bg-dark-card border-dark-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Trading Calendar
          </CardTitle>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold text-white min-w-[200px] text-center">
              {monthName} {year}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {/* Header row */}
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-xs font-medium text-gray-400 border-b border-gray-700">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarData.map((cell, index) => (
            <div
              key={index}
              className={`
                relative h-20 p-1 border border-gray-800 rounded-sm
                ${cell.isValidDay ? getBgColor(cell.totalPnL, cell.tradeCount > 0) : 'bg-gray-900/50'}
                ${cell.isToday ? 'ring-2 ring-blue-500' : ''}
                ${cell.isValidDay ? 'hover:bg-gray-700/50 cursor-pointer' : ''}
                transition-colors duration-200
              `}
            >
              {cell.isValidDay && (
                <>
                  <div className="text-xs text-gray-300 font-medium">
                    {cell.day}
                  </div>
                  {cell.tradeCount > 0 && (
                    <div className="mt-1 space-y-1">
                      <div className={`text-xs font-bold ${getPnLColor(cell.totalPnL)}`}>
                        {formatCurrency(cell.totalPnL)}
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="text-xs px-1 py-0 bg-gray-700 text-gray-300"
                      >
                        {cell.tradeCount} trade{cell.tradeCount !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-700/30 rounded-sm"></div>
            <span>Profitable Day</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-700/30 rounded-sm"></div>
            <span>Loss Day</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-800/40 rounded-sm"></div>
            <span>Big Win ($1K+)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-800/40 rounded-sm"></div>
            <span>Big Loss ($1K+)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}