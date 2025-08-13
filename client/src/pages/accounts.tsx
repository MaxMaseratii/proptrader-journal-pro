import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
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
  type: 'demo' | 'live' | 'paper' | 'challenge' | 'funded';
  firm: string;
  startingBalance: number;
  profitTarget: number;
  maxDrawdown: number;
  riskPerTrade: number;
}

// Separate form component to prevent re-renders
const AccountForm = React.memo(({ 
  onSubmit, 
  isLoading, 
  initialData = null,
  onCancel 
}: {
  onSubmit: (formData: any) => void;
  isLoading: boolean;
  initialData?: Account | null;
  onCancel: () => void;
}) => {
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
          <div className="grid grid-cols-3 gap-4">
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
            </div>

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
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-white">Risk-Reward Ratio</Label>
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
          </div>

          <div>
            <Label className="text-white">Stop Loss (pips/points)</Label>
            <Input 
              type="number" 
              placeholder="20" 
              className="bg-gray-800 border-gray-600 text-white mt-1"
              value={formData.stopLoss}
              onChange={(e) => handleInputChange('stopLoss', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-white">Primary Asset</Label>
              <Input 
                placeholder="e.g., EURUSD, NQ, ES" 
                className="bg-gray-800 border-gray-600 text-white mt-1"
                value={formData.primaryAsset}
                onChange={(e) => handleInputChange('primaryAsset', e.target.value)}
              />
            </div>

            <div>
              <Label className="text-white">Secondary Asset</Label>
              <Input 
                placeholder="e.g., GBPUSD, YM" 
                className="bg-gray-800 border-gray-600 text-white mt-1"
                value={formData.secondaryAsset}
                onChange={(e) => handleInputChange('secondaryAsset', e.target.value)}
              />
            </div>

            <div>
              <Label className="text-white">Tertiary Asset</Label>
              <Input 
                placeholder="e.g., USDJPY, RTY" 
                className="bg-gray-800 border-gray-600 text-white mt-1"
                value={formData.tertiaryAsset}
                onChange={(e) => handleInputChange('tertiaryAsset', e.target.value)}
              />
            </div>
          </div>

          {/* Personal Trading Time Section */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-yellow-400 mb-4">Personal Trading Time</h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Time Slot 1 Start</Label>
                  <Input 
                    type="time" 
                    className="bg-gray-800 border-gray-600 text-white mt-1"
                    value={formData.timeSlot1Start}
                    onChange={(e) => handleInputChange('timeSlot1Start', e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-white">Time Slot 1 End</Label>
                  <Input 
                    type="time" 
                    className="bg-gray-800 border-gray-600 text-white mt-1"
                    value={formData.timeSlot1End}
                    onChange={(e) => handleInputChange('timeSlot1End', e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-white">Timezone</Label>
                  <select 
                    className="w-full mt-1 bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2"
                    value={formData.timeSlot1Timezone}
                    onChange={(e) => handleInputChange('timeSlot1Timezone', e.target.value)}
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">EST</option>
                    <option value="PST">PST</option>
                    <option value="GMT">GMT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Time Slot 2 Start</Label>
                  <Input 
                    type="time" 
                    className="bg-gray-800 border-gray-600 text-white mt-1"
                    value={formData.timeSlot2Start}
                    onChange={(e) => handleInputChange('timeSlot2Start', e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-white">Time Slot 2 End</Label>
                  <Input 
                    type="time" 
                    className="bg-gray-800 border-gray-600 text-white mt-1"
                    value={formData.timeSlot2End}
                    onChange={(e) => handleInputChange('timeSlot2End', e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-white">Timezone</Label>
                  <select 
                    className="w-full mt-1 bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2"
                    value={formData.timeSlot2Timezone}
                    onChange={(e) => handleInputChange('timeSlot2Timezone', e.target.value)}
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">EST</option>
                    <option value="PST">PST</option>
                    <option value="GMT">GMT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Time Slot 3 Start</Label>
                  <Input 
                    type="time" 
                    className="bg-gray-800 border-gray-600 text-white mt-1"
                    value={formData.timeSlot3Start}
                    onChange={(e) => handleInputChange('timeSlot3Start', e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-white">Time Slot 3 End</Label>
                  <Input 
                    type="time" 
                    className="bg-gray-800 border-gray-600 text-white mt-1"
                    value={formData.timeSlot3End}
                    onChange={(e) => handleInputChange('timeSlot3End', e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-white">Timezone</Label>
                  <select 
                    className="w-full mt-1 bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2"
                    value={formData.timeSlot3Timezone}
                    onChange={(e) => handleInputChange('timeSlot3Timezone', e.target.value)}
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">EST</option>
                    <option value="PST">PST</option>
                    <option value="GMT">GMT</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Fields */}
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Daily Working Hours</Label>
                <Input 
                  type="number" 
                  step="0.5"
                  placeholder="8.0" 
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                  value={formData.dailyWorkingHours}
                  onChange={(e) => handleInputChange('dailyWorkingHours', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label className="text-white">Hourly Wages ($)</Label>
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="25.00" 
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

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
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
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
        >
          {isLoading ? 'Creating...' : initialData ? 'Update Account' : 'Create Account'}
        </Button>
      </div>
    </div>
  );
});

// Memoized Account Card Component to prevent re-renders
const AccountCard = React.memo(({ 
  account, 
  onEdit, 
  onDelete, 
  isDeleting 
}: {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}) => {
  return (
    <Card className="bg-gray-900 border-gray-700 hover:border-yellow-500 transition-colors">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          {account.name}
          <Badge variant={account.type === 'funded' ? 'default' : 'secondary'}>
            {account.type}
          </Badge>
        </CardTitle>
        <div className="text-sm text-gray-400">{account.firm}</div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Starting Balance:</span>
            <span className="text-green-400">${account.startingBalance.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Profit Target:</span>
            <span className="text-blue-400">${account.profitTarget.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Max Drawdown:</span>
            <span className="text-red-400">${account.maxDrawdown.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Risk Per Trade:</span>
            <span className="text-yellow-400">${account.riskPerTrade}</span>
          </div>
        </div>
        
        <div className="flex space-x-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(account)}
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(account.id)}
            className="border-red-600 text-red-400 hover:bg-red-600/20"
            disabled={isDeleting}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

export default React.memo(function AccountsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  // Load accounts on mount
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const response = await fetch('/api/accounts');
        if (response.ok) {
          const data = await response.json();
          setAccounts(data);
        }
      } catch (error) {
        console.error('Failed to load accounts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAccounts();
  }, []);

  const handleCreateSubmit = useCallback(async (formData: any) => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          firm: formData.firm,
          type: formData.type,
          startingBalance: formData.startingBalance,
          profitTarget: formData.profitTarget,
          maxDrawdown: formData.maxDrawdown,
          riskPerTrade: formData.riskPerTrade
        }),
      });
      
      if (response.ok) {
        const newAccount = await response.json();
        setAccounts(prev => [...prev, newAccount]);
        setShowCreateDialog(false);
      }
    } catch (error) {
      console.error('Failed to create account:', error);
    } finally {
      setIsCreating(false);
    }
  }, []);

  const handleEditSubmit = useCallback(async (formData: any) => {
    if (!editingAccount) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/accounts/${editingAccount.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          firm: formData.firm,
          type: formData.type,
          startingBalance: formData.startingBalance,
          profitTarget: formData.profitTarget,
          maxDrawdown: formData.maxDrawdown,
          riskPerTrade: formData.riskPerTrade
        }),
      });
      
      if (response.ok) {
        const updatedAccount = await response.json();
        setAccounts(prev => prev.map(acc => 
          acc.id === editingAccount.id ? updatedAccount : acc
        ));
        setShowEditDialog(false);
        setEditingAccount(null);
      }
    } catch (error) {
      console.error('Failed to update account:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [editingAccount]);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('Delete this account? This cannot be undone.')) return;
    
    setDeletingIds(prev => new Set([...prev, id]));
    try {
      const response = await fetch(`/api/accounts/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setAccounts(prev => prev.filter(acc => acc.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(id);
        return newSet;
      });
    }
  }, []);

  const openEditDialog = useCallback((account: Account) => {
    setEditingAccount(account);
    setShowEditDialog(true);
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-rainbow">Account Management</h1>
          <p className="text-gray-400 mt-2">Manage your trading accounts and monitor performance</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-semibold"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-yellow-400 text-2xl">Create New Trading Account</DialogTitle>
              <DialogDescription className="text-gray-300">
                Fill out the complete form to create your new trading account with all necessary details.
              </DialogDescription>
            </DialogHeader>
            
            <AccountForm
              onSubmit={handleCreateSubmit}
              isLoading={isCreating}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-xl text-gray-400">Loading accounts...</div>
        </div>
      ) : accounts.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Wallet className="mx-auto h-16 w-16 text-gray-500 mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">No Trading Accounts</h3>
            <p className="text-gray-500 mb-4">Create your first trading account to start tracking performance</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={openEditDialog}
              onDelete={handleDelete}
              isDeleting={deletingIds.has(account.id)}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-yellow-400 text-2xl">Edit Trading Account</DialogTitle>
            <DialogDescription className="text-gray-300">
              Update your trading account details and configuration.
            </DialogDescription>
          </DialogHeader>
          
          <AccountForm
            onSubmit={handleEditSubmit}
            isLoading={isUpdating}
            initialData={editingAccount}
            onCancel={() => {
              setShowEditDialog(false);
              setEditingAccount(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
});