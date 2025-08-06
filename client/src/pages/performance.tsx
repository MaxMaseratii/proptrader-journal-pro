import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EquityChart, MonthlyPerformanceChart } from "@/components/chart-components";
import { formatCurrency, formatPercentage, formatDate, calculateWinRate } from "@/lib/utils";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Activity,
  Calendar,
  BarChart3,
  DollarSign
} from "lucide-react";
import type { Account, Trade } from "@shared/schema";

interface PerformanceMetrics {
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  sharpeRatio: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  bestDay: number;
  worstDay: number;
  tradingDays: number;
}

export default function Performance() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [timeframe, setTimeframe] = useState<string>("all");

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: trades, isLoading } = useQuery<Trade[]>({
    queryKey: ["/api/trades", selectedAccountId],
    enabled: !!selectedAccountId,
  });

  const selectedAccount = accounts?.find(acc => acc.id.toString() === selectedAccountId);

  const calculatePerformanceMetrics = (): PerformanceMetrics | null => {
    if (!trades || trades.length === 0) return null;

    const filteredTrades = filterTradesByTimeframe(trades, timeframe);
    
    const totalPnL = filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const winningTrades = filteredTrades.filter(trade => trade.pnl > 0);
    const losingTrades = filteredTrades.filter(trade => trade.pnl < 0);
    
    const winRate = calculateWinRate(winningTrades.length, filteredTrades.length);
    const averageWin = winningTrades.length > 0 ? winningTrades.reduce((sum, trade) => sum + trade.pnl, 0) / winningTrades.length : 0;
    const averageLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0) / losingTrades.length) : 0;
    
    const grossProfit = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;

    // Group trades by day for daily metrics
    const dailyPnL = groupTradesByDay(filteredTrades);
    const dailyPnLValues = Object.values(dailyPnL);
    const bestDay = Math.max(...dailyPnLValues, 0);
    const worstDay = Math.min(...dailyPnLValues, 0);

    return {
      totalPnL,
      winRate,
      totalTrades: filteredTrades.length,
      averageWin,
      averageLoss,
      profitFactor,
      sharpeRatio: calculateSharpeRatio(dailyPnLValues),
      maxConsecutiveWins: calculateConsecutiveWins(filteredTrades),
      maxConsecutiveLosses: calculateConsecutiveLosses(filteredTrades),
      bestDay,
      worstDay,
      tradingDays: Object.keys(dailyPnL).length,
    };
  };

  const filterTradesByTimeframe = (trades: Trade[], timeframe: string): Trade[] => {
    if (timeframe === "all") return trades;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeframe) {
      case "7d":
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        cutoffDate.setDate(now.getDate() - 90);
        break;
      default:
        return trades;
    }
    
    return trades.filter(trade => new Date(trade.date) >= cutoffDate);
  };

  const groupTradesByDay = (trades: Trade[]): Record<string, number> => {
    return trades.reduce((acc, trade) => {
      const date = trade.date;
      acc[date] = (acc[date] || 0) + trade.pnl;
      return acc;
    }, {} as Record<string, number>);
  };

  const calculateSharpeRatio = (dailyReturns: number[]): number => {
    if (dailyReturns.length < 2) return 0;
    
    const meanReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length;
    const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / (dailyReturns.length - 1);
    const stdDev = Math.sqrt(variance);
    
    return stdDev > 0 ? (meanReturn / stdDev) * Math.sqrt(252) : 0; // Annualized
  };

  const calculateConsecutiveWins = (trades: Trade[]): number => {
    let maxConsecutive = 0;
    let current = 0;
    
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    for (const trade of sortedTrades) {
      if (trade.pnl > 0) {
        current++;
        maxConsecutive = Math.max(maxConsecutive, current);
      } else {
        current = 0;
      }
    }
    
    return maxConsecutive;
  };

  const calculateConsecutiveLosses = (trades: Trade[]): number => {
    let maxConsecutive = 0;
    let current = 0;
    
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    for (const trade of sortedTrades) {
      if (trade.pnl < 0) {
        current++;
        maxConsecutive = Math.max(maxConsecutive, current);
      } else {
        current = 0;
      }
    }
    
    return maxConsecutive;
  };

  const getEquityData = () => {
    if (!trades || !selectedAccount) return [];
    
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningBalance = selectedAccount.startingBalance;
    
    const equityData = [{ date: "Start", balance: runningBalance }];
    
    sortedTrades.forEach(trade => {
      runningBalance += trade.pnl;
      equityData.push({
        date: formatDate(trade.date),
        balance: runningBalance
      });
    });
    
    return equityData;
  };

  const getMonthlyData = () => {
    if (!trades) return [];
    
    const monthlyPnL = trades.reduce((acc, trade) => {
      const date = new Date(trade.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + trade.pnl;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(monthlyPnL).map(([month, pnl]) => ({
      month: new Date(month + "-01").toLocaleDateString('en-US', { month: 'short' }),
      pnl
    }));
  };

  const metrics = calculatePerformanceMetrics();

  return (
    <>
      <header className="bg-dark-surface border-b border-dark-border px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gradient-rainbow">Performance Analytics</h2>
            <p className="text-gray-400 text-sm mt-1">Analyze your trading performance and statistics</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts?.map((account) => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="p-6">
        {!selectedAccount ? (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">Select an account to view performance</h3>
            <p className="text-gray-400">Choose an account from the dropdown to analyze trading performance</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-400">Loading performance data...</p>
            </div>
          </div>
        ) : !metrics ? (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No trading data available</h3>
            <p className="text-gray-400">Start trading to see your performance analytics</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Key Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="widget-bg border-prop-gold/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="widget-text opacity-70 text-sm mb-1">Total P&L</p>
                      <p className={`text-2xl font-bold ${metrics.totalPnL >= 0 ? 'text-success-green' : 'text-error-red'}`}>
                        {formatCurrency(metrics.totalPnL)}
                      </p>
                      <p className="text-xs widget-text opacity-70 mt-1">{metrics.totalTrades} trades</p>
                    </div>
                    <div className={`bg-opacity-20 p-3 rounded-lg ${metrics.totalPnL >= 0 ? 'bg-success-green' : 'bg-error-red'}`}>
                      {metrics.totalPnL >= 0 ? (
                        <TrendingUp className="text-success-green h-6 w-6" />
                      ) : (
                        <TrendingDown className="text-error-red h-6 w-6" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="widget-bg border-prop-gold/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="widget-text opacity-70 text-sm mb-1">Win Rate</p>
                      <p className="text-2xl font-bold text-primary">{metrics.winRate.toFixed(1)}%</p>
                      <p className="text-xs widget-text opacity-70 mt-1">Success rate</p>
                    </div>
                    <div className="bg-primary bg-opacity-20 p-3 rounded-lg">
                      <Target className="text-primary h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="widget-bg border-prop-gold/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="widget-text opacity-70 text-sm mb-1">Profit Factor</p>
                      <p className="text-2xl font-bold text-warning-orange">{metrics.profitFactor.toFixed(2)}</p>
                      <p className="text-xs widget-text opacity-70 mt-1">Profit vs Loss ratio</p>
                    </div>
                    <div className="bg-warning-orange bg-opacity-20 p-3 rounded-lg">
                      <BarChart3 className="text-warning-orange h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="widget-bg border-prop-gold/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="widget-text opacity-70 text-sm mb-1">Sharpe Ratio</p>
                      <p className="text-2xl font-bold text-accent-orange">{metrics.sharpeRatio.toFixed(2)}</p>
                      <p className="text-xs widget-text opacity-70 mt-1">Risk-adjusted return</p>
                    </div>
                    <div className="bg-accent-orange bg-opacity-20 p-3 rounded-lg">
                      <Activity className="text-accent-orange h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="widget-bg border-prop-gold/20">
                <CardHeader>
                  <CardTitle className="widget-header">Equity Curve</CardTitle>
                  <p className="widget-text opacity-70 text-sm">Account balance over time</p>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <EquityChart data={getEquityData()} />
                  </div>
                </CardContent>
              </Card>

              <Card className="widget-bg border-prop-gold/20">
                <CardHeader>
                  <CardTitle className="widget-header">Monthly Performance</CardTitle>
                  <p className="widget-text opacity-70 text-sm">Monthly profit and loss breakdown</p>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <MonthlyPerformanceChart data={getMonthlyData()} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="widget-bg border-prop-gold/20">
                <CardHeader>
                  <CardTitle className="widget-header">Trading Statistics</CardTitle>
                  <p className="widget-text opacity-70 text-sm">Detailed performance breakdown</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium widget-text">Average Win</p>
                      <p className="text-lg font-bold text-success-green">{formatCurrency(metrics.averageWin)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium widget-text">Average Loss</p>
                      <p className="text-lg font-bold text-error-red">{formatCurrency(-metrics.averageLoss)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium widget-text">Best Day</p>
                      <p className="text-lg font-bold text-success-green">{formatCurrency(metrics.bestDay)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium widget-text">Worst Day</p>
                      <p className="text-lg font-bold text-error-red">{formatCurrency(metrics.worstDay)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium widget-text">Trading Days</p>
                      <p className="text-lg font-bold">{metrics.tradingDays}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium widget-text">Total Trades</p>
                      <p className="text-lg font-bold">{metrics.totalTrades}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="widget-bg border-prop-gold/20">
                <CardHeader>
                  <CardTitle className="widget-header">Streak Analysis</CardTitle>
                  <p className="widget-text opacity-70 text-sm">Consecutive wins and losses</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm widget-text">Max Consecutive Wins</span>
                        <Badge className="bg-success-green text-white">{metrics.maxConsecutiveWins}</Badge>
                      </div>
                      <Progress value={(metrics.maxConsecutiveWins / Math.max(metrics.maxConsecutiveWins, metrics.maxConsecutiveLosses, 1)) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm widget-text">Max Consecutive Losses</span>
                        <Badge className="bg-error-red text-white">{metrics.maxConsecutiveLosses}</Badge>
                      </div>
                      <Progress value={(metrics.maxConsecutiveLosses / Math.max(metrics.maxConsecutiveWins, metrics.maxConsecutiveLosses, 1)) * 100} className="h-2" />
                    </div>
                    <div className="pt-4 border-t border-prop-gold/20">
                      <div className="flex justify-between text-sm">
                        <span className="widget-text opacity-70">Win/Loss Ratio</span>
                        <span className="font-medium">
                          {metrics.averageLoss > 0 ? (metrics.averageWin / metrics.averageLoss).toFixed(2) : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
