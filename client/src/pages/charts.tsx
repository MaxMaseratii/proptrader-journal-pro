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
            <h1 className="text-3xl font-bold text-gradient-rainbow">
              Trading Charts
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-600 bg-clip-text">
            Trading Charts
          </h1>
          <p className="text-gray-400 mt-2">Visual analysis of your {trades.length} trades across {uniqueSymbols.length} symbols</p>
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

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-gray-800/50 border border-gray-600/30">
          <TabsTrigger value="overview" className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400">
            Market Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400">
            Performance by Symbol
          </TabsTrigger>
          <TabsTrigger value="grid" className="data-[state=active]:bg-amber-600/20 data-[state=active]:text-amber-400">
            Chart Grid
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {symbolStats.slice(0, 4).map((stat) => (
              <Card key={stat.symbol} className="bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-gray-800/40 border border-gray-600/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-amber-400 flex items-center justify-between">
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
                      <span className={`font-semibold ${stat.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                        {stat.winRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">W/L:</span>
                      <span className="text-gray-300">{stat.winningTrades}/{stat.losingTrades}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {symbolStats.map((stat) => (
              <div key={stat.symbol} className="bg-gradient-to-br from-gray-800/40 via-gray-900/40 to-gray-800/40 border border-gray-600/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-xl font-bold text-amber-400">{stat.symbol}</div>
                    <Badge variant={stat.pnl >= 0 ? "default" : "destructive"}>
                      {stat.pnl >= 0 ? '+' : ''}${stat.pnl.toFixed(2)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <div className="text-white font-semibold">{stat.trades}</div>
                      <div className="text-gray-400">Trades</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-semibold ${stat.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                        {stat.winRate.toFixed(1)}%
                      </div>
                      <div className="text-gray-400">Win Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-400 font-semibold">{stat.winningTrades}</div>
                      <div className="text-gray-400">Wins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-400 font-semibold">{stat.losingTrades}</div>
                      <div className="text-gray-400">Losses</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="grid" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-amber-400 flex items-center">
              <Grid3X3 className="mr-2 h-5 w-5" />
              Multi-Symbol Chart Grid
            </h2>
            <Badge variant="outline" className="text-amber-400">
              Showing top {Math.min(uniqueSymbols.length, 4)} symbols
            </Badge>
          </div>

          <ChartGrid
            trades={trades}
            symbols={uniqueSymbols.slice(0, 4)}
          />

          {uniqueSymbols.length > 4 && (
            <div className="text-center pt-4">
              <Badge variant="outline" className="text-gray-400">
                +{uniqueSymbols.length - 4} more symbols available
              </Badge>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}