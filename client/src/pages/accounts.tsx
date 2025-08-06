import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Account, Trade } from '@shared/schema';
import { insertAccountSchema, type InsertAccount } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { z } from 'zod';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Wallet, 
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';



interface AccountMetrics {
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  drawdown: number;
  riskLevel: string;
  daysActive: number;
  lastTradeDate: string;
  isActive: boolean;
}

export default function AccountManagement() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showBalance, setShowBalance] = useState<Record<number, boolean>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  const { data: trades = [] } = useQuery<Trade[]>({
    queryKey: ['/api/trades'],
  });





  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertAccount> }) => {
      return apiRequest(`/api/accounts/${id}`, 'PATCH', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      setIsEditDialogOpen(false);
      setEditingAccount(null);
      toast({
        title: 'Account Updated',
        description: 'Your account has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update account.',
        variant: 'destructive',
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/accounts/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      toast({
        title: 'Account Deleted',
        description: 'Account has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete account.',
        variant: 'destructive',
      });
    },
  });

  const calculateAccountMetrics = (account: Account): AccountMetrics => {
    const accountTrades = trades.filter(trade => trade.accountId === account.id);
    const totalPnL = accountTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const winningTrades = accountTrades.filter(trade => (trade.pnl || 0) > 0).length;
    const winRate = accountTrades.length > 0 ? (winningTrades / accountTrades.length) * 100 : 0;
    
    const currentBalance = account.startingBalance + totalPnL;
    const drawdownAmount = Math.max(0, account.startingBalance - currentBalance);
    const drawdownPercent = account.startingBalance > 0 ? (drawdownAmount / account.startingBalance) * 100 : 0;
    
    const lastTrade = accountTrades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const lastTradeDate = lastTrade ? lastTrade.date : 'Never';
    
    const daysSinceStart = Math.ceil((new Date().getTime() - new Date(account.createdAt || new Date()).getTime()) / (1000 * 60 * 60 * 24));
    
    let riskLevel = 'Low';
    if (drawdownPercent > 8) riskLevel = 'High';
    else if (drawdownPercent > 5) riskLevel = 'Medium';
    
    return {
      totalPnL,
      winRate,
      totalTrades: accountTrades.length,
      drawdown: drawdownPercent,
      riskLevel,
      daysActive: daysSinceStart,
      lastTradeDate,
      isActive: true,
    };
  };



  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setIsEditDialogOpen(true);
  };

  const handleUpdateAccount = (data: InsertAccount) => {
    if (!editingAccount) return;
    updateAccountMutation.mutate({ id: editingAccount.id, data });
  };

  const toggleBalanceVisibility = (accountId: number) => {
    setShowBalance(prev => ({ ...prev, [accountId]: !prev[accountId] }));
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'live': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'demo': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'paper': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'challenge': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'High': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg text-white p-6 flex items-center justify-center">
        <div className="text-white text-xl">Loading accounts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-rainbow">
              Account Management
            </h1>
            <p className="text-gray-400 mt-2">Manage your trading accounts and monitor performance</p>
          </div>
        </div>

        {accounts.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Wallet className="mx-auto h-16 w-16 text-gray-500 mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">No Trading Accounts</h3>
              <p className="text-gray-500 mb-4">Accounts can be created from the Dashboard</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => {
              const metrics = calculateAccountMetrics(account);
              const isBalanceVisible = showBalance[account.id];
              
              return (
                <Card key={account.id} className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={getAccountTypeColor(account.type)}>
                          {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBalanceVisibility(account.id)}
                        className="text-gray-400 hover:text-white h-8 w-8 p-0"
                      >
                        {isBalanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <CardTitle className="text-white">{account.name}</CardTitle>
                    {account.firm && (
                      <p className="text-sm text-gray-400">{account.firm}</p>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Current Balance</p>
                        <p className="text-lg font-semibold text-white">
                          {isBalanceVisible ? formatCurrency(account.startingBalance + metrics.totalPnL) : '••••••'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Total P&L</p>
                        <p className={`text-lg font-semibold ${metrics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {isBalanceVisible ? formatCurrency(metrics.totalPnL) : '••••••'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Win Rate</p>
                        <p className="text-sm font-medium text-white">
                          {formatPercentage(metrics.winRate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Trades</p>
                        <p className="text-sm font-medium text-white">
                          {metrics.totalTrades}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Drawdown</p>
                        <p className="text-sm font-medium text-white">
                          {formatPercentage(metrics.drawdown)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Risk Level</p>
                        <p className={`text-sm font-medium ${getRiskLevelColor(metrics.riskLevel)}`}>
                          {metrics.riskLevel}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                      <div className="text-xs text-gray-400">
                        Days Active: {metrics.daysActive}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAccount(account)}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 h-8"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteAccountMutation.mutate(account.id)}
                          className="border-red-600 text-red-400 hover:bg-red-900/20 h-8"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        
        {/* Edit Account Dialog - Keep this working */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Account</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update your account information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className="text-white">Account Name</Label>
                <Input id="edit-name" className="bg-gray-800 border-gray-600 text-white" />
              </div>
              <div>
                <Label htmlFor="edit-balance" className="text-white">Starting Balance</Label>
                <Input id="edit-balance" type="number" className="bg-gray-800 border-gray-600 text-white" />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button>Update</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
