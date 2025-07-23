import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Account, Trade } from '@shared/schema';

interface TargetProgressWidgetProps {
  accounts: Account[];
  trades: Trade[];
  selectedAccountIds: number[];
}

export default function TargetProgressWidget({ accounts, trades, selectedAccountIds }: TargetProgressWidgetProps) {
  // Filter accounts based on selection
  const filteredAccounts = selectedAccountIds.length > 0 
    ? accounts.filter(acc => selectedAccountIds.includes(acc.id))
    : accounts;

  // Filter trades based on account selection
  const filteredTrades = trades.filter(trade => 
    selectedAccountIds.length === 0 || selectedAccountIds.includes(trade.accountId)
  );

  // Calculate aggregated data
  const totalStartingBalance = filteredAccounts.reduce((sum, acc) => sum + (acc.startingBalance || 0), 0);
  const totalProfitTarget = filteredAccounts.reduce((sum, acc) => sum + (acc.profitTarget || 0), 0);
  const totalMaxDrawdown = filteredAccounts.reduce((sum, acc) => sum + (acc.maxDrawdown || 0), 0);
  
  // Calculate current P&L from trades
  const totalCurrentPnL = filteredTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const currentBalance = totalStartingBalance + totalCurrentPnL;
  
  // Calculate progress percentages
  const targetProgress = totalProfitTarget > 0 ? (totalCurrentPnL / totalProfitTarget) * 100 : 0;
  const drawdownUsed = totalMaxDrawdown > 0 ? (Math.abs(Math.min(0, totalCurrentPnL)) / totalMaxDrawdown) * 100 : 0;
  
  // Determine status
  const isInProfit = totalCurrentPnL > 0;
  const isTargetReached = totalCurrentPnL >= totalProfitTarget;
  const isInDanger = drawdownUsed > 80;
  
  // Get consistency rule info (average across accounts)
  const avgConsistencyRule = filteredAccounts.length > 0 
    ? filteredAccounts.reduce((sum, acc) => sum + (acc.consistencyRulePercent || 50), 0) / filteredAccounts.length
    : 50;
  
  const maxDailyProfit = (totalProfitTarget * avgConsistencyRule) / 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Target Progress Widget */}
      <Card className="bg-gradient-to-br from-gray-900/40 via-gray-800/60 to-black/80 border border-gray-600/30 hover:border-amber-400/60 transition-all duration-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            <Target className="mr-2 h-5 w-5 text-amber-400" />
            Target Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Current P&L</span>
            <span className={`text-lg font-bold ${isInProfit ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(totalCurrentPnL)}
            </span>
          </div>
          
          {/* Target Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Progress to Target</span>
              <span className="text-sm text-gray-400">
                {formatCurrency(totalCurrentPnL)} / {formatCurrency(totalProfitTarget)}
              </span>
            </div>
            <Progress 
              value={Math.max(0, Math.min(100, targetProgress))} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{targetProgress.toFixed(1)}% Complete</span>
              <span>{formatCurrency(totalProfitTarget - totalCurrentPnL)} Remaining</span>
            </div>
          </div>

          {/* Account Balance */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-700">
            <span className="text-sm text-gray-300">Account Balance</span>
            <span className="text-lg font-bold text-white">
              {formatCurrency(currentBalance)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Risk Status Widget */}
      <Card className="bg-gradient-to-br from-gray-900/40 via-gray-800/60 to-black/80 border border-gray-600/30 hover:border-amber-400/60 transition-all duration-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-yellow-400" />
            Risk Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drawdown Usage */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Drawdown Used</span>
              <span className={`text-sm font-bold ${isInDanger ? 'text-red-400' : drawdownUsed > 50 ? 'text-yellow-400' : 'text-green-400'}`}>
                {drawdownUsed.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={Math.max(0, Math.min(100, drawdownUsed))} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{formatCurrency(Math.abs(Math.min(0, totalCurrentPnL)))} Used</span>
              <span>{formatCurrency(totalMaxDrawdown)} Limit</span>
            </div>
          </div>

          {/* Consistency Rule */}
          <div className="space-y-2 pt-2 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Daily Limit ({avgConsistencyRule}%)</span>
              <span className="text-sm font-bold text-yellow-400">
                {formatCurrency(maxDailyProfit)}
              </span>
            </div>
            <div className="text-xs text-gray-400">
              Max profit per day to maintain consistency
            </div>
          </div>

          {/* Status Indicator */}
          <div className={`flex items-center space-x-2 p-2 rounded-lg ${
            isTargetReached ? 'bg-green-900/30 border border-green-500/30' :
            isInDanger ? 'bg-red-900/30 border border-red-500/30' :
            'bg-gray-800/30 border border-gray-600/30'
          }`}>
            {isTargetReached ? (
              <TrendingUp className="h-4 w-4 text-green-400" />
            ) : isInDanger ? (
              <TrendingDown className="h-4 w-4 text-red-400" />
            ) : (
              <Target className="h-4 w-4 text-yellow-400" />
            )}
            <span className={`text-sm font-medium ${
              isTargetReached ? 'text-green-400' :
              isInDanger ? 'text-red-400' :
              'text-yellow-400'
            }`}>
              {isTargetReached ? 'Target Reached!' :
               isInDanger ? 'High Risk Zone' :
               'Active Trading'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}