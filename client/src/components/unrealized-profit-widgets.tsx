import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertTriangle, Shield } from "lucide-react";
import { Trade, DailyDrawdownSummary, Account } from "@shared/schema";

interface UnrealizedProfitWidgetsProps {
  trades: Trade[];
  selectedAccountIds: number[];
  accounts: Account[];
}

export default function UnrealizedProfitWidgets({ trades, selectedAccountIds, accounts }: UnrealizedProfitWidgetsProps) {
  
  // Filter trades based on selected accounts
  const filteredTrades = trades.filter(trade => 
    selectedAccountIds.length === 0 || selectedAccountIds.includes(trade.accountId)
  );

  // Calculate EOD drawdown buffer and consistency rule tracking
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
      
      // Track best single trade profit for consistency rule (not daily total)
      if (trade.pnl > dayData.bestTradeProfit) {
        dayData.bestTradeProfit = trade.pnl;
      }
      
      // Check consistency rule violation: best trade > $750 (50% of $1,500 target)
      if (trade.pnl > 750) {
        dayData.consistencyRuleViolation = true;
      }
    });
    
    return Array.from(dailyData.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [filteredTrades]);

  // Calculate actual drawdown buffer and consistency violations
  const totalActualLoss = filteredTrades.reduce((sum, trade) => sum + Math.min(0, trade.pnl), 0); // Only losses
  const maxDrawdownAmount = 1500; // Your actual max drawdown
  const remainingBuffer = maxDrawdownAmount - Math.abs(totalActualLoss);
  const consistencyViolations = dailyDrawdownData.filter(day => day.consistencyRuleViolation).length;

  // Determine risk level based on remaining buffer
  const getBufferRiskLevel = (buffer: number) => {
    if (buffer > 1000) return { level: 'safe', color: 'text-green-400', bgColor: 'bg-green-500/20' };
    if (buffer > 500) return { level: 'moderate', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
    if (buffer > 200) return { level: 'high', color: 'text-orange-400', bgColor: 'bg-orange-500/20' };
    return { level: 'critical', color: 'text-red-400', bgColor: 'bg-red-500/20' };
  };

  const bufferRisk = getBufferRiskLevel(remainingBuffer);

  // Calculate R2$1M account specific data
  const r2m1Account = accounts.find(acc => acc.name === "R2$1M");
  const r2m1Trades = r2m1Account ? filteredTrades.filter(trade => trade.accountId === r2m1Account.id) : [];
  const r2m1TotalPnL = r2m1Trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const r2m1CurrentBalance = r2m1Account ? r2m1Account.startingBalance + r2m1TotalPnL : 0;
  const r2m1DrawdownUsed = r2m1Account ? Math.max(0, r2m1Account.startingBalance - r2m1CurrentBalance) : 0;
  const r2m1DrawdownPercent = r2m1Account ? (r2m1DrawdownUsed / r2m1Account.maxDrawdown) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Drawdown Buffer Remaining Widget */}
      <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center text-sm">
            <Shield className="mr-2 h-4 w-4 text-red-400" />
            Drawdown Buffer Remaining
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-center">
              <div className={`text-2xl font-bold ${bufferRisk.color}`}>
                ${remainingBuffer.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">Left from $1,500 Max Drawdown</div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <div className="text-red-400 font-medium">
                  ${Math.abs(totalActualLoss).toFixed(2)}
                </div>
                <div className="text-gray-500">Total Losses</div>
              </div>
              <div className="text-center">
                <div className="text-orange-400 font-medium">
                  {((Math.abs(totalActualLoss) / maxDrawdownAmount) * 100).toFixed(1)}%
                </div>
                <div className="text-gray-500">Used</div>
              </div>
            </div>
            
            <div className={`px-2 py-1 rounded text-xs text-center ${bufferRisk.bgColor} ${bufferRisk.color}`}>
              {remainingBuffer <= 200 ? 'CRITICAL RISK' : remainingBuffer <= 500 ? 'HIGH RISK' : 'BUFFER SAFE'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consistency Rule Tracking Widget */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center text-sm">
            <TrendingUp className="mr-2 h-4 w-4 text-purple-400" />
            Consistency Rule ($750 Max)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-center">
              <div className={`text-2xl font-bold ${consistencyViolations > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {consistencyViolations}
              </div>
              <div className="text-xs text-gray-400">Rule Violations</div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <div className="text-purple-400 font-medium">
                  $750.00
                </div>
                <div className="text-gray-500">Daily Limit</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 font-medium">
                  {Math.max(...dailyDrawdownData.map(day => day.bestTradeProfit), 0).toFixed(2)}
                </div>
                <div className="text-gray-500">Best Trade</div>
              </div>
            </div>
            
            <div className={`px-2 py-1 rounded text-xs text-center ${
              consistencyViolations > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
            }`}>
              {consistencyViolations > 0 ? 'RULE VIOLATED' : 'COMPLIANT'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* R2$1M Drawdown Widget */}
      <Card className="bg-gradient-to-br from-indigo-900/20 to-blue-900/20 border-indigo-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center text-sm">
            <AlertTriangle className="mr-2 h-4 w-4 text-indigo-400" />
            R2$1M Drawdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                r2m1DrawdownPercent > 80 ? 'text-red-400' : 
                r2m1DrawdownPercent > 60 ? 'text-orange-400' : 
                r2m1DrawdownPercent > 40 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {r2m1DrawdownPercent.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">Max Drawdown Used</div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <div className="text-indigo-400 font-medium">
                  ${r2m1DrawdownUsed.toFixed(2)}
                </div>
                <div className="text-gray-500">Used</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-medium">
                  ${r2m1Account ? (r2m1Account.maxDrawdown - r2m1DrawdownUsed).toFixed(2) : '0.00'}
                </div>
                <div className="text-gray-500">Remaining</div>
              </div>
            </div>
            
            <div className={`px-2 py-1 rounded text-xs text-center ${
              r2m1DrawdownPercent > 80 ? 'bg-red-500/20 text-red-400' : 
              r2m1DrawdownPercent > 60 ? 'bg-orange-500/20 text-orange-400' : 
              r2m1DrawdownPercent > 40 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
            }`}>
              {r2m1DrawdownPercent > 80 ? 'CRITICAL' : 
               r2m1DrawdownPercent > 60 ? 'HIGH RISK' : 
               r2m1DrawdownPercent > 40 ? 'MODERATE' : 'SAFE'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}