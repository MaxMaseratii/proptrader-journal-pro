import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Brain, Target, TrendingUp, Clock, BookOpen, AlertTriangle, CheckCircle } from "lucide-react";
import type { Trade, Account } from "@shared/schema";

interface DisciplineMetrics {
  totalTrades: number;
  winRate: number;
  disciplineScore: number;
  riskManagementScore: number;
  emotionalControlScore: number;
  consistencyScore: number;
  stopModificationRate: number;
  excessLosses: number;
  marketAnalysisScore: number;
  timeManagementScore: number;
  learningScore: number;
}

interface DisciplineArea {
  name: string;
  score: number;
  weight: number;
  icon: React.ReactNode;
  description: string;
  keyMetrics: string[];
  recommendations: string[];
}

interface EnhancedDisciplineAnalyzerProps {
  trades: Trade[];
  accounts: Account[];
  selectedAccountId?: number;
}

export default function EnhancedDisciplineAnalyzer({ trades, accounts, selectedAccountId }: EnhancedDisciplineAnalyzerProps) {
  const [selectedAccount, setSelectedAccount] = useState<string>(selectedAccountId?.toString() || "all");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [disciplineData, setDisciplineData] = useState<DisciplineMetrics | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const calculateDisciplineMetrics = (accountTrades: Trade[]): DisciplineMetrics => {
    if (accountTrades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        disciplineScore: 0,
        riskManagementScore: 0,
        emotionalControlScore: 0,
        consistencyScore: 0,
        stopModificationRate: 0,
        excessLosses: 0,
        marketAnalysisScore: 0,
        timeManagementScore: 0,
        learningScore: 0
      };
    }

    const winningTrades = accountTrades.filter(t => t.pnl > 0).length;
    const winRate = winningTrades / accountTrades.length;
    
    // Calculate discipline-related metrics
    const profitableTrades = accountTrades.filter(t => t.pnl > 0);
    const losingTrades = accountTrades.filter(t => t.pnl < 0);
    
    // Risk Management Score (based on position sizing consistency and stop loss usage)
    const avgPnl = accountTrades.reduce((sum, t) => sum + Math.abs(t.pnl), 0) / accountTrades.length;
    const riskConsistency = accountTrades.filter(t => Math.abs(t.pnl) <= avgPnl * 1.5).length / accountTrades.length;
    const riskManagementScore = riskConsistency * 100;
    
    // Emotional Control Score (based on consecutive losses and revenge trading patterns)
    let consecutiveLosses = 0;
    let maxConsecutiveLosses = 0;
    let revengeTradeCount = 0;
    
    for (let i = 0; i < accountTrades.length; i++) {
      if (accountTrades[i].pnl < 0) {
        consecutiveLosses++;
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, consecutiveLosses);
        
        // Check for revenge trading (larger position after loss)
        if (i > 0 && accountTrades[i-1].pnl < 0) {
          const currentSize = Math.abs(accountTrades[i].pnl);
          const previousSize = Math.abs(accountTrades[i-1].pnl);
          if (currentSize > previousSize * 1.2) {
            revengeTradeCount++;
          }
        }
      } else {
        consecutiveLosses = 0;
      }
    }
    
    const emotionalControlScore = Math.max(0, 100 - (maxConsecutiveLosses * 10) - (revengeTradeCount * 15));
    
    // Consistency Score (based on trading pattern regularity)
    const tradingDays = new Set(accountTrades.map(t => t.date.split('T')[0]));
    const avgTradesPerDay = accountTrades.length / tradingDays.size;
    const consistencyScore = Math.min(100, avgTradesPerDay * 20);
    
    // Market Analysis Score (based on win rate and profit factor)
    const totalProfits = profitableTrades.reduce((sum, t) => sum + t.pnl, 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
    const profitFactor = totalLosses > 0 ? totalProfits / totalLosses : 1;
    const marketAnalysisScore = Math.min(100, (winRate * 50) + (profitFactor * 25));
    
    // Time Management Score (based on trade frequency and timing)
    const timeManagementScore = Math.min(100, (tradingDays.size * 3) + (avgTradesPerDay * 10));
    
    // Learning Score (based on improvement over time)
    const halfPoint = Math.floor(accountTrades.length / 2);
    const firstHalfWinRate = accountTrades.slice(0, halfPoint).filter(t => t.pnl > 0).length / halfPoint;
    const secondHalfWinRate = accountTrades.slice(halfPoint).filter(t => t.pnl > 0).length / (accountTrades.length - halfPoint);
    const improvement = secondHalfWinRate - firstHalfWinRate;
    const learningScore = Math.max(0, Math.min(100, 50 + (improvement * 200)));
    
    // Overall discipline score
    const disciplineScore = (
      riskManagementScore * 0.25 +
      emotionalControlScore * 0.2 +
      consistencyScore * 0.15 +
      marketAnalysisScore * 0.15 +
      timeManagementScore * 0.15 +
      learningScore * 0.1
    );

    return {
      totalTrades: accountTrades.length,
      winRate,
      disciplineScore,
      riskManagementScore,
      emotionalControlScore,
      consistencyScore,
      stopModificationRate: revengeTradeCount / accountTrades.length * 100,
      excessLosses: revengeTradeCount,
      marketAnalysisScore,
      timeManagementScore,
      learningScore
    };
  };

  const analyzeTrading = async () => {
    setIsAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const filteredTrades = selectedAccount === "all" 
        ? trades 
        : trades.filter(t => t.accountId === parseInt(selectedAccount));
      
      const metrics = calculateDisciplineMetrics(filteredTrades);
      setDisciplineData(metrics);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (trades.length > 0) {
      analyzeTrading();
    }
  }, [selectedAccount, trades]);

  const disciplineAreas: DisciplineArea[] = disciplineData ? [
    {
      name: "Risk Management",
      score: disciplineData.riskManagementScore,
      weight: 25,
      icon: <Shield className="h-5 w-5" />,
      description: "Capital preservation and position sizing discipline",
      keyMetrics: ["Position size consistency", "Stop loss adherence", "Risk-reward ratios"],
      recommendations: [
        "Never risk more than 2% per trade",
        "Use position sizing calculator",
        "Set stops before entry"
      ]
    },
    {
      name: "Emotional Control",
      score: disciplineData.emotionalControlScore,
      weight: 20,
      icon: <Brain className="h-5 w-5" />,
      description: "Managing fear, greed, and impulsive decisions",
      keyMetrics: ["Revenge trading frequency", "FOMO trades", "Emotional exits"],
      recommendations: [
        "Implement cooling-off periods",
        "Use meditation/mindfulness",
        "Keep trading journal"
      ]
    },
    {
      name: "Strategy Adherence",
      score: disciplineData.consistencyScore,
      weight: 20,
      icon: <Target className="h-5 w-5" />,
      description: "Following your trading plan consistently",
      keyMetrics: ["Setup quality", "Entry timing", "Exit discipline"],
      recommendations: [
        "Define clear entry criteria",
        "Backtest strategies thoroughly",
        "Review plan weekly"
      ]
    },
    {
      name: "Market Analysis",
      score: disciplineData.marketAnalysisScore,
      weight: 15,
      icon: <TrendingUp className="h-5 w-5" />,
      description: "Technical and fundamental analysis skills",
      keyMetrics: ["Analysis accuracy", "Market timing", "Trend identification"],
      recommendations: [
        "Study price action patterns",
        "Understand market structure",
        "Follow economic calendar"
      ]
    },
    {
      name: "Time Management",
      score: disciplineData.timeManagementScore,
      weight: 10,
      icon: <Clock className="h-5 w-5" />,
      description: "Efficient use of trading time and session planning",
      keyMetrics: ["Session preparation", "Focus duration", "Screen time balance"],
      recommendations: [
        "Create pre-market routine",
        "Limit trading hours",
        "Take regular breaks"
      ]
    },
    {
      name: "Continuous Learning",
      score: disciplineData.learningScore,
      weight: 10,
      icon: <BookOpen className="h-5 w-5" />,
      description: "Commitment to improvement and skill development",
      keyMetrics: ["Study hours", "Course completion", "Skill application"],
      recommendations: [
        "Read trading books monthly",
        "Attend webinars/courses",
        "Practice on demo accounts"
      ]
    }
  ] : [];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreLevel = (score: number) => {
    if (score >= 80) return "Professional";
    if (score >= 60) return "Developing";
    return "Novice";
  };

  return (
    <div className="space-y-6">
      <div className="widget-container">
        <div className="widget-content">
          <div className="widget-left">
            <p className="widget-label">Trading Discipline Analysis</p>
            <p className="widget-description">Comprehensive performance evaluation</p>
          </div>
          <div className="widget-right">
            <div className="flex items-center gap-4">
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="w-48 bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Accounts</SelectItem>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={analyzeTrading} 
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-prop-gold to-prop-tiffany hover:from-prop-gold/80 hover:to-prop-tiffany/80"
              >
                {isAnalyzing ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {disciplineData && (
        <>
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Overall Discipline Score</p>
                <div className="flex items-center space-x-4">
                  <div className={`text-3xl font-bold ${getScoreColor(disciplineData.disciplineScore)}`}>
                    {disciplineData.disciplineScore.toFixed(1)}
                  </div>
                  <Badge className={`${getScoreColor(disciplineData.disciplineScore)} bg-gray-800`}>
                    {getScoreLevel(disciplineData.disciplineScore)}
                  </Badge>
                </div>
                <p className="widget-description">
                  Based on {disciplineData.totalTrades} trades • Win Rate: {(disciplineData.winRate * 100).toFixed(1)}%
                </p>
              </div>
              <div className="widget-icon-square">
                <Brain className="widget-icon" />
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {disciplineAreas.map((area, index) => (
                  <div key={index} className="widget-container">
                    <div className="widget-content">
                      <div className="widget-left">
                        <div className="flex items-center gap-2 mb-2">
                          {area.icon}
                          <p className="widget-label text-sm">{area.name}</p>
                        </div>
                        <div className={`text-2xl font-bold ${getScoreColor(area.score)}`}>
                          {area.score.toFixed(1)}
                        </div>
                        <Progress value={area.score} className="mt-2 h-2" />
                        <p className="widget-description mt-2">
                          {area.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="detailed" className="mt-6">
              <div className="space-y-4">
                {disciplineAreas.map((area, index) => (
                  <div key={index} className="widget-container">
                    <div className="widget-content flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {area.icon}
                          <h3 className="widget-label">{area.name}</h3>
                        </div>
                        <div className={`text-xl font-bold ${getScoreColor(area.score)}`}>
                          {area.score.toFixed(1)}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Key Metrics</h4>
                          <ul className="text-sm text-gray-400 space-y-1">
                            {area.keyMetrics.map((metric, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-prop-tiffany" />
                                {metric}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Recommendations</h4>
                          <ul className="text-sm text-gray-400 space-y-1">
                            {area.recommendations.map((rec, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <Target className="h-3 w-3 text-prop-gold" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="widget-container">
                  <div className="widget-content flex-col">
                    <div className="widget-left mb-4">
                      <p className="widget-label">Immediate Actions</p>
                      <p className="widget-description">Priority improvements</p>
                    </div>
                    <div className="space-y-3">
                      {disciplineAreas
                        .filter(area => area.score < 60)
                        .slice(0, 3)
                        .map((area, index) => (
                          <Alert key={index} className="bg-red-900/20 border-red-500/30">
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                            <AlertDescription className="text-red-300">
                              <strong>{area.name}:</strong> {area.recommendations[0]}
                            </AlertDescription>
                          </Alert>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="widget-container">
                  <div className="widget-content flex-col">
                    <div className="widget-left mb-4">
                      <p className="widget-label">Long-term Goals</p>
                      <p className="widget-description">Continuous improvement</p>
                    </div>
                    <div className="space-y-3">
                      {disciplineAreas
                        .filter(area => area.score >= 60)
                        .slice(0, 3)
                        .map((area, index) => (
                          <Alert key={index} className="bg-green-900/20 border-green-500/30">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <AlertDescription className="text-green-300">
                              <strong>{area.name}:</strong> {area.recommendations[1] || area.recommendations[0]}
                            </AlertDescription>
                          </Alert>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}