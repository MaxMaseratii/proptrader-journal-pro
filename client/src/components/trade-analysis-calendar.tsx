import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, TrendingDown, Target, Clock } from 'lucide-react';
import { formatCurrency, formatPercentage } from "@/lib/utils";
import type { Trade, Account } from "@shared/schema";

interface TradeAnalysisCalendarProps {
  trades: Trade[];
  accounts: Account[];
  viewMode?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export default function TradeAnalysisCalendar({ trades, accounts, viewMode = 'monthly' }: TradeAnalysisCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [internalViewMode, setInternalViewMode] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>(viewMode);

  // Navigation functions
  const navigateTime = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (internalViewMode) {
      case 'daily':
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'weekly':
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'monthly':
        newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'yearly':
        newDate.setFullYear(currentDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const getDisplayTitle = () => {
    switch (internalViewMode) {
      case 'yearly':
        return `${currentDate.getFullYear()}`;
      case 'daily':
        return currentDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'weekly':
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `Week of ${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
      default:
        return currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
  };

  // Daily View Component
  const DailyView = () => {
    const dayTrades = trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      return tradeDate.toDateString() === currentDate.toDateString();
    });

    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <Card className="bg-dark-card border-prop-gold/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="text-center text-sm text-gray-400 mb-4">
              Daily Trading Hours View
            </div>
            
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {hours.map(hour => {
                const hourTrades = dayTrades.filter(trade => {
                  // For daily view, distribute trades evenly across trading hours (9-16)
                  const tradingHours = [9, 10, 11, 12, 13, 14, 15, 16];
                  const tradeIndex = dayTrades.indexOf(trade);
                  const assignedHour = tradingHours[tradeIndex % tradingHours.length];
                  return hour === assignedHour;
                });
                
                const hourPnl = hourTrades.reduce((sum, trade) => sum + trade.pnl, 0);
                
                return (
                  <div
                    key={hour}
                    className={`
                      relative min-h-[60px] p-2 rounded-lg border transition-all duration-200
                      ${hourTrades.length > 0 
                        ? hourPnl >= 0 
                          ? 'bg-prop-green/20 border-prop-green/50' 
                          : 'bg-prop-pink/20 border-prop-pink/50'
                        : 'border-gray-600 bg-gray-800/30'
                      }
                      ${hourTrades.length > 0 ? 'cursor-pointer hover:scale-105' : ''}
                    `}
                  >
                    <div className="text-xs font-medium text-white mb-1">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    
                    {hourTrades.length > 0 && (
                      <div className="space-y-1">
                        <div className={`text-xs font-bold ${
                          hourPnl >= 0 ? 'text-prop-green' : 'text-prop-pink'
                        }`}>
                          {formatCurrency(hourPnl)}
                        </div>
                        <div className="text-xs text-gray-300">
                          {hourTrades.length} trade{hourTrades.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {dayTrades.length > 0 && (
              <div className="mt-4 p-4 bg-dark-surface rounded-lg">
                <h4 className="text-sm font-bold text-white mb-2">Today's Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-400">Total P&L</p>
                    <p className={`text-sm font-bold ${dayTrades.reduce((sum, t) => sum + t.pnl, 0) >= 0 ? 'text-prop-green' : 'text-prop-pink'}`}>
                      {formatCurrency(dayTrades.reduce((sum, t) => sum + t.pnl, 0))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Trades</p>
                    <p className="text-sm font-bold text-white">{dayTrades.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Win Rate</p>
                    <p className="text-sm font-bold text-prop-blue">
                      {dayTrades.length > 0 ? formatPercentage(dayTrades.filter(t => t.pnl > 0).length / dayTrades.length) : '0%'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Weekly View Component
  const WeeklyView = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      return day;
    });

    return (
      <Card className="bg-dark-card border-prop-gold/20">
        <CardContent className="p-6">
          <div className="text-center text-sm text-gray-400 mb-4">
            Weekly Trading View
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => {
              const dayTrades = trades.filter(trade => {
                const tradeDate = new Date(trade.date);
                return tradeDate.toDateString() === day.toDateString();
              });
              
              const dayPnl = dayTrades.reduce((sum, trade) => sum + trade.pnl, 0);
              
              return (
                <div
                  key={index}
                  className={`
                    relative min-h-[120px] p-3 rounded-lg border transition-all duration-200
                    ${dayTrades.length > 0 
                      ? dayPnl >= 0 
                        ? 'bg-prop-green/20 border-prop-green/50' 
                        : 'bg-prop-pink/20 border-prop-pink/50'
                      : 'border-gray-600 bg-gray-800/30'
                    }
                    ${dayTrades.length > 0 ? 'cursor-pointer hover:scale-105' : ''}
                  `}
                >
                  <div className="text-sm font-medium text-white mb-2">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-xs text-gray-300 mb-2">
                    {day.getDate()}
                  </div>
                  
                  {dayTrades.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white">
                        {formatCurrency(dayPnl)}
                      </div>
                      <div className="text-xs text-gray-300">
                        {dayTrades.length} trade{dayTrades.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-prop-blue">
                        WR: {formatPercentage(dayTrades.filter(t => t.pnl > 0).length / dayTrades.length)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Monthly View Component (existing calendar grid)
  const MonthlyView = () => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
    
    const calendarDays = [];
    const currentCalendarDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dayTrades = trades.filter(trade => {
        const tradeDate = new Date(trade.date);
        return tradeDate.toDateString() === currentCalendarDate.toDateString();
      });
      
      const dayPnl = dayTrades.reduce((sum, trade) => sum + trade.pnl, 0);
      
      calendarDays.push({
        date: new Date(currentCalendarDate),
        dayNumber: currentCalendarDate.getDate(),
        isCurrentMonth: currentCalendarDate.getMonth() === currentDate.getMonth(),
        trades: dayTrades,
        pnl: dayPnl,
        tradeCount: dayTrades.length
      });
      
      currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
    }

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
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
                  ${day.tradeCount > 0 
                    ? day.pnl >= 0 
                      ? 'bg-prop-green/20 border-prop-green/50' 
                      : 'bg-prop-pink/20 border-prop-pink/50'
                    : 'bg-gray-800/30'
                  }
                  ${day.tradeCount > 0 ? 'cursor-pointer hover:border-prop-gold' : ''}
                `}
              >
                <div className="text-sm font-medium text-white mb-1">
                  {day.dayNumber}
                </div>
                
                {day.tradeCount > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-white">
                      {formatCurrency(day.pnl)}
                    </div>
                    <div className="text-xs text-gray-300">
                      {day.tradeCount} trade{day.tradeCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Yearly View Component
  const YearlyView = () => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return (
      <Card className="bg-dark-card border-prop-gold/20">
        <CardContent className="p-6">
          <div className="text-center text-sm text-gray-400 mb-4">
            Yearly Trading Overview
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {months.map((month, index) => {
              const monthTrades = trades.filter(trade => {
                const tradeDate = new Date(trade.date);
                return tradeDate.getFullYear() === currentDate.getFullYear() && 
                       tradeDate.getMonth() === index;
              });
              
              const monthPnl = monthTrades.reduce((sum, trade) => sum + trade.pnl, 0);
              
              return (
                <div
                  key={month}
                  className={`
                    relative min-h-[100px] p-4 rounded-lg border transition-all duration-200
                    ${monthTrades.length > 0 
                      ? monthPnl >= 0 
                        ? 'bg-prop-green/20 border-prop-green/50' 
                        : 'bg-prop-pink/20 border-prop-pink/50'
                      : 'border-gray-600 bg-gray-800/30'
                    }
                    ${monthTrades.length > 0 ? 'cursor-pointer hover:scale-105' : ''}
                  `}
                >
                  <div className="text-sm font-medium text-white mb-2">
                    {month}
                  </div>
                  
                  {monthTrades.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-white">
                        {formatCurrency(monthPnl)}
                      </div>
                      <div className="text-xs text-gray-300">
                        {monthTrades.length} trades
                      </div>
                      <div className="text-xs text-prop-blue">
                        WR: {formatPercentage(monthTrades.filter(t => t.pnl > 0).length / monthTrades.length)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render appropriate view based on mode
  const renderView = () => {
    switch (internalViewMode) {
      case 'daily':
        return <DailyView />;
      case 'weekly':
        return <WeeklyView />;
      case 'yearly':
        return <YearlyView />;
      default:
        return <MonthlyView />;
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
              {/* View Mode Selector */}
              <Select value={internalViewMode} onValueChange={(value: any) => setInternalViewMode(value)}>
                <SelectTrigger className="w-28 border-prop-gold/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateTime('prev')}
                className="border-prop-gold/30 hover:border-prop-gold"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <h3 className="text-lg font-semibold text-white min-w-[180px] text-center">
                {getDisplayTitle()}
              </h3>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateTime('next')}
                className="border-prop-gold/30 hover:border-prop-gold"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* View Content */}
      {renderView()}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-dark-card border-prop-tiffany/20">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-400">Total Trades</p>
            <p className="text-lg font-bold text-prop-gold">
              {trades.length}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-dark-card border-prop-blue/20">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-400">Win Rate</p>
            <p className="text-lg font-bold text-prop-blue">
              {trades.length > 0 ? formatPercentage(trades.filter(t => t.pnl > 0).length / trades.length) : '0%'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-dark-card border-prop-green/20">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-400">Total P&L</p>
            <p className={`text-lg font-bold ${trades.reduce((sum, t) => sum + t.pnl, 0) >= 0 ? 'text-prop-green' : 'text-prop-pink'}`}>
              {formatCurrency(trades.reduce((sum, t) => sum + t.pnl, 0))}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-dark-card border-prop-pink/20">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-400">Best Trade</p>
            <p className="text-lg font-bold text-prop-green">
              {trades.length > 0 ? formatCurrency(Math.max(...trades.map(t => t.pnl))) : formatCurrency(0)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}