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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { calculateRiskSuggestions, type AssetSymbol } from "@/lib/risk-calculator";
import { TRADING_ASSETS, type TradingAsset } from "@/lib/trading-assets";
import AccountManagement from "@/components/account-management";
import { 
  Target, 
  TrendingUp, 
  Calculator, 
  Calendar,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  CheckCircle,
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
  ChevronDown,
  ChevronUp,
  Shield,
  Lock,
  Unlock,
  Settings,
  Edit
} from "lucide-react";

interface ProjectionSettings {
  mode: 'account' | 'simulation';
  selectedAccountId: number | null;
  copiedAccounts: number;
  startingCapital: number;
  riskPerTrade: number;
  riskDivider: number;
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
  const { toast } = useToast();
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isAccountsMinimized, setIsAccountsMinimized] = useState(false);
  const [isModifyingPlan, setIsModifyingPlan] = useState(false);
  const [modifyingProjectionId, setModifyingProjectionId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Check if we're in modification mode
  useEffect(() => {
    const modifyData = localStorage.getItem('modifyProjectionData');
    if (modifyData) {
      const data = JSON.parse(modifyData);
      setIsModifyingPlan(true);
      setModifyingProjectionId(data.projectionId);
    }
  }, []);

  const { data: accounts = [], isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: trades = [] } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: InsertAccount) => {
      return apiRequest("/api/accounts", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      setIsAccountDialogOpen(false);
      accountForm.reset();
      toast({
        title: "Account Created",
        description: "Your account has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create account.",
        variant: "destructive",
      });
    },
  });

  const accountForm = useForm<InsertAccount>({
    resolver: zodResolver(insertAccountSchema),
    defaultValues: {
      name: "",
      firm: "",
      type: "challenge",
      status: "active",
      startingBalance: 0,
      profitTarget: 0,
      maxDrawdown: 0,
      hasDailyLossLimit: false,
      dailyLossLimit: null,
      dailyLossLimitType: "soft",
      
      // Account Rules
      minimumTradingDays: null,
      timeLimit: null,
      daysRequiredToPass: null,
      consistencyPercentage: null,
      
      // Discipline Scoring
      disciplineRiskPeriod: "daily",
      disciplineRiskPeriodDays: null,
      maxDailyRiskBudget: null,
      
      // Financial tracking fields
      accountCost: null,
      purchaseMethod: null,
      resetCount: 0,
      totalResetsCost: 0,
      activationCost: null,
      activationPaid: false,
      includesActivationFee: false,
      
      // Payout rule fields
      daysRequiredForPayout: null,
      winningDayMinimum: null,
      payoutFrequency: "monthly",
      minimumPayoutAmount: null,
      maxNetBalanceForPayout: null,
      profitSplit: null,
      maximumPayoutAllowed: null,
      maximumPayoutPerAccount: null,
      bufferAmount: null,
      bufferPercentage: null,
      accountBufferRequired: false,
      
      // Risk management fields
      tradingCapital: null,
      riskCalculationPeriod: "weekly",
      useRiskPercentage: false,
      riskPercentage: null,
      customRiskAmount: null,
      riskRewardRatio: 2.0,
      primaryAsset: "ES" as AssetSymbol,
      secondaryAsset: "",
      tertiaryAsset: "",
      takeProfitPoints: 20,
      tradingSessionStart: "",
      tradingSessionEnd: "",
      timezone: "",
      dailyWorkingHours: null,
      hourlyWages: null,
      copyTradingAllowed: true,
      newsTradingAllowed: true,
      useIntradayMargins: true,
      marginSafetyBuffer: 50.0,
      stopLossPoints: 10,
      riskPerTrade: null,
      maxTradesPerDay: 0,
      maxRiskPerDay: null,
      maxPositionSize: null,
      preferredAssets: null,
      
      // Enhanced and Live Account Settings
      enhancedPayoutsAvailable: false,
      liveAccountAvailable: false,
      transitionTrigger: null,
      allowChallengePayouts: false,
      
      // Live account transition settings
      liveAccountTransitionEnabled: false,
      liveAccountTransitionProfitTarget: null,
      liveAccountTransitionDays: null,
      liveAccountTransitionDrawdownLimit: null,
      
      // Funded Account Payout Settings
      fundedPayoutEnabled: false,
      fundedDaysRequiredForPayout: null,
      fundedWinningDayMinimum: null,
      fundedPayoutFrequency: null,
      fundedMinimumPayoutAmount: null,
      fundedMaxNetBalanceForPayout: null,
      fundedProfitSplit: null,
      
      // Live Account Payout Settings
      livePayoutEnabled: false,
      liveDaysRequiredForPayout: null,
      liveWinningDayMinimum: null,
      livePayoutFrequency: null,
      liveMinimumPayoutAmount: null,
      liveMaxNetBalanceForPayout: null,
      liveProfitSplit: null,
    },
  });

  const accountFormValues = accountForm.watch();
  const riskSuggestion = useMemo(() => {
    return calculateRiskSuggestions(accountFormValues);
  }, [accountFormValues]);

  const saveProjectionMutation = useMutation({
    mutationFn: async (projectionData: any) => {
      if (isModifyingPlan && modifyingProjectionId) {
        return await apiRequest(`/api/projections/${modifyingProjectionId}`, "PUT", projectionData);
      } else {
        return await apiRequest("/api/projections/save", "POST", projectionData);
      }
    },
    onSuccess: () => {
      toast({
        title: isModifyingPlan ? "Projection Updated" : "Projection Saved",
        description: isModifyingPlan ? "Your projection has been updated successfully" : "Your projection has been saved successfully",
      });
      if (isModifyingPlan) {
        setIsModifyingPlan(false);
        setModifyingProjectionId(null);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: isModifyingPlan ? "Failed to update projection" : "Failed to save projection",
        variant: "destructive",
      });
    },
  });

  const [settings, setSettings] = useState<ProjectionSettings>(() => {
    // Check if we're modifying an existing plan
    const modifyData = localStorage.getItem('modifyProjectionData');
    if (modifyData) {
      localStorage.removeItem('modifyProjectionData'); // Clear it after use
      return JSON.parse(modifyData);
    }
    
    const saved = localStorage.getItem('projectionSettings');
    return saved ? JSON.parse(saved) : {
      mode: 'simulation',
      selectedAccountId: null,
      copiedAccounts: 0,
      startingCapital: 0,
      riskPerTrade: 0,
      riskDivider: 1,
      riskRewardRatio: 0,
      profitTarget: 0,
      maxDrawdown: 0,
      riskCuttingPercent: 0,
      compoundingPercent: 0,
      maxLossPerDay: 0,
      extraDaysIfLoss: 0,
      useMaxDrawdownAsCapital: false,
    };
  });

  const [projectionData, setProjectionData] = useState<ProjectionDay[]>([]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('projectionSettings', JSON.stringify(settings));
  }, [settings]);

  // Query for saved projections for the selected account
  const { data: savedProjections = [] } = useQuery({
    queryKey: ["/api/projections/account", settings.selectedAccountId],
    enabled: !!settings.selectedAccountId,
  });

  // Calculate account-specific data when account mode is selected
  const selectedAccountData = useMemo(() => {
    if (settings.mode !== 'account' || !settings.selectedAccountId) {
      return null;
    }
    
    const selectedAccount = accounts.find(acc => acc.id === settings.selectedAccountId);
    if (!selectedAccount) return null;
    
    const accountTrades = trades.filter(trade => trade.accountId === settings.selectedAccountId);
    const totalPnl = accountTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    
    return {
      account: selectedAccount,
      trades: accountTrades,
      totalPnl,
      actualProgress: totalPnl / settings.profitTarget * 100,
    };
  }, [accounts, trades, settings.selectedAccountId, settings.mode, settings.profitTarget]);

  // Generate projection data
  useEffect(() => {
    const generateProjection = () => {
      const days: ProjectionDay[] = [];
      let cumulativeTarget = 0;
      let cumulativeActual = 0;
      let currentRisk = settings.riskPerTrade;
      let tradingDayCount = 0;
      let calendarDayCount = 0;
      
      // Determine effective capital based on switch
      const effectiveCapital = settings.useMaxDrawdownAsCapital ? settings.maxDrawdown : settings.startingCapital;
      
      // Calculate daily profit per account
      const dailyProfitPerAccount = settings.riskPerTrade * settings.riskRewardRatio;
      const totalDailyProfit = dailyProfitPerAccount * settings.copiedAccounts;
      
      // Calculate exact days needed (without compounding for base calculation)
      const baseDaysNeeded = Math.ceil(settings.profitTarget / totalDailyProfit);
      
      // Generate days until target is reached
      while (cumulativeTarget < settings.profitTarget && tradingDayCount < 200) { // Safety limit
        calendarDayCount++;
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + calendarDayCount - 1);
        
        // Skip weekends for trading days
        if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
          continue;
        }
        
        tradingDayCount++;
        
        // Calculate reward for this day (current risk * RR * copied accounts)
        const rewardPerAccount = currentRisk * settings.riskRewardRatio;
        const totalDailyReward = rewardPerAccount * settings.copiedAccounts;
        cumulativeTarget += totalDailyReward;
        
        // Check for actual trade data if in account mode
        let actualPnl: number | undefined;
        let isWin = true;
        
        if (selectedAccountData && selectedAccountData.trades.length > 0) {
          const dayTrades = selectedAccountData.trades.filter(trade => {
            const tradeDate = new Date(trade.date);
            return tradeDate.toDateString() === currentDate.toDateString();
          });
          
          if (dayTrades.length > 0) {
            actualPnl = dayTrades.reduce((sum, trade) => sum + trade.pnl, 0);
            isWin = actualPnl > 0;
            cumulativeActual += actualPnl;
          }
        }
        
        days.push({
          date: currentDate.toISOString().split('T')[0],
          dayNumber: tradingDayCount,
          risk: currentRisk,
          reward: totalDailyReward,
          targetExpectation: cumulativeTarget,
          actualPnl,
          isWin,
          cumulativeTarget,
          cumulativeActual,
        });
        
        // Apply risk adjustments AFTER recording the day
        if (selectedAccountData && actualPnl !== undefined) {
          // Apply dynamic risk adjustment on losses
          if (!isWin && settings.riskCuttingPercent > 0) {
            currentRisk = currentRisk * (1 - settings.riskCuttingPercent / 100);
          }
          
          // Apply compounding only on wins
          if (isWin && settings.compoundingPercent > 0) {
            currentRisk = currentRisk * (1 + settings.compoundingPercent / 100);
          }
        } else {
          // In simulation mode, apply compounding on assumed wins
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

  // Check if there's an active saved projection for the selected account
  const activeProjection = useMemo(() => {
    if (!settings.selectedAccountId || !savedProjections || !Array.isArray(savedProjections)) return null;
    return savedProjections.find((p: any) => p.accountId === settings.selectedAccountId && p.status === 'active' && p.isLocked);
  }, [settings.selectedAccountId, savedProjections]);

  const hasActiveGoal = !!activeProjection;

  const daysToTarget = projectionData.length;
  const dailyRewardPerAccount = settings.riskPerTrade * settings.riskRewardRatio;
  const totalDailyReward = dailyRewardPerAccount * settings.copiedAccounts;
  const progressPercentage = selectedAccountData ? selectedAccountData.actualProgress : 0;
  
  // Calculate theoretical days without compounding
  const theoreticalDays = Math.ceil(settings.profitTarget / totalDailyReward);

  // Risk adjustment emoji feedback
  const getRiskEmoji = (percent: number) => {
    if (percent >= 50) return '🏛️'; // Fort Knox level protection
    if (percent >= 30) return '🔒'; // Locked down
    if (percent >= 15) return '🛡️'; // Protected
    return '📈'; // Normal risk
  };
  
  const getCompoundingEmoji = (percent: number) => {
    if (percent >= 25) return '🔥'; // On fire
    if (percent >= 20) return '💎'; // Diamond hands
    if (percent >= 15) return '🚀'; // Rocket growth
    if (percent >= 10) return '📈'; // Growing
    if (percent >= 5) return '🔒'; // Locked gains
    return '📊'; // Standard
  };

  const getRiskLevelColor = (level: 'low' | 'moderate' | 'high' | 'critical') => {
    switch (level) {
      case 'low': return 'text-green-400 bg-green-500/20';
      case 'moderate': return 'text-yellow-400 bg-yellow-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'critical': return 'text-red-400 bg-red-500/20';
    }
  };

  const getAccountStatusColor = (status: 'active' | 'passed' | 'failed' | 'withdrawn') => {
    switch (status) {
      case 'active': return 'text-blue-400 bg-blue-500/20';
      case 'passed': return 'text-green-400 bg-green-500/20';
      case 'failed': return 'text-red-400 bg-red-500/20';
      case 'withdrawn': return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient-rainbow">Account Management & Projections</h1>
          <p className="text-gray-400">Manage your trading accounts and project future performance</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsAccountDialogOpen(true)}
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold hover:from-yellow-500 hover:to-yellow-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Account
          </Button>
        </div>
      </div>

      {/* Enhanced PropFirms Accounts Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-yellow-500" />
            Trading Accounts
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAccountsMinimized(!isAccountsMinimized)}
            className="text-gray-400 hover:text-white"
          >
            {isAccountsMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
        
        {!isAccountsMinimized && (
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
            <CardContent className="p-6">
              <AccountManagement accounts={accounts} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enhanced Risk Management & Projection Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
          <Calculator className="w-6 h-6 text-yellow-500" />
          Target Projection Calculator
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enhanced Settings Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20">
              <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Calculator className="mr-2 h-5 w-5" />
                    Projection Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Mode Selection */}
                  <div className="space-y-2">
                    <Label className="text-white">Projection Mode</Label>
                    <Tabs value={settings.mode} onValueChange={(value) => updateSetting('mode', value)}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="simulation">Simulation</TabsTrigger>
                        <TabsTrigger value="account">Account Based</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Account Selection (only in account mode) */}
                  {settings.mode === 'account' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white">Select Account</Label>
                        <Select 
                          value={settings.selectedAccountId?.toString() || ""} 
                          onValueChange={(value) => updateSetting('selectedAccountId', value ? parseInt(value) : null)}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Choose an account..." />
                          </SelectTrigger>
                          <SelectContent>
                            {accounts.map(account => (
                              <SelectItem key={account.id} value={account.id.toString()}>
                                {account.name} - {formatCurrency(account.startingBalance)}
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
                              {saveProjectionMutation.isPending ? 
                                (isModifyingPlan ? 'Updating Plan...' : 'Starting Plan...') : 
                                (isModifyingPlan ? 'Update Plan' : 'Save to start the Plan')}
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

                  {/* Risk Per Trade Divider */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Risk Per Trade Divider</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={settings.riskDivider || ""}
                        onChange={(e) => updateSetting('riskDivider', e.target.value === "" ? null : Number(e.target.value))}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="1"
                      />
                      <p className="text-xs text-gray-400">
                        Split your total risk across {settings.riskDivider || 1} trade{(settings.riskDivider || 1) > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Risk Per Individual Trade</Label>
                      <div className="bg-gray-800/50 border border-gray-600 rounded-md p-3 text-white">
                        ${((settings.riskPerTrade || 0) / (settings.riskDivider || 1)).toFixed(2)}
                      </div>
                      <p className="text-xs text-gray-400">
                        Calculated risk for each individual position
                      </p>
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
                          <span className="text-2xl compounding-slider-emoji">
                            {settings.compoundingPercent === 0 ? '🔒' : 
                             settings.compoundingPercent <= 25 ? '📈' :
                             settings.compoundingPercent <= 50 ? '🚀' :
                             settings.compoundingPercent <= 75 ? '💎' : '🔥'}
                          </span>
                          <Badge variant="outline" className="bg-green-900/20 border-green-500 text-green-300 compounding-slider-badge">
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
                          <span>Conservative (25%)</span>
                          <span>Moderate (50%)</span>
                          <span>Aggressive (75%)</span>
                          <span>Extreme (100%)</span>
                        </div>
                        <p className="text-xs text-gray-400 bg-gray-800/50 p-2 rounded">
                          💡 Increase risk after wins - higher % = more risk on winning streaks
                        </p>
                      </div>
                    </div>

                    {/* Live Effect Preview */}
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                      <h5 className="text-white font-medium mb-2">Live Effect Preview</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Current Risk:</span>
                          <span className="text-blue-400">{formatCurrency(settings.riskPerTrade)}</span>
                        </div>
                        {settings.riskCuttingPercent > 0 && (
                          <div className="flex justify-between">
                            <span className="text-red-400">After Loss:</span>
                            <span className="text-red-400">
                              {formatCurrency(settings.riskPerTrade * (1 - settings.riskCuttingPercent / 100))}
                            </span>
                          </div>
                        )}
                        {settings.compoundingPercent > 0 && (
                          <div className="flex justify-between">
                            <span className="text-green-400">After Win:</span>
                            <span className="text-green-400">
                              {formatCurrency(settings.riskPerTrade * (1 + settings.compoundingPercent / 100))}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analysis Cards */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-blue-600 border-blue-500/20">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {daysToTarget}
                      </div>
                      <div className="text-sm text-blue-100">Days to Target</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-prop-gold border-prop-gold/20">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-black">
                        {formatCurrency(totalDailyReward)}
                      </div>
                      <div className="text-sm text-yellow-800">Daily Reward</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-green-600 border-green-500/20">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {progressPercentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-green-100">Progress</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-lime-600 border-lime-500/20">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {selectedAccountData ? selectedAccountData.trades.filter((trade, index, self) => 
                          self.findIndex(t => t.date === trade.date) === index
                        ).length : 0}
                      </div>
                      <div className="text-sm text-lime-100">Active Trading Days</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Account Summary (if account mode) */}
              {settings.mode === 'account' && selectedAccountData && (
                <Card className="bg-dark-card border-dark-border">
                  <CardHeader>
                    <CardTitle className="text-white">Selected Account Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">
                          {formatCurrency(selectedAccountData.account.startingBalance + selectedAccountData.totalPnl)}
                        </div>
                        <div className="text-sm text-gray-400">Current Balance</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">
                          {formatCurrency(selectedAccountData.totalPnl)}
                        </div>
                        <div className="text-sm text-gray-400">Total P&L</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-prop-gold">
                          {settings.copiedAccounts}
                        </div>
                        <div className="text-sm text-gray-400">Copied Accounts</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-400">
                          {selectedAccountData.trades.length}
                        </div>
                        <div className="text-sm text-gray-400">Total Trades</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Daily Projection Timeline - Redesigned */}
              <Card className="bg-gradient-to-br from-black/95 via-gray-900/90 to-black/95 border border-gray-700">
                <CardHeader>
                  {/* Header with chart icon and title */}
                  <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="w-6 h-6 text-yellow-500" />
                    <div>
                      <CardTitle className="text-white text-xl">Daily Trading Projection</CardTitle>
                      <p className="text-gray-400 text-sm mt-1">
                        Day-by-day breakdown of your path to ${formatCurrency(settings.profitTarget)} target
                      </p>
                    </div>
                  </div>
                  
                  {/* Three info banner cards in a grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Risk Per Trade Card */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 font-medium text-sm">RISK PER TRADE</span>
                      </div>
                      <div className="text-2xl font-bold text-white">${formatCurrency(settings.riskPerTrade)}</div>
                      <div className="text-xs text-gray-400">Amount you risk per trade</div>
                    </div>
                    
                    {/* Daily Profit Target Card */}
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-medium text-sm">DAILY PROFIT TARGET</span>
                      </div>
                      <div className="text-2xl font-bold text-white">${formatCurrency(settings.riskPerTrade * settings.riskRewardRatio)}</div>
                      <div className="text-xs text-gray-400">Single account only</div>
                    </div>
                    
                    {/* Estimated Timeline Card */}
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400 font-medium text-sm">ESTIMATED TIMELINE</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{projectionData.length} days</div>
                      <div className="text-xs text-gray-400">To reach your target goal</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* How This Works Section */}
                  <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <Calculator className="w-4 h-4" />
                      How This Works
                    </h4>
                    <div className="text-sm text-gray-300 space-y-1">
                      <p>• <span className="text-blue-400">Risk per trade:</span> ${formatCurrency(settings.riskPerTrade)} × <span className="text-purple-400">{settings.riskRewardRatio}:1 ratio</span> = ${formatCurrency(settings.riskPerTrade * settings.riskRewardRatio)} profit per winning trade</p>
                      <p>• <span className="text-yellow-400">Target:</span> ${formatCurrency(settings.profitTarget)} ÷ ${formatCurrency(settings.riskPerTrade * settings.riskRewardRatio)} = {Math.ceil(settings.profitTarget / (settings.riskPerTrade * settings.riskRewardRatio))} trading days needed</p>
                    </div>
                  </div>

                  {/* Timeline Table - MUST HAVE ALL 5 COLUMNS */}
                  <div className="bg-gray-800/30 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-800/50">
                          <tr>
                            <th className="text-left p-4 text-gray-300 font-semibold">Trading Day</th>
                            <th className="text-center p-4 text-gray-300 font-semibold">
                              <div className="flex flex-col items-center">
                                <span>Risk Amount</span>
                                <span className="text-xs font-normal text-gray-400">(per trade)</span>
                              </div>
                            </th>
                            <th className="text-center p-4 text-gray-300 font-semibold">
                              <div className="flex flex-col items-center">
                                <span>Expected Profit</span>
                                <span className="text-xs font-normal text-gray-400">(if win)</span>
                              </div>
                            </th>
                            <th className="text-center p-4 text-gray-300 font-semibold">
                              <div className="flex flex-col items-center">
                                <span>Progress to Goal</span>
                                <span className="text-xs font-normal text-gray-400">(cumulative)</span>
                              </div>
                            </th>
                            <th className="text-center p-4 text-gray-300 font-semibold">
                              <div className="flex flex-col items-center">
                                <span>Actual Results</span>
                                <span className="text-xs font-normal text-gray-400">(from CSV data)</span>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {projectionData.map((day, index) => {
                            const progressPercent = (day.targetExpectation / settings.profitTarget) * 100;
                            const isTargetReached = day.targetExpectation >= settings.profitTarget;
                            const dailyTarget = settings.riskPerTrade * settings.riskRewardRatio;
                            
                            // CSV Integration Logic: Group trades by date and calculate daily P&L
                            const dayDate = formatDate(day.date);
                            const dayTrades = settings.mode === 'account' && selectedAccountData ? 
                              selectedAccountData.trades.filter(trade => 
                                new Date(trade.date).toDateString() === new Date(day.date).toDateString()
                              ) : [];
                            
                            const dailyPnl = dayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
                            const hasTradeData = dayTrades.length > 0;
                            
                            // Determine result status and color coding
                            let resultDisplay = null;
                            if (hasTradeData) {
                              if (dailyPnl > 0) {
                                const exceeded = dailyPnl >= dailyTarget;
                                resultDisplay = (
                                  <div className="space-y-1">
                                    <div className="text-green-400 font-bold text-lg">+${formatCurrency(dailyPnl)}</div>
                                    <div className="flex items-center justify-center gap-1">
                                      <CheckCircle className="w-3 h-3 text-green-400" />
                                      <span className="text-xs text-green-400 font-medium">
                                        {exceeded ? "✓ Target exceeded" : "✓ Profitable"}
                                      </span>
                                    </div>
                                  </div>
                                );
                              } else if (dailyPnl < 0) {
                                resultDisplay = (
                                  <div className="space-y-1">
                                    <div className="text-red-400 font-bold text-lg">-${formatCurrency(Math.abs(dailyPnl))}</div>
                                    <div className="flex items-center justify-center gap-1">
                                      <span className="text-red-400 text-xs">✗</span>
                                      <span className="text-xs text-red-400 font-medium">✗ Below target</span>
                                    </div>
                                  </div>
                                );
                              } else {
                                resultDisplay = (
                                  <div className="space-y-1">
                                    <div className="text-gray-400 font-bold text-lg">$0</div>
                                    <div className="flex items-center justify-center gap-1">
                                      <span className="text-gray-400 text-xs">⚬</span>
                                      <span className="text-xs text-gray-400 font-medium">⚬ Breakeven</span>
                                    </div>
                                  </div>
                                );
                              }
                            } else {
                              resultDisplay = (
                                <div className="space-y-1">
                                  <div className="text-gray-500 font-medium">—</div>
                                  <div className="text-xs text-gray-600">Will auto-populate from CSV</div>
                                </div>
                              );
                            }
                            
                            return (
                              <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                                {/* Column 1: Trading Day */}
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 text-sm font-semibold">{day.dayNumber}</div>
                                    <div>
                                      <div className="text-white font-medium">{dayDate}</div>
                                      <div className="text-xs text-gray-400">Day {day.dayNumber}</div>
                                    </div>
                                  </div>
                                </td>
                                
                                {/* Column 2: Risk Amount */}
                                <td className="p-4 text-center">
                                  <div className="text-blue-400 font-bold text-lg">${formatCurrency(day.risk)}</div>
                                </td>
                                
                                {/* Column 3: Expected Profit */}
                                <td className="p-4 text-center">
                                  <div className="text-green-400 font-bold text-lg">${formatCurrency(day.reward)}</div>
                                </td>
                                
                                {/* Column 4: Progress to Goal (VERY IMPORTANT - CUMULATIVE PROGRESS) */}
                                <td className="p-4 text-center">
                                  <div className="space-y-2">
                                    <div className={`font-bold text-lg ${isTargetReached ? 'text-green-400' : 'text-yellow-400'}`}>
                                      ${formatCurrency(day.targetExpectation)}
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full transition-all ${isTargetReached ? 'bg-green-400' : 'bg-yellow-400'}`} 
                                        style={{width: `${Math.min(progressPercent, 100)}%`}}
                                      ></div>
                                    </div>
                                    <div className="text-xs text-gray-400">{progressPercent.toFixed(1)}% of goal</div>
                                    {isTargetReached && (
                                      <div className="flex items-center justify-center gap-1">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        <span className="text-xs text-green-400 font-medium">TARGET REACHED!</span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                
                                {/* Column 5: Actual Results (AUTO-POPULATED FROM CSV DATA) */}
                                <td className="p-4 text-center">
                                  {resultDisplay}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Account Creation Dialog */}
        <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">Create New Trading Account</DialogTitle>
              <DialogDescription className="text-gray-400">
                Set up a new trading account with proper risk management and financial tracking.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[80vh] px-6">
              <Form {...accountForm}>
                <form onSubmit={accountForm.handleSubmit((data) => createAccountMutation.mutate(data))} className="space-y-6">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="financial">Financial</TabsTrigger>
                      <TabsTrigger value="rules">Rules & Risk</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={accountForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Account Name</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="My Trading Account" />
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
                              <FormLabel className="text-white">Prop Firm</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="FTMO, TopstepTrader, etc." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={accountForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Account Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-gray-800 border-gray-600">
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
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-gray-800 border-gray-600">
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="passed">Passed</SelectItem>
                                  <SelectItem value="failed">Failed</SelectItem>
                                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={accountForm.control}
                          name="startingBalance"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Starting Balance</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="100000"
                                  value={field.value === 0 ? "" : field.value}
                                  onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={accountForm.control}
                          name="profitTarget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Profit Target</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="10000"
                                  value={field.value === 0 ? "" : field.value}
                                  onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={accountForm.control}
                          name="maxDrawdown"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Max Drawdown</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="5000"
                                  value={field.value === 0 ? "" : field.value}
                                  onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={accountForm.control}
                          name="minimumTradingDays"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Minimum Trading Days</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="5"
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={accountForm.control}
                          name="timeLimit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Time Limit (days)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="30"
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={accountForm.control}
                          name="consistencyRulePercent"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Consistency Rule (%)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="50"
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <FormField
                          control={accountForm.control}
                          name="hasDailyLossLimit"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="border-gray-600 data-[state=checked]:bg-blue-600"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-white">Has Daily Loss Limit</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="financial" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={accountForm.control}
                          name="accountCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Account Cost</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="599"
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={accountForm.control}
                          name="activationCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Activation Cost</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="200"
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={accountForm.control}
                          name="purchaseMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Purchase Method</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                    <SelectValue placeholder="Select payment method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-gray-800 border-gray-600">
                                  <SelectItem value="credit_card">Credit Card</SelectItem>
                                  <SelectItem value="paypal">PayPal</SelectItem>
                                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={accountForm.control}
                          name="resetCount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Reset Count</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="0"
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={accountForm.control}
                          name="totalResetsCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Total Resets Cost</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="0"
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={accountForm.control}
                          name="profitSplit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Profit Split (%)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="80"
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <FormField
                          control={accountForm.control}
                          name="activationPaid"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="border-gray-600 data-[state=checked]:bg-blue-600"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-white">Activation Fee Paid</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={accountForm.control}
                          name="includesActivationFee"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="border-gray-600 data-[state=checked]:bg-blue-600"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-white">Includes Activation Fee</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="rules" className="space-y-4">
                      {/* Risk Per Trade with Real-time Feedback */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={accountForm.control}
                          name="riskPerTrade"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Risk Per Trade ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="500"
                                  value={field.value === null ? "" : field.value}
                                  onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                              {field.value && accountFormValues.maxDrawdown && (
                                <div className="text-xs mt-1">
                                  <span className={`${
                                    (field.value / accountFormValues.maxDrawdown) * 100 > 10 
                                      ? 'text-red-400' 
                                      : (field.value / accountFormValues.maxDrawdown) * 100 > 5 
                                      ? 'text-yellow-400' 
                                      : 'text-green-400'
                                  }`}>
                                    {((field.value / accountFormValues.maxDrawdown) * 100).toFixed(2)}% of max drawdown
                                  </span>
                                  {(field.value / accountFormValues.maxDrawdown) * 100 > 10 && (
                                    <span className="text-red-400 ml-2">⚠️ High risk per trade</span>
                                  )}
                                </div>
                              )}
                            </FormItem>
                          )}
                        />
                        
                        {/* Risk Per Trade Divider */}
                        <FormField
                          control={accountForm.control}
                          name="riskPerTradeDivider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Risk Per Trade Divider</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  min="1"
                                  max="10"
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="1"
                                  value={field.value === null ? "" : field.value}
                                  onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                              <div className="text-xs mt-1 text-gray-400">
                                Split your total risk across {field.value || 1} trade{(field.value || 1) > 1 ? 's' : ''}
                              </div>
                              {field.value && accountFormValues.riskPerTrade && (
                                <div className="text-xs mt-1">
                                  <span className="text-green-400">
                                    Risk Per Individual Trade: ${(accountFormValues.riskPerTrade / field.value).toFixed(2)}
                                  </span>
                                </div>
                              )}
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={accountForm.control}
                          name="dailyLossLimit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Daily Loss Limit ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="2000"
                                  value={field.value === null ? "" : field.value}
                                  onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                              {field.value && accountFormValues.maxDrawdown && (
                                <div className="text-xs mt-1">
                                  <span className={`${
                                    (field.value / accountFormValues.maxDrawdown) * 100 > 50 
                                      ? 'text-red-400' 
                                      : (field.value / accountFormValues.maxDrawdown) * 100 > 30 
                                      ? 'text-yellow-400' 
                                      : 'text-green-400'
                                  }`}>
                                    {((field.value / accountFormValues.maxDrawdown) * 100).toFixed(2)}% of max drawdown
                                  </span>
                                  {(field.value / accountFormValues.maxDrawdown) * 100 > 50 && (
                                    <span className="text-red-400 ml-2">⚠️ Very high daily risk</span>
                                  )}
                                </div>
                              )}
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={accountForm.control}
                          name="maxTradesPerDay"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Max Trades Per Day</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="5"
                                  value={field.value === null ? "" : field.value}
                                  onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={accountForm.control}
                          name="maxRiskPerDay"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Max Risk Per Day ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="3000"
                                  value={field.value === null ? "" : field.value}
                                  onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                              {field.value && accountFormValues.riskPerTrade && (
                                <div className="text-xs mt-1">
                                  <span className="text-gray-400">
                                    ≈ {Math.floor(field.value / accountFormValues.riskPerTrade)} trades max per day
                                  </span>
                                </div>
                              )}
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={accountForm.control}
                          name="riskRewardRatio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Risk:Reward Ratio (1:X)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  step="0.1"
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="2.0"
                                  value={field.value === null ? "" : field.value}
                                  onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                              {field.value && accountFormValues.riskPerTrade && (
                                <div className="text-xs mt-1">
                                  <span className="text-green-400">
                                    Target profit: ${(accountFormValues.riskPerTrade * field.value).toFixed(0)} per trade
                                  </span>
                                </div>
                              )}
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={accountForm.control}
                          name="primaryAsset"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Primary Asset</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="e.g. ES, NQ, EURUSD, BTCUSD"
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={accountForm.control}
                          name="secondaryAsset"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Secondary Asset</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="e.g. CL, GC, GBPUSD"
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={accountForm.control}
                          name="tertiaryAsset"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Tertiary Asset</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="e.g. RTY, YM, USDJPY"
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={accountForm.control}
                          name="stopLossPoints"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Default Stop Loss (Points/Pips)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="10"
                                  value={field.value === null || field.value === undefined ? "" : field.value}
                                  onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={accountForm.control}
                          name="takeProfitPoints"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Default Take Profit (Points/Pips)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="20"
                                  value={field.value === null || field.value === undefined ? "" : field.value}
                                  onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={accountForm.control}
                          name="daysRequiredForPayout"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Days Required for Payout</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="5"
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={accountForm.control}
                          name="winningDayMinimum"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Daily Profit Target ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="200"
                                  value={field.value === null ? "" : field.value}
                                  onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={accountForm.control}
                          name="minimumPayoutAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Minimum Payout Amount ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="100"
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={accountForm.control}
                          name="maxNetBalanceForPayout"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Max Net Balance for Payout ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="5000"
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Personal Trading Time */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-yellow-400 border-b border-yellow-400/20 pb-2">
                          Personal Trading Time
                        </h3>
                        
                        {/* Time Slot 1 */}
                        <div className="space-y-2">
                          <h4 className="text-md font-medium text-blue-400">Time Slot 1 (Primary)</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <FormField
                              control={accountForm.control}
                              name="personalTradingTimeStart1"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Personal Trading Time Start - Time1</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                        <SelectValue placeholder="--:-- --" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-800 border-gray-600 max-h-60">
                                      {Array.from({ length: 48 }, (_, i) => {
                                        const hour = Math.floor(i / 2);
                                        const minute = i % 2 === 0 ? "00" : "30";
                                        const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                                        return (
                                          <SelectItem key={time} value={time}>
                                            {time}
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={accountForm.control}
                              name="personalTradingTimeEnd1"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Personal Trading Time End - Time1</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                        <SelectValue placeholder="--:-- --" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-800 border-gray-600 max-h-60">
                                      {Array.from({ length: 48 }, (_, i) => {
                                        const hour = Math.floor(i / 2);
                                        const minute = i % 2 === 0 ? "00" : "30";
                                        const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                                        return (
                                          <SelectItem key={time} value={time}>
                                            {time}
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={accountForm.control}
                              name="personalTradingTimeZone1"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Timezone</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                        <SelectValue placeholder="Select timezone" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-800 border-gray-600">
                                      <SelectItem value="EST">EST - Eastern Standard Time</SelectItem>
                                      <SelectItem value="CST">CST - Central Standard Time</SelectItem>
                                      <SelectItem value="MST">MST - Mountain Standard Time</SelectItem>
                                      <SelectItem value="PST">PST - Pacific Standard Time</SelectItem>
                                      <SelectItem value="GMT">GMT - Greenwich Mean Time</SelectItem>
                                      <SelectItem value="CET">CET - Central European Time</SelectItem>
                                      <SelectItem value="JST">JST - Japan Standard Time</SelectItem>
                                      <SelectItem value="AEST">AEST - Australian Eastern Standard Time</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Time Slot 2 */}
                        <div className="space-y-2">
                          <h4 className="text-md font-medium text-green-400">Time Slot 2 (Secondary)</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <FormField
                              control={accountForm.control}
                              name="personalTradingTimeStart2"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Personal Trading Time Start - Time2</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                        <SelectValue placeholder="--:-- --" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-800 border-gray-600 max-h-60">
                                      {Array.from({ length: 48 }, (_, i) => {
                                        const hour = Math.floor(i / 2);
                                        const minute = i % 2 === 0 ? "00" : "30";
                                        const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                                        return (
                                          <SelectItem key={time} value={time}>
                                            {time}
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={accountForm.control}
                              name="personalTradingTimeEnd2"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Personal Trading Time End - Time2</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                        <SelectValue placeholder="--:-- --" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-800 border-gray-600 max-h-60">
                                      {Array.from({ length: 48 }, (_, i) => {
                                        const hour = Math.floor(i / 2);
                                        const minute = i % 2 === 0 ? "00" : "30";
                                        const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                                        return (
                                          <SelectItem key={time} value={time}>
                                            {time}
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={accountForm.control}
                              name="personalTradingTimeZone2"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Timezone</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                        <SelectValue placeholder="Select timezone" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-800 border-gray-600">
                                      <SelectItem value="EST">EST - Eastern Standard Time</SelectItem>
                                      <SelectItem value="CST">CST - Central Standard Time</SelectItem>
                                      <SelectItem value="MST">MST - Mountain Standard Time</SelectItem>
                                      <SelectItem value="PST">PST - Pacific Standard Time</SelectItem>
                                      <SelectItem value="GMT">GMT - Greenwich Mean Time</SelectItem>
                                      <SelectItem value="CET">CET - Central European Time</SelectItem>
                                      <SelectItem value="JST">JST - Japan Standard Time</SelectItem>
                                      <SelectItem value="AEST">AEST - Australian Eastern Standard Time</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Time Slot 3 */}
                        <div className="space-y-2">
                          <h4 className="text-md font-medium text-purple-400">Time Slot 3 (Tertiary)</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <FormField
                              control={accountForm.control}
                              name="personalTradingTimeStart3"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Personal Trading Time Start - Time3</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                        <SelectValue placeholder="--:-- --" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-800 border-gray-600 max-h-60">
                                      {Array.from({ length: 48 }, (_, i) => {
                                        const hour = Math.floor(i / 2);
                                        const minute = i % 2 === 0 ? "00" : "30";
                                        const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                                        return (
                                          <SelectItem key={time} value={time}>
                                            {time}
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={accountForm.control}
                              name="personalTradingTimeEnd3"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Personal Trading Time End - Time3</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                        <SelectValue placeholder="--:-- --" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-800 border-gray-600 max-h-60">
                                      {Array.from({ length: 48 }, (_, i) => {
                                        const hour = Math.floor(i / 2);
                                        const minute = i % 2 === 0 ? "00" : "30";
                                        const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                                        return (
                                          <SelectItem key={time} value={time}>
                                            {time}
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={accountForm.control}
                              name="personalTradingTimeZone3"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Timezone</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                        <SelectValue placeholder="Select timezone" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-800 border-gray-600">
                                      <SelectItem value="EST">EST - Eastern Standard Time</SelectItem>
                                      <SelectItem value="CST">CST - Central Standard Time</SelectItem>
                                      <SelectItem value="MST">MST - Mountain Standard Time</SelectItem>
                                      <SelectItem value="PST">PST - Pacific Standard Time</SelectItem>
                                      <SelectItem value="GMT">GMT - Greenwich Mean Time</SelectItem>
                                      <SelectItem value="CET">CET - Central European Time</SelectItem>
                                      <SelectItem value="JST">JST - Japan Standard Time</SelectItem>
                                      <SelectItem value="AEST">AEST - Australian Eastern Standard Time</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={accountForm.control}
                          name="dailyWorkingHours"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Daily Working Hours</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  step="0.5"
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="8.0"
                                  value={field.value === null ? "" : field.value}
                                  onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={accountForm.control}
                          name="hourlyWages"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Hourly Wages ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  step="0.01"
                                  className="bg-gray-800 border-gray-600 text-white" 
                                  placeholder="25.00"
                                  value={field.value === null ? "" : field.value}
                                  onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        </div>

                        {/* Automatic Time Calculation */}
                        {accountFormValues.tradingSessionStart && accountFormValues.tradingSessionEnd && (
                          <div className="bg-gray-800/50 rounded-lg p-4 border border-yellow-400/20">
                            <div className="flex items-center justify-between">
                              <span className="text-white font-medium">Daily Trading Duration:</span>
                              <span className="text-yellow-400 font-bold text-lg">
                                {(() => {
                                  const start = accountFormValues.tradingSessionStart;
                                  const end = accountFormValues.tradingSessionEnd;
                                  if (!start || !end) return "-- hours -- minutes";
                                  
                                  try {
                                    const [startHour, startMin] = start.split(':').map(Number);
                                    const [endHour, endMin] = end.split(':').map(Number);
                                    
                                    const startMinutes = startHour * 60 + startMin;
                                    const endMinutes = endHour * 60 + endMin;
                                    
                                    let diffMinutes = endMinutes - startMinutes;
                                    if (diffMinutes < 0) diffMinutes += 24 * 60; // Handle overnight sessions
                                    
                                    const hours = Math.floor(diffMinutes / 60);
                                    const minutes = diffMinutes % 60;
                                    
                                    return `${hours} hours ${minutes} minutes`;
                                  } catch {
                                    return "-- hours -- minutes";
                                  }
                                })()}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-3">
                            <FormField
                              control={accountForm.control}
                              name="useIntradayMargins"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      className="border-gray-600 data-[state=checked]:bg-blue-600"
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-white">Live Trading Account Available</FormLabel>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="flex items-center space-x-3">
                            <FormField
                              control={accountForm.control}
                              name="enhancedPayoutsAvailable"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      className="border-gray-600 data-[state=checked]:bg-blue-600"
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-white">Challenge Payouts Available</FormLabel>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-3">
                            <FormField
                              control={accountForm.control}
                              name="copyTradingAllowed"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      className="border-gray-600 data-[state=checked]:bg-blue-600"
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-white">Copy Trading Allowed</FormLabel>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="flex items-center space-x-3">
                            <FormField
                              control={accountForm.control}
                              name="newsTradingAllowed"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      className="border-gray-600 data-[state=checked]:bg-blue-600"
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-white">News Trading Allowed</FormLabel>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Risk Assessment Summary */}
                      {(accountFormValues.startingBalance && accountFormValues.riskPerTrade && accountFormValues.dailyLossLimit) && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/20">
                          <h4 className="text-lg font-semibold text-yellow-400 mb-3">Risk Assessment Summary</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-gray-300">Risk per trade</div>
                              <div className={`text-lg font-medium ${
                                (accountFormValues.riskPerTrade / accountFormValues.startingBalance) * 100 > 2 ? 'text-red-400' : 
                                (accountFormValues.riskPerTrade / accountFormValues.startingBalance) * 100 > 1 ? 'text-yellow-400' : 'text-green-400'
                              }`}>
                                {((accountFormValues.riskPerTrade / accountFormValues.startingBalance) * 100).toFixed(2)}% of account
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-300">Daily risk limit</div>
                              <div className={`text-lg font-medium ${
                                (accountFormValues.dailyLossLimit / accountFormValues.startingBalance) * 100 > 5 ? 'text-red-400' : 
                                (accountFormValues.dailyLossLimit / accountFormValues.startingBalance) * 100 > 3 ? 'text-yellow-400' : 'text-green-400'
                              }`}>
                                {((accountFormValues.dailyLossLimit / accountFormValues.startingBalance) * 100).toFixed(2)}% of account
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-300">Max trades per day</div>
                              <div className="text-lg font-medium text-blue-400">
                                {Math.floor(accountFormValues.dailyLossLimit / accountFormValues.riskPerTrade)} trades
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-300">Win rate needed (breakeven)</div>
                              <div className="text-lg font-medium text-purple-400">
                                {accountFormValues.riskRewardRatio ? (100 / (accountFormValues.riskRewardRatio + 1)).toFixed(1) : 50}%
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAccountDialogOpen(false)}
                      className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createAccountMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {createAccountMutation.isPending ? "Creating..." : "Create Account"}
                    </Button>
                  </div>
                </form>
              </Form>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
