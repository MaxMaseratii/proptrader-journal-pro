import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { apiRequest } from '@/lib/queryClient';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Target, 
  TrendingUp, 
  DollarSign, 
  BarChart3,
  Clock,
  Zap,
  Brain,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import type { TradingStrategy } from '@shared/schema';

interface StrategyFormData {
  name: string;
  description: string;
  rules: string[];
  riskRewardRatio: number;
  expectedWinRate: number;
  riskAmountUsd: number;
  tradingAssets: string[];
  sessionTimes: string;
  maxTradesPerDay: number;
  isActive: boolean;
}

const defaultFormData: StrategyFormData = {
  name: '',
  description: '',
  rules: [''],
  riskRewardRatio: 2.0,
  expectedWinRate: 50.0,
  riskAmountUsd: 100.0,
  tradingAssets: [],
  sessionTimes: '{"start": "09:30", "end": "16:00", "timezone": "EST"}',
  maxTradesPerDay: 3,
  isActive: true,
};

const tradingAssetOptions = [
  'ES (S&P 500)', 'NQ (NASDAQ)', 'YM (Dow Jones)', 'RTY (Russell 2000)',
  'CL (Crude Oil)', 'GC (Gold)', 'SI (Silver)', 'NG (Natural Gas)',
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD',
  'AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA',
  'BTC/USD', 'ETH/USD', 'Other'
];

interface StrategyManagementProps {
  editStrategyId?: number | null;
  onStrategyUpdated?: () => void;
}

