import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  Clock
} from "lucide-react";

interface ProjectionSettings {
  mode: 'account' | 'simulation';
  selectedAccountIds: number[];
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
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: trades = [] } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

  const [settings, setSettings] = useState<ProjectionSettings>({
    mode: 'simulation',
    selectedAccountIds: [],
    startingCapital: 150000,
    riskPerTrade: 250,
    riskRewardRatio: 3,
    profitTarget: 9000,
    maxDrawdown: 4500,
    riskCuttingPercent: 0,
    compoundingPercent: 0,
    maxLossPerDay: 500,
    extraDaysIfLoss: 5,
  });

  const [projectionData, setProjectionData] = useState<ProjectionDay[]>([]);

  // Calculate account-specific data when account mode is selected
  const selectedAccountsData = useMemo(() => {
    if (settings.mode !== 'account' || settings.selectedAccountIds.length === 0) {
      return null;
    }
    
    const selectedAccounts = accounts.filter(acc => settings.selectedAccountIds.includes(acc.id));
    const accountTrades = trades.filter(trade => settings.selectedAccountIds.includes(trade.accountId));
    
    const totalStartingCapital = selectedAccounts.reduce((sum, acc) => sum + acc.startingBalance, 0);
    const totalCurrentBalance = selectedAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
    const totalPnl = accountTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    
    return {
      accounts: selectedAccounts,
      trades: accountTrades,
      totalStartingCapital,
      totalCurrentBalance,
      totalPnl,
      actualProgress: totalPnl / settings.profitTarget * 100,
    };
  }, [accounts, trades, settings.selectedAccountIds, settings.mode, settings.profitTarget]);

  // Generate projection data
  useEffect(() => {
    const generateProjection = () => {
      const days: ProjectionDay[] = [];
      let cumulativeTarget = 0;
      let cumulativeActual = 0;
      let currentRisk = settings.riskPerTrade;
      let dayCount = 0;
      
      // Calculate how many days needed to reach target
      const dailyProfit = settings.riskPerTrade * settings.riskRewardRatio;
      const daysNeeded = Math.ceil(settings.profitTarget / dailyProfit);
      
      for (let i = 1; i <= daysNeeded; i++) {
        dayCount++;
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + i - 1);
        
        // Skip weekends if it's a trading simulation
        if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
          continue;
        }
        
        const reward = currentRisk * settings.riskRewardRatio;
        cumulativeTarget += reward;
        
        // Check if there's actual trade data for this account and day
        let actualPnl: number | undefined;
        let isWin = true;
        
        if (selectedAccountsData && selectedAccountsData.trades.length > 0) {
          const dayTrades = selectedAccountsData.trades.filter(trade => {
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
          dayNumber: dayCount,
          risk: currentRisk,
          reward,
          targetExpectation: cumulativeTarget,
          actualPnl,
          isWin,
          cumulativeTarget,
          cumulativeActual,
        });
        
        // Apply compounding if set
        if (settings.compoundingPercent > 0) {
          currentRisk *= (1 + settings.compoundingPercent / 100);
        }
        
        // Stop if target is reached
        if (cumulativeTarget >= settings.profitTarget) {
          break;
        }
      }
      
      setProjectionData(days);
    };

    generateProjection();
  }, [settings, selectedAccountsData]);

  const updateSetting = (key: keyof ProjectionSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const daysToTarget = projectionData.length;
  const totalReward = settings.riskPerTrade * settings.riskRewardRatio;
  const progressPercentage = selectedAccountsData ? selectedAccountsData.actualProgress : 0;

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
                <div className="space-y-2">
                  <Label className="text-white">Select Accounts</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {accounts.map(account => (
                      <div key={account.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`account-${account.id}`}
                          checked={settings.selectedAccountIds.includes(account.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateSetting('selectedAccountIds', [...settings.selectedAccountIds, account.id]);
                            } else {
                              updateSetting('selectedAccountIds', settings.selectedAccountIds.filter(id => id !== account.id));
                            }
                          }}
                          className="rounded border-gray-600"
                        />
                        <label htmlFor={`account-${account.id}`} className="text-sm text-white">
                          {account.name} - {formatCurrency(account.currentBalance)}
                        </label>
                      </div>
                    ))}
                  </div>
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
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <div className="text-2xl font-bold text-white">{formatCurrency(settings.riskPerTrade)}</div>
                  <div className="text-sm text-blue-100">Risk Per Trade</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-600 border-green-500/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{daysToTarget}</div>
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
          </div>

          {/* Account Summary (if account mode) */}
          {settings.mode === 'account' && selectedAccountsData && (
            <Card className="bg-dark-card border-dark-border">
              <CardHeader>
                <CardTitle className="text-white">Selected Accounts Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">
                      {formatCurrency(selectedAccountsData.totalCurrentBalance)}
                    </div>
                    <div className="text-sm text-gray-400">Current Balance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">
                      {formatCurrency(selectedAccountsData.totalPnl)}
                    </div>
                    <div className="text-sm text-gray-400">Total P&L</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-prop-gold">
                      {selectedAccountsData.accounts.length}
                    </div>
                    <div className="text-sm text-gray-400">Accounts</div>
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