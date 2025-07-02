import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Brain,
  Clock,
  Award,
  Eye,
  CheckCircle,
  XCircle,
  Activity,
  BarChart3,
  Calculator,
  Calendar
} from "lucide-react";
import type { Account, Trade } from "@shared/schema";

export default function DisciplineAnalysis() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");
  const [timeframe, setTimeframe] = useState<string>("30");

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: trades = [] } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

  // Filter trades by selected account and timeframe
  const filteredTrades = trades.filter(trade => {
    if (selectedAccountId !== "all" && trade.accountId !== parseInt(selectedAccountId)) return false;
    
    const tradeDate = new Date(trade.date);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeframe));
    
    return tradeDate >= cutoffDate;
  });

  // Calculate discipline metrics
  const disciplineMetrics = {
    totalTrades: filteredTrades.length,
    stopLossHits: filteredTrades.filter(t => t.exitPrice && t.initialStopLoss && Math.abs(t.exitPrice - t.initialStopLoss) < 1).length,
    stopLossMoved: filteredTrades.filter(t => t.finalStopLoss !== t.initialStopLoss).length,
    takeProfitHits: filteredTrades.filter(t => t.exitPrice && t.initialTakeProfit && Math.abs(t.exitPrice - t.initialTakeProfit) < 1).length,
    overRisked: filteredTrades.filter(t => t.riskAmount && (t.riskAmount > 200)).length,
    emotionalTrades: filteredTrades.filter(t => t.notes && t.notes.toLowerCase().includes('emotional')).length,
    consecutiveLosses: calculateConsecutiveLosses(filteredTrades),
    maxDrawdown: calculateMaxDrawdown(filteredTrades),
    disciplineScore: 0
  };

  // Calculate discipline score (0-100)
  if (disciplineMetrics.totalTrades > 0) {
    const stopLossRespect = (disciplineMetrics.stopLossHits / disciplineMetrics.totalTrades) * 25;
    const riskCompliance = ((disciplineMetrics.totalTrades - disciplineMetrics.overRisked) / disciplineMetrics.totalTrades) * 25;
    const emotionalControl = ((disciplineMetrics.totalTrades - disciplineMetrics.emotionalTrades) / disciplineMetrics.totalTrades) * 25;
    const consistencyBonus = disciplineMetrics.consecutiveLosses < 5 ? 25 : Math.max(0, 25 - disciplineMetrics.consecutiveLosses);
    
    disciplineMetrics.disciplineScore = Math.round(stopLossRespect + riskCompliance + emotionalControl + consistencyBonus);
  }

  function calculateConsecutiveLosses(trades: Trade[]): number {
    let maxConsecutive = 0;
    let current = 0;
    
    trades.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    for (const trade of trades) {
      if (trade.pnl < 0) {
        current++;
        maxConsecutive = Math.max(maxConsecutive, current);
      } else {
        current = 0;
      }
    }
    
    return maxConsecutive;
  }

  function calculateMaxDrawdown(trades: Trade[]): number {
    let peak = 0;
    let drawdown = 0;
    let runningPnl = 0;
    
    trades.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    for (const trade of trades) {
      runningPnl += trade.pnl;
      peak = Math.max(peak, runningPnl);
      drawdown = Math.max(drawdown, peak - runningPnl);
    }
    
    return drawdown;
  }

  return (
    <div className="p-6 space-y-8 bg-dark-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-prop-gold to-prop-tiffany bg-clip-text text-transparent">
            Discipline Trading Analysis
          </h1>
          <p className="text-gray-400 mt-2">Comprehensive analysis of your trading discipline and psychological patterns</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-48 bg-dark-card border-gray-600">
              <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent className="bg-dark-card border-gray-600">
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id.toString()}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32 bg-dark-card border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-dark-card border-gray-600">
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
              <SelectItem value="365">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Discipline Score Card */}
      <Card className="bg-dark-card border-prop-gold/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-prop-gold" />
            <span>Overall Discipline Score</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-4xl font-bold text-prop-gold mb-2">
                {disciplineMetrics.disciplineScore}
              </div>
              <Badge className={`${
                disciplineMetrics.disciplineScore >= 80 ? 'bg-prop-green text-black' :
                disciplineMetrics.disciplineScore >= 60 ? 'bg-prop-gold text-black' :
                'bg-prop-pink text-white'
              }`}>
                {disciplineMetrics.disciplineScore >= 80 ? 'Excellent' :
                 disciplineMetrics.disciplineScore >= 60 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
            
            <div className="flex-1 ml-8">
              <Progress 
                value={disciplineMetrics.disciplineScore} 
                className="h-3 mb-4"
              />
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-gray-400">Stop Loss</div>
                  <div className="font-bold text-white">
                    {disciplineMetrics.totalTrades > 0 ? 
                      Math.round((disciplineMetrics.stopLossHits / disciplineMetrics.totalTrades) * 100) : 0}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Risk Control</div>
                  <div className="font-bold text-white">
                    {disciplineMetrics.totalTrades > 0 ? 
                      Math.round(((disciplineMetrics.totalTrades - disciplineMetrics.overRisked) / disciplineMetrics.totalTrades) * 100) : 0}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Emotional Control</div>
                  <div className="font-bold text-white">
                    {disciplineMetrics.totalTrades > 0 ? 
                      Math.round(((disciplineMetrics.totalTrades - disciplineMetrics.emotionalTrades) / disciplineMetrics.totalTrades) * 100) : 0}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Consistency</div>
                  <div className="font-bold text-white">
                    {disciplineMetrics.consecutiveLosses < 5 ? 100 : Math.max(0, 100 - disciplineMetrics.consecutiveLosses * 5)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discipline Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-dark-card border-prop-green/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Stop Loss Respect</p>
                <p className="text-2xl font-bold text-prop-green">
                  {disciplineMetrics.stopLossHits}/{disciplineMetrics.totalTrades}
                </p>
              </div>
              <Shield className="h-8 w-8 text-prop-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-card border-prop-pink/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Risk Violations</p>
                <p className="text-2xl font-bold text-prop-pink">
                  {disciplineMetrics.overRisked}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-prop-pink" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-card border-prop-tiffany/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Max Consecutive Losses</p>
                <p className="text-2xl font-bold text-prop-tiffany">
                  {disciplineMetrics.consecutiveLosses}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-prop-tiffany" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-card border-prop-blue/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Max Drawdown</p>
                <p className="text-2xl font-bold text-prop-blue">
                  {formatCurrency(disciplineMetrics.maxDrawdown)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-prop-blue" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="patterns" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-dark-card">
          <TabsTrigger value="patterns">Trading Patterns</TabsTrigger>
          <TabsTrigger value="psychology">Psychology</TabsTrigger>
          <TabsTrigger value="violations">Rule Violations</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-dark-card border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Stop Loss Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Stop Losses Hit</span>
                  <Badge className="bg-prop-green/20 text-prop-green">
                    {disciplineMetrics.stopLossHits}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Stop Losses Moved</span>
                  <Badge className="bg-prop-pink/20 text-prop-pink">
                    {disciplineMetrics.stopLossMoved}
                  </Badge>
                </div>
                <Progress 
                  value={disciplineMetrics.totalTrades > 0 ? (disciplineMetrics.stopLossHits / disciplineMetrics.totalTrades) * 100 : 0}
                  className="h-2"
                />
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Take Profit Execution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Take Profits Hit</span>
                  <Badge className="bg-prop-gold/20 text-prop-gold">
                    {disciplineMetrics.takeProfitHits}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Early Exits</span>
                  <Badge className="bg-prop-tiffany/20 text-prop-tiffany">
                    {disciplineMetrics.totalTrades - disciplineMetrics.takeProfitHits}
                  </Badge>
                </div>
                <Progress 
                  value={disciplineMetrics.totalTrades > 0 ? (disciplineMetrics.takeProfitHits / disciplineMetrics.totalTrades) * 100 : 0}
                  className="h-2"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="psychology" className="space-y-6">
          <Card className="bg-dark-card border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">Emotional Trading Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-dark-surface rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Eye className="h-5 w-5 text-prop-pink" />
                    <span className="text-white">Emotional Trades Detected</span>
                  </div>
                  <Badge className="bg-prop-pink/20 text-prop-pink">
                    {disciplineMetrics.emotionalTrades}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-dark-surface rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-prop-tiffany" />
                    <span className="text-white">Revenge Trading Pattern</span>
                  </div>
                  <Badge className="bg-prop-tiffany/20 text-prop-tiffany">
                    {disciplineMetrics.consecutiveLosses > 3 ? 'Detected' : 'None'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-dark-surface rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calculator className="h-5 w-5 text-prop-gold" />
                    <span className="text-white">FOMO Trades</span>
                  </div>
                  <Badge className="bg-prop-gold/20 text-prop-gold">
                    {disciplineMetrics.overRisked}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations" className="space-y-6">
          <Card className="bg-dark-card border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">Rule Violations Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { rule: 'Risk Per Trade Exceeded', violations: disciplineMetrics.overRisked, severity: 'high' },
                  { rule: 'Stop Loss Moved Against Position', violations: disciplineMetrics.stopLossMoved, severity: 'medium' },
                  { rule: 'Emotional Trading Detected', violations: disciplineMetrics.emotionalTrades, severity: 'high' },
                  { rule: 'Consecutive Loss Limit', violations: disciplineMetrics.consecutiveLosses > 5 ? 1 : 0, severity: 'critical' }
                ].map((violation, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-dark-surface rounded-lg">
                    <div className="flex items-center space-x-3">
                      {violation.severity === 'critical' ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : violation.severity === 'high' ? (
                        <AlertTriangle className="h-5 w-5 text-prop-pink" />
                      ) : (
                        <Clock className="h-5 w-5 text-prop-gold" />
                      )}
                      <span className="text-white">{violation.rule}</span>
                    </div>
                    <Badge className={`${
                      violation.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      violation.severity === 'high' ? 'bg-prop-pink/20 text-prop-pink' :
                      'bg-prop-gold/20 text-prop-gold'
                    }`}>
                      {violation.violations}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card className="bg-dark-card border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">Improvement Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { 
                    icon: Shield, 
                    title: 'Strengthen Stop Loss Discipline', 
                    description: 'Practice using mental stops and alerts to respect your initial stop loss levels.',
                    priority: 'high'
                  },
                  { 
                    icon: Target, 
                    title: 'Implement Position Sizing Calculator', 
                    description: 'Use our Smart Position Sizing tool to maintain consistent risk per trade.',
                    priority: 'medium'
                  },
                  { 
                    icon: Brain, 
                    title: 'Develop Pre-Trade Routine', 
                    description: 'Create a checklist to follow before every trade to reduce emotional decisions.',
                    priority: 'high'
                  },
                  { 
                    icon: Calendar, 
                    title: 'Daily Trading Journal', 
                    description: 'Record your emotional state and market conditions for each trade.',
                    priority: 'medium'
                  }
                ].map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-dark-surface rounded-lg">
                    <recommendation.icon className={`h-6 w-6 mt-1 ${
                      recommendation.priority === 'high' ? 'text-prop-pink' : 'text-prop-tiffany'
                    }`} />
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{recommendation.title}</h4>
                      <p className="text-gray-400 text-sm">{recommendation.description}</p>
                    </div>
                    <Badge className={`${
                      recommendation.priority === 'high' ? 'bg-prop-pink/20 text-prop-pink' : 'bg-prop-tiffany/20 text-prop-tiffany'
                    }`}>
                      {recommendation.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}