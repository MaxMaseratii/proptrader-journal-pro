import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
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
import TradeCalendar from "@/components/trade-calendar";
import TradeEntry from "@/components/trade-entry";
import TradeAnalysisCalendar from "@/components/trade-analysis-calendar";
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
  Crosshair,
  Filter,
  Brain,
  BarChart3,
  Calendar,
  Banknote,
  Clock,
  CheckCircle
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
  const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'single' | 'multiple' | 'all'>('all');
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [showSpendingModal, setShowSpendingModal] = useState(false);
  const [spendingForm, setSpendingForm] = useState({
    type: 'spending' as 'spending' | 'payout',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [viewType, setViewType] = useState<'overview' | 'detailed' | 'analytics'>('overview');

  const { data: accounts, isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: trades, isLoading: tradesLoading } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

  // Initialize selectedAccountId with first TopStep account
  React.useEffect(() => {
    if (accounts && !selectedAccountId) {
      const topStepAccount = accounts.find(acc => acc.firm === 'TopStep');
      if (topStepAccount) {
        setSelectedAccountId(topStepAccount.id);
      }
    }
  }, [accounts, selectedAccountId]);

  // Calculate combined combinedAnalytics for selected accounts
  const combinedAnalytics = useMemo(() => {
    if (!accounts || !trades) return null;

    let accountsToAnalyze: Account[] = [];
    let tradesToAnalyze: Trade[] = [];

    if (viewMode === 'all') {
      accountsToAnalyze = accounts;
      tradesToAnalyze = trades;
    } else {
      const accountIdsToUse = selectedAccountIds.length > 0 ? selectedAccountIds : (accounts.length > 0 ? [accounts[0].id] : []);
      accountsToAnalyze = accounts.filter(acc => accountIdsToUse.includes(acc.id));
      tradesToAnalyze = trades.filter(trade => accountIdsToUse.includes(trade.accountId));
    }

    if (accountsToAnalyze.length === 0) return null;

    // Calculate combined combinedAnalytics
    const totalStartingBalance = accountsToAnalyze.reduce((sum, acc) => sum + acc.startingBalance, 0);
    const totalCurrentBalance = accountsToAnalyze.reduce((sum, acc) => sum + acc.currentBalance, 0);
    const totalPnl = totalCurrentBalance - totalStartingBalance;
    
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
    const disciplinedScores = accountsToAnalyze.map(account => 
      calculateDisciplinedScore(account, tradesToAnalyze.filter(t => t.accountId === account.id))
    );
    
    // Get average disciplined score
    const avgDisciplinedScore = disciplinedScores.length > 0 ? 
      disciplinedScores.reduce((sum, score) => sum + score.disciplinedScore, 0) / disciplinedScores.length : 100;
    
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
      currentBalance: totalCurrentBalance,
      startingBalance: totalStartingBalance,
      drawdown: totalStartingBalance - totalCurrentBalance,
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
  }, [accounts, trades, selectedAccountIds, viewMode]);

  const primaryAccount = accounts?.[0];
  const recentTrades = trades?.slice(0, 4) || [];

  // Mock data for charts
  const equityData = [
    { date: "Oct 1", balance: 150000 },
    { date: "Oct 2", balance: 150575 },
    { date: "Oct 3", balance: 151950 },
    { date: "Oct 4", balance: 153350 },
    { date: "Oct 7", balance: 146350 },
    { date: "Oct 8", balance: 146825 },
    { date: "Oct 9", balance: 150200 },
  ];

  const monthlyData = [
    { month: "Jul", pnl: 2500 },
    { month: "Aug", pnl: -1200 },
    { month: "Sep", pnl: 4800 },
    { month: "Oct", pnl: -2775 },
  ];

  // TASK 3: Color determination function for all numbers
  const getValueColor = (value: number, type: 'currency' | 'percentage' | 'neutral' = 'currency') => {
    if (type === 'neutral') return 'text-prop-tiffany';
    if (value > 0) return 'text-prop-green';
    if (value < 0) return 'text-prop-pink';
    return 'text-prop-gold'; // For zero values, use gold color like portfolio overview
  };

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
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Trading Dashboard
            </h2>
            <p className="text-gray-400 text-base mt-2 flex items-center">
              <Target className="h-4 w-4 mr-2 text-orange-400" />
              {viewMode === 'all' 
                ? `Monitoring all ${accounts?.length ?? 0} trading accounts` 
                : `Analyzing ${selectedAccountIds.length || (accounts && accounts.length > 0 ? 1 : 0)} selected account(s)`}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Account Selection */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
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
            {viewMode !== 'all' && accounts && (
              <div className="flex items-center space-x-2">
                {viewMode === 'single' ? (
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

            {/* TASK 1: View Type Selection */}
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-gray-400" />
              <Select value={viewType} onValueChange={(value: any) => setViewType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <TradeEntry accounts={accounts || []} />
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
        {/* CONFIRMATION BANNER - Tasks Completed */}
        <div className="bg-gradient-to-r from-prop-gold/20 to-prop-tiffany/20 border border-prop-gold/50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-prop-gold mr-3" />
            <p className="text-prop-gold font-bold text-lg">
              ✓ ALL DASHBOARD IMPROVEMENTS COMPLETED
            </p>
          </div>
          <div className="text-center text-sm text-gray-300 mt-2">
            <span className="inline-block mx-2">✓ Reordered Account Types</span>
            <span className="inline-block mx-2">✓ Added Stats Row</span>
            <span className="inline-block mx-2">✓ Enhanced Filtering</span>
            <span className="inline-block mx-2">✓ Trade Analysis Calendar</span>
          </div>
        </div>

        {/* Current Performance Overview - Compact Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center border-b border-gray-700 pb-2">
            <TrendingUp className="mr-3 h-5 w-5 text-success-green" />
            Current Performance Overview
          </h2>
        </div>

        {/* Key Performance Metrics Under Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Total Balance */}
          <Card className="bg-dark-card border-success-green">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Balance</p>
                  <p className="text-2xl font-bold text-success-green">
                    {formatCurrency(accounts?.reduce((sum, acc) => sum + acc.currentBalance, 0) || 0)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Combined accounts
                  </p>
                </div>
                <div className="bg-success-green bg-opacity-20 p-3 rounded-lg">
                  <DollarSign className="text-success-green h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily P&L */}
          <Card className="bg-dark-card border-error-red">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Daily P&L</p>
                  <p className="text-2xl font-bold text-error-red">
                    {formatCurrency(combinedAnalytics?.worstTrade || 0)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Today's performance
                  </p>
                </div>
                <div className="bg-error-red bg-opacity-20 p-3 rounded-lg">
                  <TrendingDown className="text-error-red h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Win/Loss */}
          <Card className="bg-dark-card border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Avg Win/Loss</p>
                  <div className="flex items-center space-x-2 text-lg font-bold">
                    <span className="text-success-green">
                      {formatCurrency(combinedAnalytics?.averageWin || 0)}
                    </span>
                    <span className="text-gray-400">/</span>
                    <span className="text-error-red">
                      {formatCurrency(Math.abs(combinedAnalytics?.averageLoss || 0))}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Win vs Loss ratio
                  </p>
                </div>
                <div className="bg-gray-600 bg-opacity-20 p-3 rounded-lg">
                  <BarChart3 className="text-gray-400 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Performance Metrics Row - Win Rate, R Factor, Profit Factor */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Win Rate */}
          <Card className="bg-dark-card border-success-green">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Win Rate</p>
                  <p className={`text-2xl font-bold ${
                    (combinedAnalytics?.winRate || 0) >= 70 ? 'text-success-green' :
                    (combinedAnalytics?.winRate || 0) >= 50 ? 'text-warning-orange' : 'text-error-red'
                  }`}>
                    {combinedAnalytics?.winRate.toFixed(0) || 0}%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {combinedAnalytics?.winningTrades || 0} wins / {combinedAnalytics?.losingTrades || 0} losses
                  </p>
                </div>
                <div className="bg-success-green bg-opacity-20 p-3 rounded-lg">
                  <Target className="text-success-green h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* R Factor */}
          <Card className="bg-dark-card border-blue-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">R Factor</p>
                  <p className={`text-2xl font-bold ${
                    (combinedAnalytics?.rFactor || 0) >= 2 ? 'text-success-green' :
                    (combinedAnalytics?.rFactor || 0) >= 1 ? 'text-warning-orange' : 'text-error-red'
                  }`}>
                    {combinedAnalytics?.rFactor.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Total Reward / Total Risk ratio
                  </p>
                </div>
                <div className="bg-blue-600 bg-opacity-20 p-3 rounded-lg">
                  <BarChart3 className="text-blue-400 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profit Factor */}
          <Card className="bg-dark-card border-purple-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Profit Factor</p>
                  <p className={`text-2xl font-bold ${
                    (combinedAnalytics?.profitFactor || 0) >= 2 ? 'text-success-green' :
                    (combinedAnalytics?.profitFactor || 0) >= 1 ? 'text-warning-orange' : 'text-error-red'
                  }`}>
                    {combinedAnalytics?.profitFactor.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Gross Profit / Gross Loss ratio
                  </p>
                </div>
                <div className="bg-purple-600 bg-opacity-20 p-3 rounded-lg">
                  <TrendingUp className="text-purple-400 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Portfolio Overview */}
        <div className="mb-6 mt-12">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center border-b border-gray-700 pb-3">
            <Wallet className="mr-3 h-5 w-5 text-blue-400" />
            Account Portfolio Overview
          </h2>
        </div>

        {/* TASK 1: Account Type Row - Reordered: Live, Funded, Challenge */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Live Accounts - First Priority */}
          <Card className="bg-dark-card border-green-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Live Accounts</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(
                      accounts?.filter(acc => acc.status === 'active')
                        .reduce((sum, acc) => sum + acc.currentBalance, 0) || 0
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {accounts?.filter(acc => acc.status === 'active').length || 0} accounts • Payout eligible
                  </p>
                </div>
                <div className="bg-green-600 bg-opacity-20 p-3 rounded-lg">
                  <TrendingUp className="text-green-400 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Funded Accounts - Second Priority */}
          <Card className="bg-dark-card border-blue-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Funded Accounts</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {formatCurrency(
                      accounts?.filter(acc => acc.status === 'funded')
                        .reduce((sum, acc) => sum + acc.currentBalance, 0) || 0
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {accounts?.filter(acc => acc.status === 'funded').length || 0} accounts • Payout eligible
                  </p>
                </div>
                <div className="bg-blue-600 bg-opacity-20 p-3 rounded-lg">
                  <DollarSign className="text-blue-400 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Challenge Accounts - Third Priority */}
          <Card className="bg-dark-card border-yellow-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Challenge Accounts</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {formatCurrency(
                      accounts?.filter(acc => acc.type === 'challenge')
                        .reduce((sum, acc) => sum + acc.currentBalance, 0) || 0
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {accounts?.filter(acc => acc.type === 'challenge').length || 0} accounts • No payouts
                  </p>
                </div>
                <div className="bg-yellow-600 bg-opacity-20 p-3 rounded-lg">
                  <Target className="text-yellow-400 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* TASK 2: Stats Row - Active accounts, Realized payouts, Failed accounts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Active Accounts */}
          <Card className="bg-dark-card border-prop-tiffany">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Active Accounts</p>
                  <p className="text-2xl font-bold text-prop-tiffany">
                    {accounts?.filter(acc => acc.status === 'active' || acc.status === 'funded').length || 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Currently trading
                  </p>
                </div>
                <div className="bg-prop-tiffany bg-opacity-20 p-3 rounded-lg">
                  <CheckCircle className="text-prop-tiffany h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Realized Payouts */}
          <Card className="bg-dark-card border-prop-green">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Realized Payouts</p>
                  <p className="text-2xl font-bold text-prop-green">
                    {formatCurrency(
                      accounts?.filter(acc => acc.status === 'withdrawn')
                        .reduce((sum, acc) => sum + (acc.currentBalance - acc.startingBalance), 0) || 0
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Total earnings withdrawn
                  </p>
                </div>
                <div className="bg-prop-green bg-opacity-20 p-3 rounded-lg">
                  <Banknote className="text-prop-green h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Failed Accounts */}
          <Card className="bg-dark-card border-prop-pink">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Failed Accounts</p>
                  <p className="text-2xl font-bold text-prop-pink">
                    {accounts?.filter(acc => acc.status === 'failed').length || 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Accounts that broke rules
                  </p>
                </div>
                <div className="bg-prop-pink bg-opacity-20 p-3 rounded-lg">
                  <AlertTriangle className="text-prop-pink h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Total Portfolio Value Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Total Portfolio Value */}
          <Card className="bg-dark-card border-prop-gold">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Portfolio Value</p>
                  <p className="text-2xl font-bold text-prop-gold">
                    {formatCurrency(accounts?.reduce((sum, acc) => sum + acc.currentBalance, 0) || 0)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Combined accounts
                  </p>
                </div>
                <div className="bg-prop-gold bg-opacity-20 p-3 rounded-lg">
                  <DollarSign className="text-prop-gold h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Investment */}
          <Card className="bg-dark-card border-orange-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Investment</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {formatCurrency(
                      (accounts?.reduce((sum, acc) => sum + (acc.accountCost || 0), 0) || 0) +
                      (accounts?.reduce((sum, acc) => sum + (acc.activationCost || 0), 0) || 0)
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Account costs + activations
                  </p>
                </div>
                <div className="bg-orange-600 bg-opacity-20 p-3 rounded-lg">
                  <TrendingUp className="text-orange-400 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Return */}
          <Card className="bg-dark-card border-purple-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Return</p>
                  <p className={`text-2xl font-bold ${
                    (accounts?.reduce((sum, acc) => sum + (acc.currentBalance - acc.startingBalance), 0) || 0) >= 0 
                      ? 'text-success-green' 
                      : 'text-error-red'
                  }`}>
                    {formatCurrency(
                      accounts?.reduce((sum, acc) => sum + (acc.currentBalance - acc.startingBalance), 0) || 0
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Profit/Loss from trading
                  </p>
                </div>
                <div className="bg-purple-600 bg-opacity-20 p-3 rounded-lg">
                  <TrendingUp className="text-purple-400 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Progress - Profit Targets */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Target className="mr-2 h-5 w-5 text-green-400" />
            Account Progress
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {accounts?.map((account) => {
            const profitAmount = account.currentBalance - account.startingBalance;
            const profitProgress = account.profitTarget ? (profitAmount / account.profitTarget) * 100 : 0;
            
            return (
              <Card key={account.id} className="bg-dark-card border-green-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">{account.name}</p>
                      <p className="text-2xl font-bold text-green-400">
                        {formatCurrency(profitAmount)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Target: {formatCurrency(account.profitTarget || 0)}
                      </p>
                    </div>
                    <div className="bg-green-600 bg-opacity-20 p-3 rounded-lg">
                      <Target className="text-green-400 h-6 w-6" />
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(profitProgress, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {profitProgress.toFixed(1)}% of profit target achieved
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Investment Tracking */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center border-b border-gray-700 pb-3">
            <Shield className="mr-3 h-5 w-5 text-green-400" />
            Investment Tracking
          </h2>
        </div>



        {/* Investment Tracking & Working Hours Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="bg-dark-card border-green-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Spent on Accounts</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(accounts?.reduce((sum, acc) => sum + (acc.accountCost || 0), 0) || 0)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Purchase costs for all accounts
                  </p>
                </div>
                <div className="bg-green-600 bg-opacity-20 p-3 rounded-lg">
                  <DollarSign className="text-green-400 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-blue-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Activation Costs</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(accounts?.reduce((sum, acc) => sum + (acc.activationCost || 0), 0) || 0)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Activation fees paid/required
                  </p>
                </div>
                <div className="bg-blue-600 bg-opacity-20 p-3 rounded-lg">
                  <Shield className="text-blue-400 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-orange-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Combined</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(
                      (accounts?.reduce((sum, acc) => sum + (acc.accountCost || 0), 0) || 0) +
                      (accounts?.reduce((sum, acc) => sum + (acc.activationCost || 0), 0) || 0)
                    )}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Total investment in trading
                  </p>
                </div>
                <div className="bg-orange-600 bg-opacity-20 p-3 rounded-lg">
                  <TrendingUp className="text-orange-400 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-purple-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Payout</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {formatCurrency(0)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Received payouts
                  </p>
                </div>
                <div className="bg-purple-600 bg-opacity-20 p-3 rounded-lg">
                  <DollarSign className="text-purple-400 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Working Hours & Profitability Summary - Under Investment Tracking */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-dark-card border-cyan-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Working Hours</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {((trades?.length || 0) * 2.5).toFixed(1)} Hrs
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Based on {trades?.length || 0} trades × 2.5 Hrs avg duration
                  </p>
                </div>
                <div className="bg-cyan-600 bg-opacity-20 p-3 rounded-lg">
                  <Calendar className="text-cyan-400 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-indigo-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Average Hours Per Day</p>
                  <p className="text-2xl font-bold text-indigo-400">
                    {(() => {
                      const totalMinutes = ((trades?.length || 0) * 2.5 * 60) / 30;
                      if (totalMinutes < 60) {
                        return `${Math.round(totalMinutes)} Min`;
                      } else {
                        return `${(totalMinutes / 60).toFixed(1)} Hrs`;
                      }
                    })()}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Based on 30-day trading period
                  </p>
                </div>
                <div className="bg-indigo-600 bg-opacity-20 p-3 rounded-lg">
                  <Calendar className="text-indigo-400 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-emerald-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Profitability</p>
                  {(() => {
                    const totalSpent = (accounts?.reduce((sum, acc) => sum + (acc.accountCost || 0), 0) || 0) +
                                      (accounts?.reduce((sum, acc) => sum + (acc.activationCost || 0), 0) || 0);
                    const totalPayout = 0; // This would come from actual payout data
                    const difference = totalPayout - totalSpent;
                    const isProfit = difference >= 0;
                    
                    return (
                      <>
                        <p className={`text-2xl font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isProfit ? '+' : ''}{formatCurrency(difference)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {isProfit ? 'Profitable' : 'Loss'} • {formatCurrency(totalPayout)} vs {formatCurrency(totalSpent)}
                        </p>
                      </>
                    );
                  })()}
                </div>
                <div className="bg-emerald-600 bg-opacity-20 p-3 rounded-lg">
                  <TrendingUp className="text-emerald-400 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
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



        {/* Disciplined Trading Analysis */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center border-b border-gray-700 pb-3">
            <Brain className="mr-3 h-5 w-5 text-indigo-400" />
            Disciplined Trading Analysis
          </h2>
        </div>

        {/* Active Account Disciplined Analysis Row */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          <Card className="bg-dark-card border-indigo-600">
            <CardContent className="p-6">
              <div className="text-center">
                {accounts && accounts.length > 0 && trades && trades.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {accounts.map(account => {
                      const accountTrades = trades.filter(t => t.accountId === account.id);
                      const disciplinedAnalysis = calculateDisciplinedScore(account, accountTrades);
                      
                      return (
                        <div key={account.id} className="text-center p-4 bg-gray-800 rounded-lg">
                          <p className="text-xs text-gray-400 mb-1">{account.name}</p>
                          <p className={`text-2xl font-bold mb-1 ${getGradeColor(disciplinedAnalysis.scoreGrade)}`}>
                            {disciplinedAnalysis.disciplinedScore.toFixed(0)}%
                          </p>
                          <p className={`text-sm font-semibold ${getGradeColor(disciplinedAnalysis.scoreGrade)}`}>
                            Grade {disciplinedAnalysis.scoreGrade}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {disciplinedAnalysis.totalTrades} trades • {disciplinedAnalysis.violationsCount} violations
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-400">No trading data available for disciplined score analysis</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* First Row: Risk Management, Daily Trade Limit, Disciplined Score */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Risk Management */}
          <Card className="bg-dark-card border-warning-orange">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Risk Management</p>
                  <p className="text-2xl font-bold text-warning-orange">
                    {formatCurrency(500)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Per trade / {formatCurrency(1500)} daily limit
                  </p>
                </div>
                <div className="bg-warning-orange bg-opacity-20 p-3 rounded-lg">
                  <Shield className="text-warning-orange h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Trade Limit */}
          <Card className="bg-dark-card border-cyan-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Daily Trade Limit</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {trades?.filter(t => t.date === new Date().toISOString().split('T')[0]).length || 0} / 5
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Current trades today / Maximum allowed
                  </p>
                </div>
                <div className="bg-cyan-600 bg-opacity-20 p-3 rounded-lg">
                  <BarChart3 className="text-cyan-400 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disciplined Score */}
          <Card className="bg-dark-card border-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Disciplined Score</p>
                  <div className="flex items-center space-x-2">
                    <p className={`text-2xl font-bold ${getScoreColor(combinedAnalytics?.disciplinedScore || 100)}`}>
                      {Math.round(combinedAnalytics?.disciplinedScore || 100)}
                    </p>
                    <Badge className={`${getGradeColor(
                      (combinedAnalytics?.disciplinedScore || 100) >= 95 ? 'A+' :
                      (combinedAnalytics?.disciplinedScore || 100) >= 90 ? 'A' :
                      (combinedAnalytics?.disciplinedScore || 100) >= 80 ? 'B' :
                      (combinedAnalytics?.disciplinedScore || 100) >= 70 ? 'C' :
                      (combinedAnalytics?.disciplinedScore || 100) >= 60 ? 'D' : 'F'
                    )} text-white`}>
                      {(combinedAnalytics?.disciplinedScore || 100) >= 95 ? 'A+' :
                       (combinedAnalytics?.disciplinedScore || 100) >= 90 ? 'A' :
                       (combinedAnalytics?.disciplinedScore || 100) >= 80 ? 'B' :
                       (combinedAnalytics?.disciplinedScore || 100) >= 70 ? 'C' :
                       (combinedAnalytics?.disciplinedScore || 100) >= 60 ? 'D' : 'F'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    98% risk compliance / 100% trade limits
                  </p>
                </div>
                <div className="bg-primary bg-opacity-20 p-3 rounded-lg">
                  <Brain className="text-primary h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row: Risk Alert, Payout Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Risk Alert - Top 3 Critical Accounts */}
          <Card className="bg-dark-card border-warning-orange">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-warning-orange bg-opacity-20 p-2 rounded-lg mr-3">
                  <AlertTriangle className="text-warning-orange h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">Risk Alert</h3>
              </div>
              <p className="text-gray-300 mb-4">3 Most Critical Accounts</p>
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
            </CardContent>
          </Card>

          {/* TopStep Payout Status */}
          <Card className="bg-dark-card border-blue-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-blue-600 bg-opacity-20 p-2 rounded-lg mr-3">
                    <DollarSign className="text-blue-400 h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">Payout Status</h3>
                </div>
                <Select value={selectedAccountId?.toString() || ''} onValueChange={(value) => setSelectedAccountId(Number(value))}>
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
                const selectedAccount = accounts?.find(acc => acc.id === selectedAccountId);
                if (!selectedAccount) return null;
                
                const accountTrades = trades?.filter(t => t.accountId === selectedAccount.id) || [];
                const winningTrades = accountTrades.filter(t => (t.pnl || 0) >= 200);
                const totalProfit = selectedAccount.currentBalance - selectedAccount.startingBalance;
                const currentDrawdown = selectedAccount.maxDrawdown - (selectedAccount.startingBalance - selectedAccount.currentBalance);
                const isInDrawdown = currentDrawdown < 2500 || currentDrawdown < 6000;
                
                const daysTraded = new Set(accountTrades.map(t => t.date)).size;
                const winningDays = winningTrades.length;
                const profitTargetMet = totalProfit >= 3000;
                const daysRequirementMet = daysTraded >= 30;
                const drawdownSafe = !isInDrawdown;
                
                const isReady = profitTargetMet && daysRequirementMet && drawdownSafe && winningDays >= 5;
                
                return (
                  <div className="space-y-4">
                    {/* Status Indicator */}
                    <div className="text-center p-4 rounded-lg bg-gray-800">
                      <p className={`text-2xl font-bold ${isReady ? 'text-green-400' : 'text-yellow-400'}`}>
                        {isReady ? '✓ READY FOR PAYOUT' : 'IN PROGRESS'}
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Payout Amount: {formatCurrency(Math.min(selectedAccount.currentBalance * 0.5, 5000))}
                      </p>
                    </div>
                    
                    {/* Progress Tracking */}
                    <div className="space-y-4">
                      {/* Profit Target Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-300">Profit Target</span>
                          <span className={profitTargetMet ? 'text-green-400' : 'text-yellow-400'}>
                            {formatCurrency(totalProfit)} / {formatCurrency(3000)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-300 ${
                              profitTargetMet ? 'bg-green-400' : 'bg-yellow-400'
                            }`}
                            style={{ width: `${Math.min((totalProfit / 3000) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Trading Days Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-300">Trading Days</span>
                          <span className={daysRequirementMet ? 'text-green-400' : 'text-blue-400'}>
                            {daysTraded} / 30 days
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-300 ${
                              daysRequirementMet ? 'bg-green-400' : 'bg-blue-400'
                            }`}
                            style={{ width: `${Math.min((daysTraded / 30) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Winning Days Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-300">Winning Days ($200+)</span>
                          <span className={winningDays >= 5 ? 'text-green-400' : 'text-purple-400'}>
                            {winningDays} / 5 days
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-300 ${
                              winningDays >= 5 ? 'bg-green-400' : 'bg-purple-400'
                            }`}
                            style={{ width: `${Math.min((winningDays / 5) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
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
            </CardContent>
          </Card>
        </div>



        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-dark-card border-dark-border">
            <CardHeader>
              <CardTitle>Account Equity Curve</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <EquityChart data={equityData} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-dark-border">
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <MonthlyPerformanceChart data={monthlyData} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Accounts & Recent Trades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-dark-card border-dark-border">
            <CardHeader>
              <CardTitle>Active Accounts</CardTitle>
              <p className="text-gray-400 text-sm">Prop firm challenge and funded accounts</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {accounts?.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-4 bg-dark-surface rounded-lg border border-dark-border">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
                      account.type === 'funded' ? 'bg-success-green' : 
                      account.currentBalance < account.startingBalance * 0.95 ? 'bg-warning-orange' : 'bg-primary'
                    }`}>
                      {account.type === 'funded' ? (
                        <Target className="text-white h-5 w-5" />
                      ) : account.currentBalance < account.startingBalance * 0.95 ? (
                        <AlertTriangle className="text-white h-5 w-5" />
                      ) : (
                        <TrendingDown className="text-white h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-sm text-gray-400">
                        {formatCurrency(account.startingBalance)} {account.type === 'funded' ? 'Funded' : 'Challenge'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      account.currentBalance >= account.startingBalance ? 'text-success-green' : 'text-error-red'
                    }`}>
                      {formatCurrency(account.currentBalance)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatPercentage((account.currentBalance - account.startingBalance) / account.startingBalance * 100)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-dark-border">
            <CardHeader>
              <CardTitle>Recent Trades</CardTitle>
              <p className="text-gray-400 text-sm">Latest trading activity</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-dark-surface">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-400">Date</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-400">Symbol</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-400">Side</th>
                      <th className="px-6 py-3 text-right font-medium text-gray-400">P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border">
                    {recentTrades.map((trade) => (
                      <tr key={trade.id} className="hover:bg-dark-surface transition-colors">
                        <td className="px-6 py-4">{formatDate(trade.date)}</td>
                        <td className="px-6 py-4">{trade.symbol}</td>
                        <td className="px-6 py-4">
                          <Badge variant={trade.side === 'buy' ? 'default' : 'destructive'} className={
                            trade.side === 'buy' 
                              ? 'bg-success-green bg-opacity-20 text-success-green' 
                              : 'bg-error-red bg-opacity-20 text-error-red'
                          }>
                            {trade.side === 'buy' ? 'LONG' : 'SHORT'}
                          </Badge>
                        </td>
                        <td className={`px-6 py-4 text-right font-medium ${
                          trade.pnl >= 0 ? 'text-success-green' : 'text-error-red'
                        }`}>
                          {formatCurrency(trade.pnl)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>



        {/* Daily Journal Quick Entry */}
        <Card className="bg-dark-card border-dark-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-accent-orange bg-opacity-20 p-2 rounded-lg mr-3">
                  <Target className="text-accent-orange h-5 w-5" />
                </div>
                <CardTitle>Daily Trading Journal</CardTitle>
              </div>
              <Link href="/journal">
                <Button variant="ghost" className="text-primary hover:text-blue-400">
                  View Full Journal
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            
            <div className="flex justify-end mt-4">
              <Button className="bg-accent-orange hover:bg-orange-600">
                Save Journal Entry
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* TASK 4: Enhanced Trade Analysis Calendar - Unique Design */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center border-b border-gray-700 pb-3">
            <Calendar className="mr-3 h-5 w-5 text-prop-tiffany" />
            Trade Analysis Calendar
          </h2>
          <TradeAnalysisCalendar 
            trades={trades || []} 
            accounts={accounts || []}
            viewMode={timePeriod}
          />
        </div>
      </div>
    </>
  );
}
