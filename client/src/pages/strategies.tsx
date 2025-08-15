import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { TradingStrategy, Trade } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { getUniversalValueColor, getStatusColor } from "@/lib/colorUtils";
import { z } from 'zod';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Target, 
  Search
} from 'lucide-react';

// Create a simplified schema for strategy forms
const strategyFormSchema = z.object({
  name: z.string().min(1, 'Strategy name is required'),
  description: z.string().optional(),
  userId: z.string().min(1, 'User ID is required'),
  riskRewardRatio: z.number().min(0.5).max(10).optional(),
  expectedWinRate: z.number().min(20).max(95).optional(),
  riskAmountUsd: z.number().min(1).optional(),
  maxTradesPerDay: z.number().min(1).max(20).optional(),
  sessionTimes: z.string().optional(),
  isActive: z.boolean().optional(),
  rules: z.string().optional(),
});

type StrategyFormData = z.infer<typeof strategyFormSchema>;

interface StrategyPerformance {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  expectancy: number;
  lastUsed: string;
}

export default function StrategyManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<TradingStrategy | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rules, setRules] = useState<string[]>(['']);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: strategies = [], isLoading } = useQuery<TradingStrategy[]>({
    queryKey: ['/api/trading-strategies'],
  });

  const { data: trades = [] } = useQuery<Trade[]>({
    queryKey: ['/api/trades'],
  });

  const form = useForm<StrategyFormData>({
    resolver: zodResolver(strategyFormSchema),
    defaultValues: {
      name: '',
      description: '',
      userId: 'current-user', // Will be replaced by actual user ID
      riskAmountUsd: 100,
      riskRewardRatio: 2,
      expectedWinRate: 60,
      maxTradesPerDay: 3,
      sessionTimes: '09:30-16:00',
      isActive: true,
      rules: '',
    },
  });

  const createStrategyMutation = useMutation({
    mutationFn: async (data: StrategyFormData) => {
      const strategyData = {
        ...data,
        rules: data.rules ? JSON.stringify(data.rules.split('\n').filter(rule => rule.trim())) : JSON.stringify([]),
        tradingAssets: JSON.stringify(['Futures']),
      };
      return apiRequest('/api/trading-strategies', 'POST', strategyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trading-strategies'] });
      setIsCreateDialogOpen(false);
      form.reset();
      setRules(['']);
      toast({
        title: 'Strategy Created',
        description: 'Your trading strategy has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create strategy.',
        variant: 'destructive',
      });
    },
  });

  const updateStrategyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<StrategyFormData> }) => {
      const strategyData = {
        ...data,
        rules: data.rules ? JSON.stringify(data.rules.split('\n').filter(rule => rule.trim())) : undefined,
      };
      return apiRequest(`/api/trading-strategies/${id}`, 'PATCH', strategyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trading-strategies'] });
      setIsEditDialogOpen(false);
      setEditingStrategy(null);
      toast({
        title: 'Strategy Updated',
        description: 'Your strategy has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update strategy.',
        variant: 'destructive',
      });
    },
  });

  const deleteStrategyMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/trading-strategies/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trading-strategies'] });
      toast({
        title: 'Strategy Deleted',
        description: 'Strategy has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete strategy.',
        variant: 'destructive',
      });
    },
  });

  const calculateStrategyPerformance = (strategy: TradingStrategy): StrategyPerformance => {
    // Note: In the actual schema, trades don't have a strategyId field
    // This is a placeholder calculation for demo purposes
    const strategyTrades = trades.filter(trade => trade.notes?.includes(strategy.name) || false);
    const winningTrades = strategyTrades.filter(trade => (trade.pnl || 0) > 0);
    const losingTrades = strategyTrades.filter(trade => (trade.pnl || 0) < 0);
    
    const totalPnL = strategyTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const winRate = strategyTrades.length > 0 ? (winningTrades.length / strategyTrades.length) * 100 : 0;
    
    const totalWins = winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0));
    
    const averageWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
    const averageLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0;
    
    const expectancy = strategyTrades.length > 0 ? 
      (winRate / 100) * averageWin - ((100 - winRate) / 100) * averageLoss : 0;
    
    const lastTrade = strategyTrades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const lastUsed = lastTrade ? lastTrade.date : 'Never';
    
    return {
      totalTrades: strategyTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate,
      totalPnL,
      averageWin,
      averageLoss,
      profitFactor,
      expectancy,
      lastUsed,
    };
  };

  const filteredStrategies = useMemo(() => {
    return strategies.filter(strategy => {
      const matchesSearch = strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (strategy.description && strategy.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && (strategy.isActive ?? true)) ||
                           (statusFilter === 'inactive' && !(strategy.isActive ?? true));
      return matchesSearch && matchesStatus;
    });
  }, [strategies, searchTerm, statusFilter]);

  const handleCreateStrategy = (data: StrategyFormData) => {
    createStrategyMutation.mutate(data);
  };

  const handleEditStrategy = (strategy: TradingStrategy) => {
    setEditingStrategy(strategy);
    let strategyRules = [''];
    
    try {
      if (strategy.rules && typeof strategy.rules === 'string') {
        const parsedRules = JSON.parse(strategy.rules);
        if (Array.isArray(parsedRules) && parsedRules.length > 0) {
          strategyRules = parsedRules;
        }
      } else if (Array.isArray(strategy.rules) && strategy.rules.length > 0) {
        strategyRules = strategy.rules as string[];
      }
    } catch (error) {
      console.error('Error parsing strategy rules:', error);
    }
    
    setRules(strategyRules);
    form.reset({
      name: strategy.name,
      description: strategy.description || '',
      userId: strategy.userId,
      riskAmountUsd: strategy.riskAmountUsd || 100,
      riskRewardRatio: strategy.riskRewardRatio || 2,
      expectedWinRate: strategy.expectedWinRate || 60,
      maxTradesPerDay: strategy.maxTradesPerDay || 3,
      sessionTimes: strategy.sessionTimes || '09:30-16:00',
      isActive: strategy.isActive ?? true,
      rules: strategyRules.join('\n'),
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateStrategy = (data: StrategyFormData) => {
    if (!editingStrategy) return;
    updateStrategyMutation.mutate({ id: editingStrategy.id, data });
  };

  const addRule = () => {
    setRules([...rules, '']);
  };

  const removeRule = (index: number) => {
    if (rules.length > 1) {
      setRules(rules.filter((_, i) => i !== index));
    }
  };

  const updateRule = (index: number, value: string) => {
    const newRules = [...rules];
    newRules[index] = value;
    setRules(newRules);
    form.setValue('rules', newRules.join('\n'));
  };

  const getStatusColor = (isActive: boolean | null) => {
    return (isActive ?? true) ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                                'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const getPerformanceColor = (value: number) => {
    return value >= 0 ? 'text-green-500' : 'text-red-500';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg text-white p-6 flex items-center justify-center">
        <div className="text-white text-xl">Loading strategies...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-rainbow">
              Strategy Management
            </h1>
            <p className="text-gray-400 mt-2">Create, manage, and track your trading strategies</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Strategy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                  Create New Trading Strategy
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Define your trading strategy with rules, risk parameters, and performance expectations.
                </DialogDescription>
              </DialogHeader>
              
              <ScrollArea className="max-h-[70vh] overflow-y-auto pr-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCreateStrategy)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Strategy Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., My Custom Strategy" 
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
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your strategy's core concept and market conditions" 
                              className="bg-white border-gray-300 text-black resize-none"
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <Label className="text-white mb-2 block">Trading Rules</Label>
                      <div className="space-y-2">
                        {rules.map((rule, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input
                              placeholder={`Rule ${index + 1}`}
                              value={rule}
                              onChange={(e) => updateRule(index, e.target.value)}
                              className="bg-white border-gray-300 text-black flex-1"
                            />
                            {rules.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeRule(index)}
                                className="border-red-600 text-red-500 hover:bg-red-600/20"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addRule}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Rule
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sessionTimes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Trading Session</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., 09:30-16:00" 
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
                        name="maxTradesPerDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Max Trades per Day</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="3" 
                                className="bg-white border-gray-300 text-black"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                        name="riskAmountUsd"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Risk Amount ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="100" 
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
                        name="riskRewardRatio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Risk:Reward Ratio</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Slider
                                  value={[field.value || 2]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  max={5}
                                  min={0.5}
                                  step={0.1}
                                  className="w-full"
                                />
                                <div className="text-center text-sm text-gray-400">
                                  1:{field.value || 2}
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="expectedWinRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Expected Win Rate (%)</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Slider
                                  value={[field.value || 60]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  max={95}
                                  min={20}
                                  step={1}
                                  className="w-full"
                                />
                                <div className="text-center text-sm text-gray-400">
                                  {field.value || 60}%
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base text-white">Active Strategy</FormLabel>
                            <div className="text-sm text-gray-400">
                              Enable this strategy for daily trading plans
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createStrategyMutation.isPending}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      >
                        {createStrategyMutation.isPending ? 'Creating...' : 'Create Strategy'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search strategies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Strategies</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredStrategies.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Target className="mx-auto h-16 w-16 text-gray-500 mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">
                {strategies.length === 0 ? 'No Trading Strategies' : 'No Strategies Found'}
              </h3>
              <p className="text-gray-500 mb-4">
                {strategies.length === 0 
                  ? 'Create your first trading strategy to start organized trading'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              {strategies.length === 0 && (
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Strategy
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStrategies.map((strategy) => {
              const performance = calculateStrategyPerformance(strategy);
              
              return (
                <Card key={strategy.id} className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 hover:border-yellow-400/40 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(strategy.isActive)}>
                        {(strategy.isActive ?? true) ? 'Active' : 'Inactive'}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStrategy(strategy)}
                          className="text-gray-400 hover:text-white h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this strategy?')) {
                              deleteStrategyMutation.mutate(strategy.id);
                            }
                          }}
                          className="text-gray-400 hover:text-red-500 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-white">{strategy.name}</CardTitle>
                    <p className="text-sm text-gray-400 line-clamp-2">{strategy.description || 'No description provided'}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Total P&L</p>
                        <p className={`text-lg font-semibold ${getPerformanceColor(performance.totalPnL)}`}>
                          {formatCurrency(performance.totalPnL)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Win Rate</p>
                        <p className="text-lg font-semibold text-white">{formatPercentage(performance.winRate)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Total Trades</p>
                        <p className="text-sm font-medium text-white">{performance.totalTrades}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">R:R Ratio</p>
                        <p className="text-sm font-medium text-white">1:{strategy.riskRewardRatio || 2}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-700">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Last Used: {performance.lastUsed}</span>
                        <span>{strategy.sessionTimes || 'N/A'}</span>
                      </div>
                    </div>

                    {strategy.rules && (
                      <div className="pt-2">
                        <p className="text-xs text-gray-400 mb-1">Rules</p>
                        <div className="text-xs text-gray-300 bg-gray-800/50 rounded p-2 max-h-20 overflow-y-auto">
                          {(() => {
                            try {
                              const parsedRules = typeof strategy.rules === 'string' 
                                ? JSON.parse(strategy.rules) 
                                : strategy.rules;
                              
                              if (Array.isArray(parsedRules)) {
                                return parsedRules.map((rule, index) => (
                                  <div key={index} className="flex items-start space-x-1">
                                    <span className="text-yellow-400 mt-0.5">•</span>
                                    <span className="line-clamp-1">{rule}</span>
                                  </div>
                                ));
                              }
                              return <span>No rules defined</span>;
                            } catch (error) {
                              return <span>No rules defined</span>;
                            }
                          })()}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Edit Strategy Dialog - Similar structure to create dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                Edit Trading Strategy
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Update your strategy parameters and performance expectations.
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-[70vh] overflow-y-auto pr-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleUpdateStrategy)} className="space-y-4">
                  {/* Same form fields as create dialog */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Strategy Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., My Custom Strategy" 
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your strategy's core concept and market conditions" 
                            className="bg-white border-gray-300 text-black resize-none"
                            rows={3}
                            {...field} 
                          />
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
                      disabled={updateStrategyMutation.isPending}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      {updateStrategyMutation.isPending ? 'Updating...' : 'Update Strategy'}
                    </Button>
                  </div>
                </form>
              </Form>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}