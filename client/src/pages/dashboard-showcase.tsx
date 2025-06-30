import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EquityChart, MonthlyPerformanceChart } from "@/components/chart-components";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Shield, 
  Calendar,
  PlusCircle,
  BookOpen,
  BarChart3,
  Activity,
  Award,
  AlertTriangle
} from "lucide-react";
import { Account, Trade, JournalEntry } from "@shared/schema";

export default function DashboardShowcase() {
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: trades = [] } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

  const { data: journalEntries = [] } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
  });

  // Calculate portfolio metrics
  const totalPortfolioValue = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  const totalInvested = accounts.reduce((sum, acc) => sum + (acc.accountCost || 0) + (acc.activationCost || 0), 0);
  const totalPnL = accounts.reduce((sum, acc) => sum + (acc.currentBalance - acc.startingBalance), 0);
  const totalPnLPercentage = accounts.length > 0 
    ? (totalPnL / accounts.reduce((sum, acc) => sum + acc.startingBalance, 0)) * 100 
    : 0;

  // Account status counts
  const activeAccounts = accounts.filter(acc => acc.status === 'active').length;
  const fundedAccounts = accounts.filter(acc => acc.status === 'funded').length;
  const challengeAccounts = accounts.filter(acc => acc.type === 'challenge').length;

  // Trading performance metrics
  const winningTrades = trades.filter(trade => trade.pnl > 0).length;
  const totalTrades = trades.length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalTradingPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);

  // Recent trades for showcase
  const recentTrades = trades.slice(0, 5);

  // Mock equity curve data
  const equityData = [
    { date: '2024-09-15', balance: 150000 },
    { date: '2024-09-20', balance: 151200 },
    { date: '2024-09-25', balance: 149800 },
    { date: '2024-09-30', balance: 152100 },
    { date: '2024-10-05', balance: 153400 },
    { date: '2024-10-10', balance: 152800 },
    { date: '2024-10-15', balance: 154600 },
    { date: '2024-10-20', balance: 156200 },
    { date: '2024-10-25', balance: 155100 },
    { date: '2024-10-30', balance: 157800 },
  ];

  const monthlyData = [
    { month: 'Aug', pnl: 2400 },
    { month: 'Sep', pnl: 3100 },
    { month: 'Oct', pnl: 4200 },
  ];

  return (
    <div className="p-6 space-y-8 bg-prop-gradient-main min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-rainbow mb-2">Trading Dashboard</h1>
          <p className="text-gray-400">Complete portfolio overview and performance analytics</p>
        </div>
        <Button className="bg-prop-gradient-gold text-black font-bold hover-scale">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Account
        </Button>
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-prop-card border-prop-gold/20 hover-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Portfolio Value</p>
                <p className="text-2xl font-bold text-prop-gold">
                  ${totalPortfolioValue.toLocaleString()}
                </p>
              </div>
              <div className="bg-prop-gradient-gold p-3 rounded-xl">
                <DollarSign className="h-6 w-6 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-prop-card border-prop-tiffany/20 hover-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total P&L</p>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-prop-green' : 'text-prop-pink'}`}>
                  {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString()}
                </p>
                <p className={`text-sm ${totalPnL >= 0 ? 'text-prop-green' : 'text-prop-pink'}`}>
                  {totalPnL >= 0 ? '+' : ''}{totalPnLPercentage.toFixed(2)}%
                </p>
              </div>
              <div className={`bg-prop-gradient-${totalPnL >= 0 ? 'green' : 'pink'} p-3 rounded-xl`}>
                {totalPnL >= 0 ? 
                  <TrendingUp className="h-6 w-6 text-white" /> : 
                  <TrendingDown className="h-6 w-6 text-white" />
                }
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-prop-card border-prop-blue/20 hover-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Win Rate</p>
                <p className="text-2xl font-bold text-prop-blue">{winRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-400">{winningTrades}/{totalTrades} trades</p>
              </div>
              <div className="bg-prop-gradient-blue p-3 rounded-xl">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-prop-card border-prop-green/20 hover-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Active Accounts</p>
                <p className="text-2xl font-bold text-prop-green">{activeAccounts + fundedAccounts}</p>
                <p className="text-sm text-gray-400">{challengeAccounts} challenges</p>
              </div>
              <div className="bg-prop-gradient-green p-3 rounded-xl">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Portfolio Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-prop-card border-prop-gold/20 hover-glow">
          <CardHeader>
            <CardTitle className="text-gradient-rainbow flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Account Portfolio Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-4 bg-prop-gradient-subtle rounded-xl border border-prop-gold/10">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-white">{account.name}</h3>
                      <Badge 
                        variant={account.status === 'funded' ? 'default' : 'secondary'}
                        className={`
                          ${account.status === 'funded' ? 'bg-prop-green text-white' : ''}
                          ${account.status === 'active' ? 'bg-prop-blue text-white' : ''}
                          ${account.status === 'challenge' ? 'bg-prop-gold text-black' : ''}
                        `}
                      >
                        {account.status === 'funded' ? 'Funded' : account.type === 'challenge' ? 'Challenge' : 'Active'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">{account.firm}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">${account.currentBalance.toLocaleString()}</p>
                    <p className={`text-sm ${
                      account.currentBalance >= account.startingBalance ? 'text-prop-green' : 'text-prop-pink'
                    }`}>
                      {account.currentBalance >= account.startingBalance ? '+' : ''}
                      ${(account.currentBalance - account.startingBalance).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-prop-card border-prop-tiffany/20 hover-glow">
          <CardHeader>
            <CardTitle className="text-gradient-rainbow flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Investment Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-prop-gradient-subtle rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Total Invested</span>
                <span className="font-bold text-prop-gold">${totalInvested.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Portfolio Value</span>
                <span className="font-bold text-white">${totalPortfolioValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Net Profit</span>
                <span className={`font-bold ${totalPnL >= 0 ? 'text-prop-green' : 'text-prop-pink'}`}>
                  ${(totalPortfolioValue - totalInvested).toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">ROI</span>
                <span className="text-sm text-prop-green">
                  +{(((totalPortfolioValue - totalInvested) / totalInvested) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Active Accounts</span>
                <span className="text-sm text-white">{activeAccounts + fundedAccounts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Reset Costs</span>
                <span className="text-sm text-white">$0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-prop-card border-prop-blue/20 hover-glow">
          <CardHeader>
            <CardTitle className="text-gradient-rainbow">Equity Curve</CardTitle>
          </CardHeader>
          <CardContent>
            <EquityChart data={equityData} />
          </CardContent>
        </Card>

        <Card className="bg-prop-card border-prop-green/20 hover-glow">
          <CardHeader>
            <CardTitle className="text-gradient-rainbow">Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyPerformanceChart data={monthlyData} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Journal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-prop-card border-prop-pink/20 hover-glow">
          <CardHeader>
            <CardTitle className="text-gradient-rainbow flex items-center">
              <Award className="mr-2 h-5 w-5" />
              Recent Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 bg-prop-gradient-subtle rounded-lg border border-prop-gold/10">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-prop-gold border-prop-gold">
                        {trade.symbol}
                      </Badge>
                      <span className="text-sm text-gray-400">{trade.date}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {trade.side.toUpperCase()} {trade.quantity} @ {trade.entryPrice}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${trade.pnl >= 0 ? 'text-prop-green' : 'text-prop-pink'}`}>
                      {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-prop-card border-prop-tiffany/20 hover-glow">
          <CardHeader>
            <CardTitle className="text-gradient-rainbow flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Daily Journal Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {journalEntries.slice(0, 3).map((entry) => (
                <div key={entry.id} className="p-3 bg-prop-gradient-subtle rounded-lg border border-prop-gold/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-prop-gold font-medium">{entry.date}</span>
                    <Badge variant="outline" className="text-prop-tiffany border-prop-tiffany">
                      Journal
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2">
                    {entry.whatWentRight || entry.improvementPlan}
                  </p>
                </div>
              ))}
              <Button variant="outline" className="w-full border-prop-tiffany text-prop-tiffany hover:bg-prop-tiffany hover:text-black">
                View Full Journal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disciplined Analysis */}
      <Card className="bg-prop-card border-prop-gold/20 hover-glow">
        <CardHeader>
          <CardTitle className="text-gradient-rainbow flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Disciplined Trading Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-prop-gradient-subtle rounded-xl">
              <div className="text-3xl font-bold text-prop-green mb-2">95%</div>
              <p className="text-gray-400">Discipline Score</p>
              <p className="text-xs text-prop-green mt-1">Excellent</p>
            </div>
            <div className="text-center p-4 bg-prop-gradient-subtle rounded-xl">
              <div className="text-3xl font-bold text-prop-blue mb-2">2</div>
              <p className="text-gray-400">Rule Violations</p>
              <p className="text-xs text-prop-blue mt-1">This Month</p>
            </div>
            <div className="text-center p-4 bg-prop-gradient-subtle rounded-xl">
              <div className="text-3xl font-bold text-prop-tiffany mb-2">15</div>
              <p className="text-gray-400">Streak Days</p>
              <p className="text-xs text-prop-tiffany mt-1">Following Rules</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-prop-gradient-subtle rounded-xl border border-prop-green/20">
            <h4 className="font-semibold text-prop-green mb-2">Recent Achievements</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• Maintained perfect position sizing for 10 consecutive trades</li>
              <li>• No revenge trading incidents in the last 30 days</li>
              <li>• Successfully followed stop-loss rules on all losing trades</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}