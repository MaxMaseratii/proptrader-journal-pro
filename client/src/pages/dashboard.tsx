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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
import NotificationDropdown from "@/components/notification-dropdown";
import UnrealizedProfitWidgets from "@/components/unrealized-profit-widgets";
import TargetProgressWidget from "@/components/target-progress-widget";

// Removed SocialShareButtons import to reduce bundle size - using inline ShareStats instead

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
  User,
  CreditCard,
  X,
  Trophy,
  Star,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BookOpen,
  FileText,
  Edit,
  Minus,
  Scale,
  MessageSquare,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Share2,
  ExternalLink
} from "lucide-react";
import type { Account, Trade } from "@shared/schema";

// Social Media Share Component
interface ShareStatsProps {
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  bestTrade: number;
  accountName: string;
}

const ShareStats: React.FC<ShareStatsProps> = ({ totalPnL, winRate, totalTrades, bestTrade, accountName }) => {
  const shareText = `🚀 My Trading Stats on PropTrader Journal:
💰 Total P&L: ${formatCurrency(totalPnL || 0)}
📊 Win Rate: ${(winRate || 0).toFixed(1)}%
📈 Best Trade: ${formatCurrency(bestTrade || 0)}
🎯 Total Trades: ${totalTrades || 0}
📱 Account: ${accountName || 'My Trading Account'}

#PropTrading #TradingJournal #PropTraderJournal`;

  const shareUrl = encodeURIComponent(window.location.origin);
  const encodedText = encodeURIComponent(shareText);

  const socialPlatforms = [
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${encodedText}`,
      color: 'bg-blue-600 hover:bg-blue-700',
      icon: '📘'
    },
    {
      name: 'X (Twitter)',
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${shareUrl}`,
      color: 'bg-gray-800 hover:bg-gray-900',
      icon: '🐦'
    },
    {
      name: 'Instagram',
      url: `https://www.instagram.com/`,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      icon: '📷',
      note: 'Copy stats and share on your story!'
    },
    {
      name: 'TikTok',
      url: `https://www.tiktok.com/`,
      color: 'bg-black hover:bg-gray-900',
      icon: '🎵',
      note: 'Create a video with your stats!'
    },
    {
      name: 'YouTube',
      url: `https://www.youtube.com/`,
      color: 'bg-red-600 hover:bg-red-700',
      icon: '📹',
      note: 'Share in your trading videos!'
    }
  ];

  const handleShare = (platform: typeof socialPlatforms[0]) => {
    if (platform.note) {
      navigator.clipboard.writeText(shareText);
      window.open(platform.url, '_blank');
    } else {
      window.open(platform.url, '_blank');
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative group">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-gradient-to-r from-yellow-400/20 to-amber-500/20 border-yellow-400/40 hover:border-yellow-400/60 text-yellow-400 hover:text-yellow-300"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share Stats
        </Button>
        
        <div className="absolute top-full right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="p-4">
            <h3 className="text-white font-semibold mb-3">Share Your Trading Stats</h3>
            <div className="space-y-2">
              {socialPlatforms.map((platform) => (
                <button
                  key={platform.name}
                  onClick={() => handleShare(platform)}
                  className={`w-full flex items-center space-x-3 p-2 rounded-lg text-white transition-all ${platform.color}`}
                >
                  <span className="text-lg">{platform.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{platform.name}</div>
                    {platform.note && (
                      <div className="text-xs opacity-80">{platform.note}</div>
                    )}
                  </div>
                  <ExternalLink className="h-4 w-4" />
                </button>
              ))}
            </div>
            <div className="mt-3 p-2 bg-gray-800 rounded text-xs text-gray-400">
              💡 Stats will be copied to clipboard for Instagram, TikTok, and YouTube
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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

  // Calculate ROI function
  const calculateROI = () => {
    const totalCapital = accounts?.reduce((sum, acc) => sum + (acc.startingBalance || 0), 0) || 0;
    const totalPnl = combinedAnalytics?.totalPnl || 0;
    if (totalCapital === 0) return 0;
    return (totalPnl / totalCapital) * 100;
  };


  // Account creation modal state


  // Account creation form


  // Account creation removed - using unified component


  // Check if a date has journal entries
  const hasJournalEntry = (date: Date) => {
    if (!journalEntries) {
      console.log('📝 No journal entries loaded');
      return false;
    }
    const dateStr = date.toISOString().split('T')[0];
    const hasEntry = journalEntries.some((entry: any) => 
      entry.date?.split('T')[0] === dateStr
    );
    if (hasEntry) {
      console.log('📓 Found journal entry for:', dateStr);
    }
    return hasEntry;
  };

  // Get journal entry for a specific date
  const getJournalEntry = (date: Date) => {
    if (!journalEntries) return null;
    const dateStr = date.toISOString().split('T')[0];
    return journalEntries.find((entry: any) => 
      entry.date?.split('T')[0] === dateStr
    );
  };

  // Open journal dialog
  const openJournalDialog = (date: Date) => {
    const entry = getJournalEntry(date);
    if (entry) {
      setJournalDialog({
        isOpen: true,
        entry: entry,
        date: date.toDateString()
      });
    }
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
      <div className="widget-card p-4">
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
            
            const hasJournal = hasJournalEntry(date);
            
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
                {/* Journal Icon */}
                {hasJournal && (
                  <div className="absolute top-1 right-1">
                    <FileText 
                      className="w-3 h-3 text-amber-400 cursor-pointer hover:text-amber-300" 
                      title="Journal entry available - click to view"
                      onClick={(e) => {
                        e.stopPropagation();
                        openJournalDialog(date);
                      }}
                    />
                  </div>
                )}
                
                {/* Today indicator */}
                {isToday && !hasJournal && (
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
      <div className="widget-card p-4">
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
              const hasJournal = hasJournalEntry(date);
              
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
                  {/* Journal Icon */}
                  {hasJournal && (
                    <div className="absolute top-0.5 right-0.5">
                      <FileText 
                        className="w-2.5 h-2.5 text-amber-400 cursor-pointer hover:text-amber-300" 
                        title="Journal entry available - click to view"
                        onClick={(e) => {
                          e.stopPropagation();
                          openJournalDialog(date);
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Today indicator */}
                  {isToday && !hasJournal && (
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
      <div className="widget-card p-4">
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
  
  const [journalDialog, setJournalDialog] = useState({
    isOpen: false,
    entry: null as any,
    date: ''
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

  const { data: journalEntries } = useQuery({
    queryKey: ["/api/journal"],
  });

  // Debug journal entries
  useEffect(() => {
    if (journalEntries) {
      console.log('📚 Journal entries loaded:', journalEntries.length, journalEntries);
    }
  }, [journalEntries]);

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

  // Function to get filtered trades based on current account selection
  const getFilteredTrades = useCallback(() => {
    if (!trades) return [];
    
    if (accountSelectionMode === 'all') {
      return trades;
    } else if (accountSelectionMode === 'single' && selectedAccountIds.length > 0) {
      return trades.filter(trade => trade.accountId === selectedAccountIds[0]);
    } else if (accountSelectionMode === 'multiple' && selectedAccountIds.length > 0) {
      return trades.filter(trade => selectedAccountIds.includes(trade.accountId));
    }
    
    return trades;
  }, [trades, accountSelectionMode, selectedAccountIds]);

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

  // Query daily trading plans
  const { data: dailyPlans = [] } = useQuery({
    queryKey: ["/api/daily-plans"],
  });

  // Query trading strategies
  const { data: strategies = [] } = useQuery({
    queryKey: ["/api/trading-strategies"],
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
      rFactor,
      totalWinnings: grossProfit,
      totalLosses: grossLoss
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
      // Only calculate payouts for accounts that actually have payout settings enabled
      if (account.type !== 'funded' || !account.fundedPayoutEnabled) return;
      
      const accountTrades = trades.filter(t => t.accountId === account.id);
      const totalPnL = accountTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
      const currentProfit = totalPnL; // Use actual P&L instead of balance difference
      
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

  // Calculate real equity curve from filtered trades - ALWAYS START FROM $0
  const getEquityData = () => {
    if (!trades || !accounts) return [];
    
    // Use filtered trades based on account selection
    const filteredTrades = selectedAccountIds.length > 0
      ? trades.filter(t => selectedAccountIds.includes(t.accountId))
      : trades;
    
    if (filteredTrades.length === 0) return [{ date: "Start", balance: 0 }];
    
    // CRITICAL FIX: Clear any cached balance calculations
    
    const sortedTrades = [...filteredTrades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // CRITICAL FIX: Always start from $0 regardless of account balances
    let runningBalance = 0;
    const equityData = [{ date: "Start", balance: 0 }];
    
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
    <>
      {/* Enhanced Header */}
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gradient-rainbow">
              Trading Dashboard
            </h2>

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


            
            {/* Professional Action Buttons Group */}
            <div className="flex items-center gap-3">
              <Link href="/trades?tab=add">
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Trade
                </Button>
              </Link>

              <Link href="/journal">
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <BookOpen className="mr-1 h-3 w-3" />
                  Journal
                </Button>
              </Link>
              
              {/* Social Media Share Button */}
              <ShareStats 
                totalPnL={combinedAnalytics?.totalPnl || 0}
                winRate={combinedAnalytics?.winRate || 0}
                totalTrades={combinedAnalytics?.totalTrades || 0}
                bestTrade={combinedAnalytics?.bestTrade || 0}
                accountName={selectedAccountIds.length === 1 
                  ? accounts?.find(acc => acc.id === selectedAccountIds[0])?.name || 'Selected Account'
                  : selectedAccountIds.length > 1 
                    ? `${selectedAccountIds.length} Accounts` 
                    : 'All Accounts'
                }
              />
            </div>
            <NotificationDropdown />
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

      <div className="p-6 space-y-6 bg-dark-bg min-h-screen">
        
        {/* Daily Trading Plan & Performance - Consolidated Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center">
              <BarChart3 className="mr-3 h-5 w-5 text-prop-gold" />
              Daily Trading Plan & Performance
            </h2>
          </div>
          
          {/* Enhanced Header - Proper Loss/Profit Display */}
          <div className={`relative transition-all duration-200 rounded-lg overflow-hidden w-full mb-6 ${
            selectedDayData?.dayPnL < 0 
              ? 'bg-gradient-to-br from-red-950/40 via-gray-900/60 to-black/80 border-2 border-red-500/50' 
              : selectedDayData?.dayPnL > 0
              ? 'bg-gradient-to-br from-green-950/40 via-gray-900/60 to-black/80 border-2 border-green-500/50'
              : 'bg-gradient-to-br from-gray-900/40 via-gray-800/60 to-black/80 border border-gray-600/30'
          }`}>
            
            {/* Header Row */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span className="text-lg font-bold text-amber-400">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'short' })} {selectedDate.getDate()}
                </span>
                <div className="w-2 h-2 rounded-full bg-teal-400" />
                <div className="text-xs text-gray-400 bg-gray-800/30 px-2 py-1 rounded">
                  No Plan
                </div>
              </div>
              
              <div className="bg-gray-900/80 rounded-lg px-4 py-3 border border-gray-700/50">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Daily P&L:</span>
                  <span className={`text-lg font-bold ${
                    selectedDayData?.dayPnL >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {selectedDayData?.dayPnL >= 0 ? '+' : ''}${Math.abs(selectedDayData?.dayPnL || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Progress Section */}
            <div className="p-4">
              {selectedDayData?.dayPnL < 0 ? (
                // LOSS SCENARIO - Risk Management Focus
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-gray-300 font-medium">Daily Loss Limit</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      Math.abs(selectedDayData.dayPnL) >= 100 ? 'bg-red-500 text-white animate-pulse' : 
                      Math.abs(selectedDayData.dayPnL) >= 80 ? 'bg-orange-500 text-black' : 
                      'bg-yellow-500 text-black'
                    }`}>
                      {Math.abs(selectedDayData.dayPnL) >= 100 ? 'LIMIT BREACHED' : 
                       Math.abs(selectedDayData.dayPnL) >= 80 ? 'HIGH RISK' : 'CAUTION'}
                    </span>
                  </div>
                  
                  {/* Loss Progress Bar */}
                  <div className="relative">
                    <div className="w-full rounded-full h-6 overflow-hidden bg-gray-700">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out relative ${
                          Math.abs(selectedDayData.dayPnL) >= 100 ? 'bg-red-400' : 
                          Math.abs(selectedDayData.dayPnL) >= 80 ? 'bg-orange-500' : 
                          'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min((Math.abs(selectedDayData.dayPnL) / 100) * 100, 100)}%` }}
                      >
                        {/* Critical pulsing effect */}
                        {Math.abs(selectedDayData.dayPnL) >= 100 && (
                          <div className="absolute inset-0 bg-red-300 animate-pulse opacity-30"></div>
                        )}
                        
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                      </div>
                      
                      {/* Milestone markers */}
                      <div className="absolute inset-0 flex items-center">
                        <div className="absolute left-1/2 w-px h-full bg-white/40 transform -translate-x-1/2"></div>
                        <div className="absolute left-4/5 w-px h-full bg-orange-400/60 transform -translate-x-1/2"></div>
                      </div>
                      
                      {/* Value labels inside bar */}
                      <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-medium">
                        <span className="text-black">0%</span>
                        <span className="text-black">50%</span>
                        <span className="text-black">100%</span>
                      </div>
                      
                      {/* Current value indicator */}
                      <div 
                        className="absolute top-0 h-full flex items-center transform -translate-x-1/2"
                        style={{ left: `${Math.min((Math.abs(selectedDayData.dayPnL) / 100) * 100, 95)}%` }}
                      >
                        <div className="bg-white/90 text-black text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                          ${Math.abs(selectedDayData.dayPnL).toFixed(0)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <span className={`text-sm font-bold ${
                      Math.abs(selectedDayData.dayPnL) >= 100 ? 'text-red-400' : 
                      Math.abs(selectedDayData.dayPnL) >= 80 ? 'text-orange-400' : 
                      'text-yellow-400'
                    }`}>
                      ${Math.abs(selectedDayData.dayPnL)} of $100 daily limit used ({Math.min((Math.abs(selectedDayData.dayPnL) / 100) * 100, 100).toFixed(0)}%)
                    </span>
                  </div>
                  
                  {/* Warning message */}
                  <div className={`text-xs text-center p-2 rounded ${
                    Math.abs(selectedDayData.dayPnL) >= 100 ? 'bg-red-900/50 text-red-300' : 
                    Math.abs(selectedDayData.dayPnL) >= 80 ? 'bg-orange-900/50 text-orange-300' : 
                    'bg-yellow-900/50 text-yellow-300'
                  }`}>
                    {Math.abs(selectedDayData.dayPnL) >= 100 ? 
                      '⚠️ Daily loss limit exceeded - Review risk management immediately' :
                      Math.abs(selectedDayData.dayPnL) >= 80 ? 
                      '⚠️ Approaching daily loss limit - Exercise extreme caution' :
                      '⚠️ Monitor risk levels throughout the day'
                    }
                  </div>
                </div>
              ) : selectedDayData?.dayPnL > 0 ? (
                // PROFIT SCENARIO - Target Achievement Focus
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300 font-medium">Daily Profit Target</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      selectedDayData.dayPnL >= 100 ? 'bg-green-500 text-black' : 
                      selectedDayData.dayPnL >= 50 ? 'bg-blue-500 text-white' : 
                      'bg-gray-500 text-white'
                    }`}>
                      {selectedDayData.dayPnL >= 100 ? 'TARGET ACHIEVED' : 
                       selectedDayData.dayPnL >= 50 ? 'ON TRACK' : 'BUILDING'}
                    </span>
                  </div>
                  
                  {/* Profit Progress Bar */}
                  <div className="relative">
                    <div className="w-full rounded-full h-6 overflow-hidden bg-gray-700">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out relative ${
                          selectedDayData.dayPnL >= 100 ? 'bg-green-500' : 
                          selectedDayData.dayPnL >= 50 ? 'bg-blue-500' : 
                          'bg-gray-400'
                        }`}
                        style={{ width: `${Math.min((selectedDayData.dayPnL / 100) * 100, 100)}%` }}
                      >
                        {selectedDayData.dayPnL >= 100 && (
                          <div className="absolute inset-0 bg-green-300 animate-pulse opacity-50"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                      </div>
                      
                      <div className="absolute inset-0 flex items-center">
                        <div className="absolute left-1/2 w-px h-full bg-white/40 transform -translate-x-1/2"></div>
                      </div>
                      
                      <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-medium">
                        <span className="text-black">0%</span>
                        <span className="text-black">50%</span>
                        <span className="text-black">100%</span>
                      </div>
                      
                      <div 
                        className="absolute top-0 h-full flex items-center transform -translate-x-1/2"
                        style={{ left: `${Math.min((selectedDayData.dayPnL / 100) * 100, 95)}%` }}
                      >
                        <div className="bg-white/90 text-black text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                          ${selectedDayData.dayPnL.toFixed(0)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <span className="text-sm font-bold text-green-400">
                      ${selectedDayData.dayPnL} of $100 target ({((selectedDayData.dayPnL / 100) * 100).toFixed(0)}%)
                    </span>
                  </div>
                  
                  <div className="text-xs text-center p-2 rounded bg-green-900/30 text-green-300">
                    🎉 Great progress! Stay disciplined and protect your gains.
                  </div>
                </div>
              ) : (
                // NEUTRAL SCENARIO - No Trading Activity
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Minus className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300 font-medium">No Trading Activity</span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-600 text-gray-300">
                      NO ACTIVITY
                    </span>
                  </div>
                  
                  <div className="w-full rounded-full h-6 overflow-hidden bg-gray-700">
                    <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-medium">
                      <span className="text-gray-400">0%</span>
                      <span className="text-gray-400">50%</span>
                      <span className="text-gray-400">100%</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-center p-2 rounded widget-card text-gray-400">
                    💤 No trades today. Consider market analysis or planned rest.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* NEW: 2 Rows x 4 Columns Grid - Full Width */}
          <div className="space-y-3 mt-6">
            
            {/* Row 1: Risk+Max Daily Loss, R:R, Trades, Hours Worked */}
            <div className="grid grid-cols-4 gap-4">
              
              {/* Risk + Max Daily Loss Combined */}
              <div className="bg-black/30 rounded-lg p-4 border border-gray-700/50 relative">
                {combinedAnalytics && combinedAnalytics.accounts.length > 0 ? (
                  <>
                    <div className="absolute top-3 right-3 text-xs text-red-400">
                      Max: ${combinedAnalytics.accounts[0]?.dailyLossLimit || 0}
                    </div>
                    <div className="text-3xl font-bold text-red-400 mb-1">
                      ${combinedAnalytics.accounts[0]?.riskPerTrade || 0}
                    </div>
                  </>
                ) : (
                  <div className="text-3xl font-bold text-gray-500 mb-1">--</div>
                )}
                <div className="text-sm text-gray-400">Risk Per Trade</div>
              </div>

              {/* R:R */}
              <div className="bg-black/30 rounded-lg p-4 border border-gray-700/50 relative">
                {combinedAnalytics && combinedAnalytics.accounts.length > 0 && (
                  <div className="absolute top-3 right-3 text-xs text-blue-300">
                    Target: {combinedAnalytics.accounts[0]?.riskRewardRatio || 0} RR
                  </div>
                )}
                <div className="text-3xl font-bold text-blue-400 mb-1">
                  {(() => {
                    const avgReward = selectedDayData?.avgRewardRatio || 0;
                    const avgRisk = selectedDayData?.avgRiskPerTrade || 0;
                    const rRatio = avgRisk > 0 ? avgReward / avgRisk : 0;
                    return rRatio.toFixed(1);
                  })()}
                </div>
                <div className="text-sm text-gray-400">Risk:Reward</div>
                <div className="text-xs text-blue-300 mt-1">
                  AVG. Ratio 1:{(() => {
                    const avgReward = selectedDayData?.avgRewardRatio || 0;
                    const avgRisk = selectedDayData?.avgRiskPerTrade || 0;
                    const rRatio = avgRisk > 0 ? avgReward / avgRisk : 0;
                    return rRatio.toFixed(1);
                  })()}
                </div>
              </div>

              {/* Trades */}
              <div className="bg-black/30 rounded-lg p-4 border border-gray-700/50 relative">
                {combinedAnalytics && combinedAnalytics.accounts.length > 0 && (
                  <div className="absolute top-3 right-3 text-xs text-purple-300">
                    {selectedDayData?.totalDayTrades || 0}/{combinedAnalytics.accounts[0]?.maxDailyTrades || 0}
                  </div>
                )}
                <div className="text-3xl font-bold text-purple-400 mb-1">
                  {selectedDayData?.totalDayTrades || 0}
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-1 mb-2">
                  <div 
                    className="h-1 rounded-full bg-purple-400 transition-all duration-500"
                    style={{ 
                      width: `${Math.min((selectedDayData?.totalDayTrades || 0) / ((combinedAnalytics?.accounts[0]?.maxDailyTrades || 1)) * 100, 100)}%` 
                    }}
                  />
                </div>
                <div className="text-sm text-gray-400 mb-1">Trades Executed</div>
                <div className="text-xs text-gray-300">
                  W:{selectedDayData?.wins || 0} L:{selectedDayData?.losses || 0}
                </div>
              </div>

              {/* Hours Worked */}
              <div className="bg-black/30 rounded-lg p-4 border border-gray-700/50 relative">
                <div className="absolute top-3 right-3 text-xs text-indigo-300">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                    <span>Plan: 6h</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-indigo-400 mb-1">
                  {(() => {
                    const today = new Date().toISOString().split('T')[0];
                    const todayTrades = trades?.filter(t => t.date === today) || [];
                    return todayTrades.length > 0 ? (todayTrades.length * 0.5).toFixed(1) : '0.0';
                  })()}h
                </div>
                <div className="text-sm text-gray-400 mb-1">Hours Worked</div>
                <div className="text-xs text-indigo-300 mb-1">
                  Hourly wage: ${(() => {
                    const today = new Date().toISOString().split('T')[0];
                    const todayTrades = trades?.filter(t => t.date === today) || [];
                    const hoursWorked = todayTrades.length * 0.5;
                    const todayPnL = todayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
                    return hoursWorked > 0 ? (todayPnL / hoursWorked).toFixed(2) : '0.00';
                  })()}
                </div>
                <div className="text-xs text-gray-300">
                  Total: ${(() => {
                    const today = new Date().toISOString().split('T')[0];
                    const todayTrades = trades?.filter(t => t.date === today) || [];
                    return todayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0).toFixed(2);
                  })()} (H. Worked x H. Wage)
                </div>
              </div>
            </div>

            {/* Row 2: Discipline, Risk Utilization, Wins/Losses, Win Rate */}
            <div className="grid grid-cols-4 gap-4">
              
              {/* Discipline */}
              <div className="bg-black/30 rounded-lg p-4 border border-gray-700/50 relative">
                <div className="absolute top-3 right-3">
                  <div className={`px-2 py-1 rounded text-xs font-bold ${
                    !combinedAnalytics || combinedAnalytics.totalTrades === 0 || !selectedDayData || selectedDayData.totalDayTrades === 0 ? 'bg-gray-600 text-gray-300' :
                    (selectedDayData?.disciplineScore || 0) >= 90 ? 'bg-green-500 text-black' : 
                    (selectedDayData?.disciplineScore || 0) >= 80 ? 'bg-blue-500 text-white' : 
                    (selectedDayData?.disciplineScore || 0) >= 70 ? 'bg-yellow-500 text-black' : 
                    'bg-red-500 text-white'
                  }`}>
                    {!combinedAnalytics || combinedAnalytics.totalTrades === 0 || !selectedDayData || selectedDayData.totalDayTrades === 0 ? 'NO DATA' :
                     (selectedDayData?.disciplineScore || 0) >= 90 ? 'ELITE' : 
                     (selectedDayData?.disciplineScore || 0) >= 80 ? 'GOOD' : 
                     (selectedDayData?.disciplineScore || 0) >= 70 ? 'AVG' : 'POOR'}
                  </div>
                </div>
                <div className={`text-3xl font-bold mb-1 ${
                  !combinedAnalytics || combinedAnalytics.totalTrades === 0 || !selectedDayData || selectedDayData.totalDayTrades === 0 ? 'text-gray-500' :
                  (selectedDayData?.disciplineScore || 0) >= 90 ? 'text-green-400' : 
                  (selectedDayData?.disciplineScore || 0) >= 80 ? 'text-green-400' : 
                  (selectedDayData?.disciplineScore || 0) >= 70 ? 'text-yellow-400' : 
                  (selectedDayData?.disciplineScore || 0) >= 60 ? 'text-orange-400' : 'text-red-400'
                }`}>
                  {!combinedAnalytics || combinedAnalytics.totalTrades === 0 || !selectedDayData || selectedDayData.totalDayTrades === 0 ? '--' : 
                   `${Math.round(selectedDayData?.disciplineScore || 0)}% ${
                    (selectedDayData?.disciplineScore || 0) >= 90 ? 'A' : 
                    (selectedDayData?.disciplineScore || 0) >= 80 ? 'B' : 
                    (selectedDayData?.disciplineScore || 0) >= 70 ? 'C' : 
                    (selectedDayData?.disciplineScore || 0) >= 60 ? 'D' : 'F'
                   }`}
                </div>
                <div className="text-sm text-gray-400 mb-1">Discipline Score</div>
                <div className="text-xs text-gray-300">
                  {!combinedAnalytics || combinedAnalytics.totalTrades === 0 || !selectedDayData || selectedDayData.totalDayTrades === 0 ? 
                    'No trades to analyze yet' : 
                    `Risk: ${Math.round((selectedDayData?.disciplineScore || 0) * 0.85)}% • Consistency: ${Math.round((selectedDayData?.disciplineScore || 0) * 0.90)}%`
                  }
                </div>
              </div>

              {/* Risk Utilization */}
              <div className="bg-black/30 rounded-lg p-4 border border-gray-700/50 relative">
                <div className="absolute top-3 right-3 text-xs text-orange-300">
                  Used
                </div>
                <div className="text-3xl font-bold text-orange-400 mb-1">
                  {combinedAnalytics && combinedAnalytics.accounts.length > 0 
                    ? Math.min((selectedDayData?.totalDayTrades || 0) / (combinedAnalytics.accounts[0]?.maxDailyTrades || 1) * 100, 100).toFixed(0)
                    : '0'}%
                </div>
                <div className="text-sm text-gray-400 mb-1">Risk Utilization</div>
                <div className="text-xs text-orange-300">
                  Total: ${combinedAnalytics && combinedAnalytics.accounts.length > 0 
                    ? ((selectedDayData?.totalDayTrades || 0) * (combinedAnalytics.accounts[0]?.riskPerTrade || 0)).toFixed(0)
                    : '0'}
                </div>
              </div>

              {/* Win Rate */}
              <div className="bg-black/30 rounded-lg p-4 border border-gray-700/50 relative">
                <div className="absolute top-3 right-3 text-xs text-green-300">
                  WR
                </div>
                <div className={`text-3xl font-bold mb-1 ${(selectedDayData?.winRate || 0) >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                  {Math.round(selectedDayData?.winRate || 0)}%
                </div>
                <div className="text-sm text-gray-400 mb-1">Win Rate</div>
                <div className="text-xs text-green-300">
                  {selectedDayData?.totalDayTrades > 0 ? `${Math.round(selectedDayData?.winRate || 0)}% success` : 'No trades'}
                </div>
              </div>

              {/* Profit Factor */}
              <div className="bg-black/30 rounded-lg p-4 border border-gray-700/50 relative">
                <div className="absolute top-3 right-3 text-xs text-cyan-300">
                  PF
                </div>
                <div className={`text-3xl font-bold mb-1 ${(() => {
                  const grossWin = selectedDayData?.trades?.filter(t => (t.pnl || 0) > 0).reduce((sum, t) => sum + (t.pnl || 0), 0) || 0;
                  const grossLoss = Math.abs(selectedDayData?.trades?.filter(t => (t.pnl || 0) < 0).reduce((sum, t) => sum + (t.pnl || 0), 0) || 0);
                  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 999 : 0;
                  return profitFactor >= 1 ? 'text-green-400' : 'text-red-400';
                })()}`}>
                  {(() => {
                    const grossWin = selectedDayData?.trades?.filter(t => (t.pnl || 0) > 0).reduce((sum, t) => sum + (t.pnl || 0), 0) || 0;
                    const grossLoss = Math.abs(selectedDayData?.trades?.filter(t => (t.pnl || 0) < 0).reduce((sum, t) => sum + (t.pnl || 0), 0) || 0);
                    const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 999 : 0;
                    return profitFactor.toFixed(2);
                  })()}
                </div>
                <div className="text-sm text-gray-400 mb-1">Profit Factor</div>
                <div className="text-xs text-cyan-300">
                  Gross Win / Gross Loss
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ENHANCED CALENDAR NAVIGATION SECTION */}
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
                    <span className="text-sm font-bold text-green-400">W: ${Math.abs(combinedAnalytics?.totalWinnings || 0).toFixed(0)}</span>
                    <span className="text-sm font-bold text-red-400">L: ${Math.abs(combinedAnalytics?.totalLosses || 0).toFixed(0)}</span>
                  </div>
                  <div className="text-xs text-gray-400">Total Wins and Losses</div>
                  <div className="text-xs text-gray-300 mt-1">
                    Net: ${((combinedAnalytics?.totalWinnings || 0) - Math.abs(combinedAnalytics?.totalLosses || 0)).toFixed(0)}
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

        {/* ===== ✅ SAFE TO IMPLEMENT - NEW REORGANIZED SECTIONS ===== */}
        
        {/* SECTION 3: PERFORMANCE OVERVIEW */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-3">
            <h2 className="text-xl font-bold text-gradient-rainbow flex items-center">
              <TrendingUp className="mr-3 h-5 w-5 text-prop-gold" />
              Performance Overview
            </h2>
            <p className="text-sm text-gray-400">Key trading metrics and portfolio performance</p>
          </div>
          
          {/* ROW 1: Main Performance Metrics (4 widgets) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Net Balance */}
            <div className="widget-card p-4 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Net Balance</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className={`text-2xl font-bold mb-1 ${getValueColor(calculateNetBalance())}`}>
                {formatCurrency(calculateNetBalance())}
              </div>
              <div className="text-xs text-gray-400">Starting balance + Total P&L</div>
            </div>

            {/* Total P&L */}
            <div className="widget-card p-4 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Total P&L</span>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div className={`text-2xl font-bold mb-1 ${getValueColor(combinedAnalytics?.totalPnl || 0)}`}>
                {formatCurrency(combinedAnalytics?.totalPnl || 0)}
              </div>
              <div className="text-xs text-gray-400">Net profit/loss</div>
            </div>

            {/* Win Rate */}
            <div className="widget-card p-4 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Win Rate</span>
                <Target className="w-4 h-4 text-green-400" />
              </div>
              <div className={`text-2xl font-bold mb-1 ${(combinedAnalytics?.winRate || 0) > 50 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPercentage(combinedAnalytics?.winRate || 0)}
              </div>
              <div className="text-xs text-gray-400">Winning trades percentage</div>
            </div>

            {/* Total Trades */}
            <div className="widget-card p-4 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Total Trades</span>
                <Activity className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold mb-1 text-white">
                {combinedAnalytics?.totalTrades || 0}
              </div>
              <div className="text-xs text-gray-400">All executed trades</div>
            </div>
          </div>

          {/* ROW 2: Performance Analysis (4 widgets) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Discipline Score */}
            <div className="widget-card p-4 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Discipline Score</span>
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold mb-1 text-blue-400">
                {(() => {
                  const filteredTrades = accountSelectionMode === 'all' ? trades || [] : 
                    (trades || []).filter(t => selectedAccountIds.includes(t.accountId));
                  
                  if (filteredTrades.length === 0) return '--';
                  
                  const disciplineMetrics = calculateComprehensiveDisciplineMetrics(filteredTrades, accounts || []);
                  const score = Math.round(disciplineMetrics.disciplineScore);
                  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
                  
                  return `${score}% ${grade}`;
                })()}
              </div>
              <div className="text-xs text-gray-400">Trading discipline rating</div>
            </div>

            {/* R Factor */}
            <div className="widget-card p-4 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">R Factor</span>
                <BarChart3 className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold mb-1 text-cyan-400">
                {combinedAnalytics?.rFactor?.toFixed(2) || '0.00'}
              </div>
              <div className="text-xs text-gray-400">Risk/Reward ratio</div>
            </div>

            {/* Profit Factor */}
            <div className="widget-card p-4 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Profit Factor</span>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold mb-1 text-green-400">
                {combinedAnalytics?.profitFactor?.toFixed(2) || '0.00'}
              </div>
              <div className="text-xs text-gray-400">Gross Win / Gross Loss</div>
            </div>

            {/* Avg Win/Loss */}
            <div className="widget-card p-4 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Avg Win/Loss</span>
                <BarChart3 className="w-4 h-4 text-orange-400" />
              </div>
              <div className="flex items-center space-x-2 text-lg font-bold mb-1">
                <span className="text-green-400">{formatCurrency(combinedAnalytics?.averageWin || 0)}</span>
                <span className="text-gray-400">/</span>
                <span className="text-red-400">{formatCurrency(Math.abs(combinedAnalytics?.averageLoss || 0))}</span>
              </div>
              <div className="text-xs text-gray-400">Win vs Loss ratio</div>
            </div>
          </div>

          {/* ROW 3: Combined Widgets - Drawdown Buffer, Consistency Rule, Target Progress */}
          <div className="mt-4">
            <UnrealizedProfitWidgets 
              trades={trades || []} 
              selectedAccountIds={accountSelectionMode === 'all' ? [] : selectedAccountIds}
              accounts={accounts || []}
              targetProgressWidget={
                <TargetProgressWidget 
                  accounts={accounts || []} 
                  trades={trades || []} 
                  selectedAccountIds={accountSelectionMode === 'all' ? [] : selectedAccountIds} 
                />
              }
            />
          </div>
        </section>

        {/* SECTION 4: TRADING ACTIVITY */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-3">
            <h2 className="text-xl font-bold text-gradient-rainbow flex items-center">
              <Activity className="mr-3 h-5 w-5 text-prop-gold" />
              Trading Activity
            </h2>
            <p className="text-sm text-gray-400">Recent trades and performance analytics</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Latest Trades */}
            <div className="bg-gradient-to-br from-gray-900/40 via-gray-800/60 to-black/80 border border-gray-600/30 rounded-lg p-6 hover:border-amber-400/60 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Latest Trades</h3>
                <Activity className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {trades && trades.length > 0 ? (
                  trades
                    .filter(trade => selectedAccountIds.length === 0 || selectedAccountIds.includes(trade.accountId))
                    .slice(-5)
                    .reverse()
                    .map((trade, index) => (
                      <div key={trade.id || index} className="bg-black/30 rounded-lg p-3 hover:bg-black/40 transition-colors duration-200">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-white font-medium">{trade.symbol}</span>
                          <span className={`font-bold ${(trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {(trade.pnl || 0) >= 0 ? '+' : '-'}{formatCurrency(Math.abs(trade.pnl || 0))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                          <span>{new Date(trade.date || '').toLocaleDateString()}</span>
                          <span>{trade.side || 'Unknown'}</span>
                        </div>
                        
                        {/* Trade Links and Actions */}
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-600">
                          <div className="flex gap-2">
                            {trade.tradingViewLink ? (
                              <a
                                href={trade.tradingViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-2 py-1 text-xs bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition-colors"
                              >
                                <BarChart3 className="w-3 h-3 mr-1" />
                                TradingView
                              </a>
                            ) : null}
                            {trade.tradeImage ? (
                              <a
                                href={trade.tradeImage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-2 py-1 text-xs bg-green-600/20 text-green-400 rounded hover:bg-green-600/30 transition-colors"
                              >
                                <FileText className="w-3 h-3 mr-1" />
                                Chart
                              </a>
                            ) : null}
                            {!trade.tradingViewLink && !trade.tradeImage ? (
                              <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-600/20 text-gray-400 rounded">
                                <BarChart3 className="w-3 h-3 mr-1" />
                                No Links
                              </span>
                            ) : null}
                          </div>
                          <Link 
                            href={`/trades?edit=${trade.id}`}
                            className="inline-flex items-center px-2 py-1 text-xs bg-amber-600/20 text-amber-400 rounded hover:bg-amber-600/30 transition-colors"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-400 text-center py-8">No trades yet</p>
                )}
              </div>
            </div>

            {/* Account Equity Curve - Premium Design */}
            <div className="bg-black border border-gray-800 rounded-lg overflow-hidden">
              {/* Premium Header with Live Stats */}
              <div className="px-6 py-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <h3 className="text-lg font-semibold text-white">Equity Curve</h3>
                  </div>
                  
                  {(() => {
                    const filteredTrades = trades?.filter(trade => 
                      selectedAccountIds.length === 0 || selectedAccountIds.includes(trade.accountId)
                    ) || [];
                    
                    if (filteredTrades.length === 0) {
                      return (
                        <div className="flex items-center space-x-6 text-sm">
                          <span className="text-gray-400">No data available</span>
                        </div>
                      );
                    }

                    const selectedAccount = accounts?.find(acc => 
                      selectedAccountIds.length === 1 ? selectedAccountIds.includes(acc.id) : false
                    );
                    const accountCost = selectedAccount?.accountCost || selectedAccount?.startingBalance || 0;
                    
                    // Calculate total P&L directly from trades (no starting balance)
                    const totalPnl = filteredTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
                    const netBalance = totalPnl; // CRITICAL FIX: Show pure P&L, not account balance
                    const totalReturn = ((totalPnl / accountCost) * 100);
                    const winningTrades = filteredTrades.filter(t => (t.pnl || 0) > 0).length;
                    const winRate = filteredTrades.length > 0 ? (winningTrades / filteredTrades.length) * 100 : 0;

                    return (
                      <div className="flex items-center space-x-6 text-sm">
                        <span className="text-gray-400">{(combinedAnalytics?.totalPnl || 0) >= 0 ? 'Account Positive' : 'Account Negative'}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Premium Chart Container */}
              <div className="p-6">
                <div className="bg-gray-950 rounded-lg border border-gray-800 p-4 relative overflow-hidden" style={{ minHeight: '280px' }}>
                  {(() => {
                    const filteredTrades = trades?.filter(trade => 
                      selectedAccountIds.length === 0 || selectedAccountIds.includes(trade.accountId)
                    ) || [];
                    
                    if (filteredTrades.length === 0) {
                      return (
                        <div className="h-full flex items-center justify-center text-gray-400" style={{ minHeight: '280px' }}>
                          <div className="text-center">
                            <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                            <p className="text-sm">No trades to display</p>
                            <p className="text-xs mt-1">Complete trades to see equity curve</p>
                          </div>
                        </div>
                      );
                    }

                    // Calculate equity curve data
                    const sortedTrades = [...filteredTrades].sort((a, b) => 
                      new Date(a.date || '').getTime() - new Date(b.date || '').getTime()
                    );
                    
                    const selectedAccount = accounts?.find(acc => 
                      selectedAccountIds.length === 1 ? selectedAccountIds.includes(acc.id) : false
                    );
                    const accountCost = selectedAccount?.accountCost || selectedAccount?.startingBalance || 25000;
                    
                    let runningBalance = 0; // CRITICAL FIX: Always start equity curve from $0
                    const equityPoints = [{ 
                      x: 0, 
                      y: 0, 
                      trade: null, 
                      tradesCount: 0, 
                      date: 'Start'
                    }];
                    
                    sortedTrades.forEach((trade, index) => {
                      runningBalance += (trade.pnl || 0);
                      equityPoints.push({ 
                        x: index + 1, 
                        y: runningBalance, 
                        trade: trade,
                        tradesCount: index + 1,
                        date: trade.date || ''
                      });
                    });

                    const maxBalance = Math.max(...equityPoints.map(p => p.y));
                    const minBalance = Math.min(...equityPoints.map(p => p.y));
                    const range = Math.max(maxBalance - minBalance, Math.abs(maxBalance) * 0.1 || 100);
                    const bufferPadding = range * 0.15;
                    const chartMin = minBalance - bufferPadding;
                    const chartMax = maxBalance + bufferPadding;
                    const chartRange = chartMax - chartMin;

                    // Chart dimensions
                    const chartWidth = 600;
                    const chartHeight = 280;
                    const padding = { top: 30, right: 60, bottom: 40, left: 60 };
                    const plotWidth = chartWidth - padding.left - padding.right;
                    const plotHeight = chartHeight - padding.top - padding.bottom;

                    // Calculate breakeven line position (always at $0 since we start from 0)
                    const breakevenY = padding.top + plotHeight - ((0 - chartMin) / chartRange) * plotHeight;

                    return (
                      <div className="h-full relative" id="equity-chart-container">
                        {/* Grid Background */}
                        <div className="absolute inset-0">
                          <svg className="w-full h-full">
                            <defs>
                              <pattern id="premiumGrid" width="40" height="28" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 28" fill="none" stroke="#1f2937" strokeWidth="0.5"/>
                              </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#premiumGrid)" />
                          </svg>
                        </div>

                        {/* Ultra Compact Pro Tooltip */}
                        <div 
                          id="chart-tooltip" 
                          className="absolute z-50 pointer-events-none opacity-0 transition-opacity duration-200 bg-black/90 backdrop-blur-sm border border-yellow-400/30 rounded-md px-2 py-1 text-xs text-white shadow-xl max-w-36"
                          style={{ display: 'none' }}
                        >
                          <div id="tooltip-content"></div>
                        </div>

                        {/* Main Chart SVG */}
                        <svg 
                          className="w-full h-full relative z-10" 
                          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                          onMouseMove={(e) => {
                            const svg = e.currentTarget;
                            const rect = svg.getBoundingClientRect();
                            const x = ((e.clientX - rect.left) / rect.width) * chartWidth;
                            const y = ((e.clientY - rect.top) / rect.height) * chartHeight;
                            
                            // Check if mouse is over a data point
                            const tolerance = 15;
                            equityPoints.forEach((point, index) => {
                              const pointX = padding.left + (point.x / (equityPoints.length - 1)) * plotWidth;
                              const pointY = padding.top + plotHeight - ((point.y - chartMin) / chartRange) * plotHeight;
                              
                              if (Math.abs(x - pointX) < tolerance && Math.abs(y - pointY) < tolerance) {
                                const tooltip = document.getElementById('chart-tooltip');
                                const tooltipContent = document.getElementById('tooltip-content');
                                
                                if (tooltip && tooltipContent) {
                                  let content = '';
                                  if (point.trade) {
                                    content = `
                                      <div class="font-semibold text-yellow-400">${point.trade.symbol}</div>
                                      <div class="text-xs mt-1">
                                        <div>P&L: <span class="${point.trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}">${point.trade.pnl >= 0 ? '+' : ''}$${Math.abs(point.trade.pnl).toFixed(2)}</span></div>
                                        <div>Date: ${new Date(point.date).toLocaleDateString()}</div>
                                        <div>Trade #${point.tradesCount}</div>
                                      </div>
                                    `;
                                  } else {
                                    content = `
                                      <div class="font-semibold text-yellow-400">Starting Point</div>
                                      <div class="text-xs mt-1">
                                        <div>Balance: $0.00</div>
                                        <div>Date: ${point.date}</div>
                                      </div>
                                    `;
                                  }
                                  
                                  tooltipContent.innerHTML = content;
                                  // Center the tooltip and keep it compact
                                  const tooltipRect = tooltip.getBoundingClientRect();
                                  const containerRect = e.currentTarget.getBoundingClientRect();
                                  
                                  // Position tooltip in center of chart, always visible
                                  const leftPos = Math.max(10, Math.min(containerRect.width / 2 - 75, containerRect.width - 160));
                                  const topPos = Math.max(10, containerRect.height / 2 - 40);
                                  
                                  tooltip.style.left = `${leftPos}px`;
                                  tooltip.style.top = `${topPos}px`;
                                  tooltip.style.display = 'block';
                                  tooltip.style.opacity = '1';
                                }
                              }
                            });
                          }}
                          onMouseLeave={() => {
                            const tooltip = document.getElementById('chart-tooltip');
                            if (tooltip) {
                              tooltip.style.opacity = '0';
                              setTimeout(() => {
                                tooltip.style.display = 'none';
                              }, 200);
                            }
                          }}
                        >
                          <defs>
                            {/* Premium Gradients */}
                            <linearGradient id="equityAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3"/>
                              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.1"/>
                            </linearGradient>
                            
                            <linearGradient id="profitZone" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.05"/>
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0.02"/>
                            </linearGradient>
                            
                            <linearGradient id="lossZone" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.02"/>
                              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05"/>
                            </linearGradient>

                            {/* Glow filter */}
                            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                              <feMerge> 
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                              </feMerge>
                            </filter>
                          </defs>

                          {/* Profit/Loss Zones */}
                          <rect
                            x={padding.left}
                            y={padding.top}
                            width={plotWidth}
                            height={Math.max(0, breakevenY - padding.top)}
                            fill="url(#profitZone)"
                          />
                          <rect
                            x={padding.left}
                            y={breakevenY}
                            width={plotWidth}
                            height={Math.max(0, padding.top + plotHeight - breakevenY)}
                            fill="url(#lossZone)"
                          />

                          {/* Y-axis grid lines and labels */}
                          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                            const y = padding.top + (ratio * plotHeight);
                            const value = chartMax - (ratio * chartRange);
                            return (
                              <g key={index}>
                                <line
                                  x1={padding.left}
                                  y1={y}
                                  x2={padding.left + plotWidth}
                                  y2={y}
                                  stroke="#374151"
                                  strokeWidth="1"
                                  strokeDasharray="2,2"
                                  opacity="0.5"
                                />
                                <text
                                  x={padding.left - 10}
                                  y={y + 4}
                                  textAnchor="end"
                                  className="fill-gray-400 text-xs font-mono"
                                  fontSize="11"
                                >
                                  {formatCurrency(value)}
                                </text>
                              </g>
                            );
                          })}

                          {/* Breakeven line */}
                          <line
                            x1={padding.left}
                            y1={breakevenY}
                            x2={padding.left + plotWidth}
                            y2={breakevenY}
                            stroke="#fbbf24"
                            strokeWidth="2"
                            strokeDasharray="6,4"
                            opacity="0.8"
                            filter="url(#glow)"
                          />

                          {/* Area fill under curve */}
                          <path
                            d={`M ${padding.left} ${breakevenY} ${equityPoints.map((point, index) => {
                              const x = padding.left + (index / (equityPoints.length - 1)) * plotWidth;
                              const y = padding.top + plotHeight - ((point.y - chartMin) / chartRange) * plotHeight;
                              return `L ${x} ${y}`;
                            }).join(' ')} L ${padding.left + plotWidth} ${breakevenY} Z`}
                            fill="url(#equityAreaGradient)"
                            opacity="0.6"
                          />

                          {/* Main equity curve line */}
                          <path
                            d={equityPoints.map((point, index) => {
                              const x = padding.left + (index / (equityPoints.length - 1)) * plotWidth;
                              const y = padding.top + plotHeight - ((point.y - chartMin) / chartRange) * plotHeight;
                              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                            }).join(' ')}
                            fill="none"
                            stroke="#22d3ee"
                            strokeWidth="3"
                            filter="url(#glow)"
                          />
                          
                          {/* Interactive data points */}
                          {equityPoints.map((point, index) => {
                            const x = padding.left + (index / (equityPoints.length - 1)) * plotWidth;
                            const y = padding.top + plotHeight - ((point.y - chartMin) / chartRange) * plotHeight;
                            const isProfit = point.y >= 0; // Compare to $0 since curve starts from 0
                            
                            return (
                              <circle
                                key={index}
                                cx={x}
                                cy={y}
                                r="4"
                                fill={isProfit ? "#10b981" : "#ef4444"}
                                stroke="white"
                                strokeWidth="2"
                                className="cursor-pointer hover:r-6 transition-all duration-200"
                                filter="url(#glow)"
                                onMouseEnter={(e) => {
                                  const tooltip = document.getElementById('chart-tooltip');
                                  if (tooltip) {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const container = document.getElementById('equity-chart-container');
                                    if (container) {
                                      const containerRect = container.getBoundingClientRect();
                                      
                                      // Calculate optimal position to prevent cutoff
                                      let left = rect.left - containerRect.left + 10;
                                      let top = rect.top - containerRect.top - 100;
                                      
                                      // Prevent tooltip from going off-screen to the right
                                      if (left + 180 > containerRect.width) {
                                        left = rect.left - containerRect.left - 190; // Move to left side
                                      }
                                      
                                      // Prevent tooltip from going off-screen at top
                                      if (top < 10) {
                                        top = rect.top - containerRect.top + 30; // Move below the point
                                      }
                                      
                                      tooltip.style.left = Math.max(10, left) + 'px';
                                      tooltip.style.top = Math.max(10, top) + 'px';
                                    }
                                    
                                    const trade = point.trade;
                                    if (trade) {
                                      // Calculate return percentage based on original stop loss risk
                                      const originalStopLossRisk = trade.riskAmount || Math.abs((trade.entryPrice || 0) - (trade.initialStopLoss || 0)) * (trade.quantity || 1);
                                      const returnPercent = originalStopLossRisk > 0 ? ((trade.pnl || 0) / originalStopLossRisk) * 100 : 0;
                                      
                                      // Calculate running balance up to this point
                                      const runningBalance = point.y;
                                      
                                      tooltip.innerHTML = `
                                        <div class="bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-3 w-[180px] shadow-2xl">
                                          <!-- Header -->
                                          <div class="mb-2">
                                            <div class="text-white font-bold text-sm mb-1">${trade.symbol} #${index}</div>
                                            <div class="text-xs text-gray-400">${new Date(trade.date || '').toLocaleDateString('en-GB')} ${new Date(trade.fillTime || trade.date || '').toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                                          </div>

                                          <!-- Main value -->
                                          <div class="text-center mb-3">
                                            <div class="text-xl font-black ${(trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}">${(trade.pnl || 0) >= 0 ? '+' : ''}$${Math.abs(trade.pnl || 0).toFixed(2)}</div>
                                          </div>

                                          <!-- Compact stats -->
                                          <div class="space-y-1 text-xs">
                                            <div class="flex justify-between">
                                              <span class="text-gray-400">Net:</span>
                                              <span class="text-white font-semibold">$${runningBalance.toFixed(2)}</span>
                                            </div>
                                            <div class="flex justify-between">
                                              <span class="text-gray-400">Return:</span>
                                              <span class="${returnPercent >= 0 ? 'text-green-400' : 'text-red-400'} font-semibold">${returnPercent.toFixed(1)}%</span>
                                            </div>
                                          </div>
                                        </div>
                                      `;
                                    } else {
                                      tooltip.innerHTML = `
                                        <div class="bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-3 w-[180px] shadow-2xl">
                                          <div class="text-center">
                                            <div class="text-white font-bold text-sm mb-1">Start #0</div>
                                            <div class="text-xl font-black text-white">$0.00</div>
                                            <div class="text-xs text-gray-400 mt-2">Starting Point</div>
                                          </div>
                                        </div>
                                      `;
                                    }
                                    
                                    tooltip.style.opacity = '1';
                                  }
                                }}
                                onMouseLeave={() => {
                                  const tooltip = document.getElementById('chart-tooltip');
                                  if (tooltip) {
                                    tooltip.style.opacity = '0';
                                  }
                                }}
                              />
                            );
                          })}
                        </svg>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: ACCOUNT MANAGEMENT */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-3">
            <div>
              <h2 className="text-xl font-bold text-gradient-rainbow flex items-center">
                <Users className="mr-3 h-5 w-5 text-prop-gold" />
                Account Management
              </h2>
              <p className="text-sm text-gray-400">Account status, discipline scores, and portfolio overview</p>
            </div>

          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Account Status */}
            <div className="bg-gradient-to-br from-gray-900/40 via-gray-800/60 to-black/80 border border-gray-600/30 rounded-lg p-6 hover:border-amber-400/60 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Account Status</h3>
                <User className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Accounts:</span>
                  <span className="text-green-400 font-semibold">{accounts?.filter(a => a.status === 'active').length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Challenge Accounts:</span>
                  <span className="text-yellow-400 font-semibold">{accounts?.filter(a => a.type === 'challenge').length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Funded Accounts:</span>
                  <span className="text-green-400 font-semibold">{accounts?.filter(a => a.type === 'funded').length || 0}</span>
                </div>
              </div>
            </div>

            {/* Max Maserati Account */}
            <div className="bg-gradient-to-br from-gray-900/40 via-gray-800/60 to-black/80 border border-gray-600/30 rounded-lg p-6 hover:border-amber-400/60 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Primary Account</h3>
                <User className="w-5 h-5 text-amber-400" />
              </div>
              {accounts?.[0] && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white font-semibold">{accounts[0].name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className={`font-semibold capitalize ${accounts[0].type === 'funded' ? 'text-green-400' : accounts[0].type === 'challenge' ? 'text-yellow-400' : 'text-blue-400'}`}>
                      {accounts[0].type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Net:</span>
                    <span className="text-white font-semibold">{formatCurrency(0)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Portfolio Summary */}
            <div className="bg-gradient-to-br from-gray-900/40 via-gray-800/60 to-black/80 border border-gray-600/30 rounded-lg p-6 hover:border-amber-400/60 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Portfolio Summary</h3>
                <BarChart3 className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Capital:</span>
                  <span className="text-white font-semibold">{formatCurrency(accounts?.reduce((sum, acc) => sum + (acc.startingBalance || 0), 0) || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total P&L:</span>
                  <span className={`font-semibold ${getValueColor(combinedAnalytics?.totalPnl || 0)}`}>
                    {formatCurrency(combinedAnalytics?.totalPnl || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ROI:</span>
                  <span className={`font-semibold ${getValueColor(calculateROI())}`}>
                    {formatPercentage(calculateROI())}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: RISK MANAGEMENT */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-3">
            <h2 className="text-xl font-bold text-gradient-rainbow flex items-center">
              <Shield className="mr-3 h-5 w-5 text-prop-gold" />
              Risk Management
            </h2>
            <p className="text-sm text-gray-400">Discipline analysis and risk monitoring</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Discipline Score Breakdown */}
            <div className="bg-gradient-to-br from-gray-900/40 via-gray-800/60 to-black/80 border border-gray-600/30 rounded-lg p-6 hover:border-amber-400/60 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Discipline Score Breakdown</h3>
                <Brain className="w-5 h-5 text-amber-400" />
              </div>
              {(() => {
                const filteredTrades = selectedAccountIds.length > 0
                  ? trades?.filter(t => selectedAccountIds.includes(t.accountId)) || []
                  : trades || [];
                
                if (filteredTrades.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-lg">No Data</p>
                      <p className="text-gray-500 text-sm">No trades to analyze</p>
                    </div>
                  );
                }
                
                const disciplineMetrics = calculateComprehensiveDisciplineMetrics(
                  filteredTrades,
                  accounts || [],
                  selectedAccountIds.length === 1 ? selectedAccountIds[0].toString() : "all"
                );
                
                return (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Overall Score:</span>
                      <span className={`text-xl font-bold ${disciplineMetrics.disciplineScore >= 80 ? 'text-green-400' : disciplineMetrics.disciplineScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {(() => {
                          const score = Math.round(disciplineMetrics.disciplineScore);
                          const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
                          return `${score}% ${grade}`;
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Risk Management:</span>
                      <span className="text-orange-400 font-semibold">{Math.round(disciplineMetrics.riskManagementScore)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Emotional Control:</span>
                      <span className="text-blue-400 font-semibold">{Math.round(disciplineMetrics.emotionalControlScore)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Consistency:</span>
                      <span className="text-green-400 font-semibold">{Math.round(disciplineMetrics.consistencyScore)}%</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Risk Alert */}
            <div className="bg-gradient-to-br from-gray-900/40 via-gray-800/60 to-black/80 border border-gray-600/30 rounded-lg p-6 hover:border-amber-400/60 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Risk Alert</h3>
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-3">
                {accounts && trades ? (
                  accounts
                    .map(account => {
                      const accountTrades = trades.filter(t => t.accountId === account.id);
                      const totalPnl = accountTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
                      const dailyLossLimit = account.dailyLossLimit || (account.maxDrawdown ? account.maxDrawdown * 0.05 : 1000);
                      const currentDrawdown = Math.abs(Math.min(0, totalPnl));
                      const riskPercentage = (currentDrawdown / dailyLossLimit) * 100;
                      
                      return {
                        account,
                        riskPercentage: Math.min(100, riskPercentage),
                        currentDrawdown,
                        dailyLossLimit
                      };
                    })
                    .sort((a, b) => b.riskPercentage - a.riskPercentage)
                    .slice(0, 3)
                    .map(({ account, riskPercentage, currentDrawdown, dailyLossLimit }) => (
                      <div key={account.id} className="bg-black/30 rounded-lg p-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="truncate">{account.name}</span>
                          <span className={`font-medium ${
                            riskPercentage > 80 ? 'text-red-400' : 
                            riskPercentage > 60 ? 'text-orange-400' : 
                            'text-yellow-400'
                          }`}>
                            {riskPercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              riskPercentage > 80 ? 'bg-red-500' : 
                              riskPercentage > 60 ? 'bg-orange-500' : 
                              'bg-yellow-500'
                            }`}
                            style={{ width: `${Math.min(100, riskPercentage)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatCurrency(currentDrawdown)} / {formatCurrency(dailyLossLimit)} risk used
                        </p>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-400 text-center py-4">No accounts to monitor</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: INVESTMENT TRACKING */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-3">
            <h2 className="text-xl font-bold text-gradient-rainbow flex items-center">
              <CreditCard className="mr-3 h-5 w-5 text-prop-gold" />
              Investment Tracking
            </h2>
            <p className="text-sm text-gray-400">Account costs, spending, payouts and ROI analysis</p>
          </div>
          
          {/* ROW 1: Basic Costs (3 widgets) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gradient-to-br from-gray-900/40 via-gray-800/60 to-black/80 border border-gray-600/30 rounded-lg p-4 hover:border-amber-400/60 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Total Spent on Accounts</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold mb-1 text-red-400">
                {formatCurrency(accounts?.reduce((sum, acc) => sum + (acc.accountCost || 0), 0) || 0)}
              </div>
              <div className="text-xs text-gray-400">Challenge & setup costs</div>
            </div>

            <div className="bg-gradient-to-br from-gray-900/40 via-gray-800/60 to-black/80 border border-gray-600/30 rounded-lg p-4 hover:border-amber-400/60 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Reset Cost</span>
                <RotateCcw className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-2xl font-bold mb-1 text-orange-400">
                {formatCurrency(accounts?.reduce((sum, acc) => sum + (acc.totalResetsCost || 0), 0) || 0)}
              </div>
              <div className="text-xs text-gray-400">Failed account resets</div>
            </div>

            <div className="bg-gradient-to-br from-gray-900/40 via-gray-800/60 to-black/80 border border-gray-600/30 rounded-lg p-4 hover:border-amber-400/60 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Activation Costs</span>
                <CheckCircle className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold mb-1 text-blue-400">
                {formatCurrency(accounts?.reduce((sum, acc) => sum + (acc.activationCost || 0), 0) || 0)}
              </div>
              <div className="text-xs text-gray-400">Account activation fees</div>
            </div>
          </div>

          {/* ROW 2: Financial Summary (3 widgets) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-gray-900/40 via-gray-800/60 to-black/80 border border-gray-600/30 rounded-lg p-4 hover:border-amber-400/60 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Total Spent</span>
                <CreditCard className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl font-bold mb-1 text-red-400">
                {formatCurrency((accounts?.reduce((sum, acc) => sum + (acc.accountCost || 0) + (acc.totalResetsCost || 0) + (acc.activationCost || 0), 0) || 0))}
              </div>
              <div className="text-xs text-gray-400">Total investment</div>
            </div>

            <div className="bg-gradient-to-br from-gray-900/40 via-gray-800/60 to-black/80 border border-gray-600/30 rounded-lg p-4 hover:border-amber-400/60 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Payouts</span>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold mb-1 text-green-400">
                {formatCurrency(calculateTotalAvailablePayouts())}
              </div>
              <div className="text-xs text-gray-400">Actual payouts received</div>
            </div>

            <div className="bg-gradient-to-br from-gray-900/40 via-gray-800/60 to-black/80 border border-gray-600/30 rounded-lg p-4 hover:border-amber-400/60 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Profitability</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <div className={`text-2xl font-bold mb-1 ${getValueColor(calculateTotalAvailablePayouts() - (accounts?.reduce((sum, acc) => sum + (acc.accountCost || 0) + (acc.totalResetsCost || 0) + (acc.activationCost || 0), 0) || 0))}`}>
                {formatCurrency(calculateTotalAvailablePayouts() - (accounts?.reduce((sum, acc) => sum + (acc.accountCost || 0) + (acc.totalResetsCost || 0) + (acc.activationCost || 0), 0) || 0))}
              </div>
              <div className="text-xs text-gray-400">Real profit (received payouts - costs)</div>
            </div>
          </div>
        </section>

        {/* SECTION 7: ADVANCED STATISTICS */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-3">
            <h2 className="text-xl font-bold text-gradient-rainbow flex items-center">
              <BarChart3 className="mr-3 h-5 w-5 text-prop-gold" />
              Advanced Statistics
            </h2>
            <p className="text-sm text-gray-400">Deep performance analytics and behavioral insights</p>
          </div>
          
          {/* ROW 1: Core Advanced Metrics (4 widgets) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Profit Factor */}
            <div className="bg-gradient-to-br from-gray-900/40 via-gray-800/60 to-black/80 border border-gray-600/30 rounded-lg p-4 hover:border-amber-400/60 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Profit Factor</span>
                <Target className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold mb-1 text-green-400">
                {(() => {
                  const filteredTrades = getFilteredTrades();
                  const totalWinnings = filteredTrades.filter(t => (t.pnl || 0) > 0).reduce((sum, t) => sum + (t.pnl || 0), 0);
                  const totalLosses = Math.abs(filteredTrades.filter(t => (t.pnl || 0) < 0).reduce((sum, t) => sum + (t.pnl || 0), 0));
                  return totalLosses > 0 ? (totalWinnings / totalLosses).toFixed(2) : totalWinnings > 0 ? '∞' : '0.00';
                })()}
              </div>
              <div className="text-xs text-gray-400">Gross profits / gross losses</div>
            </div>

            {/* Sharpe Ratio */}
            <div className="bg-gradient-to-br from-gray-900/40 via-gray-800/60 to-black/80 border border-gray-600/30 rounded-lg p-4 hover:border-amber-400/60 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Sharpe Ratio</span>
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold mb-1 text-blue-400">
                {(() => {
                  const filteredTrades = getFilteredTrades();
                  if (filteredTrades.length === 0) return '0.00';
                  const returns = filteredTrades.map(t => t.pnl || 0);
                  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
                  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
                  const stdDev = Math.sqrt(variance);
                  return stdDev > 0 ? (avgReturn / stdDev).toFixed(2) : '0.00';
                })()}
              </div>
              <div className="text-xs text-gray-400">Risk-adjusted returns</div>
            </div>

            {/* Max Consecutive Wins */}
            <div className="bg-gradient-to-br from-gray-900/40 via-gray-800/60 to-black/80 border border-gray-600/30 rounded-lg p-4 hover:border-amber-400/60 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Max Consecutive Wins</span>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold mb-1 text-green-400">
                {(() => {
                  const filteredTrades = getFilteredTrades();
                  let maxWins = 0, currentWins = 0;
                  filteredTrades.forEach(trade => {
                    if ((trade.pnl || 0) > 0) {
                      currentWins++;
                      maxWins = Math.max(maxWins, currentWins);
                    } else {
                      currentWins = 0;
                    }
                  });
                  return maxWins;
                })()}
              </div>
              <div className="text-xs text-gray-400">Best winning streak</div>
            </div>

            {/* Max Consecutive Losses */}
            <div className="bg-gradient-to-br from-gray-900/40 via-gray-800/60 to-black/80 border border-gray-600/30 rounded-lg p-4 hover:border-amber-400/60 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Max Consecutive Losses</span>
                <TrendingDown className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl font-bold mb-1 text-red-400">
                {(() => {
                  const filteredTrades = getFilteredTrades();
                  let maxLosses = 0, currentLosses = 0;
                  filteredTrades.forEach(trade => {
                    if ((trade.pnl || 0) < 0) {
                      currentLosses++;
                      maxLosses = Math.max(maxLosses, currentLosses);
                    } else {
                      currentLosses = 0;
                    }
                  });
                  return maxLosses;
                })()}
              </div>
              <div className="text-xs text-gray-400">Worst losing streak</div>
            </div>
          </div>

          {/* ROW 2: Risk Metrics (3 widgets) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Largest Win */}
            <div className="bg-gradient-to-br from-gray-900/40 via-gray-800/60 to-black/80 border border-gray-600/30 rounded-lg p-4 hover:border-amber-400/60 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Largest Win</span>
                <Trophy className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold mb-1 text-green-400">
                {formatCurrency(Math.max(...getFilteredTrades().map(t => t.pnl || 0), 0))}
              </div>
              <div className="text-xs text-gray-400">Best single trade</div>
            </div>

            {/* Largest Loss */}
            <div className="bg-gradient-to-br from-gray-900/40 via-gray-800/60 to-black/80 border border-gray-600/30 rounded-lg p-4 hover:border-amber-400/60 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Largest Loss</span>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl font-bold mb-1 text-red-400">
                {formatCurrency(Math.min(...getFilteredTrades().map(t => t.pnl || 0), 0))}
              </div>
              <div className="text-xs text-gray-400">Worst single trade</div>
            </div>

            {/* Average R:R Ratio */}
            <div className="bg-gradient-to-br from-gray-900/40 via-gray-800/60 to-black/80 border border-gray-600/30 rounded-lg p-4 hover:border-amber-400/60 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Avg R:R Ratio</span>
                <Scale className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold mb-1 text-purple-400">
                {(() => {
                  const filteredTrades = getFilteredTrades();
                  const validRRTrades = filteredTrades.filter(t => t.riskRewardRatio && t.riskRewardRatio > 0);
                  if (validRRTrades.length === 0) return '0.00';
                  const avgRR = validRRTrades.reduce((sum, t) => sum + (t.riskRewardRatio || 0), 0) / validRRTrades.length;
                  return avgRR.toFixed(2);
                })()}
              </div>
              <div className="text-xs text-gray-400">Risk to reward ratio</div>
            </div>
          </div>
        </section>

      </div>

      {/* Journal Entry Dialog */}
      <Dialog open={journalDialog.isOpen} onOpenChange={(open) => setJournalDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-amber-500/30 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-400 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Trading Journal Entry - {journalDialog.date}
            </DialogTitle>
          </DialogHeader>
          
          {journalDialog.entry && (
            <div className="space-y-6 py-4">
              {/* Market Conditions & Emotional State */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-amber-300 font-semibold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Market Conditions
                  </h3>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {journalDialog.entry.marketConditions || 'Not specified'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-amber-300 font-semibold flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Emotional State
                  </h3>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {journalDialog.entry.emotionalState || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* What Went Wrong & What Went Right */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-red-400 font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    What Went Wrong
                  </h3>
                  <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {journalDialog.entry.whatWentWrong || 'Not specified'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-green-400 font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    What Went Right
                  </h3>
                  <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {journalDialog.entry.whatWentRight || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lessons & Tomorrow's Plan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-blue-400 font-semibold flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Key Lessons
                  </h3>
                  <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {journalDialog.entry.keyLessonsLearned || 'Not specified'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-purple-400 font-semibold flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Tomorrow's Plan
                  </h3>
                  <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {journalDialog.entry.tomorrowsPlan || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-gray-600/30">
                <Button 
                  onClick={() => setJournalDialog(prev => ({ ...prev, isOpen: false }))}
                  className="bg-amber-600 hover:bg-amber-500 text-black font-semibold px-8"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                className="flex-1 bg-accent-orange hover:bg-orange-600"
              >
                {updateWageMutation.isPending ? 'Updating...' : 'Update Wage'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowWageModal(false)}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
