import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CalendarDays, Download, Filter, Search, Plus } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Trade, Account } from "@shared/schema";
import { useState, useMemo } from "react";
import TradeEntry from "@/components/trade-entry";

export default function Trades() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data: trades, isLoading: tradesLoading } = useQuery<Trade[]>({
    queryKey: ['/api/trades'],
  });

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  // Filter and sort trades
  const filteredTrades = useMemo(() => {
    if (!trades) return [];
    
    let filtered = trades.filter(trade => {
      const matchesSearch = 
        trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trade.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      
      const matchesAccount = selectedAccount === "all" || trade.accountId.toString() === selectedAccount;
      const matchesStatus = selectedStatus === "all" || trade.status === selectedStatus;
      
      return matchesSearch && matchesAccount && matchesStatus;
    });

    // Sort trades
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "date":
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case "pnl":
          aValue = a.pnl;
          bValue = b.pnl;
          break;
        case "symbol":
          aValue = a.symbol;
          bValue = b.symbol;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }
      
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [trades, searchTerm, selectedAccount, selectedStatus, sortBy, sortOrder]);

  const getAccountName = (accountId: number) => {
    return accounts?.find(acc => acc.id === accountId)?.name || `Account ${accountId}`;
  };

  const exportToCSV = () => {
    if (!filteredTrades.length) return;
    
    const headers = [
      "Date", "Account", "Symbol", "Side", "Quantity", "Entry Price", "Exit Price", 
      "P&L", "Status", "Order ID", "Notes"
    ];
    
    const csvContent = [
      headers.join(","),
      ...filteredTrades.map(trade => [
        trade.date,
        getAccountName(trade.accountId),
        trade.symbol,
        trade.side,
        trade.quantity,
        trade.entryPrice,
        trade.exitPrice || "",
        trade.pnl,
        trade.status,
        trade.orderId || "",
        trade.notes || ""
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trades_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (tradesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading trades...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="border-b border-gray-800 bg-dark-bg pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Trading Management</h1>
            <p className="text-gray-400">Add new trades manually or view existing trading activity</p>
          </div>
        </div>
      </header>

      <Tabs defaultValue="view" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800">
          <TabsTrigger value="view" className="text-white data-[state=active]:bg-blue-600">
            View All Trades
          </TabsTrigger>
          <TabsTrigger value="add" className="text-white data-[state=active]:bg-green-600">
            <Plus className="mr-2 h-4 w-4" />
            Add Trade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="space-y-6">
          <Card className="bg-dark-card border-dark-border">
            <CardHeader>
              <CardTitle className="text-white">Manual Trade Entry</CardTitle>
              <p className="text-gray-400">Enter trade details manually for precise record keeping</p>
            </CardHeader>
            <CardContent>
              <TradeEntry accounts={accounts || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="view" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">All Trades</h2>
            <Button onClick={exportToCSV} className="bg-blue-600 hover:bg-blue-700">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

      {/* Filters */}
      <Card className="bg-dark-card border-dark-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search symbol, order ID, notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="All Accounts" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all" className="text-white">All Accounts</SelectItem>
                {accounts?.map(account => (
                  <SelectItem key={account.id} value={account.id.toString()} className="text-white">
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all" className="text-white">All Status</SelectItem>
                <SelectItem value="win" className="text-white">Wins</SelectItem>
                <SelectItem value="loss" className="text-white">Losses</SelectItem>
                <SelectItem value="breakeven" className="text-white">Breakeven</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="date" className="text-white">Date</SelectItem>
                <SelectItem value="pnl" className="text-white">P&L</SelectItem>
                <SelectItem value="symbol" className="text-white">Symbol</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="desc" className="text-white">Newest First</SelectItem>
                <SelectItem value="asc" className="text-white">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-dark-card border-dark-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{filteredTrades.length}</div>
            <div className="text-sm text-gray-400">Total Trades</div>
          </CardContent>
        </Card>
        <Card className="bg-dark-card border-dark-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(filteredTrades.reduce((sum, trade) => sum + Math.max(0, trade.pnl), 0))}
            </div>
            <div className="text-sm text-gray-400">Total Wins</div>
          </CardContent>
        </Card>
        <Card className="bg-dark-card border-dark-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-400">
              {formatCurrency(Math.abs(filteredTrades.reduce((sum, trade) => sum + Math.min(0, trade.pnl), 0)))}
            </div>
            <div className="text-sm text-gray-400">Total Losses</div>
          </CardContent>
        </Card>
        <Card className="bg-dark-card border-dark-border">
          <CardContent className="p-4">
            <div className={`text-2xl font-bold ${
              filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatCurrency(filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0))}
            </div>
            <div className="text-sm text-gray-400">Net P&L</div>
          </CardContent>
        </Card>
      </div>

      {/* Trades Table */}
      <Card className="bg-dark-card border-dark-border">
        <CardHeader>
          <CardTitle className="text-white">Trade History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Account</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Symbol</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Side</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Quantity</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Entry</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Exit</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">P&L</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-medium">Result</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Initial SL</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Initial TP</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Final SL</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Final TP</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map((trade) => (
                  <tr key={trade.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3 px-4 text-white">{formatDate(trade.date)}</td>
                    <td className="py-3 px-4 text-gray-300">{getAccountName(trade.accountId)}</td>
                    <td className="py-3 px-4 text-white font-medium">{trade.symbol}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={trade.side === 'buy' ? 'default' : 'secondary'}
                        className={trade.side === 'buy' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
                      >
                        {trade.side.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-white">{trade.quantity}</td>
                    <td className="py-3 px-4 text-right text-white">{formatCurrency(trade.entryPrice)}</td>
                    <td className="py-3 px-4 text-right text-white">
                      {trade.exitPrice ? formatCurrency(trade.exitPrice) : '-'}
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${
                      trade.pnl > 0 ? 'text-green-400' : trade.pnl < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {formatCurrency(trade.pnl)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge 
                        variant={trade.pnl > 0 ? 'default' : trade.pnl < 0 ? 'destructive' : 'secondary'}
                        className={
                          trade.pnl > 0 ? 'bg-green-600 text-white' :
                          trade.pnl < 0 ? 'bg-red-600 text-white' :
                          'bg-gray-600 text-white'
                        }
                      >
                        {trade.pnl > 0 ? 'WIN' : trade.pnl < 0 ? 'LOSS' : 'BREAKEVEN'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300">
                      {trade.initialStopLoss ? formatCurrency(trade.initialStopLoss) : 'Not placed'}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300">
                      {trade.initialTakeProfit ? formatCurrency(trade.initialTakeProfit) : 'Not placed'}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300">
                      {trade.finalStopLoss ? formatCurrency(trade.finalStopLoss) : 'Not placed'}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300">
                      {trade.finalTakeProfit ? formatCurrency(trade.finalTakeProfit) : 'Not placed'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredTrades.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No trades found matching your filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}