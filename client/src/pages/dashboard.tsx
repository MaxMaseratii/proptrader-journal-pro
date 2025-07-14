import React, { useState, useMemo } from "react";
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
  CreditCard
} from "lucide-react";
import type { Account, Trade } from "@shared/schema";

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
  const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('dashboard-selected-accounts');
    return saved ? JSON.parse(saved) : [];
  });
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

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: spending } = useQuery({
    queryKey: ["/api/spending"],
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

  // Calculate real equity curve from trades
  const getEquityData = () => {
    if (!trades || !accounts) return [];
    
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const startingBalance = accounts.reduce((sum, acc) => sum + acc.startingBalance, 0);
    
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
    <>
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

      <div className="p-6 space-y-8">


        {/* UNIFIED DASHBOARD: 6-ROW PROFESSIONAL LAYOUT */}
        
        {/* ROW 1: PRIMARY FINANCIAL METRICS */}
        <div className="widget-grid row-1 mb-6">
          {/* Net Balance */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Net Balance</p>
                <p className={`widget-value ${getValueColor(calculateNetBalance())}`}>
                  {formatCurrency(calculateNetBalance())}
                </p>
                <p className="widget-description">Starting balance + Total P&L</p>
              </div>
              <div className="widget-icon-square">
                <DollarSign className="widget-icon" />
              </div>
            </div>
          </div>

          {/* Daily P&L */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Daily P&L</p>
                <p className={`widget-value ${getValueColor(
                  (() => {
                    const today = new Date().toISOString().split('T')[0];
                    const todayTrades = trades?.filter(trade => trade.date === today) || [];
                    return todayTrades.reduce((sum, trade) => sum + trade.pnl, 0);
                  })()
                )}`}>
                  {formatCurrency(
                    (() => {
                      const today = new Date().toISOString().split('T')[0];
                      const todayTrades = trades?.filter(trade => trade.date === today) || [];
                      return todayTrades.reduce((sum, trade) => sum + trade.pnl, 0);
                    })()
                  )}
                </p>
                <p className="widget-description">Today's performance</p>
              </div>
              <div className="widget-icon-square">
                <TrendingDown className="widget-icon" />
              </div>
            </div>
          </div>

          {/* Total P&L - moved from bottom section */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Total P&L</p>
                <p className={`widget-value ${getValueColor(combinedAnalytics?.totalPnl || 0)}`}>
                  {formatCurrency(combinedAnalytics?.totalPnl || 0)}
                </p>
                <p className="widget-description">Net profit/loss</p>
              </div>
              <div className="widget-icon-square">
                <DollarSign className="widget-icon" />
              </div>
            </div>
          </div>
          {/* Win Rate - Add to complete Row 1 */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Win Rate</p>
                <p className={`widget-value ${(combinedAnalytics?.winRate || 0) > 50 ? 'text-green-400' : (combinedAnalytics?.winRate || 0) < 50 ? 'text-red-400' : 'text-white'}`}>
                  {formatPercentage(combinedAnalytics?.winRate || 0)}
                </p>
                <p className="widget-description">Winning trades percentage</p>
              </div>
              <div className="widget-icon-square">
                <Target className="widget-icon" />
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: PERFORMANCE ANALYTICS */}
        <div className="widget-grid row-2 mb-6">
          {/* R Factor */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">R Factor</p>
                <p className={`widget-value ${(combinedAnalytics?.rFactor || 0) > 1 ? 'text-green-400' : (combinedAnalytics?.rFactor || 0) < 1 ? 'text-red-400' : 'text-white'}`}>
                  {combinedAnalytics?.rFactor?.toFixed(2) || '0.00'}
                </p>
                <p className="widget-description">Risk/Reward ratio</p>
              </div>
              <div className="widget-icon-square">
                <Activity className="widget-icon" />
              </div>
            </div>
          </div>

          {/* Profit Factor */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Profit Factor</p>
                <p className={`widget-value ${(combinedAnalytics?.profitFactor || 0) > 1 ? 'text-green-400' : (combinedAnalytics?.profitFactor || 0) < 1 ? 'text-red-400' : 'text-white'}`}>
                  {combinedAnalytics?.profitFactor?.toFixed(2) || '0.00'}
                </p>
                <p className="widget-description">Gross profit / gross loss</p>
              </div>
              <div className="widget-icon-square">
                <TrendingUp className="widget-icon" />
              </div>
            </div>
          </div>

          {/* Avg Win/Loss */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Avg Win/Loss</p>
                <div className="flex items-center space-x-2 text-lg font-bold">
                  <span className="text-green-400">{formatCurrency(combinedAnalytics?.averageWin || 0)}</span>
                  <span className="text-gray-400">/</span>
                  <span className="text-red-400">{formatCurrency(Math.abs(combinedAnalytics?.averageLoss || 0))}</span>
                </div>
                <p className="widget-description">Win vs Loss ratio</p>
              </div>
              <div className="widget-icon-square">
                <BarChart3 className="widget-icon" />
              </div>
            </div>
          </div>

          {/* Total Trades */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Total Trades</p>
                <p className="widget-value text-white">
                  {combinedAnalytics?.totalTrades || 0}
                </p>
                <p className="widget-description">All executed trades</p>
              </div>
              <div className="widget-icon-square">
                <Activity className="widget-icon" />
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3: RISK & PLANNING */}
        <div className="widget-grid row-3 mb-6">
          {/* Risk Management */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Risk Management</p>
                <div className="risk-metrics space-y-1">
                  <div className="daily-risk flex justify-between">
                    <span className="text-sm">Daily:</span>
                    <span className="text-sm">
                      {formatCurrency(combinedAnalytics?.dailyRiskUsed || 0)} / {formatCurrency(combinedAnalytics?.dailyRiskLimit || 1500)}
                    </span>
                  </div>
                  <div className="drawdown-risk flex justify-between">
                    <span className="text-sm">Drawdown:</span>
                    <span className="text-sm">
                      {formatCurrency(combinedAnalytics?.currentDrawdown || 0)} / {formatCurrency(combinedAnalytics?.maxDrawdown || 7500)}
                    </span>
                  </div>
                </div>
                <p className="widget-description text-xs">Violations: 0 ⚡ | Health: 98% 🟢</p>
              </div>
              <div className="widget-icon-square">
                <Shield className="widget-icon" />
              </div>
            </div>
          </div>

          {/* Plan vs Reality */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Plan vs Reality</p>
                <div className="progress-bars space-y-1">
                  <div className="target-progress">
                    <div className="flex justify-between text-xs">
                      <span>Target: $750/day</span>
                      <span>📊</span>
                    </div>
                  </div>
                  <div className="actual-progress">
                    <div className="flex justify-between text-xs">
                      <span>Actual: {formatCurrency(combinedAnalytics?.totalPnl || 0)}</span>
                      <span>✅</span>
                    </div>
                  </div>
                </div>
                <p className="widget-description text-xs">Day 2 of 14 • +35% ahead • Risk Used: 16.7% / 50% limit</p>
              </div>
              <div className="widget-icon-square">
                <Target className="widget-icon" />
              </div>
            </div>
          </div>

          {/* Weekly Navigation */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <div className="weekly-navigation-header flex items-center justify-between mb-2">
                  <button 
                    onClick={() => {
                      const newDate = new Date(calendarDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                      setCalendarDate(newDate);
                    }}
                    className="text-white hover:text-blue-400 transition-colors px-2"
                  >
                    ←
                  </button>
                  <span className="text-white font-semibold text-xs">
                    W{Math.ceil(calendarDate.getDate() / 7)} {calendarDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {calendarDate.getFullYear().toString().slice(-2)}
                  </span>
                  <button 
                    onClick={() => {
                      const newDate = new Date(calendarDate.getTime() + 7 * 24 * 60 * 60 * 1000);
                      setCalendarDate(newDate);
                    }}
                    className="text-white hover:text-blue-400 transition-colors px-2"
                  >
                    →
                  </button>
                </div>
                <p className={`widget-value ${getValueColor(combinedAnalytics?.totalPnl || 0)}`}>
                  {formatCurrency(combinedAnalytics?.totalPnl || 0)}
                </p>
                <p className="widget-description text-xs">
                  {combinedAnalytics?.totalTrades || 0} trades • {Math.round(combinedAnalytics?.winRate || 0)}% win rate
                </p>
              </div>
              <div className="widget-icon-square">
                <Calendar className="widget-icon" />
              </div>
            </div>
          </div>

          {/* Discipline Score */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Discipline Score</p>
                <p className={`widget-value ${(combinedAnalytics?.disciplinedScore || 0) >= 80 ? 'text-green-400' : (combinedAnalytics?.disciplinedScore || 0) >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {Math.round(combinedAnalytics?.disciplinedScore || 86)} B
                </p>
                <p className="widget-description text-xs">98% risk compliance / 100% trade limits</p>
              </div>
              <div className="widget-icon-square">
                <Brain className="widget-icon" />
              </div>
            </div>
          </div>
        </div>

        {/* ROW 4: INVESTMENT & FINANCIAL TRACKING */}
        <div className="widget-grid row-4 mb-6">
          {/* Investment ROI Summary */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Investment ROI Summary</p>
                <div className="investment-summary space-y-1">
                  <div className="total-invested flex justify-between">
                    <span className="text-sm">Total Invested:</span>
                    <span className="text-sm font-semibold">{formatCurrency(totalInvestment)}</span>
                  </div>
                  <div className="total-returns flex justify-between">
                    <span className="text-sm">Total Returns:</span>
                    <span className={`text-sm font-semibold ${getValueColor(combinedAnalytics?.totalPnl || 0)}`}>
                      {formatCurrency(combinedAnalytics?.totalPnl || 0)}
                    </span>
                  </div>
                  <div className="roi-percentage flex justify-between">
                    <span className="text-sm">ROI:</span>
                    <span className={`text-sm font-semibold ${getValueColor(roiPercentage)}`}>
                      {roiPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <p className="widget-description text-xs">
                  {roiPercentage > 0 ? 'PROFITABLE TRADER' : 'BUILDING CAPITAL'}
                </p>
              </div>
              <div className="widget-icon-square">
                <DollarSign className="widget-icon" />
              </div>
            </div>
          </div>

          {/* Personal Hourly Wages */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Personal Hourly Wages</p>
                <p className="widget-value text-white">
                  {(() => {
                    const hourlyWage = user?.personalHourlyWage || 25;
                    const totalTradingHours = 35.0;
                    const expectedEarnings = hourlyWage * totalTradingHours;
                    return formatCurrency(expectedEarnings);
                  })()}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setNewWage((user?.personalHourlyWage || 25).toString());
                    setShowWageModal(true);
                  }}
                  className="mb-2 text-xs bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                >
                  Set Hourly Wage
                </Button>
                <p className="widget-description text-xs">
                  Based on {user?.personalHourlyWage ? `${formatCurrency(user.personalHourlyWage)}/hr` : '$25.00/hr'} × 35.0 hours
                </p>
              </div>
              <div className="widget-icon-square">
                <Clock className="widget-icon" />
              </div>
            </div>
          </div>

          {/* Discipline Score Widget */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Discipline Score</p>
                <p className={`widget-value ${(combinedAnalytics?.disciplinedScore || 0) >= 80 ? 'text-green-400' : (combinedAnalytics?.disciplinedScore || 0) >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {Math.round(combinedAnalytics?.disciplinedScore || 86)} B
                </p>
                <p className="widget-description">98% risk compliance / 100% trade limits</p>
              </div>
              <div className="widget-icon-square">
                <Brain className="widget-icon" />
              </div>
            </div>
          </div>

          {/* Account Status Summary */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Account Status</p>
                <div className="account-status-summary space-y-1">
                  <div className="challenge-accounts flex justify-between">
                    <span className="text-sm">Challenge:</span>
                    <span className="text-sm font-semibold text-yellow-400">
                      {accounts?.filter(a => a.type === 'challenge').length || 0}
                    </span>
                  </div>
                  <div className="funded-accounts flex justify-between">
                    <span className="text-sm">Funded:</span>
                    <span className="text-sm font-semibold text-green-400">
                      {accounts?.filter(a => a.type === 'funded').length || 0}
                    </span>
                  </div>
                  <div className="live-accounts flex justify-between">
                    <span className="text-sm">Live:</span>
                    <span className="text-sm font-semibold text-blue-400">
                      {accounts?.filter(a => a.type === 'live').length || 0}
                    </span>
                  </div>
                </div>
                <p className="widget-description text-xs">
                  {accounts?.filter(a => a.status === 'active').length || 0} active accounts
                </p>
              </div>
              <div className="widget-icon-square">
                <Users className="widget-icon" />
              </div>
            </div>
          </div>

          {/* Active Trading Days Widget */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Active Trading Days</p>
                <p className="widget-value">
                  {(() => {
                    const uniqueDays = new Set(trades?.map(t => t.date.split('T')[0])).size || 0;
                    const totalHours = Math.min(uniqueDays * 8, 24 * uniqueDays); // Cap at 24 hours per day
                    const avgHoursPerDay = uniqueDays > 0 ? (totalHours / uniqueDays).toFixed(1) : 0;
                    return `${totalHours.toFixed(1)} Hrs`;
                  })()}
                </p>
                <p className="widget-description text-xs">
                  {(() => {
                    const uniqueDays = new Set(trades?.map(t => t.date.split('T')[0])).size || 0;
                    const avgHoursPerDay = uniqueDays > 0 ? (Math.min(uniqueDays * 8, 24 * uniqueDays) / uniqueDays).toFixed(1) : 0;
                    return `${uniqueDays} trading days × ${avgHoursPerDay} hrs avg`;
                  })()}
                </p>
              </div>
              <div className="widget-icon-square">
                <Calendar className="widget-icon" />
              </div>
            </div>
          </div>
        </div>

        {/* ROW 5: ACTIVE ACCOUNTS & ANALYSIS */}
        <div className="widget-grid row-5 mb-6">
          {/* Active Accounts */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Active Accounts</p>
                <div className="accounts-grid grid grid-cols-1 gap-2">
                  {accounts?.slice(0, 3).map((account) => (
                    <div key={account.id} className="account-card bg-gray-800 rounded p-2">
                      <div className="flex justify-between items-start">
                        <div className="account-info">
                          <h4 className="font-medium text-sm text-white">{account.name}</h4>
                          <p className="text-xs text-gray-400">{account.firm}</p>
                        </div>
                        <div className="account-balance text-right">
                          <p className={`text-sm font-semibold ${getValueColor(account.startingBalance + (combinedAnalytics?.totalPnl || 0))}`}>
                            {formatCurrency(account.startingBalance + (combinedAnalytics?.totalPnl || 0))}
                          </p>
                          <p className="text-xs text-gray-400">{account.type}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="widget-description text-xs mt-2">
                  {accounts?.length || 0} total accounts
                </p>
              </div>
            </div>
          </div>

          {/* Account Discipline Analysis */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Account Discipline Analysis</p>
                <div className="discipline-breakdown space-y-1">
                  <div className="risk-management flex justify-between">
                    <span className="text-sm">Risk Management:</span>
                    <span className="text-sm font-semibold text-green-400">98%</span>
                  </div>
                  <div className="stop-loss-respect flex justify-between">
                    <span className="text-sm">Stop Loss Respect:</span>
                    <span className="text-sm font-semibold text-green-400">94%</span>
                  </div>
                  <div className="profit-target flex justify-between">
                    <span className="text-sm">Profit Target Hit:</span>
                    <span className="text-sm font-semibold text-yellow-400">67%</span>
                  </div>
                </div>
                <p className="widget-description text-xs">
                  Overall: {Math.round(combinedAnalytics?.disciplinedScore || 86)}B Grade
                </p>
              </div>
              <div className="widget-icon-square">
                <Brain className="widget-icon" />
              </div>
            </div>
          </div>

          {/* Payout Status */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Payout Status</p>
                {(() => {
                  const payoutAccount = accounts?.find(a => a.id === payoutStatusAccountId);
                  if (!payoutAccount) return <p className="text-gray-400 text-sm">No account selected</p>;
                  
                  if (payoutAccount.type === 'challenge') {
                    return (
                      <div className="payout-info">
                        <p className="text-sm text-yellow-400">Focus on passing challenge</p>
                        <p className="text-xs text-gray-400">Complete challenge requirements first</p>
                      </div>
                    );
                  }
                  
                  const accountTrades = trades?.filter(t => t.accountId === payoutAccount.id) || [];
                  const currentProfit = accountTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
                  const minimumPayout = payoutAccount.minimumPayoutAmount || 0;
                  const maxNetBalance = payoutAccount.maxNetBalanceForPayout || 0;
                  const requiredTotal = maxNetBalance + minimumPayout;
                  
                  return (
                    <div className="payout-progress">
                      <div className="progress-bar-container">
                        <div className="progress-info flex justify-between text-xs">
                          <span>Progress:</span>
                          <span>{formatCurrency(currentProfit)} / {formatCurrency(requiredTotal)}</span>
                        </div>
                        <div className="progress-bar bg-gray-700 rounded-full h-2 mt-1">
                          <div 
                            className="progress-fill bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, (currentProfit / requiredTotal) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {currentProfit >= requiredTotal ? '✅ Eligible for payout' : '⏳ Building towards payout'}
                      </p>
                    </div>
                  );
                })()}
              </div>
              <div className="widget-icon-square">
                <DollarSign className="widget-icon" />
              </div>
            </div>
          </div>

          {/* Manual Spending Entry */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Manual Spending Entry</p>
                <div className="spending-quick-actions space-y-2">
                  <Link href="/spending" className="block">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add Spending
                    </Button>
                  </Link>
                  <div className="recent-spending">
                    <p className="text-xs text-gray-400">Recent spending: {formatCurrency(totalInvestment)}</p>
                    <p className="text-xs text-gray-400">
                      {spending?.length || 0} total entries
                    </p>
                  </div>
                </div>
              </div>
              <div className="widget-icon-square">
                <CreditCard className="widget-icon" />
              </div>
            </div>
          </div>
        </div>

        {/* ROW 6: TRADING ANALYSIS & CALENDAR */}
        <div className="widget-grid row-6 mb-6">
          {/* Trading Analysis Calendar */}
          <div className="widget-container col-span-2">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Trading Analysis Calendar</p>
                <div className="calendar-compact">
                  <div className="calendar-header flex justify-between items-center mb-2">
                    <button 
                      onClick={() => {
                        const newDate = new Date(calendarDate);
                        newDate.setMonth(newDate.getMonth() - 1);
                        setCalendarDate(newDate);
                      }}
                      className="text-white hover:text-blue-400 transition-colors"
                    >
                      ← 
                    </button>
                    <span className="text-white font-semibold text-sm">
                      {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button 
                      onClick={() => {
                        const newDate = new Date(calendarDate);
                        newDate.setMonth(newDate.getMonth() + 1);
                        setCalendarDate(newDate);
                      }}
                      className="text-white hover:text-blue-400 transition-colors"
                    >
                      →
                    </button>
                  </div>
                  <div className="calendar-grid grid grid-cols-7 gap-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="calendar-day-header text-center text-xs text-gray-400 py-1">
                        {day}
                      </div>
                    ))}
                    {(() => {
                      const firstDayOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
                      const lastDayOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0);
                      const firstDayWeekday = firstDayOfMonth.getDay();
                      const daysInMonth = lastDayOfMonth.getDate();
                      
                      const calendarDays = [];
                      
                      // Empty cells for days before the first day of the month
                      for (let i = 0; i < firstDayWeekday; i++) {
                        calendarDays.push(
                          <div key={`empty-${i}`} className="calendar-day-empty h-6"></div>
                        );
                      }
                      
                      // Days of the month
                      for (let day = 1; day <= daysInMonth; day++) {
                        const dateStr = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const dayTrades = trades?.filter(t => t.date.startsWith(dateStr)) || [];
                        const dayPnl = dayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
                        
                        calendarDays.push(
                          <div key={day} className="calendar-day h-6 text-center text-xs flex flex-col justify-center">
                            <span className="text-white">{day}</span>
                            {dayTrades.length > 0 && (
                              <span className={`text-xs ${getValueColor(dayPnl)}`}>
                                {dayPnl > 0 ? '+' : ''}{dayPnl.toFixed(0)}
                              </span>
                            )}
                          </div>
                        );
                      }
                      
                      return calendarDays;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trading Charts Preview */}
          <div className="widget-container col-span-2">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Trading Charts Preview</p>
                <div className="charts-preview">
                  {trades && trades.length > 0 ? (
                    <div className="chart-container">
                      <SimpleChart data={getEquityData()} />
                      <p className="text-xs text-gray-400 mt-2">
                        Equity curve • {trades.length} trades • 
                        <span className={`ml-1 ${getValueColor(combinedAnalytics?.totalPnl || 0)}`}>
                          {formatCurrency(combinedAnalytics?.totalPnl || 0)}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="no-data text-center py-4">
                      <p className="text-gray-400 text-sm">No trading data available</p>
                      <Link href="/trades?tab=add">
                        <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700">
                          Add First Trade
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Charts Preview */}
        {trades && trades.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gradient-rainbow flex items-center border-b border-gray-700 pb-3">
                <BarChart3 className="mr-3 h-5 w-5 text-blue-400" />
                Trading Charts Preview
              </h2>
              <div className="flex items-center space-x-4">
                <Select value={selectedAccountIds[0]?.toString() || 'all'} onValueChange={(value) => {
                  if (value === 'all') {
                    setSelectedAccountIds([]);
                    setAccountSelectionMode('all');
                  } else {
                    setSelectedAccountIds([parseInt(value)]);
                    setAccountSelectionMode('single');
                  }
                }}>
                  <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all" className="text-white">All Accounts</SelectItem>
                    {accounts?.map(account => (
                      <SelectItem key={account.id} value={account.id.toString()} className="text-white">
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Link href="/charts">
                  <Button variant="outline" size="sm" className="text-blue-400 border-blue-400 hover:bg-blue-400/10">
                    View All Charts
                  </Button>
                </Link>
              </div>
            </div>
            
            {(() => {
              // Filter trades based on selected accounts
              const filteredTrades = accountSelectionMode === 'all' 
                ? trades 
                : trades.filter(t => selectedAccountIds.includes(t.accountId));
              
              const topSymbol = Array.from(new Set(filteredTrades.map(t => t.symbol).filter(Boolean)))
                .map(symbol => ({
                  symbol,
                  trades: filteredTrades.filter(t => t.symbol === symbol),
                  pnl: filteredTrades.filter(t => t.symbol === symbol).reduce((sum, t) => sum + (t.pnl || 0), 0)
                }))
                .sort((a, b) => b.trades.length - a.trades.length)[0];
              
              return topSymbol ? (
                <SimpleChart
                  trades={topSymbol.trades}
                  symbol={topSymbol.symbol}
                  height={300}
                />
              ) : null;
            })()}
          </div>
        )}



        {/* Account Type Row - Reordered: Live, Funded, Challenge */}
        <div className="widget-grid mb-6">
          {/* Live Accounts - First Priority */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Live Accounts</p>
                <p className={`widget-value ${getValueColor(
                  accounts?.filter(acc => acc.status === 'active')
                    .reduce((sum, acc) => sum + acc.startingBalance + (trades?.filter(t => t.accountId === acc.id).reduce((sum, trade) => sum + (trade.pnl || 0), 0) || 0), 0) || 0
                )}`}>
                  {formatCurrency(
                    accounts?.filter(acc => acc.status === 'active')
                      .reduce((sum, acc) => sum + acc.startingBalance + (trades?.filter(t => t.accountId === acc.id).reduce((sum, trade) => sum + (trade.pnl || 0), 0) || 0), 0) || 0
                  )}
                </p>
                <p className="widget-description">
                  {accounts?.filter(acc => acc.status === 'active').length || 0} accounts • Payout eligible
                </p>
              </div>
              <div className="widget-icon-square">
                <TrendingUp className="widget-icon" />
              </div>
            </div>
          </div>

          {/* Funded Accounts - Second Priority */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Funded Accounts</p>
                <p className="widget-value">
                  {formatCurrency(
                    accounts?.filter(acc => acc.status === 'funded')
                      .reduce((sum, acc) => sum + acc.startingBalance + (trades?.filter(t => t.accountId === acc.id).reduce((sum, trade) => sum + (trade.pnl || 0), 0) || 0), 0) || 0
                  )}
                </p>
                <p className="widget-description">
                  {accounts?.filter(acc => acc.status === 'funded').length || 0} accounts • Payout eligible
                </p>
              </div>
              <div className="widget-icon-square">
                <DollarSign className="widget-icon" />
              </div>
            </div>
          </div>

          {/* Challenge Accounts - Third Priority */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Challenge Accounts</p>
                <p className="widget-value">
                  {formatCurrency(
                    accounts?.filter(acc => acc.type === 'challenge')
                      .reduce((sum, acc) => sum + acc.currentBalance, 0) || 0
                  )}
                </p>
                <p className="widget-description">
                  {accounts?.filter(acc => acc.type === 'challenge').length || 0} accounts • No payouts
                </p>
              </div>
              <div className="widget-icon-square">
                <Target className="widget-icon" />
              </div>
            </div>
          </div>
        </div>

        {/* Active Accounts & Disciplinary Score Widget */}
        <div className="widget-grid mb-6">
          <div className="widget-container col-span-full">
            <div className="widget-content flex-col">
              <div className="widget-left mb-4">
                <p className="widget-label">Active Accounts & Disciplinary Score</p>
                <p className="widget-description">Prop firm challenge and funded accounts with performance analysis</p>
              </div>
              <div className="space-y-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                  {accounts?.map((account) => {
                    const accountTrades = trades?.filter(t => t.accountId === account.id) || [];
                    const disciplinedAnalysis = calculateDisciplinedScore(account, accountTrades);
                    const netBalance = account.startingBalance + (accountTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) || 0);
                    
                    return (
                      <div key={account.id} className="flex flex-col p-3 bg-dark-surface rounded-lg border border-prop-gold/20 hover:border-prop-gold/40 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            account.type === 'funded' ? 'bg-success-green' : 
                            netBalance < account.startingBalance * 0.95 ? 'bg-warning-orange' : 'bg-primary'
                          }`}>
                            {account.type === 'funded' ? (
                              <Target className="text-white h-4 w-4" />
                            ) : netBalance < account.startingBalance * 0.95 ? (
                              <AlertTriangle className="text-white h-4 w-4" />
                            ) : (
                              <TrendingDown className="text-white h-4 w-4" />
                            )}
                          </div>
                          <div className="text-center p-2 bg-gradient-to-b from-yellow-600 to-yellow-700 rounded min-w-[60px]">
                            <p className="text-white font-bold text-sm">
                              {disciplinedAnalysis.disciplinedScore.toFixed(0)}%
                            </p>
                            <p className="text-yellow-100 text-xs">
                              {disciplinedAnalysis.scoreGrade}
                            </p>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white text-sm truncate">{account.name}</p>
                          <p className="text-xs text-gray-400 mb-1">{account.type} • {account.firm}</p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <p className="font-bold text-white text-sm">{formatCurrency(netBalance)}</p>
                          <p className={`text-xs ${getValueColor(accountTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) || 0)}`}>
                            {(accountTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) || 0) >= 0 ? '+' : ''}{formatCurrency(accountTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) || 0)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {disciplinedAnalysis.totalTrades} trades • {disciplinedAnalysis.violationsCount} violations
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Portfolio Value Row */}
        <div className="widget-grid mb-6">
          {/* Total Portfolio Value */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Total Portfolio Value</p>
                <p className="widget-value">
                  {formatCurrency(accounts?.reduce((sum, acc) => sum + acc.currentBalance, 0) || 0)}
                </p>
                <p className="widget-description">Combined accounts</p>
              </div>
              <div className="widget-icon-square">
                <DollarSign className="widget-icon" />
              </div>
            </div>
          </div>

          {/* Total Investment */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Total Investment</p>
                <p className="widget-value">
                  {formatCurrency(
                    (accounts?.reduce((sum, acc) => sum + (acc.accountCost || 0), 0) || 0) +
                    (accounts?.reduce((sum, acc) => sum + (acc.activationCost || 0), 0) || 0)
                  )}
                </p>
                <p className="widget-description">Account costs + activations</p>
              </div>
              <div className="widget-icon-square">
                <TrendingUp className="widget-icon" />
              </div>
            </div>
          </div>

          {/* Total Return */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Total Return</p>
                <p className="widget-value">
                  {formatCurrency(
                    accounts?.reduce((sum, acc) => sum + (acc.currentBalance - acc.startingBalance), 0) || 0
                  )}
                </p>
                <p className="widget-description">Profit/Loss from trading</p>
              </div>
              <div className="widget-icon-square">
                <TrendingUp className="widget-icon" />
              </div>
            </div>
          </div>
        </div>



        {/* Investment Tracking */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gradient-rainbow mb-6 flex items-center border-b border-gray-700 pb-3">
            <Shield className="mr-3 h-5 w-5 text-green-400" />
            Investment Tracking
          </h2>
        </div>



        {/* Investment Tracking & Working Hours Summary */}
        <div className="widget-grid mb-6">
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Total Spent on Accounts</p>
                <p className="widget-value">
                  {formatCurrency(accounts?.reduce((sum, acc) => sum + (acc.accountCost || 0), 0) || 0)}
                </p>
                <p className="widget-description">Purchase costs for all accounts</p>
              </div>
              <div className="widget-icon-square">
                <DollarSign className="widget-icon" />
              </div>
            </div>
          </div>

          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Activation Costs</p>
                <p className="widget-value">
                  {formatCurrency(accounts?.reduce((sum, acc) => sum + (acc.activationCost || 0), 0) || 0)}
                </p>
                <p className="widget-description">Activation fees paid/required</p>
              </div>
              <div className="widget-icon-square">
                <Shield className="widget-icon" />
              </div>
            </div>
          </div>

          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Manual Spending</p>
                <p className="widget-value">
                  {formatCurrency(spending?.reduce((sum, s) => sum + s.amount, 0) || 0)}
                </p>
                <p className="widget-description">Additional manual entries</p>
              </div>
              <div className="widget-icon-square">
                <Plus className="widget-icon" />
              </div>
            </div>
          </div>

          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Total Combined</p>
                <p className={`widget-value ${(() => {
                  const total = (accounts?.reduce((sum, acc) => sum + (acc.accountCost || 0), 0) || 0) +
                               (accounts?.reduce((sum, acc) => sum + (acc.activationCost || 0), 0) || 0) +
                               (spending?.reduce((sum, s) => sum + s.amount, 0) || 0);
                  return total > 0 ? 'text-red-400' : 'text-white';
                })()}`}>
                  {formatCurrency(
                    (accounts?.reduce((sum, acc) => sum + (acc.accountCost || 0), 0) || 0) +
                    (accounts?.reduce((sum, acc) => sum + (acc.activationCost || 0), 0) || 0) +
                    (spending?.reduce((sum, s) => sum + s.amount, 0) || 0)
                  )}
                </p>
                <p className="widget-description">Total investment in trading</p>
              </div>
              <div className="widget-icon-square">
                <TrendingUp className="widget-icon" />
              </div>
            </div>
          </div>
        </div>

        {/* Working Hours & Profitability Summary - Under Investment Tracking */}
        <div className="widget-grid mb-8">
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Total Working Hours</p>
                <p className="widget-value text-white">
                  {((trades?.length || 0) * 2.5).toFixed(1)} Hrs
                </p>
                <p className="widget-description">
                  Based on {trades?.length || 0} trades × 2.5 Hrs avg duration
                </p>
              </div>
              <div className="widget-icon-square">
                <Calendar className="widget-icon" />
              </div>
            </div>
          </div>

          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Average Hours Per Day</p>
                <p className="widget-value">
                  {(() => {
                    // Calculate based on actual trading duration from trades
                    const totalTradingMinutes = trades?.reduce((sum, trade) => {
                      // Assume average trade duration of 15 minutes if not specified
                      return sum + 15;
                    }, 0) || 0;
                    
                    const avgDailyMinutes = totalTradingMinutes / 30; // Over 30 days
                    
                    if (avgDailyMinutes < 60) {
                      return `${Math.round(avgDailyMinutes)} Min`;
                    } else {
                      const avgDailyHours = avgDailyMinutes / 60;
                      // Cap at 24 hours since a day can't have more than 24 hours
                      return `${Math.min(avgDailyHours, 24).toFixed(1)} Hrs`;
                    }
                  })()}
                </p>
                <p className="widget-description">
                  Based on 30-day trading period
                </p>
              </div>
              <div className="widget-icon-square">
                <Calendar className="widget-icon" />
              </div>
            </div>
          </div>

          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Profitability</p>
                {(() => {
                  const totalSpent = (accounts?.reduce((sum, acc) => sum + (acc.accountCost || 0), 0) || 0) +
                                    (accounts?.reduce((sum, acc) => sum + (acc.activationCost || 0), 0) || 0);
                  const totalPayout = 0; // This would come from actual payout data
                  const difference = totalPayout - totalSpent;
                  const isProfit = difference >= 0;
                  
                  return (
                    <>
                      <p className={`widget-value ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                        {isProfit ? '+' : ''}{formatCurrency(difference)}
                      </p>
                      <p className="widget-description">
                        {isProfit ? 'Profitable' : 'Loss'} • {formatCurrency(totalPayout)} vs {formatCurrency(totalSpent)}
                      </p>
                    </>
                  );
                })()}
              </div>
              <div className="widget-icon-square">
                <TrendingUp className="widget-icon" />
              </div>
            </div>
          </div>
        </div>

        {/* Add Investment Tracking Controls */}
        <div className="flex justify-end mb-8">
          <Dialog open={showSpendingModal} onOpenChange={setShowSpendingModal}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Spending/Payout
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Add Spending/Payout Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={spendingForm.type} 
                    onValueChange={(value: 'spending' | 'payout') => setSpendingForm({...spendingForm, type: value})}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="spending">Spending</SelectItem>
                      <SelectItem value="payout">Payout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={spendingForm.amount}
                    onChange={(e) => setSpendingForm({...spendingForm, amount: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Account purchase, payout, etc."
                    value={spendingForm.description}
                    onChange={(e) => setSpendingForm({...spendingForm, description: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={spendingForm.date}
                    onChange={(e) => setSpendingForm({...spendingForm, date: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => {
                      // TODO: Save spending/payout entry
                      console.log('Saving:', spendingForm);
                      setShowSpendingModal(false);
                      setSpendingForm({
                        type: 'spending',
                        amount: '',
                        description: '',
                        date: new Date().toISOString().split('T')[0]
                      });
                    }}
                    className="bg-blue-600 hover:bg-blue-700 flex-1"
                  >
                    Save Entry
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSpendingModal(false)}
                    className="border-gray-600 text-white hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>



        {/* Recent Trades Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gradient-rainbow mb-6 flex items-center border-b border-gray-700 pb-3">
            <Activity className="mr-3 h-5 w-5 text-green-400" />
            Recent Trading Activity
          </h2>
        </div>

        <div className="widget-container mb-6">
          <div className="widget-content flex-col">
            <div className="widget-left mb-4">
              <p className="widget-label">Latest Trades</p>
              <p className="widget-description">Most recent trading activity</p>
            </div>
            <div className="space-y-4 w-full">
              {trades?.slice(0, 5).map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-4 bg-dark-surface rounded-lg border border-prop-gold/20">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
                      trade.pnl > 0 ? 'bg-success-green' : trade.pnl < 0 ? 'bg-error-red' : 'bg-gray-600'
                    }`}>
                      {trade.pnl > 0 ? (
                        <TrendingUp className="text-white h-5 w-5" />
                      ) : trade.pnl < 0 ? (
                        <TrendingDown className="text-white h-5 w-5" />
                      ) : (
                        <Target className="text-white h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{trade.symbol}</p>
                      <p className="text-sm text-gray-400">{trade.side} • {trade.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getValueColor(trade.pnl)}`}>
                      {formatCurrency(trade.pnl)}
                    </p>
                    <p className="text-sm text-gray-400">{trade.quantity} shares</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* First Row: Risk Management, Daily Trade Limit, Disciplined Score */}
        <div className="widget-grid mb-6">
          {/* Risk Management */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Risk Management</p>
                <p className="widget-value text-warning-orange">
                  {formatCurrency(500)}
                </p>
                <p className="widget-description">
                  Per trade / {formatCurrency(1500)} daily limit
                </p>
              </div>
              <div className="widget-icon-square">
                <Shield className="widget-icon" />
              </div>
            </div>
          </div>

          {/* Daily Trade Limit */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Daily Trade Limit</p>
                <p className="widget-value">
                  {trades?.filter(t => t.date === new Date().toISOString().split('T')[0]).length || 0} / 5
                </p>
                <p className="widget-description">
                  Current trades today / Maximum allowed
                </p>
              </div>
              <div className="widget-icon-square">
                <BarChart3 className="widget-icon" />
              </div>
            </div>
          </div>

          {/* Disciplined Score */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Disciplined Score</p>
                <div className="flex items-center space-x-2">
                  <p className={`text-2xl font-bold ${getScoreColor(combinedAnalytics?.disciplinedScore || 0)}`}>
                    {Math.round(combinedAnalytics?.disciplinedScore || 0)}
                  </p>
                  <Badge className={`${getGradeColor(
                    (combinedAnalytics?.disciplinedScore || 0) >= 95 ? 'A+' :
                    (combinedAnalytics?.disciplinedScore || 0) >= 90 ? 'A' :
                    (combinedAnalytics?.disciplinedScore || 0) >= 80 ? 'B' :
                    (combinedAnalytics?.disciplinedScore || 0) >= 70 ? 'C' :
                    (combinedAnalytics?.disciplinedScore || 0) >= 60 ? 'D' : 'F'
                  )} text-white`}>
                    {(combinedAnalytics?.disciplinedScore || 0) >= 95 ? 'A+' :
                     (combinedAnalytics?.disciplinedScore || 0) >= 90 ? 'A' :
                     (combinedAnalytics?.disciplinedScore || 0) >= 80 ? 'B' :
                     (combinedAnalytics?.disciplinedScore || 0) >= 70 ? 'C' :
                     (combinedAnalytics?.disciplinedScore || 0) >= 60 ? 'D' : 'F'}
                  </Badge>
                </div>
                <p className="widget-description">
                  98% risk compliance / 100% trade limits
                </p>
              </div>
              <div className="widget-icon-square">
                <Brain className="widget-icon" />
              </div>
            </div>
          </div>
        </div>

        {/* Risk Alert and Disciplined Trading Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Risk Alert - Top 3 Critical Accounts */}
          <div className="widget-container">
            <div className="widget-content flex-col">
              <div className="widget-left mb-4">
                <p className="widget-label">Risk Alert</p>
                <p className="widget-description">3 Most Critical Accounts</p>
              </div>
              <div className="space-y-3">
                {accounts && trades ? (
                  accounts
                    .map(account => {
                      const accountTrades = trades.filter(t => t.accountId === account.id);
                      const totalPnl = accountTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
                      const dailyLossLimit = account.maxDrawdown ? account.maxDrawdown * 0.05 : 2500; // 5% daily loss limit
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
                      <div key={account.id} className="bg-dark-surface rounded-lg p-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="truncate">{account.name}</span>
                          <span className={`font-medium ${
                            riskPercentage > 80 ? 'text-red-400' : 
                            riskPercentage > 60 ? 'text-warning-orange' : 
                            'text-yellow-400'
                          }`}>
                            {riskPercentage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={riskPercentage} 
                          className="w-full h-1.5 bg-dark-border"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          {formatCurrency(currentDrawdown)} / {formatCurrency(dailyLossLimit)} risk used
                        </p>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-400 text-sm">No accounts to monitor</p>
                )}
              </div>
            </div>
          </div>

          {/* Payout Status */}
          <div className="widget-container">
            <div className="widget-content flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="widget-left">
                  <p className="widget-label">Payout Status</p>
                  <p className="widget-description">Track payout eligibility</p>
                </div>
                <Select value={payoutStatusAccountId?.toString() || ''} onValueChange={(value) => setPayoutStatusAccountId(Number(value))}>
                  <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white text-sm">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {accounts?.map(account => (
                      <SelectItem key={account.id} value={account.id.toString()} className="text-white">
                        {account.name} {account.status === 'active' ? '(Active)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {(() => {
                const selectedAccount = accounts?.find(acc => acc.id === payoutStatusAccountId);
                if (!selectedAccount) return null;
                
                // Check if account type is eligible for payout
                const isEligibleAccountType = selectedAccount.type === 'funded' || selectedAccount.type === 'live';
                
                if (!isEligibleAccountType) {
                  return (
                    <div className="space-y-4">
                      <div className="text-center p-4 rounded-lg bg-gray-800">
                        <p className="text-xl font-bold text-gray-400">
                          {selectedAccount.type === 'challenge' ? 'CHALLENGE ACCOUNT' : 'NOT ELIGIBLE'}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          {selectedAccount.type === 'challenge' 
                            ? 'Focus on passing the challenge. Payouts available after funded.'
                            : 'Account type not eligible for payouts'}
                        </p>
                      </div>
                    </div>
                  );
                }
                
                const accountTrades = trades?.filter(t => t.accountId === selectedAccount.id) || [];
                // Use actual account-specific payout rules from database
                const requiredDays = selectedAccount.daysRequiredForPayout || 0;
                const winningDayMinimum = selectedAccount.winningDayMinimum || 0;
                const minimumPayoutAmount = selectedAccount.minimumPayoutAmount || 0;
                const maxNetBalanceForPayout = selectedAccount.maxNetBalanceForPayout;
                
                const winningTrades = accountTrades.filter(t => (t.pnl || 0) >= winningDayMinimum);
                const totalProfit = (trades?.filter(t => t.accountId === selectedAccount.id).reduce((sum, trade) => sum + (trade.pnl || 0), 0) || 0);
                const currentDrawdown = selectedAccount.maxDrawdown - (selectedAccount.startingBalance - (selectedAccount.startingBalance + totalProfit));
                const isInDrawdown = currentDrawdown < (selectedAccount.maxDrawdown * 0.5);
                
                const daysTraded = new Set(accountTrades.map(t => t.date)).size;
                const winningDays = winningTrades.length;
                const profitTargetMet = totalProfit >= (selectedAccount.profitTarget || 0);
                const daysRequirementMet = daysTraded >= requiredDays;
                const drawdownSafe = !isInDrawdown;
                // Check if profit exceeds max net balance + minimum payout amount
                const totalRequiredProfit = (maxNetBalanceForPayout || 0) + minimumPayoutAmount;
                const minimumPayoutMet = totalProfit >= totalRequiredProfit;
                const maxNetBalanceMet = !maxNetBalanceForPayout || totalProfit > maxNetBalanceForPayout;
                
                const isReady = profitTargetMet && daysRequirementMet && drawdownSafe && winningDays >= requiredDays && minimumPayoutMet && maxNetBalanceMet;
                
                return (
                  <div className="space-y-4">
                    {/* Status Indicator */}
                    <div className="text-center p-4 rounded-lg bg-gray-800">
                      <p className={`text-2xl font-bold ${isReady ? 'text-green-400' : 'text-yellow-400'}`}>
                        {isReady ? '✓ READY FOR PAYOUT' : 'IN PROGRESS'}
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Estimated Payout: {formatCurrency((() => {
                          if (selectedAccount.type !== 'funded') return 0;
                          const currentProfit = totalProfit;
                          const profitSplit = (selectedAccount.profitSplit || 0) / 100;
                          const maxPayoutPercentage = (selectedAccount.maximumPayoutPercentage || 0) / 100;
                          const bufferPercentage = (selectedAccount.bufferPercentage || 0) / 100;
                          const profitTarget = selectedAccount.profitTarget || 0;
                          const bufferAmount = profitTarget * bufferPercentage;
                          const profitAboveBuffer = Math.max(0, currentProfit - bufferAmount);
                          return Math.max(0, profitAboveBuffer * profitSplit * maxPayoutPercentage);
                        })())}
                      </p>
                    </div>
                    
                    {/* Progress Tracking */}
                    <div className="space-y-4">
                      {/* Profit Target Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-300">Profit Target</span>
                          <span className={profitTargetMet ? 'text-green-400' : 'text-yellow-400'}>
                            {formatCurrency(totalProfit)} / {formatCurrency(selectedAccount.profitTarget || 0)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-300 ${
                              profitTargetMet ? 'bg-green-400' : 'bg-yellow-400'
                            }`}
                            style={{ width: `${Math.min((totalProfit / (selectedAccount.profitTarget || 1)) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Trading Days Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-300">Trading Days</span>
                          <span className={daysRequirementMet ? 'text-green-400' : 'text-blue-400'}>
                            {daysTraded} / {requiredDays} days
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-300 ${
                              daysRequirementMet ? 'bg-green-400' : 'bg-blue-400'
                            }`}
                            style={{ width: `${Math.min((daysTraded / (requiredDays || 1)) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Winning Days Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-300">
                            Winning Days (${winningDayMinimum}+)
                          </span>
                          <span className={winningDays >= requiredDays ? 'text-green-400' : 'text-purple-400'}>
                            {winningDays} / {requiredDays} days
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-300 ${
                              winningDays >= requiredDays ? 'bg-green-400' : 'bg-purple-400'
                            }`}
                            style={{ width: `${Math.min((winningDays / (requiredDays || 1)) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Minimum Payout Amount */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-300">Total Required for Payout</span>
                          <span className={minimumPayoutMet ? 'text-green-400' : 'text-orange-400'}>
                            {formatCurrency(totalProfit)} / {formatCurrency(totalRequiredProfit)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-300 ${
                              minimumPayoutMet ? 'bg-green-400' : 'bg-orange-400'
                            }`}
                            style={{ width: `${Math.min((totalProfit / (totalRequiredProfit || 1)) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {maxNetBalanceForPayout ? `${formatCurrency(maxNetBalanceForPayout)} (max balance) + ${formatCurrency(minimumPayoutAmount)} (minimum)` : `${formatCurrency(minimumPayoutAmount)} minimum`}
                        </p>
                      </div>

                      {/* Max Net Balance for Payout */}
                      {maxNetBalanceForPayout && (
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-300">Max Net Balance Exceeded</span>
                            <span className={maxNetBalanceMet ? 'text-green-400' : 'text-red-400'}>
                              {totalProfit > maxNetBalanceForPayout ? 'Exceeded' : 'Not Exceeded'}
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full transition-all duration-300 ${
                                maxNetBalanceMet ? 'bg-green-400' : 'bg-red-400'
                              }`}
                              style={{ width: `${Math.min((totalProfit / (maxNetBalanceForPayout || 1)) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Must exceed ${formatCurrency(maxNetBalanceForPayout)} to be eligible for payout
                          </p>
                        </div>
                      )}

                      {/* Drawdown Status */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Drawdown Status</span>
                        <span className={drawdownSafe ? 'text-green-400' : 'text-red-400'}>
                          {drawdownSafe ? 'Safe' : 'In Violation'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>



        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Account Equity Curve */}
          <div className="widget-container">
            <div className="widget-content flex-col">
              <div className="widget-left mb-4">
                <p className="widget-label">Account Equity Curve</p>
                <p className="widget-description">Portfolio growth over time</p>
              </div>
              <div className="h-64 w-full">
                <EquityChart data={getEquityData()} />
              </div>
            </div>
          </div>

          {/* Weekly Performance */}
          <div className="widget-container">
            <div className="widget-content flex-col">
              <div className="widget-left mb-4">
                <p className="widget-label">Weekly Performance</p>
                <p className="widget-description">This week's trading results</p>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-400 p-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {(() => {
                  const getCurrentWeekDays = () => {
                    const today = new Date();
                    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - dayOfWeek);
                    
                    const weekDays = [];
                    for (let i = 0; i < 7; i++) {
                      const day = new Date(startOfWeek);
                      day.setDate(startOfWeek.getDate() + i);
                      weekDays.push(day);
                    }
                    return weekDays;
                  };

                  const weekDays = getCurrentWeekDays();
                  
                  return weekDays.map((day, index) => {
                    const dayStr = day.toISOString().split('T')[0];
                    const dayTrades = trades?.filter(trade => trade.date === dayStr) || [];
                    const dayPnL = dayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
                    const isToday = day.toDateString() === new Date().toDateString();
                    
                    return (
                      <div 
                        key={index} 
                        className={`
                          relative p-3 rounded-lg border transition-all duration-300
                          ${isToday ? 'border-gold bg-gold/10' : 'border-gray-700 bg-gray-800/50'}
                          ${dayTrades.length > 0 ? 'hover:scale-105 cursor-pointer' : ''}
                        `}
                      >
                        <div className="text-center">
                          <div className="text-sm font-medium text-white mb-1">
                            {day.getDate()}
                          </div>
                          {dayTrades.length > 0 && (
                            <>
                              <div className={`text-xs font-semibold ${dayPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                ${dayPnL >= 0 ? '+' : ''}${dayPnL.toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-400">
                                {dayTrades.length} trades
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>



        {/* Daily Trading Journal */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gradient-rainbow mb-6 flex items-center border-b border-gray-700 pb-3">
            <Target className="mr-3 h-5 w-5 text-prop-gold" />
            Daily Trading Journal
          </h2>
          <div className="widget-container">
            <div className="widget-content flex-col">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">What went wrong today?</label>
                  <Textarea 
                    className="bg-dark-surface border-dark-border resize-none" 
                    rows={3} 
                    placeholder="Reflect on mistakes and lessons learned..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">What went right today?</label>
                  <Textarea 
                    className="bg-dark-surface border-dark-border resize-none" 
                    rows={3} 
                    placeholder="Note successful strategies and decisions..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Tomorrow's improvement plan</label>
                  <Textarea 
                    className="bg-dark-surface border-dark-border resize-none" 
                    rows={3} 
                    placeholder="Set goals for tomorrow's session..."
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <Link href="/journal">
                  <Button variant="ghost" className="text-primary hover:text-blue-400">
                    View Full Journal
                  </Button>
                </Link>
                <Button className="bg-accent-orange hover:bg-orange-600">
                  Save Journal Entry
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Trade Analysis Calendar */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gradient-rainbow mb-6 flex items-center border-b border-gray-700 pb-3">
            <Calendar className="mr-3 h-5 w-5 text-prop-gold" />
            Trade Analysis Calendar
          </h2>
          <div className="widget-container">
            <div className="widget-content flex-col">
              <div className="widget-left mb-4">
                <p className="widget-label">Calendar View</p>
                <p className="widget-description">Track trades across time periods</p>
              </div>
              <div className="w-full">
                <TradeAnalysisCalendar 
                  trades={(() => {
                    if (!trades) return [];
                    
                    if (accountSelectionMode === 'all') {
                      return trades;
                    } else if (accountSelectionMode === 'single' && selectedAccountIds.length > 0) {
                      return trades.filter(trade => trade.accountId === selectedAccountIds[0]);
                    } else if (selectedAccountIds.length > 0) {
                      return trades.filter(trade => selectedAccountIds.includes(trade.accountId));
                    }
                    return trades;
                  })()} 
                  accounts={(() => {
                    if (!accounts) return [];
                    
                    if (accountSelectionMode === 'all') {
                      return accounts;
                    } else if (accountSelectionMode === 'single' && selectedAccountIds.length > 0) {
                      return accounts.filter(acc => acc.id === selectedAccountIds[0]);
                    } else if (selectedAccountIds.length > 0) {
                      return accounts.filter(acc => selectedAccountIds.includes(acc.id));
                    }
                    return accounts;
                  })()}
                  viewMode={timePeriod}
                />
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
    </>
  );
}
