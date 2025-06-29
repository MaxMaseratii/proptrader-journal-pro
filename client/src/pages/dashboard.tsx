import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { EquityChart, MonthlyPerformanceChart } from "@/components/chart-components";
import { formatCurrency, formatPercentage, formatDate } from "@/lib/utils";
import { calculateDisciplinedScore, getScoreColor, getGradeColor } from "@/lib/disciplined-score";
import TradeCalendar from "@/components/trade-calendar";
import TradeEntry from "@/components/trade-entry";
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
  Brain
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

  const { data: accounts, isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: trades, isLoading: tradesLoading } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

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
      profitFactor
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

      <div className="p-6 space-y-6">
        {/* Account Type Counters - First Row (Smaller) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-dark-card border-yellow-600">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">
                  {accounts?.filter(acc => acc.type === 'challenge').length || 0}
                </p>
                <p className="text-sm text-gray-400 mt-1">Challenge</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-red-600">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">
                  {accounts?.filter(acc => acc.status === 'failed').length || 0}
                </p>
                <p className="text-sm text-gray-400 mt-1">Failed</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-green-600">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">
                  {accounts?.filter(acc => acc.status === 'active').length || 0}
                </p>
                <p className="text-sm text-gray-400 mt-1">Live</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-blue-600">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">
                  {accounts?.filter(acc => acc.status === 'funded').length || 0}
                </p>
                <p className="text-sm text-gray-400 mt-1">Funded</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Total Balance Row - Larger */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-dark-card border-purple-600">
            <CardContent className="p-8">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Combined Account Balance</p>
                <p className="text-5xl font-bold text-white mb-2">
                  {formatCurrency(accounts?.reduce((sum, acc) => sum + acc.currentBalance, 0) || 0)}
                </p>
                <div className="flex justify-center items-center text-sm text-gray-400">
                  <span>Starting Balance: {formatCurrency(accounts?.reduce((sum, acc) => sum + acc.startingBalance, 0) || 0)}</span>
                  <span className="mx-2">•</span>
                  <span className={`${
                    (accounts?.reduce((sum, acc) => sum + acc.currentBalance, 0) || 0) >= 
                    (accounts?.reduce((sum, acc) => sum + acc.startingBalance, 0) || 0) 
                    ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {((accounts?.reduce((sum, acc) => sum + acc.currentBalance, 0) || 0) - 
                     (accounts?.reduce((sum, acc) => sum + acc.startingBalance, 0) || 0) >= 0 ? '+' : '') +
                    formatCurrency((accounts?.reduce((sum, acc) => sum + acc.currentBalance, 0) || 0) - 
                                  (accounts?.reduce((sum, acc) => sum + acc.startingBalance, 0) || 0))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disciplined Score Row */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-dark-card border-indigo-600">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-indigo-400 mr-2" />
                  <h3 className="text-lg font-semibold text-white">Disciplined Trading Score</h3>
                </div>
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

        {/* Financial Tracking Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <p className="text-gray-400 text-sm mb-1">Total Activation Costs</p>
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
                  <p className="text-gray-400 text-sm mb-1">Combined Total</p>
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
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-dark-card border-dark-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Balance</p>
                  <p className="text-2xl font-bold text-success-green">
                    {formatCurrency(combinedAnalytics?.currentBalance || 0)}
                  </p>
                  <p className="text-xs text-success-green mt-1">
                    +2.4% this month
                  </p>
                </div>
                <div className="bg-success-green bg-opacity-20 p-3 rounded-lg">
                  <Wallet className="text-success-green h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-dark-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Daily P&L</p>
                  <p className="text-2xl font-bold text-error-red">
                    {formatCurrency(combinedAnalytics?.worstTrade || 0)}
                  </p>
                  <p className="text-xs text-error-red mt-1">
                    Worst day: Oct 7
                  </p>
                </div>
                <div className="bg-error-red bg-opacity-20 p-3 rounded-lg">
                  <TrendingDown className="text-error-red h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-dark-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Win Rate</p>
                  <p className="text-2xl font-bold">{combinedAnalytics?.winRate.toFixed(0) || 0}%</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {combinedAnalytics?.winningTrades || 0} wins, {combinedAnalytics?.losingTrades || 0} losses
                  </p>
                </div>
                <div className="bg-primary bg-opacity-20 p-3 rounded-lg">
                  <Target className="text-primary h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-dark-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Risk Limit</p>
                  <p className="text-2xl font-bold text-warning-orange">
                    {formatCurrency(combinedAnalytics?.dailyLossLimit || 0)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Max daily loss</p>
                </div>
                <div className="bg-warning-orange bg-opacity-20 p-3 rounded-lg">
                  <Shield className="text-warning-orange h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disciplined Score Card */}
          <Card className="bg-dark-card border-dark-border">
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
                  <p className="text-xs text-gray-400 mt-1">Risk compliance</p>
                </div>
                <div className="bg-blue-600 bg-opacity-20 p-3 rounded-lg">
                  <Crosshair className="text-blue-400 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Win/Loss Card */}
          <Card className="bg-dark-card border-dark-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Avg Win/Loss</p>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-green-400">
                      {formatCurrency(combinedAnalytics?.averageWin || 0)}
                    </span>
                    <span className="text-gray-400">/</span>
                    <span className="text-red-400">
                      {formatCurrency(combinedAnalytics?.averageLoss || 0)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Profit Factor: {(combinedAnalytics?.profitFactor || 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-purple-600 bg-opacity-20 p-3 rounded-lg">
                  <DollarSign className="text-purple-400 h-6 w-6" />
                </div>
              </div>
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
                            {trade.side.toUpperCase()}
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

        {/* Risk Management & Payout Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-dark-card border-warning-orange">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-warning-orange bg-opacity-20 p-2 rounded-lg mr-3">
                  <AlertTriangle className="text-warning-orange h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">Risk Alert</h3>
              </div>
              <p className="text-gray-300 mb-4">Daily loss limit approaching on {primaryAccount?.name}</p>
              <div className="bg-dark-surface rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Daily Loss Used</span>
                  <span className="text-warning-orange">{combinedAnalytics?.riskLimitUsed.toFixed(1) || 0}%</span>
                </div>
                <Progress 
                  value={combinedAnalytics?.riskLimitUsed || 0} 
                  className="w-full h-2 bg-dark-border"
                />
                <p className="text-xs text-gray-400 mt-2">
                  {formatCurrency(Math.abs(combinedAnalytics?.worstTrade || 0))} of {formatCurrency(combinedAnalytics?.dailyLossLimit || 0)} daily limit used
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-dark-border">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-success-green bg-opacity-20 p-2 rounded-lg mr-3">
                  <DollarSign className="text-success-green h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">Payout Status</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">5-Day Eligibility</span>
                  <Badge className="bg-success-green bg-opacity-20 text-success-green">Eligible</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">20% Consistency</span>
                  <Badge className="bg-error-red bg-opacity-20 text-error-red">Pending</Badge>
                </div>
                <div className="pt-2 border-t border-dark-border">
                  <div className="flex justify-between text-sm">
                    <span>Available Payout</span>
                    <span className="font-medium text-success-green">{formatCurrency(1500)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-dark-border">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-primary bg-opacity-20 p-2 rounded-lg mr-3">
                  <Crosshair className="text-primary h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">Profit Target</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Challenge Progress</span>
                    <span className="text-error-red">
                      {formatPercentage((combinedAnalytics?.totalPnl || 0) / (combinedAnalytics?.profitTarget || 1) * 100)}
                    </span>
                  </div>
                  <Progress 
                    value={Math.max(0, ((combinedAnalytics?.totalPnl || 0) / (combinedAnalytics?.profitTarget || 1)) * 100)} 
                    className="w-full h-2 bg-dark-border"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Need {formatCurrency((combinedAnalytics?.profitTarget || 0) - (combinedAnalytics?.totalPnl || 0))} to reach 10% target
                  </p>
                </div>
                <Link href="/accounts">
                  <Button className="w-full bg-primary hover:bg-blue-700">
                    View Challenge Details
                  </Button>
                </Link>
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



        {/* Compact Trading Calendar */}
        <Card className="bg-dark-card border-dark-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="bg-green-600 bg-opacity-20 p-2 rounded-lg mr-3">
                <Target className="text-green-400 h-5 w-5" />
              </div>
              Trading Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-4xl">
              <TradeCalendar trades={trades || []} />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
