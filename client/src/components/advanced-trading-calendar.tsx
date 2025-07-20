import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield, 
  BarChart3, 
  Calendar, 
  Eye, 
  EyeOff, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface AdvancedTradingCalendarProps {
  trades?: any[];
  selectedAccount?: any;
  className?: string;
}

export function AdvancedTradingCalendar({ trades = [], selectedAccount, className }: AdvancedTradingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentPeriod, setCurrentPeriod] = useState(new Date());
  const [viewMode, setViewMode] = useState('weekly'); // weekly, monthly, yearly
  const [hoveredMetric, setHoveredMetric] = useState(null);
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);

  // Generate trading data from actual trades only - no fallback data
  const generateTradingData = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Filter trades for this specific date
    const dayTrades = trades.filter(trade => {
      const tradeDate = new Date(trade.date).toISOString().split('T')[0];
      return tradeDate === dateStr;
    });
    
    // Only use actual trade data - no fallback
    if (dayTrades.length > 0) {
      const dayPnL = dayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
      const totalDayTrades = dayTrades.length;
      const winningTrades = dayTrades.filter(trade => (trade.pnl || 0) > 0).length;
      const winRate = totalDayTrades > 0 ? (winningTrades / totalDayTrades) * 100 : 0;
      
      return {
        date,
        dayPnL,
        totalDayTrades,
        winRate: Math.round(winRate),
        disciplineScore: winRate >= 60 ? 85 : winRate >= 40 ? 70 : 55, // Basic discipline calculation
        hasData: true
      };
    } else {
      // Return empty data for dates without trades
      return {
        date,
        dayPnL: 0,
        totalDayTrades: 0,
        winRate: 0,
        disciplineScore: 0,
        hasData: false
      };
    }
  };

  // Helper function to convert discipline score to letter grade
  const getDisciplineGrade = (score: number) => {
    if (score >= 90) return { grade: 'A', color: 'text-green-400' };
    if (score >= 80) return { grade: 'B', color: 'text-green-400' };
    if (score >= 70) return { grade: 'C', color: 'text-yellow-400' };
    if (score >= 60) return { grade: 'D', color: 'text-orange-400' };
    return { grade: 'F', color: 'text-red-400' };
  };

  // Calendar helper functions
  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const weekDay = new Date(startOfWeek);
      weekDay.setDate(startOfWeek.getDate() + i);
      week.push(weekDay);
    }
    return week;
  };

  const getMonthWeeks = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const weeks = [];
    
    let currentWeek = getWeekDays(firstDay);
    while (currentWeek[0] <= lastDay) {
      weeks.push(currentWeek);
      const nextWeek = new Date(currentWeek[0]);
      nextWeek.setDate(nextWeek.getDate() + 7);
      currentWeek = getWeekDays(nextWeek);
    }
    return weeks;
  };

  const getYearMonths = (date: Date) => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      months.push(new Date(date.getFullYear(), i, 1));
    }
    return months;
  };

  // Calculate current period summary for the header
  const getCurrentPeriodSummary = () => {
    let days: Date[] = [];
    
    switch (viewMode) {
      case 'weekly':
        days = getWeekDays(currentPeriod);
        break;
      case 'monthly':
        const monthDays = new Date(currentPeriod.getFullYear(), currentPeriod.getMonth() + 1, 0).getDate();
        days = Array.from({length: monthDays}, (_, i) => 
          new Date(currentPeriod.getFullYear(), currentPeriod.getMonth(), i + 1)
        );
        break;
      case 'yearly':
        days = [];
        for (let month = 0; month < 12; month++) {
          const monthDays = new Date(currentPeriod.getFullYear(), month + 1, 0).getDate();
          for (let day = 1; day <= monthDays; day++) {
            days.push(new Date(currentPeriod.getFullYear(), month, day));
          }
        }
        break;
    }

    let totalPnL = 0;
    let totalTrades = 0;
    let totalWins = 0;
    let avgDiscipline = 0;

    let daysWithData = 0;
    days.forEach(day => {
      const dayData = generateTradingData(day);
      if (dayData.hasData) {
        totalPnL += dayData.dayPnL;
        totalTrades += dayData.totalDayTrades;
        totalWins += (dayData.winRate / 100) * dayData.totalDayTrades;
        avgDiscipline += dayData.disciplineScore;
        daysWithData++;
      }
    });

    const winRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;
    avgDiscipline = daysWithData > 0 ? avgDiscipline / daysWithData : 0;

    return {
      totalPnL,
      totalTrades,
      winRate,
      avgDiscipline,
      periodLabel: viewMode.charAt(0).toUpperCase() + viewMode.slice(1)
    };
  };

  const periodSummary = getCurrentPeriodSummary();
  const selectedDayData = generateTradingData(selectedDate);
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const formatPeriod = (date: Date, mode: string) => {
    switch (mode) {
      case 'weekly':
        const weekStart = getWeekDays(date)[0];
        const weekEnd = getWeekDays(date)[6];
        if (weekStart.getMonth() === weekEnd.getMonth()) {
          return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
        }
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${weekStart.getFullYear()}`;
      case 'monthly':
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'yearly':
        return date.getFullYear().toString();
      default:
        return '';
    }
  };

  const navigatePeriod = (direction: number) => {
    const newPeriod = new Date(currentPeriod);
    switch (viewMode) {
      case 'weekly':
        newPeriod.setDate(newPeriod.getDate() + (direction * 7));
        break;
      case 'monthly':
        newPeriod.setMonth(newPeriod.getMonth() + direction);
        break;
      case 'yearly':
        newPeriod.setFullYear(newPeriod.getFullYear() + direction);
        break;
    }
    setCurrentPeriod(newPeriod);
  };

  const switchViewMode = (mode: string) => {
    setViewMode(mode);
    setShowPeriodPicker(false);
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  interface DayCardProps {
    dayData: any;
    isSelected: boolean;
    isCurrentPeriod: boolean;
    onClick: (date: Date) => void;
    size?: string;
  }

  const DayCard = ({ dayData, isSelected, isCurrentPeriod, onClick, size = 'normal' }: DayCardProps) => {
    const { date, dayPnL, totalDayTrades, disciplineScore, hasData } = dayData;
    const pnlPositive = dayPnL >= 0;
    const isToday = date.toDateString() === new Date().toDateString();
    const disciplineGrade = getDisciplineGrade(disciplineScore);
    
    return (
      <div
        onClick={() => onClick(date)}
        className={`
          relative p-3 rounded-md border transition-all duration-200 cursor-pointer h-24 min-w-0
          ${isSelected 
            ? 'border-amber-400 bg-gradient-to-br from-amber-900/40 via-amber-800/30 to-amber-900/40 shadow-md' 
            : isToday
            ? 'border-teal-400/60 bg-gradient-to-br from-teal-900/30 via-gray-800/40 to-teal-900/30'
            : isCurrentPeriod
            ? 'border-gray-600/40 bg-gradient-to-br from-gray-800/40 via-gray-700/40 to-gray-800/40 hover:border-gray-500 hover:bg-gray-700/50'
            : 'border-gray-700/30 bg-gradient-to-br from-gray-900/30 via-gray-800/30 to-gray-900/30 opacity-60'
          }
        `}
      >
        {/* Today indicator */}
        {isToday && (
          <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
        )}
        
        <div className="flex flex-col h-full justify-between">
          {/* Date */}
          <div className={`text-sm font-semibold ${
            isSelected ? 'text-amber-400' : 
            isToday ? 'text-teal-400' : 
            isCurrentPeriod ? 'text-gray-200' : 'text-gray-500'
          }`}>
            {date.getDate()}
          </div>
          
          {/* P&L */}
          {hasData ? (
            <>
              <div className={`text-xs font-bold ${pnlPositive ? 'text-green-400' : 'text-red-400'}`}>
                {pnlPositive ? '+' : ''}${Math.abs(dayPnL).toFixed(0)}
              </div>
              
              {/* Bottom metrics */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">{totalDayTrades}T</span>
                <span className={`text-xs font-medium ${disciplineGrade.color}`}>
                  {disciplineScore}%
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="text-xs text-gray-600">
                No trades
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">-</span>
                <span className="text-gray-600">-</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const CalendarView = () => {
    switch (viewMode) {
      case 'weekly':
        return (
          <div className="space-y-2">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Week Days */}
            <div className="grid grid-cols-7 gap-1">
              {getWeekDays(currentPeriod).map((day, index) => (
                <DayCard
                  key={day.toISOString()}
                  dayData={generateTradingData(day)}
                  isSelected={day.toDateString() === selectedDate.toDateString()}
                  isCurrentPeriod={true}
                  onClick={setSelectedDate}
                />
              ))}
            </div>
          </div>
        );
      
      case 'monthly':
        return (
          <div className="space-y-2">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Month Grid */}
            <div className="space-y-1">
              {getMonthWeeks(currentPeriod).map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-1">
                  {week.map((day, dayIndex) => (
                    <DayCard
                      key={day.toISOString()}
                      dayData={generateTradingData(day)}
                      isSelected={day.toDateString() === selectedDate.toDateString()}
                      isCurrentPeriod={day.getMonth() === currentPeriod.getMonth()}
                      onClick={setSelectedDate}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'yearly':
        return (
          <div className="space-y-3">
            {/* Year Grid - 4x3 months */}
            <div className="grid grid-cols-3 gap-4">
              {getYearMonths(currentPeriod).map((month, monthIndex) => {
                const monthData = generateTradingData(month);
                const isCurrentMonth = month.getMonth() === new Date().getMonth() && 
                                     month.getFullYear() === new Date().getFullYear();
                const isSelectedMonth = month.getMonth() === selectedDate.getMonth() && 
                                      month.getFullYear() === selectedDate.getFullYear();
                
                return (
                  <div
                    key={monthIndex}
                    onClick={() => {
                      setSelectedDate(new Date(month.getFullYear(), month.getMonth(), 1));
                      setCurrentPeriod(month);
                      setViewMode('monthly');
                    }}
                    className={`
                      relative bg-gray-800/50 rounded-lg p-4 cursor-pointer transition-all duration-200 min-h-[120px]
                      ${isCurrentMonth ? 'ring-2 ring-teal-400 bg-teal-950/30' : ''}
                      ${isSelectedMonth ? 'ring-2 ring-amber-400 bg-amber-950/30' : ''}
                      hover:bg-gray-700/50 border border-gray-700/30
                    `}
                  >
                    {/* Month Name */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-bold ${isCurrentMonth ? 'text-teal-400' : 'text-white'}`}>
                        {month.toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      {isCurrentMonth && <div className="w-2 h-2 rounded-full bg-teal-400" />}
                    </div>
                    
                    {/* Month P&L */}
                    <div className="text-xs font-medium text-green-400 mb-1">
                      +${Math.round(monthData.dayPnL * 20)} {/* Monthly estimate */}
                    </div>
                    
                    {/* Month Stats */}
                    <div className="text-xs text-gray-400 space-y-1">
                      <div>{Math.round(monthData.totalDayTrades * 20)}T</div>
                      <div className="text-emerald-400">{monthData.winRate}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-lg p-6 backdrop-blur-sm ${className}`}>

      {/* NAVIGATION AND CONTROLS */}
      <div className="flex justify-between items-center mb-6">
        {/* View Mode Tabs */}
        <div className="flex bg-gray-800/50 rounded-lg p-1 border border-gray-700/50">
          {['weekly', 'monthly', 'yearly'].map((mode) => (
            <button
              key={mode}
              onClick={() => switchViewMode(mode)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                viewMode === mode
                  ? 'bg-amber-500 text-black'
                  : 'text-gray-400 hover:text-amber-400 hover:bg-gray-700/50'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Period Navigation */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigatePeriod(-1)}
            className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-amber-400 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="text-lg font-medium text-amber-400 min-w-48 text-center">
            {formatPeriod(currentPeriod, viewMode)}
          </span>
          
          <button
            onClick={() => navigatePeriod(1)}
            className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-amber-400 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        {/* Today Button */}
        <button
          onClick={() => {
            setCurrentPeriod(new Date());
            setSelectedDate(new Date());
          }}
          className="px-4 py-2 rounded-lg bg-teal-600/50 hover:bg-teal-600/70 text-teal-400 hover:text-teal-300 transition-all text-sm font-medium"
        >
          Go to Today
        </button>
      </div>
      
      {/* Calendar Component */}
      <CalendarView />
      
      {/* Selected Day Summary */}
      {selectedDate && (
        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
              {isToday && <div className="w-2 h-2 rounded-full bg-teal-400" />}
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className={`font-bold ${selectedDayData.dayPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {selectedDayData.dayPnL >= 0 ? '+' : ''}${selectedDayData.dayPnL.toFixed(0)} P&L
              </span>
              <span className="text-gray-400">{selectedDayData.totalDayTrades} Trades</span>
              <span className="text-gray-400">{selectedDayData.winRate}% Win Rate</span>
              <span className={`${getDisciplineGrade(selectedDayData.disciplineScore).color}`}>
                {selectedDayData.disciplineScore}% Discipline
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}