const StrategyManagement: React.FC<StrategyManagementProps> = ({ editStrategyId, onStrategyUpdated }) => {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<TradingStrategy | null>(null);
  const [formData, setFormData] = useState<StrategyFormData>(defaultFormData);
  const [newRule, setNewRule] = useState('');

  // Data queries
  const { data: strategies, isLoading } = useQuery<TradingStrategy[]>({
    queryKey: ['/api/strategies'],
  });

  // Mutations
  const createStrategyMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/strategies', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/strategies'] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
  });

  const updateStrategyMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest(`/api/strategies/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/strategies'] });
      setIsEditDialogOpen(false);
      setEditingStrategy(null);
      resetForm();
      onStrategyUpdated?.(); // Call parent callback
    },
  });

  const deleteStrategyMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/strategies/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/strategies'] });
    },
  });

  // Helper functions
  const calculateExpectedValue = (winRate: number, rr: number, riskAmount: number) => {
    // Kelly Criterion based expected value: (WinRate * RR - LossRate) * RiskAmount
    const winRateDecimal = winRate / 100;
    const lossRateDecimal = 1 - winRateDecimal;
    const expectedValue = (winRateDecimal * rr - lossRateDecimal) * riskAmount;
    return expectedValue;
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setNewRule('');
    setActiveTab("basic");
  };

  const addRule = () => {
    if (newRule.trim()) {
      setFormData(prev => ({
        ...prev,
        rules: [...prev.rules.filter(rule => rule.trim()), newRule.trim()]
      }));
      setNewRule('');
    }
  };

  const removeRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const updateRule = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.map((rule, i) => i === index ? value : rule)
    }));
  };

  const handleAssetToggle = (asset: string) => {
    setFormData(prev => ({
      ...prev,
      tradingAssets: prev.tradingAssets.includes(asset)
        ? prev.tradingAssets.filter(a => a !== asset)
        : [...prev.tradingAssets, asset]
    }));
  };

  const handleSubmit = () => {
    const expectedValue = calculateExpectedValue(
      formData.expectedWinRate,
      formData.riskRewardRatio,
      formData.riskAmountUsd
    );

    const strategyData = {
      ...formData,
      expectedValue,
      rules: formData.rules.filter(rule => rule.trim()),
    };

    if (editingStrategy) {
      updateStrategyMutation.mutate({ id: editingStrategy.id, data: strategyData });
    } else {
      createStrategyMutation.mutate(strategyData);
    }
  };

  const openEditDialog = (strategy: TradingStrategy) => {
    setEditingStrategy(strategy);
    setFormData({
      name: strategy.name,
      description: strategy.description || '',
      rules: Array.isArray(strategy.rules) ? strategy.rules : [],
      riskRewardRatio: strategy.riskRewardRatio || 2.0,
      expectedWinRate: strategy.expectedWinRate || 50.0,
      riskAmountUsd: strategy.riskAmountUsd || 100.0,
      tradingAssets: Array.isArray(strategy.tradingAssets) ? strategy.tradingAssets : [],
      sessionTimes: strategy.sessionTimes || '{"start": "09:30", "end": "16:00", "timezone": "EST"}',
      maxTradesPerDay: strategy.maxTradesPerDay || 3,
      isActive: strategy.isActive !== false,
    });
    setIsEditDialogOpen(true);
  };

  const confirmDelete = (strategy: TradingStrategy) => {
    if (window.confirm(`Are you sure you want to delete "${strategy.name}"? This action cannot be undone.`)) {
      deleteStrategyMutation.mutate(strategy.id);
    }
  };

  // Effect to handle external edit request
  useEffect(() => {
    if (editStrategyId && strategies) {
      const strategyToEdit = strategies.find(s => s.id === editStrategyId);
      if (strategyToEdit) {
        openEditDialog(strategyToEdit);
      }
    }
  }, [editStrategyId, strategies]);

  const getStrategyPerformanceColor = (expectedValue: number) => {
    if (expectedValue > 20) return 'text-green-400';
    if (expectedValue > 0) return 'text-yellow-400';
    return 'text-red-400';
  };

  const [activeTab, setActiveTab] = useState("basic");

  const StrategyFormContent = () => (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="risk">Risk & Returns</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label className="text-white">Strategy Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Scalping ES Morning Session"
                className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
              />
            </div>
            <div>
              <Label className="text-white">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your trading strategy..."
                className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                rows={3}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div>
            <Label className="text-white">Trading Rules</Label>
            <div className="space-y-3">
              {formData.rules.map((rule, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={rule}
                    onChange={(e) => updateRule(index, e.target.value)}
                    placeholder="Enter a trading rule..."
                    className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400 flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRule(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  placeholder="Add a new rule..."
                  className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400 flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && addRule()}
                />
                <Button onClick={addRule} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Risk Amount (USD)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.riskAmountUsd}
                onChange={(e) => setFormData(prev => ({ ...prev, riskAmountUsd: parseFloat(e.target.value) || 0 }))}
                className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
              />
            </div>
            <div>
              <Label className="text-white">Risk-Reward Ratio</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.riskRewardRatio}
                onChange={(e) => setFormData(prev => ({ ...prev, riskRewardRatio: parseFloat(e.target.value) || 0 }))}
                className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
              />
            </div>
            <div>
              <Label className="text-white">Expected Win Rate (%)</Label>
              <Input
                type="number"
                step="1"
                min="0"
                max="100"
                value={formData.expectedWinRate}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedWinRate: parseFloat(e.target.value) || 0 }))}
                className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
              />
            </div>
            <div>
              <Label className="text-white">Max Trades per Day</Label>
              <Input
                type="number"
                min="1"
                value={formData.maxTradesPerDay}
                onChange={(e) => setFormData(prev => ({ ...prev, maxTradesPerDay: parseInt(e.target.value) || 1 }))}
                className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
              />
            </div>
          </div>
          
          {/* Expected Value Display */}
          <div className="p-4 bg-gray-700 rounded-lg border border-yellow-400/20">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Expected Value per Trade:</span>
              <span className={`text-xl font-bold ${getStrategyPerformanceColor(calculateExpectedValue(formData.expectedWinRate, formData.riskRewardRatio, formData.riskAmountUsd))}`}>
                ${calculateExpectedValue(formData.expectedWinRate, formData.riskRewardRatio, formData.riskAmountUsd).toFixed(2)}
              </span>
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Formula: (Win Rate × RR - Loss Rate) × Risk Amount
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div>
            <Label className="text-white">Trading Assets</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {tradingAssetOptions.map(asset => (
                <div key={asset} className="flex items-center space-x-2">
                  <Checkbox
                    id={asset}
                    checked={formData.tradingAssets.includes(asset)}
                    onCheckedChange={() => handleAssetToggle(asset)}
                    className="border-gray-600"
                  />
                  <Label htmlFor={asset} className="text-sm text-gray-300">{asset}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <Label className="text-white">Trading Session Times</Label>
            <Textarea
              value={formData.sessionTimes}
              onChange={(e) => setFormData(prev => ({ ...prev, sessionTimes: e.target.value }))}
              placeholder='{"start": "09:30", "end": "16:00", "timezone": "EST"}'
              className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
            />
            <p className="text-xs text-gray-400 mt-1">JSON format for trading session configuration</p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-600">
        <Button
          variant="outline"
          onClick={() => {
            if (editingStrategy) {
              setIsEditDialogOpen(false);
              setEditingStrategy(null);
            } else {
              setIsCreateDialogOpen(false);
            }
            resetForm();
          }}
          className="border-gray-600 text-gray-300"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!formData.name.trim() || createStrategyMutation.isPending || updateStrategyMutation.isPending}
          className="bg-yellow-500 hover:bg-yellow-600 text-black"
        >
          {editingStrategy ? 'Update Strategy' : 'Create Strategy'}
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-white">Loading strategies...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-yellow-400">Trading Strategies</h2>
          <p className="text-gray-300">Manage your trading strategies with risk calculations</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
              <Plus className="w-4 h-4 mr-2" />
              Create Strategy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-yellow-400">Create New Trading Strategy</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a new trading strategy with rules, risk management, and performance targets.
              </DialogDescription>
            </DialogHeader>
            <StrategyFormContent />
          </DialogContent>
        </Dialog>
      </div>

      {/* Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies?.map((strategy) => {
          const expectedValue = strategy.expectedValue || calculateExpectedValue(
            strategy.expectedWinRate || 50,
            strategy.riskRewardRatio || 2,
            strategy.riskAmountUsd || 100
          );
          
          return (
            <Card key={strategy.id} className="bg-gray-800 border-gray-700 hover:border-yellow-400/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">{strategy.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={strategy.isActive ? "default" : "secondary"} className="text-xs">
                      {strategy.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(strategy)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-yellow-400"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmDelete(strategy)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                {strategy.description && (
                  <p className="text-sm text-gray-400">{strategy.description}</p>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-gray-700 rounded">
                    <div className="text-white font-bold">${strategy.riskAmountUsd || 100}</div>
                    <div className="text-xs text-gray-400">Risk Amount</div>
                  </div>
                  <div className="text-center p-2 bg-gray-700 rounded">
                    <div className="text-white font-bold">1:{strategy.riskRewardRatio || 2}</div>
                    <div className="text-xs text-gray-400">Risk:Reward</div>
                  </div>
                  <div className="text-center p-2 bg-gray-700 rounded">
                    <div className="text-white font-bold">{strategy.expectedWinRate || 50}%</div>
                    <div className="text-xs text-gray-400">Win Rate</div>
                  </div>
                  <div className="text-center p-2 bg-gray-700 rounded">
                    <div className={`font-bold ${getStrategyPerformanceColor(expectedValue)}`}>
                      ${expectedValue.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400">Expected Value</div>
                  </div>
                </div>

                {/* Trading Rules Preview */}
                {Array.isArray(strategy.rules) && strategy.rules.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-300 mb-2">Rules:</div>
                    <div className="space-y-1">
                      {strategy.rules.slice(0, 3).map((rule, index) => (
                        <div key={index} className="text-xs text-gray-400 flex items-start gap-1">
                          <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                          {rule}
                        </div>
                      ))}
                      {strategy.rules.length > 3 && (
                        <div className="text-xs text-gray-500">+{strategy.rules.length - 3} more rules</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Trading Assets */}
                {Array.isArray(strategy.tradingAssets) && strategy.tradingAssets.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-300 mb-2">Assets:</div>
                    <div className="flex flex-wrap gap-1">
                      {strategy.tradingAssets.slice(0, 3).map((asset) => (
                        <Badge key={asset} variant="outline" className="text-xs border-yellow-400/50 text-yellow-400">
                          {asset}
                        </Badge>
                      ))}
                      {strategy.tradingAssets.length > 3 && (
                        <Badge variant="outline" className="text-xs border-gray-500 text-gray-500">
                          +{strategy.tradingAssets.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(!strategies || strategies.length === 0) && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="text-center py-12">
            <Target className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Trading Strategies</h3>
            <p className="text-gray-400 mb-6">Create your first trading strategy to get started with daily planning.</p>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Strategy
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl bg-gray-800 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-yellow-400">Create New Trading Strategy</DialogTitle>
                </DialogHeader>
                <StrategyFormContent />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Edit Strategy Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-yellow-400">Edit Trading Strategy</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update your trading strategy configuration and rules.
            </DialogDescription>
          </DialogHeader>
          <StrategyFormContent />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StrategyManagement;