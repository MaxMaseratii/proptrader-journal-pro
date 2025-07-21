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
  const [isJournalDialogOpen, setIsJournalDialogOpen] = useState(false);
  const [selectedPlanForStats, setSelectedPlanForStats] = useState<any>(null);
  
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
      tradeSetupLinks: []
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
  const calculateExpectedValue = (winRate: number, riskRewardRatio: number, riskAmount: number) => {
    const winRateDecimal = winRate / 100;
    const lossRate = 1 - winRateDecimal;
    const expectedValue = (winRateDecimal * riskAmount * riskRewardRatio) - (lossRate * riskAmount);
    return expectedValue;
  };

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
    <div className="min-h-screen bg-dark-bg">
      {/* Modern Hero Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border-b border-yellow-400/20">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
              <div className="flex-1">
                <h1 className="text-5xl font-bold text-gradient-rainbow mb-3">Daily Trading Plan</h1>
                <p className="text-xl text-gray-300 mb-4">Strategic planning meets execution excellence</p>
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="outline" className="border-yellow-400/30 text-yellow-400 px-4 py-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Badge>
                  {isTrading && sessionStartTime && (
                    <div className="flex items-center gap-2 text-sm bg-green-900/20 px-3 py-1.5 rounded-lg border border-green-400/20">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      Live Session: {formatTime(Date.now() - sessionStartTime)}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-4">
                {!isTrading ? (
                  <Button 
                    onClick={startTradingSession}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Session
                  </Button>
                ) : (
                  <div className="flex items-center gap-3">
                    <Button 
                      onClick={stopTradingSession}
                      variant="destructive"
                      className="shadow-lg"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop Session
                    </Button>
                  </div>
                )}
                
                {currentPlan && (
                  <div className="text-center bg-gray-700/50 rounded-lg px-4 py-2 backdrop-blur-sm">
                    <div className="text-yellow-400 font-bold text-lg">${currentPlan.targetProfit}</div>
                    <div className="text-xs text-gray-400">Today's Target</div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => setIsCreateStrategyDialogOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Strategy
              </Button>
              
              <Button 
                onClick={() => setIsCreatePlanDialogOpen(true)}
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700 shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Daily Plan
              </Button>

              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-gray-700/50 border-yellow-400/30 text-white hover:border-yellow-400/50 backdrop-blur-sm max-w-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Today's Plan vs Actual Performance */}
        <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Today's Plan vs Actual Performance
              </div>
              <Button 
                onClick={() => setIsJournalDialogOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Journal Entry
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentPlan ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-yellow-400/10">
                  <div className="text-sm text-gray-400 mb-2">Target Profit</div>
                  <div className="text-2xl font-bold text-yellow-400">${currentPlan.targetProfit}</div>
                  <div className="text-xs text-gray-500">Actual: ${actualResults.actualPnL.toFixed(2)}</div>
                  <Progress 
                    value={currentPlan.targetProfit ? (actualResults.actualPnL / currentPlan.targetProfit) * 100 : 0} 
                    className="mt-2 h-2" 
                  />
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-yellow-400/10">
                  <div className="text-sm text-gray-400 mb-2">Max Trades</div>
                  <div className="text-2xl font-bold text-blue-400">{currentPlan.maxTrades}</div>
                  <div className="text-xs text-gray-500">Executed: {actualResults.tradesExecuted}</div>
                  <Progress 
                    value={currentPlan.maxTrades ? (actualResults.tradesExecuted / currentPlan.maxTrades) * 100 : 0} 
                    className="mt-2 h-2" 
                  />
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-yellow-400/10">
                  <div className="text-sm text-gray-400 mb-2">Risk Amount</div>
                  <div className="text-2xl font-bold text-red-400">${currentPlan.riskAmount}</div>
                  <div className="text-xs text-gray-500">Used: ${actualResults.riskUsed.toFixed(2)}</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-yellow-400/10">
                  <div className="text-sm text-gray-400 mb-2">Win Rate</div>
                  <div className="text-2xl font-bold text-green-400">{calculateWinRate()}%</div>
                  <div className="text-xs text-gray-500">{actualResults.wins}W / {actualResults.losses}L</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <div className="text-gray-400 mb-4">No trading plan for today</div>
                <Button 
                  onClick={() => setIsCreatePlanDialogOpen(true)}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Today's Plan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historical Plans and Plan Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Historical Trading Plans */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <History className="h-5 w-5" />
                Historical Trading Plans
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {historicalPlans.length > 0 ? (
                <div className="space-y-3">
                  {historicalPlans.map((plan) => (
                    <div 
                      key={plan.id} 
                      className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-yellow-400/30 cursor-pointer transition-all"
                      onClick={() => setSelectedPlanForStats(plan)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-sm font-medium text-white">
                            Day #{plan.dayNumber} • {plan.strategy?.name}
                          </div>
                          <div className="text-xs text-gray-400">
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
                      <div className="text-xs text-blue-400 hover:text-blue-300">
                        Click to view detailed stats →
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No historical plans found
                </div>
              )}
            </CardContent>
          </Card>

          {/* Plan Statistics */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {selectedPlanForStats ? `Plan Statistics - Day #${selectedPlanForStats.dayNumber}` : 'Plan Statistics'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPlanForStats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                      <div className="text-lg font-bold text-yellow-400">
                        ${selectedPlanForStats.targetProfit}
                      </div>
                      <div className="text-xs text-gray-400">Target Profit</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                      <div className={`text-lg font-bold ${selectedPlanForStats.performance.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${selectedPlanForStats.performance.totalPnL.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400">Actual P&L</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                      <div className="text-lg font-bold text-blue-400">
                        {selectedPlanForStats.maxTrades}
                      </div>
                      <div className="text-xs text-gray-400">Max Trades</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                      <div className="text-lg font-bold text-white">
                        {selectedPlanForStats.performance.tradeCount}
                      </div>
                      <div className="text-xs text-gray-400">Executed</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-700">
                    <div className="text-sm text-white mb-2">Performance Breakdown</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-green-900/20 rounded">
                        <div className="text-green-400 font-bold">{selectedPlanForStats.performance.wins}</div>
                        <div className="text-gray-400">Wins</div>
                      </div>
                      <div className="text-center p-2 bg-red-900/20 rounded">
                        <div className="text-red-400 font-bold">{selectedPlanForStats.performance.losses}</div>
                        <div className="text-gray-400">Losses</div>
                      </div>
                      <div className="text-center p-2 bg-blue-900/20 rounded">
                        <div className="text-blue-400 font-bold">{selectedPlanForStats.performance.winRate.toFixed(1)}%</div>
                        <div className="text-gray-400">Win Rate</div>
                      </div>
                    </div>
                  </div>

                  {selectedPlanForStats.strategy && (
                    <div className="pt-4 border-t border-gray-700">
                      <div className="text-sm text-white mb-2">Strategy Used</div>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-yellow-400 font-medium">{selectedPlanForStats.strategy.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{selectedPlanForStats.strategy.description}</div>
                        <div className="text-xs text-green-400 mt-2">
                          Expected WR: {selectedPlanForStats.strategy.expectedWinRate}% • RR: 1:{selectedPlanForStats.strategy.riskRewardRatio}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                  Click on a historical plan to view detailed statistics
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Historical Plans and Strategies */}
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Historical Trading Plans */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <History className="h-5 w-5" />
                Historical Trading Plans
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {historicalPlans.length > 0 ? (
                <div className="space-y-4">
                  {historicalPlans.map((plan) => (
                    <div key={plan.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-sm font-medium text-white">
                            Day #{plan.dayNumber} • {plan.strategy?.name}
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No historical plans found
                </div>
              )}
            </CardContent>
          </Card>

          {/* Your Trading Strategies */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Your Trading Strategies
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {strategies && strategies.length > 0 ? (
                <div className="space-y-4">
                  {strategies.map((strategy) => (
                    <div key={strategy.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-sm font-medium text-white">{strategy.name}</div>
                          <div className="text-xs text-gray-400">{strategy.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-green-400">
                            EV: ${calculateExpectedValue(strategy.expectedWinRate, strategy.riskRewardRatio, strategy.riskAmountUsd || 100).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {strategy.expectedWinRate}% WR • 1:{strategy.riskRewardRatio} RR
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No strategies created yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={isCreatePlanDialogOpen} onOpenChange={setIsCreatePlanDialogOpen}>
        <DialogContent className="max-w-4xl bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
          <DialogHeader>
            <DialogTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Create Daily Trading Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Account</Label>
                <Select value={selectedAccount?.toString()} onValueChange={(value) => setSelectedAccount(Number(value))}>
                  <SelectTrigger className="bg-white border-gray-300 text-black">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.name} ({account.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-white">Strategy</Label>
                <Select value={selectedStrategy?.toString()} onValueChange={(value) => setSelectedStrategy(Number(value))}>
                  <SelectTrigger className="bg-white border-gray-300 text-black">
                    <SelectValue placeholder="Select strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    {strategies?.map((strategy) => (
                      <SelectItem key={strategy.id} value={strategy.id.toString()}>
                        {strategy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-white">Risk Amount ($)</Label>
                <Input
                  type="number"
                  value={newPlanData.riskAmount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setNewPlanData(prev => ({ ...prev, riskAmount: value }));
                  }}
                  className="bg-white border-gray-300 text-black"
                />
              </div>
              <div>
                <Label className="text-white">Target Profit ($)</Label>
                <Input
                  type="number"
                  value={newPlanData.targetProfit}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setNewPlanData(prev => ({ ...prev, targetProfit: value }));
                  }}
                  className="bg-white border-gray-300 text-black"
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
                  className="bg-white border-gray-300 text-black"
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
                  className="bg-white border-gray-300 text-black"
                />
              </div>
            </div>

            <div>
              <Label className="text-white">Trading Notes</Label>
              <Textarea
                value={newPlanData.notes}
                onChange={(e) => setNewPlanData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Enter your trading plan notes..."
                className="bg-white border-gray-300 text-black"
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

      {/* Create Strategy Dialog */}
      <Dialog open={isCreateStrategyDialogOpen} onOpenChange={setIsCreateStrategyDialogOpen}>
        <DialogContent className="max-w-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Create New Trading Strategy</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[70vh]">
            <StrategyManagement 
              onStrategyUpdated={() => {
                setIsCreateStrategyDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ['/api/strategies'] });
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Journal Entry Dialog */}
      <Dialog open={isJournalDialogOpen} onOpenChange={setIsJournalDialogOpen}>
        <DialogContent className="max-w-4xl bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
          <DialogHeader>
            <DialogTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
              Daily Trading Journal Entry
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Reflect on your trading day for {new Date(selectedDate).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-white text-sm flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-400" />
                  What went wrong today?
                </Label>
                <Textarea
                  value={journalEntry.whatWentWrong || ''}
                  onChange={(e) => setJournalEntry(prev => ({ ...prev, whatWentWrong: e.target.value }))}
                  placeholder="Mistakes, missed opportunities, emotional trading..."
                  className="bg-gray-800 border-yellow-400/20 text-white placeholder-gray-400"
                  rows={4}
                />
              </div>
              
              <div>
                <Label className="text-white text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  What went right today?
                </Label>
                <Textarea
                  value={journalEntry.whatWentRight || ''}
                  onChange={(e) => setJournalEntry(prev => ({ ...prev, whatWentRight: e.target.value }))}
                  placeholder="Good decisions, successful trades, discipline..."
                  className="bg-gray-800 border-yellow-400/20 text-white placeholder-gray-400"
                  rows={4}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-white text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4 text-blue-400" />
                  Lessons learned
                </Label>
                <Textarea
                  value={journalEntry.lessonsLearned || ''}
                  onChange={(e) => setJournalEntry(prev => ({ ...prev, lessonsLearned: e.target.value }))}
                  placeholder="Key takeaways from today's trading..."
                  className="bg-gray-800 border-yellow-400/20 text-white placeholder-gray-400"
                  rows={4}
                />
              </div>
              
              <div>
                <Label className="text-white text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-yellow-400" />
                  Tomorrow's plan
                </Label>
                <Textarea
                  value={journalEntry.improvementPlan || ''}
                  onChange={(e) => setJournalEntry(prev => ({ ...prev, improvementPlan: e.target.value }))}
                  placeholder="Improvements and focus areas for tomorrow..."
                  className="bg-gray-800 border-yellow-400/20 text-white placeholder-gray-400"
                  rows={4}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-600">
            <Button
              variant="outline"
              onClick={() => setIsJournalDialogOpen(false)}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                createJournalEntry.mutate({
                  accountId: selectedAccount,
                  date: selectedDate,
                  dailyPlanId: currentPlan?.id || null,
                  ...journalEntry
                });
                setIsJournalDialogOpen(false);
              }}
              disabled={createJournalEntry.isPending}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700"
            >
              {createJournalEntry.isPending ? 'Saving...' : 'Save Journal Entry'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailyPlanPage;
