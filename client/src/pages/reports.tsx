import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate, formatPercentage } from "@/lib/utils";
import ReportGenerator from "@/components/report-generator";
import { EquityChart, MonthlyPerformanceChart } from "@/components/chart-components";
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon, 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  Filter,
  Brain,
  PieChart,
  Users,
  DollarSign,
  Settings
} from "lucide-react";
import type { Account, Trade, JournalEntry } from "@shared/schema";

export default function Reports() {
  const [selectedTab, setSelectedTab] = useState<string>("generator");

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: trades } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

  const { data: journalEntries } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
  });

  // Quick stats for overview
  const quickStats = useMemo(() => {
    if (!trades || !accounts) return null;

    const totalTrades = trades.length;
    const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
    const winningTrades = trades.filter(trade => trade.pnl > 0);
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    
    // Group by month
    const monthlyData = new Map<string, number>();
    trades.forEach(trade => {
      const month = trade.date.substring(0, 7); // YYYY-MM
      monthlyData.set(month, (monthlyData.get(month) || 0) + trade.pnl);
    });

    const monthlyPnL = Array.from(monthlyData.entries()).map(([month, pnl]) => ({
      month,
      pnl
    })).sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalTrades,
      totalPnL,
      winRate,
      accountsTracked: accounts.length,
      journalEntries: journalEntries?.length || 0,
      monthlyPnL
    };
  }, [trades, accounts, journalEntries]);

  const exportQuickReport = () => {
    if (!quickStats || !accounts) return;

    const reportData = {
      title: "Quick Trading Report",
      generatedAt: new Date().toISOString(),
      summary: quickStats,
      accounts: accounts.map(acc => ({
        name: acc.name,
        type: acc.type,
        firm: acc.firm,
        balance: acc.currentBalance,
        status: acc.status
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quick-report-${new Date().toISOString().split('T')[0]}.json`;
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
            <h1 className="text-3xl font-bold text-gradient-rainbow">Reports & Analytics</h1>
            <p className="text-gray-400 mt-1">Generate comprehensive trading reports and export data</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={exportQuickReport} 
              variant="outline"
              className="border-gray-600 hover:bg-gray-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Quick Export
            </Button>
            <Button 
              onClick={() => window.open('/analytics', '_blank')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Brain className="h-4 w-4 mr-2" />
              Advanced Analytics
            </Button>
          </div>
        </div>

        {/* Quick Overview */}
        {quickStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">Total Trades</p>
                    <p className="text-2xl font-bold text-white">{quickStats.totalTrades}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-200 text-sm">Total P&L</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(quickStats.totalPnL)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200 text-sm">Win Rate</p>
                    <p className="text-2xl font-bold text-white">
                      {formatPercentage(quickStats.winRate)}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-900 to-orange-800 border-orange-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-200 text-sm">Accounts</p>
                    <p className="text-2xl font-bold text-white">{quickStats.accountsTracked}</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-900 to-cyan-800 border-cyan-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-200 text-sm">Journal Entries</p>
                    <p className="text-2xl font-bold text-white">{quickStats.journalEntries}</p>
                  </div>
                  <FileText className="h-8 w-8 text-cyan-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Report Generator
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Quick Overview
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Report Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            <ReportGenerator accounts={accounts || []} />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            {quickStats && (
              <>
                {/* Performance Chart */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>Monthly Performance Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MonthlyPerformanceChart 
                      data={quickStats.monthlyPnL.map(item => ({
                        month: item.month,
                        pnl: item.pnl
                      }))} 
                    />
                  </CardContent>
                </Card>

                {/* Account Summary */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>Account Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {accounts?.map((account) => (
                        <div key={account.id} className="bg-gray-900 p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium truncate">{account.name}</h4>
                            <Badge 
                              variant={account.status === 'active' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {account.status}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Type:</span>
                              <span>{account.type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Firm:</span>
                              <span>{account.firm}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Balance:</span>
                              <span className={account.currentBalance >= account.startingBalance ? 'text-green-400' : 'text-red-400'}>
                                {formatCurrency(account.currentBalance)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>Recent Trading Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {trades?.slice(-5).reverse().map((trade) => {
                        const account = accounts?.find(acc => acc.id === trade.accountId);
                        return (
                          <div key={trade.id} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${trade.pnl >= 0 ? 'bg-green-400' : 'bg-red-400'}`} />
                              <div>
                                <p className="font-medium">{trade.symbol}</p>
                                <p className="text-sm text-gray-400">{account?.name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-medium ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {formatCurrency(trade.pnl)}
                              </p>
                              <p className="text-sm text-gray-400">{formatDate(trade.date)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gray-800 border-gray-700 hover:border-blue-600 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-400" />
                    Performance Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-4">
                    Comprehensive performance analysis with charts, metrics, and insights.
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700 hover:border-green-600 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-400" />
                    Risk Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-4">
                    Detailed risk metrics, drawdown analysis, and risk management insights.
                  </p>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700 hover:border-purple-600 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-400" />
                    Trading Journal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-4">
                    Export journal entries with reflection analysis and improvement tracking.
                  </p>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700 hover:border-orange-600 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-orange-400" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-4">
                    Account balances, P&L summaries, and financial tracking overview.
                  </p>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700 hover:border-cyan-600 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-cyan-400" />
                    Trade Log Export
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-4">
                    Raw trade data export in CSV or Excel format for external analysis.
                  </p>
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                    Export Data
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700 hover:border-yellow-600 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-yellow-400" />
                    Custom Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-4">
                    Build a custom report with your specific requirements and filters.
                  </p>
                  <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                    Create Custom
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}