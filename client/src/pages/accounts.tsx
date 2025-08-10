import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  EyeOff,
  X
} from 'lucide-react';

// Comprehensive schema for account creation form
const accountFormSchema = z.object({
  // Basic Info Tab
  name: z.string().min(1, 'Account name is required'),
  firm: z.string().min(1, 'Prop firm is required'),
  type: z.enum(['challenge', 'funded', 'live', 'demo']),
  status: z.enum(['active', 'inactive', 'pending']),
  startingBalance: z.number().min(0, 'Starting balance must be positive').optional(),
  profitTarget: z.number().min(0, 'Profit target must be positive').optional(),
  maxDrawdown: z.number().min(0, 'Max drawdown must be positive').optional(),
  minimumTradingDays: z.number().min(1, 'Minimum trading days required').optional(),
  timeLimit: z.number().min(1, 'Time limit required').optional(),
  consistencyRule: z.number().min(0).max(100, 'Must be between 0-100%').optional(),
  drawdownType: z.enum(['trailing', 'static', 'balance_based']),
  maxDrawdownType: z.enum(['EOD', 'real-time', 'session_close']),
  hasDailyLossLimit: z.boolean(),
  
  // Financial Tab
  accountCost: z.number().min(0, 'Account cost must be positive').optional(),
  activationCost: z.number().min(0, 'Activation cost must be positive').optional(),
  purchaseMethod: z.enum(['credit card', 'PayPal', 'bank transfer', 'crypto']),
  resetCount: z.number().min(0, 'Reset count must be positive').optional(),
  totalResetsCost: z.number().min(0, 'Total resets cost must be positive').optional(),
  profitSplit: z.number().min(0).max(100, 'Must be between 0-100%').optional(),
  activationFeePaid: z.boolean(),
  includesActivationFee: z.boolean(),
  
  // Rules & Risk Tab
  riskPerTrade: z.number().min(0, 'Risk per trade must be positive').optional(),
  riskPerTradeDivider: z.number().min(1, 'Divider must be at least 1').optional(),
  dailyLossLimit: z.number().min(0, 'Daily loss limit must be positive').optional(),
  riskRewardRatio: z.number().min(0.1, 'Risk reward ratio must be positive').optional(),
  maxTradesPerDay: z.number().min(1, 'Must allow at least 1 trade per day').optional(),
  maxRiskPerDay: z.number().min(0, 'Max risk per day must be positive').optional(),
  stopLoss: z.number().min(0, 'Stop loss must be positive').optional(),
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
  dailyWorkingHours: z.number().min(0).max(24, 'Must be between 0-24 hours').optional(),
  hourlyWages: z.number().min(0, 'Hourly wages must be positive').optional(),
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

  const { data: accounts = [], isLoading } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  const { data: trades = [] } = useQuery<Trade[]>({
    queryKey: ['/api/trades'],
  });

  // React Hook Form setup with NO default values for number fields
  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: '',
      firm: '',
      type: 'demo',
      status: 'active',
      drawdownType: 'trailing',
      maxDrawdownType: 'EOD',
      hasDailyLossLimit: false,
      purchaseMethod: 'credit card',
      activationFeePaid: false,
      includesActivationFee: false,
      primaryAsset: '',
      secondaryAsset: '',
      tertiaryAsset: '',
      timeSlot1Start: '',
      timeSlot1End: '',
      timeSlot1Timezone: '',
      timeSlot2Start: '',
      timeSlot2End: '',
      timeSlot2Timezone: '',
      timeSlot3Start: '',
      timeSlot3End: '',
      timeSlot3Timezone: '',
      liveTradingAccountAvailable: false,
      challengePayoutsAvailable: false,
      // ALL NUMBER FIELDS LEFT UNDEFINED - NO DEFAULTS
    }
  });

  // Removed duplicate formData state - using ONLY React Hook Form now

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

  // Memoized form input handler to prevent flickering
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Form submission handler
  const handleCreateAccount = useCallback((data: AccountFormData) => {
    createAccountMutation.mutate(data);
  }, [createAccountMutation]);

  const handleEditAccount = useCallback((account: Account) => {
    setEditingAccount(account);
    setIsEditDialogOpen(true);
  }, []);

  const handleUpdateAccount = useCallback(() => {
    if (editingAccount) {
      updateAccountMutation.mutate({ id: editingAccount.id, data: formData });
    }
  }, [editingAccount, updateAccountMutation, formData]);

  // Stable dialog close handlers
  const handleCloseCreateDialog = useCallback(() => {
    setIsCreateDialogOpen(false);
    setFormData({
      name: '',
      firm: '',
      type: 'demo',
      status: 'active',
      startingBalance: "",
      profitTarget: "",
      maxDrawdown: "",
      minimumTradingDays: "",
      timeLimit: "",
      consistencyRule: "",
      drawdownType: 'trailing',
      maxDrawdownType: 'EOD',
      hasDailyLossLimit: false,
      accountCost: "",
      activationCost: "",
      purchaseMethod: 'credit card',
      resetCount: "",
      totalResetsCost: "",
      profitSplit: "",
      activationFeePaid: false,
      includesActivationFee: false,
      riskPerTrade: "",
      riskPerTradeDivider: "",
      dailyLossLimit: "",
      riskRewardRatio: "",
      maxTradesPerDay: "",
      maxRiskPerDay: "",
      stopLoss: "",
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
      dailyWorkingHours: "",
      hourlyWages: "",
      liveTradingAccountAvailable: false,
      challengePayoutsAvailable: false
    });
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingAccount(null);
  }, []);

  // Initialize edit form data when editing account changes (reduces flickering)
  useEffect(() => {
    if (editingAccount && isEditDialogOpen) {
      setFormData({
        name: editingAccount.name,
        firm: editingAccount.firm || '',
        type: editingAccount.type,
        status: 'active',
        startingBalance: editingAccount.startingBalance,
        profitTarget: editingAccount.profitTarget || "",
        maxDrawdown: editingAccount.maxDrawdown || "",
        minimumTradingDays: "",
        timeLimit: "",
        consistencyRule: "",
        drawdownType: 'trailing',
        maxDrawdownType: 'EOD',
        hasDailyLossLimit: false,
        accountCost: "",
        activationCost: "",
        purchaseMethod: 'credit card',
        resetCount: "",
        totalResetsCost: "",
        profitSplit: "",
        activationFeePaid: false,
        includesActivationFee: false,
        riskPerTrade: editingAccount.riskPerTrade || "",
        riskPerTradeDivider: "",
        dailyLossLimit: "",
        riskRewardRatio: "",
        maxTradesPerDay: "",
        maxRiskPerDay: "",
        stopLoss: "",
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
        dailyWorkingHours: "",
        hourlyWages: "",
        liveTradingAccountAvailable: false,
        challengePayoutsAvailable: false
      });
    }
  }, [editingAccount, isEditDialogOpen]);



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
          <div className="flex gap-3">
            <Button 
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
              onClick={async () => {
                try {
                  const response = await fetch('/api/create-mock-data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                  });
                  const data = await response.json();
                  
                  if (response.ok) {
                    toast({
                      title: "Mock Data Created",
                      description: `Created FTMO $100K account with 10 trades. Total P&L: $${data.summary.totalPnL}`,
                      className: "bg-green-600 text-white border-green-500"
                    });
                    queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
                    queryClient.invalidateQueries({ queryKey: ['/api/trades'] });
                  } else {
                    throw new Error(data.message || 'Failed to create mock data');
                  }
                } catch (error) {
                  toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to create mock data",
                    variant: "destructive"
                  });
                }
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Mock Data
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
        
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => !open && handleCloseCreateDialog()}>
          <DialogContent className="max-w-4xl max-h-[90vh] bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                Create New Trading Account
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-sm">
                Set up a comprehensive trading account with your financial goals, risk parameters, and trading preferences.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col h-full max-h-[75vh]">
                
                <div className="flex-1 overflow-y-auto py-4">
                  <Form {...form}>
                    <form id="create-account-form" onSubmit={form.handleSubmit(handleCreateAccount)} className="space-y-6">
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
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Account Name *</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g., Main Trading Account" 
                                    className="bg-gray-800 border-gray-600 text-white"
                                    {...field} 
                                  />
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
                                <FormLabel className="text-white">Prop Firm *</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g., FTMO, TopstepTrader" 
                                    className="bg-gray-800 border-gray-600 text-white"
                                    {...field} 
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
                            name="type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Account Type *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="challenge">Challenge</SelectItem>
                                    <SelectItem value="funded">Funded</SelectItem>
                                    <SelectItem value="live">Live</SelectItem>
                                    <SelectItem value="demo">Demo</SelectItem>
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
                                <FormLabel className="text-white">Account Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="startingBalance"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Starting Balance ($) *</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="" 
                                    className="bg-gray-800 border-gray-600 text-white"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
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
                                <FormLabel className="text-white">Profit Target ($) *</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="" 
                                    className="bg-gray-800 border-gray-600 text-white"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
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
                                <FormLabel className="text-white">Max Drawdown ($) *</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="" 
                                    className="bg-gray-800 border-gray-600 text-white"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
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
                                    type="number" 
                                    placeholder="" 
                                    className="bg-gray-800 border-gray-600 text-white"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : parseInt(e.target.value))}
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
                                    type="number" 
                                    placeholder="" 
                                    className="bg-gray-800 border-gray-600 text-white"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="consistencyRule"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Consistency Rule (%)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="" 
                                    className="bg-gray-800 border-gray-600 text-white"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
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
                            name="drawdownType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Drawdown Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="trailing">Trailing</SelectItem>
                                    <SelectItem value="static">Static</SelectItem>
                                    <SelectItem value="balance_based">Balance Based</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="maxDrawdownType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Max Drawdown Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="EOD">EOD</SelectItem>
                                    <SelectItem value="real-time">Real-time</SelectItem>
                                    <SelectItem value="session_close">Session Close</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="hasDailyLossLimit"
                            render={({ field }) => (
                              <FormItem className="flex flex-col justify-end">
                                <div className="flex items-center space-x-2 h-9">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-white">Has Daily Loss Limit</FormLabel>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>

                      {/* Financial Tab */}
                      <TabsContent value="financial" className="mt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="accountCost"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Account Cost ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="" 
                                    className="bg-gray-800 border-gray-600 text-white"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
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
                                <FormLabel className="text-white">Activation Cost ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="" 
                                    className="bg-gray-800 border-gray-600 text-white"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="purchaseMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Purchase Method</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                    <SelectValue placeholder="Select method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="credit card">Credit Card</SelectItem>
                                  <SelectItem value="PayPal">PayPal</SelectItem>
                                  <SelectItem value="bank transfer">Bank Transfer</SelectItem>
                                  <SelectItem value="crypto">Crypto</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="resetCount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Reset Count</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="" 
                                    className="bg-gray-800 border-gray-600 text-white"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : parseInt(e.target.value))}
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
                                <FormLabel className="text-white">Total Resets Cost ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="" 
                                    className="bg-gray-800 border-gray-600 text-white"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="profitSplit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Profit Split (%)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="" 
                                    className="bg-gray-800 border-gray-600 text-white"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
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
                            name="activationFeePaid"
                            render={({ field }) => (
                              <FormItem className="flex flex-col justify-center">
                                <div className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-white">Activation Fee Paid</FormLabel>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="includesActivationFee"
                            render={({ field }) => (
                              <FormItem className="flex flex-col justify-center">
                                <div className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-white">Includes Activation Fee</FormLabel>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>

                      {/* Rules & Risk Tab */}
                      <TabsContent value="rules" className="mt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="riskPerTrade"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Risk Per Trade ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="" 
                                    className="bg-gray-800 border-gray-600 text-white"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="riskPerTradeDivider"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Risk Per Trade Divider</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="" 
                                    className="bg-gray-800 border-gray-600 text-white"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <div className="text-xs text-gray-400 mt-1">Helper: Used to calculate position size</div>
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
                                    type="number" 
                                    placeholder="" 
                                    className="bg-gray-800 border-gray-600 text-white"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="riskRewardRatio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Risk:Reward Ratio (1:X)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="" 
                                    className="bg-gray-800 border-gray-600 text-white"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
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
                                    type="number" 
                                    placeholder="" 
                                    className="bg-gray-800 border-gray-600 text-white"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : parseInt(e.target.value))}
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
                            name="maxRiskPerDay"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Max Risk Per Day ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="" 
                                    className="bg-gray-800 border-gray-600 text-white"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="stopLoss"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Stop Loss (Points/Pips)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="" 
                                    className="bg-gray-800 border-gray-600 text-white"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
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
                            name="primaryAsset"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Primary Asset *</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g., ES, NQ, Gold" 
                                    className="bg-gray-800 border-gray-600 text-white"
                                    {...field}
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
                                    placeholder="Optional" 
                                    className="bg-gray-800 border-gray-600 text-white"
                                    {...field}
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
                                    placeholder="Optional" 
                                    className="bg-gray-800 border-gray-600 text-white"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Personal Trading Time */}
                        <div className="space-y-4 pt-6 border-t border-gray-700">
                          <h3 className="text-lg font-semibold text-white">Personal Trading Time</h3>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name="timeSlot1Start"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">Time Slot 1 (Primary) - Start</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="time"
                                        className="bg-gray-800 border-gray-600 text-white"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="timeSlot1End"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">End Time</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="time"
                                        className="bg-gray-800 border-gray-600 text-white"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="timeSlot1Timezone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">Timezone</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="UTC"
                                        className="bg-gray-800 border-gray-600 text-white"
                                        {...field}
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
                                name="timeSlot2Start"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">Time Slot 2 (Secondary) - Start</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="time"
                                        className="bg-gray-800 border-gray-600 text-white"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="timeSlot2End"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">End Time</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="time"
                                        className="bg-gray-800 border-gray-600 text-white"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="timeSlot2Timezone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">Timezone</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="UTC"
                                        className="bg-gray-800 border-gray-600 text-white"
                                        {...field}
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
                                name="timeSlot3Start"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">Time Slot 3 (Tertiary) - Start</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="time"
                                        className="bg-gray-800 border-gray-600 text-white"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="timeSlot3End"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">End Time</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="time"
                                        className="bg-gray-800 border-gray-600 text-white"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="timeSlot3Timezone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">Timezone</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="UTC"
                                        className="bg-gray-800 border-gray-600 text-white"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Bottom fields */}
                        <div className="space-y-4 pt-6 border-t border-gray-700">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="dailyWorkingHours"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Daily Working Hours</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      step="0.1"
                                      placeholder="" 
                                      className="bg-gray-800 border-gray-600 text-white"
                                      {...field}
                                      onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="hourlyWages"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Hourly Wages ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      step="0.01"
                                      placeholder="" 
                                      className="bg-gray-800 border-gray-600 text-white"
                                      {...field}
                                      onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
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
                              name="liveTradingAccountAvailable"
                              render={({ field }) => (
                                <FormItem className="flex flex-col justify-center">
                                  <div className="flex items-center space-x-2">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-white">Live Trading Account Available</FormLabel>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="challengePayoutsAvailable"
                              render={({ field }) => (
                                <FormItem className="flex flex-col justify-center">
                                  <div className="flex items-center space-x-2">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-white">Challenge Payouts Available</FormLabel>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                  </form>
                </Form>
              </div>
              
              {/* Form Actions - Fixed at bottom */}
              <div className="flex-shrink-0 flex justify-end space-x-3 pt-4 border-t border-gray-700 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseCreateDialog}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="create-account-form"
                  disabled={createAccountMutation.isPending}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  {createAccountMutation.isPending ? 'Creating...' : 'Create Account'}
                </Button>
              </div>
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
        
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => !open && handleCloseEditDialog()}>
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
                            placeholder="" 
                            className="bg-white border-gray-300 text-black"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
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
                            placeholder="" 
                            className="bg-white border-gray-300 text-black"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
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
                            placeholder="" 
                            className="bg-white border-gray-300 text-black"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
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
                    onClick={handleCloseEditDialog}
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