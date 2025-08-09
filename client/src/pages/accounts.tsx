import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Account, Trade } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatPercentage } from '@/lib/utils';
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
  const [showBalance, setShowBalance] = useState<Record<number, boolean>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  const { data: trades = [] } = useQuery<Trade[]>({
    queryKey: ['/api/trades'],
  });

  const calculateAccountMetrics = (account: Account): AccountMetrics => {
    const accountTrades = trades.filter(trade => trade.accountId === account.id);
    const totalPnL = accountTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const winningTrades = accountTrades.filter(trade => (trade.pnl || 0) > 0);
    const winRate = accountTrades.length > 0 ? (winningTrades.length / accountTrades.length) * 100 : 0;
    
    const currentBalance = account.startingBalance + totalPnL;
    const drawdown = Math.max(0, account.startingBalance - currentBalance);
    const drawdownPercent = (drawdown / account.startingBalance) * 100;
    
    let riskLevel = 'Low';
    if (drawdownPercent > 50) riskLevel = 'High';
    else if (drawdownPercent > 25) riskLevel = 'Medium';
    
    const sortedTrades = accountTrades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastTradeDate = sortedTrades.length > 0 ? sortedTrades[0].date : account.createdAt?.toISOString() || '';
    const lastTradeTime = new Date(lastTradeDate).getTime();
    const now = new Date().getTime();
    const daysActive = Math.floor((now - lastTradeTime) / (1000 * 60 * 60 * 24));
    
    return {
      totalPnL,
      winRate,
      totalTrades: accountTrades.length,
      drawdown,
      riskLevel,
      daysActive,
      lastTradeDate,
      isActive: daysActive <= 7
    };
  };

  const deleteAccountMutation = useMutation({
    mutationFn: async (accountId: number) => {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete account');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      toast({
        title: "Account deleted",
        description: "Account has been successfully removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteAccount = (accountId: number) => {
    if (window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      deleteAccountMutation.mutate(accountId);
    }
  };

  const toggleBalanceVisibility = (accountId: number) => {
    setShowBalance(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
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
          
          <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>

        {accounts.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Wallet className="mx-auto h-16 w-16 text-gray-500 mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">No Trading Accounts</h3>
              <p className="text-gray-500 mb-4">Create your first trading account to start tracking performance</p>
              <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Account
              </Button>
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
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-white mb-1">
                          {account.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={account.type === 'live' ? 'default' : 'secondary'}
                            className={`text-xs ${
                              account.type === 'live' 
                                ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                : account.type === 'demo'
                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            }`}
                          >
                            {account.type.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                            {account.firm}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBalanceVisibility(account.id)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                        >
                          {isBalanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAccount(account.id)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Balance</p>
                        <p className="text-lg font-semibold text-white">
                          {isBalanceVisible ? formatCurrency(account.startingBalance + metrics.totalPnL) : '••••••'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">P&L</p>
                        <p className={`text-lg font-semibold ${metrics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {isBalanceVisible ? `${metrics.totalPnL >= 0 ? '+' : ''}${formatCurrency(metrics.totalPnL)}` : '••••••'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Win Rate</p>
                        <p className="text-sm font-medium text-white">{formatPercentage(metrics.winRate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Total Trades</p>
                        <p className="text-sm font-medium text-white">{metrics.totalTrades}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Risk Level</p>
                        <p className={`text-sm font-medium ${getRiskLevelColor(metrics.riskLevel)}`}>
                          {metrics.riskLevel}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Status</p>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${metrics.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                          <p className="text-sm font-medium text-white">
                            {metrics.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-700/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Target Progress</span>
                        <span className="text-xs text-gray-400">
                          {formatPercentage((metrics.totalPnL / account.profitTarget) * 100)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                        <div 
                          className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-300" 
                          style={{
                            width: `${Math.min(Math.max((metrics.totalPnL / account.profitTarget) * 100, 0), 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}