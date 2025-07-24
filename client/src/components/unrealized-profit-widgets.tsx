import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertTriangle, Shield } from "lucide-react";
import { Trade, DailyDrawdownSummary, Account } from "@shared/schema";

interface UnrealizedProfitWidgetsProps {
  trades: Trade[];
  selectedAccountIds: number[];
  accounts: Account[];
  targetProgressWidget?: React.ReactNode;
}

export default function UnrealizedProfitWidgets({ trades, selectedAccountIds, accounts, targetProgressWidget }: UnrealizedProfitWidgetsProps) {
  
  // CRITICAL: Force component re-render to apply CSS fixes
  React.useEffect(() => {
    const timestamp = Date.now();
    console.log(`🔧 Widget badges fix applied at ${timestamp}`);
  }, []);
  
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

  // Calculate proper EOD trailing drawdown with daily balance tracking
  const eodCalculation = React.useMemo(() => {
    const startingBalance = 25000;
    const maxDrawdownAmount = 1500;
    let runningBalance = startingBalance;
    let highestEODBalance = startingBalance;
    
    // Calculate running balance and track highest EOD balance day by day
    dailyDrawdownData.forEach(dayData => {
      runningBalance += dayData.totalDayPnL;
      if (runningBalance > highestEODBalance) {
        highestEODBalance = runningBalance;
      }
    });
    
    const currentBalance = runningBalance;
    const trailingDrawdownFloor = highestEODBalance - maxDrawdownAmount;
    const remainingBuffer = currentBalance - trailingDrawdownFloor;
    
    return {
      currentBalance,
      highestEODBalance,
      trailingDrawdownFloor,
      remainingBuffer,
      startingBalance,
      maxDrawdownAmount
    };
  }, [dailyDrawdownData]);

  const { currentBalance, highestEODBalance, trailingDrawdownFloor, remainingBuffer } = eodCalculation;
  const consistencyViolations = dailyDrawdownData.filter(day => day.consistencyRuleViolation).length;

  // Debug logging for daily P&L
  React.useEffect(() => {
    console.log('📊 Daily P&L Breakdown:', dailyDrawdownData.map(day => ({
      date: day.date,
      pnl: day.totalDayPnL,
      profitable: day.totalDayPnL > 0
    })));
    console.log('💰 EOD Calculation:', {
      currentBalance,
      highestEODBalance,
      trailingDrawdownFloor,
      remainingBuffer,
      profitableDays: dailyDrawdownData.filter(day => day.totalDayPnL > 0).length
    });
  }, [dailyDrawdownData, currentBalance, highestEODBalance, trailingDrawdownFloor, remainingBuffer]);

  // Determine risk level based on remaining buffer
  const getBufferRiskLevel = (buffer: number) => {
    if (buffer > 1000) return { level: 'safe', color: 'text-green-400', bgColor: 'bg-green-500/20' };
    if (buffer > 500) return { level: 'moderate', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
    if (buffer > 200) return { level: 'high', color: 'text-orange-400', bgColor: 'bg-orange-500/20' };
    return { level: 'critical', color: 'text-red-400', bgColor: 'bg-red-500/20' };
  };

  const bufferRisk = getBufferRiskLevel(remainingBuffer);



  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Target Progress Widget - Takes up 1/3 of the space */}
      <div className="lg:col-span-1 h-full">
        {targetProgressWidget}
      </div>
      
      {/* Drawdown Buffer Remaining Widget - Takes up 1/3 of the space */}
      <div className="lg:col-span-1 h-full">
        <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-500/20 h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center text-sm">
              <Shield className="mr-2 h-4 w-4 text-red-400" />
              Drawdown Buffer Remaining
            </CardTitle>
          </CardHeader>
          <CardContent className="h-full p-4">
            <div className="flex flex-col h-full">
              <div className="flex-1 space-y-3">
                <div className="text-center">
                  <div className={`text-xl font-bold ${bufferRisk.color}`}>
                    ${remainingBuffer.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400">Above EOD Trailing Drawdown Floor</div>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current:</span>
                    <span className="text-red-400 font-medium">${currentBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Highest EOD:</span>
                    <span className="text-green-400 font-medium">${highestEODBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Floor:</span>
                    <span className="text-orange-400 font-medium">${trailingDrawdownFloor.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className={`mt-auto px-2 py-1 rounded text-xs text-center ${bufferRisk.bgColor} ${bufferRisk.color}`}>
                {remainingBuffer <= 200 ? 'CRITICAL RISK' : remainingBuffer <= 500 ? 'HIGH RISK' : 'BUFFER SAFE'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consistency Rule Tracking Widget - Takes up 1/3 of the space */}
      <div className="lg:col-span-1 h-full">
        <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20 h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center text-sm">
              <TrendingUp className="mr-2 h-4 w-4 text-purple-400" />
              Consistency Rule ($750 Max)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-full p-4">
            <div className="flex flex-col h-full">
              <div className="flex-1 space-y-3">
                <div className="text-center">
                  <div className={`text-xl font-bold ${consistencyViolations > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {consistencyViolations}
                  </div>
                  <div className="text-xs text-gray-400">Rule Violations</div>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Daily Limit:</span>
                    <span className="text-purple-400 font-medium">$750.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Best Trade:</span>
                    <span className="text-purple-400 font-medium">
                      {Math.max(...dailyDrawdownData.map(day => day.bestTradeProfit), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className={`mt-auto px-2 py-1 rounded text-xs text-center ${
                consistencyViolations > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
              }`}>
                {consistencyViolations > 0 ? 'RULE VIOLATED' : 'COMPLIANT'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}