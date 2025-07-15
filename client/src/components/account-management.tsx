import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
        // Default funded account settings
        startingBalance: 50000,
        profitTarget: 2500,
        maxDrawdown: 8,
        dailyLossLimit: 2000,
        daysRequiredForPayout: 5,
        winningDayMinimum: 200,
        minimumPayoutAmount: 100,
        maxNetBalanceForPayout: 2000,
        consistencyRulePercent: 50,
        payoutFrequency: 'weekly',
        maximumPayoutPercentage: 90,
        profitSplit: 80
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

  // Helper function to check if a challenge account is eligible for conversion
  const getChallengeEligibility = (account: Account) => {
    if (account.type !== 'challenge') return { eligible: false, reason: "Not a challenge account" };
    if (account.transitionStatus === 'converted') return { eligible: false, reason: "Already converted" };
    
    // Calculate total P&L from trades for this account
    const accountTrades = trades.filter(trade => trade.accountId === account.id);
    const totalPnl = accountTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const currentBalance = account.startingBalance + totalPnl;
    const profitTarget = account.profitTarget || 0;
    const profitRequired = account.startingBalance + profitTarget;
    
    if (currentBalance >= profitRequired) {
      return { eligible: true, reason: "Challenge passed! Ready to convert to funded account" };
    }
    
    return { 
      eligible: false, 
      reason: `Need $${(profitRequired - currentBalance).toFixed(2)} more to reach profit target` 
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
                <CardTitle className="text-sm text-white mb-1 truncate">{account.name}</CardTitle>
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
                    </DialogHeader>
                    <DialogDescription className="text-gray-300 sr-only">
                      Convert your passed challenge account to a funded account with new trading rules and payout eligibility.
                    </DialogDescription>
                    <div className="space-y-4">
                      <div className="bg-green-900/30 border border-green-600/30 rounded-lg p-4">
                        <p className="text-green-300 text-sm">
                          🎉 Congratulations! Your challenge account has passed all requirements and is ready to be converted to a funded account.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-white font-semibold">New Funded Account Settings:</h4>
                        <div className="text-sm text-gray-300 space-y-1">
                          <p>• Starting Balance: $50,000</p>
                          <p>• Profit Target: $2,500</p>
                          <p>• Max Drawdown: 8%</p>
                          <p>• Daily Loss Limit: $2,000</p>
                          <p>• Profit Split: 80% (you keep 80%)</p>
                          <p>• Payout Frequency: Weekly</p>
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