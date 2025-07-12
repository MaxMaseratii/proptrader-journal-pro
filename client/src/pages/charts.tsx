import { useQuery } from "@tanstack/react-query";
import { SimpleChart } from "@/components/tradingview/SimpleChart";
import { ChartGrid } from "@/components/tradingview/ChartGrid";
import type { Account, Trade } from "@shared/schema";
import { BarChart3, TrendingUp, Grid3X3, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function Charts() {
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: trades = [] } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

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
            <h1 className="text-2xl font-bold text-white mb-2">Trading Charts</h1>
            <p className="text-gray-400">Visual analysis of your trading performance</p>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Trading Charts</h1>
          <p className="text-gray-400">Visual analysis of your {trades.length} trades across {uniqueSymbols.length} symbols</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="flex items-center">
            <Activity className="h-3 w-3 mr-1" />
            {uniqueSymbols.length} Symbols
          </Badge>
          <Badge variant="secondary" className="flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            {trades.length} Trades
          </Badge>
        </div>
      </div>

      {/* Trading Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Top Performing Symbol</CardTitle>
          </CardHeader>
          <CardContent>
            {symbolStats.length > 0 && (
              <div>
                <div className="text-2xl font-bold text-white mb-1">
                  {symbolStats.sort((a, b) => b.pnl - a.pnl)[0]?.symbol}
                </div>
                <div className={`text-sm ${symbolStats[0]?.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${symbolStats.sort((a, b) => b.pnl - a.pnl)[0]?.pnl.toFixed(0)} P&L
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Most Traded Symbol</CardTitle>
          </CardHeader>
          <CardContent>
            {symbolStats.length > 0 && (
              <div>
                <div className="text-2xl font-bold text-white mb-1">
                  {symbolStats[0]?.symbol}
                </div>
                <div className="text-sm text-gray-400">
                  {symbolStats[0]?.trades} trades
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Best Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {symbolStats.length > 0 && (
              <div>
                <div className="text-2xl font-bold text-white mb-1">
                  {symbolStats.sort((a, b) => b.winRate - a.winRate)[0]?.symbol}
                </div>
                <div className="text-sm text-green-400">
                  {symbolStats.sort((a, b) => b.winRate - a.winRate)[0]?.winRate.toFixed(1)}% win rate
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chart Tabs */}
      <Tabs defaultValue="grid" className="space-y-6">
        <TabsList className="bg-gray-900 border border-gray-700">
          <TabsTrigger value="grid" className="flex items-center">
            <Grid3X3 className="h-4 w-4 mr-2" />
            Multi-Symbol Grid
          </TabsTrigger>
          <TabsTrigger value="individual" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Individual Charts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-6">
          <ChartGrid 
            trades={trades} 
            accounts={accounts}
            symbols={uniqueSymbols.slice(0, 8)} 
            gridSize={uniqueSymbols.length >= 4 ? 4 : 2}
          />
        </TabsContent>

        <TabsContent value="individual" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {uniqueSymbols.slice(0, 6).map(symbol => {
              const symbolTrades = trades.filter(t => t.symbol === symbol);
              return (
                <SimpleChart
                  key={symbol}
                  trades={symbolTrades}
                  symbol={symbol}
                  height={400}
                />
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Symbol Performance Table */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Symbol Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Symbol</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Trades</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">P&L</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Win Rate</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">W/L</th>
                </tr>
              </thead>
              <tbody>
                {symbolStats.map(stat => (
                  <tr key={stat.symbol} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-white">{stat.symbol}</span>
                    </td>
                    <td className="text-right py-3 px-4 text-gray-300">{stat.trades}</td>
                    <td className={`text-right py-3 px-4 font-medium ${stat.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${stat.pnl.toFixed(0)}
                    </td>
                    <td className={`text-right py-3 px-4 font-medium ${stat.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.winRate.toFixed(1)}%
                    </td>
                    <td className="text-right py-3 px-4 text-gray-300">
                      <span className="text-green-400">{stat.winningTrades}</span>
                      <span className="text-gray-500 mx-1">/</span>
                      <span className="text-red-400">{stat.losingTrades}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}