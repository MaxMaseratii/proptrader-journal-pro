import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Account, Trade } from '@shared/schema';
import { AccountCreationModal } from '@/components/AccountCreationModal';
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

export default function Accounts() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [visibleAccounts, setVisibleAccounts] = useState<Set<number>>(new Set());

  // Fetch accounts
  const { data: accounts, isLoading } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
    queryFn: async () => {
      const response = await fetch('/api/accounts');
      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }
      return response.json();
    },
  });

  // Fetch trades for performance calculation
  const { data: allTrades } = useQuery<Trade[]>({
    queryKey: ['/api/trades'],
    queryFn: async () => {
      const response = await fetch('/api/trades');
      if (!response.ok) {
        throw new Error('Failed to fetch trades');
      }
      return response.json();
    },
  });

  const toggleAccountVisibility = (accountId: number) => {
    const newVisibleAccounts = new Set(visibleAccounts);
    if (newVisibleAccounts.has(accountId)) {
      newVisibleAccounts.delete(accountId);
    } else {
      newVisibleAccounts.add(accountId);
    }
    setVisibleAccounts(newVisibleAccounts);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'passed': return 'text-blue-400';
      case 'failed': return 'text-red-400';
      case 'withdrawn': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'passed': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevel = (account: Account) => {
    if (!account.riskPerTrade || !account.maxDrawdown) return 'Low';
    const riskPercentage = (account.riskPerTrade / account.maxDrawdown) * 100;
    if (riskPercentage > 10) return 'High';
    if (riskPercentage > 5) return 'Medium';
    return 'Low';
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
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
          
          <Button 
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>

        {/* Accounts Grid */}
        {accounts && accounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <Card key={account.id} className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Wallet className="h-5 w-5 text-blue-400" />
                      <div>
                        <CardTitle className="text-white text-sm font-medium">
                          {account.name}
                        </CardTitle>
                        <p className="text-xs text-gray-400">{account.firm}</p>
                      </div>
                    </div>
                    <Badge className={`text-xs ${getStatusBadgeColor(account.status || 'active')}`}>
                      {account.status || 'Active'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Type</p>
                      <p className="text-sm font-medium text-white capitalize">{account.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Balance</p>
                      <p className="text-sm font-medium text-white">
                        {formatCurrency(account.startingBalance || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Profit Target</p>
                      <p className="text-sm font-medium text-green-400">
                        {formatCurrency(account.profitTarget || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Max Drawdown</p>
                      <p className="text-sm font-medium text-red-400">
                        {formatCurrency(account.maxDrawdown || 0)}
                      </p>
                    </div>
                  </div>

                  {account.riskPerTrade && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">Risk Per Trade</p>
                        <p className="text-sm font-medium text-white">
                          {formatCurrency(account.riskPerTrade)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Risk Level</p>
                        <p className={`text-sm font-medium ${getRiskLevelColor(getRiskLevel(account))}`}>
                          {getRiskLevel(account)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAccountVisibility(account.id)}
                        className="text-gray-400 hover:text-white"
                      >
                        {visibleAccounts.has(account.id) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Wallet className="mx-auto h-12 w-12 text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No accounts yet</h3>
            <p className="text-gray-400 mb-6">Get started by creating your first trading account</p>
            <Button 
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Account
            </Button>
          </div>
        )}

        {/* Account Creation Modal */}
        <AccountCreationModal 
          open={isCreateDialogOpen} 
          onOpenChange={setIsCreateDialogOpen} 
        />
      </div>
    </div>
  );
}