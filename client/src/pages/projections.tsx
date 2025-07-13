import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { CheckCircle2, Target, TrendingUp, DollarSign, AlertTriangle, Calculator, Calendar, Play, Pause, BarChart3, PieChart, RefreshCw, Settings, Save, Lock, Minimize2, Maximize2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Account {
  id: number;
  name: string;
  type: 'challenge' | 'funded' | 'live';
  balance: number;
  firm: string;
  status: 'active' | 'passed' | 'failed' | 'withdrawn';
  profitTarget: number;
  dailyLossLimit: number;
  maxDrawdown: number;
  startingBalance: number;
  currentDrawdown: number;
  riskLimitUsed: number;
  daysTraded: number;
  createdAt: string;
  accountCost: number;
  purchaseMethod: string;
  resetCount: number;
  totalResetsCost: number;
  activationCost: number;
  activationPaid: boolean;
  includesActivationFee: boolean;
  csvAccountId?: string;
}

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

interface AccountManagementProps {
  accountsMinimized?: boolean;
  onToggleMinimized?: () => void;
}

const AccountManagement: React.FC<AccountManagementProps> = ({ accountsMinimized = false, onToggleMinimized }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    firm: '',
    type: 'challenge' as 'challenge' | 'funded' | 'live',
    balance: 0,
    profitTarget: 0,
    dailyLossLimit: 0,
    maxDrawdown: 0,
    accountCost: 0,
    purchaseMethod: '',
    includesActivationFee: false,
    activationCost: 0,
    selectedAssets: [] as string[],
    tradingExperience: '',
    riskTolerance: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  const createAccountMutation = useMutation({
    mutationFn: async (accountData: any) => {
      const response = await apiRequest('/api/accounts', {
        method: 'POST',
        body: JSON.stringify(accountData),
        headers: { 'Content-Type': 'application/json' },
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      setIsCreateDialogOpen(false);
      setNewAccount({
        name: '',
        firm: '',
        type: 'challenge',
        balance: 0,
        profitTarget: 0,
        dailyLossLimit: 0,
        maxDrawdown: 0,
        accountCost: 0,
        purchaseMethod: '',
        includesActivationFee: false,
        activationCost: 0,
        selectedAssets: [],
        tradingExperience: '',
        riskTolerance: '',
        notes: ''
      });
      toast({ title: 'Account created successfully!' });
    },
    onError: (error) => {
      console.error('Error creating account:', error);
      toast({ title: 'Error creating account', variant: 'destructive' });
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-prop-gold"></div>
      </div>
    );
  }

  return (
    <div className="prop-account-management">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">PropFirms Accounts</h2>
          {onToggleMinimized && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimized}
              className="text-gray-400 hover:text-white"
            >
              {accountsMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
          )}
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-prop-gold hover:bg-prop-gold/90 text-black font-semibold"
        >
          Create Account
        </Button>
      </div>

      {!accountsMinimized && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {accounts.map((account) => (
            <Card key={account.id} className="golden-widget">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">{account.name}</CardTitle>
                <Badge className={`w-fit ${
                  account.status === 'active' ? 'bg-green-500' :
                  account.status === 'passed' ? 'bg-blue-500' :
                  account.status === 'failed' ? 'bg-red-500' :
                  'bg-gray-500'
                }`}>
                  {account.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Balance:</span>
                  <span className="text-white">${account.balance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Firm:</span>
                  <span className="text-white">{account.firm}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white capitalize">{account.type}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

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

  const [projectionDays, setProjectionDays] = useState<ProjectionDay[]>([]);
  const [accountsMinimized, setAccountsMinimized] = useState(false);
  const [projectionMinimized, setProjectionMinimized] = useState(false);

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProjection = () => {
    const days: ProjectionDay[] = [];
    let currentCapital = settings.startingCapital;
    let cumulativeTarget = 0;
    let cumulativeActual = 0;

    for (let i = 1; i <= 365; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i - 1);
      
      const risk = Math.min(settings.riskPerTrade, currentCapital * 0.02);
      const reward = risk * settings.riskRewardRatio;
      
      cumulativeTarget += reward;
      
      const day: ProjectionDay = {
        date: date.toISOString().split('T')[0],
        dayNumber: i,
        risk,
        reward,
        targetExpectation: cumulativeTarget,
        isWin: true,
        cumulativeTarget,
        cumulativeActual
      };

      days.push(day);

      if (cumulativeTarget >= settings.profitTarget) {
        break;
      }
    }

    setProjectionDays(days);
  };

  useEffect(() => {
    calculateProjection();
  }, [settings]);

  const totalDailyReward = settings.riskPerTrade * settings.riskRewardRatio;
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
          <AccountManagement
            accountsMinimized={accountsMinimized}
            onToggleMinimized={() => setAccountsMinimized(!accountsMinimized)}
          />
        </div>
      </div>

      {/* Risk Management & Projection Section */}
      <div className="risk-management-section">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">Risk Management & Responsible Day-to-Pass Planning</h2>
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
            <Card className="golden-widget">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Projection Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Mode</Label>
                  <Select value={settings.mode} onValueChange={(value) => setSettings({...settings, mode: value as 'account' | 'simulation'})}>
                    <SelectTrigger className="bg-dark-bg border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simulation">Simulation</SelectItem>
                      <SelectItem value="account">Account-based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Starting Capital</Label>
                  <Input
                    type="number"
                    value={settings.startingCapital}
                    onChange={(e) => setSettings({...settings, startingCapital: Number(e.target.value)})}
                    className="bg-dark-bg border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Risk Per Trade</Label>
                  <Input
                    type="number"
                    value={settings.riskPerTrade}
                    onChange={(e) => setSettings({...settings, riskPerTrade: Number(e.target.value)})}
                    className="bg-dark-bg border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Risk/Reward Ratio</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={settings.riskRewardRatio}
                    onChange={(e) => setSettings({...settings, riskRewardRatio: Number(e.target.value)})}
                    className="bg-dark-bg border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Profit Target</Label>
                  <Input
                    type="number"
                    value={settings.profitTarget}
                    onChange={(e) => setSettings({...settings, profitTarget: Number(e.target.value)})}
                    className="bg-dark-bg border-gray-700 text-white"
                  />
                </div>

                <Button
                  onClick={calculateProjection}
                  className="w-full bg-prop-gold hover:bg-prop-gold/90 text-black font-semibold"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Projection
                </Button>
              </CardContent>
            </Card>

            {/* Projection Results */}
            <Card className="golden-widget lg:col-span-2">
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
                        <th className="text-left py-3 px-4 text-gray-300">Day</th>
                        <th className="text-right py-3 px-4 text-gray-300">Risk</th>
                        <th className="text-right py-3 px-4 text-gray-300">Reward</th>
                        <th className="text-right py-3 px-4 text-gray-300">Target</th>
                        {settings.mode === 'account' && (
                          <th className="text-right py-3 px-4 text-gray-300">Actual</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {projectionDays.slice(0, 30).map((day) => (
                        <tr key={day.dayNumber} className="border-b border-gray-800">
                          <td className="py-3 px-4 text-white">
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