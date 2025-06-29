import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { EquityChart, MonthlyPerformanceChart } from "@/components/chart-components";
import { formatCurrency, formatPercentage, formatDate } from "@/lib/utils";
import { 
  Wallet, 
  TrendingDown, 
  Target, 
  Shield, 
  Plus, 
  Bell,
  AlertTriangle,
  DollarSign,
  Crosshair
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
  const { data: accounts, isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: trades, isLoading: tradesLoading } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<DashboardAnalytics>({
    queryKey: ["/api/analytics/dashboard/1"],
    enabled: !!accounts?.length,
  });

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

  if (accountsLoading || tradesLoading || analyticsLoading) {
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
      {/* Header */}
      <header className="bg-dark-surface border-b border-dark-border px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Trading Dashboard</h2>
            <p className="text-gray-400 text-sm mt-1">Monitor your prop firm challenges and funded accounts</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button className="bg-primary hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              New Trade
            </Button>
            <div className="relative">
              <Bell className="h-5 w-5 text-gray-400" />
              <span className="absolute -top-1 -right-1 bg-error-red text-xs rounded-full w-4 h-4 flex items-center justify-center text-white">
                3
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-dark-card border-dark-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Balance</p>
                  <p className="text-2xl font-bold text-success-green">
                    {formatCurrency(analytics?.currentBalance || 0)}
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
                    {formatCurrency(analytics?.worstTrade || 0)}
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
                  <p className="text-2xl font-bold">{analytics?.winRate.toFixed(0) || 0}%</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {analytics?.winningTrades || 0} wins, {analytics?.losingTrades || 0} losses
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
                    {formatCurrency(analytics?.dailyLossLimit || 0)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Max daily loss</p>
                </div>
                <div className="bg-warning-orange bg-opacity-20 p-3 rounded-lg">
                  <Shield className="text-warning-orange h-6 w-6" />
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
                  <span className="text-warning-orange">{analytics?.riskLimitUsed.toFixed(1) || 0}%</span>
                </div>
                <Progress 
                  value={analytics?.riskLimitUsed || 0} 
                  className="w-full h-2 bg-dark-border"
                />
                <p className="text-xs text-gray-400 mt-2">
                  {formatCurrency(Math.abs(analytics?.worstTrade || 0))} of {formatCurrency(analytics?.dailyLossLimit || 0)} daily limit used
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
                      {formatPercentage((analytics?.totalPnl || 0) / (analytics?.profitTarget || 1) * 100)}
                    </span>
                  </div>
                  <Progress 
                    value={Math.max(0, ((analytics?.totalPnl || 0) / (analytics?.profitTarget || 1)) * 100)} 
                    className="w-full h-2 bg-dark-border"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Need {formatCurrency((analytics?.profitTarget || 0) - (analytics?.totalPnl || 0))} to reach 10% target
                  </p>
                </div>
                <Button className="w-full bg-primary hover:bg-blue-700">
                  View Challenge Details
                </Button>
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
              <Button variant="ghost" className="text-primary hover:text-blue-400">
                View Full Journal
              </Button>
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
      </div>
    </>
  );
}
