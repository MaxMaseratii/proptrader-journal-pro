import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAccountSchema, type InsertAccount } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Account, Trade } from "@shared/schema";
import { calculateRiskSuggestions, TRADING_ASSETS, type AssetSymbol } from "@/lib/risk-calculator";
import { TRADING_ASSETS as ASSET_CONFIG, ASSET_CATEGORIES, getRiskSuggestion } from "@/lib/trading-assets";
import AccountManagement from "@/components/account-management";
import { 
  Target, 
  TrendingUp, 
  Calculator, 
  Calendar,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Save,
  Bookmark,
  Plus,
  Wallet,
  DollarSign,
  Lightbulb,
  RotateCcw,
  LogOut,
  Trash2,
  Minimize2,
  Maximize2
} from "lucide-react";

interface ProjectionSettings {
  mode: 'account' | 'simulation';
  selectedAccountId: number | null;
  copiedAccounts: number;
  startingCapital: number;
  riskPerTrade: number;
  riskRewardRatio: number;
  profitTarget: number;
  maxDrawdown: number;
  riskCuttingPercent: number;
  compoundingPercent: number;
  maxLossPerDay: number;
  extraDaysIfLoss: number;
  useMaxDrawdownAsCapital: boolean;
}

interface ProjectionDay {
  date: string;
  dayNumber: number;
  risk: number;
  reward: number;
  targetExpectation: number;
  actualPnl?: number;
  isWin: boolean;
  cumulativeTarget: number;
  cumulativeActual: number;
}

