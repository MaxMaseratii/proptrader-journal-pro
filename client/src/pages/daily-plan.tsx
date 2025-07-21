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
  Play,
  PlayCircle,
  PauseCircle,
  Square,
  Zap,
  History,
  Plus,
  Settings,
  ExternalLink,

} from 'lucide-react';
import type { Account, TradingStrategy, DailyPlan, Trade, JournalEntry } from '@shared/schema';

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
  const [editingStrategyId, setEditingStrategyId] = useState<number | null>(null);
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
    notes: '',
    tradeSetupLinks: []
  });



  // Journal state - comprehensive fields like main journal
  const [journalEntry, setJournalEntry] = useState({
    whatWentWrong: '',
    whatWentRight: '',
    lessonsLearned: '',
    improvementPlan: '',
    emotionalState: 'neutral',
    marketConditions: ''
  });

  // Data queries
  const { data: accounts } = useQuery<Account[]>({ queryKey: ['/api/accounts'] });
  const { data: strategies } = useQuery<TradingStrategy[]>({ queryKey: ['/api/strategies'] });
  const { data: trades } = useQuery<Trade[]>({ queryKey: ['/api/trades'] });
  const { data: dailyPlans } = useQuery<DailyPlan[]>({ queryKey: ['/api/daily-plans'] });
  const { data: journalEntries } = useQuery<JournalEntry[]>({ queryKey: ['/api/journal'] });
  const { data: currentPlan } = useQuery<DailyPlan | null>({
    queryKey: [`/api/daily-plans/by-date?date=${selectedDate}&accountId=${selectedAccount}`],
    enabled: !!selectedDate && !!selectedAccount,
  });

  // Mutations
  const resetPlanForm = () => {
    setNewPlanData({
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
      notes: '',

    });
  };

  const createDailyPlan = useMutation({
    mutationFn: (data: any) => {
      console.log('Sending daily plan data to API:', data);
      return apiRequest('/api/daily-plans', 'POST', data);
    },
    onSuccess: (response) => {
      console.log('Daily plan created successfully:', response);
      queryClient.invalidateQueries({ queryKey: ['/api/daily-plans'] });
      setIsCreatePlanDialogOpen(false);
      resetPlanForm();
      // No alert - just close dialog and show plan immediately
    },
    onError: (error) => {
      console.error('Failed to create daily plan:', error);
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest(`/api/daily-plans/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-plans'] });
    },
  });

  // Journal Entry Mutation - seamlessly connected to main journal system
  const createJournalEntry = useMutation({
    mutationFn: (data: any) => apiRequest('/api/journal', 'POST', data),
    onSuccess: () => {
      console.log('Journal entry saved successfully');
      queryClient.invalidateQueries({ queryKey: ['/api/journal'] });
      // Clear journal form after successful save
      setJournalEntry({
        whatWentWrong: '',
        whatWentRight: '',
        lessonsLearned: '',
        improvementPlan: '',
        emotionalState: 'neutral',
        marketConditions: ''
      });
    },
    onError: (error) => {
      console.error('Failed to save journal entry:', error);
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

  // Save journal entry function - connects to specific daily plan
  const saveJournalEntry = () => {
    if (!selectedAccount) {
      console.error('No account selected for journal entry');
      return;
    }

    if (!journalEntry.whatWentRight.trim() && !journalEntry.whatWentWrong.trim() && !journalEntry.lessonsLearned.trim()) {
      console.error('Journal entry is empty');
      return;
    }

    // Find or get the daily plan ID for this date and account
    const todayPlan = dailyPlans?.find(plan => 
      plan.accountId === selectedAccount && plan.date === selectedDate
    );

    if (!todayPlan) {
      console.error('No daily plan found for this date and account. Please create a daily plan first.');
      console.warn('Please create a daily plan first before adding journal entries. Journal entries must be connected to a daily plan.');
      return;
    }

    const journalData = {
      accountId: selectedAccount,
      dailyPlanId: todayPlan.id, // Link to specific daily plan (required)
      date: selectedDate,
      whatWentRight: journalEntry.whatWentRight.trim(),
      whatWentWrong: journalEntry.whatWentWrong.trim(),
      lessonsLearned: journalEntry.lessonsLearned.trim(),
      improvementPlan: journalEntry.improvementPlan?.trim() || '',
      emotionalState: journalEntry.emotionalState || 'neutral',
      marketConditions: journalEntry.marketConditions?.trim() || ''
    };

    console.log('Saving journal entry linked to daily plan:', journalData);
    createJournalEntry.mutate(journalData);
  };

  const createNewPlan = () => {
    console.log('Creating new plan...');
    console.log('Selected Account:', selectedAccount);
    console.log('Selected Strategy:', selectedStrategy);
    
    if (!selectedAccount || !selectedStrategy) {
      console.error('Missing required fields: account or strategy');
      return;
    }
    
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
      isPlanSaved: true, // Mark plan as saved making it immutable except for additionalNotes
      additionalNotes: '', // Initialize empty additional notes
      // Journal fields - initialize empty
      whatWentWrong: '',
      whatWentRight: '',
      lessonsLearned: '',
      improvementPlan: '',
      emotionalState: 'neutral',
      marketConditions: '',
      tomorrowPlan: '',
      tradeSetupLinks: JSON.stringify([]), // Empty array as JSON string
    };

    console.log('Plan payload:', planPayload);
    createDailyPlan.mutate(planPayload);
  };

  // Get historical plans with comprehensive data including linked journal entries
  const historicalPlans = useMemo(() => {
    if (!dailyPlans || !selectedAccount) return [];
    
    const accountPlans = dailyPlans
      .filter(plan => plan.accountId === selectedAccount)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Oldest first for proper day numbering
    
    return accountPlans.map((plan, index) => {
      // Get strategy for this plan
      const strategy = strategies?.find(s => s.id === plan.strategyId);
      
      // Get trades for this specific day
      const dayTrades = trades?.filter(trade => 
        trade.accountId === selectedAccount && 
        trade.date === plan.date
      ) || [];
      
      // Get journal entries for this specific daily plan
      const dayJournalEntries = journalEntries?.filter(entry => 
        entry.dailyPlanId === plan.id || 
        (entry.accountId === selectedAccount && entry.date === plan.date)
      ) || [];
      
      // Calculate performance metrics
      const totalPnL = dayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
      const winningTrades = dayTrades.filter(t => (t.pnl || 0) > 0);
      const winRate = dayTrades.length > 0 ? (winningTrades.length / dayTrades.length * 100) : 0;
      
      return {
        ...plan,
        dayNumber: index + 1,
        strategy,
        trades: dayTrades,
        journalEntries: dayJournalEntries,
        performance: {
          totalPnL,
          tradeCount: dayTrades.length,
          winRate,
          wins: winningTrades.length,
          losses: dayTrades.length - winningTrades.length
        }
      };
    }).reverse(); // Show most recent first in display
  }, [dailyPlans, selectedAccount, strategies, trades, journalEntries]);

  return (
    <div className="p-6 space-y-6 bg-black min-h-screen">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient-rainbow">Daily Trading Plan</h1>
          <div className="text-sm font-medium text-cyan-400 italic tracking-wide drop-shadow-sm mb-2">
            "Plan your trade, trade your plan"
          </div>
          <p className="text-gray-300">{new Date(selectedDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
        
        <div className="flex items-center justify-between">
          {/* Left side - Create buttons and date */}
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => setIsCreateStrategyDialogOpen(true)}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Strategy
            </Button>
            
            <Dialog open={isCreatePlanDialogOpen} onOpenChange={setIsCreatePlanDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Daily Plan
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
                        onClick={() => {
                          if (selectedStrategy) {
                            setEditingStrategyId(selectedStrategy);
                          }
                          setIsStrategyDialogOpen(true);
                        }}
                        className="text-yellow-400 hover:text-yellow-300"
                        title={selectedStrategy ? "Edit selected strategy" : "Manage strategies"}
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
                      className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <Label className="text-white">End Time</Label>
                    <Input
                      type="time"
                      value={newPlanData.endTime}
                      onChange={(e) => setNewPlanData(prev => ({ ...prev, endTime: e.target.value }))}
                      className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
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
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setNewPlanData(prev => ({ ...prev, riskAmount: value }));
                      }}
                      className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Target Profit ($)</Label>
                    <Input
                      type="number"
                      value={newPlanData.targetProfit}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setNewPlanData(prev => ({ ...prev, targetProfit: value }));
                      }}
                      className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Max Trades</Label>
                    <Input
                      type="number"
                      value={newPlanData.maxTrades}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        setNewPlanData(prev => ({ ...prev, maxTrades: value }));
                      }}
                      className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <Label className="text-white">RR Ratio</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newPlanData.riskRewardRatio}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setNewPlanData(prev => ({ ...prev, riskRewardRatio: value }));
                      }}
                      className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                    />
                  </div>
                </div>

                {/* Trade Setup Links */}


                {/* Notes */}
                <div>
                  <Label className="text-white">Trading Notes</Label>
                  <Textarea
                    value={newPlanData.notes}
                    onChange={(e) => setNewPlanData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Enter your trading plan notes..."
                    className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
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
                  type="button"
                  onClick={() => createNewPlan()}
                  disabled={!selectedAccount || !selectedStrategy || createDailyPlan.isPending}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700"
                >
                  {createDailyPlan.isPending ? 'Creating...' : 'Create Plan'}
                </Button>
              </div>
            </DialogContent>
            </Dialog>
            
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-gray-800 border-yellow-400/20 text-white hover:border-yellow-400/40"
            />
          </div>
          
          {/* Right side - Session Controls */}
          <div className="flex items-center gap-4">
            {!isTrading ? (
              <Button 
                onClick={startTradingSession}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Session
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  onClick={stopTradingSession}
                  variant="destructive"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop Session
                </Button>
                <div className="text-green-400 font-mono">
                  {sessionStartTime && formatTime(Date.now() - sessionStartTime)}
                </div>
              </div>
            )}
            
            {currentPlan && (
              <div className="text-center">
                <div className="text-yellow-400 font-bold">${currentPlan.targetProfit}</div>
                <div className="text-xs text-gray-400">Today's Target</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Plan & Historical Plans */}
        <div className="space-y-6">
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
                <div className="space-y-4">
                  {/* Show sample performance data even without a plan */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-yellow-400/10">
                      <div className="text-2xl font-bold text-yellow-400">
                        ${actualResults.actualPnL.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400">Today's P&L</div>
                    </div>
                    
                    <div className="text-center p-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-yellow-400/10">
                      <div className="text-2xl font-bold text-white">
                        {actualResults.tradesExecuted}
                      </div>
                      <div className="text-xs text-gray-400">Trades Executed</div>
                    </div>
                    
                    <div className="text-center p-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-yellow-400/10">
                      <div className="text-2xl font-bold text-white">{calculateWinRate()}%</div>
                      <div className="text-xs text-gray-400">Win Rate</div>
                      <div className="text-xs text-green-400">{actualResults.wins}W / {actualResults.losses}L</div>
                    </div>
                    
                    <div className="text-center p-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-yellow-400/10">
                      <div className="text-2xl font-bold text-white">
                        {isTrading && sessionStartTime ? formatTime(Date.now() - sessionStartTime) : '00:00'}
                      </div>
                      <div className="text-xs text-gray-400">Session Time</div>
                    </div>
                  </div>
                  
                  <div className="text-center py-6">
                    <Target className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No plan created for today</p>
                    <Button onClick={() => setIsCreatePlanDialogOpen(true)} className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Today's Plan
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comprehensive Trading Plan History */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center gap-2">
                <History className="w-5 h-5 text-yellow-400" />
                Trading Plan History
              </CardTitle>
              <p className="text-xs text-gray-400 mt-1">Complete trading history with strategy rules and performance</p>
            </CardHeader>
            <CardContent>
              {historicalPlans.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {historicalPlans.map((plan) => (
                    <div key={plan.id} className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-yellow-400/10 p-4">
                      {/* Day Header */}
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <div className="text-sm font-bold text-yellow-400">
                            DAY {plan.dayNumber} PLAN
                          </div>
                          <div className="text-xs text-white font-medium">
                            {new Date(plan.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-bold ${plan.performance.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${plan.performance.totalPnL.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {plan.performance.tradeCount} trades • {plan.performance.winRate.toFixed(1)}% WR
                          </div>
                        </div>
                      </div>

                      {/* Strategy Rules & Performance */}
                      {plan.strategy && (
                        <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
                          <div className="text-xs font-medium text-yellow-400 mb-2">Strategy Rules & Performance</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="text-gray-300">
                              <span className="text-gray-400">Strategy:</span> {plan.strategy.name}
                            </div>
                            <div className="text-gray-300">
                              <span className="text-gray-400">Risk/Reward:</span> 1:{plan.strategy.riskRewardRatio}
                            </div>
                            <div className="text-gray-300">
                              <span className="text-gray-400">Max Trades:</span> {plan.strategy.maxTradesPerDay}
                            </div>
                            <div className="text-gray-300">
                              <span className="text-gray-400">Expected WR:</span> {plan.strategy.expectedWinRate}%
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 mt-2">
                            <span className="font-medium">Rules:</span> {plan.strategy.rules?.join(', ') || 'No rules defined'}
                          </div>
                        </div>
                      )}

                      {/* Trades for this day */}
                      {plan.trades.length > 0 ? (
                        <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
                          <div className="text-xs font-medium text-yellow-400 mb-2">Day's Trades</div>
                          <div className="space-y-2">
                            {plan.trades.map((trade) => (
                              <div key={trade.id} className="flex justify-between items-center text-xs bg-gray-800/50 rounded p-2">
                                <div className="flex gap-4">
                                  <span className="text-gray-300">{trade.symbol}</span>
                                  <span className="text-gray-400">{trade.side}</span>
                                  <span className="text-gray-400">Qty: {trade.quantity}</span>
                                  <span className="text-gray-400">{trade.entryPrice} → {trade.exitPrice}</span>
                                </div>
                                <div className="flex gap-2 items-center">
                                  <span className={`font-medium ${(trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    ${(trade.pnl || 0).toFixed(2)}
                                  </span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded ${(trade.pnl || 0) >= 0 ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'}`}>
                                    {(trade.pnl || 0) >= 0 ? 'WIN' : 'LOSS'}
                                  </span>
                                  {trade.tradingViewLink ? (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => window.open(trade.tradingViewLink, '_blank')}
                                      className="h-6 w-6 p-0 text-blue-400 hover:text-blue-300"
                                      title="View TradingView Plan"
                                    >
                                      📈
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => window.open(`https://www.tradingview.com/chart/?symbol=${trade.symbol}`, '_blank')}
                                      className="h-6 w-6 p-0 text-gray-500 hover:text-gray-400"
                                      title="View Chart on TradingView"
                                    >
                                      📈
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-900/50 rounded-lg p-3 mb-3 text-center">
                          <div className="text-xs text-gray-400">No trades executed this day</div>
                        </div>
                      )}

                      {/* Journal Entries for this specific day */}
                      {plan.journalEntries && plan.journalEntries.length > 0 ? (
                        <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
                          <div className="text-xs font-medium text-yellow-400 mb-2">Day's Journal Reflections</div>
                          <div className="space-y-2">
                            {plan.journalEntries.map((entry) => (
                              <div key={entry.id} className="bg-gray-800/50 rounded p-2 text-xs">
                                {entry.whatWentRight && (
                                  <div className="mb-2">
                                    <span className="text-green-400 font-medium">✓ What went right:</span>
                                    <div className="text-gray-300 mt-1">{entry.whatWentRight}</div>
                                  </div>
                                )}
                                {entry.whatWentWrong && (
                                  <div className="mb-2">
                                    <span className="text-red-400 font-medium">✗ What went wrong:</span>
                                    <div className="text-gray-300 mt-1">{entry.whatWentWrong}</div>
                                  </div>
                                )}
                                {entry.lessonsLearned && (
                                  <div className="mb-2">
                                    <span className="text-yellow-400 font-medium">💡 Lessons learned:</span>
                                    <div className="text-gray-300 mt-1">{entry.lessonsLearned}</div>
                                  </div>
                                )}
                                {entry.improvementPlan && (
                                  <div>
                                    <span className="text-blue-400 font-medium">🎯 Improvement plan:</span>
                                    <div className="text-gray-300 mt-1">{entry.improvementPlan}</div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-900/50 rounded-lg p-3 mb-3 text-center">
                          <div className="text-xs text-gray-400">No journal entries for this day</div>
                        </div>
                      )}

                      {/* Additional Notes Section - Only editable field after plan is saved */}
                      <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-400/20">
                        <div className="text-xs font-medium text-blue-400 mb-2">Additional Notes (Editable)</div>
                        {plan.additionalNotes ? (
                          <div className="text-xs text-gray-300">{plan.additionalNotes}</div>
                        ) : (
                          <div className="text-xs text-gray-500 italic">No additional notes added</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No trading plans yet. Create your first plan above to start tracking your trading journey.</p>
                </div>
              )}
            </CardContent>
          </Card>


        </div>

        {/* Right Column - Strategy Rules First, Then Strategy Performance & Saved Strategies */}
        <div className="space-y-6">
          {/* Strategy Rules & Performance - Moved to Top */}
          {selectedStrategy && strategies?.find(s => s.id === selectedStrategy) && (
            <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-yellow-400" />
                  Selected Strategy Rules & Performance
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
                          <div className="text-sm font-medium text-gray-300">Rules to Follow Today:</div>
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

          {/* Strategy Performance Comparison Widget */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-yellow-400" />
                All Strategies Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              {strategies && strategies.length > 0 ? (
                <div className="space-y-4">
                  {strategies.map((strategy) => {
                    const expectedValue = strategy.expectedValue || 0;
                    const performanceColor = expectedValue > 20 ? 'text-green-400' : 
                                           expectedValue > 0 ? 'text-yellow-400' : 'text-red-400';
                    const performanceIcon = expectedValue > 20 ? '🚀' : 
                                          expectedValue > 0 ? '📈' : '📉';
                    
                    return (
                      <div key={strategy.id} className="p-4 bg-gray-800 rounded-lg border border-yellow-400/10">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{performanceIcon}</span>
                            <h4 className="text-white font-medium">{strategy.name}</h4>
                          </div>
                          <div className={`text-lg font-bold ${performanceColor}`}>
                            ${expectedValue.toFixed(2)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <div className="text-gray-400">Win Rate</div>
                            <div className="text-white">{strategy.expectedWinRate || 0}%</div>
                          </div>
                          <div>
                            <div className="text-gray-400">RR Ratio</div>
                            <div className="text-white">1:{strategy.riskRewardRatio || 0}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Risk/Trade</div>
                            <div className="text-white">${strategy.riskAmountUsd || 0}</div>
                          </div>
                        </div>
                        
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            Max: {strategy.maxTradesPerDay || 0} trades/day
                          </div>
                          <div className={`text-xs px-2 py-1 rounded ${
                            strategy.isActive ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'
                          }`}>
                            {strategy.isActive ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Target className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No strategies created yet</p>
                  <p className="text-gray-500 text-sm">Create a strategy using the button above to see performance comparison</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Saved Strategies Widget */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center gap-2">
                <Brain className="w-5 h-5 text-yellow-400" />
                Saved Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              {strategies && strategies.length > 0 ? (
                <div className="space-y-3">
                  {strategies.slice(0, 3).map((strategy) => (
                    <div 
                      key={strategy.id} 
                      className="p-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-yellow-400/10 cursor-pointer hover:border-yellow-400/30 transition-colors"
                      onClick={() => {
                        setEditingStrategyId(strategy.id);
                        setIsStrategyDialogOpen(true);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-white text-sm">{strategy.name}</div>
                        <div className="flex items-center gap-2">
                          <div className={`text-xs px-2 py-1 rounded ${
                            strategy.isActive ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'
                          }`}>
                            {strategy.isActive ? 'Active' : 'Inactive'}
                          </div>
                          <Edit className="w-3 h-3 text-yellow-400" />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-xs text-gray-400 mb-1">Rules:</div>
                        {Array.isArray(strategy.rules) && strategy.rules.length > 0 ? (
                          <div className="space-y-1">
                            {strategy.rules.slice(0, 2).map((rule, index) => (
                              <div key={index} className="text-xs text-gray-300 flex items-start gap-1">
                                <span className="text-yellow-400 mt-0.5">•</span>
                                <span className="line-clamp-1">{rule}</span>
                              </div>
                            ))}
                            {strategy.rules.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{strategy.rules.length - 2} more rules...
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">No rules defined</div>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
                        <span>EV: ${(strategy.expectedValue || 0).toFixed(0)}</span>
                        <span>Click to edit</span>
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
                  <p className="text-gray-400 text-sm">No strategies created yet</p>
                </div>
              )}
            </CardContent>
          </Card>



        </div>
      </div>

      {/* Full Width Trading Journal Section */}
      <div className="mt-6">
        <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-yellow-400" />
                Daily Trading Journal Entry
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => saveJournalEntry()}
                  disabled={createJournalEntry.isPending}
                  className="bg-yellow-600 hover:bg-yellow-700 text-black px-3 py-1 text-xs"
                >
                  <Save className="h-3 w-3 mr-1" />
                  {createJournalEntry.isPending ? "Saving..." : "Save"}
                </Button>
                <div className="text-xs text-gray-400">
                  {journalEntries?.find(entry => entry.date === selectedDate) ? 'Entry exists' : 'No entry'}
                </div>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/journal'}
                  className="border-yellow-400/20 text-white hover:bg-gray-800 px-3 py-1 text-xs"
                >
                  View All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="space-y-3">
                {/* Row 1: Market Conditions, Emotional State, Lessons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-white text-xs flex items-center gap-1">
                      <BarChart3 className="h-3 w-3 text-cyan-400" />
                      Market conditions
                    </Label>
                    <Input
                      value={journalEntry.marketConditions || ''}
                      onChange={(e) => setJournalEntry(prev => ({ ...prev, marketConditions: e.target.value }))}
                      placeholder="Trending/ranging..."
                      className="bg-white border-gray-300 text-black text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white text-xs flex items-center gap-1">
                      <Activity className="h-3 w-3 text-purple-400" />
                      Emotional state
                    </Label>
                    <select
                      value={journalEntry.emotionalState || 'neutral'}
                      onChange={(e) => setJournalEntry(prev => ({ ...prev, emotionalState: e.target.value }))}
                      className="w-full bg-white border border-gray-300 text-black rounded-md px-2 py-1 text-sm"
                    >
                      <option value="confident">Confident</option>
                      <option value="calm">Calm</option>
                      <option value="neutral">Neutral</option>
                      <option value="anxious">Anxious</option>
                      <option value="frustrated">Frustrated</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label className="text-white text-xs flex items-center gap-1">
                      <Brain className="h-3 w-3 text-yellow-400" />
                      Lessons
                    </Label>
                    <Input
                      value={journalEntry.lessonsLearned}
                      onChange={(e) => setJournalEntry(prev => ({ ...prev, lessonsLearned: e.target.value }))}
                      placeholder="Key insights..."
                      className="bg-white border-gray-300 text-black text-sm"
                    />
                  </div>
                </div>

                {/* Row 2: What Went Wrong, What Went Right, Tomorrow's Plan */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-white text-xs flex items-center gap-1">
                      <TrendingDown className="h-3 w-3 text-red-400" />
                      What went wrong?
                    </Label>
                    <Textarea
                      value={journalEntry.whatWentWrong}
                      onChange={(e) => setJournalEntry(prev => ({ ...prev, whatWentWrong: e.target.value }))}
                      placeholder="Analyze mistakes..."
                      className="bg-white border-gray-300 text-black text-sm"
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white text-xs flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-400" />
                      What went right?
                    </Label>
                    <Textarea
                      value={journalEntry.whatWentRight}
                      onChange={(e) => setJournalEntry(prev => ({ ...prev, whatWentRight: e.target.value }))}
                      placeholder="Record wins..."
                      className="bg-white border-gray-300 text-black text-sm"
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white text-xs flex items-center gap-1">
                      <Target className="h-3 w-3 text-blue-400" />
                      Tomorrow's plan
                    </Label>
                    <Textarea
                      value={journalEntry.improvementPlan || ''}
                      onChange={(e) => setJournalEntry(prev => ({ ...prev, improvementPlan: e.target.value }))}
                      placeholder="Improvements..."
                      className="bg-white border-gray-300 text-black text-sm"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
      <Dialog open={isStrategyDialogOpen} onOpenChange={(open) => {
        setIsStrategyDialogOpen(open);
        if (!open) setEditingStrategyId(null);
      }}>
        <DialogContent className="max-w-6xl h-[80vh] bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Strategy Management</DialogTitle>
            <DialogDescription className="text-gray-400">
              Manage your trading strategies and their configurations
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto h-full">
            <StrategyManagement 
              editStrategyId={editingStrategyId} 
              onStrategyUpdated={() => {
                setIsStrategyDialogOpen(false);
                setEditingStrategyId(null);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailyPlanPage;