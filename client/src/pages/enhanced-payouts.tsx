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
  FileText,
  Wallet,
  Target,
  Award,
  CreditCard,
  Building2,
  Globe,
  Settings,
  Save
} from "lucide-react";
import { useEffect } from "react";
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
  method?: string;
}

export default function EnhancedPayouts() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showEditRulesDialog, setShowEditRulesDialog] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutMethod, setPayoutMethod] = useState<string>("");
  const [suggestedPayoutPercent, setSuggestedPayoutPercent] = useState<number>(75);
  const [payoutNotes, setPayoutNotes] = useState<string>("");
  const [firmRating, setFirmRating] = useState<number>(0);
  const [firmExperience, setFirmExperience] = useState<string>("");
  
  // Payout rules editing state
  const [editingRules, setEditingRules] = useState({
    daysRequiredForPayout: 5,
    winningDayMinimum: 200,
    profitSplit: 80,
    minimumPayoutAmount: 500,
    maxNetBalanceForPayout: 10000,
    payoutFrequency: 'weekly',
    consistencyRulePercent: 50
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: trades } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

  // Calculate comprehensive payout metrics
  const payoutMetrics: PayoutMetrics | null = selectedAccountId && accounts && trades ? (() => {
    const account = accounts.find(a => a.id.toString() === selectedAccountId);
    if (!account) return null;

    const accountTrades = trades.filter(t => t.accountId === account.id);
    const netBalance = account.balance + accountTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const totalPnL = accountTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    
    // Group trades by date to count trading days
    const tradingDays = new Set(accountTrades.map(t => t.date)).size;
    
    // Calculate winning days above minimum
    const dailyPnL = new Map<string, number>();
    accountTrades.forEach(trade => {
      const date = trade.date;
      dailyPnL.set(date, (dailyPnL.get(date) || 0) + (trade.pnl || 0));
    });
    
    const winningDaysAboveMinimum = Array.from(dailyPnL.values())
      .filter(pnl => pnl >= (account.winningDayMinimum || 200)).length;
    
    const meetsTradingDays = tradingDays >= (account.daysRequiredForPayout || 5);
    const meetsWinningDays = winningDaysAboveMinimum >= (account.daysRequiredForPayout || 5);
    
    // Calculate available payout based on account rules
    let availablePayout = 0;
    if (account.type === 'live' || account.type === 'funded') {
      if (account.maxNetBalanceForPayout && netBalance > account.maxNetBalanceForPayout) {
        const excessBalance = netBalance - account.maxNetBalanceForPayout;
        const minimumRequired = account.minimumPayoutAmount || 500;
        if (excessBalance >= minimumRequired) {
          availablePayout = Math.floor(excessBalance * (account.profitSplit || 80) / 100);
        }
      }
    }

    return {
      availablePayout,
      totalEarnings: Math.max(0, totalPnL),
      totalPayouts: 0, // Would come from payout history
      meetsTradingDaysRule: meetsTradingDays,
      meetsWinningDaysRule: meetsWinningDays,
      profitableDaysAboveMinimum: winningDaysAboveMinimum,
      consistencyRulePercent: account.consistencyRulePercent || null,
      daysTraded: tradingDays,
      requiredTradingDays: account.daysRequiredForPayout || 5,
      winningDayMinimum: account.winningDayMinimum || 200,
      minimumPayoutAmount: account.minimumPayoutAmount || 500,
      nextPayoutDate: null // Would be calculated based on payout frequency
    };
  })() : null;

  // Mock payout history for demonstration
  const payoutHistory: PayoutHistory[] = [
    {
      id: 1,
      date: '2025-01-15',
      amount: 1250,
      status: 'received',
      type: 'weekly',
      method: 'Bank Transfer',
      requestedDate: '2025-01-10',
      approvedDate: '2025-01-12',
      receivedDate: '2025-01-15'
    },
    {
      id: 2,
      date: '2025-01-08',
      amount: 875,
      status: 'approved',
      type: 'weekly',
      method: 'PayPal',
      requestedDate: '2025-01-05',
      approvedDate: '2025-01-08'
    }
  ];

  const requirements = payoutMetrics ? [
    { 
      name: 'Minimum Trading Days', 
      current: payoutMetrics.daysTraded, 
      required: payoutMetrics.requiredTradingDays, 
      completed: payoutMetrics.meetsTradingDaysRule,
      description: `Must trade at least ${payoutMetrics.requiredTradingDays} days`
    },
    { 
      name: 'Winning Days Rule', 
      current: payoutMetrics.profitableDaysAboveMinimum, 
      required: payoutMetrics.requiredTradingDays, 
      completed: payoutMetrics.meetsWinningDaysRule,
      description: `Need ${payoutMetrics.requiredTradingDays} days with $${payoutMetrics.winningDayMinimum}+ profit`
    },
    { 
      name: 'Available Balance', 
      current: payoutMetrics.availablePayout, 
      required: payoutMetrics.minimumPayoutAmount, 
      completed: payoutMetrics.availablePayout >= payoutMetrics.minimumPayoutAmount,
      description: `Minimum payout amount: $${payoutMetrics.minimumPayoutAmount}`
    }
  ] : [];

  const eligibilityScore = requirements.length > 0 ? 
    (requirements.filter(req => req.completed).length / requirements.length) * 100 : 0;

  const selectedAccount = accounts?.find(a => a.id.toString() === selectedAccountId);

  return (
    <div className="space-y-6 bg-black min-h-screen p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Payouts</h1>
          <p className="text-gray-400">Manage your trading profits and payout requests</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-64 bg-gray-800 border-yellow-400/20 text-white">
              <SelectValue placeholder="Select account for payouts" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-yellow-400/20">
              {accounts?.filter(account => account.type === 'live' || account.type === 'funded').map((account) => (
                <SelectItem key={account.id} value={account.id.toString()}>
                  {account.name} - {account.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700" 
                disabled={!payoutMetrics || payoutMetrics.availablePayout < payoutMetrics.minimumPayoutAmount}
              >
                <Send className="w-4 h-4 mr-2" />
                Request Payout
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
              <DialogHeader>
                <DialogTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Request New Payout</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-white">Payout Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder={`Min: ${formatCurrency(payoutMetrics?.minimumPayoutAmount || 500)}`}
                      value={payoutAmount || ''}
                      onChange={(e) => setPayoutAmount(Number(e.target.value))}
                      max={payoutMetrics?.availablePayout || 0}
                      className="bg-gray-800 border-yellow-400/20 text-white"
                    />
                    <p className="text-xs text-gray-400">
                      Available: {formatCurrency(payoutMetrics?.availablePayout || 0)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="method" className="text-white">Payout Method</Label>
                    <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                      <SelectTrigger className="bg-gray-800 border-yellow-400/20 text-white">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-yellow-400/20">
                        <SelectItem value="bank">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Bank Transfer
                          </div>
                        </SelectItem>
                        <SelectItem value="paypal">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            PayPal
                          </div>
                        </SelectItem>
                        <SelectItem value="wise">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Wise
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700"
                  disabled={!payoutAmount || !payoutMethod || (payoutMetrics && payoutAmount < payoutMetrics.minimumPayoutAmount)}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Payout Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!selectedAccountId && (
        <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="w-16 h-16 text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Select an Account</h3>
            <p className="text-gray-400 text-center">
              Choose a funded or live account to view payout information and manage withdrawals.
            </p>
          </CardContent>
        </Card>
      )}

      {selectedAccountId && payoutMetrics && (
        <>
          {/* Payout Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Balance</CardTitle>
                <Wallet className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400">
                  {formatCurrency(selectedAccount?.balance || 0)}
                </div>
                <p className="text-xs text-gray-400">Current account balance</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Available Payout</CardTitle>
                <DollarSign className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  {formatCurrency(payoutMetrics.availablePayout)}
                </div>
                <p className="text-xs text-gray-400">{selectedAccount?.profitSplit || 80}% profit split</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Pending Payouts</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">
                  {formatCurrency(payoutHistory.filter(p => p.status === 'requested' || p.status === 'approved').reduce((sum, p) => sum + p.amount, 0))}
                </div>
                <p className="text-xs text-gray-400">Processing</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Received</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">
                  {formatCurrency(payoutHistory.filter(p => p.status === 'received').reduce((sum, p) => sum + p.amount, 0))}
                </div>
                <p className="text-xs text-gray-400">All time payouts</p>
              </CardContent>
            </Card>
          </div>

          {/* Payout Eligibility */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                <CheckCircle className="h-5 w-5 text-yellow-400" />
                Payout Eligibility Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400 mb-2">{eligibilityScore.toFixed(0)}%</div>
                  <Badge className={`${eligibilityScore === 100 ? 'bg-green-400/20 text-green-400 border-green-400' : 'bg-yellow-400/20 text-yellow-400 border-yellow-400'}`}>
                    {eligibilityScore === 100 ? 'Fully Eligible' : 'Partially Eligible'}
                  </Badge>
                  <Progress value={eligibilityScore} className="mt-4 h-3" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {requirements.map((req, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 border border-gray-700">
                      <div className="flex items-center gap-3">
                        {req.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        )}
                        <div>
                          <span className="font-medium text-white">{req.name}</span>
                          <p className="text-xs text-gray-400">{req.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">
                          {req.name === 'Available Balance' ? formatCurrency(req.current) : req.current}
                        </div>
                        <div className="text-xs text-gray-400">
                          of {req.name === 'Available Balance' ? formatCurrency(req.required) : req.required}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payout History */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                <Calendar className="h-5 w-5 text-yellow-400" />
                Payout History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payoutHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No payout history yet</p>
                    <p className="text-gray-500 text-sm">Your payout requests will appear here</p>
                  </div>
                ) : (
                  payoutHistory.map((payout, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30 border border-gray-700">
                      <div className="flex items-center gap-3">
                        {payout.status === 'received' ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : payout.status === 'approved' ? (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        ) : payout.status === 'rejected' ? (
                          <XCircle className="h-5 w-5 text-red-400" />
                        ) : (
                          <Clock className="h-5 w-5 text-blue-400" />
                        )}
                        <div>
                          <div className="font-medium text-white">{formatCurrency(payout.amount)}</div>
                          <div className="text-sm text-gray-400">{formatDate(payout.date)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={`
                          ${payout.status === 'received' ? 'text-green-400 border-green-400' : ''}
                          ${payout.status === 'approved' ? 'text-yellow-400 border-yellow-400' : ''}
                          ${payout.status === 'rejected' ? 'text-red-400 border-red-400' : ''}
                          ${payout.status === 'requested' ? 'text-blue-400 border-blue-400' : ''}
                        `}>
                          {payout.status}
                        </Badge>
                        <div className="text-sm text-gray-400 mt-1">{payout.method}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}


    </div>
  );
}