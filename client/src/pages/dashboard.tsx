import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Wallet, TrendingUp, TrendingDown, Target, Calendar, BarChart3, Users, Clock } from "lucide-react";
import { format } from "date-fns";
import type { Account, Trade } from "@shared/schema";

export default function Dashboard() {
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: trades = [] } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

  // Calculate metrics
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const winningTrades = trades.filter(trade => trade.pnl > 0).length;
  const totalTrades = trades.length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const recentTrades = trades.slice(-5);
  const activeAccounts = accounts.filter(acc => acc.status === 'active' || acc.status === 'live');

  // Calculate disciplined trading score
  const tradesWithStopLoss = trades.filter(trade => trade.initialStopLoss && trade.initialStopLoss > 0).length;
  const disciplinedScore = totalTrades > 0 ? (tradesWithStopLoss / totalTrades) * 100 : 0;

  // Monthly performance calculation
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyTrades = trades.filter(trade => {
    const tradeDate = new Date(trade.date);
    return tradeDate.getMonth() === currentMonth && tradeDate.getFullYear() === currentYear;
  });
  const monthlyPnL = monthlyTrades.reduce((sum, trade) => sum + trade.pnl, 0);

  const formatCurrency = (amount: number) => {
    if (amount === 0) return <span className="text-prop-gold">$0.00</span>;
    if (amount > 0) return <span className="text-green-400">+${amount.toFixed(2)}</span>;
    return <span className="text-pink-400">-${Math.abs(amount).toFixed(2)}</span>;
  };

  const formatNumber = (num: number) => {
    if (num === 0) return <span className="text-prop-gold">0</span>;
    return <span className="text-white">{num}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gradient-rainbow">Trading Dashboard</h1>
          <p className="text-gray-400 mt-1">Your complete trading performance overview</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Last updated</p>
          <p className="text-prop-gold font-medium">{format(new Date(), 'MMM dd, yyyy HH:mm')}</p>
        </div>
      </div>

      {/* Current Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-prop-card border-prop-gold/20 hover-glow smooth-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Balance</p>
                <p className="text-2xl font-bold text-prop-gold">${totalBalance.toFixed(2)}</p>
              </div>
              <div className="bg-prop-gradient-gold p-3 rounded-xl">
                <Wallet className="h-6 w-6 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-prop-card border-prop-gold/20 hover-glow smooth-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total P&L</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPnL)}</p>
              </div>
              <div className={`p-3 rounded-xl ${totalPnL >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {totalPnL >= 0 ? 
                  <TrendingUp className="h-6 w-6 text-green-400" /> : 
                  <TrendingDown className="h-6 w-6 text-red-400" />
                }
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-prop-card border-prop-gold/20 hover-glow smooth-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Win Rate</p>
                <p className="text-2xl font-bold text-prop-tiffany">{winRate.toFixed(1)}%</p>
                <Progress value={winRate} className="mt-2 h-2" />
              </div>
              <div className="bg-prop-gradient-tiffany p-3 rounded-xl">
                <Target className="h-6 w-6 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-prop-card border-prop-gold/20 hover-glow smooth-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Trades</p>
                <p className="text-2xl font-bold text-white">{formatNumber(totalTrades)}</p>
              </div>
              <div className="bg-prop-gradient-blue p-3 rounded-xl">
                <BarChart3 className="h-6 w-6 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Performance - Under Win Rate */}
        <Card className="bg-prop-card border-prop-gold/20 hover-glow smooth-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Account Performance</p>
                <p className="text-2xl font-bold text-green-400">
                  {accounts.length > 0 ? `${((totalBalance / accounts.reduce((sum, acc) => sum + acc.startingBalance, 0)) * 100 - 100).toFixed(1)}%` : '0%'}
                </p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Performance - Under Win Rate */}
        <Card className="bg-prop-card border-prop-gold/20 hover-glow smooth-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Monthly P&L</p>
                <p className="text-2xl font-bold">{formatCurrency(monthlyPnL)}</p>
              </div>
              <div className="bg-prop-gradient-rainbow p-3 rounded-xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disciplined Trading Analysis */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-prop-gold flex items-center gap-2">
          <Target className="h-5 w-5" />
          Disciplined Trading Analysis
        </h2>
        
        {/* Active Accounts and Recent Trades - First row under header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Accounts */}
          <Card className="bg-prop-card border-prop-gold/20">
            <CardHeader>
              <CardTitle className="text-prop-gold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Active Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeAccounts.slice(0, 3).map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{account.name}</p>
                      <p className="text-sm text-gray-400">{account.firm} • {account.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-prop-gold">${account.currentBalance.toFixed(2)}</p>
                      <Badge variant={account.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {account.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {activeAccounts.length === 0 && (
                  <p className="text-gray-400 text-center py-4">No active accounts</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Trades */}
          <Card className="bg-prop-card border-prop-gold/20">
            <CardHeader>
              <CardTitle className="text-prop-gold flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Trades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTrades.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{trade.symbol}</p>
                      <p className="text-sm text-gray-400">{format(new Date(trade.date), 'MMM dd, yyyy')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(trade.pnl)}</p>
                      <Badge variant={trade.pnl >= 0 ? 'default' : 'destructive'} className="text-xs">
                        {trade.side}
                      </Badge>
                    </div>
                  </div>
                ))}
                {recentTrades.length === 0 && (
                  <p className="text-gray-400 text-center py-4">No recent trades</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disciplined Score */}
        <Card className="bg-prop-card border-prop-gold/20">
          <CardHeader>
            <CardTitle className="text-prop-gold">Disciplined Trading Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Stop Loss Discipline</span>
                <span className="text-2xl font-bold text-prop-tiffany">{disciplinedScore.toFixed(1)}%</span>
              </div>
              <Progress value={disciplinedScore} className="h-3" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Trades with Stop Loss</p>
                  <p className="text-white font-medium">{formatNumber(tradesWithStopLoss)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Total Trades</p>
                  <p className="text-white font-medium">{formatNumber(totalTrades)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}