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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Account, Trade } from "@shared/schema";
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
  Bookmark
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
  const queryClient = useQueryClient();

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: trades = [] } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

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
    if (!settings.selectedAccountId || !savedProjections) return null;
    return savedProjections.find((p: any) => p.status === 'active' && p.isLocked);
  }, [settings.selectedAccountId, savedProjections]);

  const hasActiveGoal = !!activeProjection;

  const daysToTarget = projectionData.length;
  const dailyRewardPerAccount = settings.riskPerTrade * settings.riskRewardRatio;
  const totalDailyReward = dailyRewardPerAccount * settings.copiedAccounts;
  const progressPercentage = selectedAccountData ? selectedAccountData.actualProgress : 0;
  
  // Calculate theoretical days without compounding
  const theoreticalDays = Math.ceil(settings.profitTarget / totalDailyReward);

  return (
    <div className="space-y-6">
      <header className="border-b border-gray-800 bg-dark-bg pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Target className="mr-3 h-6 w-6 text-prop-gold" />
              Target & Risk Projection
            </h1>
            <p className="text-gray-400">Project your trading goals and visualize the path to achieve them</p>
          </div>
        </div>
      </header>

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
                          <p className="text-prop-gold font-medium">Goal Active</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Target: {formatCurrency(activeProjection?.targetProfit)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Cannot modify until target is reached or goal fails
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
                          {saveProjectionMutation.isPending ? 'Starting Goal...' : 'Save to start the goal'}
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
                    value={settings.copiedAccounts}
                    onChange={(e) => updateSetting('copiedAccounts', Number(e.target.value))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <p className="text-xs text-gray-400">
                    Multiple accounts reach targets faster (e.g., 2 accounts = half the time)
                  </p>
                </div>
              )}

              {/* Financial Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Starting Capital</Label>
                  <Input
                    type="number"
                    value={settings.startingCapital}
                    onChange={(e) => updateSetting('startingCapital', Number(e.target.value))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Risk Per Trade</Label>
                  <Input
                    type="number"
                    value={settings.riskPerTrade}
                    onChange={(e) => updateSetting('riskPerTrade', Number(e.target.value))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Risk:Reward Ratio</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={settings.riskRewardRatio}
                    onChange={(e) => updateSetting('riskRewardRatio', Number(e.target.value))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Profit Target</Label>
                  <Input
                    type="number"
                    value={settings.profitTarget}
                    onChange={(e) => updateSetting('profitTarget', Number(e.target.value))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Max Drawdown</Label>
                  <Input
                    type="number"
                    value={settings.maxDrawdown}
                    onChange={(e) => updateSetting('maxDrawdown', Number(e.target.value))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Max Loss/Day</Label>
                  <Input
                    type="number"
                    value={settings.maxLossPerDay}
                    onChange={(e) => updateSetting('maxLossPerDay', Number(e.target.value))}
                    className="bg-gray-700 border-gray-600 text-white"
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
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-prop-gradient-gold border-prop-gold/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{formatCurrency(settings.startingCapital)}</div>
                  <div className="text-sm text-black/70">Starting Capital</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-600 border-blue-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{formatCurrency(totalDailyReward)}</div>
                  <div className="text-sm text-blue-100">Daily Reward Target</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-600 border-green-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{theoreticalDays}</div>
                  <div className="text-sm text-green-100">Days to Target</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-600 border-purple-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{progressPercentage.toFixed(1)}%</div>
                  <div className="text-sm text-purple-100">Actual Progress</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-teal-600 border-teal-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{settings.copiedAccounts}x</div>
                  <div className="text-sm text-teal-100">Copied Accounts</div>
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
                      <th className="text-right py-3 px-4 text-gray-300">Reward</th>
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
  );
}