export default function Projections() {
  const [settings, setSettings] = useState<ProjectionSettings>({
    mode: 'simulation',
    selectedAccountId: null,
    copiedAccounts: 1,
    startingCapital: 100000,
    riskPerTrade: 1000,
    riskRewardRatio: 2.0,
    profitTarget: 10000,
    maxDrawdown: 4000,
    riskCuttingPercent: 50,
    compoundingPercent: 20,
    maxLossPerDay: 2000,
    extraDaysIfLoss: 2,
    useMaxDrawdownAsCapital: false,
  });

  const [projectionData, setProjectionData] = useState<ProjectionDay[]>([]);
  const [accountsMinimized, setAccountsMinimized] = useState(false);
  const [projectionMinimized, setProjectionMinimized] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);

  const { data: accounts = [], isLoading: isAccountsLoading } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  const { data: trades = [], isLoading: isTradesLoading } = useQuery<Trade[]>({
    queryKey: ['/api/trades'],
  });

  const { data: savedProjections = [] } = useQuery({
    queryKey: ['/api/projections'],
  });

  const accountForm = useForm<InsertAccount>({
    resolver: zodResolver(insertAccountSchema),
    defaultValues: {
      name: '',
      firm: '',
      type: 'challenge',
      balance: 0,
      startingBalance: 0,
      profitTarget: 0,
      dailyLossLimit: 0,
      maxDrawdown: 0,
      currentDrawdown: 0,
      riskLimitUsed: 0,
      status: 'active',
      daysTraded: 0,
      accountCost: 0,
      purchaseMethod: '',
      resetCount: 0,
      totalResetsCost: 0,
      activationCost: 0,
      activationPaid: false,
      includesActivationFee: false,
    },
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createAccountMutation = useMutation({
    mutationFn: async (data: InsertAccount) => {
      const response = await apiRequest('/api/accounts', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      setIsAccountDialogOpen(false);
      accountForm.reset();
      toast({ title: 'Account created successfully!' });
    },
    onError: (error) => {
      console.error('Error creating account:', error);
      toast({ title: 'Error creating account', variant: 'destructive' });
    }
  });

  const saveProjectionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/projections', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projections'] });
      toast({ title: 'Projection plan saved successfully!' });
    },
    onError: (error) => {
      console.error('Error saving projection:', error);
      toast({ title: 'Error saving projection', variant: 'destructive' });
    }
  });

  const selectedAccountData = useMemo(() => {
    if (settings.selectedAccountId) {
      const account = accounts.find(a => a.id === settings.selectedAccountId);
      if (account) {
        const accountTrades = trades.filter(t => t.accountId === account.id);
        const totalPnl = accountTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
        const winningTrades = accountTrades.filter(t => (t.pnl || 0) > 0);
        const losingTrades = accountTrades.filter(t => (t.pnl || 0) < 0);
        const winRate = accountTrades.length > 0 ? (winningTrades.length / accountTrades.length) * 100 : 0;
        const bestTrade = Math.max(...accountTrades.map(t => t.pnl || 0), 0);
        const worstTrade = Math.min(...accountTrades.map(t => t.pnl || 0), 0);
        const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length : 0;
        const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades.length) : 0;
        const actualProgress = totalPnl > 0 ? (totalPnl / settings.profitTarget) * 100 : 0;
        const totalInvested = account.accountCost + account.totalResetsCost + account.activationCost;
        const disciplineScore = 85; // Mock discipline score
        
        return {
          ...account,
          trades: accountTrades,
          totalPnl,
          winningTrades: winningTrades.length,
          losingTrades: losingTrades.length,
          winRate,
          bestTrade,
          worstTrade,
          avgWin,
          avgLoss,
          actualProgress,
          totalInvested,
          disciplineScore,
          totalTrades: accountTrades.length
        };
      }
    }
    return null;
  }, [settings.selectedAccountId, accounts, trades, settings.profitTarget]);

  useEffect(() => {
    const generateProjection = () => {
      const days: ProjectionDay[] = [];
      let currentCapital = settings.startingCapital;
      let currentRisk = settings.riskPerTrade;
      let cumulativeTarget = 0;
      let cumulativeActual = 0;

      for (let i = 1; i <= 365; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i - 1);
        
        const reward = currentRisk * settings.riskRewardRatio;
        cumulativeTarget += reward;
        
        let actualPnl: number | undefined;
        let isWin = true;
        
        if (settings.mode === 'account' && selectedAccountData) {
          const dayTrades = selectedAccountData.trades.filter(t => {
            const tradeDate = new Date(t.date);
            return tradeDate.toDateString() === date.toDateString();
          });
          
          if (dayTrades.length > 0) {
            actualPnl = dayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
            cumulativeActual += actualPnl;
            isWin = actualPnl > 0;
          }
        }

        const day: ProjectionDay = {
          date: date.toISOString().split('T')[0],
          dayNumber: i,
          risk: currentRisk,
          reward,
          targetExpectation: cumulativeTarget,
          actualPnl,
          isWin,
          cumulativeTarget,
          cumulativeActual
        };

        days.push(day);

        if (cumulativeTarget >= settings.profitTarget) {
          break;
        }

        if (settings.mode === 'account' && selectedAccountData) {
          if (!isWin && settings.riskCuttingPercent > 0) {
            currentRisk = currentRisk * (1 - settings.riskCuttingPercent / 100);
          }
          
          if (isWin && settings.compoundingPercent > 0) {
            currentRisk = currentRisk * (1 + settings.compoundingPercent / 100);
          }
        } else {
          if (settings.compoundingPercent > 0) {
            currentRisk = currentRisk * (1 + settings.compoundingPercent / 100);
          }
        }
      }
      
      setProjectionData(days);
    };

    generateProjection();
  }, [settings, selectedAccountData]);

  const updateSetting = (key: keyof ProjectionSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const activeProjection = useMemo(() => {
    if (!settings.selectedAccountId || !savedProjections || !Array.isArray(savedProjections)) return null;
    return savedProjections.find((p: any) => p.accountId === settings.selectedAccountId && p.status === 'active' && p.isLocked);
  }, [settings.selectedAccountId, savedProjections]);

  const hasActiveGoal = !!activeProjection;

  const daysToTarget = projectionData.length;
  const dailyRewardPerAccount = settings.riskPerTrade * settings.riskRewardRatio;
  const totalDailyReward = dailyRewardPerAccount * settings.copiedAccounts;
  const progressPercentage = selectedAccountData ? selectedAccountData.actualProgress : 0;
  
  const theoreticalDays = Math.ceil(settings.profitTarget / totalDailyReward);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white primary-header text-gradient-rainbow">
          PropFirms Accounts & Responsible Risk/Day-to-Pass Planning
        </h1>
      </div>

      {/* PropFirms Accounts Section */}
      <div className="bg-gray-800/30 rounded-lg border border-gray-700 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white">PropFirms Accounts</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAccountsMinimized(!accountsMinimized)}
              className="text-gray-400 hover:text-white"
            >
              {accountsMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
          </div>
          <Button 
            onClick={() => setIsAccountDialogOpen(true)}
            className="bg-prop-gold hover:bg-prop-gold/90 text-black px-6 py-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Account
          </Button>
        </div>
        
        {!accountsMinimized && <AccountManagement accounts={accounts} />}
      </div>

      {/* Risk Management & Projection Section */}
      <div className="bg-gray-800/30 rounded-lg border border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white">Risk Management & Responsible Day-to-Pass Planning</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setProjectionMinimized(!projectionMinimized)}
              className="text-gray-400 hover:text-white"
            >
              {projectionMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {!projectionMinimized && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Settings Panel */}
            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Projection Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Mode</Label>
                  <Select value={settings.mode} onValueChange={(value) => updateSetting('mode', value)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simulation">Simulation</SelectItem>
                      <SelectItem value="account">Account-based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {settings.mode === 'account' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Select Account</Label>
                      <Select 
                        value={settings.selectedAccountId?.toString() || ''} 
                        onValueChange={(value) => updateSetting('selectedAccountId', value ? parseInt(value) : null)}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600">
                          <SelectValue placeholder="Choose an account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map(account => (
                            <SelectItem key={account.id} value={account.id.toString()}>
                              {account.name} - {formatCurrency(account.balance)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-white">Number of Copied Accounts</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={settings.copiedAccounts}
                        onChange={(e) => updateSetting('copiedAccounts', Number(e.target.value))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <p className="text-xs text-gray-400">
                        Multiple accounts reach targets faster (e.g., 2 accounts = half the time)
                      </p>
                    </div>

                    {/* Save Projection Button for Account Mode */}
                    {settings.selectedAccountId && (
                      <>
                        {hasActiveGoal ? (
                          <div className="w-full p-4 bg-prop-gold/20 border border-prop-gold rounded-lg text-center">
                            <Bookmark className="mx-auto h-8 w-8 text-prop-gold mb-2" />
                            <p className="text-prop-gold font-medium">Plan Active</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Target: {formatCurrency(activeProjection?.targetProfit)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Cannot modify until target is reached or plan fails
                            </p>
                          </div>
                        ) : (
                          <Button
                            onClick={() => {
                              const projectionData = {
                                accountId: settings.selectedAccountId,
                                startingCapital: settings.startingCapital,
                                riskPerTrade: settings.riskPerTrade,
                                rewardRiskRatio: settings.riskRewardRatio,
                                targetProfit: settings.profitTarget,
                                projectedDays: daysToTarget,
                                compoundingEnabled: settings.compoundingPercent > 0,
                                compoundingPercentage: settings.compoundingPercent,
                                riskCuttingEnabled: settings.riskCuttingPercent > 0,
                                riskCuttingPercentage: settings.riskCuttingPercent,
                                status: 'active',
                                isLocked: true
                              };
                              saveProjectionMutation.mutate(projectionData);
                            }}
                            disabled={saveProjectionMutation.isPending}
                            className="w-full bg-prop-gold hover:bg-prop-gold/80 text-black font-medium"
                          >
                            <Save className="mr-2 h-4 w-4" />
                            {saveProjectionMutation.isPending ? 'Starting Plan...' : 'Save to start the Plan'}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Copied Accounts for Simulation Mode */}
                {settings.mode === 'simulation' && (
                  <div className="space-y-2">
                    <Label className="text-white">Number of Copied Accounts</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={settings.copiedAccounts || ""}
                      onChange={(e) => updateSetting('copiedAccounts', e.target.value === "" ? null : Number(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <p className="text-xs text-gray-400">
                      Multiple accounts reach targets faster (e.g., 2 accounts = half the time)
                    </p>
                  </div>
                )}

                {/* Capital Mode - Always use Max Drawdown */}
                <div className="space-y-2">
                  <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-400">
                      <strong className="text-orange-400">Max Drawdown</strong> is used for all calculations
                    </p>
                  </div>
                </div>

                {/* Financial Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">
                      Starting Capital (Display Only)
                    </Label>
                    <Input
                      type="number"
                      value={settings.startingCapital || ""}
                      onChange={(e) => updateSetting('startingCapital', e.target.value === "" ? null : Number(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Risk Per Trade</Label>
                    <Input
                      type="number"
                      value={settings.riskPerTrade || ""}
                      onChange={(e) => updateSetting('riskPerTrade', e.target.value === "" ? null : Number(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Risk:Reward Ratio</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={settings.riskRewardRatio || ""}
                      onChange={(e) => updateSetting('riskRewardRatio', e.target.value === "" ? null : Number(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Profit Target</Label>
                    <Input
                      type="number"
                      value={settings.profitTarget || ""}
                      onChange={(e) => updateSetting('profitTarget', e.target.value === "" ? null : Number(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Max Drawdown</Label>
                    <Input
                      type="number"
                      value={settings.maxDrawdown || ""}
                      onChange={(e) => updateSetting('maxDrawdown', e.target.value === "" ? null : Number(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Max Loss/Day</Label>
                    <Input
                      type="number"
                      value={settings.maxLossPerDay || ""}
                      onChange={(e) => updateSetting('maxLossPerDay', e.target.value === "" ? null : Number(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Advanced Risk Management */}
                <div className="space-y-4 pt-4 border-t border-gray-700">
                  <h4 className="text-white font-medium">Advanced Settings</h4>
                  
                  {/* Animated Risk Cutting Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-white font-medium">Risk Cutting % (on loss)</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl risk-slider-emoji">
                          {settings.riskCuttingPercent === 0 ? '😐' : 
                           settings.riskCuttingPercent <= 25 ? '🛡️' :
                           settings.riskCuttingPercent <= 50 ? '🔒' :
                           settings.riskCuttingPercent <= 75 ? '🛡️' : '🏛️'}
                        </span>
                        <Badge variant="outline" className="bg-red-900/20 border-red-500 text-red-300 risk-slider-badge">
                          {settings.riskCuttingPercent}%
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Slider
                        value={[settings.riskCuttingPercent]}
                        onValueChange={(value) => updateSetting('riskCuttingPercent', value[0])}
                        max={100}
                        step={5}
                        className="w-full animated-slider"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>No Cut (0%)</span>
                        <span>Conservative (25%)</span>
                        <span>Moderate (50%)</span>
                        <span>Aggressive (75%)</span>
                        <span>Extreme (100%)</span>
                      </div>
                      <p className="text-xs text-gray-400 bg-gray-800/50 p-2 rounded">
                        💡 Auto-reduce risk after losses - higher % = more conservative after bad trades
                      </p>
                    </div>
                  </div>

                  {/* Animated Compounding Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-white font-medium">Compounding % (on win)</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl risk-slider-emoji">
                          {settings.compoundingPercent === 0 ? '🔒' : 
                           settings.compoundingPercent <= 10 ? '📈' :
                           settings.compoundingPercent <= 25 ? '🚀' :
                           settings.compoundingPercent <= 50 ? '💎' : '🔥'}
                        </span>
                        <Badge variant="outline" className="bg-green-900/20 border-green-500 text-green-300 risk-slider-badge">
                          {settings.compoundingPercent}%
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Slider
                        value={[settings.compoundingPercent]}
                        onValueChange={(value) => updateSetting('compoundingPercent', value[0])}
                        max={100}
                        step={5}
                        className="w-full animated-slider"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Fixed (0%)</span>
                        <span>Steady (10%)</span>
                        <span>Growth (25%)</span>
                        <span>Aggressive (50%)</span>
                        <span>Extreme (100%)</span>
                      </div>
                      <p className="text-xs text-gray-400 bg-gray-800/50 p-2 rounded">
                        🎯 Auto-increase risk after wins - compounds only on winning trades
                      </p>
                    </div>
                  </div>

                  {/* Real-time Effect Preview */}
                  {(settings.riskCuttingPercent > 0 || settings.compoundingPercent > 0) && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-600/30 rounded-lg">
                      <h5 className="text-white font-medium mb-2 flex items-center">
                        <span className="text-lg mr-2">⚡</span>
                        Live Effect Preview
                      </h5>
                      <div className="space-y-2 text-sm">
                        {settings.riskCuttingPercent > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">After a loss:</span>
                            <span className="text-red-400">
                              {formatCurrency(settings.riskPerTrade)} → {formatCurrency(settings.riskPerTrade * (1 - settings.riskCuttingPercent / 100))}
                            </span>
                          </div>
                        )}
                        {settings.compoundingPercent > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">After a win:</span>
                            <span className="text-green-400">
                              {formatCurrency(settings.riskPerTrade)} → {formatCurrency(settings.riskPerTrade * (1 + settings.compoundingPercent / 100))}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Performance Overview Section */}
              <section className="performance-dashboard">
                <h3 className="text-xl font-semibold text-white mb-4">Performance Overview</h3>
                
                {/* Row 1: Core Financial (3 widgets) */}
                <div className="dashboard-row-1 grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <Card className="bg-prop-gradient-gold border-prop-gold/20">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-black">
                          {formatCurrency(selectedAccountData?.totalPnl || 0)}
                        </div>
                        <div className="text-sm text-black/70">Net Balance</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-dark-card border-dark-border hover:border-prop-gold/50 transition-all">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {formatCurrency(settings.profitTarget)}
                        </div>
                        <div className="text-sm text-gray-400">Target</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-dark-card border-dark-border hover:border-prop-gold/50 transition-all">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {progressPercentage.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-400">Progress</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Row 2: Trading Performance (4 widgets) */}
                <div className="dashboard-row-2 grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <Card className="bg-dark-card border-dark-border hover:border-prop-gold/50 transition-all">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {selectedAccountData?.winRate.toFixed(1) || 0}%
                        </div>
                        <div className="text-sm text-gray-400">Win Rate</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-dark-card border-dark-border hover:border-prop-gold/50 transition-all">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {selectedAccountData?.totalTrades || 0}
                        </div>
                        <div className="text-sm text-gray-400">Total Trades</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-dark-card border-dark-border hover:border-prop-gold/50 transition-all">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {formatCurrency(selectedAccountData?.bestTrade || 0)}
                        </div>
                        <div className="text-sm text-gray-400">Best Trade</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-dark-card border-dark-border hover:border-prop-gold/50 transition-all">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-400">
                          {formatCurrency(selectedAccountData?.worstTrade || 0)}
                        </div>
                        <div className="text-sm text-gray-400">Worst Trade</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Row 3: Analysis Summary (4 widgets) */}
                <div className="dashboard-row-3 grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <Card className="bg-dark-card border-dark-border hover:border-prop-gold/50 transition-all">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {daysToTarget}
                        </div>
                        <div className="text-sm text-gray-400">Days to Target</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-dark-card border-dark-border hover:border-prop-gold/50 transition-all">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {formatCurrency(dailyRewardPerAccount)}
                        </div>
                        <div className="text-sm text-gray-400">Daily Target</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-dark-card border-dark-border hover:border-prop-gold/50 transition-all">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {settings.riskRewardRatio.toFixed(1)}:1
                        </div>
                        <div className="text-sm text-gray-400">R:R Ratio</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-dark-card border-dark-border hover:border-prop-gold/50 transition-all">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {selectedAccountData?.disciplineScore || 0}
                        </div>
                        <div className="text-sm text-gray-400">Discipline Score</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Projection Timeline */}
              <Card className="bg-dark-card border-dark-border">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Projection Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-4 text-gray-300">Date</th>
                          <th className="text-center py-3 px-4 text-gray-300"># Days</th>
                          <th className="text-right py-3 px-4 text-gray-300">Risk</th>
                          <th className="text-right py-3 px-4 text-gray-300">Daily Reward</th>
                          <th className="text-right py-3 px-4 text-gray-300">Target Expectation</th>
                          {settings.mode === 'account' && (
                            <th className="text-right py-3 px-4 text-gray-300">Actual P&L</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {projectionData.slice(0, 30).map((day, index) => (
                          <tr 
                            key={index} 
                            className={`border-b border-gray-800 ${
                              day.targetExpectation >= settings.profitTarget ? 'bg-green-900/20' : ''
                            }`}
                          >
                            <td className="py-3 px-4 text-blue-400">
                              {formatDate(day.date)}
                            </td>
                            <td className="py-3 px-4 text-center text-gray-300">
                              Day {day.dayNumber}
                            </td>
                            <td className="py-3 px-4 text-right text-blue-400">
                              {formatCurrency(day.risk)}
                            </td>
                            <td className="py-3 px-4 text-right text-green-400">
                              {formatCurrency(day.reward)}
                            </td>
                            <td className="py-3 px-4 text-right font-bold">
                              <span className={day.targetExpectation >= settings.profitTarget ? 'text-green-400' : 'text-prop-gold'}>
                                {formatCurrency(day.targetExpectation)}
                              </span>
                              {day.targetExpectation >= settings.profitTarget && (
                                <CheckCircle2 className="inline ml-2 h-4 w-4 text-green-400" />
                              )}
                            </td>
                            {settings.mode === 'account' && (
                              <td className="py-3 px-4 text-right">
                                {day.actualPnl !== undefined ? (
                                  <span className={day.actualPnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                                    {formatCurrency(day.actualPnl)}
                                  </span>
                                ) : (
                                  <span className="text-gray-500">-</span>
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Account Creation Dialog */}
      <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
        <DialogContent className="max-w-2xl bg-dark-bg border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Create New Trading Account</DialogTitle>
          </DialogHeader>
          <Form {...accountForm}>
            <form onSubmit={accountForm.handleSubmit((data) => createAccountMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={accountForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Account Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-dark-bg border-gray-700 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={accountForm.control}
                  name="firm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Firm</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-dark-bg border-gray-700 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={accountForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Account Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-dark-bg border-gray-700">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                  control={accountForm.control}
                  name="balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Starting Balance</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="bg-dark-bg border-gray-700 text-white" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAccountDialogOpen(false)}
                  className="border-gray-700 text-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-prop-gold hover:bg-prop-gold/90 text-black"
                  disabled={createAccountMutation.isPending}
                >
                  {createAccountMutation.isPending ? 'Creating...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}