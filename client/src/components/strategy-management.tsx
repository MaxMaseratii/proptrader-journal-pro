import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { apiRequest } from '@/lib/queryClient';
import StrategyForm from './strategy-form';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Target, 
  TrendingUp, 
  DollarSign, 
  BarChart3,
  Clock,
  Zap,
  Brain,
  Shield,
  AlertTriangle,
  CheckCircle,
  MoreVertical
} from 'lucide-react';
import type { TradingStrategy } from '@shared/schema';



interface StrategyManagementProps {
  editStrategyId?: number | null;
  onStrategyUpdated?: () => void;
}

const StrategyManagement: React.FC<StrategyManagementProps> = ({ editStrategyId, onStrategyUpdated }) => {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<TradingStrategy | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [strategyToDelete, setStrategyToDelete] = useState<TradingStrategy | null>(null);

  // Data queries
  const { data: strategies, isLoading } = useQuery<TradingStrategy[]>({
    queryKey: ['/api/strategies'],
  });

  // Mutations
  const deleteStrategyMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/strategies/${id}`, 'DELETE'),
    onSuccess: () => {
      console.log('Strategy deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['/api/strategies'] });
    },
    onError: (error: any) => {
      console.error('Failed to delete strategy:', error);
      // Check for our custom error message from the backend
      const errorMessage = error?.message || error?.response?.data?.message || '';
      // We'll handle errors with the toast system instead of alerts for better UX
    },
  });

  const calculateExpectedValue = (winRate: number, rr: number, riskAmount: number) => {
    const winRateDecimal = winRate / 100;
    const lossRateDecimal = 1 - winRateDecimal;
    const expectedValue = (winRateDecimal * rr - lossRateDecimal) * riskAmount;
    return expectedValue;
  };

  const openEditDialog = (strategy: TradingStrategy) => {
    setEditingStrategy(strategy);
    setIsEditDialogOpen(true);
  };

  const confirmDelete = (strategy: TradingStrategy) => {
    console.log('Delete button clicked for strategy:', strategy.name, 'ID:', strategy.id);
    setStrategyToDelete(strategy);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (strategyToDelete) {
      console.log('User confirmed deletion, calling mutation');
      deleteStrategyMutation.mutate(strategyToDelete.id);
      setDeleteDialogOpen(false);
      setStrategyToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    console.log('User cancelled deletion');
    setDeleteDialogOpen(false);
    setStrategyToDelete(null);
  };

  // Effect to handle external edit request
  useEffect(() => {
    if (editStrategyId && strategies) {
      const strategyToEdit = strategies.find(s => s.id === editStrategyId);
      if (strategyToEdit) {
        openEditDialog(strategyToEdit);
      }
    }
  }, [editStrategyId, strategies]);

  const getStrategyPerformanceColor = (expectedValue: number) => {
    if (expectedValue > 20) return 'text-green-400';
    if (expectedValue > 0) return 'text-yellow-400';
    return 'text-red-400';
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-white">Loading strategies...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-yellow-400">Trading Strategies</h2>
          <p className="text-gray-300">Manage your trading strategies with risk calculations</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
              <Plus className="w-4 h-4 mr-2" />
              Create Strategy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-yellow-400">Create New Trading Strategy</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a new trading strategy with rules, risk management, and performance targets.
              </DialogDescription>
            </DialogHeader>
            <StrategyForm 
              onClose={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies?.map((strategy) => {
          const expectedValue = strategy.expectedValue || calculateExpectedValue(
            strategy.expectedWinRate || 50,
            strategy.riskRewardRatio || 2,
            strategy.riskAmountUsd || 100
          );
          
          return (
            <Card key={strategy.id} className="bg-gray-800 border-gray-700 hover:border-yellow-400/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">{strategy.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={strategy.isActive ? "default" : "secondary"} className="text-xs">
                      {strategy.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-yellow-400"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                        <DropdownMenuItem 
                          onClick={() => openEditDialog(strategy)}
                          className="text-gray-300 hover:text-yellow-400 hover:bg-gray-700"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Modify
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => confirmDelete(strategy)}
                          className="text-gray-300 hover:text-red-400 hover:bg-gray-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                {strategy.description && (
                  <p className="text-sm text-gray-400">{strategy.description}</p>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-gray-700 rounded">
                    <div className="text-white font-bold">${strategy.riskAmountUsd || 100}</div>
                    <div className="text-xs text-gray-400">Risk Amount</div>
                  </div>
                  <div className="text-center p-2 bg-gray-700 rounded">
                    <div className="text-white font-bold">1:{strategy.riskRewardRatio || 2}</div>
                    <div className="text-xs text-gray-400">Risk:Reward</div>
                  </div>
                  <div className="text-center p-2 bg-gray-700 rounded">
                    <div className="text-white font-bold">{strategy.expectedWinRate || 50}%</div>
                    <div className="text-xs text-gray-400">Win Rate</div>
                  </div>
                  <div className="text-center p-2 bg-gray-700 rounded">
                    <div className={`font-bold ${getStrategyPerformanceColor(expectedValue)}`}>
                      ${expectedValue.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400">Expected Value</div>
                  </div>
                </div>

                {/* Trading Rules Preview */}
                {Array.isArray(strategy.rules) && strategy.rules.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-300 mb-2">Rules:</div>
                    <div className="space-y-1">
                      {strategy.rules.slice(0, 3).map((rule, index) => (
                        <div key={index} className="text-xs text-gray-400 flex items-start gap-1">
                          <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                          {rule}
                        </div>
                      ))}
                      {strategy.rules.length > 3 && (
                        <div className="text-xs text-gray-500">+{strategy.rules.length - 3} more rules</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Trading Assets */}
                {Array.isArray(strategy.tradingAssets) && strategy.tradingAssets.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-300 mb-2">Assets:</div>
                    <div className="flex flex-wrap gap-1">
                      {strategy.tradingAssets.slice(0, 3).map((asset) => (
                        <Badge key={asset} variant="outline" className="text-xs border-yellow-400/50 text-yellow-400">
                          {asset}
                        </Badge>
                      ))}
                      {strategy.tradingAssets.length > 3 && (
                        <Badge variant="outline" className="text-xs border-gray-500 text-gray-500">
                          +{strategy.tradingAssets.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(!strategies || strategies.length === 0) && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="text-center py-12">
            <Target className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Trading Strategies</h3>
            <p className="text-gray-400 mb-6">Create your first trading strategy to get started with daily planning.</p>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Strategy
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl bg-gray-800 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-yellow-400">Create New Trading Strategy</DialogTitle>
                </DialogHeader>
                <StrategyForm 
                  onClose={() => setIsCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Edit Strategy Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-yellow-400">Edit Trading Strategy</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update your trading strategy configuration and rules.
            </DialogDescription>
          </DialogHeader>
          <StrategyForm 
            onClose={() => {
              setIsEditDialogOpen(false);
              setEditingStrategy(null);
              onStrategyUpdated?.();
            }}
            editStrategy={editingStrategy}
          />
        </DialogContent>
      </Dialog>

      {/* Professional Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-700 max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-500/10 rounded-full">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <AlertDialogTitle className="text-white text-lg">
                Delete Strategy Confirmation
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-300 space-y-3">
              <div>
                <span className="text-gray-400">Strategy:</span> 
                <span className="text-white font-medium ml-1">"{strategyToDelete?.name}"</span>
              </div>
              
              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="text-yellow-400 font-medium mb-1">WARNING: This action cannot be undone!</div>
                  <div className="text-gray-300">Are you sure you want to permanently delete this strategy?</div>
                </div>
              </div>
              
              <div className="text-sm text-gray-400 bg-gray-800/50 p-3 rounded border border-gray-700">
                <strong>Note:</strong> If this strategy is being used in daily plans, you'll need to delete those plans first.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel 
              onClick={handleDeleteCancel}
              className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Strategy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StrategyManagement;