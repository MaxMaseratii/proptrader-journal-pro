import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Trash2, DollarSign } from 'lucide-react';

const tradingAssetOptions = [
  'ES (S&P 500)', 'NQ (NASDAQ)', 'YM (Dow Jones)', 'RTY (Russell 2000)',
  'CL (Crude Oil)', 'GC (Gold)', 'SI (Silver)', 'NG (Natural Gas)',
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD',
  'AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA',
  'BTC/USD', 'ETH/USD', 'Other'
];

interface StrategyFormProps {
  onClose?: () => void;
  editStrategy?: any;
}

const StrategyForm: React.FC<StrategyFormProps> = ({ onClose, editStrategy }) => {
  const queryClient = useQueryClient();
  
  // Simple form state - no complex memoization needed
  const [name, setName] = useState(editStrategy?.name || '');
  const [description, setDescription] = useState(editStrategy?.description || '');
  const [rules, setRules] = useState<string[]>(editStrategy?.rules || ['']);
  const [riskAmount, setRiskAmount] = useState(editStrategy?.riskAmountUsd || 100);
  const [riskReward, setRiskReward] = useState(editStrategy?.riskRewardRatio || 2.0);
  const [winRate, setWinRate] = useState(editStrategy?.expectedWinRate || 50);
  const [maxTrades, setMaxTrades] = useState(editStrategy?.maxTradesPerDay || 3);
  const [assets, setAssets] = useState<string[]>(editStrategy?.tradingAssets || []);
  const [sessionTimes, setSessionTimes] = useState(editStrategy?.sessionTimes || '{"start": "09:30", "end": "16:00", "timezone": "EST"}');

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/strategies', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/strategies'] });
      onClose?.();
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest(`/api/strategies/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/strategies'] });
      onClose?.();
      resetForm();
    },
  });

  const resetForm = () => {
    setName('');
    setDescription('');
    setRules(['']);
    setRiskAmount(100);
    setRiskReward(2.0);
    setWinRate(50);
    setMaxTrades(3);
    setAssets([]);
    setSessionTimes('{"start": "09:30", "end": "16:00", "timezone": "EST"}');
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
  };

  const toggleAsset = (asset: string) => {
    if (assets.includes(asset)) {
      setAssets(assets.filter(a => a !== asset));
    } else {
      setAssets([...assets, asset]);
    }
  };

  const calculateExpectedValue = () => {
    const winRateDecimal = winRate / 100;
    const lossRateDecimal = 1 - winRateDecimal;
    return (winRateDecimal * riskReward - lossRateDecimal) * riskAmount;
  };

  const handleSubmit = () => {
    const expectedValue = calculateExpectedValue();
    const strategyData = {
      name,
      description,
      rules: rules.filter(rule => rule.trim()),
      riskAmountUsd: riskAmount,
      riskRewardRatio: riskReward,
      expectedWinRate: winRate,
      maxTradesPerDay: maxTrades,
      tradingAssets: assets,
      sessionTimes,
      expectedValue,
      isActive: true,
    };

    if (editStrategy) {
      updateMutation.mutate({ id: editStrategy.id, data: strategyData });
    } else {
      createMutation.mutate(strategyData);
    }
  };

  const expectedValue = calculateExpectedValue();

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto bg-gray-800 p-6 rounded-lg">
      {/* Basic Info Section */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-yellow-400">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white">Strategy Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Scalping ES Morning Session"
              className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
            />
          </div>
          <div>
            <Label className="text-white">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your trading strategy..."
              className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Trading Rules Section */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-yellow-400">Trading Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rules.map((rule, index) => (
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
                  disabled={rules.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button 
              onClick={addRule} 
              className="bg-yellow-500 hover:bg-yellow-600 text-black w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Risk & Returns Section */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-yellow-400">Risk & Returns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Risk Amount (USD)</Label>
              <Input
                type="number"
                step="0.01"
                value={riskAmount}
                onChange={(e) => setRiskAmount(parseFloat(e.target.value) || 0)}
                className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
              />
            </div>
            <div>
              <Label className="text-white">Risk-Reward Ratio</Label>
              <Input
                type="number"
                step="0.1"
                value={riskReward}
                onChange={(e) => setRiskReward(parseFloat(e.target.value) || 0)}
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
                value={winRate}
                onChange={(e) => setWinRate(parseFloat(e.target.value) || 0)}
                className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
              />
            </div>
            <div>
              <Label className="text-white">Max Trades per Day</Label>
              <Input
                type="number"
                min="1"
                value={maxTrades}
                onChange={(e) => setMaxTrades(parseInt(e.target.value) || 1)}
                className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
              />
            </div>
          </div>
          
          {/* Expected Value Display */}
          <div className="p-4 bg-gray-700 rounded-lg border border-yellow-400/20">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Expected Value per Trade:</span>
              <span className={`text-xl font-bold ${expectedValue > 20 ? 'text-green-400' : expectedValue > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                ${expectedValue.toFixed(2)}
              </span>
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Formula: (Win Rate × RR - Loss Rate) × Risk Amount
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Assets Section */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-yellow-400">Trading Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {tradingAssetOptions.map(asset => (
              <div key={asset} className="flex items-center space-x-2">
                <Checkbox
                  id={asset}
                  checked={assets.includes(asset)}
                  onCheckedChange={() => toggleAsset(asset)}
                  className="border-gray-600"
                />
                <Label htmlFor={asset} className="text-sm text-gray-300">{asset}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Session Times Section */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-yellow-400">Trading Session</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label className="text-white">Trading Session Times</Label>
            <Textarea
              value={sessionTimes}
              onChange={(e) => setSessionTimes(e.target.value)}
              placeholder='{"start": "09:30", "end": "16:00", "timezone": "EST"}'
              className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
            />
            <p className="text-xs text-gray-400 mt-1">JSON format for trading session configuration</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-600">
        <Button
          variant="outline"
          onClick={() => {
            onClose?.();
            resetForm();
          }}
          className="border-gray-600 text-gray-300"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!name.trim() || createMutation.isPending || updateMutation.isPending}
          className="bg-yellow-500 hover:bg-yellow-600 text-black"
        >
          {editStrategy ? 'Update Strategy' : 'Create Strategy'}
        </Button>
      </div>
    </div>
  );
};

export default StrategyForm;