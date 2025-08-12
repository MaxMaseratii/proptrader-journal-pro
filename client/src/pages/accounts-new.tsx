import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import type { Account, Trade } from '@shared/schema';
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
  EyeOff,
  X
} from 'lucide-react';
import { useLocation } from 'wouter';

// Comprehensive schema for account creation form
const accountFormSchema = z.object({
  // Basic Info Tab
  name: z.string().min(1, 'Account name is required'),
  firm: z.string().min(1, 'Prop firm is required'),
  type: z.enum(['challenge', 'funded', 'live', 'demo']),
  status: z.enum(['active', 'inactive', 'pending']),
  startingBalance: z.number().min(0, 'Starting balance must be positive'),
  profitTarget: z.number().min(0, 'Profit target must be positive'),
  maxDrawdown: z.number().min(0, 'Max drawdown must be positive'),
  minimumTradingDays: z.number().min(1, 'Minimum trading days required'),
  timeLimit: z.number().min(1, 'Time limit required'),
  consistencyRule: z.number().min(0).max(100, 'Must be between 0-100%'),
  drawdownType: z.enum(['trailing', 'static', 'balance_based']),
  maxDrawdownType: z.enum(['EOD', 'real-time', 'session_close']),
  hasDailyLossLimit: z.boolean(),
  
  // Financial Tab
  accountCost: z.number().min(0, 'Account cost must be positive'),
  activationCost: z.number().min(0, 'Activation cost must be positive'),
  purchaseMethod: z.enum(['credit card', 'PayPal', 'bank transfer', 'crypto']),
  resetCount: z.number().min(0, 'Reset count must be positive'),
  totalResetsCost: z.number().min(0, 'Total resets cost must be positive'),
  profitSplit: z.number().min(0).max(100, 'Must be between 0-100%'),
  activationFeePaid: z.boolean(),
  includesActivationFee: z.boolean(),
  
  // Rules & Risk Tab
  riskPerTrade: z.number().min(0, 'Risk per trade must be positive'),
  riskPerTradeDivider: z.number().min(1, 'Divider must be at least 1'),
  dailyLossLimit: z.number().min(0, 'Daily loss limit must be positive'),
  riskRewardRatio: z.number().min(0.1, 'Risk reward ratio must be positive'),
  maxTradesPerDay: z.number().min(1, 'Must allow at least 1 trade per day'),
  maxRiskPerDay: z.number().min(0, 'Max risk per day must be positive'),
  stopLoss: z.number().min(0, 'Stop loss must be positive'),
  primaryAsset: z.string().min(1, 'Primary asset is required'),
  secondaryAsset: z.string().optional(),
  tertiaryAsset: z.string().optional(),
  
  // Personal Trading Time
  timeSlot1Start: z.string().optional(),
  timeSlot1End: z.string().optional(),
  timeSlot1Timezone: z.string().optional(),
  timeSlot2Start: z.string().optional(),
  timeSlot2End: z.string().optional(),
  timeSlot2Timezone: z.string().optional(),
  timeSlot3Start: z.string().optional(),
  timeSlot3End: z.string().optional(),
  timeSlot3Timezone: z.string().optional(),
  
  // Bottom fields
  dailyWorkingHours: z.number().min(0).max(24, 'Must be between 0-24 hours'),
  hourlyWages: z.number().min(0, 'Hourly wages must be positive'),
  liveTradingAccountAvailable: z.boolean(),
  challengePayoutsAvailable: z.boolean(),
});

type AccountFormData = z.infer<typeof accountFormSchema>;

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

