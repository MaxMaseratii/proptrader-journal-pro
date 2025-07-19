import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  const today = new Date().toISOString().split('T')[0];
  
  // State for daily planning
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isTrading, setIsTrading] = useState(false);
  const [tradingStartTime, setTradingStartTime] = useState<number | null>(null);
  const [currentSessionTime, setCurrentSessionTime] = useState(0);

  // Form state
  const [planData, setPlanData] = useState({
    riskAmount: 0,
    targetProfit: 0,
    maxTrades: 0,
    plannedTrades: 0,
    riskRewardRatio: 2.0,
    maxRiskPercentage: 2,
    plannedHours: 6,
    hourlyWage: 50,
    tradeTime: '',
    // Actual results
    actualPnL: 0,
    tradesExecuted: 0,
    wins: 0,
    losses: 0,
    actualRR: 0,
    hoursWorked: 0,
    riskUsed: 0,
    biggestWin: 0,
    biggestLoss: 0,
    // Journal
    whatWentWrong: '',
    whatWentRight: '',
    lessonsLearned: '',
    improvementPlan: '',
    emotionalState: 'neutral',
    marketConditions: '',
    tomorrowPlan: '',
    isPlanSaved: false,
    isCompleted: false
  });

  // Data queries
  const { data: accounts } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  const { data: strategies } = useQuery<TradingStrategy[]>({
    queryKey: ['/api/strategies'],
  });

  const { data: dailyPlans } = useQuery<DailyPlan[]>({
    queryKey: ['/api/daily-plans'],
  });

  const { data: trades } = useQuery<Trade[]>({
    queryKey: ['/api/trades'],
  });

  const { data: currentPlan } = useQuery<DailyPlan>({
    queryKey: ['/api/daily-plans/by-date', selectedDate],
    queryFn: () => fetch(`/api/daily-plans/by-date?date=${selectedDate}`).then(res => res.json()),
    enabled: !!selectedDate,
  });

  // Mutations
  const createPlanMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/daily-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/daily-plans/by-date'] });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest(`/api/daily-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/daily-plans/by-date'] });
    },
  });

  const createStrategyMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/strategies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/strategies'] });
    },
  });

  // Timer effect for session tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTrading && tradingStartTime) {
      interval = setInterval(() => {
        setCurrentSessionTime(Date.now() - tradingStartTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTrading, tradingStartTime]);

  // Load plan data when currentPlan changes
  useEffect(() => {
    if (currentPlan) {
      setPlanData(currentPlan);
      setSelectedAccount(currentPlan.accountId);
      setSelectedStrategy(currentPlan.strategyId);
      setIsEditing(false);
    } else {
      // Reset to default values for new plan
      setPlanData({
        riskAmount: 0,
        targetProfit: 0,
        maxTrades: 0,
        plannedTrades: 0,
        riskRewardRatio: 2.0,
        maxRiskPercentage: 2,
        plannedHours: 6,
        hourlyWage: 50,
        tradeTime: '',
        actualPnL: 0,
        tradesExecuted: 0,
        wins: 0,
        losses: 0,
        actualRR: 0,
        hoursWorked: 0,
        riskUsed: 0,
        biggestWin: 0,
        biggestLoss: 0,
        whatWentWrong: '',
        whatWentRight: '',
        lessonsLearned: '',
        improvementPlan: '',
        emotionalState: 'neutral',
        marketConditions: '',
        tomorrowPlan: '',
        isPlanSaved: false,
        isCompleted: false
      });
      setIsEditing(true);
    }
  }, [currentPlan]);

  // Calculate actual results from trades for selected date and account
  const actualResults = useMemo(() => {
    if (!trades || !selectedAccount || !selectedDate) return planData;

    const dayTrades = trades.filter(trade => 
      trade.date === selectedDate && trade.accountId === selectedAccount
    );

    const dayPnL = dayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const wins = dayTrades.filter(t => (t.pnl || 0) > 0).length;
    const losses = dayTrades.filter(t => (t.pnl || 0) < 0).length;
    const winningTrades = dayTrades.filter(t => (t.pnl || 0) > 0);
    const losingTrades = dayTrades.filter(t => (t.pnl || 0) < 0);

    return {
      ...planData,
      actualPnL: dayPnL,
      tradesExecuted: dayTrades.length,
      wins,
      losses,
      biggestWin: winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl || 0)) : 0,
      biggestLoss: losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnl || 0)) : 0,
      riskUsed: dayTrades.reduce((sum, trade) => sum + Math.abs(trade.riskAmount || 0), 0),
    };
  }, [trades, selectedAccount, selectedDate, planData]);

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
    if (percentage >= 100) return "text-green-400 bg-green-400";
    if (percentage >= 80) return "text-yellow-400 bg-yellow-400";
    if (percentage >= 60) return "text-orange-400 bg-orange-400";
    return "text-red-400 bg-red-400";
  };

  const startTradingSession = () => {
    setIsTrading(true);
    setTradingStartTime(Date.now());
  };

  const stopTradingSession = () => {
    setIsTrading(false);
    setTradingStartTime(null);
    // Update hours worked in plan
    if (tradingStartTime) {
      const hoursWorked = (Date.now() - tradingStartTime) / 3600000;
      setPlanData(prev => ({ ...prev, hoursWorked: prev.hoursWorked + hoursWorked }));
    }
  };

  const savePlan = () => {
    const planPayload = {
      ...planData,
      ...actualResults,
      date: selectedDate,
      accountId: selectedAccount,
      strategyId: selectedStrategy,
      isPlanSaved: true,
    };

    if (currentPlan) {
      updatePlanMutation.mutate({ id: currentPlan.id, data: planPayload });
    } else {
      createPlanMutation.mutate(planPayload);
    }
  };

  const [isStrategyDialogOpen, setIsStrategyDialogOpen] = useState(false);

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
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
            className="bg-gray-800 border-gray-600 text-white"
          />
          
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
          
          {isTrading && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-500 font-mono">{formatTime(currentSessionTime)}</span>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="plan" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="plan">Daily Plan</TabsTrigger>
          <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="plan" className="space-y-6">
          {/* Account and Strategy Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-yellow-400">Account & Strategy Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Trading Account</Label>
                  <Select value={selectedAccount?.toString() || ""} onValueChange={(value) => setSelectedAccount(parseInt(value))}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.name} - {account.firm} ({account.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <Label className="text-white">Trading Strategy</Label>
                    <Dialog open={isStrategyDialogOpen} onOpenChange={setIsStrategyDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-yellow-400 hover:text-yellow-300"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl h-[80vh] bg-gray-800 border-gray-700 overflow-hidden">
                        <DialogHeader>
                          <DialogTitle className="text-yellow-400">Strategy Management</DialogTitle>
                        </DialogHeader>
                        <div className="overflow-y-auto h-full">
                          <StrategyManagement />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Select value={selectedStrategy?.toString() || ""} onValueChange={(value) => setSelectedStrategy(parseInt(value))}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      {strategies?.map((strategy) => (
                        <SelectItem key={strategy.id} value={strategy.id.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>{strategy.name}</span>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-400">RR: 1:{strategy.riskRewardRatio || 2}</span>
                              <span className="text-gray-400">WR: {strategy.expectedWinRate || 50}%</span>
                              <span className={`font-medium ${
                                (strategy.expectedValue || 0) > 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                EV: ${(strategy.expectedValue || 0).toFixed(0)}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Strategy Performance Display */}
                  {selectedStrategy && strategies?.find(s => s.id === selectedStrategy) && (
                    <div className="mt-2 p-3 bg-gray-700 rounded-lg border border-yellow-400/20">
                      {(() => {
                        const strategy = strategies.find(s => s.id === selectedStrategy);
                        return strategy ? (
                          <div className="grid grid-cols-4 gap-3 text-center">
                            <div>
                              <div className="text-white font-bold">${strategy.riskAmountUsd || 100}</div>
                              <div className="text-xs text-gray-400">Risk</div>
                            </div>
                            <div>
                              <div className="text-white font-bold">1:{strategy.riskRewardRatio || 2}</div>
                              <div className="text-xs text-gray-400">RR</div>
                            </div>
                            <div>
                              <div className="text-white font-bold">{strategy.expectedWinRate || 50}%</div>
                              <div className="text-xs text-gray-400">Win Rate</div>
                            </div>
                            <div>
                              <div className={`font-bold ${
                                (strategy.expectedValue || 0) > 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                ${(strategy.expectedValue || 0).toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-400">Expected Value</div>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Plan Configuration */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Daily Plan Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Risk Amount ($)</Label>
                    <Input 
                      type="number"
                      value={planData.riskAmount}
                      onChange={(e) => setPlanData({...planData, riskAmount: parseFloat(e.target.value) || 0})}
                      disabled={planData.isPlanSaved && !isEditing}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Target Profit ($)</Label>
                    <Input 
                      type="number"
                      value={planData.targetProfit}
                      onChange={(e) => setPlanData({...planData, targetProfit: parseFloat(e.target.value) || 0})}
                      disabled={planData.isPlanSaved && !isEditing}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Planned Trades</Label>
                    <Input 
                      type="number"
                      value={planData.plannedTrades}
                      onChange={(e) => setPlanData({...planData, plannedTrades: parseInt(e.target.value) || 0})}
                      disabled={planData.isPlanSaved && !isEditing}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Max Trades</Label>
                    <Input 
                      type="number"
                      value={planData.maxTrades}
                      onChange={(e) => setPlanData({...planData, maxTrades: parseInt(e.target.value) || 0})}
                      disabled={planData.isPlanSaved && !isEditing}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Target RR</Label>
                    <Input 
                      type="number"
                      step="0.1"
                      value={planData.riskRewardRatio}
                      onChange={(e) => setPlanData({...planData, riskRewardRatio: parseFloat(e.target.value) || 0})}
                      disabled={planData.isPlanSaved && !isEditing}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Planned Hours</Label>
                    <Input 
                      type="number"
                      step="0.5"
                      value={planData.plannedHours}
                      onChange={(e) => setPlanData({...planData, plannedHours: parseFloat(e.target.value) || 0})}
                      disabled={planData.isPlanSaved && !isEditing}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  {planData.isPlanSaved && !isEditing && (
                    <Button 
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Plan
                    </Button>
                  )}
                  {(isEditing || !planData.isPlanSaved) && (
                    <Button 
                      onClick={savePlan}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Plan
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          {/* Daily Plan vs Actual Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Plan vs Actual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-700 rounded-lg">
                    <div className={`text-2xl font-bold ${actualResults.actualPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {actualResults.actualPnL >= 0 ? '+' : ''}${actualResults.actualPnL.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-300">Current P&L</div>
                    <div className="text-xs text-gray-400">
                      Target: ${planData.targetProfit}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-white">{actualResults.tradesExecuted}</div>
                    <div className="text-sm text-gray-300">Trades Done</div>
                    <div className="text-xs text-gray-400">
                      Plan: {planData.plannedTrades} | Max: {planData.maxTrades}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-white">{calculateWinRate()}%</div>
                    <div className="text-sm text-gray-300">Win Rate</div>
                    <div className="text-xs text-gray-400">
                      {actualResults.wins}W / {actualResults.losses}L
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-white">${actualResults.riskUsed.toFixed(0)}</div>
                    <div className="text-sm text-gray-300">Risk Used</div>
                    <div className="text-xs text-gray-400">
                      Plan: ${planData.riskAmount}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strategy Rules Tracking */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Strategy Rules & Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedStrategy && strategies?.find(s => s.id === selectedStrategy) ? (() => {
                  const strategy = strategies.find(s => s.id === selectedStrategy);
                  return strategy ? (
                    <>
                      {/* Strategy Performance Summary */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="text-center p-2 bg-gray-700 rounded">
                          <div className="text-white font-bold">${strategy.riskAmountUsd || 100}</div>
                          <div className="text-xs text-gray-400">Risk per Trade</div>
                        </div>
                        <div className="text-center p-2 bg-gray-700 rounded">
                          <div className={`font-bold ${
                            (strategy.expectedValue || 0) > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            ${(strategy.expectedValue || 0).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400">Expected Value</div>
                        </div>
                      </div>
                      
                      {/* Strategy Rules */}
                      {Array.isArray(strategy.rules) && strategy.rules.length > 0 ? (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-300">Rules to Follow:</div>
                          {strategy.rules.map((rule, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                              <span className="text-sm text-gray-300">{rule}</span>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-gray-500" />
                                <span className="text-xs text-gray-400">Monitor</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-400">No rules defined for this strategy</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setIsStrategyDialogOpen(true)}
                            className="mt-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Add Rules
                          </Button>
                        </div>
                      )}
                    </>
                  ) : null;
                })() : (
                  <div className="text-center py-4">
                    <p className="text-gray-400">Select a strategy to view rules and performance</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsStrategyDialogOpen(true)}
                      className="mt-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Strategy
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="journal" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Trading Journal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">What went wrong?</Label>
                  <Textarea 
                    value={planData.whatWentWrong}
                    onChange={(e) => setPlanData({...planData, whatWentWrong: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                    placeholder="Reflect on mistakes and areas for improvement..."
                  />
                </div>
                <div>
                  <Label className="text-white">What went right?</Label>
                  <Textarea 
                    value={planData.whatWentRight}
                    onChange={(e) => setPlanData({...planData, whatWentRight: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                    placeholder="Celebrate successes and good decisions..."
                  />
                </div>
                <div>
                  <Label className="text-white">Lessons learned</Label>
                  <Textarea 
                    value={planData.lessonsLearned}
                    onChange={(e) => setPlanData({...planData, lessonsLearned: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                    placeholder="Key takeaways from today's trading..."
                  />
                </div>
                <div>
                  <Label className="text-white">Tomorrow's plan</Label>
                  <Textarea 
                    value={planData.tomorrowPlan}
                    onChange={(e) => setPlanData({...planData, tomorrowPlan: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                    placeholder="What will you do differently tomorrow?"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={savePlan} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  <Save className="w-4 h-4 mr-2" />
                  Save Journal
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <History className="w-5 h-5" />
                Daily Plan History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyPlans?.slice(0, 10).map((plan) => {
                  const account = accounts?.find(a => a.id === plan.accountId);
                  const strategy = strategies?.find(s => s.id === plan.strategyId);
                  return (
                    <div key={plan.id} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                          <span className="text-white font-medium">{plan.date}</span>
                          <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                            {account?.name || 'Unknown Account'}
                          </Badge>
                          <Badge variant="outline" className="text-blue-400 border-blue-400">
                            {strategy?.name || 'No Strategy'}
                          </Badge>
                        </div>
                        <div className={`text-lg font-bold ${(plan.actualPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {(plan.actualPnL || 0) >= 0 ? '+' : ''}${(plan.actualPnL || 0).toFixed(2)}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm text-gray-300">
                        <div>Trades: {plan.tradesExecuted || 0}/{plan.plannedTrades}</div>
                        <div>Target: ${plan.targetProfit}</div>
                        <div>Risk: ${plan.riskUsed || 0}/${plan.riskAmount}</div>
                        <div>Hours: {plan.hoursWorked || 0}h/{plan.plannedHours}h</div>
                      </div>
                    </div>
                  );
                })}
                {!dailyPlans?.length && (
                  <p className="text-gray-400 text-center py-8">No daily plans found. Create your first plan!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DailyPlanPage;