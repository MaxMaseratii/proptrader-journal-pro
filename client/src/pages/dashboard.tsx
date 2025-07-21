import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EquityChart, MonthlyPerformanceChart } from "@/components/chart-components";
import { formatCurrency, formatPercentage, formatDate } from "@/lib/utils";
import { calculateDisciplinedScore, getScoreColor, getGradeColor } from "@/lib/disciplined-score";
import { calculateComprehensiveDisciplineMetrics } from "@/lib/discipline-calculator";
import DailyPlanningWidget from "@/components/daily-planning-widget";
import WeeklyPerformanceOverview from "@/components/weekly-performance-overview";

// Color coding utility function
const getValueColor = (value: number, type: 'currency' | 'percentage' | 'neutral' = 'currency') => {
  if (type === 'neutral') return 'text-white';
  if (value > 0) return 'text-green-400';
  if (value < 0) return 'text-red-400';
  return 'text-white'; // zero/neutral
};
import TradeCalendar from "@/components/trade-calendar";
import TradeEntry from "@/components/trade-entry";
import TradeAnalysisCalendar from "@/components/trade-analysis-calendar";
import { SimpleChart } from "@/components/tradingview/SimpleChart";
import { 
  Wallet, 
  TrendingDown, 
  TrendingUp,
  Target, 
  Shield, 
  Plus, 
  Bell,
  AlertTriangle,
  DollarSign,
  Activity,
  Crosshair,
  Filter,
  Brain,
  BarChart3,
  Calendar,
  Banknote,
  Clock,
  CheckCircle,
  Users,
  CreditCard,
  X,
  Trophy,
  Star,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  LineChart
} from "lucide-react";
import type { Account, Trade } from "@shared/schema";

// Calendar View Components
interface CalendarViewProps {
  trades?: Trade[];
  accounts?: Account[];
  selectedAccountIds: number[];
}

interface WeeklyCalendarViewProps extends CalendarViewProps {
  currentWeekStart: Date;
}

interface MonthlyCalendarViewProps extends CalendarViewProps {
  currentMonth: Date;
}

interface YearlyCalendarViewProps extends CalendarViewProps {
  currentYear: Date;
}

// Helper function to get trades for a specific date
const getTradesForDate = (date: Date, trades: Trade[] = [], selectedAccountIds: number[]) => {
  const dateStr = date.toISOString().split('T')[0];
  return trades.filter(trade => {
    const matchesDate = trade.date === dateStr;
    const matchesAccount = selectedAccountIds.length === 0 || selectedAccountIds.includes(trade.accountId);
    return matchesDate && matchesAccount;
  });
};

// Helper function to calculate daily P&L and metrics
const getDayMetrics = (date: Date, trades: Trade[] = [], selectedAccountIds: number[]) => {
  const dayTrades = getTradesForDate(date, trades, selectedAccountIds);
  const totalPnL = dayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const totalTrades = dayTrades.length;
  const winningTrades = dayTrades.filter(trade => (trade.pnl || 0) > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  
  return {
    totalPnL,
    totalTrades,
    winningTrades,
    losingTrades: totalTrades - winningTrades,
    winRate,
    trades: dayTrades
  };
};



interface DashboardAnalytics {
  account: Account;
  totalPnl: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  bestTrade: number;
  worstTrade: number;
  currentBalance: number;
  drawdown: number;
  profitTarget: number;
  dailyLossLimit: number;
  riskLimitUsed: number;
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  
  // ===== FIXED STATE MANAGEMENT =====
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarViewMode, setCalendarViewMode] = useState('weekly');
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Start week on Monday (European/business calendar format)
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const start = new Date(today);
    start.setDate(today.getDate() - daysToSubtract);
    return start;
  });

  // FIXED: Add missing clearDaySelection function
  const clearDaySelection = () => {
    console.log('🗑️ Clearing day selection');
    setSelectedDate(new Date()); // Reset to today
  };

  // FIXED: Enhanced handleDayClick with better debugging
  const handleDayClick = useCallback((clickedDate: Date) => {
    console.log('🖱️ Day clicked:', clickedDate.toDateString());
    console.log('🔄 Current selectedDate:', selectedDate.toDateString());
    console.log('🔄 Setting new selectedDate...');
    
    // Force a new Date object to ensure React detects the change
    const newDate = new Date(clickedDate.getTime());
    setSelectedDate(newDate);
    
    // Debug: Verify state update
    setTimeout(() => {
      console.log('✅ State updated. New selectedDate should be:', newDate.toDateString());
    }, 100);
  }, [selectedDate]);
  

  
  // Calendar View Components (defined within Dashboard scope)
  const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({ currentWeekStart, trades, accounts, selectedAccountIds }) => {
    const weekDays = [];
    const today = new Date();
    
    // Generate 7 days starting from currentWeekStart
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      weekDays.push(date);
    }

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <div className="bg-gray-800/40 rounded-lg border border-gray-600/30 p-4">
        {/* Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map(dayName => (
            <div key={dayName} className="text-center text-sm font-semibold text-gray-300 py-2">
              {dayName}
            </div>
          ))}
        </div>
        
        {/* Week Days */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(date => {
            const metrics = getDayMetrics(date, trades, selectedAccountIds);
            const isToday = date.toDateString() === today.toDateString();
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            const isCurrentMonth = date.getMonth() === currentWeekStart.getMonth();
            
            return (
              <div
                key={date.toISOString()}
                className={`
                  relative p-3 rounded-lg border transition-all duration-200 h-24 cursor-pointer
                  ${isSelected
                    ? 'border-amber-400 bg-amber-900/20 shadow-lg ring-2 ring-amber-400/50'
                    : isToday 
                    ? 'border-teal-400/60 bg-gradient-to-br from-teal-900/30 via-gray-800/40 to-teal-900/30' 
                    : isCurrentMonth
                    ? 'border-gray-600/40 bg-gradient-to-br from-gray-800/40 via-gray-700/40 to-gray-800/40'
                    : 'border-gray-700/30 bg-gradient-to-br from-gray-900/30 via-gray-800/30 to-gray-900/30 opacity-60'
                  }
                  hover:border-amber-400/60 hover:scale-105
                `}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('📅 Weekly calendar day clicked:', date.toDateString());
                  handleDayClick(date);
                }}
                style={{ zIndex: 10 }}
              >
                {/* Today indicator */}
                {isToday && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                )}
                
                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-amber-400" />
                )}
                
                {/* Date */}
                <div className={`text-sm font-semibold mb-1 ${
                  isSelected ? 'text-amber-400' :
                  isToday ? 'text-teal-400' : 
                  isCurrentMonth ? 'text-gray-200' : 'text-gray-500'
                }`}>
                  {date.getDate()}
                </div>
                
                {/* P&L */}
                <div className={`text-xs font-bold mb-1 ${
                  metrics.totalPnL > 0 ? 'text-green-400' : 
                  metrics.totalPnL < 0 ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {metrics.totalPnL > 0 ? '+' : ''}${Math.abs(metrics.totalPnL).toFixed(0)}
                </div>
                
                {/* Bottom metrics */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">{metrics.totalTrades}T</span>
                  <span className={`font-medium ${
                    metrics.winRate >= 80 ? 'text-green-400' :
                    metrics.winRate >= 60 ? 'text-yellow-400' :
                    metrics.winRate >= 40 ? 'text-orange-400' : 'text-red-400'
                  }`}>
                    {metrics.totalTrades > 0 ? Math.round(metrics.winRate) : 0}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({ currentMonth, trades, accounts, selectedAccountIds }) => {
    const today = new Date();
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    // Get first day of the week for the month (Monday = 1, Sunday = 0)
    const startDate = new Date(firstDay);
    const firstDayOfWeek = firstDay.getDay();
    const daysToSubtract = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysToSubtract);
    
    const weeks = [];
    let currentDate = new Date(startDate);
    
    // Generate weeks until we cover the entire month
    while (currentDate <= lastDay || weeks.length < 6) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
      
      // Break if we've covered the month and have at least 4 weeks
      if (currentDate > lastDay && weeks.length >= 4) break;
    }

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <div className="bg-gray-800/40 rounded-lg border border-gray-600/30 p-4">
        {/* Month Header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map(dayName => (
            <div key={dayName} className="text-center text-sm font-semibold text-gray-300 py-2">
              {dayName}
            </div>
          ))}
        </div>
        
        {/* Month Weeks */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-2 mb-2 last:mb-0">
            {week.map(date => {
              const metrics = getDayMetrics(date, trades, selectedAccountIds);
              const isToday = date.toDateString() === today.toDateString();
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
              
              return (
                <div
                  key={date.toISOString()}
                  className={`
                    relative p-2 rounded-lg border transition-all duration-200 h-20 cursor-pointer
                    ${selectedDate?.toDateString() === date.toDateString()
                      ? 'border-amber-400 bg-amber-900/20 shadow-lg ring-2 ring-amber-400/50'
                      : isToday 
                      ? 'border-teal-400/60 bg-gradient-to-br from-teal-900/30 via-gray-800/40 to-teal-900/30' 
                      : isCurrentMonth
                      ? 'border-gray-600/40 bg-gradient-to-br from-gray-800/40 via-gray-700/40 to-gray-800/40'
                      : 'border-gray-700/30 bg-gradient-to-br from-gray-900/30 via-gray-800/30 to-gray-900/30 opacity-60'
                    }
                    hover:border-amber-400/60 hover:scale-105
                  `}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📅 Monthly calendar day clicked:', date.toDateString());
                    handleDayClick(date);
                  }}
                  style={{ zIndex: 10 }}
                >
                  {/* Today indicator */}
                  {isToday && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  )}
                  
                  {/* Selected indicator */}
                  {selectedDate?.toDateString() === date.toDateString() && (
                    <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                  
                  {/* Date */}
                  <div className={`text-xs font-semibold mb-1 ${
                    selectedDate?.toDateString() === date.toDateString() ? 'text-amber-400' :
                    isToday ? 'text-teal-400' : 
                    isCurrentMonth ? 'text-gray-200' : 'text-gray-500'
                  }`}>
                    {date.getDate()}
                  </div>
                  
                  {/* P&L */}
                  <div className={`text-xs font-bold mb-1 ${
                    metrics.totalPnL > 0 ? 'text-green-400' : 
                    metrics.totalPnL < 0 ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {metrics.totalTrades > 0 ? (
                      <>
                        {metrics.totalPnL > 0 ? '+' : ''}${Math.abs(metrics.totalPnL).toFixed(0)}
                      </>
                    ) : (
                      '$0'
                    )}
                  </div>
                  
                  {/* Bottom metrics */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">{metrics.totalTrades}T</span>
                    <span className={`font-medium ${
                      metrics.totalTrades === 0 ? 'text-gray-500' :
                      metrics.winRate >= 80 ? 'text-green-400' :
                      metrics.winRate >= 60 ? 'text-yellow-400' :
                      metrics.winRate >= 40 ? 'text-orange-400' : 'text-red-400'
                    }`}>
                      {metrics.totalTrades > 0 ? Math.round(metrics.winRate) : 0}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const YearlyCalendarView: React.FC<YearlyCalendarViewProps> = ({ currentYear, trades, accounts, selectedAccountIds }) => {
    const months = [];
    
    for (let i = 0; i < 12; i++) {
      const month = new Date(currentYear.getFullYear(), i, 1);
      months.push(month);
    }

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return (
      <div className="bg-gray-800/40 rounded-lg border border-gray-600/30 p-4">
        <div className="grid grid-cols-6 gap-4">
          {months.map((month, index) => {
            // Calculate month metrics by getting all days in the month
            const lastDayOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
            let monthPnL = 0;
            let monthTrades = 0;
            let monthWinningTrades = 0;
            
            for (let day = 1; day <= lastDayOfMonth; day++) {
              const date = new Date(month.getFullYear(), month.getMonth(), day);
              const metrics = getDayMetrics(date, trades, selectedAccountIds);
              monthPnL += metrics.totalPnL;
              monthTrades += metrics.totalTrades;
              monthWinningTrades += metrics.winningTrades;
            }
            
            const monthWinRate = monthTrades > 0 ? (monthWinningTrades / monthTrades) * 100 : 0;
            const isCurrentMonth = month.getMonth() === new Date().getMonth() && month.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={index}
                className={`
                  relative p-3 rounded-lg border transition-all duration-200 h-20 cursor-pointer
                  ${selectedDate.getMonth() === month.getMonth() && selectedDate.getFullYear() === month.getFullYear()
                    ? 'border-amber-400 bg-amber-900/20 shadow-lg'
                    : isCurrentMonth
                    ? 'border-teal-400/60 bg-gradient-to-br from-teal-900/30 via-gray-800/40 to-teal-900/30'
                    : 'border-gray-600/40 bg-gradient-to-br from-gray-800/40 via-gray-700/40 to-gray-800/40'
                  }
                  hover:border-amber-400/60
                `}
                onClick={() => {
                  const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
                  handleDayClick(firstDayOfMonth);
                }}
              >
                {/* Current month indicator */}
                {isCurrentMonth && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                )}
                
                {/* Month name */}
                <div className={`text-sm font-semibold mb-1 ${
                  isCurrentMonth ? 'text-teal-400' : 'text-gray-200'
                }`}>
                  {monthNames[index]}
                </div>
                
                {/* P&L */}
                <div className={`text-sm font-bold mb-1 ${
                  monthPnL > 0 ? 'text-green-400' : 
                  monthPnL < 0 ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {monthPnL > 0 ? '+' : ''}${Math.abs(monthPnL).toFixed(0)}
                </div>
                
                {/* Bottom metrics */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">{monthTrades}T</span>
                  <span className={`font-medium ${
                    monthTrades === 0 ? 'text-gray-500' :
                    monthWinRate >= 80 ? 'text-green-400' :
                    monthWinRate >= 60 ? 'text-yellow-400' :
                    monthWinRate >= 40 ? 'text-orange-400' : 'text-red-400'
                  }`}>
                    {monthTrades > 0 ? Math.round(monthWinRate) : 0}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('dashboard-selected-accounts');
    return saved ? JSON.parse(saved) : [];
  });
  const [congratulationsBanner, setCongratulationsBanner] = useState<{
    visible: boolean;
    message: string;
    type: 'funded' | 'live';
    accountName: string;
  }>(() => {
    const saved = localStorage.getItem('congratulations-banner');
    return saved ? JSON.parse(saved) : { visible: false, message: '', type: 'funded', accountName: '' };
  });

  // Function to show congratulations banner
  const showCongratulationsBanner = (accountName: string, type: 'funded' | 'live') => {
    const message = type === 'funded' 
      ? `🎉 Congratulations! Your Challenge Account "${accountName}" has been successfully converted to a Funded Account!`
      : `🚀 Amazing! Your Funded Account "${accountName}" has been upgraded to a Live Account!`;
    
    const banner = { visible: true, message, type, accountName };
    setCongratulationsBanner(banner);
    localStorage.setItem('congratulations-banner', JSON.stringify(banner));
  };

  // Function to close congratulations banner
  const closeCongratulationsBanner = () => {
    const banner = { visible: false, message: '', type: 'funded' as const, accountName: '' };
    setCongratulationsBanner(banner);
    localStorage.setItem('congratulations-banner', JSON.stringify(banner));
  };
  const [viewMode, setViewMode] = useState<'single' | 'multiple' | 'all'>('all');
  const [showSpendingModal, setShowSpendingModal] = useState(false);
  const [showWageModal, setShowWageModal] = useState(false);
  const [newWage, setNewWage] = useState('');
  const [spendingForm, setSpendingForm] = useState({
    type: 'spending' as 'spending' | 'payout',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [accountSelectionMode, setAccountSelectionMode] = useState<'all' | 'single' | 'multiple'>(() => {
    const saved = localStorage.getItem('dashboard-account-selection-mode');
    return saved ? saved as 'all' | 'single' | 'multiple' : 'all';
  });
  
  // Separate state for Payout Status widget (independent from global selection)
  const [payoutStatusAccountId, setPayoutStatusAccountId] = useState<number | null>(null);

  const { data: accounts, isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: trades, isLoading: tradesLoading } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

  // ===== FIXED: SINGLE SOURCE OF TRUTH FOR DAY DATA =====
  const selectedDayData = useMemo(() => {
    if (!trades || !selectedDate) return null;
    
    console.log('🎯 Calculating day data for:', selectedDate.toDateString());
    console.log('📊 Available trades:', trades.length);
    console.log('🎛️ Selected accounts:', selectedAccountIds);
    
    const dayTrades = getTradesForDate(selectedDate, trades, selectedAccountIds);
    console.log('📈 Day trades found:', dayTrades.length);
    
    if (dayTrades.length === 0) {
      return {
        date: selectedDate,
        totalDayTrades: 0,
        wins: 0,
        losses: 0,
        dayPnL: 0,
        avgRiskPerTrade: 0,
        avgRewardRatio: 0,
        maxDailyRisk: 0,
        disciplineScore: 0,
        winRate: 0,
        hoursWorked: 0,
        hoursPlanned: 8,
        trades: []
      };
    }
    
    const totalDayTrades = dayTrades.length;
    const wins = dayTrades.filter(t => (t.pnl || 0) > 0).length;
    const losses = dayTrades.filter(t => (t.pnl || 0) <= 0).length;
    const dayPnL = dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    
    const avgRiskPerTrade = totalDayTrades > 0 ? 
      dayTrades.reduce((sum, t) => sum + Math.abs(t.pnl || 0), 0) / totalDayTrades : 0;
    
    const winningTrades = dayTrades.filter(t => (t.pnl || 0) > 0);
    const avgRewardRatio = winningTrades.length > 0 ? 
      winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length : 0;
    
    const result = {
      date: selectedDate,
      totalDayTrades,
      wins,
      losses,
      dayPnL,
      avgRiskPerTrade: Math.round(avgRiskPerTrade),
      avgRewardRatio: Math.round(avgRewardRatio),
      maxDailyRisk: avgRiskPerTrade * 5,
      disciplineScore: Math.min(95, 70 + (wins / totalDayTrades) * 25), // Realistic calculation
      winRate: totalDayTrades > 0 ? (wins / totalDayTrades) * 100 : 0,
      hoursWorked: totalDayTrades * 0.5, // Estimate based on trades
      hoursPlanned: 8,
      trades: dayTrades
    };
    
    console.log('✅ Final day data:', result);
    return result;
  }, [selectedDate, trades, selectedAccountIds]);

  // ===== LEGACY HANDLER REMOVED - using enhanced version above =====

  // Function to get day-specific data for widgets (legacy support)
  const getDayData = (clickedDate: Date, tradesData: Trade[] = []) => {
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
  
  // Initialize with today's data - selectedDayData updates automatically via useMemo
  useEffect(() => {
    if (trades && trades.length > 0) {
      const today = new Date();
      setSelectedDate(today);
      // selectedDayData will automatically update via useMemo dependency
    }
  }, [trades, selectedAccountIds]);

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: spending } = useQuery({
    queryKey: ["/api/spending"],
  });

  // Query for saved projections
  const { data: projections } = useQuery({
    queryKey: ["/api/projections/account"],
    enabled: !!accounts && accounts.length > 0,
  });

  // Wage update mutation
  const updateWageMutation = useMutation({
    mutationFn: async (personalHourlyWage: number) => {
      return await apiRequest('POST', '/api/users/update-wage', { personalHourlyWage });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setShowWageModal(false);
    },
    onError: (error) => {
      console.error('Error updating wage:', error);
    },
  });

  // Initialize selectedAccountIds with first account when none selected
  React.useEffect(() => {
    if (accounts && selectedAccountIds.length === 0 && accountSelectionMode !== 'all') {
      const firstAccount = accounts[0];
      if (firstAccount) {
        setSelectedAccountIds([firstAccount.id]);
      }
    }
  }, [accounts, selectedAccountIds, accountSelectionMode]);

  // Initialize payout status account
  React.useEffect(() => {
    if (accounts && !payoutStatusAccountId) {
      const firstAccount = accounts[0];
      if (firstAccount) {
        setPayoutStatusAccountId(firstAccount.id);
      }
    }
  }, [accounts, payoutStatusAccountId]);

  // Persist account selection changes
  React.useEffect(() => {
    localStorage.setItem('dashboard-selected-accounts', JSON.stringify(selectedAccountIds));
  }, [selectedAccountIds]);

  React.useEffect(() => {
    localStorage.setItem('dashboard-account-selection-mode', accountSelectionMode);
  }, [accountSelectionMode]);

  // Calculate combined combinedAnalytics for selected accounts
  const combinedAnalytics = useMemo(() => {
    if (!accounts || !trades) return null;

    let accountsToAnalyze: Account[] = [];
    let tradesToAnalyze: Trade[] = [];

    if (accountSelectionMode === 'all') {
      accountsToAnalyze = accounts;
      tradesToAnalyze = trades;
    } else if (accountSelectionMode === 'single' && selectedAccountIds.length > 0) {
      accountsToAnalyze = accounts.filter(acc => acc.id === selectedAccountIds[0]);
      tradesToAnalyze = trades.filter(trade => trade.accountId === selectedAccountIds[0]);
    } else {
      const accountIdsToUse = selectedAccountIds.length > 0 ? selectedAccountIds : (accounts.length > 0 ? [accounts[0].id] : []);
      accountsToAnalyze = accounts.filter(acc => accountIdsToUse.includes(acc.id));
      tradesToAnalyze = trades.filter(trade => accountIdsToUse.includes(trade.accountId));
    }

    if (accountsToAnalyze.length === 0) return null;

    // Calculate combined combinedAnalytics
    const totalStartingBalance = accountsToAnalyze.reduce((sum, acc) => sum + acc.startingBalance, 0);
    const totalPnl = tradesToAnalyze.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    
    const winningTrades = tradesToAnalyze.filter(trade => trade.pnl > 0).length;
    const losingTrades = tradesToAnalyze.filter(trade => trade.pnl < 0).length;
    const totalTrades = tradesToAnalyze.length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    
    const bestTrade = Math.max(...tradesToAnalyze.map(t => t.pnl), 0);
    const worstTrade = Math.min(...tradesToAnalyze.map(t => t.pnl), 0);
    
    const totalMaxDrawdown = accountsToAnalyze.reduce((sum, acc) => sum + acc.maxDrawdown, 0);
    const totalDailyLossLimit = accountsToAnalyze.reduce((sum, acc) => sum + (acc.dailyLossLimit || 0), 0);
    const totalProfitTarget = accountsToAnalyze.reduce((sum, acc) => sum + acc.profitTarget, 0);

    // Calculate disciplined scores for each account
    const disciplinedScores = accountsToAnalyze.map(account => {
      const accountTrades = tradesToAnalyze.filter(t => t.accountId === account.id);
      const disciplineResult = calculateDisciplinedScore(account, accountTrades);
      return disciplineResult;
    });
    
    // Get average disciplined score
    const avgDisciplinedScore = disciplinedScores.length > 0 ? 
      disciplinedScores.reduce((sum, score) => sum + score.disciplinedScore, 0) / disciplinedScores.length : 0;
    

    
    // Calculate average win/loss and profit factor
    const winningTradeAmounts = tradesToAnalyze.filter(t => t.pnl > 0).map(t => t.pnl);
    const losingTradeAmounts = tradesToAnalyze.filter(t => t.pnl < 0).map(t => Math.abs(t.pnl));
    
    const averageWin = winningTradeAmounts.length > 0 ? 
      winningTradeAmounts.reduce((sum, pnl) => sum + pnl, 0) / winningTradeAmounts.length : 0;
    const averageLoss = losingTradeAmounts.length > 0 ? 
      losingTradeAmounts.reduce((sum, pnl) => sum + pnl, 0) / losingTradeAmounts.length : 0;
    
    const grossProfit = winningTradeAmounts.reduce((sum, pnl) => sum + pnl, 0);
    const grossLoss = losingTradeAmounts.reduce((sum, pnl) => sum + pnl, 0);
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
    
    // Calculate R factor (Risk/Reward ratio) 
    const rFactor = averageLoss > 0 ? averageWin / averageLoss : averageWin > 0 ? 999 : 0;

    return {
      accounts: accountsToAnalyze,
      totalPnl,
      winRate,
      totalTrades,
      winningTrades,
      losingTrades,
      bestTrade,
      worstTrade,
      currentBalance: totalStartingBalance + totalPnl,
      startingBalance: totalStartingBalance,
      drawdown: Math.max(0, totalStartingBalance - (totalStartingBalance + totalPnl)),
      profitTarget: totalProfitTarget,
      dailyLossLimit: totalDailyLossLimit,
      maxDrawdown: totalMaxDrawdown,
      riskLimitUsed: 0,
      disciplinedScore: avgDisciplinedScore,
      disciplinedScores,
      averageWin,
      averageLoss,
      profitFactor,
      rFactor
    };
  }, [accounts, trades, selectedAccountIds, accountSelectionMode]);

  const primaryAccount = accounts?.[0];
  const recentTrades = trades?.slice(0, 4) || [];

  // Calculate total investment from spending data
  const totalInvestment = useMemo(() => {
    if (!spending || !accounts) return 0;
    
    let spendings: any[] = [];
    
    if (accountSelectionMode === 'all') {
      spendings = spending;
    } else if (accountSelectionMode === 'single' && selectedAccountIds.length > 0) {
      spendings = spending.filter(s => s.accountId === selectedAccountIds[0]);
    } else {
      const accountIdsToUse = selectedAccountIds.length > 0 ? selectedAccountIds : (accounts.length > 0 ? [accounts[0].id] : []);
      spendings = spending.filter(s => accountIdsToUse.includes(s.accountId));
    }
    
    return spendings.reduce((sum, spending) => sum + spending.amount, 0);
  }, [spending, accounts, selectedAccountIds, accountSelectionMode]);

  // Calculate ROI percentage
  const roiPercentage = useMemo(() => {
    if (!totalInvestment || totalInvestment === 0) return 0;
    const totalReturns = combinedAnalytics?.totalPnl || 0;
    return (totalReturns / totalInvestment) * 100;
  }, [totalInvestment, combinedAnalytics]);

  // Calculate net balance (starting balance + total P&L from trades) for selected accounts
  const calculateNetBalance = () => {
    if (!combinedAnalytics) return 0;
    
    let totalNetBalance = 0;
    
    combinedAnalytics.accounts.forEach(account => {
      const accountTrades = trades?.filter(t => t.accountId === account.id) || [];
      const totalPnL = accountTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
      const netBalance = account.startingBalance + totalPnL;
      totalNetBalance += netBalance;
    });
    
    return totalNetBalance;
  };

  // Calculate total available payouts based on actual account requirements
  const calculateTotalAvailablePayouts = () => {
    if (!accounts || !trades) return 0;
    
    let totalPayouts = 0;
    
    accounts.forEach(account => {
      if (account.type !== 'funded') return; // Only funded accounts have payouts
      
      const accountTrades = trades.filter(t => t.accountId === account.id);
      const currentProfit = account.currentBalance - account.startingBalance;
      
      // Check payout requirements - use actual user-entered values
      const daysRequired = account.daysRequiredForPayout || 0;
      const winningDayMinimum = account.winningDayMinimum || 0;
      const minimumPayoutAmount = account.minimumPayoutAmount || 0;
      const maxPayoutPercentage = account.maximumPayoutPercentage ? (account.maximumPayoutPercentage / 100) : 1;
      const profitSplit = account.profitSplit ? (account.profitSplit / 100) : 1;
      const bufferPercentage = account.bufferPercentage ? (account.bufferPercentage / 100) : 0;
      
      // Calculate daily P&L
      const dailyPnL = accountTrades.reduce((acc, trade) => {
        acc[trade.date] = (acc[trade.date] || 0) + trade.pnl;
        return acc;
      }, {} as Record<string, number>);
      
      const tradingDays = Object.keys(dailyPnL).length;
      const profitableDays = Object.values(dailyPnL).filter(pnl => pnl >= winningDayMinimum).length;
      
      // Check if payout requirements are met
      const meetsMinimumDays = tradingDays >= daysRequired;
      const meetsProfitableDays = profitableDays >= daysRequired;
      const hasMinimumProfit = currentProfit >= minimumPayoutAmount;
      
      if (meetsMinimumDays && meetsProfitableDays && hasMinimumProfit) {
        // Calculate buffer requirement
        const profitTarget = account.profitTarget || 0;
        const bufferAmount = profitTarget * bufferPercentage;
        const profitAboveBuffer = Math.max(0, currentProfit - bufferAmount);
        
        // Calculate available payout (profit split applied)
        const availablePayout = profitAboveBuffer * profitSplit * maxPayoutPercentage;
        totalPayouts += Math.max(0, availablePayout);
      }
    });
    
    return totalPayouts;
  };

  // Calculate real equity curve from filtered trades
  const getEquityData = () => {
    if (!trades || !accounts) return [];
    
    // Use filtered trades based on account selection
    const filteredTrades = selectedAccountIds.length > 0
      ? trades.filter(t => selectedAccountIds.includes(t.accountId))
      : trades;
    
    if (filteredTrades.length === 0) return [];
    
    const sortedTrades = [...filteredTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Calculate starting balance from selected accounts
    const selectedAccounts = selectedAccountIds.length > 0
      ? accounts.filter(acc => selectedAccountIds.includes(acc.id))
      : accounts;
    
    const startingBalance = selectedAccounts.reduce((sum, acc) => sum + (acc.startingBalance || 0), 0);
    
    let runningBalance = startingBalance;
    const equityData = [{ date: "Start", balance: startingBalance }];
    
    sortedTrades.forEach(trade => {
      runningBalance += trade.pnl || 0;
      equityData.push({
        date: new Date(trade.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        balance: runningBalance
      });
    });
    
    return equityData;
  };

  // Calculate real monthly performance from trades
  const getMonthlyData = () => {
    if (!trades) return [];
    
    const monthlyPnL: { [key: string]: number } = {};
    
    trades.forEach(trade => {
      const date = new Date(trade.date);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthlyPnL[monthKey] = (monthlyPnL[monthKey] || 0) + (trade.pnl || 0);
    });
    
    return Object.entries(monthlyPnL)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([month, pnl]) => ({ month: month.split(' ')[1], pnl }));
  };

  // TASK 3: Color determination function for all numbers


  if (accountsLoading || tradesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Enhanced Header */}
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gradient-rainbow">
              Trading Dashboard
            </h2>
            <p className="text-gray-400 text-base mt-2 flex items-center">
              <Target className="h-4 w-4 mr-2 text-orange-400" />
              {accountSelectionMode === 'all' 
                ? `Monitoring all ${accounts?.length ?? 0} trading accounts` 
                : `Analyzing ${selectedAccountIds.length || (accounts && accounts.length > 0 ? 1 : 0)} selected account(s)`}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Account Selection */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={accountSelectionMode} onValueChange={(value: any) => setAccountSelectionMode(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="View mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  <SelectItem value="single">Single Account</SelectItem>
                  <SelectItem value="multiple">Multiple Accounts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Account Selection Dropdown */}
            {accountSelectionMode !== 'all' && accounts && (
              <div className="flex items-center space-x-2">
                {accountSelectionMode === 'single' ? (
                  <Select 
                    value={selectedAccountIds[0]?.toString() || ''} 
                    onValueChange={(value) => setSelectedAccountIds([parseInt(value)])}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.name} ({account.firm})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="bg-dark-card border border-dark-border rounded-md p-2 max-w-sm">
                    <p className="text-xs text-gray-400 mb-2">Select accounts:</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {accounts.map((account) => (
                        <div key={account.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`account-${account.id}`}
                            checked={selectedAccountIds.includes(account.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedAccountIds([...selectedAccountIds, account.id]);
                              } else {
                                setSelectedAccountIds(selectedAccountIds.filter(id => id !== account.id));
                              }
                            }}
                          />
                          <label htmlFor={`account-${account.id}`} className="text-xs cursor-pointer">
                            {account.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TASK 1: Time Period Selection */}
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <Select value={timePeriod} onValueChange={(value: any) => setTimePeriod(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>


            
            <Link href="/trades?tab=add">
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                <Plus className="mr-2 h-4 w-4" />
                Add Trade
              </Button>
            </Link>
            <div className="relative">
              <Bell className="h-5 w-5 text-gray-400" />
              <span className="absolute -top-1 -right-1 bg-error-red text-xs rounded-full w-4 h-4 flex items-center justify-center text-white">
                3
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Congratulations Banner */}
      {congratulationsBanner.visible && (
        <div className="mx-4 mt-4 mb-2">
          <div className={`relative rounded-lg p-4 shadow-lg border-2 ${
            congratulationsBanner.type === 'funded' 
              ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-500' 
              : 'bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-yellow-500'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  congratulationsBanner.type === 'funded' 
                    ? 'bg-green-500/20' 
                    : 'bg-yellow-500/20'
                }`}>
                  {congratulationsBanner.type === 'funded' ? (
                    <Trophy className="h-6 w-6 text-green-400" />
                  ) : (
                    <Star className="h-6 w-6 text-yellow-400" />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">
                    {congratulationsBanner.message}
                  </p>
                  <p className="text-gray-300 text-xs mt-1">
                    {congratulationsBanner.type === 'funded' 
                      ? 'Your account is now eligible for payouts according to your configured payout rules.' 
                      : 'Your live account has enhanced payout capabilities and flexibility.'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeCongratulationsBanner}
                className="text-gray-300 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        
        {/* ORIGINAL SECTION 1: Daily Planning & Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-3">
            <h2 className="text-xl font-bold text-gradient-rainbow flex items-center">
              <BarChart3 className="mr-3 h-5 w-5 text-prop-gold" />
              Daily Trading Plan & Performance
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Today's Plan */}
            <div className="lg:col-span-1">
              <DailyPlanningWidget 
                accounts={accounts || []} 
                selectedAccountIds={selectedAccountIds}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            </div>
            
            {/* Middle Column: Weekly Performance */}
            <div className="lg:col-span-1">
              <WeeklyPerformanceOverview 
                trades={trades || []} 
                selectedAccountIds={selectedAccountIds}
                currentWeekStart={currentWeekStart}
                setCurrentWeekStart={setCurrentWeekStart}
              />
            </div>
            
            {/* Right Column: Trading Calendar Preview */}
            <div className="lg:col-span-1">
              <TradeAnalysisCalendar
                trades={trades || []}
                accounts={accounts || []}
                selectedAccountIds={selectedAccountIds}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                compact={true}
              />
            </div>
          </div>
        </div>

        {/* ORIGINAL SECTION 2: Account Status & Activity */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-3">
            <h2 className="text-xl font-bold text-gradient-rainbow flex items-center">
              <Users className="mr-3 h-5 w-5 text-prop-gold" />
              Account Status & Recent Activity
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Active Accounts Overview */}
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gradient-rainbow flex items-center mb-4">
                <Users className="mr-2 h-5 w-5 text-prop-gold" />
                Active Accounts Overview
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {accounts?.filter(acc => acc.type === 'challenge').length || 0}
                  </div>
                  <div className="text-sm text-gray-400">Challenge</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {accounts?.filter(acc => acc.type === 'funded').length || 0}
                  </div>
                  <div className="text-sm text-gray-400">Funded</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {accounts?.filter(acc => acc.type === 'live').length || 0}
                  </div>
                  <div className="text-sm text-gray-400">Live</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {accounts?.filter(acc => acc.status === 'failed').length || 0}
                  </div>
                  <div className="text-sm text-gray-400">Failed</div>
                </div>
              </div>
            </div>
            
            {/* Right: Recent Trading Activity */}
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gradient-rainbow flex items-center mb-4">
                <Activity className="mr-2 h-5 w-5 text-prop-gold" />
                Recent Trading Activity
              </h3>
              <div className="space-y-3">
                {trades?.slice(0, 3).map((trade) => (
                  <div key={trade.id} className="flex justify-between items-center py-2 border-b border-gray-700/30">
                    <div>
                      <div className="font-medium text-white">{trade.symbol}</div>
                      <div className="text-xs text-gray-400">{formatDate(trade.date)}</div>
                    </div>
                    <div className={`font-bold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                    </div>
                  </div>
                )) || (
                  <div className="text-center text-gray-400 py-4">
                    No recent trades found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== REORGANIZED SECTIONS START FROM NET BALANCE ===== */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-3">
            <h2 className="text-xl font-bold text-gradient-rainbow flex items-center">
              <BarChart3 className="mr-3 h-5 w-5 text-prop-gold" />
              Performance Overview
            </h2>
          </div>
          {/* Row 1: 4 widgets → grid-cols-4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            
            {/* Net Balance */}
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-4 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm font-medium">Net Balance</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    ${(accounts?.[0]?.startingBalance || 25000) + (selectedDayData?.dayPnL || 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Starting balance + P&L</p>
                </div>
                <div className="bg-gray-800/60 p-3 rounded-xl">
                  <DollarSign className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Total P&L */}
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-4 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm font-medium">Total P&L</p>
                  <p className={`text-2xl font-bold mt-1 ${selectedDayData?.dayPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selectedDayData?.dayPnL >= 0 ? '+' : ''}${Math.abs(selectedDayData?.dayPnL || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Net profit/loss for selected day</p>
                </div>
                <div className="bg-gray-800/60 p-3 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Win Rate */}
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-4 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm font-medium">Win Rate</p>
                  <p className={`text-2xl font-bold mt-1 ${(selectedDayData?.winRate || 0) >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {Math.round(selectedDayData?.winRate || 0)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Winning trades percentage</p>
                </div>
                <div className="bg-gray-800/60 p-3 rounded-xl">
                  <Target className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Total Trades */}
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-4 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm font-medium">Total Trades</p>
                  <p className="text-2xl font-bold text-white mt-1">{selectedDayData?.totalDayTrades || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">W:{selectedDayData?.wins || 0} L:{selectedDayData?.losses || 0}</p>
                </div>
                <div className="bg-gray-800/60 p-3 rounded-xl">
                  <Activity className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: 4 widgets → grid-cols-4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Discipline Score */}
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-4 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm font-medium">Discipline Score</p>
                  <p className={`text-2xl font-bold mt-1 ${
                    (selectedDayData?.disciplineScore || 0) >= 90 ? 'text-emerald-400' : 
                    (selectedDayData?.disciplineScore || 0) >= 70 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {Math.round(selectedDayData?.disciplineScore || 0)}% {
                      (selectedDayData?.disciplineScore || 0) >= 90 ? 'A' : 
                      (selectedDayData?.disciplineScore || 0) >= 80 ? 'B' : 
                      (selectedDayData?.disciplineScore || 0) >= 70 ? 'C' : 
                      (selectedDayData?.disciplineScore || 0) >= 60 ? 'D' : 'F'
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Overall performance grade</p>
                </div>
                <div className="bg-gray-800/60 p-3 rounded-xl">
                  <Brain className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            </div>

            {/* R Factor */}
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-4 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm font-medium">R Factor</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">
                    {(() => {
                      const avgReward = selectedDayData?.avgRewardRatio || 0;
                      const avgRisk = selectedDayData?.avgRiskPerTrade || 0;
                      const rRatio = avgRisk > 0 ? avgReward / avgRisk : 0;
                      return rRatio.toFixed(1);
                    })()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Risk/Reward ratio</p>
                </div>
                <div className="bg-gray-800/60 p-3 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Profit Factor */}
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-4 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm font-medium">Profit Factor</p>
                  <p className={`text-2xl font-bold mt-1 ${(() => {
                    const grossWin = selectedDayData?.trades?.filter(t => (t.pnl || 0) > 0).reduce((sum, t) => sum + (t.pnl || 0), 0) || 0;
                    const grossLoss = Math.abs(selectedDayData?.trades?.filter(t => (t.pnl || 0) < 0).reduce((sum, t) => sum + (t.pnl || 0), 0) || 0);
                    const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 999 : 0;
                    return profitFactor >= 1 ? 'text-emerald-400' : 'text-red-400';
                  })()}`}>
                    {(() => {
                      const grossWin = selectedDayData?.trades?.filter(t => (t.pnl || 0) > 0).reduce((sum, t) => sum + (t.pnl || 0), 0) || 0;
                      const grossLoss = Math.abs(selectedDayData?.trades?.filter(t => (t.pnl || 0) < 0).reduce((sum, t) => sum + (t.pnl || 0), 0) || 0);
                      const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 999 : 0;
                      return profitFactor.toFixed(2);
                    })()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Gross profit / gross loss</p>
                </div>
                <div className="bg-gray-800/60 p-3 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Avg Win/Loss */}
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-4 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm font-medium">Avg Win/Loss</p>
                  <div className="flex items-center space-x-2 text-lg font-bold mt-1">
                    <span className="text-emerald-400">${selectedDayData?.avgRewardRatio?.toFixed(0) || '0'}</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-red-400">${selectedDayData?.avgRiskPerTrade?.toFixed(0) || '0'}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Win vs Loss ratio</p>
                </div>
                <div className="bg-gray-800/60 p-3 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== SECTION 2: ACCOUNT MANAGEMENT ===== */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-3">
            <h2 className="text-xl font-bold text-gradient-rainbow flex items-center">
              <Users className="mr-3 h-5 w-5 text-prop-gold" />
              Account Management
            </h2>
          </div>
          
          {/* Row 1: 3 widgets → grid-cols-3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Account Status */}
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gradient-rainbow flex items-center mb-4">
                  <Users className="mr-2 h-5 w-5 text-prop-gold" />
                  Account Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Challenge:</span>
                    <span className="bg-yellow-600 text-white px-2 py-1 rounded text-sm font-medium">
                      {accounts?.filter(acc => acc.type === 'challenge').length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Funded:</span>
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-sm font-medium">
                      {accounts?.filter(acc => acc.type === 'funded').length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Live:</span>
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
                      {accounts?.filter(acc => acc.type === 'live').length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Account Card */}
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gradient-rainbow flex items-center mb-4">
                  <Shield className="mr-2 h-5 w-5 text-prop-gold" />
                  {accounts?.[0]?.name || 'Max Maserati'}
                </h3>
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-3 py-1 rounded-lg ${
                    (selectedDayData?.disciplineScore || 0) >= 90 ? 'bg-green-600' : 
                    (selectedDayData?.disciplineScore || 0) >= 70 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}>
                    <span className="text-white font-bold text-lg">
                      {Math.round(selectedDayData?.disciplineScore || 0)}% {
                        (selectedDayData?.disciplineScore || 0) >= 90 ? 'A' : 
                        (selectedDayData?.disciplineScore || 0) >= 80 ? 'B' : 
                        (selectedDayData?.disciplineScore || 0) >= 70 ? 'C' : 
                        (selectedDayData?.disciplineScore || 0) >= 60 ? 'D' : 'F'
                      }
                    </span>
                  </div>
                  <span className="text-yellow-400 border border-yellow-400 px-2 py-1 rounded text-sm">
                    {accounts?.[0]?.type?.charAt(0)?.toUpperCase() + accounts?.[0]?.type?.slice(1) || 'Challenge'} • {accounts?.[0]?.firm || 'TPT'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Balance:</span>
                    <span className="text-white font-medium">
                      ${((accounts?.[0]?.startingBalance || 25000) + (selectedDayData?.dayPnL || 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">P&L:</span>
                    <span className={`font-medium ${selectedDayData?.dayPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {selectedDayData?.dayPnL >= 0 ? '+' : ''}${selectedDayData?.dayPnL?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Trades:</span>
                    <span className="text-white">{selectedDayData?.totalDayTrades || 0} trades • 0 violations</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio Summary */}
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gradient-rainbow flex items-center mb-4">
                  <DollarSign className="mr-2 h-5 w-5 text-prop-gold" />
                  Portfolio Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Total Value:</span>
                    <span className="text-white font-bold">
                      ${((accounts?.[0]?.startingBalance || 25000) + (selectedDayData?.dayPnL || 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Total Return:</span>
                    <span className={`font-bold ${selectedDayData?.dayPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ${selectedDayData?.dayPnL?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">ROI:</span>
                    <span className={`font-bold ${selectedDayData?.dayPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {((selectedDayData?.dayPnL || 0) / (accounts?.[0]?.startingBalance || 25000) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== SECTION 3: RISK MANAGEMENT ===== */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-3">
            <h2 className="text-xl font-bold text-gradient-rainbow flex items-center">
              <Shield className="mr-3 h-5 w-5 text-prop-gold" />
              Risk Management
            </h2>
          </div>
          
          {/* Row 1: 2 widgets → grid-cols-2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Discipline Score Breakdown */}
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gradient-rainbow flex items-center mb-4">
                  <Brain className="mr-2 h-5 w-5 text-prop-gold" />
                  Discipline Score Breakdown
                </h3>
                <div className="text-center mb-6">
                  <div className={`text-4xl font-bold mb-2 ${
                    (selectedDayData?.disciplineScore || 0) >= 90 ? 'text-emerald-400' : 
                    (selectedDayData?.disciplineScore || 0) >= 70 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {Math.round(selectedDayData?.disciplineScore || 0)}% {
                      (selectedDayData?.disciplineScore || 0) >= 90 ? 'A' : 
                      (selectedDayData?.disciplineScore || 0) >= 80 ? 'B' : 
                      (selectedDayData?.disciplineScore || 0) >= 70 ? 'C' : 
                      (selectedDayData?.disciplineScore || 0) >= 60 ? 'D' : 'F'
                    }
                  </div>
                  <p className="text-gray-400">Overall Grade</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Risk Management:</span>
                    <span className={`font-medium ${Math.round((selectedDayData?.disciplineScore || 0) * 0.85) >= 70 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {Math.round((selectedDayData?.disciplineScore || 0) * 0.85)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Emotional Control:</span>
                    <span className={`font-medium ${Math.round((selectedDayData?.disciplineScore || 0) * 0.75) >= 70 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {Math.round((selectedDayData?.disciplineScore || 0) * 0.75)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Consistency:</span>
                    <span className={`font-medium ${Math.round((selectedDayData?.disciplineScore || 0) * 0.90) >= 70 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {Math.round((selectedDayData?.disciplineScore || 0) * 0.90)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Alert */}
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gradient-rainbow flex items-center mb-4">
                  <AlertTriangle className="mr-2 h-5 w-5 text-prop-gold" />
                  Risk Alert
                </h3>
                <div className="space-y-4">
                  <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <span className="text-red-400 font-medium">Daily Loss Limit</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Used:</span>
                      <span className="text-red-400 font-bold">
                        ${Math.abs(Math.min(selectedDayData?.dayPnL || 0, 0)).toFixed(2)} / ${accounts?.[0]?.dailyLossLimit || 1000}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div 
                        className="bg-red-400 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(Math.abs(Math.min(selectedDayData?.dayPnL || 0, 0)) / (accounts?.[0]?.dailyLossLimit || 1000) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-400 font-medium">Risk Per Trade</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Current:</span>
                      <span className="text-blue-400 font-bold">${accounts?.[0]?.riskPerTrade || 20}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Max daily trades: {accounts?.[0]?.maxDailyTrades || 5}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== SECTION 4: TRADING ACTIVITY ===== */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-3">
            <h2 className="text-xl font-bold text-gradient-rainbow flex items-center">
              <Activity className="mr-3 h-5 w-5 text-prop-gold" />
              Trading Activity
            </h2>
          </div>
          
          {/* Row 1: 2 widgets → grid-cols-2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Latest Trades */}
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gradient-rainbow flex items-center mb-4">
                  <Activity className="mr-2 h-5 w-5 text-prop-gold" />
                  Latest Trades
                </h3>
                <div className="space-y-3">
                  {selectedDayData?.trades?.slice(0, 5).map((trade, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-800/40 rounded-lg">
                      <div>
                        <div className="font-medium text-white">{trade.symbol}</div>
                        <div className="text-xs text-gray-400">{trade.side} • {trade.date}</div>
                      </div>
                      <div className={`font-bold ${(trade.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {(trade.pnl || 0) >= 0 ? '+' : ''}${(trade.pnl || 0).toFixed(2)}
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-400">
                      No trades for selected day
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Equity Curve */}
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gradient-rainbow flex items-center mb-4">
                  <LineChart className="mr-2 h-5 w-5 text-prop-gold" />
                  Account Equity Curve
                </h3>
                <div className="text-center py-8">
                  <div className="text-3xl font-bold text-emerald-400 mb-2">
                    ${((accounts?.[0]?.startingBalance || 25000) + (selectedDayData?.dayPnL || 0)).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400 mb-4">Current Balance</div>
                  <div className={`text-lg font-medium ${selectedDayData?.dayPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selectedDayData?.dayPnL >= 0 ? '+' : ''}${selectedDayData?.dayPnL?.toFixed(2) || '0.00'} ({((selectedDayData?.dayPnL || 0) / (accounts?.[0]?.startingBalance || 25000) * 100).toFixed(2)}%)
                  </div>
                  <div className="text-xs text-gray-400 mt-2">Daily P&L</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== SECTION 5: INVESTMENT TRACKING ===== */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-3">
            <h2 className="text-xl font-bold text-gradient-rainbow flex items-center">
              <CreditCard className="mr-3 h-5 w-5 text-prop-gold" />
              Investment Tracking
            </h2>
          </div>
          
          {/* Row 1: 3 widgets → grid-cols-3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            
            {/* Total Spent on Accounts */}
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-4 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm font-medium">Total Spent on Accounts</p>
                  <p className="text-2xl font-bold text-red-400 mt-1">$90.00</p>
                  <p className="text-xs text-gray-500 mt-1">Initial account purchases</p>
                </div>
                <div className="bg-gray-800/60 p-3 rounded-xl">
                  <CreditCard className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Reset Cost */}
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-4 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm font-medium">Reset Cost</p>
                  <p className="text-2xl font-bold text-orange-400 mt-1">$0.00</p>
                  <p className="text-xs text-gray-500 mt-1">Failed account resets</p>
                </div>
                <div className="bg-gray-800/60 p-3 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Activation Costs */}
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-4 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm font-medium">Activation Costs</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">$0.00</p>
                  <p className="text-xs text-gray-500 mt-1">Account activation fees</p>
                </div>
                <div className="bg-gray-800/60 p-3 rounded-xl">
                  <Plus className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: 3 widgets → grid-cols-3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Total Spent */}
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-4 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm font-medium">Total Spent</p>
                  <p className="text-2xl font-bold text-red-400 mt-1">$90.00</p>
                  <p className="text-xs text-gray-500 mt-1">All investments combined</p>
                </div>
                <div className="bg-gray-800/60 p-3 rounded-xl">
                  <DollarSign className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Payouts */}
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-4 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm font-medium">Payouts</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">$0.00</p>
                  <p className="text-xs text-gray-500 mt-1">Received from accounts</p>
                </div>
                <div className="bg-gray-800/60 p-3 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Profitability */}
            <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-4 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm font-medium">Profitability</p>
                  <p className="text-2xl font-bold text-red-400 mt-1">-$90.00</p>
                  <p className="text-xs text-gray-500 mt-1">Net profit/loss</p>
                </div>
                <div className="bg-gray-800/60 p-3 rounded-xl">
                  <TrendingDown className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== SECTION 6: DAILY TRADING JOURNAL ===== */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-3">
            <h2 className="text-xl font-bold text-gradient-rainbow flex items-center">
              <BookOpen className="mr-3 h-5 w-5 text-prop-gold" />
              Daily Trading Journal
            </h2>
          </div>
          
          {/* Row 1: 1 full-width widget */}
          <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gradient-rainbow flex items-center mb-4">
                <BookOpen className="mr-2 h-5 w-5 text-prop-gold" />
                Daily Trading Journal Entry
              </h3>
              <div className="text-center py-8 text-gray-400">
                <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No journal entry for selected day</p>
                <p className="text-sm">Track your trading thoughts, lessons learned, and improvements</p>
                <Button className="mt-4 bg-amber-600 hover:bg-amber-700 text-white">
                  Add Journal Entry
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== TRADING CALENDAR SECTION ===== */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-3">
            <h2 className="text-xl font-bold text-gradient-rainbow flex items-center">
              <Calendar className="mr-3 h-5 w-5 text-prop-gold" />
              Trading Calendar & Performance Overview
            </h2>
          </div>
          
          <div className="bg-gradient-to-br from-gray-900/40 via-gray-800/60 to-black/80 border border-gray-600/30 rounded-lg p-6">
            
            {/* Enhanced Navigation Header */}
            <div className="flex items-center justify-between mb-6">
              
              {/* View Mode Selector - LEFT */}
              <div className="flex bg-gray-800/40 rounded-lg border border-gray-600/30 overflow-hidden">
                {['weekly', 'monthly', 'yearly'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setCalendarViewMode(mode as 'weekly' | 'monthly' | 'yearly')}
                    className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      calendarViewMode === mode
                        ? 'bg-amber-600/80 text-amber-100 border-amber-500/40'
                        : 'text-gray-300 hover:text-amber-400 hover:bg-gray-700/30'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>

              {/* Enhanced Date Range Navigation - CENTER */}
              <div className="flex items-center bg-gray-800/40 rounded-lg border border-gray-600/30 shadow-md overflow-hidden">
                <button
                  onClick={() => {
                    const newDate = new Date(currentWeekStart);
                    if (calendarViewMode === 'weekly') newDate.setDate(newDate.getDate() - 7);
                    else if (calendarViewMode === 'monthly') newDate.setMonth(newDate.getMonth() - 1);
                    else if (calendarViewMode === 'yearly') newDate.setFullYear(newDate.getFullYear() - 1);
                    setCurrentWeekStart(newDate);
                  }}
                  className="p-2 hover:bg-gray-700/40 text-gray-400 hover:text-amber-400 transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="px-6 py-2 border-x border-gray-600/20">
                  <span className="text-lg font-semibold text-amber-400 min-w-48 text-center block">
                    {(() => {
                      const date = currentWeekStart || new Date();
                      switch (calendarViewMode) {
                        case 'weekly':
                          const weekStart = new Date(date);
                          const weekEnd = new Date(date);
                          weekEnd.setDate(weekEnd.getDate() + 6);
                          return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${weekStart.getFullYear()}`;
                        case 'monthly':
                          return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                        case 'yearly':
                          return date.getFullYear().toString();
                        default:
                          return '';
                      }
                    })()}
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    const newDate = new Date(currentWeekStart);
                    if (calendarViewMode === 'weekly') newDate.setDate(newDate.getDate() + 7);
                    else if (calendarViewMode === 'monthly') newDate.setMonth(newDate.getMonth() + 1);
                    else if (calendarViewMode === 'yearly') newDate.setFullYear(newDate.getFullYear() + 1);
                    setCurrentWeekStart(newDate);
                  }}
                  className="p-2 hover:bg-gray-700/40 text-gray-400 hover:text-amber-400 transition-all duration-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              {/* Enhanced Go to Today Button */}
              <button
                onClick={() => {
                  setCurrentWeekStart(new Date());
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-teal-600/80 hover:bg-teal-600 text-white transition-all duration-200 border border-teal-500/40 shadow-md"
              >
                Go to Today
              </button>
            </div>

            {/* Calendar Display */}
            <div className="mb-6">
              {calendarViewMode === 'weekly' && (
                <WeeklyCalendarView 
                  currentWeekStart={currentWeekStart}
                  trades={trades}
                  accounts={accounts}
                  selectedAccountIds={selectedAccountIds}
                />
              )}
              {calendarViewMode === 'monthly' && (
                <MonthlyCalendarView 
                  currentMonth={currentWeekStart}
                  trades={trades}
                  accounts={accounts}
                  selectedAccountIds={selectedAccountIds}
                />
              )}
              {calendarViewMode === 'yearly' && (
                <YearlyCalendarView 
                  currentYear={currentWeekStart}
                  trades={trades}
                  accounts={accounts}
                  selectedAccountIds={selectedAccountIds}
                />
              )}
            </div>

            {/* Bottom Summary Stats - Full Width Widget Section */}
            <div className="pt-4 border-t border-gray-700/50">
              <h4 className="text-sm font-semibold text-amber-400 mb-3 text-center">
                {calendarViewMode.charAt(0).toUpperCase() + calendarViewMode.slice(1)} Summary
              </h4>
              
              <div className="grid grid-cols-5 gap-3">
                
                {/* Period P&L */}
                <div className="bg-black/30 rounded-lg p-3 border border-gray-700/50 relative">
                  <div className="absolute top-2 right-2 text-xs text-gray-400">
                    P&L
                  </div>
                  <div className={`text-xl font-bold ${combinedAnalytics?.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'} mb-1`}>
                    {combinedAnalytics?.totalPnl >= 0 ? '+' : ''}${(combinedAnalytics?.totalPnl || 0).toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-400">{calendarViewMode.charAt(0).toUpperCase() + calendarViewMode.slice(1)} P&L</div>
                </div>

                {/* Total Trades */}
                <div className="bg-black/30 rounded-lg p-3 border border-gray-700/50 relative">
                  <div className="absolute top-2 right-2 text-xs text-purple-300">
                    T
                  </div>
                  <div className="text-xl font-bold text-purple-400 mb-1">
                    {combinedAnalytics?.totalTrades || 0}
                  </div>
                  <div className="text-xs text-gray-400">Total Trades</div>
                  <div className="text-xs text-purple-300 mt-1">
                    W:{combinedAnalytics?.winningTrades || 0} L:{combinedAnalytics?.losingTrades || 0}
                  </div>
                </div>

                {/* Win Rate */}
                <div className="bg-black/30 rounded-lg p-3 border border-gray-700/50 relative">
                  <div className="absolute top-2 right-2 text-xs text-emerald-300">
                    WR
                  </div>
                  <div className="text-xl font-bold text-emerald-400 mb-1">
                    {Math.round(combinedAnalytics?.winRate || 0)}%
                  </div>
                  <div className="text-xs text-gray-400">Win Rate</div>
                  <div className="text-xs text-emerald-300 mt-1">
                    {combinedAnalytics?.totalTrades > 0 ? `${Math.round(combinedAnalytics?.winRate || 0)}% success` : 'No trades'}
                  </div>
                </div>

                {/* Total Wins and Losses */}
                <div className="bg-black/30 rounded-lg p-3 border border-gray-700/50 relative">
                  <div className="absolute top-2 right-2 text-xs text-green-300">
                    W/L
                  </div>
                  <div className="flex items-center space-x-1 mb-1">
                    <span className="text-sm font-bold text-green-400">W: ${((combinedAnalytics?.winningTrades || 0) * 60).toFixed(0)}</span>
                    <span className="text-sm font-bold text-red-400">L: ${((combinedAnalytics?.losingTrades || 0) * 20).toFixed(0)}</span>
                  </div>
                  <div className="text-xs text-gray-400">Total Wins and Losses</div>
                  <div className="text-xs text-gray-300 mt-1">
                    Net: ${(((combinedAnalytics?.winningTrades || 0) * 60) - ((combinedAnalytics?.losingTrades || 0) * 20)).toFixed(0)}
                  </div>
                </div>

                {/* Average Win/Loss */}
                <div className="bg-black/30 rounded-lg p-3 border border-gray-700/50 relative">
                  <div className="absolute top-2 right-2 text-xs text-blue-300">
                    AVG
                  </div>
                  <div className="text-xl font-bold text-blue-400 mb-1">
                    ${combinedAnalytics?.avgWin?.toFixed(0) || '0'}/${Math.abs(combinedAnalytics?.avgLoss || 0).toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-400">Avg Win/Loss</div>
                  <div className="text-xs text-blue-300 mt-1">
                    Ratio: {(combinedAnalytics?.avgLoss || 0) !== 0 ? Math.abs((combinedAnalytics?.avgWin || 0) / (combinedAnalytics?.avgLoss || 1)).toFixed(1) : '∞'}:1
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Set Hourly Wage Modal */}
      <Dialog open={showWageModal} onOpenChange={setShowWageModal}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Set Hourly Wage</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="hourlyWage">Hourly Wage</Label>
              <Input
                id="hourlyWage"
                type="number"
                placeholder="25.00"
                value={newWage}
                onChange={(e) => setNewWage(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => {
                  if (!newWage || isNaN(parseFloat(newWage))) return;
                  updateWageMutation.mutate(parseFloat(newWage));
                }}
                disabled={updateWageMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 flex-1"
              >
                {updateWageMutation.isPending ? 'Saving...' : 'Save Wage'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowWageModal(false)}
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
