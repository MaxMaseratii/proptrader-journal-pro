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
  Link,
  Trash2
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

  // Trade setup links state
  const [tradeSetupLinks, setTradeSetupLinks] = useState([]);
  const [newLinkData, setNewLinkData] = useState({ title: '', url: '' });

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
    setTradeSetupLinks([]);
    setNewLinkData({ title: '', url: '' });
  };

  const createDailyPlan = useMutation({
    mutationFn: (data: any) => apiRequest('/api/daily-plans', 'POST', data),
    onSuccess: (response) => {
      console.log('Daily plan created successfully:', response);
      queryClient.invalidateQueries({ queryKey: ['/api/daily-plans'] });
      setIsCreatePlanDialogOpen(false);
      resetPlanForm();
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
        improvementPlan: ''
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

  // Trade setup link management functions
  const addTradeSetupLink = () => {
    if (newLinkData.title.trim() && newLinkData.url.trim()) {
      setTradeSetupLinks([...tradeSetupLinks, { ...newLinkData }]);
      setNewLinkData({ title: '', url: '' });
    }
  };

  const removeTradeSetupLink = (index: number) => {
    setTradeSetupLinks(tradeSetupLinks.filter((_, i) => i !== index));
  };

  // Save journal entry function - seamlessly connects to main journal system
  const saveJournalEntry = () => {
    if (!selectedAccount) {
      console.error('No account selected for journal entry');
      return;
    }

    if (!journalEntry.whatWentRight.trim() && !journalEntry.whatWentWrong.trim() && !journalEntry.lessonsLearned.trim()) {
      console.error('Journal entry is empty');
      return;
    }

    const journalData = {
      accountId: selectedAccount,
      date: selectedDate,
      whatWentRight: journalEntry.whatWentRight.trim(),
      whatWentWrong: journalEntry.whatWentWrong.trim(),
      lessonsLearned: journalEntry.lessonsLearned.trim(),
      improvementPlan: journalEntry.improvementPlan?.trim() || '',
      emotionalState: 'neutral',
      marketConditions: ''
    };

    console.log('Saving journal entry:', journalData);
    createJournalEntry.mutate(journalData);
  };

  const createNewPlan = () => {
    console.log('Creating new plan...');
    console.log('Selected Account:', selectedAccount);
    console.log('Selected Strategy:', selectedStrategy);
    console.log('Trade Setup Links:', tradeSetupLinks);
    
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
      tradeSetupLinks: JSON.stringify(tradeSetupLinks),
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

    console.log('Plan payload:', planPayload);
    createDailyPlan.mutate(planPayload);
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
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-yellow-400">Daily Trading Command Center</h1>
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
                <div>
                  <Label className="text-white">Trade Setup Links</Label>
                  <div className="space-y-3">
                    {/* Add New Link Form */}
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Link title (e.g., ES Setup)"
                        value={newLinkData.title}
                        onChange={(e) => setNewLinkData(prev => ({ ...prev, title: e.target.value }))}
                        className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                      />
                      <Input
                        placeholder="https://..."
                        value={newLinkData.url}
                        onChange={(e) => setNewLinkData(prev => ({ ...prev, url: e.target.value }))}
                        className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400"
                      />
                      <Button
                        type="button"
                        onClick={() => addTradeSetupLink()}
                        disabled={!newLinkData.title.trim() || !newLinkData.url.trim()}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    
                    {/* Display Added Links */}
                    {tradeSetupLinks.length > 0 && (
                      <div className="space-y-2">
                        {tradeSetupLinks.map((link, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded-lg border border-yellow-400/20">
                            <div className="flex items-center gap-2">
                              <Link className="w-4 h-4 text-yellow-400" />
                              <span className="text-white font-medium">{link.title}</span>
                              <span className="text-gray-400 text-sm">({link.url.substring(0, 30)}...)</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTradeSetupLink(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

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

          {/* Saved/Historical Trading Plans Widget */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center gap-2">
                <History className="w-5 h-5 text-yellow-400" />
                Saved/Historical Trading Plans
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

        {/* Right Column - Strategy Performance & Saved Strategies */}
        <div className="space-y-6">
          {/* Strategy Performance Comparison Widget */}
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-yellow-400" />
                Strategy Performance Comparison
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
            <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-yellow-400" />
              Trading Journal & Historical Entries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              {/* Quick Journal Entry - Compact Row Layout */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-white text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      What went right?
                    </Label>
                    <Textarea
                      value={journalEntry.whatWentRight}
                      onChange={(e) => setJournalEntry(prev => ({ ...prev, whatWentRight: e.target.value }))}
                      placeholder="Record your wins and good decisions..."
                      className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400 text-sm"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white text-sm flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-400" />
                      What went wrong?
                    </Label>
                    <Textarea
                      value={journalEntry.whatWentWrong}
                      onChange={(e) => setJournalEntry(prev => ({ ...prev, whatWentWrong: e.target.value }))}
                      placeholder="Analyze mistakes and missed opportunities..."
                      className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400 text-sm"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white text-sm flex items-center gap-2">
                      <Brain className="h-4 w-4 text-yellow-400" />
                      Key lessons learned
                    </Label>
                    <Textarea
                      value={journalEntry.lessonsLearned}
                      onChange={(e) => setJournalEntry(prev => ({ ...prev, lessonsLearned: e.target.value }))}
                      placeholder="What did you learn today?"
                      className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-yellow-400 focus:ring-yellow-400 text-sm"
                      rows={3}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={() => saveJournalEntry()}
                  disabled={createJournalEntry.isPending}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {createJournalEntry.isPending ? 'Saving...' : 'Save Journal Entry'}
                </Button>
              </div>
              
              {/* Historical Entries */}
              <div className="mt-6">
                <div className="text-sm font-medium text-gray-300 mb-3">Recent Entries</div>
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