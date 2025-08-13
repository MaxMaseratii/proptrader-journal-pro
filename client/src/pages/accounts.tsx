import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Plus, Wallet, Edit, Trash2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Account {
  id: number;
  name: string;
  type: 'demo' | 'live' | 'paper' | 'challenge';
  firm: string;
  startingBalance: number;
  profitTarget: number;
  maxDrawdown: number;
  riskPerTrade: number;
}

export default function AccountsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<'demo' | 'live' | 'paper' | 'challenge'>('demo');
  const [firm, setFirm] = useState('');
  const [startingBalance, setStartingBalance] = useState(10000);
  const [profitTarget, setProfitTarget] = useState(1000);
  const [maxDrawdown, setMaxDrawdown] = useState(500);
  const [riskPerTrade, setRiskPerTrade] = useState(2);

  const queryClient = useQueryClient();

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Account, 'id'>) => {
      return apiRequest('/api/accounts', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      resetForm();
      setShowCreateDialog(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Account) => {
      return apiRequest(`/api/accounts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      resetForm();
      setShowEditDialog(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/accounts/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
    },
  });

  const resetForm = () => {
    setName('');
    setType('demo');
    setFirm('');
    setStartingBalance(10000);
    setProfitTarget(1000);
    setMaxDrawdown(500);
    setRiskPerTrade(2);
    setEditingAccount(null);
  };

  const openEditDialog = (account: Account) => {
    setName(account.name);
    setType(account.type);
    setFirm(account.firm);
    setStartingBalance(account.startingBalance);
    setProfitTarget(account.profitTarget);
    setMaxDrawdown(account.maxDrawdown);
    setRiskPerTrade(account.riskPerTrade);
    setEditingAccount(account);
    setShowEditDialog(true);
  };

  const handleCreate = () => {
    createMutation.mutate({
      name,
      type,
      firm,
      startingBalance,
      profitTarget,
      maxDrawdown,
      riskPerTrade,
    });
  };

  const handleUpdate = () => {
    if (!editingAccount) return;
    updateMutation.mutate({
      id: editingAccount.id,
      name,
      type,
      firm,
      startingBalance,
      profitTarget,
      maxDrawdown,
      riskPerTrade,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-rainbow">Account Management</h1>
          <p className="text-gray-400 mt-2">Manage your trading accounts and monitor performance</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-semibold"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Account
            </Button>
          </DialogTrigger>
          <DialogContent 
            className="max-w-2xl"
            style={{
              backgroundColor: 'black',
              borderColor: '#374151',
              color: 'white',
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-yellow-400 text-xl">Create New Account</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Account Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Main Trading Account"
                    className="bg-white text-black border-gray-300"
                  />
                </div>
                
                <div>
                  <Label className="text-white">Account Type</Label>
                  <Select value={type} onValueChange={(value: any) => setType(value)}>
                    <SelectTrigger className="bg-white text-black border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="demo">Demo</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="paper">Paper Trading</SelectItem>
                      <SelectItem value="challenge">Challenge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-white">Prop Firm / Broker</Label>
                <Input
                  value={firm}
                  onChange={(e) => setFirm(e.target.value)}
                  placeholder="FTMO, TopstepTrader, etc."
                  className="bg-white text-black border-gray-300"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Starting Balance</Label>
                  <Input
                    type="number"
                    value={startingBalance}
                    onChange={(e) => setStartingBalance(Number(e.target.value))}
                    className="bg-white text-black border-gray-300"
                  />
                </div>
                
                <div>
                  <Label className="text-white">Profit Target</Label>
                  <Input
                    type="number"
                    value={profitTarget}
                    onChange={(e) => setProfitTarget(Number(e.target.value))}
                    className="bg-white text-black border-gray-300"
                  />
                </div>
                
                <div>
                  <Label className="text-white">Max Drawdown</Label>
                  <Input
                    type="number"
                    value={maxDrawdown}
                    onChange={(e) => setMaxDrawdown(Number(e.target.value))}
                    className="bg-white text-black border-gray-300"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white">Risk Per Trade (%)</Label>
                <Slider
                  value={[riskPerTrade]}
                  onValueChange={(value) => setRiskPerTrade(value[0])}
                  max={10}
                  min={0.1}
                  step={0.1}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-400 mt-2">
                  {riskPerTrade}% per trade
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setShowCreateDialog(false);
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Account'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {accounts.length === 0 ? (
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
            <Card key={account.id} className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">{account.name}</CardTitle>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{account.type}</span>
                  <span className="text-gray-400">{account.firm}</span>
                </div>
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
                    <span className="text-yellow-400">{account.riskPerTrade}%</span>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(account)}
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm('Delete this account? This cannot be undone.')) {
                        deleteMutation.mutate(account.id);
                      }
                    }}
                    className="border-red-600 text-red-400 hover:bg-red-600/20"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent 
          className="max-w-2xl"
          style={{
            backgroundColor: 'black',
            borderColor: '#374151',
            color: 'white',
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-yellow-400 text-xl">Edit Account</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Account Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white text-black border-gray-300"
                />
              </div>
              
              <div>
                <Label className="text-white">Account Type</Label>
                <Select value={type} onValueChange={(value: any) => setType(value)}>
                  <SelectTrigger className="bg-white text-black border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="demo">Demo</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="paper">Paper Trading</SelectItem>
                    <SelectItem value="challenge">Challenge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-white">Prop Firm / Broker</Label>
              <Input
                value={firm}
                onChange={(e) => setFirm(e.target.value)}
                className="bg-white text-black border-gray-300"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-white">Starting Balance</Label>
                <Input
                  type="number"
                  value={startingBalance}
                  onChange={(e) => setStartingBalance(Number(e.target.value))}
                  className="bg-white text-black border-gray-300"
                />
              </div>
              
              <div>
                <Label className="text-white">Profit Target</Label>
                <Input
                  type="number"
                  value={profitTarget}
                  onChange={(e) => setProfitTarget(Number(e.target.value))}
                  className="bg-white text-black border-gray-300"
                />
              </div>
              
              <div>
                <Label className="text-white">Max Drawdown</Label>
                <Input
                  type="number"
                  value={maxDrawdown}
                  onChange={(e) => setMaxDrawdown(Number(e.target.value))}
                  className="bg-white text-black border-gray-300"
                />
              </div>
            </div>

            <div>
              <Label className="text-white">Risk Per Trade (%)</Label>
              <Slider
                value={[riskPerTrade]}
                onValueChange={(value) => setRiskPerTrade(value[0])}
                max={10}
                min={0.1}
                step={0.1}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-400 mt-2">
                {riskPerTrade}% per trade
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setShowEditDialog(false);
                }}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Account'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}