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

  // Calculate EOD trailing drawdown based on highest end-of-day balance
  const dailyDrawdownData = React.useMemo(() => {
    const dailyData = new Map<string, DailyDrawdownSummary>();
    
    // Group trades by date and calculate daily P&L
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
      
      // Calculate unrealized profit drawdown (lost potential from peak)
      if (trade.initialTakeProfit && trade.exitPrice) {
        const potentialProfit = Math.abs(trade.initialTakeProfit - trade.entryPrice) * trade.quantity * 50; // ES point value
        const actualPnL = trade.pnl;
        const unrealizedDrawdown = Math.max(0, potentialProfit - actualPnL);
        dayData.unrealizedProfitDrawdown += unrealizedDrawdown;
      }
    });
    
    // Calculate EOD trailing drawdown properly
    const sortedDays = Array.from(dailyData.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Assume $50,000 starting balance and $2,000 max drawdown (from your documentation example)
    let startingBalance = 50000;
    let maxDrawdownAmount = 2000;
    let highestEodBalance = startingBalance;
    let runningBalance = startingBalance;
    
    sortedDays.forEach(day => {
      runningBalance += day.totalDayPnL;
      
      // Update highest EOD balance if this is a new high
      if (runningBalance > highestEodBalance) {
        highestEodBalance = runningBalance;
      }
      
      // Calculate trailing EOD drawdown (trails the highest EOD balance)
      const trailingEodDrawdown = highestEodBalance - maxDrawdownAmount;
      
      // EOD drawdown violation if current balance falls below trailing drawdown
      day.eodDrawdown = Math.max(0, trailingEodDrawdown - runningBalance);
      
      // Mark if this day failed EOD drawdown rule
      if (runningBalance < trailingEodDrawdown) {
        day.drawdownType = 'eod_violation';
      }
    });
    
    return sortedDays;
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

      {/* EOD Trailing Drawdown Widget */}
      <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center text-sm">
            <Shield className="mr-2 h-4 w-4 text-red-400" />
            EOD Trailing Drawdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-center">
              <div className={`text-2xl font-bold ${eodRisk.color}`}>
                ${totalEodDrawdown.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">Trailing Drawdown Breach</div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <div className="text-red-400 font-medium">
                  {dailyDrawdownData.filter(d => d.drawdownType === 'eod_violation').length}
                </div>
                <div className="text-gray-500">Days Failed</div>
              </div>
              <div className="text-center">
                <div className="text-orange-400 font-medium">
                  {dailyDrawdownData.length > 0 ? (dailyDrawdownData.filter(d => d.drawdownType === 'eod_violation').length / dailyDrawdownData.length * 100).toFixed(0) : 0}%
                </div>
                <div className="text-gray-500">Failure Rate</div>
              </div>
            </div>
            
            <div className={`px-2 py-1 rounded text-xs text-center ${eodRisk.bgColor} ${eodRisk.color}`}>
              {dailyDrawdownData.some(d => d.drawdownType === 'eod_violation') ? 'EOD VIOLATIONS' : 'EOD SAFE'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}