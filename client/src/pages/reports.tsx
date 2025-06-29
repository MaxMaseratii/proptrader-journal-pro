import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatPercentage } from "@/lib/utils";
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon, 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  Filter
} from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subDays } from "date-fns";
import type { Account, Trade, JournalEntry } from "@shared/schema";

interface ReportData {
  summary: {
    totalTrades: number;
    winRate: number;
    totalPnL: number;
    bestTrade: number;
    worstTrade: number;
    averageWin: number;
    averageLoss: number;
    profitFactor: number;
  };
  dailyBreakdown: Array<{
    date: string;
    trades: number;
    pnl: number;
    winRate: number;
  }>;
  trades: Trade[];
  journalEntries: JournalEntry[];
}

export default function Reports() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [dateRange, setDateRange] = useState<string>("month");
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  const [reportType, setReportType] = useState<string>("performance");

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: trades } = useQuery<Trade[]>({
    queryKey: ["/api/trades", selectedAccountId],
    enabled: !!selectedAccountId,
  });

  const { data: journalEntries } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal", selectedAccountId],
    enabled: !!selectedAccountId,
  });

  const selectedAccount = accounts?.find(acc => acc.id.toString() === selectedAccountId);

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    const now = new Date();
    
    switch (range) {
      case "week":
        setStartDate(startOfWeek(now));
        setEndDate(endOfWeek(now));
        break;
      case "month":
        setStartDate(startOfMonth(now));
        setEndDate(endOfMonth(now));
        break;
      case "quarter":
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        const quarterEnd = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0);
        setStartDate(quarterStart);
        setEndDate(quarterEnd);
        break;
      case "year":
        setStartDate(new Date(now.getFullYear(), 0, 1));
        setEndDate(new Date(now.getFullYear(), 11, 31));
        break;
      case "last30":
        setStartDate(subDays(now, 30));
        setEndDate(now);
        break;
    }
  };

  const generateReportData = (): ReportData | null => {
    if (!trades || !selectedAccount) return null;

    const filteredTrades = trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      return tradeDate >= startDate && tradeDate <= endDate;
    });

    const filteredJournalEntries = journalEntries?.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    }) || [];

    const winningTrades = filteredTrades.filter(trade => trade.pnl > 0);
    const losingTrades = filteredTrades.filter(trade => trade.pnl < 0);
    
    const totalPnL = filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const winRate = filteredTrades.length > 0 ? (winningTrades.length / filteredTrades.length) * 100 : 0;
    
    const averageWin = winningTrades.length > 0 ? 
      winningTrades.reduce((sum, trade) => sum + trade.pnl, 0) / winningTrades.length : 0;
    const averageLoss = losingTrades.length > 0 ? 
      Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0) / losingTrades.length) : 0;
    
    const grossProfit = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;

    const bestTrade = filteredTrades.length > 0 ? Math.max(...filteredTrades.map(t => t.pnl)) : 0;
    const worstTrade = filteredTrades.length > 0 ? Math.min(...filteredTrades.map(t => t.pnl)) : 0;

    // Daily breakdown
    const dailyData = filteredTrades.reduce((acc, trade) => {
      const date = trade.date;
      if (!acc[date]) {
        acc[date] = { trades: 0, pnl: 0, wins: 0 };
      }
      acc[date].trades++;
      acc[date].pnl += trade.pnl;
      if (trade.pnl > 0) acc[date].wins++;
      return acc;
    }, {} as Record<string, { trades: number; pnl: number; wins: number }>);

    const dailyBreakdown = Object.entries(dailyData).map(([date, data]) => ({
      date,
      trades: data.trades,
      pnl: data.pnl,
      winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      summary: {
        totalTrades: filteredTrades.length,
        winRate,
        totalPnL,
        bestTrade,
        worstTrade,
        averageWin,
        averageLoss,
        profitFactor,
      },
      dailyBreakdown,
      trades: filteredTrades,
      journalEntries: filteredJournalEntries,
    };
  };

  const exportReport = () => {
    const reportData = generateReportData();
    if (!reportData || !selectedAccount) return;

    const csvContent = generateCSVContent(reportData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedAccount.name}_report_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const generateCSVContent = (data: ReportData): string => {
    let csv = "Trading Report\n\n";
    
    // Summary
    csv += "Summary\n";
    csv += "Metric,Value\n";
    csv += `Total Trades,${data.summary.totalTrades}\n`;
    csv += `Win Rate,${data.summary.winRate.toFixed(2)}%\n`;
    csv += `Total P&L,${data.summary.totalPnL}\n`;
    csv += `Best Trade,${data.summary.bestTrade}\n`;
    csv += `Worst Trade,${data.summary.worstTrade}\n`;
    csv += `Average Win,${data.summary.averageWin.toFixed(2)}\n`;
    csv += `Average Loss,${data.summary.averageLoss.toFixed(2)}\n`;
    csv += `Profit Factor,${data.summary.profitFactor.toFixed(2)}\n\n`;
    
    // Trades
    csv += "Trade Details\n";
    csv += "Date,Symbol,Side,Quantity,Entry Price,Exit Price,P&L,Notes\n";
    data.trades.forEach(trade => {
      csv += `${trade.date},${trade.symbol},${trade.side},${trade.quantity},${trade.entryPrice},${trade.exitPrice || ''},${trade.pnl},"${trade.notes || ''}"\n`;
    });
    
    return csv;
  };

  const reportData = generateReportData();

  return (
    <>
      <header className="bg-dark-surface border-b border-dark-border px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Trading Reports</h2>
            <p className="text-gray-400 text-sm mt-1">Generate and export detailed trading reports</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={exportReport}
              disabled={!reportData || !selectedAccount}
              className="bg-success-green hover:bg-green-600"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Report Filters */}
        <Card className="bg-dark-card border-dark-border mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Account</label>
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger>
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

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance">Performance Report</SelectItem>
                    <SelectItem value="detailed">Detailed Trade Log</SelectItem>
                    <SelectItem value="summary">Summary Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Date Range</label>
                <Select value={dateRange} onValueChange={handleDateRangeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="last30">Last 30 Days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Custom Dates</label>
                <div className="flex space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="border-dark-border">
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-dark-surface border-dark-border">
                      <Calendar
                        mode="range"
                        selected={{ from: startDate, to: endDate }}
                        onSelect={(range) => {
                          if (range?.from) setStartDate(range.from);
                          if (range?.to) setEndDate(range.to);
                          setDateRange("custom");
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {!selectedAccount ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">Select an account to generate reports</h3>
            <p className="text-gray-400">Choose an account and date range to view trading reports</p>
          </div>
        ) : !reportData ? (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No data for selected period</h3>
            <p className="text-gray-400">Try selecting a different date range or account</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Report Header */}
            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{selectedAccount.name} - Trading Report</CardTitle>
                    <p className="text-gray-400 text-sm mt-1">
                      {format(startDate, "MMM dd, yyyy")} - {format(endDate, "MMM dd, yyyy")}
                    </p>
                  </div>
                  <Badge className="bg-primary text-white">
                    {reportType.charAt(0).toUpperCase() + reportType.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-dark-card border-dark-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Total P&L</p>
                      <p className={`text-2xl font-bold ${reportData.summary.totalPnL >= 0 ? 'text-success-green' : 'text-error-red'}`}>
                        {formatCurrency(reportData.summary.totalPnL)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{reportData.summary.totalTrades} trades</p>
                    </div>
                    <div className={`bg-opacity-20 p-3 rounded-lg ${reportData.summary.totalPnL >= 0 ? 'bg-success-green' : 'bg-error-red'}`}>
                      {reportData.summary.totalPnL >= 0 ? (
                        <TrendingUp className="text-success-green h-6 w-6" />
                      ) : (
                        <TrendingDown className="text-error-red h-6 w-6" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-card border-dark-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Win Rate</p>
                      <p className="text-2xl font-bold text-primary">{reportData.summary.winRate.toFixed(1)}%</p>
                      <p className="text-xs text-gray-400 mt-1">Success rate</p>
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
                      <p className="text-gray-400 text-sm mb-1">Best Trade</p>
                      <p className="text-2xl font-bold text-success-green">{formatCurrency(reportData.summary.bestTrade)}</p>
                      <p className="text-xs text-gray-400 mt-1">Largest win</p>
                    </div>
                    <div className="bg-success-green bg-opacity-20 p-3 rounded-lg">
                      <TrendingUp className="text-success-green h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-card border-dark-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Profit Factor</p>
                      <p className="text-2xl font-bold text-warning-orange">{reportData.summary.profitFactor.toFixed(2)}</p>
                      <p className="text-xs text-gray-400 mt-1">Profit/Loss ratio</p>
                    </div>
                    <div className="bg-warning-orange bg-opacity-20 p-3 rounded-lg">
                      <BarChart3 className="text-warning-orange h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Daily Breakdown */}
            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <CardTitle>Daily Performance Breakdown</CardTitle>
                <p className="text-gray-400 text-sm">Day-by-day trading performance</p>
              </CardHeader>
              <CardContent>
                {reportData.dailyBreakdown.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-dark-surface">
                        <tr>
                          <th className="px-6 py-3 text-left font-medium text-gray-400">Date</th>
                          <th className="px-6 py-3 text-left font-medium text-gray-400">Trades</th>
                          <th className="px-6 py-3 text-left font-medium text-gray-400">P&L</th>
                          <th className="px-6 py-3 text-left font-medium text-gray-400">Win Rate</th>
                          <th className="px-6 py-3 text-left font-medium text-gray-400">Performance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-border">
                        {reportData.dailyBreakdown.map((day) => (
                          <tr key={day.date} className="hover:bg-dark-surface transition-colors">
                            <td className="px-6 py-4">{formatDate(day.date)}</td>
                            <td className="px-6 py-4">{day.trades}</td>
                            <td className={`px-6 py-4 font-medium ${day.pnl >= 0 ? 'text-success-green' : 'text-error-red'}`}>
                              {formatCurrency(day.pnl)}
                            </td>
                            <td className="px-6 py-4">{day.winRate.toFixed(0)}%</td>
                            <td className="px-6 py-4">
                              <Badge 
                                className={`${day.pnl >= 0 ? 'bg-success-green' : 'bg-error-red'} text-white`}
                              >
                                {day.pnl >= 0 ? 'Profitable' : 'Loss'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No trading activity in selected period</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detailed Trade Log */}
            {reportType === "detailed" && (
              <Card className="bg-dark-card border-dark-border">
                <CardHeader>
                  <CardTitle>Detailed Trade Log</CardTitle>
                  <p className="text-gray-400 text-sm">Complete list of all trades in selected period</p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-dark-surface">
                        <tr>
                          <th className="px-6 py-3 text-left font-medium text-gray-400">Date</th>
                          <th className="px-6 py-3 text-left font-medium text-gray-400">Symbol</th>
                          <th className="px-6 py-3 text-left font-medium text-gray-400">Side</th>
                          <th className="px-6 py-3 text-left font-medium text-gray-400">Quantity</th>
                          <th className="px-6 py-3 text-left font-medium text-gray-400">Entry</th>
                          <th className="px-6 py-3 text-left font-medium text-gray-400">Exit</th>
                          <th className="px-6 py-3 text-right font-medium text-gray-400">P&L</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-border">
                        {reportData.trades.map((trade) => (
                          <tr key={trade.id} className="hover:bg-dark-surface transition-colors">
                            <td className="px-6 py-4">{formatDate(trade.date)}</td>
                            <td className="px-6 py-4 font-medium">{trade.symbol}</td>
                            <td className="px-6 py-4">
                              <Badge variant={trade.side === 'buy' ? 'default' : 'destructive'}>
                                {trade.side.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">{trade.quantity}</td>
                            <td className="px-6 py-4">{trade.entryPrice}</td>
                            <td className="px-6 py-4">{trade.exitPrice || '-'}</td>
                            <td className={`px-6 py-4 text-right font-medium ${trade.pnl >= 0 ? 'text-success-green' : 'text-error-red'}`}>
                              {formatCurrency(trade.pnl)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
