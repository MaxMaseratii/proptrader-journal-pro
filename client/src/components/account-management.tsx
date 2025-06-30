import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RotateCcw, LogOut, Trash2, AlertTriangle, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Account } from "@shared/schema";

interface AccountManagementProps {
  account: Account;
}

export default function AccountManagement({ account }: AccountManagementProps) {
  const [resetCost, setResetCost] = useState(0);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
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

  const getMaxTradesIndicator = () => {
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

  const shouldShowResetIndicator = () => {
    return account.resetCount && account.resetCount > 0;
  };

  const getPayoutEligibility = () => {
    // Challenge accounts: Cannot qualify for payout
    if (account.type === 'challenge') {
      return {
        eligible: false,
        reason: "Challenge accounts are not eligible for payout",
        color: "text-gray-400"
      };
    }

    // Funded accounts: Must meet buffer requirements
    if (account.type === 'funded') {
      const profitTarget = account.profitTarget || 0;
      const bufferAmount = profitTarget * ((account.bufferPercentage || 0) / 100);
      const currentProfit = account.currentBalance - account.startingBalance;
      
      if (currentProfit >= bufferAmount && account.status === 'active') {
        return {
          eligible: true,
          reason: `Eligible for payout (Buffer: ${formatCurrency(bufferAmount)} met)`,
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
      const currentProfit = account.currentBalance - account.startingBalance;
      if (currentProfit > 0 && account.status === 'active') {
        return {
          eligible: true,
          reason: "On-demand payout available",
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

  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-white mb-2">{account.name}</CardTitle>
            <div className="flex items-center gap-3">
              {getStatusBadge(account.status)}
              <Badge variant="outline" className="text-blue-400 border-blue-400">
                {account.firm}
              </Badge>
              {shouldShowResetIndicator() && (
                <Badge className="bg-orange-600 text-white">
                  Reset #{account.resetCount}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Reset Account */}
            <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white"
                  disabled={account.status === 'withdrawn'}
                >
                  <RotateCcw className="h-4 w-4" />
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
                  className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                  disabled={account.status === 'withdrawn'}
                >
                  <LogOut className="h-4 w-4" />
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
      
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Current Balance</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(account.currentBalance)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Profit Target</p>
            <p className="text-2xl font-bold text-green-400">
              {formatCurrency(account.profitTarget)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Max Drawdown</p>
            <p className="text-xl font-bold text-red-400">
              {formatCurrency(account.maxDrawdown)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Daily Loss Limit</p>
            <p className="text-xl font-bold text-orange-400">
              {account.dailyLossLimit ? formatCurrency(account.dailyLossLimit) : "None"}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700">
          {getMaxTradesIndicator()}
          
          {account.accountCost && (
            <div className="flex items-center justify-between mt-2 text-sm">
              <span className="text-gray-400">Account Cost:</span>
              <span className="text-white">{formatCurrency(account.accountCost)}</span>
            </div>
          )}
          
          {account.resetCount && account.resetCount > 0 && account.totalResetsCost && (
            <div className="flex items-center justify-between mt-1 text-sm">
              <span className="text-gray-400">Total Reset Costs:</span>
              <span className="text-orange-400">{formatCurrency(account.totalResetsCost)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}