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

// Create a comprehensive schema for account forms matching the database schema
const accountFormSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  type: z.string().min(1, 'Account type is required'),
  firm: z.string().min(1, 'Firm name is required'),
  status: z.string().optional(),
  startingBalance: z.number().min(0, 'Starting balance must be positive'),
  profitTarget: z.number().min(0, 'Profit target must be positive'),
  maxDrawdown: z.number().min(0, 'Max drawdown must be positive'),
  minimumTradingDays: z.number().optional().nullable(),
  timeLimit: z.number().optional().nullable(),
  consistencyRulePercent: z.number().optional().nullable(),
  hasDailyLossLimit: z.boolean().optional(),
  accountCost: z.number().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  resetCount: z.number().optional(),
  totalResetsCost: z.number().optional(),
  profitSplit: z.number().optional().nullable(),
  activationPaid: z.boolean().optional(),
  includesActivationFee: z.boolean().optional(),
  riskPerTrade: z.number().optional().nullable(),
  riskPerTradeDivider: z.number().optional().nullable(),
  dailyLossLimit: z.number().optional().nullable(),
  maxTradesPerDay: z.number().optional().nullable(),
  riskRewardRatio: z.number().optional().nullable(),
  minimumPayoutAmount: z.number().optional().nullable(),
  maxNetBalanceForPayout: z.number().optional().nullable(),
  personalTradingTimeStart1: z.string().optional().nullable(),
  personalTradingTimeEnd1: z.string().optional().nullable(),
  personalTradingTimeZone1: z.string().optional().nullable(),
  personalTradingTimeStart2: z.string().optional().nullable(),
  personalTradingTimeEnd2: z.string().optional().nullable(),
  personalTradingTimeZone2: z.string().optional().nullable(),
  personalTradingTimeStart3: z.string().optional().nullable(),
  personalTradingTimeEnd3: z.string().optional().nullable(),
  personalTradingTimeZone3: z.string().optional().nullable(),
  activationCost: z.number().optional().nullable(),
  purchaseMethod: z.string().optional().nullable(),
  maxRiskPerDay: z.number().optional().nullable(),
  primaryAsset: z.string().optional().nullable(),
  secondaryAsset: z.string().optional().nullable(),
  tertiaryAsset: z.string().optional().nullable(),
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

