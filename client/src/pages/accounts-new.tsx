import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Wallet, 
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface Account {
  id: number;
  name: string;
  firm?: string;
  type: string;
  startingBalance: number;
  currentBalance: number;
  profitTarget?: number;
  maxDrawdown?: number;
  riskPerTrade?: number;
  createdAt: string;
  lastTradeDate: string;
  isActive: boolean;
}

interface AccountFormProps {
  onSubmit: (formData: any) => void;
  isLoading: boolean;
  initialData?: Account | null;
  onCancel: () => void;
}

// Separate form component to prevent re-renders
const AccountForm = React.memo(({ 
  onSubmit, 
  isLoading, 
  initialData = null,
  onCancel 
}: AccountFormProps) => {
  const [formData, setFormData] = useState({
    // Basic Info Tab
    name: '',
    firm: '',
    type: 'demo',
    status: 'active',
    startingBalance: 10000,
    profitTarget: 1000,
    maxDrawdown: 500,
    minimumTradingDays: 5,
    timeLimit: 30,
    consistencyRule: 10,
    drawdownType: 'trailing',
    maxDrawdownType: 'EOD',
    hasDailyLossLimit: false,
    
    // Financial Tab
    accountCost: 150,
    activationCost: 99,
    purchaseMethod: 'credit card',
    resetCount: 0,
    totalResetsCost: 0,
    profitSplit: 80,
    activationFeePaid: false,
    includesActivationFee: false,
    
    // Rules & Risk Tab
    riskPerTrade: 100,
    riskPerTradeDivider: 10,
    dailyLossLimit: 500,
    riskRewardRatio: 2,
    maxTradesPerDay: 10,
    maxRiskPerDay: 500,
    stopLoss: 20,
    primaryAsset: '',
    secondaryAsset: '',
    tertiaryAsset: '',
    
    // Personal Trading Time
    timeSlot1Start: '09:00',
    timeSlot1End: '17:00',
    timeSlot1Timezone: 'UTC',
    timeSlot2Start: '',
    timeSlot2End: '',
    timeSlot2Timezone: 'UTC',
    timeSlot3Start: '',
    timeSlot3End: '',
    timeSlot3Timezone: 'UTC',
    
    // Bottom fields
    dailyWorkingHours: 8.0,
    hourlyWages: 25.00,
    liveTradingAccountAvailable: false,
    challengePayoutsAvailable: false
  });

  // Initialize form data only once when dialog opens
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        name: initialData.name || '',
        firm: initialData.firm || '',
        type: initialData.type || 'demo',
        startingBalance: initialData.startingBalance || 10000,
        profitTarget: initialData.profitTarget || 1000,
        maxDrawdown: initialData.maxDrawdown || 500,
        riskPerTrade: initialData.riskPerTrade || 100
      }));
    }
  }, [initialData]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    onSubmit(formData);
  }, [formData, onSubmit]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
          <TabsTrigger value="basic" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="financial" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
            Financial
          </TabsTrigger>
          <TabsTrigger value="rules" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
            Rules & Risk
          </TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Account Name *</Label>
              <Input 
                placeholder="e.g., Main Trading Account" 
                className="bg-gray-800 border-gray-600 text-white mt-1"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            
            <div>
              <Label className="text-white">Prop Firm *</Label>
              <Input 
                placeholder="e.g., FTMO, TopstepTrader" 
                className="bg-gray-800 border-gray-600 text-white mt-1"
                value={formData.firm}
                onChange={(e) => handleInputChange('firm', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Account Type *</Label>
              <select 
                className="w-full mt-1 bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                <option value="challenge">Challenge</option>
                <option value="funded">Funded</option>
                <option value="live">Live</option>
                <option value="demo">Demo</option>
              </select>
            </div>

            <div>
              <Label className="text-white">Account Status</Label>
              <select 
                className="w-full mt-1 bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-white">Starting Balance ($) *</Label>
              <Input 
                type="number" 
                placeholder="10000" 
                className="bg-gray-800 border-gray-600 text-white mt-1"
                value={formData.startingBalance}
                onChange={(e) => handleInputChange('startingBalance', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div>
              <Label className="text-white">Profit Target ($) *</Label>
              <Input 
                type="number" 
                placeholder="1000" 
                className="bg-gray-800 border-gray-600 text-white mt-1"
                value={formData.profitTarget}
                onChange={(e) => handleInputChange('profitTarget', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div>
              <Label className="text-white">Max Drawdown ($) *</Label>
              <Input 
                type="number" 
                placeholder="500" 
                className="bg-gray-800 border-gray-600 text-white mt-1"
                value={formData.maxDrawdown}
                onChange={(e) => handleInputChange('maxDrawdown', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-white">Minimum Trading Days</Label>
              <Input 
                type="number" 
                placeholder="5" 
                className="bg-gray-800 border-gray-600 text-white mt-1"
                value={formData.minimumTradingDays}
                onChange={(e) => handleInputChange('minimumTradingDays', parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label className="text-white">Time Limit (days)</Label>
              <Input 
                type="number" 
                placeholder="30" 
                className="bg-gray-800 border-gray-600 text-white mt-1"
                value={formData.timeLimit}
                onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label className="text-white">Consistency Rule (%)</Label>
              <Input 
                type="number" 
                placeholder="10" 
                className="bg-gray-800 border-gray-600 text-white mt-1"
                value={formData.consistencyRule}
                onChange={(e) => handleInputChange('consistencyRule', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-white">Drawdown Type</Label>
              <select 
                className="w-full mt-1 bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2"
                value={formData.drawdownType}
                onChange={(e) => handleInputChange('drawdownType', e.target.value)}
              >
                <option value="trailing">Trailing</option>
                <option value="static">Static</option>
                <option value="balance_based">Balance Based</option>
              </select>
            </div>

            <div>
              <Label className="text-white">Max Drawdown Type</Label>
              <select 
                className="w-full mt-1 bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2"
                value={formData.maxDrawdownType}
                onChange={(e) => handleInputChange('maxDrawdownType', e.target.value)}
              >
                <option value="EOD">EOD</option>
                <option value="real-time">Real-time</option>
                <option value="session_close">Session Close</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 mt-7">
              <Checkbox
                checked={formData.hasDailyLossLimit}
                onCheckedChange={(checked) => handleInputChange('hasDailyLossLimit', checked)}
              />
              <Label className="text-white">Has Daily Loss Limit</Label>
            </div>
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Account Cost ($)</Label>
              <Input 
                type="number" 
                placeholder="150" 
                className="bg-gray-800 border-gray-600 text-white mt-1"
                value={formData.accountCost}
                onChange={(e) => handleInputChange('accountCost', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div>
              <Label className="text-white">Activation Cost ($)</Label>
              <Input 
                type="number" 
                placeholder="99" 
                className="bg-gray-800 border-gray-600 text-white mt-1"
                value={formData.activationCost}
                onChange={(e) => handleInputChange('activationCost', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div>
            <Label className="text-white">Purchase Method</Label>
            <select 
              className="w-full mt-1 bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2"
              value={formData.purchaseMethod}
              onChange={(e) => handleInputChange('purchaseMethod', e.target.value)}
            >
              <option value="credit card">Credit Card</option>
              <option value="PayPal">PayPal</option>
              <option value="bank transfer">Bank Transfer</option>
              <option value="crypto">Crypto</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-white">Reset Count</Label>
              <Input 
                type="number" 
                placeholder="0" 
                className="bg-gray-800 border-gray-600 text-white mt-1"
                value={formData.resetCount}
                onChange={(e) => handleInputChange('resetCount', parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div>
              <Label className="text-white">Total Resets Cost ($)</Label>
              <Input 
                type="number" 
                placeholder="0" 
                className="bg-gray-800 border-gray-600 text-white mt-1"
                value={formData.totalResetsCost}
                onChange={(e) => handleInputChange('totalResetsCost', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label className="text-white">Profit Split (%)</Label>
              <Input 
                type="number" 
                placeholder="80" 
                className="bg-gray-800 border-gray-600 text-white mt-1"
                value={formData.profitSplit}
                onChange={(e) => handleInputChange('profitSplit', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.activationFeePaid}
                onCheckedChange={(checked) => handleInputChange('activationFeePaid', checked)}
              />
              <Label className="text-white">Activation Fee Paid</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.includesActivationFee}
                onCheckedChange={(checked) => handleInputChange('includesActivationFee', checked)}
              />
              <Label className="text-white">Includes Activation Fee</Label>
            </div>
          </div>
        </TabsContent>

        {/* Rules & Risk Tab */}
        <TabsContent value="rules" className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Risk Per Trade ($)</Label>
              <Input 
                type="number" 
                placeholder="100" 
                className="bg-gray-800 border-gray-600 text-white mt-1"
                value={formData.riskPerTrade}
                onChange={(e) => handleInputChange('riskPerTrade', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label className="text-white">Risk Per Trade Divider</Label>
              <Input 
                type="number" 
                placeholder="10" 
                className="bg-gray-800 border-gray-600 text-white mt-1"
                value={formData.riskPerTradeDivider}
                onChange={(e) => handleInputChange('riskPerTradeDivider', parseFloat(e.target.value) || 0)}
              />
              <div className="text-xs text-gray-400 mt-1">Helper: Used to calculate position size</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-white">Daily Loss Limit ($)</Label>
              <Input 
                type="number" 
                placeholder="500" 
                className="bg-gray-800 border-gray-600 text-white mt-1"
                value={formData.dailyLossLimit}
                onChange={(e) => handleInputChange('dailyLossLimit', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label className="text-white">Risk:Reward Ratio (1:X)</Label>
              <Input 
                type="number" 
                placeholder="2" 
                className="bg-gray-800 border-gray-600 text-white mt-1"
                value={formData.riskRewardRatio}
                onChange={(e) => handleInputChange('riskRewardRatio', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label className="text-white">Max Trades Per Day</Label>
              <Input 
                type="number" 
                placeholder="10" 
                className="bg-gray-800 border-gray-600 text-white mt-1"
                value={formData.maxTradesPerDay}
                onChange={(e) => handleInputChange('maxTradesPerDay', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Max Risk Per Day ($)</Label>
              <Input 
                type="number" 
                placeholder="500" 
                className="bg-gray-800 border-gray-600 text-white mt-1"
                value={formData.maxRiskPerDay}
                onChange={(e) => handleInputChange('maxRiskPerDay', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label className="text-white">Stop Loss (Points/Pips)</Label>
              <Input 
                type="number" 
                placeholder="20" 
                className="bg-gray-800 border-gray-600 text-white mt-1"
                value={formData.stopLoss}
                onChange={(e) => handleInputChange('stopLoss', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-white">Primary Asset *</Label>
              <Input 
                placeholder="e.g., ES, NQ, Gold" 
                className="bg-gray-800 border-gray-600 text-white mt-1"
                value={formData.primaryAsset}
                onChange={(e) => handleInputChange('primaryAsset', e.target.value)}
              />
            </div>

            <div>
              <Label className="text-white">Secondary Asset</Label>
              <Input 
                placeholder="Optional" 
                className="bg-gray-800 border-gray-600 text-white mt-1"
                value={formData.secondaryAsset}
                onChange={(e) => handleInputChange('secondaryAsset', e.target.value)}
              />
            </div>

            <div>
              <Label className="text-white">Tertiary Asset</Label>
              <Input 
                placeholder="Optional" 
                className="bg-gray-800 border-gray-600 text-white mt-1"
                value={formData.tertiaryAsset}
                onChange={(e) => handleInputChange('tertiaryAsset', e.target.value)}
              />
            </div>
          </div>

          {/* Personal Trading Time */}
          <div className="space-y-4 pt-6 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-white">Personal Trading Time</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Time Slot 1 (Primary) - Start</Label>
                  <Input 
                    type="time"
                    className="bg-gray-800 border-gray-600 text-white mt-1"
                    value={formData.timeSlot1Start}
                    onChange={(e) => handleInputChange('timeSlot1Start', e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-white">End Time</Label>
                  <Input 
                    type="time"
                    className="bg-gray-800 border-gray-600 text-white mt-1"
                    value={formData.timeSlot1End}
                    onChange={(e) => handleInputChange('timeSlot1End', e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-white">Timezone</Label>
                  <Input 
                    placeholder="UTC"
                    className="bg-gray-800 border-gray-600 text-white mt-1"
                    value={formData.timeSlot1Timezone}
                    onChange={(e) => handleInputChange('timeSlot1Timezone', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Time Slot 2 (Secondary) - Start</Label>
                  <Input 
                    type="time"
                    className="bg-gray-800 border-gray-600 text-white mt-1"
                    value={formData.timeSlot2Start}
                    onChange={(e) => handleInputChange('timeSlot2Start', e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-white">End Time</Label>
                  <Input 
                    type="time"
                    className="bg-gray-800 border-gray-600 text-white mt-1"
                    value={formData.timeSlot2End}
                    onChange={(e) => handleInputChange('timeSlot2End', e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-white">Timezone</Label>
                  <Input 
                    placeholder="UTC"
                    className="bg-gray-800 border-gray-600 text-white mt-1"
                    value={formData.timeSlot2Timezone}
                    onChange={(e) => handleInputChange('timeSlot2Timezone', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Time Slot 3 (Tertiary) - Start</Label>
                  <Input 
                    type="time"
                    className="bg-gray-800 border-gray-600 text-white mt-1"
                    value={formData.timeSlot3Start}
                    onChange={(e) => handleInputChange('timeSlot3Start', e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-white">End Time</Label>
                  <Input 
                    type="time"
                    className="bg-gray-800 border-gray-600 text-white mt-1"
                    value={formData.timeSlot3End}
                    onChange={(e) => handleInputChange('timeSlot3End', e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-white">Timezone</Label>
                  <Input 
                    placeholder="UTC"
                    className="bg-gray-800 border-gray-600 text-white mt-1"
                    value={formData.timeSlot3Timezone}
                    onChange={(e) => handleInputChange('timeSlot3Timezone', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom fields */}
          <div className="space-y-4 pt-6 border-t border-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Daily Working Hours</Label>
                <Input 
                  type="number" 
                  placeholder="8.0" 
                  step="0.5"
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                  value={formData.dailyWorkingHours}
                  onChange={(e) => handleInputChange('dailyWorkingHours', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label className="text-white">Hourly Wages ($)</Label>
                <Input 
                  type="number" 
                  placeholder="25.00" 
                  step="0.01"
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                  value={formData.hourlyWages}
                  onChange={(e) => handleInputChange('hourlyWages', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.liveTradingAccountAvailable}
                  onCheckedChange={(checked) => handleInputChange('liveTradingAccountAvailable', checked)}
                />
                <Label className="text-white">Live Trading Account Available</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.challengePayoutsAvailable}
                  onCheckedChange={(checked) => handleInputChange('challengePayoutsAvailable', checked)}
                />
                <Label className="text-white">Challenge Payouts Available</Label>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-yellow-500 text-black hover:bg-yellow-400"
        >
          {isLoading ? 'Creating...' : 'Create Account'}
        </Button>
      </div>
    </div>
  );
});

export default function AccountsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showBalance, setShowBalance] = useState<Record<number, boolean>>({});

  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/accounts', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      setIsCreateDialogOpen(false);
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/accounts/${id}`, 'PATCH', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      setIsEditDialogOpen(false);
      setEditingAccount(null);
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/accounts/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
    },
  });

  // Memoized form input handler to prevent flickering
  const handleCreateAccount = useCallback((formData: any) => {
    createAccountMutation.mutate(formData);
  }, [createAccountMutation]);

  const handleEditAccount = useCallback((account: Account) => {
    setEditingAccount(account);
    setIsEditDialogOpen(true);
  }, []);

  const handleUpdateAccount = useCallback((formData: any) => {
    if (editingAccount) {
      updateAccountMutation.mutate({ id: editingAccount.id, data: formData });
    }
  }, [editingAccount, updateAccountMutation]);

  // Stable dialog close handlers
  const handleCloseCreateDialog = useCallback(() => {
    setIsCreateDialogOpen(false);
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingAccount(null);
  }, []);

  const toggleBalanceVisibility = (accountId: number) => {
    setShowBalance(prev => ({ ...prev, [accountId]: !prev[accountId] }));
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'live': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'demo': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'paper': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'challenge': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg text-white p-6 flex items-center justify-center">
        <div className="text-white text-xl">Loading accounts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-rainbow">
              Account Management
            </h1>
            <p className="text-gray-400 mt-2">Manage your trading accounts and monitor performance</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
              onClick={async () => {
                try {
                  const response = await fetch('/api/create-mock-data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                  });
                  
                  if (response.ok) {
                    queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
                    queryClient.invalidateQueries({ queryKey: ['/api/trades'] });
                  }
                } catch (error) {
                  console.error('Failed to create mock data:', error);
                }
              }}
            >
              Create Mock Data
            </Button>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-yellow-500 text-black hover:bg-yellow-400"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Account
            </Button>
          </div>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <Card key={account.id} className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white">{account.name}</CardTitle>
                  <Badge className={getAccountTypeColor(account.type)}>
                    {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                  </Badge>
                </div>
                {account.firm && (
                  <p className="text-gray-400 text-sm">{account.firm}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Starting Balance</p>
                    <p className="text-white font-semibold">${(account.startingBalance || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Current Balance</p>
                    <div className="flex items-center gap-2">
                      {showBalance[account.id] ? (
                        <>
                          <p className="text-white font-semibold">${(account.currentBalance || 0).toLocaleString()}</p>
                          <button
                            onClick={() => toggleBalanceVisibility(account.id)}
                            className="text-gray-400 hover:text-white"
                          >
                            <EyeOff className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-white font-semibold">••••••</p>
                          <button
                            onClick={() => toggleBalanceVisibility(account.id)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditAccount(account)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteAccountMutation.mutate(account.id)}
                      className="border-red-600 text-red-400 hover:bg-red-600/10"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                  {account.isActive && (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Account Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-xl text-white">Create New Trading Account</DialogTitle>
              <DialogDescription className="text-gray-400">
                Set up a new trading account with your prop firm details and risk parameters.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col h-full max-h-[75vh]">
              <div className="flex-1 overflow-y-auto py-4">
                <AccountForm
                  onSubmit={handleCreateAccount}
                  isLoading={createAccountMutation.isPending}
                  onCancel={handleCloseCreateDialog}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Account Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-xl text-white">Edit Trading Account</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update your trading account settings and parameters.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col h-full max-h-[75vh]">
              <div className="flex-1 overflow-y-auto py-4">
                <AccountForm
                  onSubmit={handleUpdateAccount}
                  isLoading={updateAccountMutation.isPending}
                  initialData={editingAccount}
                  onCancel={handleCloseEditDialog}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}