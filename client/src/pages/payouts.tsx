import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  AlertCircle,
  Download,
  Send,
  Star,
  Banknote,
  FileText
} from "lucide-react";
import type { Account, Trade } from "@shared/schema";

interface PayoutMetrics {
  availablePayout: number;
  totalEarnings: number;
  totalPayouts: number;
  meetsTradingDaysRule: boolean;
  meetsWinningDaysRule: boolean;
  profitableDaysAboveMinimum: number;
  consistencyRulePercent: number | null;
  daysTraded: number;
  requiredTradingDays: number;
  winningDayMinimum: number;
  minimumPayoutAmount: number;
  nextPayoutDate: string | null;
}

interface PayoutHistory {
  id: number;
  date: string;
  amount: number;
  status: 'suggested' | 'requested' | 'approved' | 'received' | 'rejected';
  type: 'weekly';
  notes?: string;
  firmRating?: number;
  firmExperience?: string;
  requestedDate?: string;
  approvedDate?: string;
  receivedDate?: string;
}

export default function Payouts() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [suggestedPayoutPercent, setSuggestedPayoutPercent] = useState<number>(75);
  const [payoutNotes, setPayoutNotes] = useState<string>("");
  const [firmRating, setFirmRating] = useState<number>(0);
  const [firmExperience, setFirmExperience] = useState<string>("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      status: 'received',
      type: 'weekly',
      firmRating: 5,
      firmExperience: "Excellent service! Fast payout processing, no issues whatsoever.",
      requestedDate: "2024-10-10",
      approvedDate: "2024-10-12",
      receivedDate: "2024-10-15"
    },
    {
      id: 2,
      date: "2024-09-28",
      amount: 800,
      status: 'received',
      type: 'weekly',
      firmRating: 4,
      firmExperience: "Good experience, took 3 days but everything went smoothly.",
      requestedDate: "2024-09-25",
      approvedDate: "2024-09-26",
      receivedDate: "2024-09-28"
    },
    {
      id: 3,
      date: "2024-09-10", 
      amount: 600,
      status: 'approved',
      type: 'weekly',
      notes: "Waiting for bank transfer to complete",
      requestedDate: "2024-09-05",
      approvedDate: "2024-09-08"
    }
  ];

  const calculatePayoutMetrics = (): PayoutMetrics | null => {
    if (!selectedAccount || !trades) return null;

    // Check if account type is eligible for payout
    const isEligibleAccountType = selectedAccount.type === 'funded' || selectedAccount.type === 'live';
    
    const totalProfit = Math.max(0, selectedAccount.currentBalance - selectedAccount.startingBalance);
    const profitableTrades = trades.filter(trade => trade.pnl > 0);
    const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);

    // Calculate highest profit day for 20% rule
    const dailyPnL = trades.reduce((acc, trade) => {
      acc[trade.date] = (acc[trade.date] || 0) + trade.pnl;
      return acc;
    }, {} as Record<string, number>);

    const dailyPnLValues = Object.values(dailyPnL);
    
    // Use actual user-entered payout requirements (no fallback values)
    const daysRequired = selectedAccount.daysRequiredForPayout || 0;
    const winningDayMinimum = selectedAccount.winningDayMinimum || 0;
    const minimumPayoutAmount = selectedAccount.minimumPayoutAmount || 0;
    const maxNetBalanceForPayout = selectedAccount.maxNetBalanceForPayout;
    
    // Check profitable days based on user-entered minimum
    const profitableDaysAboveMinimum = dailyPnLValues.filter(dayPnL => dayPnL >= winningDayMinimum).length;
    const meetsWinningDaysRule = profitableDaysAboveMinimum >= daysRequired;
    
    // Check for user-defined consistency rule percentage from account settings
    const consistencyRulePercent = selectedAccount.consistencyRule ? (selectedAccount.consistencyPercentage || null) : null;

    // Trading days requirement based on user settings
    const tradingDays = Object.keys(dailyPnL).length;
    const meetsTradingDaysRule = tradingDays >= daysRequired;

    // Check all payout eligibility requirements
    const totalRequiredProfit = (maxNetBalanceForPayout || 0) + minimumPayoutAmount;
    const meetsMinimumPayoutAmount = totalProfit >= totalRequiredProfit;
    const meetsMaxNetBalanceLimit = !maxNetBalanceForPayout || totalProfit > maxNetBalanceForPayout;

    // Calculate available payout using user-entered profit split and buffer settings
    const profitSplit = selectedAccount.profitSplit ? (selectedAccount.profitSplit / 100) : 0;
    const bufferPercentage = selectedAccount.bufferPercentage ? (selectedAccount.bufferPercentage / 100) : 0;
    const maxPayoutPercentage = selectedAccount.maximumPayoutPercentage ? (selectedAccount.maximumPayoutPercentage / 100) : 1;
    
    // Calculate buffer amount
    const bufferAmount = selectedAccount.profitTarget * bufferPercentage;
    const profitAboveBuffer = Math.max(0, totalProfit - bufferAmount);
    
    // Calculate available payout with user settings - only if all requirements are met
    const availablePayout = (
      isEligibleAccountType && 
      meetsTradingDaysRule && 
      meetsWinningDaysRule && 
      meetsMinimumPayoutAmount && 
      meetsMaxNetBalanceLimit
    ) ? Math.max(0, profitAboveBuffer * profitSplit * maxPayoutPercentage) : 0;

    // Next payout date based on user-entered frequency
    const nextPayoutDate = new Date();
    const payoutFrequency = selectedAccount.payoutFrequency || 'weekly';
    switch (payoutFrequency) {
      case 'daily':
        nextPayoutDate.setDate(nextPayoutDate.getDate() + 1);
        break;
      case 'weekly':
        nextPayoutDate.setDate(nextPayoutDate.getDate() + (7 - nextPayoutDate.getDay()));
        break;
      case 'bi-weekly':
        nextPayoutDate.setDate(nextPayoutDate.getDate() + 14);
        break;
      case 'monthly':
        nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1);
        break;
      default:
        nextPayoutDate.setDate(nextPayoutDate.getDate() + 7);
    }

    return {
      availablePayout,
      totalEarnings: totalProfit,
      totalPayouts: payoutHistory.filter(p => p.status === 'received').reduce((sum, p) => sum + p.amount, 0),
      meetsTradingDaysRule,
      meetsWinningDaysRule,
      profitableDaysAboveMinimum,
      consistencyRulePercent,
      daysTraded: tradingDays,
      requiredTradingDays: daysRequired,
      winningDayMinimum,
      minimumPayoutAmount,
      nextPayoutDate: isEligibleAccountType && meetsTradingDaysRule && meetsWinningDaysRule && meetsMinimumPayoutAmount && meetsMaxNetBalanceLimit ? 
        nextPayoutDate.toISOString().split('T')[0] : null,
    };
  };

  // Payout workflow mutations
  const requestPayoutMutation = useMutation({
    mutationFn: async (data: { accountId: number; amount: number; notes?: string }) => {
      return apiRequest("POST", "/api/payouts/request", data);
    },
    onSuccess: () => {
      toast({ title: "Payout Request Submitted", description: "Your payout request has been sent for approval." });
      setShowRequestDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/payouts'] });
    },
  });

  const updatePayoutStatusMutation = useMutation({
    mutationFn: async ({ payoutId, status, rating, experience }: { payoutId: number; status: string; rating?: number; experience?: string }) => {
      return apiRequest("PATCH", `/api/payouts/${payoutId}`, { status, firmRating: rating, firmExperience: experience });
    },
    onSuccess: () => {
      toast({ title: "Payout Status Updated", description: "Payout status has been updated successfully." });
      queryClient.invalidateQueries({ queryKey: ['/api/payouts'] });
    },
  });

  const calculateSuggestedPayout = () => {
    if (!metrics) return 0;
    return Math.round((metrics.availablePayout * suggestedPayoutPercent) / 100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received': return <CheckCircle className="h-4 w-4 text-success-green" />;
      case 'approved': return <Clock className="h-4 w-4 text-primary" />;
      case 'requested': return <Send className="h-4 w-4 text-blue-400" />;
      case 'suggested': return <TrendingUp className="h-4 w-4 text-warning-orange" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-error-red" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-success-green text-white';
      case 'approved': return 'bg-primary text-white';
      case 'requested': return 'bg-blue-600 text-white';
      case 'suggested': return 'bg-warning-orange text-white';
      case 'rejected': return 'bg-error-red text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} 
      />
    ));
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
                      {metrics?.meetsTradingDaysRule ? (
                        <CheckCircle className="h-5 w-5 text-success-green mr-3" />
                      ) : (
                        <XCircle className="h-5 w-5 text-error-red mr-3" />
                      )}
                      <span className="text-sm">
                        {metrics?.requiredTradingDays || 0} Trading Days Required
                      </span>
                    </div>
                    <Badge className={metrics?.meetsTradingDaysRule ? 'bg-success-green text-white' : 'bg-error-red text-white'}>
                      {metrics?.daysTraded || 0}/{metrics?.requiredTradingDays || 0}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {metrics?.meetsWinningDaysRule ? (
                        <CheckCircle className="h-5 w-5 text-success-green mr-3" />
                      ) : (
                        <XCircle className="h-5 w-5 text-error-red mr-3" />
                      )}
                      <span className="text-sm">
                        {metrics?.requiredTradingDays || 0} Days with ${metrics?.winningDayMinimum || 0}+ Profit
                      </span>
                    </div>
                    <Badge className={metrics?.meetsWinningDaysRule ? 'bg-success-green text-white' : 'bg-error-red text-white'}>
                      {metrics?.profitableDaysAboveMinimum || 0}/{metrics?.requiredTradingDays || 0}
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

                  {(!metrics?.meetsTradingDaysRule || !metrics?.meetsWinningDaysRule) && (
                    <div className="mt-4 p-3 bg-warning-orange bg-opacity-20 rounded-lg border border-warning-orange">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-warning-orange mr-2" />
                        <p className="text-sm text-warning-orange">
                          Complete all requirements to unlock payouts
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Show minimum payout amount requirement */}
                  {metrics?.minimumPayoutAmount && (
                    <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Minimum Payout Amount</span>
                        <span className="text-sm font-medium text-white">
                          ${metrics.minimumPayoutAmount}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Your profit must exceed this amount to request a payout.
                      </p>
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
                  
                  {/* Payout Settings Section */}
                  <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <h4 className="text-white font-medium mb-3">Your Payout Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Trading Days Required</span>
                          <span className="font-medium text-white">
                            {selectedAccount.daysRequiredForPayout || 'Not set'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Winning Day Minimum</span>
                          <span className="font-medium text-white">
                            {selectedAccount.winningDayMinimum ? `$${selectedAccount.winningDayMinimum}` : 'Not set'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Minimum Payout Amount</span>
                          <span className="font-medium text-white">
                            {selectedAccount.minimumPayoutAmount ? `$${selectedAccount.minimumPayoutAmount}` : 'Not set'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Payout Frequency</span>
                          <span className="font-medium text-white capitalize">
                            {selectedAccount.payoutFrequency || 'Not set'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Profit Split</span>
                          <span className="font-medium text-white">
                            {selectedAccount.profitSplit ? `${selectedAccount.profitSplit}%` : 'Not set'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Max Payout Percentage</span>
                          <span className="font-medium text-white">
                            {selectedAccount.maximumPayoutPercentage ? `${selectedAccount.maximumPayoutPercentage}%` : 'Not set'}
                          </span>
                        </div>
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

            {/* Enhanced Payout Request Workflow */}
            {metrics?.meetsTradingDaysRule && metrics?.meetsWinningDaysRule && (
              <Card className="bg-dark-card border-prop-gold">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Banknote className="mr-2 h-5 w-5 text-prop-gold" />
                    Payout Request Center
                  </CardTitle>
                  <p className="text-gray-400 text-sm">Complete payout workflow with suggestion engine</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payout Suggestion Engine */}
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                    <h4 className="text-white font-medium mb-3 flex items-center">
                      <TrendingUp className="mr-2 h-4 w-4 text-prop-gold" />
                      Smart Payout Suggestion
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-white">Suggested Payout Percentage</Label>
                        <div className="text-prop-gold font-medium">{suggestedPayoutPercent}%</div>
                      </div>
                      
                      <Slider
                        value={[suggestedPayoutPercent]}
                        onValueChange={([value]) => setSuggestedPayoutPercent(value)}
                        max={90}
                        min={10}
                        step={5}
                        className="w-full"
                      />
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-gray-700 p-3 rounded">
                          <p className="text-xs text-gray-400">Available</p>
                          <p className="font-bold text-white">{formatCurrency(metrics?.availablePayout || 0)}</p>
                        </div>
                        <div className="bg-prop-gold bg-opacity-20 p-3 rounded border border-prop-gold">
                          <p className="text-xs text-gray-400">Suggested</p>
                          <p className="font-bold text-prop-gold">{formatCurrency(calculateSuggestedPayout())}</p>
                        </div>
                        <div className="bg-gray-700 p-3 rounded">
                          <p className="text-xs text-gray-400">Remaining</p>
                          <p className="font-bold text-green-400">{formatCurrency((metrics?.availablePayout || 0) - calculateSuggestedPayout())}</p>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-400 space-y-1">
                        <p>💡 Smart suggestions based on:</p>
                        <ul className="space-y-1 ml-4">
                          <li>• Account buffer requirements ({selectedAccount.bufferPercentage || 5}%)</li>
                          <li>• Risk management best practices</li>
                          <li>• Historical payout patterns</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Payout Request Form */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Request Amount</Label>
                        <Input
                          type="number"
                          value={payoutAmount || ""}
                          onChange={(e) => setPayoutAmount(e.target.value === "" ? 0 : Number(e.target.value))}
                          placeholder="Enter amount"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-white">Quick Select</Label>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPayoutAmount(calculateSuggestedPayout())}
                            className="border-prop-gold text-prop-gold hover:bg-prop-gold hover:text-black"
                          >
                            Suggested
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPayoutAmount(metrics?.availablePayout || 0)}
                            className="border-gray-600 text-white hover:bg-gray-600"
                          >
                            Max
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-white">Notes (Optional)</Label>
                      <Textarea
                        value={payoutNotes}
                        onChange={(e) => setPayoutNotes(e.target.value)}
                        placeholder="Add notes about this payout request..."
                        className="bg-gray-700 border-gray-600 text-white"
                        rows={3}
                      />
                    </div>
                    
                    <Button
                      onClick={() => {
                        if (payoutAmount > 0 && selectedAccount) {
                          requestPayoutMutation.mutate({
                            accountId: selectedAccount.id,
                            amount: payoutAmount,
                            notes: payoutNotes || undefined
                          });
                        }
                      }}
                      disabled={!payoutAmount || payoutAmount <= 0 || requestPayoutMutation.isPending}
                      className="w-full bg-prop-gold hover:bg-prop-gold/80 text-black font-medium"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {requestPayoutMutation.isPending ? 'Submitting Request...' : 'Submit Payout Request'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

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
                              <div className="flex items-center gap-2">
                                {payout.status === 'approved' && (
                                  <Button 
                                    size="sm"
                                    onClick={() => updatePayoutStatusMutation.mutate({ 
                                      payoutId: payout.id, 
                                      status: 'received' 
                                    })}
                                    className="bg-success-green hover:bg-success-green/80 text-white"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Confirm Received
                                  </Button>
                                )}
                                
                                {payout.status === 'received' && !payout.firmRating && (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white">
                                        <Star className="h-3 w-3 mr-1" />
                                        Rate Experience
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-dark-card border-dark-border">
                                      <DialogHeader>
                                        <DialogTitle className="text-white">Rate Your Payout Experience</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div className="space-y-3">
                                          <Label className="text-white">Firm Experience Rating</Label>
                                          <div className="flex items-center gap-2">
                                            {Array.from({ length: 5 }, (_, i) => (
                                              <button
                                                key={i}
                                                onClick={() => setFirmRating(i + 1)}
                                                className="transition-colors"
                                              >
                                                <Star 
                                                  className={`h-6 w-6 ${
                                                    i < firmRating ? 'text-yellow-400 fill-current' : 'text-gray-400'
                                                  }`} 
                                                />
                                              </button>
                                            ))}
                                            <span className="ml-2 text-sm text-gray-400">
                                              {firmRating === 0 ? 'No rating' : 
                                               firmRating === 1 ? 'Poor' :
                                               firmRating === 2 ? 'Fair' :
                                               firmRating === 3 ? 'Good' :
                                               firmRating === 4 ? 'Very Good' : 'Excellent'}
                                            </span>
                                          </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <Label className="text-white">Experience Details</Label>
                                          <Textarea
                                            value={firmExperience}
                                            onChange={(e) => setFirmExperience(e.target.value)}
                                            placeholder="Share your experience with the payout process..."
                                            className="bg-gray-700 border-gray-600 text-white"
                                            rows={4}
                                          />
                                        </div>
                                        
                                        <Button
                                          onClick={() => {
                                            updatePayoutStatusMutation.mutate({
                                              payoutId: payout.id,
                                              status: 'received',
                                              rating: firmRating,
                                              experience: firmExperience
                                            });
                                            setFirmRating(0);
                                            setFirmExperience("");
                                          }}
                                          disabled={firmRating === 0 || !firmExperience.trim()}
                                          className="w-full bg-prop-gold hover:bg-prop-gold/80 text-black"
                                        >
                                          Submit Rating
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                )}
                                
                                {payout.status === 'received' && payout.firmRating && (
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center">
                                      {renderStars(payout.firmRating)}
                                    </div>
                                    <Badge variant="outline" className="border-green-600 text-green-400">
                                      Rated
                                    </Badge>
                                  </div>
                                )}
                                
                                <Button variant="ghost" size="sm" className="text-primary hover:text-blue-400">
                                  <FileText className="h-3 w-3 mr-1" />
                                  Details
                                </Button>
                              </div>
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
