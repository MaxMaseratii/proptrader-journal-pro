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
  const { toast } = useToast();
  const [accountsMinimized, setAccountsMinimized] = useState(false);
  const [projectionsMinimized, setProjectionsMinimized] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: trades = [] } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: InsertAccount) => {
      return apiRequest("POST", "/api/accounts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      setIsAccountDialogOpen(false);
      accountForm.reset();
    },
  });

  const accountForm = useForm<InsertAccount>({
    resolver: zodResolver(insertAccountSchema),
    defaultValues: {
      name: "",
      firm: "",
      type: "challenge",
      status: "active",
      startingBalance: 50000,
      currentBalance: 50000,
      profitTarget: 5000,
      maxDrawdown: 2000,
      hasDailyLossLimit: false,
      dailyLossLimit: 0,
      dailyLossLimitType: "soft",
      tradingCapital: 50000,
      riskCalculationPeriod: "weekly",
      useRiskPercentage: false,
      riskPercentage: 1.0,
      customRiskAmount: 500,
      riskRewardRatio: 2.0,
      primaryAsset: "ES" as AssetSymbol,
      useIntradayMargins: true,
      marginSafetyBuffer: 50.0,
      stopLossPoints: 10,
      payoutFrequency: "monthly",
      minimumPayoutAmount: 100,
      profitSplit: 80,
      bufferPercentage: 5.0,
      daysRequiredForPayout: 5,
      maximumPayoutPercentage: 90,
      primaryTradingAsset: "ES",
      secondaryTradingAsset: "none",
      tertiaryTradingAsset: "none",
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

  const [settings, setSettings] = useState<ProjectionSettings>({
    mode: 'simulation',
    selectedAccountId: null,
    copiedAccounts: 1,
    startingCapital: 150000,
    riskPerTrade: 250,
    riskRewardRatio: 3,
    profitTarget: 10000,
    maxDrawdown: 4500,
    riskCuttingPercent: 0,
    compoundingPercent: 0,
    maxLossPerDay: 500,
    extraDaysIfLoss: 5,
    useMaxDrawdownAsCapital: false,
  });

  const [projectionData, setProjectionData] = useState<ProjectionDay[]>([]);

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

  return (
    <div className="page-container space-y-6">
      {/* Unified PropFirms Section */}
      <div className="unified-propfirms-section border-b border-gray-800 bg-dark-bg pb-6">
        <div className="space-y-4">
          {/* Main Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white primary-header text-gradient-rainbow">
              PropFirms Accounts & Responsible Risk/Day-to-Pass Planning
            </h1>
            <p className="text-gray-400 mt-2">Manage your prop trading accounts and strategic planning</p>
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
            
            {/* Accounts Management */}
            {!accountsMinimized && <AccountManagement accounts={accounts} />}
          </div>

          {/* Account Creation Dialog */}
          <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] bg-dark-bg border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white text-xl">Create New Trading Account</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[80vh] pr-4">
                <Form {...accountForm}>
                  <form onSubmit={accountForm.handleSubmit((data) => createAccountMutation.mutate(data))} className="space-y-6">
                    <Tabs defaultValue="account" className="space-y-6">
                      <TabsList className="grid w-full grid-cols-4 bg-gray-800">
                        <TabsTrigger value="account" className="text-white data-[state=active]:bg-blue-600">
                          Account Info & Rules
                        </TabsTrigger>
                        <TabsTrigger value="financial" className="text-white data-[state=active]:bg-blue-600">
                          Financial Tracking
                        </TabsTrigger>
                        <TabsTrigger value="payout" className="text-white data-[state=active]:bg-blue-600">
                          Payout Rules
                        </TabsTrigger>
                        <TabsTrigger value="risk" className="text-white data-[state=active]:bg-blue-600">
                          Risk Settings
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="account" className="space-y-6 mt-6">
                        <div className="bg-gray-800 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-4">Basic Account Information</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={accountForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Account Name</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., FTMO Challenge #1"
                                    />
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
                                  <FormLabel className="text-white font-medium">Trading Firm</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., FTMO, Apex, TopStep"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={accountForm.control}
                              name="type"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Account Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                        <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-700 border-gray-600">
                                      <SelectItem value="challenge" className="text-white hover:bg-gray-600">Challenge</SelectItem>
                                      <SelectItem value="funded" className="text-white hover:bg-gray-600">Funded</SelectItem>
                                      <SelectItem value="live" className="text-white hover:bg-gray-600">Live</SelectItem>
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
                                  <FormLabel className="text-white font-medium">Status</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-700 border-gray-600">
                                      <SelectItem value="active" className="text-white hover:bg-gray-600">Active</SelectItem>
                                      <SelectItem value="passed" className="text-white hover:bg-gray-600">Passed</SelectItem>
                                      <SelectItem value="failed" className="text-white hover:bg-gray-600">Failed</SelectItem>
                                      <SelectItem value="withdrawn" className="text-white hover:bg-gray-600">Withdrawn</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="financial" className="space-y-6 mt-6">
                        <div className="bg-gray-800 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-4">Account Rules & Limits</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={accountForm.control}
                              name="startingBalance"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Starting Balance ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={accountForm.control}
                              name="currentBalance"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Current Balance ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={accountForm.control}
                              name="profitTarget"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Profit Target ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
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
                                  <FormLabel className="text-white font-medium">Max Drawdown ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="payout" className="space-y-6 mt-6">
                        <div className="bg-gray-800 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-4">Payout Configuration</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={accountForm.control}
                              name="payoutFrequency"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Payout Frequency</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                        <SelectValue placeholder="Select frequency" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-700 border-gray-600">
                                      <SelectItem value="weekly" className="text-white hover:bg-gray-600">Weekly</SelectItem>
                                      <SelectItem value="bi-weekly" className="text-white hover:bg-gray-600">Bi-weekly</SelectItem>
                                      <SelectItem value="monthly" className="text-white hover:bg-gray-600">Monthly</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={accountForm.control}
                              name="profitSplit"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Profit Split (%)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="risk" className="space-y-6 mt-6">
                        <div className="bg-gray-800 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-4">Risk Management</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={accountForm.control}
                              name="riskPercentage"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Risk Percentage (%)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      step="0.1"
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={accountForm.control}
                              name="riskRewardRatio"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Risk/Reward Ratio</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      step="0.1"
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAccountDialogOpen(false)}
                        className="bg-gray-600 hover:bg-gray-500 text-white border-gray-500"
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
      </div>

      {/* Risk Management & Projection Section */}
      <div className="bg-gray-800/30 rounded-lg border border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white">Risk Management & Responsible Day-to-Pass Planning projection</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setProjectionsMinimized(!projectionsMinimized)}
              className="text-gray-400 hover:text-white"
            >
              {projectionsMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {!projectionsMinimized && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-1">
          <Card className="bg-dark-card border-dark-border">
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
        </div>

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
                      {formatCurrency(selectedAccountData?.account.currentBalance || 0)}
                    </div>
                    <div className="text-sm text-black/70">Net Balance</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-600 border-blue-500/20">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(selectedAccountData?.actualProgress || 0)}
                    </div>
                    <div className="text-sm text-blue-100">Daily P&L</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-green-600 border-green-500/20">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(selectedAccountData?.totalPnl || 0)}
                    </div>
                    <div className="text-sm text-green-100">Total P&L</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Row 2: Performance Ratios (4 widgets) */}
            <div className="dashboard-row-2 grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Card className="bg-purple-600 border-purple-500/20">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {selectedAccountData?.winRate?.toFixed(1) || '0.0'}%
                    </div>
                    <div className="text-sm text-purple-100">Win Rate</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-teal-600 border-teal-500/20">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {settings.riskRewardRatio}:1
                    </div>
                    <div className="text-sm text-teal-100">R Factor</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-orange-600 border-orange-500/20">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {((selectedAccountData?.winRate || 0) * settings.riskRewardRatio / 100).toFixed(2)}
                    </div>
                    <div className="text-sm text-orange-100">Profit Factor</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-pink-600 border-pink-500/20">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(selectedAccountData?.avgWin || 0)} / {formatCurrency(selectedAccountData?.avgLoss || 0)}
                    </div>
                    <div className="text-sm text-pink-100">Avg Win/Loss</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Row 3: Trading Activity & Planning (4 widgets) */}
            <div className="dashboard-row-3 grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Card className="bg-indigo-600 border-indigo-500/20">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {selectedAccountData?.totalTrades || 0}
                    </div>
                    <div className="text-sm text-indigo-100">Total Trades</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-cyan-600 border-cyan-500/20">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(selectedAccountData?.bestTrade || 0)}
                    </div>
                    <div className="text-sm text-cyan-100">Best Trade</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-600 border-slate-500/20">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">
                      ← W2 {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}th {new Date().getFullYear()} →
                    </div>
                    <div className="text-sm text-slate-100">Weekly Navigation</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-emerald-600 border-emerald-500/20">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-sm text-emerald-100 mb-1">
                      Target: {formatCurrency(totalDailyReward)}/day
                    </div>
                    <div className="text-xl font-bold text-white">
                      {progressPercentage.toFixed(1)}% ahead
                    </div>
                    <div className="text-xs text-emerald-100">Plan vs Reality</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Row 4: Risk & Investment (4 widgets) */}
            <div className="dashboard-row-4 grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Card className="bg-red-600 border-red-500/20">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">
                      {((settings.riskPerTrade / settings.maxDrawdown) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-red-100 mb-1">Daily Risk Used</div>
                    <div className="text-xs text-red-100">Health: 98% 🟢</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-yellow-600 border-yellow-500/20">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">
                      {formatCurrency(selectedAccountData?.totalInvested || 579)}
                    </div>
                    <div className="text-sm text-yellow-100 mb-1">Invested</div>
                    <div className="text-xs text-yellow-100">ROI: +30,566% 📈</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-violet-600 border-violet-500/20">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {selectedAccountData?.disciplineScore || 85}%
                    </div>
                    <div className="text-sm text-violet-100">Discipline Score</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-lime-600 border-lime-500/20">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {Math.floor(Math.random() * 30) + 1}
                    </div>
                    <div className="text-sm text-lime-100">Active Trading Days</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

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
                      {formatCurrency(selectedAccountData.account.currentBalance)}
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
        )}
      </div>
    </div>
  );
}