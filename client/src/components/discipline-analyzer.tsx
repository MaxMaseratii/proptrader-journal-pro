import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import type { Account, Trade } from "@shared/schema";
import { 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Brain,
  Clock,
  Award,
  CheckCircle,
  XCircle,
  Activity,
  BarChart3,
  Calculator,
  TrendingDown,
  DollarSign,
  Database
} from "lucide-react";

interface DisciplineMetrics {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  maxDrawdown: number;
  disciplineScore: number;
  riskManagementScore: number;
  emotionalControlScore: number;
  consistencyScore: number;
  stopLossRespect: number;
  takeProfitHits: number;
  overRiskedTrades: number;
  revengeTrading: number;
  bestTrade: Trade | null;
  worstTrade: Trade | null;
  recommendations: string[];
}

export default function DisciplineAnalyzer() {
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [disciplineData, setDisciplineData] = useState<DisciplineMetrics | null>(null);
  const { toast } = useToast();

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: trades = [] } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

  // Filter trades based on selected account
  const filteredTrades = selectedAccount === "all" 
    ? trades 
    : trades.filter(trade => trade.accountId === parseInt(selectedAccount));

  // Calculate discipline metrics from existing trades
  const calculateDisciplineMetrics = (tradeData: Trade[]): DisciplineMetrics => {
    if (tradeData.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        profitFactor: 0,
        avgWin: 0,
        avgLoss: 0,
        maxDrawdown: 0,
        disciplineScore: 0,
        riskManagementScore: 0,
        emotionalControlScore: 0,
        consistencyScore: 0,
        stopLossRespect: 0,
        takeProfitHits: 0,
        overRiskedTrades: 0,
        revengeTrading: 0,
        bestTrade: null,
        worstTrade: null,
        recommendations: []
      };
    }

    const totalTrades = tradeData.length;
    const winningTrades = tradeData.filter(t => (t.pnl || 0) > 0);
    const losingTrades = tradeData.filter(t => (t.pnl || 0) < 0);
    const winRate = winningTrades.length / totalTrades;
    
    const totalWins = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0));
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 0;
    
    const avgWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;
    
    // Calculate max drawdown
    let runningPnL = 0;
    let peak = 0;
    let maxDrawdown = 0;
    
    tradeData.forEach(trade => {
      runningPnL += trade.pnl || 0;
      if (runningPnL > peak) peak = runningPnL;
      const drawdown = peak - runningPnL;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    // Analysis of discipline factors
    const stopLossHits = tradeData.filter(t => t.notes?.includes("HIT STOP")).length;
    const takeProfitHits = tradeData.filter(t => t.notes?.includes("HIT TARGET")).length;
    const stopLossRespect = stopLossHits / Math.max(losingTrades.length, 1);
    
    // Risk management analysis
    const overRiskedTrades = tradeData.filter(t => {
      const riskAmount = Math.abs((t.entryPrice || 0) - (t.initialStopLoss || 0)) * (t.quantity || 1);
      return riskAmount > 1000; // Assuming $1000 as high risk threshold
    }).length;
    
    // Revenge trading detection (consecutive losses followed by larger position)
    let revengeTrading = 0;
    for (let i = 1; i < tradeData.length; i++) {
      const prevTrade = tradeData[i - 1];
      const currTrade = tradeData[i];
      if ((prevTrade.pnl || 0) < 0 && (currTrade.quantity || 0) > (prevTrade.quantity || 0) * 1.5) {
        revengeTrading++;
      }
    }

    // Calculate component scores
    const riskManagementScore = Math.max(0, 100 - (overRiskedTrades / totalTrades) * 100);
    const emotionalControlScore = Math.max(0, 100 - (revengeTrading / totalTrades) * 200);
    const consistencyScore = winRate * 100;
    const disciplineScore = (riskManagementScore + emotionalControlScore + consistencyScore) / 3;

    // Generate recommendations
    const recommendations = [];
    if (winRate < 0.5) recommendations.push("Focus on improving trade selection and entry timing");
    if (profitFactor < 1.5) recommendations.push("Work on risk-reward ratios and profit targets");
    if (overRiskedTrades > totalTrades * 0.1) recommendations.push("Reduce position sizes to manage risk better");
    if (revengeTrading > 0) recommendations.push("Implement cooling-off periods after losses");
    if (stopLossRespect < 0.8) recommendations.push("Improve stop loss discipline and respect exit levels");

    const bestTrade = tradeData.reduce((best, current) => 
      (current.pnl || 0) > (best?.pnl || 0) ? current : best, tradeData[0]);
    const worstTrade = tradeData.reduce((worst, current) => 
      (current.pnl || 0) < (worst?.pnl || 0) ? current : worst, tradeData[0]);

    return {
      totalTrades,
      winRate,
      profitFactor,
      avgWin,
      avgLoss,
      maxDrawdown,
      disciplineScore,
      riskManagementScore,
      emotionalControlScore,
      consistencyScore,
      stopLossRespect,
      takeProfitHits,
      overRiskedTrades,
      revengeTrading,
      bestTrade,
      worstTrade,
      recommendations
    };
  };

  const analyzeTrading = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate analysis processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const metrics = calculateDisciplineMetrics(filteredTrades);
      setDisciplineData(metrics);
      
      toast({
        title: "Analysis Complete",
        description: `Analyzed ${metrics.totalTrades} trades with discipline score of ${metrics.disciplineScore.toFixed(1)}`,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Could not analyze trading data",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (filteredTrades.length > 0) {
      analyzeTrading();
    }
  }, [selectedAccount, filteredTrades]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      {/* Account Selection */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-400" />
            Account Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select account to analyze" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Accounts</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name} ({account.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={analyzeTrading} 
              disabled={isAnalyzing || filteredTrades.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAnalyzing ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze Trading
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {filteredTrades.length === 0 ? (
        <Alert className="bg-gray-800 border-gray-700">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No trades found for the selected account. Import your trading data first to perform discipline analysis.
          </AlertDescription>
        </Alert>
      ) : disciplineData ? (
        <div className="space-y-6">
          {/* Discipline Score Overview */}
          <Card className="bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-400" />
                Overall Discipline Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(disciplineData.disciplineScore)}`}>
                    {disciplineData.disciplineScore.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-400">out of 100</div>
                </div>
                <div className="flex-1">
                  <Progress 
                    value={disciplineData.disciplineScore} 
                    className="h-3"
                  />
                  <div className="mt-2 text-sm text-gray-400">
                    Based on {disciplineData.totalTrades} trades
                  </div>
                </div>
                <Badge variant={getScoreBadgeVariant(disciplineData.disciplineScore)}>
                  {disciplineData.disciplineScore >= 80 ? "Excellent" :
                   disciplineData.disciplineScore >= 60 ? "Good" : "Needs Improvement"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Component Scores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-400" />
                  Risk Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(disciplineData.riskManagementScore)}`}>
                  {disciplineData.riskManagementScore.toFixed(1)}
                </div>
                <Progress value={disciplineData.riskManagementScore} className="mt-2 h-2" />
                <div className="mt-2 text-xs text-gray-400">
                  {disciplineData.overRiskedTrades} over-risked trades
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-400" />
                  Emotional Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(disciplineData.emotionalControlScore)}`}>
                  {disciplineData.emotionalControlScore.toFixed(1)}
                </div>
                <Progress value={disciplineData.emotionalControlScore} className="mt-2 h-2" />
                <div className="mt-2 text-xs text-gray-400">
                  {disciplineData.revengeTrading} revenge trades detected
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-400" />
                  Consistency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(disciplineData.consistencyScore)}`}>
                  {disciplineData.consistencyScore.toFixed(1)}
                </div>
                <Progress value={disciplineData.consistencyScore} className="mt-2 h-2" />
                <div className="mt-2 text-xs text-gray-400">
                  {formatPercentage(disciplineData.winRate)} win rate
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trading Statistics */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-yellow-400" />
                Trading Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{disciplineData.totalTrades}</div>
                  <div className="text-sm text-gray-400">Total Trades</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{formatPercentage(disciplineData.winRate)}</div>
                  <div className="text-sm text-gray-400">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{disciplineData.profitFactor.toFixed(2)}</div>
                  <div className="text-sm text-gray-400">Profit Factor</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{formatCurrency(disciplineData.maxDrawdown)}</div>
                  <div className="text-sm text-gray-400">Max Drawdown</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {disciplineData.recommendations.length > 0 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {disciplineData.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">
              Select an account and click "Analyze Trading" to view your discipline metrics
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}