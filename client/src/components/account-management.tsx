import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RotateCcw, LogOut, Trash2, AlertTriangle, DollarSign, CheckCircle, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Account } from "@shared/schema";

interface AccountManagementProps {
  accounts: Account[];
}

export default function AccountManagement({ accounts }: AccountManagementProps) {
  // Get trades data to calculate P&L
  const { data: trades = [] } = useQuery({
    queryKey: ['/api/trades'],
  });
  const [resetCost, setResetCost] = useState(0);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isConversionDialogOpen, setIsConversionDialogOpen] = useState(false);
  const [selectedChallengeAccount, setSelectedChallengeAccount] = useState<Account | null>(null);
  const [fundedAccountSettings, setFundedAccountSettings] = useState({
    startingBalance: '',
    profitTarget: '',
    maxDrawdown: '',
    dailyLossLimit: '',
    daysRequiredForPayout: '',
    winningDayMinimum: '',
    profitSplit: '',
    payoutFrequency: 'weekly',
    maximumPayoutAmount: '',
    maximumPayoutPerAccount: '',
    minimumPayoutAmount: '',
    maxNetBalanceForPayout: '',
    consistencyRulePercent: ''
  });
  const [isLiveConversionDialogOpen, setIsLiveConversionDialogOpen] = useState(false);
  const [selectedFundedAccount, setSelectedFundedAccount] = useState<Account | null>(null);
  const [liveAccountSettings, setLiveAccountSettings] = useState({
    liveAccountType: 'prop_firm',
    profitSplit: '',
    payoutFrequency: 'on-demand',
    minimumPayoutAmount: '',
    maximumPayoutAmount: '',
    maximumPayoutPerAccount: '',
    restrictions: 'Standard prop firm live account restrictions apply'
  });
  const { toast } = useToast();

  const resetAccountMutation = useMutation({
    mutationFn: async ({ id, resetCost }: { id: number; resetCost: number }) => {
      return apiRequest("POST", `/api/accounts/${id}/reset`, { resetCost });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      setIsResetDialogOpen(false);
      setResetCost(0);
      toast({
        title: "Account Reset Successfully",
        description: "The account has been reset and PnL restarted from $0.",
      });
    },
    onError: () => {
      toast({
        title: "Reset Failed",
        description: "Failed to reset account. Please try again.",
        variant: "destructive",
      });
    }
  });

  const withdrawAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("POST", `/api/accounts/${id}/withdraw`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      toast({
        title: "Account Withdrawn",
        description: "The account has been marked as withdrawn.",
      });
    },
    onError: () => {
      toast({
        title: "Withdrawal Failed",
        description: "Failed to withdraw account. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/accounts/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      toast({
        title: "Account Deleted",
        description: "The account has been permanently deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    }
  });

  const convertToFundedMutation = useMutation({
    mutationFn: async (challengeAccountId: number) => {
      return apiRequest("POST", `/api/accounts/${challengeAccountId}/convert-to-funded`, {
        // Use configured funded account settings
        startingBalance: parseFloat(fundedAccountSettings.startingBalance) || 0,
        profitTarget: parseFloat(fundedAccountSettings.profitTarget) || 0,
        maxDrawdown: parseFloat(fundedAccountSettings.maxDrawdown) || 0,
        dailyLossLimit: parseFloat(fundedAccountSettings.dailyLossLimit) || 0,
        daysRequiredForPayout: parseFloat(fundedAccountSettings.daysRequiredForPayout) || 5,
        winningDayMinimum: parseFloat(fundedAccountSettings.winningDayMinimum) || 200,
        minimumPayoutAmount: parseFloat(fundedAccountSettings.minimumPayoutAmount) || 100,
        maxNetBalanceForPayout: parseFloat(fundedAccountSettings.maxNetBalanceForPayout) || 2000,
        consistencyRulePercent: parseFloat(fundedAccountSettings.consistencyRulePercent) || 50,
        payoutFrequency: fundedAccountSettings.payoutFrequency,
        maximumPayoutAmount: parseFloat(fundedAccountSettings.maximumPayoutAmount) || 5000,
        maximumPayoutPerAccount: parseFloat(fundedAccountSettings.maximumPayoutPerAccount) || 10000,
        profitSplit: parseFloat(fundedAccountSettings.profitSplit) || 80
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      setIsConversionDialogOpen(false);
      setSelectedChallengeAccount(null);
      toast({
        title: "Challenge Converted Successfully!",
        description: `Challenge account converted to funded account: ${data.fundedAccount.name}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Conversion Failed",
        description: error.message || "Failed to convert challenge account. Please try again.",
        variant: "destructive",
      });
    }
  });

  const convertToLiveMutation = useMutation({
    mutationFn: async (fundedAccountId: number) => {
      return apiRequest("POST", `/api/accounts/${fundedAccountId}/convert-to-live`, {
        // Use configured live account settings
        liveAccountType: liveAccountSettings.liveAccountType,
        profitSplit: parseFloat(liveAccountSettings.profitSplit) || 90,
        payoutFrequency: liveAccountSettings.payoutFrequency,
        minimumPayoutAmount: parseFloat(liveAccountSettings.minimumPayoutAmount) || 500,
        maximumPayoutAmount: parseFloat(liveAccountSettings.maximumPayoutAmount) || 10000,
        maximumPayoutPerAccount: parseFloat(liveAccountSettings.maximumPayoutPerAccount) || 25000,
        restrictions: liveAccountSettings.restrictions
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      setIsLiveConversionDialogOpen(false);
      setSelectedFundedAccount(null);
      toast({
        title: "Funded Account Converted to Live!",
        description: `Funded account converted to live account: ${data.liveAccount.name}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Live Conversion Failed",
        description: error.message || "Failed to convert funded account to live. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Generate lifecycle status label (C, C>F, C>F>L, CR1, CR2, DF, etc.)
  const getLifecycleLabel = (account: Account) => {
    const { accountSource, resetCount, type, lifecycleStatus } = account;
    
    // Handle direct funded accounts
    if (accountSource === 'direct_funded') {
      return type === 'funded' ? 'DF' : 'DF>L';
    }
    
    // Handle personal live accounts
    if (accountSource === 'personal_live') {
      return 'PL';
    }
    
    // Handle challenge-based accounts
    let label = '';
    
    // Add reset count if applicable
    if (resetCount > 0) {
      label = `CR${resetCount}`;
    } else {
      label = 'C';
    }
    
    // Add transitions for funded and live accounts
    if (type === 'funded') {
      label += '>F';
      if (resetCount > 0) {
        // If funded account is reset, it becomes FR1, FR2, etc.
        label = `${label.replace('>F', '')}>FR${resetCount}`;
      }
    } else if (type === 'live') {
      label += '>F>L';
    }
    
    return label;
  };

  // Get color for lifecycle label
  const getLifecycleLabelColor = (label: string) => {
    if (label.includes('CR') || label.includes('FR')) return 'text-orange-400';
    if (label.includes('DF')) return 'text-blue-400';
    if (label.includes('PL')) return 'text-yellow-400'; // Gold color for Personal Live
    if (label.includes('L')) return 'text-yellow-400'; // Yellow for Live
    if (label.includes('F')) return 'text-green-400'; // Green for Funded
    if (label.includes('C')) return 'text-blue-400'; // Blue for Challenge
    return 'text-gray-400';
  };

  // Check if challenge account is eligible for funded conversion
  const getChallengeEligibility = (account: Account) => {
    const accountTrades = trades.filter(trade => trade.accountId === account.id);
    const totalPnl = accountTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const netBalance = account.startingBalance + totalPnl;
    
    // Check if profit target is met
    const profitTargetMet = totalPnl >= (account.profitTarget || 0);
    
    // Check if minimum trading days requirement is met
    const uniqueTradingDays = new Set(accountTrades.map(trade => trade.date)).size;
    const minimumDaysMet = uniqueTradingDays >= (account.minimumTradingDays || 0);
    
    // Check if max drawdown isn't exceeded
    const maxDrawdownNotExceeded = netBalance >= (account.startingBalance - (account.maxDrawdown || 0));
    
    return {
      eligible: profitTargetMet && minimumDaysMet && maxDrawdownNotExceeded,
      profitTargetMet,
      minimumDaysMet,
      maxDrawdownNotExceeded,
      totalPnl,
      netBalance,
      uniqueTradingDays
    };
  };

  // Check if funded account is eligible for live conversion
  const getFundedAccountEligibility = (account: Account) => {
    const accountTrades = trades.filter(trade => trade.accountId === account.id);
    const totalPnl = accountTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const netBalance = account.startingBalance + totalPnl;
    
    // Check if live account transition profit target is met
    const profitTargetMet = totalPnl >= (account.liveAccountTransitionProfitTarget || 0);
    
    // Check if minimum trading days requirement is met
    const uniqueTradingDays = new Set(accountTrades.map(trade => trade.date)).size;
    const minimumDaysMet = uniqueTradingDays >= (account.liveAccountTransitionDays || 0);
    
    // Check if max drawdown during transition isn't exceeded
    const maxDrawdownNotExceeded = netBalance >= (account.startingBalance - (account.liveAccountTransitionDrawdownLimit || 0));
    
    return {
      eligible: profitTargetMet && minimumDaysMet && maxDrawdownNotExceeded,
      profitTargetMet,
      minimumDaysMet,
      maxDrawdownNotExceeded,
      totalPnl,
      netBalance,
      uniqueTradingDays
    };
  };



  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600 text-white">Active</Badge>;
      case 'passed':
        return <Badge className="bg-blue-600 text-white">Passed</Badge>;
      case 'failed':
        return <Badge className="bg-red-600 text-white">Failed</Badge>;
      case 'withdrawn':
        return <Badge className="bg-purple-600 text-white">Withdrawn</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMaxTradesIndicator = (account: Account) => {
    if (account.maxTradesPerDay && account.maxTradesPerDay > 0) {
      return (
        <div className="text-sm text-amber-400 flex items-center gap-1">
          <AlertTriangle className="h-4 w-4" />
          Max {account.maxTradesPerDay} trades/day
        </div>
      );
    }
    return (
      <div className="text-sm text-green-400">
        Unlimited trades/day
      </div>
    );
  };

  const shouldShowResetIndicator = (account: Account) => {
    return account.resetCount && account.resetCount > 0;
  };

  const getPayoutEligibility = (account: Account) => {
    // Challenge accounts: Cannot qualify for payout
    if (account.type === 'challenge') {
      return {
        eligible: false,
        reason: "Challenge accounts are not eligible for payout",
        color: "text-gray-400"
      };
    }

    // Only funded and live accounts are eligible for payouts
    if (account.type !== 'funded' && account.type !== 'live') {
      return {
        eligible: false,
        reason: "Account type not eligible for payouts",
        color: "text-gray-400"
      };
    }

    const currentProfit = 0; // P&L is calculated from trades, not stored in currentBalance
    const minimumPayoutAmount = account.minimumPayoutAmount || 0;
    const maxNetBalanceForPayout = account.maxNetBalanceForPayout;
    const daysRequiredForPayout = account.daysRequiredForPayout || 0;
    const payoutFrequency = account.payoutFrequency || 'monthly';

    // Check if profit exceeds max net balance (required first)
    if (maxNetBalanceForPayout && currentProfit <= maxNetBalanceForPayout) {
      return {
        eligible: false,
        reason: `Must exceed max net balance (${formatCurrency(maxNetBalanceForPayout)})`,
        color: "text-yellow-400"
      };
    }

    // Check minimum payout amount AFTER exceeding max net balance
    const totalRequiredProfit = (maxNetBalanceForPayout || 0) + minimumPayoutAmount;
    if (currentProfit < totalRequiredProfit) {
      return {
        eligible: false,
        reason: `Need ${formatCurrency(totalRequiredProfit)} total (${formatCurrency(maxNetBalanceForPayout || 0)} + ${formatCurrency(minimumPayoutAmount)})`,
        color: "text-yellow-400"
      };
    }

    // Funded accounts: Must meet buffer requirements and trading days
    if (account.type === 'funded') {
      const profitTarget = account.profitTarget || 0;
      const bufferAmount = profitTarget * ((account.bufferPercentage || 0) / 100);
      
      if (currentProfit >= bufferAmount && account.status === 'active') {
        return {
          eligible: true,
          reason: `Eligible for ${payoutFrequency} payout (${daysRequiredForPayout} days required)`,
          color: "text-green-400"
        };
      } else {
        return {
          eligible: false,
          reason: `Buffer requirement not met (Need: ${formatCurrency(bufferAmount)})`,
          color: "text-yellow-400"
        };
      }
    }

    // Live accounts: On-demand payout
    if (account.type === 'live') {
      if (currentProfit > 0 && account.status === 'active') {
        return {
          eligible: true,
          reason: `On-demand payout available (${payoutFrequency})`,
          color: "text-green-400"
        };
      } else {
        return {
          eligible: false,
          reason: "No profit available for payout",
          color: "text-gray-400"
        };
      }
    }

    return {
      eligible: false,
      reason: "Payout not available",
      color: "text-gray-400"
    };
  };

  if (!accounts || accounts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No accounts created yet. Create your first account to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {accounts.map((account) => (
        <Card key={account.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm text-white mb-1 truncate flex items-center gap-2">
                  <span>{account.name}</span>
                  <span className={`text-xs font-bold ${getLifecycleLabelColor(getLifecycleLabel(account))}`}>
                    {getLifecycleLabel(account)}
                  </span>
                </CardTitle>
                <div className="flex items-center gap-1 flex-wrap">
                  {getStatusBadge(account.status)}
                  <Badge variant="outline" className="text-xs text-blue-400 border-blue-400">
                    {account.firm}
                  </Badge>
                  {shouldShowResetIndicator(account) && (
                    <Badge className="bg-orange-600 text-white text-xs">
                      Reset #{account.resetCount}
                    </Badge>
                  )}
                  {account.type === 'challenge' && account.transitionStatus !== 'converted' && (() => {
                    const eligibility = getChallengeEligibility(account);
                    return eligibility.eligible && (
                      <Badge className="bg-green-600 text-white text-xs">
                        Ready for Funded!
                      </Badge>
                    );
                  })()}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Reset Account */}
                <Dialog open={isResetDialogOpen && selectedAccount?.id === account.id} onOpenChange={(open) => {
                  setIsResetDialogOpen(open);
                  if (open) setSelectedAccount(account);
                  else setSelectedAccount(null);
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white h-6 w-6 p-0"
                      disabled={account.status === 'withdrawn'}
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white flex items-center gap-2">
                        <RotateCcw className="h-5 w-5 text-orange-400" />
                        Reset Account
                      </DialogTitle>
                      <DialogDescription className="text-gray-300">
                        This will restart your account balance and reset all P&L calculations.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="bg-orange-900/30 border border-orange-600/30 rounded-lg p-4">
                        <p className="text-orange-300 text-sm">
                          This will restart your account balance to {formatCurrency(account.startingBalance)} 
                          and reset all PnL calculations. This action cannot be undone.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Reset Cost (optional)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={resetCost}
                          onChange={(e) => setResetCost(parseFloat(e.target.value) || 0)}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="0.00"
                        />
                        <p className="text-xs text-gray-400">
                          Enter the cost for resetting this account (if applicable)
                        </p>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsResetDialogOpen(false)}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => resetAccountMutation.mutate({ id: account.id, resetCost })}
                          disabled={resetAccountMutation.isPending}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          {resetAccountMutation.isPending ? "Resetting..." : "Reset Account"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Ready for Funded - Challenge to Funded Transition */}
                {account.type === 'challenge' && account.transitionStatus !== 'converted' && (() => {
                  const eligibility = getChallengeEligibility(account);
                  return eligibility.eligible && (
                    <Dialog open={isConversionDialogOpen && selectedChallengeAccount?.id === account.id} onOpenChange={(open) => {
                      setIsConversionDialogOpen(open);
                      if (open) setSelectedChallengeAccount(account);
                      else setSelectedChallengeAccount(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white h-6 w-6 p-0"
                          disabled={account.status === 'withdrawn'}
                          title="Ready for Funded"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900 border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="text-white flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            Convert Challenge to Funded Account
                          </DialogTitle>
                          <DialogDescription className="text-gray-300">
                            Configure the payout settings for your new funded account.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="bg-green-900/30 border border-green-600/30 rounded-lg p-4">
                            <p className="text-green-300 text-sm">
                              This challenge account has met all requirements and is ready to be converted to a funded account.
                            </p>
                          </div>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-gray-300">Starting Balance ($)</Label>
                                <Input
                                  type="number"
                                  value={fundedAccountSettings.startingBalance}
                                  onChange={(e) => setFundedAccountSettings({
                                    ...fundedAccountSettings,
                                    startingBalance: e.target.value
                                  })}
                                  className="bg-gray-700 border-gray-600 text-white"
                                  placeholder="0"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-300">Profit Target ($)</Label>
                                <Input
                                  type="number"
                                  value={fundedAccountSettings.profitTarget}
                                  onChange={(e) => setFundedAccountSettings({
                                    ...fundedAccountSettings,
                                    profitTarget: e.target.value
                                  })}
                                  className="bg-gray-700 border-gray-600 text-white"
                                  placeholder="0"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-300">Max Drawdown ($)</Label>
                                <Input
                                  type="number"
                                  value={fundedAccountSettings.maxDrawdown}
                                  onChange={(e) => setFundedAccountSettings({
                                    ...fundedAccountSettings,
                                    maxDrawdown: e.target.value
                                  })}
                                  className="bg-gray-700 border-gray-600 text-white"
                                  placeholder="0"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-300">Daily Loss Limit ($)</Label>
                                <Input
                                  type="number"
                                  value={fundedAccountSettings.dailyLossLimit}
                                  onChange={(e) => setFundedAccountSettings({
                                    ...fundedAccountSettings,
                                    dailyLossLimit: e.target.value
                                  })}
                                  className="bg-gray-700 border-gray-600 text-white"
                                  placeholder="0"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-300">Days Required for Payout</Label>
                                <Input
                                  type="number"
                                  value={fundedAccountSettings.daysRequiredForPayout}
                                  onChange={(e) => setFundedAccountSettings({
                                    ...fundedAccountSettings,
                                    daysRequiredForPayout: e.target.value
                                  })}
                                  className="bg-gray-700 border-gray-600 text-white"
                                  placeholder="5"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-300">Minimum Winning Day ($)</Label>
                                <Input
                                  type="number"
                                  value={fundedAccountSettings.winningDayMinimum}
                                  onChange={(e) => setFundedAccountSettings({
                                    ...fundedAccountSettings,
                                    winningDayMinimum: e.target.value
                                  })}
                                  className="bg-gray-700 border-gray-600 text-white"
                                  placeholder="200"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-300">Profit Split (%)</Label>
                                <Input
                                  type="number"
                                  value={fundedAccountSettings.profitSplit}
                                  onChange={(e) => setFundedAccountSettings({
                                    ...fundedAccountSettings,
                                    profitSplit: e.target.value
                                  })}
                                  className="bg-gray-700 border-gray-600 text-white"
                                  placeholder="80"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-300">Maximum Payout Allowed ($)</Label>
                                <Input
                                  type="number"
                                  value={fundedAccountSettings.maximumPayoutAmount}
                                  onChange={(e) => setFundedAccountSettings({
                                    ...fundedAccountSettings,
                                    maximumPayoutAmount: e.target.value
                                  })}
                                  className="bg-gray-700 border-gray-600 text-white"
                                  placeholder="5000"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-300">Maximum Payout Per Account ($)</Label>
                                <Input
                                  type="number"
                                  value={fundedAccountSettings.maximumPayoutPerAccount}
                                  onChange={(e) => setFundedAccountSettings({
                                    ...fundedAccountSettings,
                                    maximumPayoutPerAccount: e.target.value
                                  })}
                                  className="bg-gray-700 border-gray-600 text-white"
                                  placeholder="10000"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-300">Minimum Payout Amount ($)</Label>
                                <Input
                                  type="number"
                                  value={fundedAccountSettings.minimumPayoutAmount}
                                  onChange={(e) => setFundedAccountSettings({
                                    ...fundedAccountSettings,
                                    minimumPayoutAmount: e.target.value
                                  })}
                                  className="bg-gray-700 border-gray-600 text-white"
                                  placeholder="100"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-300">Max Net Balance for Payout ($)</Label>
                                <Input
                                  type="number"
                                  value={fundedAccountSettings.maxNetBalanceForPayout}
                                  onChange={(e) => setFundedAccountSettings({
                                    ...fundedAccountSettings,
                                    maxNetBalanceForPayout: e.target.value
                                  })}
                                  className="bg-gray-700 border-gray-600 text-white"
                                  placeholder="2000"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-300">Consistency Rules Percentage (%)</Label>
                                <Input
                                  type="number"
                                  value={fundedAccountSettings.consistencyRulePercent}
                                  onChange={(e) => setFundedAccountSettings({
                                    ...fundedAccountSettings,
                                    consistencyRulePercent: e.target.value
                                  })}
                                  className="bg-gray-700 border-gray-600 text-white"
                                  placeholder="50"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-gray-300">Payout Frequency</Label>
                              <Select value={fundedAccountSettings.payoutFrequency} onValueChange={(value) => 
                                setFundedAccountSettings({
                                  ...fundedAccountSettings,
                                  payoutFrequency: value
                                })
                              }>
                                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-700 border-gray-600">
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                  <SelectItem value="on-demand">On-demand</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex justify-end gap-3">
                            <Button 
                              variant="outline" 
                              onClick={() => setIsConversionDialogOpen(false)}
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={() => convertToFundedMutation.mutate(account.id)}
                              disabled={convertToFundedMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {convertToFundedMutation.isPending ? "Converting..." : "Convert to Funded"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  );
                })()}

                {/* Ready for Live Account - Funded to Live Transition */}
                {account.type === 'funded' && account.liveAccountTransitionEnabled && (() => {
                  const fundedEligibility = getFundedAccountEligibility(account);
                  return fundedEligibility.eligible && (
                    <Dialog open={isLiveConversionDialogOpen && selectedFundedAccount?.id === account.id} onOpenChange={(open) => {
                      setIsLiveConversionDialogOpen(open);
                      if (open) setSelectedFundedAccount(account);
                      else setSelectedFundedAccount(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white h-6 w-6 p-0"
                          disabled={account.status === 'withdrawn'}
                          title="Ready for Live Account"
                        >
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900 border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="text-white flex items-center gap-2">
                            <ArrowRight className="h-5 w-5 text-yellow-400" />
                            Convert Funded to Live Account
                          </DialogTitle>
                          <DialogDescription className="text-gray-300">
                            Configure the payout settings for your new live account.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="bg-yellow-900/30 border border-yellow-600/30 rounded-lg p-4">
                            <p className="text-yellow-300 text-sm">
                              This funded account has met all requirements and is ready to be converted to a live account.
                            </p>
                          </div>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-gray-300">Account Type</Label>
                                <Select value={liveAccountSettings.liveAccountType} onValueChange={(value) => 
                                  setLiveAccountSettings({
                                    ...liveAccountSettings,
                                    liveAccountType: value
                                  })
                                }>
                                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-700 border-gray-600">
                                    <SelectItem value="prop_firm">Prop Firm Live</SelectItem>
                                    <SelectItem value="personal_live">Personal Live</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-gray-300">Profit Split (%)</Label>
                                <Input
                                  type="number"
                                  value={liveAccountSettings.profitSplit}
                                  onChange={(e) => setLiveAccountSettings({
                                    ...liveAccountSettings,
                                    profitSplit: e.target.value
                                  })}
                                  className="bg-gray-700 border-gray-600 text-white"
                                  placeholder="90"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-300">Minimum Payout Amount ($)</Label>
                                <Input
                                  type="number"
                                  value={liveAccountSettings.minimumPayoutAmount}
                                  onChange={(e) => setLiveAccountSettings({
                                    ...liveAccountSettings,
                                    minimumPayoutAmount: e.target.value
                                  })}
                                  className="bg-gray-700 border-gray-600 text-white"
                                  placeholder="500"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-300">Maximum Payout Allowed ($)</Label>
                                <Input
                                  type="number"
                                  value={liveAccountSettings.maximumPayoutAmount}
                                  onChange={(e) => setLiveAccountSettings({
                                    ...liveAccountSettings,
                                    maximumPayoutAmount: e.target.value
                                  })}
                                  className="bg-gray-700 border-gray-600 text-white"
                                  placeholder="10000"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-300">Maximum Payout Per Account ($)</Label>
                                <Input
                                  type="number"
                                  value={liveAccountSettings.maximumPayoutPerAccount}
                                  onChange={(e) => setLiveAccountSettings({
                                    ...liveAccountSettings,
                                    maximumPayoutPerAccount: e.target.value
                                  })}
                                  className="bg-gray-700 border-gray-600 text-white"
                                  placeholder="25000"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-gray-300">Payout Frequency</Label>
                              <Select value={liveAccountSettings.payoutFrequency} onValueChange={(value) => 
                                setLiveAccountSettings({
                                  ...liveAccountSettings,
                                  payoutFrequency: value
                                })
                              }>
                                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-700 border-gray-600">
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                  <SelectItem value="on-demand">On-demand</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex justify-end gap-3">
                            <Button 
                              variant="outline" 
                              onClick={() => setIsLiveConversionDialogOpen(false)}
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={() => convertToLiveMutation.mutate(account.id)}
                              disabled={convertToLiveMutation.isPending}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white"
                            >
                              {convertToLiveMutation.isPending ? "Converting..." : "Convert to Live"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  );
                })()}

                {/* Withdraw Account */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white h-6 w-6 p-0"
                      disabled={account.status === 'withdrawn'}
                    >
                      <LogOut className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-gray-900 border-gray-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white flex items-center gap-2">
                        <LogOut className="h-5 w-5 text-purple-400" />
                        Withdraw Account
                      </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-300">
                    This will mark the account as "Withdrawn" and stop active trading. 
                    You can reactivate it later if needed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => withdrawAccountMutation.mutate(account.id)}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Withdraw Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Convert to Funded Account - only show for eligible challenge accounts */}
            {account.type === 'challenge' && account.transitionStatus !== 'converted' && (() => {
              const eligibility = getChallengeEligibility(account);
              return eligibility.eligible && (
                <Dialog open={isConversionDialogOpen && selectedChallengeAccount?.id === account.id} onOpenChange={(open) => {
                  setIsConversionDialogOpen(open);
                  if (open) setSelectedChallengeAccount(account);
                  else setSelectedChallengeAccount(null);
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white h-6 w-6 p-0"
                      title="Convert to Funded Account"
                    >
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        Convert Challenge to Funded Account
                      </DialogTitle>
                      <DialogDescription className="text-gray-300">
                        Convert your passed challenge account to a funded account with new trading rules and payout eligibility.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="bg-green-900/30 border border-green-600/30 rounded-lg p-4">
                        <p className="text-green-300 text-sm">
                          🎉 Congratulations! Your challenge account has passed all requirements and is ready to be converted to a funded account.
                        </p>
                      </div>
                      
                      <div className="bg-gray-800 p-4 rounded-lg space-y-4">
                        <h4 className="text-white font-semibold">Configure Funded Account Settings:</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-300">Starting Balance ($)</Label>
                            <Input
                              type="number"
                              value={fundedAccountSettings.startingBalance}
                              onChange={(e) => setFundedAccountSettings({...fundedAccountSettings, startingBalance: parseFloat(e.target.value) || 50000})}
                              className="bg-gray-700 border-gray-600 text-white"
                              placeholder="50000"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-300">Profit Target ($)</Label>
                            <Input
                              type="number"
                              value={fundedAccountSettings.profitTarget}
                              onChange={(e) => setFundedAccountSettings({...fundedAccountSettings, profitTarget: parseFloat(e.target.value) || 2500})}
                              className="bg-gray-700 border-gray-600 text-white"
                              placeholder="2500"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-300">Max Drawdown ($)</Label>
                            <Input
                              type="number"
                              value={fundedAccountSettings.maxDrawdown}
                              onChange={(e) => setFundedAccountSettings({...fundedAccountSettings, maxDrawdown: parseFloat(e.target.value) || 4000})}
                              className="bg-gray-700 border-gray-600 text-white"
                              placeholder="4000"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-300">Daily Loss Limit ($)</Label>
                            <Input
                              type="number"
                              value={fundedAccountSettings.dailyLossLimit}
                              onChange={(e) => setFundedAccountSettings({...fundedAccountSettings, dailyLossLimit: parseFloat(e.target.value) || 2000})}
                              className="bg-gray-700 border-gray-600 text-white"
                              placeholder="2000"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-300">Profit Split (%)</Label>
                            <Input
                              type="number"
                              value={fundedAccountSettings.profitSplit}
                              onChange={(e) => setFundedAccountSettings({...fundedAccountSettings, profitSplit: parseFloat(e.target.value) || 80})}
                              className="bg-gray-700 border-gray-600 text-white"
                              placeholder="80"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-300">Payout Frequency</Label>
                            <Select value={fundedAccountSettings.payoutFrequency} onValueChange={(value) => setFundedAccountSettings({...fundedAccountSettings, payoutFrequency: value})}>
                              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-700 border-gray-600">
                                <SelectItem value="daily" className="text-white hover:bg-gray-600">Daily</SelectItem>
                                <SelectItem value="weekly" className="text-white hover:bg-gray-600">Weekly</SelectItem>
                                <SelectItem value="bi-weekly" className="text-white hover:bg-gray-600">Bi-Weekly</SelectItem>
                                <SelectItem value="monthly" className="text-white hover:bg-gray-600">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsConversionDialogOpen(false)}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => convertToFundedMutation.mutate(account.id)}
                          disabled={convertToFundedMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {convertToFundedMutation.isPending ? "Converting..." : "Convert to Funded Account"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })()}

            {/* Convert to Live Account (for funded accounts) */}
            {account.type === 'funded' && (
              <Dialog open={isLiveConversionDialogOpen && selectedFundedAccount?.id === account.id} onOpenChange={(open) => {
                setIsLiveConversionDialogOpen(open);
                if (open) setSelectedFundedAccount(account);
                else setSelectedFundedAccount(null);
              }}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white h-6 w-6 p-0"
                  >
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                      <ArrowRight className="h-5 w-5 text-purple-400" />
                      Convert to Live Account
                    </DialogTitle>
                    <DialogDescription className="text-gray-300">
                      Convert your funded account to a live account with enhanced payout conditions and trading freedom.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="bg-purple-900/30 border border-purple-600/30 rounded-lg p-4">
                      <p className="text-purple-300 text-sm">
                        🎉 Convert your funded account to a live account with enhanced payout conditions and trading freedom.
                      </p>
                    </div>
                    
                    <div className="bg-gray-800 p-4 rounded-lg space-y-4">
                      <h4 className="text-white font-semibold">Configure Live Account Settings:</h4>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label className="text-gray-300">Account Type</Label>
                          <Select value={liveAccountSettings.liveAccountType} onValueChange={(value) => setLiveAccountSettings({...liveAccountSettings, liveAccountType: value})}>
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                              <SelectItem value="prop_firm" className="text-white hover:bg-gray-600">Prop Firm Live</SelectItem>
                              <SelectItem value="personal_live" className="text-white hover:bg-gray-600">Personal Live</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="text-gray-300">Enhanced Profit Split (%)</Label>
                          <Input
                            type="number"
                            value={liveAccountSettings.profitSplit}
                            onChange={(e) => setLiveAccountSettings({...liveAccountSettings, profitSplit: parseFloat(e.target.value) || 90})}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="90"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-gray-300">Payout Frequency</Label>
                          <Select value={liveAccountSettings.payoutFrequency} onValueChange={(value) => setLiveAccountSettings({...liveAccountSettings, payoutFrequency: value})}>
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                              <SelectItem value="on-demand" className="text-white hover:bg-gray-600">On-Demand</SelectItem>
                              <SelectItem value="daily" className="text-white hover:bg-gray-600">Daily</SelectItem>
                              <SelectItem value="weekly" className="text-white hover:bg-gray-600">Weekly</SelectItem>
                              <SelectItem value="bi-weekly" className="text-white hover:bg-gray-600">Bi-Weekly</SelectItem>
                              <SelectItem value="monthly" className="text-white hover:bg-gray-600">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="text-gray-300">Minimum Payout Amount ($)</Label>
                          <Input
                            type="number"
                            value={liveAccountSettings.minimumPayoutAmount}
                            onChange={(e) => setLiveAccountSettings({...liveAccountSettings, minimumPayoutAmount: parseFloat(e.target.value) || 500})}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="500"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-gray-300">Trading Restrictions</Label>
                          <Input
                            value={liveAccountSettings.restrictions}
                            onChange={(e) => setLiveAccountSettings({...liveAccountSettings, restrictions: e.target.value})}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Standard prop firm live account restrictions apply"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsLiveConversionDialogOpen(false)}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => convertToLiveMutation.mutate(account.id)}
                        disabled={convertToLiveMutation.isPending}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {convertToLiveMutation.isPending ? "Converting..." : "Convert to Live Account"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Delete Account */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-900 border-gray-700">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white flex items-center gap-2">
                    <Trash2 className="h-5 w-5 text-red-400" />
                    Delete Account
                  </AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-300">
                        This will permanently delete the account and all associated trades, 
                        journal entries, and statistics. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => deleteAccountMutation.mutate(account.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-2 pb-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Balance</span>
                <span className="text-sm font-semibold text-white">
                  {formatCurrency(account.startingBalance)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Target</span>
                <span className="text-sm font-semibold text-green-400">
                  {formatCurrency(account.profitTarget)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Max DD</span>
                <span className="text-sm font-semibold text-red-400">
                  {formatCurrency(account.maxDrawdown)}
                </span>
              </div>
              {account.dailyLossLimit && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">Daily Limit</span>
                  <span className="text-sm font-semibold text-orange-400">
                    {formatCurrency(account.dailyLossLimit)}
                  </span>
                </div>
              )}
              
              {account.accountCost && (
                <div className="flex justify-between items-center pt-1 border-t border-gray-700">
                  <span className="text-gray-400 text-xs">Cost</span>
                  <span className="text-xs text-gray-300">{formatCurrency(account.accountCost)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}