export default function AccountManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: '',
      type: 'challenge',
      firm: '',
      status: 'active',
      startingBalance: 0,
      profitTarget: 0,
      maxDrawdown: 0,
      minimumTradingDays: null,
      timeLimit: null,
      consistencyRulePercent: null,
      hasDailyLossLimit: false,
      accountCost: null,
      paymentMethod: null,
      resetCount: 0,
      totalResetsCost: 0,
      profitSplit: null,
      activationPaid: false,
      includesActivationFee: false,
      riskPerTrade: null,
      riskPerTradeDivider: null,
      dailyLossLimit: null,
      maxTradesPerDay: null,
      riskRewardRatio: null,
      minimumPayoutAmount: null,
      maxNetBalanceForPayout: null,
      personalTradingTimeStart1: null,
      personalTradingTimeEnd1: null,
      personalTradingTimeZone1: null,
      personalTradingTimeStart2: null,
      personalTradingTimeEnd2: null,
      personalTradingTimeZone2: null,
      personalTradingTimeStart3: null,
      personalTradingTimeEnd3: null,
      personalTradingTimeZone3: null,
      activationCost: null,
      purchaseMethod: null,
      maxRiskPerDay: null,
      primaryAsset: null,
      secondaryAsset: null,
      tertiaryAsset: null,
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: AccountFormData) => {
      return apiRequest('/api/accounts', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      setIsCreateDialogOpen(false);
      form.reset();
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

  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<AccountFormData> }) => {
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

  const handleCreateAccount = (data: AccountFormData) => {
    createAccountMutation.mutate(data);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    form.reset({
      name: account.name,
      type: account.type,
      firm: account.firm || '',
      startingBalance: account.startingBalance,
      profitTarget: account.profitTarget || 0,
      maxDrawdown: account.maxDrawdown || 0,
      riskPerTrade: account.riskPerTrade || 2,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateAccount = (data: AccountFormData) => {
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
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white text-xl">Create New Trading Account</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Set up a new trading account with proper risk management and financial tracking.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[80vh] px-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCreateAccount)} className="space-y-6">
                    <Tabs defaultValue="basic" className="w-full">
                      <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="financial">Financial</TabsTrigger>
                        <TabsTrigger value="rules">Rules & Risk</TabsTrigger>
                      </TabsList>

                      <TabsContent value="basic" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Account Name</FormLabel>
                                <FormControl>
                                  <Input {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="My Trading Account" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="firm"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Prop Firm</FormLabel>
                                <FormControl>
                                  <Input {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="FTMO, TopstepTrader, etc." />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Account Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-gray-800 border-gray-600">
                                    <SelectItem value="challenge">Challenge</SelectItem>
                                    <SelectItem value="funded">Funded</SelectItem>
                                    <SelectItem value="live">Live</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-gray-800 border-gray-600">
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="passed">Passed</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="startingBalance"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Starting Balance</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    className="bg-gray-800 border-gray-600 text-white" 
                                    placeholder="100000"
                                    value={field.value === 0 ? "" : field.value}
                                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="profitTarget"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Profit Target</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    className="bg-gray-800 border-gray-600 text-white" 
                                    placeholder="10000"
                                    value={field.value === 0 ? "" : field.value}
                                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="maxDrawdown"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Max Drawdown</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    className="bg-gray-800 border-gray-600 text-white" 
                                    placeholder="5000"
                                    value={field.value === 0 ? "" : field.value}
                                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="minimumTradingDays"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Minimum Trading Days</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    className="bg-gray-800 border-gray-600 text-white" 
                                    placeholder="5"
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="timeLimit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Time Limit (days)</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    className="bg-gray-800 border-gray-600 text-white" 
                                    placeholder="30"
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="consistencyRulePercent"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Consistency Rule (%)</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    className="bg-gray-800 border-gray-600 text-white" 
                                    placeholder="50"
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <FormField
                            control={form.control}
                            name="hasDailyLossLimit"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="border-gray-600 data-[state=checked]:bg-blue-600"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-white">Has Daily Loss Limit</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="financial" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="accountCost"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Account Cost</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    className="bg-gray-800 border-gray-600 text-white" 
                                    placeholder="649"
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Payment Method</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                  <FormControl>
                                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                      <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-gray-800 border-gray-600">
                                    <SelectItem value="credit_card">Credit Card</SelectItem>
                                    <SelectItem value="paypal">PayPal</SelectItem>
                                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="resetCount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Reset Count</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    className="bg-gray-800 border-gray-600 text-white" 
                                    placeholder="0"
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="totalResetsCost"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Total Resets Cost</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    className="bg-gray-800 border-gray-600 text-white" 
                                    placeholder="0"
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="profitSplit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Profit Split (%)</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    className="bg-gray-800 border-gray-600 text-white" 
                                    placeholder="80"
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="activationCost"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Activation Cost</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    className="bg-gray-800 border-gray-600 text-white" 
                                    placeholder="200"
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={form.control}
                            name="purchaseMethod"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Purchase Method</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                  <FormControl>
                                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                      <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-gray-800 border-gray-600">
                                    <SelectItem value="credit_card">Credit Card</SelectItem>
                                    <SelectItem value="paypal">PayPal</SelectItem>
                                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <FormField
                            control={form.control}
                            name="activationPaid"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="border-gray-600 data-[state=checked]:bg-blue-600"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-white">Activation Fee Paid</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="includesActivationFee"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="border-gray-600 data-[state=checked]:bg-blue-600"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-white">Includes Activation Fee</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="rules" className="space-y-4">
                        {/* Risk Per Trade with Real-time Feedback */}
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="riskPerTrade"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Risk Per Trade ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    className="bg-gray-800 border-gray-600 text-white" 
                                    placeholder="500"
                                    value={field.value === null ? "" : field.value}
                                    onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {/* Risk Per Trade Divider */}
                          <FormField
                            control={form.control}
                            name="riskPerTradeDivider"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Risk Per Trade Divider</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    min="1"
                                    max="10"
                                    className="bg-gray-800 border-gray-600 text-white" 
                                    placeholder="1"
                                    value={field.value === null ? "" : field.value}
                                    onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="dailyLossLimit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Daily Loss Limit ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    className="bg-gray-800 border-gray-600 text-white" 
                                    placeholder="2000"
                                    value={field.value === null ? "" : field.value}
                                    onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="maxTradesPerDay"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Max Trades Per Day</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    className="bg-gray-800 border-gray-600 text-white" 
                                    placeholder="5"
                                    value={field.value === null ? "" : field.value}
                                    onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="maxRiskPerDay"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Max Risk Per Day ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    className="bg-gray-800 border-gray-600 text-white" 
                                    placeholder="3000"
                                    value={field.value === null ? "" : field.value}
                                    onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={form.control}
                            name="riskRewardRatio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Risk:Reward Ratio (1:X)</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    step="0.1"
                                    className="bg-gray-800 border-gray-600 text-white" 
                                    placeholder="2.0"
                                    value={field.value === null ? "" : field.value}
                                    onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Asset Selection */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-yellow-400 border-b border-yellow-400/20 pb-2">
                            Trading Assets
                          </h3>
                          <div className="grid grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="primaryAsset"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Primary Asset</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      className="bg-gray-800 border-gray-600 text-white" 
                                      placeholder="e.g. ES, NQ, EURUSD, BTCUSD"
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="secondaryAsset"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Secondary Asset</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      className="bg-gray-800 border-gray-600 text-white" 
                                      placeholder="e.g. CL, GC, GBPUSD"
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="tertiaryAsset"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Tertiary Asset</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      className="bg-gray-800 border-gray-600 text-white" 
                                      placeholder="e.g. YM, RTY, USDJPY"
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="minimumPayoutAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Minimum Payout Amount ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    className="bg-gray-800 border-gray-600 text-white" 
                                    placeholder="100"
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="maxNetBalanceForPayout"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Max Net Balance for Payout ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    className="bg-gray-800 border-gray-600 text-white" 
                                    placeholder="5000"
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Personal Trading Time */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-yellow-400 border-b border-yellow-400/20 pb-2">
                            Personal Trading Time
                          </h3>
                          
                          {/* Time Slot 1 */}
                          <div className="space-y-2">
                            <h4 className="text-md font-medium text-blue-400">Time Slot 1 (Primary)</h4>
                            <div className="grid grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name="personalTradingTimeStart1"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">Personal Trading Time Start - Time1</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ""}>
                                      <FormControl>
                                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                          <SelectValue placeholder="--:-- --" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-gray-800 border-gray-600 max-h-60">
                                        {Array.from({ length: 48 }, (_, i) => {
                                          const hour = Math.floor(i / 2);
                                          const minute = i % 2 === 0 ? "00" : "30";
                                          const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                                          return (
                                            <SelectItem key={time} value={time}>
                                              {time}
                                            </SelectItem>
                                          );
                                        })}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="personalTradingTimeEnd1"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">Personal Trading Time End - Time1</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ""}>
                                      <FormControl>
                                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                          <SelectValue placeholder="--:-- --" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-gray-800 border-gray-600 max-h-60">
                                        {Array.from({ length: 48 }, (_, i) => {
                                          const hour = Math.floor(i / 2);
                                          const minute = i % 2 === 0 ? "00" : "30";
                                          const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                                          return (
                                            <SelectItem key={time} value={time}>
                                              {time}
                                            </SelectItem>
                                          );
                                        })}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="personalTradingTimeZone1"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">Timezone</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ""}>
                                      <FormControl>
                                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                          <SelectValue placeholder="Select timezone" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-gray-800 border-gray-600">
                                        <SelectItem value="EST">EST - Eastern Standard Time</SelectItem>
                                        <SelectItem value="CST">CST - Central Standard Time</SelectItem>
                                        <SelectItem value="MST">MST - Mountain Standard Time</SelectItem>
                                        <SelectItem value="PST">PST - Pacific Standard Time</SelectItem>
                                        <SelectItem value="GMT">GMT - Greenwich Mean Time</SelectItem>
                                        <SelectItem value="CET">CET - Central European Time</SelectItem>
                                        <SelectItem value="JST">JST - Japan Standard Time</SelectItem>
                                        <SelectItem value="AEST">AEST - Australian Eastern Standard Time</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          {/* Time Slot 2 */}
                          <div className="space-y-2">
                            <h4 className="text-md font-medium text-green-400">Time Slot 2 (Secondary)</h4>
                            <div className="grid grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name="personalTradingTimeStart2"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">Personal Trading Time Start - Time2</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ""}>
                                      <FormControl>
                                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                          <SelectValue placeholder="--:-- --" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-gray-800 border-gray-600 max-h-60">
                                        {Array.from({ length: 48 }, (_, i) => {
                                          const hour = Math.floor(i / 2);
                                          const minute = i % 2 === 0 ? "00" : "30";
                                          const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                                          return (
                                            <SelectItem key={time} value={time}>
                                              {time}
                                            </SelectItem>
                                          );
                                        })}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="personalTradingTimeEnd2"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">Personal Trading Time End - Time2</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ""}>
                                      <FormControl>
                                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                          <SelectValue placeholder="--:-- --" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-gray-800 border-gray-600 max-h-60">
                                        {Array.from({ length: 48 }, (_, i) => {
                                          const hour = Math.floor(i / 2);
                                          const minute = i % 2 === 0 ? "00" : "30";
                                          const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                                          return (
                                            <SelectItem key={time} value={time}>
                                              {time}
                                            </SelectItem>
                                          );
                                        })}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="personalTradingTimeZone2"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">Timezone</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ""}>
                                      <FormControl>
                                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                          <SelectValue placeholder="Select timezone" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-gray-800 border-gray-600">
                                        <SelectItem value="EST">EST - Eastern Standard Time</SelectItem>
                                        <SelectItem value="CST">CST - Central Standard Time</SelectItem>
                                        <SelectItem value="MST">MST - Mountain Standard Time</SelectItem>
                                        <SelectItem value="PST">PST - Pacific Standard Time</SelectItem>
                                        <SelectItem value="GMT">GMT - Greenwich Mean Time</SelectItem>
                                        <SelectItem value="CET">CET - Central European Time</SelectItem>
                                        <SelectItem value="JST">JST - Japan Standard Time</SelectItem>
                                        <SelectItem value="AEST">AEST - Australian Eastern Standard Time</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          {/* Time Slot 3 */}
                          <div className="space-y-2">
                            <h4 className="text-md font-medium text-purple-400">Time Slot 3 (Optional)</h4>
                            <div className="grid grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name="personalTradingTimeStart3"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">Personal Trading Time Start - Time3</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ""}>
                                      <FormControl>
                                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                          <SelectValue placeholder="--:-- --" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-gray-800 border-gray-600 max-h-60">
                                        {Array.from({ length: 48 }, (_, i) => {
                                          const hour = Math.floor(i / 2);
                                          const minute = i % 2 === 0 ? "00" : "30";
                                          const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                                          return (
                                            <SelectItem key={time} value={time}>
                                              {time}
                                            </SelectItem>
                                          );
                                        })}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="personalTradingTimeEnd3"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">Personal Trading Time End - Time3</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ""}>
                                      <FormControl>
                                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                          <SelectValue placeholder="--:-- --" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-gray-800 border-gray-600 max-h-60">
                                        {Array.from({ length: 48 }, (_, i) => {
                                          const hour = Math.floor(i / 2);
                                          const minute = i % 2 === 0 ? "00" : "30";
                                          const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                                          return (
                                            <SelectItem key={time} value={time}>
                                              {time}
                                            </SelectItem>
                                          );
                                        })}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="personalTradingTimeZone3"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">Timezone</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ""}>
                                      <FormControl>
                                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                          <SelectValue placeholder="Select timezone" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-gray-800 border-gray-600">
                                        <SelectItem value="EST">EST - Eastern Standard Time</SelectItem>
                                        <SelectItem value="CST">CST - Central Standard Time</SelectItem>
                                        <SelectItem value="MST">MST - Mountain Standard Time</SelectItem>
                                        <SelectItem value="PST">PST - Pacific Standard Time</SelectItem>
                                        <SelectItem value="GMT">GMT - Greenwich Mean Time</SelectItem>
                                        <SelectItem value="CET">CET - Central European Time</SelectItem>
                                        <SelectItem value="JST">JST - Japan Standard Time</SelectItem>
                                        <SelectItem value="AEST">AEST - Australian Eastern Standard Time</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                        className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createAccountMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {createAccountMutation.isPending ? "Creating..." : "Create Account"}
                      </Button>
                  </div>
                </form>
              </Form>
            </ScrollArea>
          </DialogContent>
          </Dialog>
        </div>

        {accounts.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Wallet className="mx-auto h-16 w-16 text-gray-500 mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">No Trading Accounts</h3>
              <p className="text-gray-500 mb-4">Create your first trading account to start tracking performance</p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
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
                        <p className="text-sm font-medium text-white">{formatPercentage(metrics.winRate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Total Trades</p>
                        <p className="text-sm font-medium text-white">{metrics.totalTrades}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Drawdown</p>
                        <p className={`text-sm font-medium ${getRiskLevelColor(metrics.riskLevel)}`}>
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

                    <div className="pt-2 border-t border-gray-700">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Last Trade: {metrics.lastTradeDate}</span>
                        <span>{metrics.daysActive} days active</span>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAccount(account)}
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
                            deleteAccountMutation.mutate(account.id);
                          }
                        }}
                        className="border-red-600 text-red-400 hover:bg-red-600/20"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Edit Account Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
            <DialogHeader>
              <DialogTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                Edit Trading Account
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Update your account settings and risk parameters.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUpdateAccount)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Account Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Main Trading Account" 
                            className="bg-white border-gray-300 text-black"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Account Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white border-gray-300 text-black">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="demo">Demo</SelectItem>
                            <SelectItem value="live">Live</SelectItem>
                            <SelectItem value="paper">Paper Trading</SelectItem>
                            <SelectItem value="challenge">Challenge</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="firm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Prop Firm / Broker</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., FTMO, TopstepTrader, Interactive Brokers" 
                          className="bg-white border-gray-300 text-black"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="startingBalance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Starting Balance</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="10000" 
                            className="bg-white border-gray-300 text-black"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="profitTarget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Profit Target</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="1000" 
                            className="bg-white border-gray-300 text-black"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="maxDrawdown"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Max Drawdown</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="500" 
                            className="bg-white border-gray-300 text-black"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="riskPerTrade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Risk Per Trade (%)</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Slider
                            value={[field.value || 2]}
                            onValueChange={(value) => field.onChange(value[0])}
                            max={10}
                            min={0.1}
                            step={0.1}
                            className="w-full"
                          />
                          <div className="text-center text-sm text-gray-400">
                            {field.value || 2}% per trade
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateAccountMutation.isPending}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    {updateAccountMutation.isPending ? 'Updating...' : 'Update Account'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}