export default function AccountsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showBalance, setShowBalance] = useState<Record<number, boolean>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: accounts = [], isLoading } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  const { data: trades = [] } = useQuery<Trade[]>({
    queryKey: ['/api/trades'],
  });

  // Simple state management to prevent flickering - NO react-hook-form
  const [formData, setFormData] = useState({
    // Basic Info Tab
    name: '',
    firm: '',
    type: 'demo',
    status: 'active',
    startingBalance: 10000,
    profitTarget: 1000,
    maxDrawdown: 500,
    minimumTradingDays: 5,
    timeLimit: 30,
    consistencyRule: 10,
    drawdownType: 'trailing',
    maxDrawdownType: 'EOD',
    hasDailyLossLimit: false,
    
    // Financial Tab
    accountCost: 150,
    activationCost: 99,
    purchaseMethod: 'credit card',
    resetCount: 0,
    totalResetsCost: 0,
    profitSplit: 80,
    activationFeePaid: false,
    includesActivationFee: false,
    
    // Rules & Risk Tab
    riskPerTrade: 100,
    riskPerTradeDivider: 10,
    dailyLossLimit: 500,
    riskRewardRatio: 2,
    maxTradesPerDay: 10,
    maxRiskPerDay: 500,
    stopLoss: 20,
    primaryAsset: '',
    secondaryAsset: '',
    tertiaryAsset: '',
    
    // Personal Trading Time
    timeSlot1Start: '09:00',
    timeSlot1End: '17:00',
    timeSlot1Timezone: 'UTC',
    timeSlot2Start: '',
    timeSlot2End: '',
    timeSlot2Timezone: 'UTC',
    timeSlot3Start: '',
    timeSlot3End: '',
    timeSlot3Timezone: 'UTC',
    
    // Bottom fields
    dailyWorkingHours: 8.0,
    hourlyWages: 25.00,
    liveTradingAccountAvailable: false,
    challengePayoutsAvailable: false
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: AccountFormData) => {
      return apiRequest('/api/accounts', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      setIsCreateDialogOpen(false);
      toast({
        title: 'Account Created',
        description: 'Your trading account has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create account.',
        variant: 'destructive',
      });
    },
  });

  // Memoized form input handler to prevent flickering
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Memoized handlers to prevent unnecessary re-renders and flickering
  const handleCreateAccount = useCallback(() => {
    createAccountMutation.mutate(formData);
  }, [createAccountMutation, formData]);

  // Stable dialog close handlers
  const handleCloseCreateDialog = useCallback(() => {
    setIsCreateDialogOpen(false);
    setFormData({
      name: '',
      firm: '',
      type: 'demo',
      status: 'active',
      startingBalance: 10000,
      profitTarget: 1000,
      maxDrawdown: 500,
      minimumTradingDays: 5,
      timeLimit: 30,
      consistencyRule: 10,
      drawdownType: 'trailing',
      maxDrawdownType: 'EOD',
      hasDailyLossLimit: false,
      accountCost: 150,
      activationCost: 99,
      purchaseMethod: 'credit card',
      resetCount: 0,
      totalResetsCost: 0,
      profitSplit: 80,
      activationFeePaid: false,
      includesActivationFee: false,
      riskPerTrade: 100,
      riskPerTradeDivider: 10,
      dailyLossLimit: 500,
      riskRewardRatio: 2,
      maxTradesPerDay: 10,
      maxRiskPerDay: 500,
      stopLoss: 20,
      primaryAsset: '',
      secondaryAsset: '',
      tertiaryAsset: '',
      timeSlot1Start: '09:00',
      timeSlot1End: '17:00',
      timeSlot1Timezone: 'UTC',
      timeSlot2Start: '',
      timeSlot2End: '',
      timeSlot2Timezone: 'UTC',
      timeSlot3Start: '',
      timeSlot3End: '',
      timeSlot3Timezone: 'UTC',
      dailyWorkingHours: 8.0,
      hourlyWages: 25.00,
      liveTradingAccountAvailable: false,
      challengePayoutsAvailable: false
    });
  }, []);

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

  const toggleBalanceVisibility = useCallback((accountId: number) => {
    setShowBalance(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  }, []);

  const handleDeleteAccount = useCallback((id: number) => {
    if (confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      // deleteAccountMutation.mutate(id);
    }
  }, []);

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
          <div className="flex gap-3">
            <Button 
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
              onClick={() => setLocation('/trades')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Trade
            </Button>
            <Button 
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Account
            </Button>
          </div>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                Create New Trading Account
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Set up a comprehensive trading account with your financial goals, risk parameters, and trading preferences.
              </DialogDescription>
            </DialogHeader>
            
            <div className="max-h-[70vh] overflow-y-auto pr-4">
              <div className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
                    <TabsTrigger value="basic" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
                      Basic Info
                    </TabsTrigger>
                    <TabsTrigger value="financial" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
                      Financial
                    </TabsTrigger>
                    <TabsTrigger value="rules" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
                      Rules & Risk
                    </TabsTrigger>
                  </TabsList>

                  {/* Basic Info Tab */}
                  <TabsContent value="basic" className="mt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Account Name *</Label>
                        <Input 
                          placeholder="e.g., Main Trading Account" 
                          className="bg-gray-800 border-gray-600 text-white"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-white">Prop Firm *</Label>
                        <Input 
                          placeholder="e.g., FTMO, TopstepTrader" 
                          className="bg-gray-800 border-gray-600 text-white"
                          value={formData.firm}
                          onChange={(e) => handleInputChange('firm', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Account Type *</Label>
                        <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="challenge">Challenge</SelectItem>
                            <SelectItem value="funded">Funded</SelectItem>
                            <SelectItem value="live">Live</SelectItem>
                            <SelectItem value="demo">Demo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Starting Balance ($) *</Label>
                        <Input 
                          type="number" 
                          placeholder="10000" 
                          className="bg-gray-800 border-gray-600 text-white"
                          value={formData.startingBalance}
                          onChange={(e) => handleInputChange('startingBalance', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Financial Tab */}
                  <TabsContent value="financial" className="mt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Account Cost ($)</Label>
                        <Input 
                          type="number" 
                          placeholder="150" 
                          className="bg-gray-800 border-gray-600 text-white"
                          value={formData.accountCost}
                          onChange={(e) => handleInputChange('accountCost', parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Profit Split (%)</Label>
                        <Input 
                          type="number" 
                          placeholder="80" 
                          max="100"
                          className="bg-gray-800 border-gray-600 text-white"
                          value={formData.profitSplit}
                          onChange={(e) => handleInputChange('profitSplit', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Rules & Risk Tab */}
                  <TabsContent value="rules" className="mt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Risk per Trade ($)</Label>
                        <Input 
                          type="number" 
                          placeholder="100" 
                          className="bg-gray-800 border-gray-600 text-white"
                          value={formData.riskPerTrade}
                          onChange={(e) => handleInputChange('riskPerTrade', parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Primary Asset *</Label>
                        <Input 
                          placeholder="e.g., EUR/USD, NAS100" 
                          className="bg-gray-800 border-gray-600 text-white"
                          value={formData.primaryAsset}
                          onChange={(e) => handleInputChange('primaryAsset', e.target.value)}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseCreateDialog}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateAccount}
                disabled={createAccountMutation.isPending}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                {createAccountMutation.isPending ? 'Creating...' : 'Create Account'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {accounts.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Wallet className="mx-auto h-16 w-16 text-gray-500 mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">No Trading Accounts</h3>
              <p className="text-gray-500 mb-4">Create your first trading account to start tracking performance</p>
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
                      <div>
                        <CardTitle className="text-white text-lg">{account.name}</CardTitle>
                        <p className="text-gray-400 text-sm">{account.firm}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={account.type === 'funded' ? 'default' : 'secondary'} 
                          className={account.type === 'funded' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}
                        >
                          {account.type}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBalanceVisibility(account.id)}
                          className="text-gray-400 hover:text-white p-1"
                        >
                          {isBalanceVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Balance</p>
                        <p className="text-white font-semibold">
                          {isBalanceVisible ? formatCurrency(account.startingBalance + metrics.totalPnL) : '••••••'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">P&L</p>
                        <p className={`font-semibold ${metrics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {isBalanceVisible ? formatCurrency(metrics.totalPnL) : '••••••'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Win Rate</p>
                        <p className="text-white font-semibold">{formatPercentage(metrics.winRate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Risk Level</p>
                        <p className={`font-semibold ${getRiskLevelColor(metrics.riskLevel)}`}>
                          {metrics.riskLevel}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Total Trades</p>
                        <p className="text-white font-semibold">{metrics.totalTrades}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Days Active</p>
                        <p className="text-white font-semibold">{metrics.daysActive}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={() => console.log('View account details')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={() => console.log('Edit account')}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        onClick={() => handleDeleteAccount(account.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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