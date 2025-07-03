import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { EquityChart, MonthlyPerformanceChart } from "@/components/chart-components";
import WeeklyPerformanceCalendar from "@/components/weekly-performance-calendar";
import { useLocation } from "wouter";
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
  AlertTriangle,
  Upload,
  Filter,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Account, Trade, JournalEntry } from "@shared/schema";

export default function DashboardBackup() {
  const [, setLocation] = useLocation();
  
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: trades = [] } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

  const { data: journalEntries = [] } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
  });

  // Calculate key metrics
  const totalBalance = accounts.reduce((sum, account) => sum + account.currentBalance, 0);
  const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gradient-rainbow mb-2">Trading Dashboard - Copy</h1>
          <p className="text-gray-400">Complete portfolio overview and performance analytics</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            className="border-prop-tiffany/20 hover:bg-prop-tiffany/10"
            onClick={() => setLocation('/csv-import')}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Button 
            className="bg-prop-gradient-gold text-black font-bold hover-scale"
            onClick={() => setLocation('/accounts')}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Account
          </Button>
        </div>
      </div>

      {/* Account Selection and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-prop-card border-prop-gold/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-prop-gold" />
              <Select defaultValue="all">
                <SelectTrigger className="border-prop-gold/20">
                  <SelectValue placeholder="All Accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-prop-card border-prop-blue/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-prop-blue" />
              <Select defaultValue="30">
                <SelectTrigger className="border-prop-blue/20">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-prop-card border-prop-tiffany/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-prop-tiffany" />
              <Select defaultValue="overview">
                <SelectTrigger className="border-prop-tiffany/20">
                  <SelectValue placeholder="View Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="analysis">Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-prop-card border-prop-gold/20 hover-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-gradient-rainbow flex items-center justify-between">
              <span>Net Balance</span>
              <DollarSign className="h-5 w-5 text-prop-gold" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-prop-gold mb-2">
              ${totalBalance.toLocaleString()}
            </div>
            <div className="flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-prop-green mr-1" />
              <span className="text-prop-green">+12.5%</span>
              <span className="text-gray-400 ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-prop-card border-prop-green/20 hover-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-gradient-rainbow flex items-center justify-between">
              <span>Total P&L</span>
              <TrendingUp className="h-5 w-5 text-prop-green" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-prop-green mb-2">
              +${totalTradingPnL.toLocaleString()}
            </div>
            <div className="flex items-center text-sm">
              <Activity className="h-4 w-4 text-prop-green mr-1" />
              <span className="text-prop-green">+8.2%</span>
              <span className="text-gray-400 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-prop-card border-prop-blue/20 hover-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-gradient-rainbow flex items-center justify-between">
              <span>Win Rate</span>
              <Target className="h-5 w-5 text-prop-blue" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-prop-blue mb-2">
              {winRate.toFixed(1)}%
            </div>
            <div className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-prop-blue mr-1" />
              <span className="text-prop-blue">{winningTrades}</span>
              <span className="text-gray-400 ml-1">of {totalTrades} trades</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-prop-card border-prop-tiffany/20 hover-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-gradient-rainbow flex items-center justify-between">
              <span>Risk Level</span>
              <Shield className="h-5 w-5 text-prop-tiffany" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-prop-tiffany mb-2">
              Low
            </div>
            <div className="flex items-center text-sm">
              <Shield className="h-4 w-4 text-prop-tiffany mr-1" />
              <span className="text-prop-tiffany">2.1%</span>
              <span className="text-gray-400 ml-1">daily risk</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-prop-card border-prop-gold/20 hover-glow">
          <CardHeader>
            <CardTitle className="text-gradient-rainbow flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Equity Curve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <EquityChart data={equityData} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-prop-card border-prop-blue/20 hover-glow">
          <CardHeader>
            <CardTitle className="text-gradient-rainbow flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Monthly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <MonthlyPerformanceChart data={monthlyData} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-prop-card border-prop-green/20 hover-glow">
          <CardHeader>
            <CardTitle className="text-gradient-rainbow flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Recent Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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

      {/* Challenge Progress Tracking - Critical Missing Feature */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-prop-card border-prop-blue/20 hover-glow">
          <CardHeader>
            <CardTitle className="text-gradient-rainbow flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Challenge Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Profit Target</span>
                  <span className="text-sm text-prop-green">78%</span>
                </div>
                <Progress value={78} className="h-2" />
                <p className="text-xs text-gray-400 mt-1">$7,800 / $10,000</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Max Drawdown</span>
                  <span className="text-sm text-prop-pink">42%</span>
                </div>
                <Progress value={42} className="h-2" />
                <p className="text-xs text-gray-400 mt-1">$2,100 / $5,000</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Trading Days</span>
                  <span className="text-sm text-prop-gold">12 / 30</span>
                </div>
                <Progress value={40} className="h-2" />
                <p className="text-xs text-gray-400 mt-1">18 days remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-prop-card border-prop-green/20 hover-glow">
          <CardHeader>
            <CardTitle className="text-gradient-rainbow flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Payout Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Next Payout</span>
                <span className="text-prop-green font-bold">$2,450</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Payout Date</span>
                <span className="text-white">Nov 15, 2024</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Split Rate</span>
                <span className="text-prop-gold">80%</span>
              </div>

              <div className="border-t border-gray-600 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Payouts</span>
                  <span className="text-prop-green font-bold">$8,750</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">3 payouts this year</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-prop-card border-prop-pink/20 hover-glow">
          <CardHeader>
            <CardTitle className="text-gradient-rainbow flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Trade Analysis View
              </div>
              <div className="flex gap-2">
                <Select defaultValue="monthly">
                  <SelectTrigger className="w-32 bg-prop-dark border-prop-pink/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="2024">
                  <SelectTrigger className="w-20 bg-prop-dark border-prop-pink/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="october" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-prop-dark">
                <TabsTrigger value="august">Aug</TabsTrigger>
                <TabsTrigger value="september">Sep</TabsTrigger>
                <TabsTrigger value="october">Oct</TabsTrigger>
              </TabsList>
              
              <TabsContent value="october" className="space-y-3 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Trades</span>
                  <span className="text-white">47</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Win Rate</span>
                  <span className="text-prop-green">64%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Monthly P&L</span>
                  <span className="text-prop-green">+$4,200</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Best Day</span>
                  <span className="text-prop-green">+$890</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Worst Day</span>
                  <span className="text-prop-pink">-$425</span>
                </div>
              </TabsContent>

              <TabsContent value="september" className="space-y-3 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Trades</span>
                  <span className="text-white">38</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Win Rate</span>
                  <span className="text-prop-green">71%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Monthly P&L</span>
                  <span className="text-prop-green">+$3,100</span>
                </div>
              </TabsContent>

              <TabsContent value="august" className="space-y-3 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Trades</span>
                  <span className="text-white">29</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Win Rate</span>
                  <span className="text-prop-green">69%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Monthly P&L</span>
                  <span className="text-prop-green">+$2,400</span>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Performance Calendar */}
      <Card className="bg-prop-card border-prop-gold/20 hover-glow">
        <CardHeader>
          <CardTitle className="text-gradient-rainbow flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Weekly Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WeeklyPerformanceCalendar trades={trades} />
        </CardContent>
      </Card>

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