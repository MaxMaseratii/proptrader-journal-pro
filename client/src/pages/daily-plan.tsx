import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { apiRequest } from '@/lib/queryClient';
import StrategyManagement from '@/components/strategy-management';
import { 
  Target, 
  Shield, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Calendar,
  Brain,
  BookOpen,
  DollarSign,
  Award,
  Timer,
  Activity,
  AlertTriangle,
  CheckCircle,
  Edit,
  Save,
  PlayCircle,
  PauseCircle,
  Zap,
  History,
  Plus,
  Settings
} from 'lucide-react';
import type { Account, TradingStrategy, DailyPlan, Trade } from '@shared/schema';

const DailyPlanPage = () => {
  const queryClient = useQueryClient();
  
  // Basic state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null);
  const [isTrading, setIsTrading] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  
  // Dialog states
  const [isStrategyDialogOpen, setIsStrategyDialogOpen] = useState(false);
  const [isCreatePlanDialogOpen, setIsCreatePlanDialogOpen] = useState(false);
  const [isCreateStrategyDialogOpen, setIsCreateStrategyDialogOpen] = useState(false);
  
  // Form data for new plan
  const [newPlanData, setNewPlanData] = useState({
    riskAmount: 100,
    targetProfit: 200,
    maxTrades: 3,
    plannedTrades: 2,
    riskRewardRatio: 2,
    maxRiskPercentage: 2,
    plannedHours: 6,
    hourlyWage: 50,
    startTime: '09:30',
    endTime: '16:00',
    notes: ''
  });

  // Journal state
  const [journalEntry, setJournalEntry] = useState({
    whatWentWrong: '',
    whatWentRight: '',
    lessonsLearned: '',
    improvementPlan: ''
  });

  // Data queries
  const { data: accounts } = useQuery<Account[]>({ queryKey: ['/api/accounts'] });
  const { data: strategies } = useQuery<TradingStrategy[]>({ queryKey: ['/api/strategies'] });
  const { data: trades } = useQuery<Trade[]>({ queryKey: ['/api/trades'] });
  const { data: dailyPlans } = useQuery<DailyPlan[]>({ queryKey: ['/api/daily-plans'] });
  const { data: currentPlan } = useQuery<DailyPlan | null>({
    queryKey: ['/api/daily-plans/by-date'],
    enabled: !!selectedDate && !!selectedAccount,
  });

  // Mutations
  const createPlanMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/daily-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-plans'] });
      setIsCreatePlanDialogOpen(false);
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest(`/api/daily-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-plans'] });
    },
  });

  // Calculate actual results from trades
  const actualResults = useMemo(() => {
    if (!trades || !selectedAccount || !selectedDate) return {
      actualPnL: 0,
      tradesExecuted: 0,
      wins: 0,
      losses: 0,
      actualRR: 0,
      hoursWorked: 0,
      riskUsed: 0,
      biggestWin: 0,
      biggestLoss: 0,
    };

    const dayTrades = trades.filter(trade => 
      trade.accountId === selectedAccount && 
      trade.date === selectedDate
    );

    const winningTrades = dayTrades.filter(t => (t.pnl || 0) > 0);
    const losingTrades = dayTrades.filter(t => (t.pnl || 0) < 0);
    const wins = winningTrades.length;
    const losses = losingTrades.length;

    return {
      actualPnL: dayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0),
      tradesExecuted: dayTrades.length,
      wins,
      losses,
      actualRR: wins + losses > 0 ? wins / (wins + losses) : 0,
      hoursWorked: 0, // This would be calculated from session timing
      biggestWin: winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl || 0)) : 0,
      biggestLoss: losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnl || 0)) : 0,
      riskUsed: dayTrades.reduce((sum, trade) => sum + Math.abs(trade.riskAmount || 0), 0),
    };
  }, [trades, selectedAccount, selectedDate]);

  // Helper functions
  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const calculateWinRate = () => {
    const total = actualResults.wins + actualResults.losses;
    return total > 0 ? (actualResults.wins / total * 100).toFixed(1) : '0';
  };

  const getProgressColor = (actual: number, target: number) => {
    const percentage = target > 0 ? (actual / target) * 100 : 0;
    if (percentage >= 100) return "text-green-400";
    if (percentage >= 80) return "text-yellow-400";
    if (percentage >= 60) return "text-orange-400";
    return "text-red-400";
  };

  const startTradingSession = () => {
    setIsTrading(true);
    setSessionStartTime(Date.now());
  };

  const stopTradingSession = () => {
    setIsTrading(false);
    setSessionStartTime(null);
  };

  const createNewPlan = () => {
    const planPayload = {
      ...newPlanData,
      date: selectedDate,
      accountId: selectedAccount,
      strategyId: selectedStrategy,
      tradeTime: `${newPlanData.startTime}-${newPlanData.endTime}`,
      actualPnL: 0,
      tradesExecuted: 0,
      wins: 0,
      losses: 0,
      actualRR: 0,
      hoursWorked: 0,
      riskUsed: 0,
      biggestWin: 0,
      biggestLoss: 0,
    };

    createPlanMutation.mutate(planPayload);
  };

  // Get historical plans for the history section
  const historicalPlans = useMemo(() => {
    if (!dailyPlans || !selectedAccount) return [];
    return dailyPlans
      .filter(plan => plan.accountId === selectedAccount)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [dailyPlans, selectedAccount]);

  return (
    <div className="p-6 space-y-6 bg-black min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-yellow-400">Daily Trading Command Center</h1>
          <p className="text-gray-300">{new Date(selectedDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Date selector */}
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-gray-800 border-yellow-400/20 text-white hover:border-yellow-400/40"
          />
          
          {/* Create Strategy Button */}
          <Button 
            onClick={() => setIsCreateStrategyDialogOpen(true)}
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700 border border-yellow-400/20 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Strategy
          </Button>
          
          {/* Create Plan Button */}
          <Dialog open={isCreatePlanDialogOpen} onOpenChange={setIsCreatePlanDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700 border border-yellow-400/20 shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
              <DialogHeader>
                <DialogTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Create Daily Trading Plan</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Set up your trading plan for {new Date(selectedDate).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Account and Strategy Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Trading Account</Label>
                    <Select value={selectedAccount?.toString() || ""} onValueChange={(value) => setSelectedAccount(parseInt(value))}>
                      <SelectTrigger className="bg-gray-800 border-yellow-400/20 text-white hover:border-yellow-400/40">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-yellow-400/20">
                        {accounts?.map((account) => (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            {account.name} - {account.type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <Label className="text-white">Trading Strategy</Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsStrategyDialogOpen(true)}
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                    <Select value={selectedStrategy?.toString() || ""} onValueChange={(value) => setSelectedStrategy(parseInt(value))}>
                      <SelectTrigger className="bg-gray-800 border-yellow-400/20 text-white hover:border-yellow-400/40">
                        <SelectValue placeholder="Select strategy" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-yellow-400/20">
                        {strategies?.map((strategy) => (
                          <SelectItem key={strategy.id} value={strategy.id.toString()}>
                            {strategy.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Trading Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Start Time</Label>
                    <Input
                      type="time"
                      value={newPlanData.startTime}
                      onChange={(e) => setNewPlanData(prev => ({ ...prev, startTime: e.target.value }))}
                      className="bg-gray-800 border-yellow-400/20 text-white hover:border-yellow-400/40"
                    />
                  </div>
                  <div>
                    <Label className="text-white">End Time</Label>
                    <Input
                      type="time"
                      value={newPlanData.endTime}
                      onChange={(e) => setNewPlanData(prev => ({ ...prev, endTime: e.target.value }))}
                      className="bg-gray-800 border-yellow-400/20 text-white hover:border-yellow-400/40"
                    />
                  </div>
                </div>

                {/* Risk and Targets */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-white">Risk Amount ($)</Label>
                    <Input
                      type="number"
                      value={newPlanData.riskAmount}
                      onChange={(e) => setNewPlanData(prev => ({ ...prev, riskAmount: parseFloat(e.target.value) || 0 }))}
                      className="bg-gray-800 border-yellow-400/20 text-white hover:border-yellow-400/40"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Target Profit ($)</Label>
                    <Input
                      type="number"
                      value={newPlanData.targetProfit}
                      onChange={(e) => setNewPlanData(prev => ({ ...prev, targetProfit: parseFloat(e.target.value) || 0 }))}
                      className="bg-gray-800 border-yellow-400/20 text-white hover:border-yellow-400/40"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Max Trades</Label>
                    <Input
                      type="number"
                      value={newPlanData.maxTrades}
                      onChange={(e) => setNewPlanData(prev => ({ ...prev, maxTrades: parseInt(e.target.value) || 0 }))}
                      className="bg-gray-800 border-yellow-400/20 text-white hover:border-yellow-400/40"
                    />
                  </div>
                  <div>
                    <Label className="text-white">RR Ratio</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newPlanData.riskRewardRatio}
                      onChange={(e) => setNewPlanData(prev => ({ ...prev, riskRewardRatio: parseFloat(e.target.value) || 0 }))}
                      className="bg-gray-800 border-yellow-400/20 text-white hover:border-yellow-400/40"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label className="text-white">Trading Notes</Label>
                  <Textarea
                    value={newPlanData.notes}
                    onChange={(e) => setNewPlanData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Enter your trading plan notes..."
                    className="bg-gray-800 border-yellow-400/20 text-white hover:border-yellow-400/40"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-600">
                <Button
                  variant="outline"
                  onClick={() => setIsCreatePlanDialogOpen(false)}
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createNewPlan}
                  disabled={!selectedAccount || !selectedStrategy || createPlanMutation.isPending}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700"
                >
                  Create Plan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          {!isTrading ? (
            <Button onClick={startTradingSession} className="bg-green-500 hover:bg-green-600 text-white">
              <PlayCircle className="w-4 h-4 mr-2" />
              Start Session
            </Button>
          ) : (
            <Button onClick={stopTradingSession} className="bg-red-500 hover:bg-red-600 text-white">
              <PauseCircle className="w-4 h-4 mr-2" />
              End Session
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Plan & Live Tracking */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Plan Overview */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center gap-2">
                <Target className="w-5 h-5 text-yellow-400" />
                Today's Plan & Live Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentPlan ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-yellow-400/10">
                    <div className={`text-2xl font-bold ${getProgressColor(actualResults.actualPnL, currentPlan.targetProfit || 0)}`}>
                      ${actualResults.actualPnL.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400">P&L / ${currentPlan.targetProfit}</div>
                    <Progress 
                      value={currentPlan.targetProfit ? (actualResults.actualPnL / currentPlan.targetProfit) * 100 : 0} 
                      className="mt-2 h-2" 
                    />
                  </div>
                  
                  <div className="text-center p-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-yellow-400/10">
                    <div className={`text-2xl font-bold ${getProgressColor(actualResults.tradesExecuted, currentPlan.maxTrades || 0)}`}>
                      {actualResults.tradesExecuted}
                    </div>
                    <div className="text-xs text-gray-400">Trades / {currentPlan.maxTrades}</div>
                    <Progress 
                      value={currentPlan.maxTrades ? (actualResults.tradesExecuted / currentPlan.maxTrades) * 100 : 0} 
                      className="mt-2 h-2" 
                    />
                  </div>
                  
                  <div className="text-center p-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-yellow-400/10">
                    <div className="text-2xl font-bold text-white">{calculateWinRate()}%</div>
                    <div className="text-xs text-gray-400">Win Rate</div>
                    <div className="text-xs text-green-400">{actualResults.wins}W / {actualResults.losses}L</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-yellow-400/10">
                    <div className="text-2xl font-bold text-white">
                      {currentPlan.tradeTime || 'Not set'}
                    </div>
                    <div className="text-xs text-gray-400">Trading Hours</div>
                    {isTrading && sessionStartTime && (
                      <div className="text-xs text-green-400">
                        Session: {formatTime(Date.now() - sessionStartTime)}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No plan created for today</p>
                  <Button onClick={() => setIsCreatePlanDialogOpen(true)} className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Today's Plan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historical Plans Widget */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center gap-2">
                <History className="w-5 h-5 text-yellow-400" />
                Historical Trading Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historicalPlans.length > 0 ? (
                <div className="space-y-3">
                  {historicalPlans.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-yellow-400/10">
                      <div>
                        <div className="text-sm font-medium text-white">{new Date(plan.date).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">
                          {plan.tradesExecuted || 0} trades • {((plan.wins || 0) / Math.max(1, (plan.wins || 0) + (plan.losses || 0)) * 100).toFixed(0)}% WR
                        </div>
                      </div>
                      <div className={`text-right ${
                        (plan.actualPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        <div className="font-bold">${(plan.actualPnL || 0).toFixed(2)}</div>
                        <div className="text-xs">P&L</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Calendar className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No historical plans found</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Strategy Rules */}
          {selectedStrategy && strategies?.find(s => s.id === selectedStrategy) && (
            <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-yellow-400" />
                  Strategy Rules & Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const strategy = strategies.find(s => s.id === selectedStrategy);
                  return strategy ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-3 text-center">
                        <div className="p-2 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-yellow-400/10">
                          <div className="text-white font-bold">${strategy.riskAmountUsd || 100}</div>
                          <div className="text-xs text-gray-400">Risk</div>
                        </div>
                        <div className="p-2 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-yellow-400/10">
                          <div className="text-white font-bold">1:{strategy.riskRewardRatio || 2}</div>
                          <div className="text-xs text-gray-400">RR</div>
                        </div>
                        <div className="p-2 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-yellow-400/10">
                          <div className="text-white font-bold">{strategy.expectedWinRate || 50}%</div>
                          <div className="text-xs text-gray-400">Win Rate</div>
                        </div>
                        <div className="p-2 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-yellow-400/10">
                          <div className={`font-bold ${
                            (strategy.expectedValue || 0) > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            ${(strategy.expectedValue || 0).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400">Expected Value</div>
                        </div>
                      </div>
                      
                      {Array.isArray(strategy.rules) && strategy.rules.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-300">Rules to Follow:</div>
                          {strategy.rules.map((rule, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-yellow-400/10">
                              <span className="text-sm text-gray-300">{rule}</span>
                              <CheckCircle className="w-4 h-4 text-gray-500" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null;
                })()}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Journal & History */}
        <div className="space-y-6">
          {/* Historical Strategies Widget */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center gap-2">
                <Brain className="w-5 h-5 text-yellow-400" />
                Your Trading Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              {strategies && strategies.length > 0 ? (
                <div className="space-y-3">
                  {strategies.slice(0, 3).map((strategy) => (
                    <div key={strategy.id} className="p-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-yellow-400/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-white text-sm">{strategy.name}</div>
                        <div className={`text-xs font-bold ${
                          (strategy.expectedValue || 0) > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          EV: ${(strategy.expectedValue || 0).toFixed(0)}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="text-white font-medium">${strategy.riskAmountUsd || 100}</div>
                          <div className="text-gray-400">Risk</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-medium">1:{strategy.riskRewardRatio || 2}</div>
                          <div className="text-gray-400">RR</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-medium">{strategy.expectedWinRate || 50}%</div>
                          <div className="text-gray-400">WR</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {strategies.length > 3 && (
                    <div className="text-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsStrategyDialogOpen(true)}
                        className="border-yellow-400/20 text-yellow-400 hover:bg-yellow-400/10"
                      >
                        View All {strategies.length} Strategies
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Brain className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm mb-3">No strategies created yet</p>
                  <Button 
                    onClick={() => setIsCreateStrategyDialogOpen(true)}
                    size="sm"
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Create Strategy
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trading Journal */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-yellow-400" />
                Trading Journal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white text-sm">What went right?</Label>
                <Textarea
                  value={journalEntry.whatWentRight}
                  onChange={(e) => setJournalEntry(prev => ({ ...prev, whatWentRight: e.target.value }))}
                  placeholder="Record your wins and good decisions..."
                  className="bg-gray-800 border-yellow-400/20 text-white text-sm hover:border-yellow-400/40"
                  rows={2}
                />
              </div>
              
              <div>
                <Label className="text-white text-sm">What went wrong?</Label>
                <Textarea
                  value={journalEntry.whatWentWrong}
                  onChange={(e) => setJournalEntry(prev => ({ ...prev, whatWentWrong: e.target.value }))}
                  placeholder="Analyze mistakes and missed opportunities..."
                  className="bg-gray-800 border-yellow-400/20 text-white text-sm hover:border-yellow-400/40"
                  rows={2}
                />
              </div>
              
              <div>
                <Label className="text-white text-sm">Key lessons learned</Label>
                <Textarea
                  value={journalEntry.lessonsLearned}
                  onChange={(e) => setJournalEntry(prev => ({ ...prev, lessonsLearned: e.target.value }))}
                  placeholder="What did you learn today?"
                  className="bg-gray-800 border-yellow-400/20 text-white text-sm hover:border-yellow-400/40"
                  rows={2}
                />
              </div>
              
              <Button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700">
                <Save className="w-4 h-4 mr-2" />
                Save Journal Entry
              </Button>
            </CardContent>
          </Card>

          {/* Historical Journal Entries Widget */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-yellow-400" />
                Recent Journal Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-yellow-400/10">
                  <div className="text-sm font-medium text-white mb-1">July 18, 2025</div>
                  <div className="text-xs text-gray-400 mb-2">Last Entry • 2 days ago</div>
                  <div className="text-xs text-gray-300">
                    "Followed strategy rules perfectly. Excellent risk management on ES futures..."
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-yellow-400/10">
                  <div className="text-sm font-medium text-white mb-1">July 17, 2025</div>
                  <div className="text-xs text-gray-400 mb-2">Good Day • 3 days ago</div>
                  <div className="text-xs text-gray-300">
                    "Struggled with emotional control after first loss. Need to work on patience..."
                  </div>
                </div>
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-yellow-400/20 text-yellow-400 hover:bg-yellow-400/10"
                  >
                    View All Entries
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Strategy Dialog */}
      <Dialog open={isCreateStrategyDialogOpen} onOpenChange={setIsCreateStrategyDialogOpen}>
        <DialogContent className="max-w-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Create New Trading Strategy</DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new trading strategy with rules, risk parameters, and expected performance metrics
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[70vh]">
            <StrategyManagement />
          </div>
        </DialogContent>
      </Dialog>

      {/* Strategy Management Dialog */}
      <Dialog open={isStrategyDialogOpen} onOpenChange={setIsStrategyDialogOpen}>
        <DialogContent className="max-w-6xl h-[80vh] bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Strategy Management</DialogTitle>
            <DialogDescription className="text-gray-400">
              Manage your trading strategies and their configurations
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto h-full">
            <StrategyManagement />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailyPlanPage;