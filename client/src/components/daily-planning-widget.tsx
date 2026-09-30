import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign,
  BarChart3,
  Clock,
  Activity,
  CheckCircle,
  AlertTriangle,
  PlayCircle,
  PauseCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DailyPlanningWidgetProps {
  trades?: any[];
  selectedAccount?: any;
  dailyPlan?: any;
  className?: string;
}

export function DailyPlanningWidget({ trades = [], selectedAccount, dailyPlan, className }: DailyPlanningWidgetProps) {
  const [isTrading, setIsTrading] = useState(false);
  const [tradingStartTime, setTradingStartTime] = useState<number | null>(null);
  const [currentSessionTime, setCurrentSessionTime] = useState(0);

  // Get today's date
  const today = new Date().toISOString().split('T')[0];
  const todayTrades = trades.filter(trade => trade.date === today);

  // Calculate today's performance
  const todayPnL = todayTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const todayTradesCount = todayTrades.length;
  const todayWins = todayTrades.filter(trade => (trade.pnl || 0) > 0).length;
  const todayLosses = todayTrades.filter(trade => (trade.pnl || 0) < 0).length;
  const todayWinRate = todayTradesCount > 0 ? (todayWins / todayTradesCount * 100) : 0;

  // Daily targets from daily plan or account defaults
  const dailyTarget = dailyPlan?.targetProfit || (selectedAccount ? (selectedAccount.riskPerTrade * selectedAccount.riskRewardRatio) : 450);
  const maxDailyTrades = dailyPlan?.maxTrades || selectedAccount?.maxDailyTrades || 5;
  const dailyRiskLimit = dailyPlan?.riskAmount || selectedAccount?.dailyLossLimit || 1000;

  // Calculate progress
  const targetProgress = Math.min(Math.max((todayPnL / dailyTarget) * 100, 0), 100);
  const tradesProgress = Math.min((todayTradesCount / maxDailyTrades) * 100, 100);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTrading && tradingStartTime) {
      interval = setInterval(() => {
        setCurrentSessionTime(Date.now() - tradingStartTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTrading, tradingStartTime]);

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const startTradingSession = () => {
    setIsTrading(true);
    setTradingStartTime(Date.now());
  };

  const stopTradingSession = () => {
    setIsTrading(false);
    setTradingStartTime(null);
  };

  return (
    <Card className={cn("widget-card", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="widget-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Today's Trading Plan
          </div>
          <div className="flex items-center gap-2">
            {!isTrading ? (
              <Button onClick={startTradingSession} size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                <PlayCircle className="w-3 h-3 mr-1" />
                Start
              </Button>
            ) : (
              <Button onClick={stopTradingSession} size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                <PauseCircle className="w-3 h-3 mr-1" />
                Stop
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Session Timer */}
        {isTrading && (
          <div className="flex items-center gap-2 p-2 bg-green-900/30 border border-green-500 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-500 font-mono text-sm">{formatTime(currentSessionTime)}</span>
          </div>
        )}

        {/* Today's Performance Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 widget-bg border border-prop-gold/10 rounded-lg">
            <div className={cn(
              "text-xl font-bold",
              todayPnL >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {todayPnL >= 0 ? '+' : ''}${todayPnL.toFixed(2)}
            </div>
            <div className="text-xs widget-text opacity-70">Today's P&L</div>
            <div className="text-xs widget-text opacity-50">Target: ${dailyTarget}</div>
          </div>
          <div className="text-center p-3 widget-bg border border-prop-gold/10 rounded-lg">
            <div className="text-xl font-bold widget-text">{todayTradesCount}</div>
            <div className="text-xs widget-text opacity-70">Trades Today</div>
            <div className="text-xs widget-text opacity-50">Max: {maxDailyTrades}</div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="widget-text">Profit Target</span>
              <span className="text-blue-400">{targetProgress.toFixed(1)}%</span>
            </div>
            <Progress value={targetProgress} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="widget-text">Trades Used</span>
              <span className="text-orange-400">{tradesProgress.toFixed(1)}%</span>
            </div>
            <Progress value={tradesProgress} className="h-2" />
          </div>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 widget-bg border border-prop-gold/10 rounded">
            <div className="text-sm font-medium text-green-500">{todayWins}</div>
            <div className="text-xs widget-text opacity-70">Wins</div>
          </div>
          <div className="p-2 widget-bg border border-prop-gold/10 rounded">
            <div className="text-sm font-medium text-red-500">{todayLosses}</div>
            <div className="text-xs widget-text opacity-70">Losses</div>
          </div>
          <div className="p-2 widget-bg border border-prop-gold/10 rounded">
            <div className="text-sm font-medium text-blue-400">{todayWinRate.toFixed(1)}%</div>
            <div className="text-xs widget-text opacity-70">Win Rate</div>
          </div>
        </div>

        {/* Quick Status */}
        <div className="flex items-center justify-between p-2 widget-bg border border-prop-gold/10 rounded-lg">
          <div className="flex items-center gap-2">
            {todayPnL >= dailyTarget ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-orange-400" />
            )}
            <span className="text-sm widget-text">
              {todayPnL >= dailyTarget ? "Target Reached!" : "Working toward target"}
            </span>
          </div>
          <Badge variant={todayPnL >= 0 ? "default" : "destructive"}>
            {todayPnL >= 0 ? "Profitable" : "Down"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default DailyPlanningWidget;