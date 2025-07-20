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
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAccountSchema, type InsertAccount } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle } from "lucide-react";
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
  const queryClient = useQueryClient();

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
        description: "Your trading account has been created successfully.",
      });
    },
  });

  const onAccountSubmit = (data: InsertAccount) => {
    createAccountMutation.mutate(data);
  };

  const accountForm = useForm<InsertAccount>({
    resolver: zodResolver(insertAccountSchema),
    defaultValues: {
      name: "",
      firm: "",
      type: "challenge",
      status: "active",
      startingBalance: null,
      profitTarget: null,
      maxDrawdown: null,
      hasDailyLossLimit: false,
      dailyLossLimit: null,
      dailyLossLimitType: "soft",
      
      // Account Rules
      minimumTradingDays: null,
      timeLimit: null,
      daysRequiredToPass: null,
      minimumProfitTarget: null,
      consistencyRulePercent: null,
      maximumDailyDrawdown: null,
      maximumOverallDrawdown: null,
      
      // Discipline Scoring
      disciplineRiskPeriod: "daily",
      disciplineRiskBudget: null,
      disciplineOverrideRisk: false,
      disciplineRiskOverride: null,
      
      // Financial tracking fields
      accountCost: null,
      purchaseMethod: null,
      resetCount: 0,
      totalResetsCost: null,
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
      riskRewardRatio: null,
      primaryAsset: "ES" as AssetSymbol,
      useIntradayMargins: true,
      marginSafetyBuffer: null,
      stopLossPoints: null,
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
      return await apiRequest("POST", "/api/projections/save", projectionData);
    },
    onSuccess: () => {
      toast({
        title: "Projection Saved",
        description: "Your projection has been saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save projection",
        variant: "destructive",
      });
    },
  });

  const [settings, setSettings] = useState<ProjectionSettings>(() => {
    const saved = localStorage.getItem('projectionSettings');
    return saved ? JSON.parse(saved) : {
      mode: 'simulation',
      selectedAccountId: null,
      copiedAccounts: 0,
      startingCapital: 0,
      riskPerTrade: 0,
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
      {/* Enhanced Header with Performance Metrics */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Target className="w-8 h-8 text-yellow-400" />
              Account Management & Projections
            </h1>
            <p className="text-gray-400 mt-2">Manage your trading accounts and project future performance with advanced analytics</p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold hover:from-yellow-500 hover:to-yellow-700 shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  New Account
                </Button>
              </DialogTrigger>
              {/* Complete Account Creation Form */}
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Create Trading Account</DialogTitle>
                </DialogHeader>
                <Form {...accountForm}>
                  <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-6 p-4">
                    <Tabs defaultValue="account-info" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="account-info">Account Info & Rules</TabsTrigger>
                        <TabsTrigger value="financial">Financial Tracking</TabsTrigger>
                        <TabsTrigger value="payout">Payout Rules</TabsTrigger>
                        <TabsTrigger value="risk">Risk Settings</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="account-info" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={accountForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Account Name</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="My Trading Account" className="bg-gray-700 border-gray-600 text-white" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={accountForm.control}
                            name="propFirm"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Prop Firm</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="FTMO" className="bg-gray-700 border-gray-600 text-white" />
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
                                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                      <SelectValue placeholder="Select type" />
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
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
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
                                <FormLabel className="text-white">Account Size</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" placeholder="100000" className="bg-gray-700 border-gray-600 text-white" />
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
                                  <Input {...field} type="number" placeholder="10000" className="bg-gray-700 border-gray-600 text-white" />
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
                                  <Input {...field} type="number" placeholder="10000" className="bg-gray-700 border-gray-600 text-white" />
                                </FormControl>
                                <FormMessage />
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
                                  <Input {...field} type="number" placeholder="500" className="bg-gray-700 border-gray-600 text-white" />
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
                                  <Input {...field} type="number" placeholder="0" className="bg-gray-700 border-gray-600 text-white" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="payout" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={accountForm.control}
                            name="profitSplit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Profit Split (%)</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" placeholder="80" className="bg-gray-700 border-gray-600 text-white" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={accountForm.control}
                            name="minimumPayoutAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Minimum Payout Amount</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" placeholder="1000" className="bg-gray-700 border-gray-600 text-white" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="risk" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={accountForm.control}
                            name="dailyLossLimit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Daily Loss Limit</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" placeholder="5000" className="bg-gray-700 border-gray-600 text-white" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={accountForm.control}
                            name="riskPerTrade"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Risk Per Trade</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" placeholder="1000" className="bg-gray-700 border-gray-600 text-white" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsAccountDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-yellow-400 text-black hover:bg-yellow-500">
                        Create Account
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Enhanced Account Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-black border border-blue-400/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Total Accounts</p>
                  <p className="text-2xl font-bold text-white">{accounts.length}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-900/40 via-green-800/30 to-black border border-green-400/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-sm">Active Accounts</p>
                  <p className="text-2xl font-bold text-white">{accounts.filter(a => a.status === 'active').length}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-900/40 via-yellow-800/30 to-black border border-yellow-400/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-200 text-sm">Total Investment</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(accounts.reduce((sum, acc) => sum + (acc.accountCost || 0) + (acc.activationCost || 0), 0))}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-black border border-purple-400/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">Passed Accounts</p>
                  <p className="text-2xl font-bold text-white">{accounts.filter(a => a.status === 'passed').length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => {
              const accountTrades = trades.filter(trade => trade.accountId === account.id);
              const totalPnl = accountTrades.reduce((sum, trade) => sum + trade.pnl, 0);
              const netBalance = account.startingBalance + totalPnl;
              const riskLevel = totalPnl < -account.maxDrawdown * 0.8 ? 'high risk' : 
                               totalPnl < -account.maxDrawdown * 0.5 ? 'moderate risk' : 'low risk';
              
              return (
                <Card key={account.id} className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-600 hover:border-yellow-400/50 transition-all duration-300">
                  <CardContent className="p-6 space-y-4">
                    {/* Header with firm name and badges */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white font-semibold text-lg">{account.name}</h3>
                        <p className="text-gray-400 text-sm">{account.propFirm}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={`${getAccountStatusColor(account.status)} text-xs`}>
                          {account.status}
                        </Badge>
                        <Badge className={`${account.type === 'challenge' ? 'bg-orange-500/20 text-orange-400' : 
                                          account.type === 'funded' ? 'bg-green-500/20 text-green-400' : 
                                          'bg-purple-500/20 text-purple-400'} text-xs`}>
                          {account.type}
                        </Badge>
                        <Badge className={`${getRiskLevelColor(riskLevel as any)} text-xs`}>
                          {riskLevel}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Account metrics */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Size:</p>
                        <p className="text-white font-medium">{formatCurrency(account.startingBalance)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Target:</p>
                        <p className="text-white font-medium">{formatCurrency(account.profitTarget)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Risk/Trade:</p>
                        <p className="text-white font-medium">{formatCurrency(account.riskPerTrade || 1000)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">RR Ratio:</p>
                        <p className="text-white font-medium">{account.riskRewardRatio || 2}:1</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Daily Limit:</p>
                        <p className="text-white font-medium">{formatCurrency(account.dailyLossLimit)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Asset:</p>
                        <p className="text-white font-medium capitalize">{account.primaryAsset || 'Forex'}</p>
                      </div>
                    </div>
                    
                    {/* Payout eligibility or daily target */}
                    {account.type === 'funded' || account.type === 'live' ? (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span className="text-green-400 text-sm font-medium">Payout Eligible</span>
                        </div>
                        <p className="text-gray-400 text-xs mt-1">
                          Next: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Daily Target</span>
                          <span className="text-yellow-400 font-medium">
                            {formatCurrency((account.riskPerTrade || 1000) * (account.riskRewardRatio || 2))}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min((totalPnl / account.profitTarget) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/30"
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Trading Plan
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-gray-600 text-gray-400 hover:bg-gray-700"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {accounts.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Shield className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                <h3 className="text-gray-400 text-lg font-medium">No Trading Accounts</h3>
                <p className="text-gray-500 mt-2">Create your first trading account to get started</p>
              </div>
            )}
          </div>
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
                          <SelectTrigger className="bg-gray-700 border-yellow-400/20 text-white">
                            <SelectValue placeholder="Choose an account..." />
                          </SelectTrigger>
                          <SelectContent>
                            {accounts.map(account => (
                              <SelectItem key={account.id} value={account.id.toString()}>
                                {account.name} - {formatCurrency(account.currentBalance)}
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
                      <Label className="text-white flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-yellow-400" />
                        Starting Capital (Display Only)
                      </Label>
                      <Input
                        type="number"
                        value={settings.startingCapital || ""}
                        onChange={(e) => updateSetting('startingCapital', e.target.value === "" ? null : Number(e.target.value))}
                        className="bg-gray-700 border-yellow-400/20 text-white placeholder-gray-400"
                        placeholder="100000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white flex items-center gap-2">
                        <Shield className="h-4 w-4 text-red-400" />
                        Risk Per Trade
                      </Label>
                      <Input
                        type="number"
                        value={settings.riskPerTrade || ""}
                        onChange={(e) => updateSetting('riskPerTrade', e.target.value === "" ? null : Number(e.target.value))}
                        className="bg-gray-700 border-yellow-400/20 text-white placeholder-gray-400"
                        placeholder="1000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-400" />
                        Risk:Reward Ratio
                      </Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={settings.riskRewardRatio || ""}
                        onChange={(e) => updateSetting('riskRewardRatio', e.target.value === "" ? null : Number(e.target.value))}
                        className="bg-gray-700 border-yellow-400/20 text-white placeholder-gray-400"
                        placeholder="2.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-400" />
                        Profit Target
                      </Label>
                      <Input
                        type="number"
                        value={settings.profitTarget || ""}
                        onChange={(e) => updateSetting('profitTarget', e.target.value === "" ? null : Number(e.target.value))}
                        className="bg-gray-700 border-yellow-400/20 text-white placeholder-gray-400"
                        placeholder="10000"
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
              {/* Enhanced Overview Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 border border-blue-400/30 shadow-lg">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Calendar className="mx-auto h-6 w-6 text-blue-100 mb-2" />
                      <div className="text-2xl font-bold text-white">
                        {daysToTarget}
                      </div>
                      <div className="text-sm text-blue-100">Days to Target</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-500 via-yellow-400 to-yellow-600 border border-yellow-300/30 shadow-lg">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <DollarSign className="mx-auto h-6 w-6 text-yellow-900 mb-2" />
                      <div className="text-2xl font-bold text-yellow-900">
                        {formatCurrency(totalDailyReward)}
                      </div>
                      <div className="text-sm text-yellow-800">Daily Reward</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-600 via-green-500 to-green-700 border border-green-400/30 shadow-lg">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <TrendingUp className="mx-auto h-6 w-6 text-green-100 mb-2" />
                      <div className="text-2xl font-bold text-white">
                        {progressPercentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-green-100">Progress</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 border border-purple-400/30 shadow-lg">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <BarChart3 className="mx-auto h-6 w-6 text-purple-100 mb-2" />
                      <div className="text-2xl font-bold text-white">
                        {settings.copiedAccounts || 1}
                      </div>
                      <div className="text-sm text-purple-100">Copied Accounts</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Account Summary (if account mode) */}
              {settings.mode === 'account' && selectedAccountData && (
                <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-yellow-400/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-yellow-400" />
                      Selected Account Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                        <DollarSign className="mx-auto h-6 w-6 text-green-400 mb-2" />
                        <div className="text-lg font-bold text-green-400">
                          {formatCurrency(selectedAccountData.account.startingBalance + selectedAccountData.totalPnl)}
                        </div>
                        <div className="text-sm text-gray-400">Current Balance</div>
                      </div>
                      <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <TrendingUp className="mx-auto h-6 w-6 text-blue-400 mb-2" />
                        <div className="text-lg font-bold text-blue-400">
                          {formatCurrency(selectedAccountData.totalPnl)}
                        </div>
                        <div className="text-sm text-gray-400">Total P&L</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <Target className="mx-auto h-6 w-6 text-yellow-400 mb-2" />
                        <div className="text-lg font-bold text-yellow-400">
                          {settings.copiedAccounts}
                        </div>
                        <div className="text-sm text-gray-400">Copied Accounts</div>
                      </div>
                      <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <BarChart3 className="mx-auto h-6 w-6 text-purple-400 mb-2" />
                        <div className="text-lg font-bold text-purple-400">
                          {selectedAccountData.trades.length}
                        </div>
                        <div className="text-sm text-gray-400">Total Trades</div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Progress to Target</span>
                        <span className="text-white font-medium">{progressPercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={Math.min(progressPercentage, 100)} className="h-3" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Projection Table */}
              <Card className="bg-dark-card border-dark-border">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Daily Projection Timeline
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
                        {projectionData.map((day, index) => (
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
        </div>

        {/* Account Creation Dialog - Temporarily simplified */}
        <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">Create New Trading Account</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="text-gray-400">Account creation form will be restored...</p>
              <Button onClick={() => setIsAccountDialogOpen(false)} className="mt-4">Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
