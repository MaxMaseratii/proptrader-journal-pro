import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { getUniversalValueColor, getPercentageColor, getStatusColor } from "@/lib/colorUtils";
import { AlertTriangle, Shield, TrendingDown, Target, Activity } from "lucide-react";
import { useState } from "react";
import type { Account, Trade } from "@shared/schema";

export default function RiskManagement() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: trades } = useQuery<Trade[]>({
    queryKey: ["/api/trades", selectedAccountId],
    enabled: !!selectedAccountId,
  });

  const selectedAccount = accounts?.find(acc => acc.id.toString() === selectedAccountId);

  const calculateRiskMetrics = () => {
    if (!selectedAccount || !trades) return null;

    const todayTrades = trades.filter(trade => {
      const today = new Date().toISOString().split('T')[0];
      return trade.date === today;
    });

    const todayPnL = todayTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const dailyLossUsed = Math.abs(Math.min(0, todayPnL));
    const dailyLossPercentage = (dailyLossUsed / selectedAccount.dailyLossLimit) * 100;

    const totalDrawdown = selectedAccount.startingBalance - selectedAccount.currentBalance;
    const drawdownPercentage = (totalDrawdown / selectedAccount.startingBalance) * 100;
    const maxDrawdownPercentage = (totalDrawdown / selectedAccount.maxDrawdown) * 100;

    const allPnLs = trades.map(trade => trade.pnl);
    const worstTrade = Math.min(...allPnLs, 0);
    const bestTrade = Math.max(...allPnLs, 0);

    const consecutiveLosses = calculateConsecutiveLosses(trades);
    const winRate = calculateWinRate(trades);

    return {
      dailyLossUsed,
      dailyLossPercentage,
      totalDrawdown,
      drawdownPercentage,
      maxDrawdownPercentage,
      worstTrade,
      bestTrade,
      consecutiveLosses,
      winRate,
      todayTrades: todayTrades.length,
    };
  };

  const calculateConsecutiveLosses = (trades: Trade[]) => {
    let maxConsecutive = 0;
    let currentConsecutive = 0;

    const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const trade of sortedTrades) {
      if (trade.pnl < 0) {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 0;
      }
    }

    return maxConsecutive;
  };

  const calculateWinRate = (trades: Trade[]) => {
    if (trades.length === 0) return 0;
    const wins = trades.filter(trade => trade.pnl > 0).length;
    return (wins / trades.length) * 100;
  };

  const getRiskLevel = (percentage: number) => {
    if (percentage >= 90) return { level: "Critical", color: "text-red-500", bgColor: "bg-red-500" };
    if (percentage >= 70) return { level: "High", color: "text-orange-400", bgColor: "bg-orange-500" };
    if (percentage >= 50) return { level: "Medium", color: "text-yellow-400", bgColor: "bg-yellow-500" };
    return { level: "Low", color: "text-green-500", bgColor: "bg-green-500" };
  };

  const metrics = calculateRiskMetrics();

  return (
    <>
      <header className="bg-dark-surface border-b border-dark-border px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gradient-rainbow">Risk Management</h2>
            <p className="text-gray-400 text-sm mt-1">Monitor and manage your trading risk exposure</p>
          </div>
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
      </header>

      <div className="p-6">
        {!selectedAccount ? (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">Select an account to view risk metrics</h3>
            <p className="text-gray-400">Choose an account from the dropdown to analyze risk exposure</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Risk Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-dark-card border-dark-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Daily Loss Used</p>
                      <p className="text-2xl font-bold text-warning-orange">
                        {formatPercentage(metrics?.dailyLossPercentage || 0)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatCurrency(metrics?.dailyLossUsed || 0)} of {formatCurrency(selectedAccount.dailyLossLimit)}
                      </p>
                    </div>
                    <div className="bg-warning-orange bg-opacity-20 p-3 rounded-lg">
                      <AlertTriangle className="text-warning-orange h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-card border-dark-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Max Drawdown Used</p>
                      <p className="text-2xl font-bold text-error-red">
                        {formatPercentage(metrics?.maxDrawdownPercentage || 0)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatCurrency(metrics?.totalDrawdown || 0)} of {formatCurrency(selectedAccount.maxDrawdown)}
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
                      <p className="text-2xl font-bold text-success-green">
                        {(metrics?.winRate || 0).toFixed(0)}%
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Current trading performance
                      </p>
                    </div>
                    <div className="bg-success-green bg-opacity-20 p-3 rounded-lg">
                      <Target className="text-success-green h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-card border-dark-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Today's Trades</p>
                      <p className="text-2xl font-bold">{metrics?.todayTrades || 0}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Trading activity today
                      </p>
                    </div>
                    <div className="bg-primary bg-opacity-20 p-3 rounded-lg">
                      <Activity className="text-primary h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk Gauges */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-dark-card border-dark-border">
                <CardHeader>
                  <CardTitle>Daily Loss Limit</CardTitle>
                  <p className="text-gray-400 text-sm">Monitor your daily risk exposure</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Daily Loss Used</span>
                      <span className={getRiskLevel(metrics?.dailyLossPercentage || 0).color}>
                        {formatPercentage(metrics?.dailyLossPercentage || 0)}
                      </span>
                    </div>
                    <Progress 
                      value={metrics?.dailyLossPercentage || 0} 
                      className="w-full h-3"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{formatCurrency(metrics?.dailyLossUsed || 0)}</span>
                      <span>{formatCurrency(selectedAccount.dailyLossLimit)}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-dark-border">
                    <Badge className={`${getRiskLevel(metrics?.dailyLossPercentage || 0).bgColor} text-white`}>
                      {getRiskLevel(metrics?.dailyLossPercentage || 0).level} Risk
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-card border-dark-border">
                <CardHeader>
                  <CardTitle>Maximum Drawdown</CardTitle>
                  <p className="text-gray-400 text-sm">Track your account drawdown levels</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Drawdown Used</span>
                      <span className={getRiskLevel(metrics?.maxDrawdownPercentage || 0).color}>
                        {formatPercentage(metrics?.maxDrawdownPercentage || 0)}
                      </span>
                    </div>
                    <Progress 
                      value={metrics?.maxDrawdownPercentage || 0} 
                      className="w-full h-3"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{formatCurrency(metrics?.totalDrawdown || 0)}</span>
                      <span>{formatCurrency(selectedAccount.maxDrawdown)}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-dark-border">
                    <Badge className={`${getRiskLevel(metrics?.maxDrawdownPercentage || 0).bgColor} text-white`}>
                      {getRiskLevel(metrics?.maxDrawdownPercentage || 0).level} Risk
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk Details */}
            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <CardTitle>Risk Analysis</CardTitle>
                <p className="text-gray-400 text-sm">Detailed risk metrics and trading statistics</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-300">Worst Trade</p>
                    <p className="text-lg font-bold text-error-red">{formatCurrency(metrics?.worstTrade || 0)}</p>
                    <p className="text-xs text-gray-400">Largest single loss</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-300">Best Trade</p>
                    <p className="text-lg font-bold text-success-green">{formatCurrency(metrics?.bestTrade || 0)}</p>
                    <p className="text-xs text-gray-400">Largest single win</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-300">Max Consecutive Losses</p>
                    <p className="text-lg font-bold text-warning-orange">{metrics?.consecutiveLosses || 0}</p>
                    <p className="text-xs text-gray-400">Longest losing streak</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-300">Account Drawdown</p>
                    <p className="text-lg font-bold text-error-red">
                      {formatPercentage(metrics?.drawdownPercentage || 0)}
                    </p>
                    <p className="text-xs text-gray-400">From starting balance</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Alerts */}
            {(metrics?.dailyLossPercentage || 0) > 75 && (
              <Card className="bg-dark-card border-error-red">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="text-error-red h-8 w-8 mr-4" />
                    <div>
                      <h3 className="text-lg font-semibold text-error-red">High Risk Alert</h3>
                      <p className="text-gray-300">
                        You've used {formatPercentage(metrics?.dailyLossPercentage || 0)} of your daily loss limit. 
                        Consider stopping trading for today to preserve capital.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {(metrics?.maxDrawdownPercentage || 0) > 80 && (
              <Card className="bg-dark-card border-error-red">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingDown className="text-error-red h-8 w-8 mr-4" />
                    <div>
                      <h3 className="text-lg font-semibold text-error-red">Drawdown Warning</h3>
                      <p className="text-gray-300">
                        You've reached {formatPercentage(metrics?.maxDrawdownPercentage || 0)} of your maximum drawdown limit. 
                        Your account is at risk of being closed.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </>
  );
}
