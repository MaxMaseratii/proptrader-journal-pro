import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Account, Trade } from "@shared/schema";

interface TargetProgressWidgetProps {
  accounts: Account[];
  trades: Trade[];
  selectedAccountIds: number[];
}

export default function TargetProgressWidget({ accounts, trades, selectedAccountIds }: TargetProgressWidgetProps) {
  
  // Filter accounts based on selection
  const filteredAccounts = accounts.filter(account => 
    selectedAccountIds.length === 0 || selectedAccountIds.includes(account.id)
  );

  // If no accounts selected, show placeholder
  if (filteredAccounts.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center text-sm">
            <Target className="mr-2 h-4 w-4 text-blue-400" />
            Target Progress & Account Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 text-sm py-4">
            No accounts selected. Please select accounts to view progress.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate progress for each account
  const accountProgress = filteredAccounts.map(account => {
    const accountTrades = trades.filter(trade => trade.accountId === account.id);
    const totalPnL = accountTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const currentBalance = account.startingBalance + totalPnL;
    const targetBalance = account.startingBalance + account.profitTarget;
    const progressPercentage = Math.min(100, Math.max(0, (totalPnL / account.profitTarget) * 100));
    
    // Determine account status based on balance and rules
    let status = 'active';
    let statusColor = 'text-blue-400';
    let statusIcon = TrendingUp;
    
    if (totalPnL >= account.profitTarget) {
      status = 'Target Reached';
      statusColor = 'text-green-400';
      statusIcon = Target;
    } else if (currentBalance <= (account.startingBalance - account.maxDrawdown)) {
      status = 'Failed';
      statusColor = 'text-red-400';
      statusIcon = TrendingDown;
    } else if (totalPnL < 0) {
      status = 'Drawdown';
      statusColor = 'text-orange-400';
      statusIcon = AlertCircle;
    }

    return {
      ...account,
      totalPnL,
      currentBalance,
      targetBalance,
      progressPercentage,
      status,
      statusColor,
      statusIcon,
      accountTrades: accountTrades.length
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {accountProgress.map((account) => {
        const StatusIcon = account.statusIcon;
        
        return (
          <Card key={account.id} className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Target className="mr-2 h-4 w-4 text-blue-400" />
                  {account.name}
                </div>
                <div className={`flex items-center text-xs ${account.statusColor}`}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {account.status}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white font-medium">{account.progressPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        account.progressPercentage >= 100 ? 'bg-green-500' :
                        account.progressPercentage >= 75 ? 'bg-blue-500' :
                        account.progressPercentage >= 50 ? 'bg-yellow-500' :
                        account.progressPercentage >= 25 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, account.progressPercentage)}%` }}
                    />
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center">
                    <div className={`font-medium ${account.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${account.totalPnL >= 0 ? '+' : ''}${account.totalPnL.toFixed(2)}
                    </div>
                    <div className="text-gray-500">P&L</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-400 font-medium">
                      ${account.currentBalance.toFixed(2)}
                    </div>
                    <div className="text-gray-500">Balance</div>
                  </div>
                </div>

                {/* Target Information */}
                <div className="border-t border-gray-700 pt-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Target:</span>
                    <span className="text-green-400 font-medium">${account.profitTarget.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Remaining:</span>
                    <span className="text-yellow-400 font-medium">
                      ${Math.max(0, account.profitTarget - account.totalPnL).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Trades:</span>
                    <span className="text-blue-400 font-medium">{account.accountTrades}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}