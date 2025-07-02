import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { formatCurrency, formatPercentage } from "@/lib/utils";
import type { Trade, Account } from "@shared/schema";

interface TradeAnalysisCalendarProps {
  trades: Trade[];
  accounts: Account[];
}

interface DayStats {
  date: string;
  trades: Trade[];
  totalPnl: number;
  winRate: number;
  tradeCount: number;
  isProfit: boolean;
}

export default function TradeAnalysisCalendar({ trades, accounts }: TradeAnalysisCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Group trades by date
  const dailyStats = useMemo(() => {
    const stats: { [key: string]: DayStats } = {};
    
    trades.forEach(trade => {
      const dateKey = trade.date;
      if (!stats[dateKey]) {
        stats[dateKey] = {
          date: dateKey,
          trades: [],
          totalPnl: 0,
          winRate: 0,
          tradeCount: 0,
          isProfit: false
        };
      }
      
      stats[dateKey].trades.push(trade);
      stats[dateKey].totalPnl += trade.pnl;
      stats[dateKey].tradeCount += 1;
    });

    // Calculate win rates
    Object.values(stats).forEach(day => {
      const winningTrades = day.trades.filter(t => t.pnl > 0).length;
      day.winRate = day.tradeCount > 0 ? (winningTrades / day.tradeCount) * 100 : 0;
      day.isProfit = day.totalPnl > 0;
    });

    return stats;
  }, [trades]);

  // Generate calendar days for the selected month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        const dateKey = currentDay.toISOString().split('T')[0];
        const dayStats = dailyStats[dateKey];
        const isCurrentMonth = currentDay.getMonth() === selectedMonth;
        
        days.push({
          date: new Date(currentDay),
          dateKey,
          dayStats,
          isCurrentMonth,
          dayNumber: currentDay.getDate()
        });
        
        currentDay.setDate(currentDay.getDate() + 1);
      }
    }
    
    return days;
  }, [selectedMonth, selectedYear, dailyStats]);

  // Monthly summary stats
  const monthlyStats = useMemo(() => {
    const monthTrades = trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      return tradeDate.getMonth() === selectedMonth && tradeDate.getFullYear() === selectedYear;
    });

    const totalPnl = monthTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const winningTrades = monthTrades.filter(t => t.pnl > 0).length;
    const winRate = monthTrades.length > 0 ? (winningTrades / monthTrades.length) * 100 : 0;
    const bestDay = Math.max(...Object.values(dailyStats).map(d => d.totalPnl), 0);
    const worstDay = Math.min(...Object.values(dailyStats).map(d => d.totalPnl), 0);

    return {
      totalPnl,
      winRate,
      totalTrades: monthTrades.length,
      bestDay,
      worstDay,
      tradingDays: Object.keys(dailyStats).filter(dateKey => {
        const date = new Date(dateKey);
        return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
      }).length
    };
  }, [trades, selectedMonth, selectedYear, dailyStats]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  const getCellColor = (dayStats: DayStats | undefined) => {
    if (!dayStats || dayStats.tradeCount === 0) return 'transparent';
    
    if (dayStats.isProfit) {
      if (dayStats.totalPnl > 1000) return 'bg-prop-green/80'; // Dark green for high profits
      if (dayStats.totalPnl > 500) return 'bg-prop-green/60';   // Medium green
      return 'bg-prop-green/40';                               // Light green
    } else {
      if (dayStats.totalPnl < -1000) return 'bg-prop-pink/80'; // Dark red for big losses
      if (dayStats.totalPnl < -500) return 'bg-prop-pink/60';  // Medium red
      return 'bg-prop-pink/40';                                // Light red
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <Card className="bg-dark-card border-prop-gold/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gradient-gold flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Trade Analysis Calendar
            </CardTitle>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="border-prop-gold/30 hover:border-prop-gold"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <h3 className="text-lg font-semibold text-white min-w-[180px] text-center">
                {months[selectedMonth]} {selectedYear}
              </h3>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
                className="border-prop-gold/30 hover:border-prop-gold"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Monthly Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-dark-card border-prop-tiffany/20">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-400">Monthly P&L</p>
            <p className={`text-lg font-bold ${monthlyStats.totalPnl >= 0 ? 'text-prop-green' : 'text-prop-pink'}`}>
              {formatCurrency(monthlyStats.totalPnl)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-dark-card border-prop-blue/20">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-400">Win Rate</p>
            <p className="text-lg font-bold text-prop-blue">
              {formatPercentage(monthlyStats.winRate)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-dark-card border-prop-gold/20">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-400">Total Trades</p>
            <p className="text-lg font-bold text-prop-gold">
              {monthlyStats.totalTrades}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-dark-card border-prop-green/20">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-400">Best Day</p>
            <p className="text-lg font-bold text-prop-green">
              {formatCurrency(monthlyStats.bestDay)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-dark-card border-prop-pink/20">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-400">Worst Day</p>
            <p className="text-lg font-bold text-prop-pink">
              {formatCurrency(monthlyStats.worstDay)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Grid */}
      <Card className="bg-dark-card border-prop-gold/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`
                  relative min-h-[80px] p-2 rounded-lg border transition-all duration-200 hover:scale-105
                  ${day.isCurrentMonth ? 'border-gray-600' : 'border-gray-800 opacity-30'}
                  ${getCellColor(day.dayStats)}
                  ${day.dayStats?.tradeCount ? 'cursor-pointer hover:border-prop-gold' : ''}
                `}
              >
                <div className="text-sm font-medium text-white mb-1">
                  {day.dayNumber}
                </div>
                
                {day.dayStats && day.dayStats.tradeCount > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-white">
                      {formatCurrency(day.dayStats.totalPnl)}
                    </div>
                    <div className="text-xs text-gray-300">
                      {day.dayStats.tradeCount} trade{day.dayStats.tradeCount !== 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-gray-300">
                      {formatPercentage(day.dayStats.winRate)}
                    </div>
                    <div className="absolute bottom-1 right-1">
                      {day.dayStats.isProfit ? (
                        <TrendingUp className="h-3 w-3 text-prop-green" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-prop-pink" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color Legend */}
      <Card className="bg-dark-card border-gray-600">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Performance Legend</h4>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-prop-green/40 border border-prop-green/60"></div>
              <span className="text-gray-300">Small Profit ($0-$500)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-prop-green/60 border border-prop-green/80"></div>
              <span className="text-gray-300">Medium Profit ($500-$1000)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-prop-green/80 border border-prop-green"></div>
              <span className="text-gray-300">Large Profit ($1000+)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-prop-pink/40 border border-prop-pink/60"></div>
              <span className="text-gray-300">Small Loss ($0-$500)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-prop-pink/60 border border-prop-pink/80"></div>
              <span className="text-gray-300">Medium Loss ($500-$1000)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-prop-pink/80 border border-prop-pink"></div>
              <span className="text-gray-300">Large Loss ($1000+)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}