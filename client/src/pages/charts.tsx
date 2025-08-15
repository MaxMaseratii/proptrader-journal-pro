import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SimpleChart } from "@/components/tradingview/SimpleChart";
import { ChartGrid } from "@/components/tradingview/ChartGrid";
import { EquityChart, MonthlyPerformanceChart } from "@/components/chart-components";
import type { Account, Trade } from "@shared/schema";
import { BarChart3, TrendingUp, Grid3X3, Activity, PieChart, LineChart, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { format } from "date-fns";

export default function Charts() {
  const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>([]);

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: allTrades = [] } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

  // Handle account selection
  const handleAccountSelection = (value: string) => {
    if (value === "all") {
      setSelectedAccountIds([]);
    } else {
      setSelectedAccountIds([parseInt(value)]);
    }
  };

  // Filter trades based on selected account
  const trades = selectedAccountIds.length > 0 
    ? allTrades.filter(trade => selectedAccountIds.includes(trade.accountId))
    : allTrades;

  // Get unique symbols from trades
  const uniqueSymbols = Array.from(new Set(trades.map(trade => trade.symbol).filter(Boolean)));
  
  // Calculate symbol statistics
  const symbolStats = uniqueSymbols.map(symbol => {
    const symbolTrades = trades.filter(t => t.symbol === symbol);
    const totalPnl = symbolTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const winningTrades = symbolTrades.filter(t => (t.pnl || 0) > 0).length;
    const winRate = symbolTrades.length > 0 ? (winningTrades / symbolTrades.length * 100) : 0;
    
    return {
      symbol,
      trades: symbolTrades.length,
      pnl: totalPnl,
      winRate,
      winningTrades,
      losingTrades: symbolTrades.length - winningTrades
    };
  }).sort((a, b) => b.trades - a.trades);

  if (trades.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-rainbow">
              Charts & Analytics
            </h1>
            <p className="text-gray-400 mt-2">Visual analysis of your trading performance</p>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <BarChart3 className="mx-auto h-16 w-16 text-gray-500 mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">No Trading Data</h3>
            <p className="text-gray-500 mb-4">Import your trades to see interactive price charts</p>
            <Badge variant="outline" className="text-gray-400">
              Charts will show entry/exit points, P&L markers, and trend analysis
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  // Calculate performance data for analytics
  const equityData = trades
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((acc, trade, index) => {
      const previousBalance = index === 0 ? (accounts?.[0]?.startingBalance || 0) : acc[index - 1].balance;
      const newBalance = previousBalance + (trade.pnl || 0);
      acc.push({
        date: format(new Date(trade.date), 'MMM dd'),
        balance: newBalance
      });
      return acc;
    }, [] as Array<{ date: string; balance: number }>);

  // Monthly performance data
  const monthlyData = trades.reduce((acc, trade) => {
    const month = format(new Date(trade.date), 'MMM yyyy');
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month] += trade.pnl || 0;
    return acc;
  }, {} as Record<string, number>);

  const monthlyPerformanceData = Object.entries(monthlyData).map(([month, pnl]) => ({
    month,
    pnl
  }));

  return (
    <div className="min-h-screen bg-dark-bg text-white p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-rainbow">
              Charts & Analytics
            </h1>
            <p className="text-gray-400 mt-2">Comprehensive visual analysis of your {trades.length} trades across {uniqueSymbols.length} symbols</p>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <Label className="text-white text-sm">Filter by Account</Label>
              <Select value={selectedAccountIds.length === 1 ? selectedAccountIds[0].toString() : "all"} onValueChange={handleAccountSelection}>
                <SelectTrigger className="bg-gray-800 border-yellow-400/20 text-white hover:border-yellow-400/40 min-w-[200px]">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-yellow-400/20">
                  <SelectItem value="all">All Accounts</SelectItem>
                  {accounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name} - {account.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="symbols" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Symbol Analysis
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Trading Charts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Performance Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total Trades</CardTitle>
                  <BarChart3 className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{trades.length}</div>
                  <p className="text-xs text-gray-400">Across {uniqueSymbols.length} symbols</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total P&L</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">
                    ${trades.reduce((sum, t) => sum + (t.pnl || 0), 0).toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-400">Net profit/loss</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Win Rate</CardTitle>
                  <Activity className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">
                    {(trades.filter(t => (t.pnl || 0) > 0).length / trades.length * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-400">Winning trades percentage</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Avg Trade</CardTitle>
                  <Calendar className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">
                    ${(trades.reduce((sum, t) => sum + (t.pnl || 0), 0) / trades.length).toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-400">Average per trade</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <LineChart className="h-5 w-5 text-yellow-400" />
                    Equity Curve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <EquityChart data={equityData} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <BarChart3 className="h-5 w-5 text-yellow-400" />
                    Monthly Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <MonthlyPerformanceChart data={monthlyPerformanceData} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="symbols" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {symbolStats.map((stat) => (
                <Card key={stat.symbol} className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-yellow-400 flex items-center justify-between">
                      {stat.symbol}
                      <Badge variant={stat.pnl >= 0 ? "default" : "destructive"}>
                        {stat.pnl >= 0 ? '+' : ''}${stat.pnl.toFixed(2)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Trades:</span>
                        <span className="text-white font-semibold">{stat.trades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Win Rate:</span>
                        <span className={`font-semibold ${stat.winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                          {stat.winRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">W/L Ratio:</span>
                        <span className="text-white font-semibold">{stat.winningTrades}/{stat.losingTrades}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trading" className="space-y-6">
            <ChartGrid trades={trades} accounts={accounts} symbols={uniqueSymbols} gridSize={2} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}