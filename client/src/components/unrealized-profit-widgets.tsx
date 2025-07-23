import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertTriangle, Shield } from "lucide-react";
import { Trade, DailyDrawdownSummary } from "@shared/schema";

interface UnrealizedProfitWidgetsProps {
  trades: Trade[];
  selectedAccountIds: number[];
}

export default function UnrealizedProfitWidgets({ trades, selectedAccountIds }: UnrealizedProfitWidgetsProps) {
  
  // Filter trades based on selected accounts
  const filteredTrades = trades.filter(trade => 
    selectedAccountIds.length === 0 || selectedAccountIds.includes(trade.accountId)
  );

  // Calculate daily drawdown data
  const dailyDrawdownData = React.useMemo(() => {
    const dailyData = new Map<string, DailyDrawdownSummary>();
    
    filteredTrades.forEach(trade => {
      const dateKey = trade.date;
      if (!dailyData.has(dateKey)) {
        dailyData.set(dateKey, {
          date: dateKey,
          eodDrawdown: 0,
          unrealizedProfitDrawdown: 0,
          drawdownType: null,
          consistencyRuleViolation: false,
          bestTradeProfit: 0,
          totalDayPnL: 0
        });
      }
      
      const dayData = dailyData.get(dateKey)!;
      dayData.totalDayPnL += trade.pnl;
      
      // Track best trade profit for consistency rule
      if (trade.pnl > dayData.bestTradeProfit) {
        dayData.bestTradeProfit = trade.pnl;
      }
      
      // Calculate unrealized profit drawdown (from peak unrealized to actual close)
      if (trade.initialTakeProfit && trade.exitPrice) {
        const potentialProfit = Math.abs(trade.initialTakeProfit - trade.entryPrice) * trade.quantity;
        const actualPnL = trade.pnl;
        const unrealizedDrawdown = Math.max(0, potentialProfit - actualPnL);
        dayData.unrealizedProfitDrawdown += unrealizedDrawdown;
      }
      
      // End of day drawdown (negative P&L)
      if (trade.pnl < 0) {
        dayData.eodDrawdown += Math.abs(trade.pnl);
      }
    });
    
    return Array.from(dailyData.values());
  }, [filteredTrades]);

  // Calculate total unrealized profit metrics
  const totalUnrealizedDrawdown = dailyDrawdownData.reduce((sum, day) => sum + day.unrealizedProfitDrawdown, 0);
  const totalEodDrawdown = dailyDrawdownData.reduce((sum, day) => sum + day.eodDrawdown, 0);
  const avgDailyUnrealizedDrawdown = dailyDrawdownData.length > 0 ? totalUnrealizedDrawdown / dailyDrawdownData.length : 0;
  const maxSingleDayUnrealizedDrawdown = Math.max(...dailyDrawdownData.map(day => day.unrealizedProfitDrawdown), 0);

  // Determine risk level based on unrealized drawdown
  const getDrawdownRiskLevel = (drawdown: number) => {
    if (drawdown === 0) return { level: 'safe', color: 'text-green-400', bgColor: 'bg-green-500/20' };
    if (drawdown < 500) return { level: 'low', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
    if (drawdown < 1000) return { level: 'moderate', color: 'text-orange-400', bgColor: 'bg-orange-500/20' };
    return { level: 'high', color: 'text-red-400', bgColor: 'bg-red-500/20' };
  };

  const unrealizedRisk = getDrawdownRiskLevel(totalUnrealizedDrawdown);
  const eodRisk = getDrawdownRiskLevel(totalEodDrawdown);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Unrealized Profit Drawdown Widget */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center text-sm">
            <TrendingDown className="mr-2 h-4 w-4 text-purple-400" />
            Unrealized Profit Drawdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-center">
              <div className={`text-2xl font-bold ${unrealizedRisk.color}`}>
                ${totalUnrealizedDrawdown.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">Total Lost Potential</div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <div className="text-purple-400 font-medium">
                  ${avgDailyUnrealizedDrawdown.toFixed(2)}
                </div>
                <div className="text-gray-500">Daily Avg</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 font-medium">
                  ${maxSingleDayUnrealizedDrawdown.toFixed(2)}
                </div>
                <div className="text-gray-500">Max Day</div>
              </div>
            </div>
            
            <div className={`px-2 py-1 rounded text-xs text-center ${unrealizedRisk.bgColor} ${unrealizedRisk.color}`}>
              {unrealizedRisk.level.toUpperCase()} IMPACT
            </div>
          </div>
        </CardContent>
      </Card>

      {/* End of Day Drawdown Comparison Widget */}
      <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center text-sm">
            <Shield className="mr-2 h-4 w-4 text-red-400" />
            EOD vs Unrealized Drawdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">End of Day</span>
                <span className={`text-sm font-medium ${eodRisk.color}`}>
                  ${totalEodDrawdown.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Unrealized</span>
                <span className={`text-sm font-medium ${unrealizedRisk.color}`}>
                  ${totalUnrealizedDrawdown.toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="border-t border-gray-700 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Total Risk</span>
                <span className="text-lg font-bold text-white">
                  ${(totalEodDrawdown + totalUnrealizedDrawdown).toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="text-xs text-center text-gray-500">
              {totalUnrealizedDrawdown > totalEodDrawdown ? (
                <span className="text-purple-400">
                  <AlertTriangle className="inline h-3 w-3 mr-1" />
                  Unrealized risk dominant
                </span>
              ) : (
                <span className="text-red-400">
                  <TrendingDown className="inline h-3 w-3 mr-1" />
                  EOD losses dominant  
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}