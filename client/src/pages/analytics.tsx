import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatPercentage, formatDate } from "@/lib/utils";
import { calculateDisciplinedScore, type DisciplinedAnalysis } from "@/lib/disciplined-score";
import { EquityChart, MonthlyPerformanceChart } from "@/components/chart-components";
import EnhancedDisciplineAnalyzer from "@/components/enhanced-discipline-analyzer";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar as CalendarIcon, 
  Download, 
  Filter,
  BarChart3,
  Target,
  AlertTriangle,
  DollarSign,
  Percent,
  Activity,
  Award,
  Users,
  PieChart
} from "lucide-react";
import type { Account, Trade, JournalEntry } from "@shared/schema";

interface AdvancedMetrics {
  // Performance Metrics
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  
  // Risk Metrics
  sharpeRatio: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  largestWin: number;
  largestLoss: number;
  averageRiskReward: number;
  
  // Time-based Metrics
  bestDay: number;
  worstDay: number;
  totalTradingDays: number;
  averageTradesPerDay: number;
  
  // Account Metrics
  maxDrawdown: number;
  currentDrawdown: number;
  recoveryFactor: number;
  calmarRatio: number;
  
  // Advanced Analytics
  expectancy: number;
  kellyCriterion: number;
  ulcerIndex: number;
  sterlingRatio: number;
}

interface TimeFrameData {
  daily: { date: string; pnl: number; trades: number; winRate: number }[];
  weekly: { week: string; pnl: number; trades: number; winRate: number }[];
  monthly: { month: string; pnl: number; trades: number; winRate: number }[];
}

