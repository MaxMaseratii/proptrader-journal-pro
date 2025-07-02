import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  AlertCircle,
  Download
} from "lucide-react";
import type { Account, Trade } from "@shared/schema";

interface PayoutMetrics {
  availablePayout: number;
  totalEarnings: number;
  totalPayouts: number;
  fiveDayEligible: boolean;
  fiveDayRule: boolean;
  profitableDays200Plus: number;
  consistencyRulePercent: number | null;
  daysTraded: number;
  requiredTradingDays: number;
  nextPayoutDate: string | null;
}

interface PayoutHistory {
  id: number;
  date: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  type: 'weekly';
}

export default function Payouts() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: trades } = useQuery<Trade[]>({
    queryKey: ["/api/trades", selectedAccountId],
    enabled: !!selectedAccountId,
  });

  const selectedAccount = accounts?.find(acc => acc.id.toString() === selectedAccountId);

  // Mock payout history for demonstration
  const payoutHistory: PayoutHistory[] = [
    {
      id: 1,
      date: "2024-10-15",
      amount: 1200,
      status: 'paid',
      type: 'weekly'
    },
    {
      id: 2,
      date: "2024-09-28",
      amount: 800,
      status: 'paid',
      type: 'weekly'
    },
    {
      id: 3,
      date: "2024-09-10",
      amount: 600,
      status: 'paid',
      type: 'weekly'
    }
  ];

  const calculatePayoutMetrics = (): PayoutMetrics | null => {
    if (!selectedAccount || !trades) return null;

    const totalProfit = Math.max(0, selectedAccount.currentBalance - selectedAccount.startingBalance);
    const profitableTrades = trades.filter(trade => trade.pnl > 0);
    const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);

    // Calculate highest profit day for 20% rule
    const dailyPnL = trades.reduce((acc, trade) => {
      acc[trade.date] = (acc[trade.date] || 0) + trade.pnl;
      return acc;
    }, {} as Record<string, number>);

    const dailyPnLValues = Object.values(dailyPnL);
    
    // 5-day $200+ profit rule - need 5 trading days with at least $200 profit each
    const profitableDays200Plus = dailyPnLValues.filter(dayPnL => dayPnL >= 200).length;
    const fiveDayRule = profitableDays200Plus >= 5;
    
    // Check for user-defined consistency rule percentage from account settings
    const consistencyRulePercent = selectedAccount.consistencyRule ? (selectedAccount.consistencyPercentage || null) : null;

    // 5-day trading requirement
    const tradingDays = Object.keys(dailyPnL).length;
    const fiveDayEligible = tradingDays >= 5;

    // Calculate available payout (80% of profit for funded accounts)
    const payoutPercentage = selectedAccount.type === 'funded' ? 0.8 : 0;
    const availablePayout = Math.max(0, totalProfit * payoutPercentage);

    // Next payout date (assuming weekly payouts)
    const nextPayoutDate = new Date();
    nextPayoutDate.setDate(nextPayoutDate.getDate() + (7 - nextPayoutDate.getDay()));

    return {
      availablePayout,
      totalEarnings: totalProfit,
      totalPayouts: payoutHistory.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
      fiveDayEligible,
      fiveDayRule,
      profitableDays200Plus,
      consistencyRulePercent,
      daysTraded: tradingDays,
      requiredTradingDays: 5,
      nextPayoutDate: fiveDayEligible && fiveDayRule ? nextPayoutDate.toISOString().split('T')[0] : null,
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-success-green" />;
      case 'approved': return <Clock className="h-4 w-4 text-primary" />;
      case 'pending': return <Clock className="h-4 w-4 text-warning-orange" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-error-red" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-success-green text-white';
      case 'approved': return 'bg-primary text-white';
      case 'pending': return 'bg-warning-orange text-white';
      case 'rejected': return 'bg-error-red text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const metrics = calculatePayoutMetrics();

  return (
    <>
      <header className="bg-dark-surface border-b border-dark-border px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Payout Management</h2>
            <p className="text-gray-400 text-sm mt-1">Track your earnings and manage payout requests</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts?.filter(acc => acc.type === 'funded').map((account) => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-success-green hover:bg-green-600"
                  disabled={!metrics?.fiveDayEligible || !metrics?.fiveDayRule || !metrics?.availablePayout}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Request Payout
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-dark-surface border-dark-border">
                <DialogHeader>
                  <DialogTitle>Request Payout</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-dark-card p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Payout Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Available Amount:</span>
                        <span className="font-medium text-success-green">{formatCurrency(metrics?.availablePayout || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Processing Time:</span>
                        <span>2-3 business days</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
                      Cancel
                    </Button>
                    <Button className="bg-success-green hover:bg-green-600">
                      Confirm Request
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="p-6">
        {!selectedAccount ? (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">Select a funded account</h3>
            <p className="text-gray-400">Payouts are only available for funded accounts</p>
          </div>
        ) : selectedAccount.type !== 'funded' ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-warning-orange mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">Challenge Account</h3>
            <p className="text-gray-400">Complete your challenge to unlock payout features</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Payout Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-dark-card border-dark-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Available Payout</p>
                      <p className="text-2xl font-bold text-success-green">
                        {formatCurrency(metrics?.availablePayout || 0)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Ready to withdraw</p>
                    </div>
                    <div className="bg-success-green bg-opacity-20 p-3 rounded-lg">
                      <DollarSign className="text-success-green h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-card border-dark-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Total Earnings</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(metrics?.totalEarnings || 0)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Account profit</p>
                    </div>
                    <div className="bg-primary bg-opacity-20 p-3 rounded-lg">
                      <TrendingUp className="text-primary h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-card border-dark-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Total Payouts</p>
                      <p className="text-2xl font-bold text-warning-orange">
                        {formatCurrency(metrics?.totalPayouts || 0)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">All time received</p>
                    </div>
                    <div className="bg-warning-orange bg-opacity-20 p-3 rounded-lg">
                      <Download className="text-warning-orange h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-card border-dark-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Next Payout</p>
                      <p className="text-lg font-bold">
                        {metrics?.nextPayoutDate ? formatDate(metrics.nextPayoutDate) : "N/A"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Estimated date</p>
                    </div>
                    <div className="bg-accent-orange bg-opacity-20 p-3 rounded-lg">
                      <Calendar className="text-accent-orange h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payout Eligibility */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-dark-card border-dark-border">
                <CardHeader>
                  <CardTitle>Payout Eligibility</CardTitle>
                  <p className="text-gray-400 text-sm">Requirements for payout requests</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {metrics?.fiveDayEligible ? (
                        <CheckCircle className="h-5 w-5 text-success-green mr-3" />
                      ) : (
                        <XCircle className="h-5 w-5 text-error-red mr-3" />
                      )}
                      <span className="text-sm">5 Trading Days</span>
                    </div>
                    <Badge className={metrics?.fiveDayEligible ? 'bg-success-green text-white' : 'bg-error-red text-white'}>
                      {metrics?.daysTraded || 0}/5
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {metrics?.fiveDayRule ? (
                        <CheckCircle className="h-5 w-5 text-success-green mr-3" />
                      ) : (
                        <XCircle className="h-5 w-5 text-error-red mr-3" />
                      )}
                      <span className="text-sm">5-Day $200+ Rule</span>
                    </div>
                    <Badge className={metrics?.fiveDayRule ? 'bg-success-green text-white' : 'bg-error-red text-white'}>
                      {metrics?.profitableDays200Plus || 0}/5
                    </Badge>
                  </div>

                  {metrics?.consistencyRulePercent && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>User Consistency Rule</span>
                        <span>{metrics.consistencyRulePercent}%</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Custom consistency rule from account settings
                      </p>
                    </div>
                  )}

                  {(!metrics?.fiveDayEligible || !metrics?.fiveDayRule) && (
                    <div className="mt-4 p-3 bg-warning-orange bg-opacity-20 rounded-lg border border-warning-orange">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-warning-orange mr-2" />
                        <p className="text-sm text-warning-orange">
                          Complete all requirements to unlock payouts
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-dark-card border-dark-border">
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <p className="text-gray-400 text-sm">Your account details and payout settings</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Account Type</span>
                        <span className="font-medium text-white capitalize">{selectedAccount.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Starting Balance</span>
                        <span className="font-medium text-white">{formatCurrency(selectedAccount.startingBalance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Current Balance</span>
                        <span className={`font-medium ${selectedAccount.currentBalance >= selectedAccount.startingBalance ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(selectedAccount.currentBalance)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Profit Target</span>
                        <span className="font-medium text-blue-400">{formatCurrency(selectedAccount.profitTarget)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Max Drawdown</span>
                        <span className="font-medium text-orange-400">{formatCurrency(selectedAccount.maxDrawdown)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Daily Loss Limit</span>
                        <span className="font-medium text-red-400">{formatCurrency(selectedAccount.dailyLossLimit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Firm</span>
                        <span className="font-medium text-white">{selectedAccount.firm || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status</span>
                        <Badge variant={selectedAccount.status === 'funded' ? 'default' : selectedAccount.status === 'active' ? 'secondary' : 'destructive'} className="capitalize">
                          {selectedAccount.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {selectedAccount.status === 'funded' && (
                    <div className="mt-4 p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                        <p className="text-sm text-green-400">
                          This account is eligible for payouts based on your trading performance
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Payout History */}
            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
                <p className="text-gray-400 text-sm">Previous payout requests and payments</p>
              </CardHeader>
              <CardContent>
                {payoutHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-dark-surface">
                        <tr>
                          <th className="px-6 py-3 text-left font-medium text-gray-400">Date</th>
                          <th className="px-6 py-3 text-left font-medium text-gray-400">Amount</th>
                          <th className="px-6 py-3 text-left font-medium text-gray-400">Type</th>
                          <th className="px-6 py-3 text-left font-medium text-gray-400">Status</th>
                          <th className="px-6 py-3 text-left font-medium text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-border">
                        {payoutHistory.map((payout) => (
                          <tr key={payout.id} className="hover:bg-dark-surface transition-colors">
                            <td className="px-6 py-4">{formatDate(payout.date)}</td>
                            <td className="px-6 py-4 font-medium">{formatCurrency(payout.amount)}</td>
                            <td className="px-6 py-4">
                              <Badge variant="outline" className="border-gray-600">
                                {payout.type}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                {getStatusIcon(payout.status)}
                                <Badge className={`ml-2 ${getStatusColor(payout.status)}`}>
                                  {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                                </Badge>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Button variant="ghost" size="sm" className="text-primary hover:text-blue-400">
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Download className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No payout history available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