export default function Analytics() {
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 3)),
    to: new Date()
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [analysisType, setAnalysisType] = useState<"overview" | "detailed" | "comparison">("overview");

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  const { data: trades } = useQuery<Trade[]>({
    queryKey: ['/api/trades'],
  });

  const { data: journalEntries } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal-entries'],
  });

  const filteredData = useMemo(() => {
    if (!trades || !accounts) return { trades: [], accounts: [] };

    const fromDate = dateRange.from.toISOString().split('T')[0];
    const toDate = dateRange.to.toISOString().split('T')[0];

    let filteredTrades = trades.filter(trade => 
      trade.date >= fromDate && trade.date <= toDate
    );

    let filteredAccounts = accounts;

    if (selectedAccount !== "all") {
      const accountId = parseInt(selectedAccount);
      filteredTrades = filteredTrades.filter(trade => trade.accountId === accountId);
      filteredAccounts = accounts.filter(account => account.id === accountId);
    }

    return { trades: filteredTrades, accounts: filteredAccounts };
  }, [trades, accounts, selectedAccount, dateRange]);

  const advancedMetrics = useMemo((): AdvancedMetrics => {
    const { trades: filteredTrades } = filteredData;
    
    if (!filteredTrades.length) {
      return {
        totalPnL: 0, winRate: 0, totalTrades: 0, winningTrades: 0, losingTrades: 0,
        averageWin: 0, averageLoss: 0, profitFactor: 0, sharpeRatio: 0,
        maxConsecutiveWins: 0, maxConsecutiveLosses: 0, largestWin: 0, largestLoss: 0,
        averageRiskReward: 0, bestDay: 0, worstDay: 0, totalTradingDays: 0,
        averageTradesPerDay: 0, maxDrawdown: 0, currentDrawdown: 0,
        recoveryFactor: 0, calmarRatio: 0, expectancy: 0, kellyCriterion: 0,
        ulcerIndex: 0, sterlingRatio: 0
      };
    }

    const winningTrades = filteredTrades.filter(t => t.pnl > 0);
    const losingTrades = filteredTrades.filter(t => t.pnl < 0);
    const totalPnL = filteredTrades.reduce((sum, t) => sum + t.pnl, 0);
    
    const averageWin = winningTrades.length > 0 
      ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length 
      : 0;
    
    const averageLoss = losingTrades.length > 0 
      ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length)
      : 0;

    const profitFactor = averageLoss > 0 ? (averageWin * winningTrades.length) / (averageLoss * losingTrades.length) : 0;
    
    // Group trades by day for daily analytics
    const dailyData = new Map<string, { pnl: number; trades: number }>();
    filteredTrades.forEach(trade => {
      const existing = dailyData.get(trade.date) || { pnl: 0, trades: 0 };
      dailyData.set(trade.date, {
        pnl: existing.pnl + trade.pnl,
        trades: existing.trades + 1
      });
    });

    const dailyPnLs = Array.from(dailyData.values()).map(d => d.pnl);
    const bestDay = dailyPnLs.length > 0 ? Math.max(...dailyPnLs) : 0;
    const worstDay = dailyPnLs.length > 0 ? Math.min(...dailyPnLs) : 0;

    // Calculate consecutive wins/losses
    let maxConsecutiveWins = 0;
    let maxConsecutiveLosses = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;

    filteredTrades.forEach(trade => {
      if (trade.pnl > 0) {
        currentWinStreak++;
        currentLossStreak = 0;
        maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWinStreak);
      } else if (trade.pnl < 0) {
        currentLossStreak++;
        currentWinStreak = 0;
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLossStreak);
      }
    });

    // Calculate Sharpe Ratio (simplified)
    const dailyReturns = dailyPnLs.length > 1 ? dailyPnLs : [0];
    const avgDailyReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length;
    const dailyStdDev = Math.sqrt(
      dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgDailyReturn, 2), 0) / dailyReturns.length
    );
    const sharpeRatio = dailyStdDev > 0 ? (avgDailyReturn / dailyStdDev) * Math.sqrt(252) : 0;

    // Expectancy calculation
    const winRate = winningTrades.length / filteredTrades.length;
    const expectancy = (winRate * averageWin) - ((1 - winRate) * averageLoss);

    // Kelly Criterion
    const kellyCriterion = averageLoss > 0 ? (winRate - ((1 - winRate) / (averageWin / averageLoss))) : 0;

    return {
      totalPnL,
      winRate: winRate * 100,
      totalTrades: filteredTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      averageWin,
      averageLoss,
      profitFactor,
      sharpeRatio,
      maxConsecutiveWins,
      maxConsecutiveLosses,
      largestWin: winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl)) : 0,
      largestLoss: losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnl)) : 0,
      averageRiskReward: averageLoss > 0 ? averageWin / averageLoss : 0,
      bestDay,
      worstDay,
      totalTradingDays: dailyData.size,
      averageTradesPerDay: dailyData.size > 0 ? filteredTrades.length / dailyData.size : 0,
      maxDrawdown: 0, // Would need historical balance data
      currentDrawdown: 0,
      recoveryFactor: 0,
      calmarRatio: 0,
      expectancy,
      kellyCriterion: Math.max(0, Math.min(1, kellyCriterion)), // Bounded between 0 and 1
      ulcerIndex: 0,
      sterlingRatio: 0
    };
  }, [filteredData]);

  const timeFrameData = useMemo((): TimeFrameData => {
    const { trades: filteredTrades } = filteredData;
    
    // Group by day
    const dailyMap = new Map<string, { pnl: number; trades: Trade[] }>();
    filteredTrades.forEach(trade => {
      const existing = dailyMap.get(trade.date) || { pnl: 0, trades: [] };
      dailyMap.set(trade.date, {
        pnl: existing.pnl + trade.pnl,
        trades: [...existing.trades, trade]
      });
    });

    const daily = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        pnl: data.pnl,
        trades: data.trades.length,
        winRate: data.trades.filter(t => t.pnl > 0).length / data.trades.length * 100
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Group by week
    const weeklyMap = new Map<string, { pnl: number; trades: Trade[] }>();
    filteredTrades.forEach(trade => {
      const date = new Date(trade.date);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      
      const existing = weeklyMap.get(weekKey) || { pnl: 0, trades: [] };
      weeklyMap.set(weekKey, {
        pnl: existing.pnl + trade.pnl,
        trades: [...existing.trades, trade]
      });
    });

    const weekly = Array.from(weeklyMap.entries())
      .map(([week, data]) => ({
        week,
        pnl: data.pnl,
        trades: data.trades.length,
        winRate: data.trades.filter(t => t.pnl > 0).length / data.trades.length * 100
      }))
      .sort((a, b) => a.week.localeCompare(b.week));

    // Group by month
    const monthlyMap = new Map<string, { pnl: number; trades: Trade[] }>();
    filteredTrades.forEach(trade => {
      const date = new Date(trade.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const existing = monthlyMap.get(monthKey) || { pnl: 0, trades: [] };
      monthlyMap.set(monthKey, {
        pnl: existing.pnl + trade.pnl,
        trades: [...existing.trades, trade]
      });
    });

    const monthly = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        pnl: data.pnl,
        trades: data.trades.length,
        winRate: data.trades.filter(t => t.pnl > 0).length / data.trades.length * 100
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return { daily, weekly, monthly };
  }, [filteredData]);

  const disciplinedAnalysis = useMemo((): DisciplinedAnalysis | null => {
    if (!accounts || selectedAccount === "all") return null;
    
    const account = accounts.find(acc => acc.id === parseInt(selectedAccount));
    if (!account) return null;

    return calculateDisciplinedScore(account, filteredData.trades);
  }, [accounts, selectedAccount, filteredData.trades]);

  const exportData = () => {
    const data = {
      metrics: advancedMetrics,
      timeFrameData,
      trades: filteredData.trades,
      accounts: filteredData.accounts,
      disciplinedAnalysis,
      reportGenerated: new Date().toISOString(),
      dateRange: {
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString()
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Advanced Analytics</h1>
            <p className="text-gray-400 mt-1">Comprehensive performance analysis and insights</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={exportData} className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-gray-300">Account</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    {accounts?.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Analysis Type</Label>
                <Select value={analysisType} onValueChange={(value: any) => setAnalysisType(value)}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Overview</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="comparison">Comparison</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Date Range</Label>
                <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left bg-gray-700 border-gray-600">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-4 space-y-4">
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          value={dateRange.from.toISOString().split('T')[0]}
                          onChange={(e) => setDateRange(prev => ({ ...prev, from: new Date(e.target.value) }))}
                          className="bg-gray-700 border-gray-600"
                        />
                        <Input
                          type="date"
                          value={dateRange.to.toISOString().split('T')[0]}
                          onChange={(e) => setDateRange(prev => ({ ...prev, to: new Date(e.target.value) }))}
                          className="bg-gray-700 border-gray-600"
                        />
                      </div>
                      <Button onClick={() => setShowDatePicker(false)} className="w-full">
                        Apply
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-end">
                <div className="text-sm text-gray-400">
                  <p>{filteredData.trades.length} trades analyzed</p>
                  <p>{filteredData.accounts.length} accounts</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={analysisType} onValueChange={(value: any) => setAnalysisType(value)}>
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="discipline">Discipline Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-200 text-sm">Total P&L</p>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(advancedMetrics.totalPnL)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-200 text-sm">Win Rate</p>
                      <p className="text-2xl font-bold text-white">
                        {formatPercentage(advancedMetrics.winRate)}
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-sm">Profit Factor</p>
                      <p className="text-2xl font-bold text-white">
                        {advancedMetrics.profitFactor.toFixed(2)}
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-900 to-orange-800 border-orange-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-200 text-sm">Sharpe Ratio</p>
                      <p className="text-2xl font-bold text-white">
                        {advancedMetrics.sharpeRatio.toFixed(2)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Daily P&L Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <EquityChart 
                    data={timeFrameData.daily.map(d => ({ 
                      date: d.date, 
                      balance: d.pnl 
                    }))} 
                  />
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Monthly Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <MonthlyPerformanceChart 
                    data={timeFrameData.monthly.map(m => ({ 
                      month: m.month, 
                      pnl: m.pnl 
                    }))} 
                  />
                </CardContent>
              </Card>
            </div>

            {/* Trading Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-green-400">Winning Trades</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Count:</span>
                    <span className="font-medium">{advancedMetrics.winningTrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average Win:</span>
                    <span className="font-medium text-green-400">
                      {formatCurrency(advancedMetrics.averageWin)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Largest Win:</span>
                    <span className="font-medium text-green-400">
                      {formatCurrency(advancedMetrics.largestWin)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Consecutive:</span>
                    <span className="font-medium">{advancedMetrics.maxConsecutiveWins}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-red-400">Losing Trades</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Count:</span>
                    <span className="font-medium">{advancedMetrics.losingTrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average Loss:</span>
                    <span className="font-medium text-red-400">
                      -{formatCurrency(advancedMetrics.averageLoss)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Largest Loss:</span>
                    <span className="font-medium text-red-400">
                      {formatCurrency(advancedMetrics.largestLoss)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Consecutive:</span>
                    <span className="font-medium">{advancedMetrics.maxConsecutiveLosses}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-blue-400">Advanced Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Expectancy:</span>
                    <span className={`font-medium ${advancedMetrics.expectancy >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(advancedMetrics.expectancy)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Kelly Criterion:</span>
                    <span className="font-medium">
                      {formatPercentage(advancedMetrics.kellyCriterion * 100)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Risk/Reward:</span>
                    <span className="font-medium">
                      1:{advancedMetrics.averageRiskReward.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Trades/Day:</span>
                    <span className="font-medium">
                      {advancedMetrics.averageTradesPerDay.toFixed(1)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Disciplined Score (if single account selected) */}
            {disciplinedAnalysis && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-400" />
                    Disciplined Trading Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-6xl font-bold mb-2" style={{ color: disciplinedAnalysis.scoreGrade === 'A+' || disciplinedAnalysis.scoreGrade === 'A' ? '#10B981' : disciplinedAnalysis.scoreGrade === 'B' ? '#F59E0B' : '#EF4444' }}>
                        {disciplinedAnalysis.scoreGrade}
                      </div>
                      <p className="text-gray-400">Grade</p>
                      <p className="text-2xl font-bold">{disciplinedAnalysis.disciplinedScore.toFixed(1)}/100</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Risk Violations:</span>
                        <span className={`font-medium ${disciplinedAnalysis.violationsCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {disciplinedAnalysis.violationsCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Risk per Trade:</span>
                        <span className="font-medium">
                          {formatPercentage(disciplinedAnalysis.personalRiskPerTrade)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Avg Risk Used:</span>
                        <span className="font-medium">
                          {formatPercentage(disciplinedAnalysis.averageTradeRisk)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Key Recommendations:</h4>
                      <ul className="text-sm text-gray-400 space-y-1">
                        {disciplinedAnalysis.recommendations.slice(0, 3).map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-blue-400">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            {/* Risk Breakdown Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Risk Analysis Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-red-900/20 p-3 rounded-lg">
                      <p className="text-red-400 text-sm">Max Drawdown</p>
                      <p className="text-xl font-bold text-white">
                        {formatPercentage(Math.abs(advancedMetrics.maxDrawdown))}
                      </p>
                    </div>
                    <div className="bg-orange-900/20 p-3 rounded-lg">
                      <p className="text-orange-400 text-sm">Current Drawdown</p>
                      <p className="text-xl font-bold text-white">
                        {formatPercentage(Math.abs(advancedMetrics.currentDrawdown))}
                      </p>
                    </div>
                    <div className="bg-blue-900/20 p-3 rounded-lg">
                      <p className="text-blue-400 text-sm">Avg R:R Ratio</p>
                      <p className="text-xl font-bold text-white">
                        {advancedMetrics.averageRiskReward.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-purple-900/20 p-3 rounded-lg">
                      <p className="text-purple-400 text-sm">Kelly Criterion</p>
                      <p className="text-xl font-bold text-white">
                        {formatPercentage(advancedMetrics.kellyCriterion)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Trading Consistency</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Best Trading Day</span>
                      <span className={`font-bold ${advancedMetrics.bestDay >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(advancedMetrics.bestDay)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Worst Trading Day</span>
                      <span className={`font-bold ${advancedMetrics.worstDay >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(advancedMetrics.worstDay)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Avg Trades/Day</span>
                      <span className="font-bold text-white">
                        {advancedMetrics.averageTradesPerDay.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Max Consecutive Wins</span>
                      <span className="font-bold text-green-400">
                        {advancedMetrics.maxConsecutiveWins}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Max Consecutive Losses</span>
                      <span className="font-bold text-red-400">
                        {advancedMetrics.maxConsecutiveLosses}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Performance Metrics */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Advanced Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-300 border-b border-gray-600 pb-2">Risk Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Expectancy</span>
                        <span className={`font-medium ${advancedMetrics.expectancy >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(advancedMetrics.expectancy)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Recovery Factor</span>
                        <span className="font-medium text-white">
                          {advancedMetrics.recoveryFactor.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Calmar Ratio</span>
                        <span className="font-medium text-white">
                          {advancedMetrics.calmarRatio.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-300 border-b border-gray-600 pb-2">Trade Analysis</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Largest Win</span>
                        <span className="font-medium text-green-400">
                          {formatCurrency(advancedMetrics.largestWin)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Largest Loss</span>
                        <span className="font-medium text-red-400">
                          {formatCurrency(Math.abs(advancedMetrics.largestLoss))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Average Win</span>
                        <span className="font-medium text-green-400">
                          {formatCurrency(advancedMetrics.averageWin)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Average Loss</span>
                        <span className="font-medium text-red-400">
                          {formatCurrency(Math.abs(advancedMetrics.averageLoss))}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-300 border-b border-gray-600 pb-2">Advanced Ratios</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Ulcer Index</span>
                        <span className="font-medium text-white">
                          {advancedMetrics.ulcerIndex.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sterling Ratio</span>
                        <span className="font-medium text-white">
                          {advancedMetrics.sterlingRatio.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Trading Days</span>
                        <span className="font-medium text-white">
                          {advancedMetrics.totalTradingDays}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            {/* Account Comparison */}
            {filteredData.accounts.length > 1 ? (
              <div className="space-y-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>Account Performance Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-600">
                            <th className="text-left py-2">Account</th>
                            <th className="text-right py-2">P&L</th>
                            <th className="text-right py-2">Win Rate</th>
                            <th className="text-right py-2">Total Trades</th>
                            <th className="text-right py-2">Avg Trade</th>
                            <th className="text-right py-2">Max DD</th>
                            <th className="text-right py-2 pr-4">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.accounts.map((account) => {
                            const accountTrades = filteredData.trades.filter(t => t.accountId === account.id);
                            const accountPnL = accountTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
                            const winningTrades = accountTrades.filter(t => (t.pnl || 0) > 0).length;
                            const accountWinRate = accountTrades.length > 0 ? winningTrades / accountTrades.length : 0;
                            const avgTrade = accountTrades.length > 0 ? accountPnL / accountTrades.length : 0;
                            const drawdown = ((account.currentBalance - account.startingBalance) / account.startingBalance) * 100;
                            
                            return (
                              <tr key={account.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="py-3">
                                  <div>
                                    <p className="font-medium text-white">{account.name}</p>
                                    <p className="text-xs text-gray-400 capitalize">{account.type}</p>
                                  </div>
                                </td>
                                <td className={`text-right py-3 font-bold ${accountPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {formatCurrency(accountPnL)}
                                </td>
                                <td className="text-right py-3 text-white">
                                  {formatPercentage(accountWinRate)}
                                </td>
                                <td className="text-right py-3 text-white">
                                  {accountTrades.length}
                                </td>
                                <td className={`text-right py-3 ${avgTrade >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {formatCurrency(avgTrade)}
                                </td>
                                <td className={`text-right py-3 ${Math.abs(drawdown) > 10 ? 'text-red-400' : Math.abs(drawdown) > 5 ? 'text-orange-400' : 'text-green-400'}`}>
                                  {formatPercentage(drawdown)}
                                </td>
                                <td className="text-right py-3 pr-4">
                                  <Badge variant={
                                    account.status === 'funded' ? 'default' :
                                    account.status === 'active' ? 'secondary' :
                                    account.status === 'passed' ? 'default' :
                                    'destructive'
                                  } className="capitalize">
                                    {account.status}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Visual Comparison Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle>P&L Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {filteredData.accounts.map((account) => {
                          const accountTrades = filteredData.trades.filter(t => t.accountId === account.id);
                          const accountPnL = accountTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
                          const maxPnL = Math.max(...filteredData.accounts.map(acc => {
                            const accTrades = filteredData.trades.filter(t => t.accountId === acc.id);
                            return Math.abs(accTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0));
                          }));
                          const barWidth = maxPnL > 0 ? (Math.abs(accountPnL) / maxPnL) * 100 : 0;
                          
                          return (
                            <div key={account.id} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-300">{account.name}</span>
                                <span className={accountPnL >= 0 ? 'text-green-400' : 'text-red-400'}>
                                  {formatCurrency(accountPnL)}
                                </span>
                              </div>
                              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all ${accountPnL >= 0 ? 'bg-green-400' : 'bg-red-400'}`}
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle>Trading Activity Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {filteredData.accounts.map((account) => {
                          const accountTrades = filteredData.trades.filter(t => t.accountId === account.id);
                          const maxTrades = Math.max(...filteredData.accounts.map(acc => 
                            filteredData.trades.filter(t => t.accountId === acc.id).length
                          ));
                          const barWidth = maxTrades > 0 ? (accountTrades.length / maxTrades) * 100 : 0;
                          
                          return (
                            <div key={account.id} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-300">{account.name}</span>
                                <span className="text-white">{accountTrades.length} trades</span>
                              </div>
                              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-400 rounded-full transition-all"
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Account Comparison</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No accounts to compare</p>
                  <p className="text-sm text-gray-500">Create multiple accounts to see performance comparisons</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="discipline" className="space-y-6">
            <EnhancedDisciplineAnalyzer 
              trades={filteredData.trades || []} 
              accounts={filteredData.accounts || []} 
              selectedAccountId={selectedAccount !== "all" ? parseInt(selectedAccount) : undefined}
            />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}