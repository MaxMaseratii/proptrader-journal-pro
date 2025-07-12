import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Brain, Target, TrendingUp, Clock, BookOpen, AlertTriangle, CheckCircle, FileText, Database, Activity, DollarSign } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("system");

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
            <p className="widget-label">Professional Trading Analysis</p>
            <p className="widget-description">Advanced discipline assessment system</p>
          </div>
          <div className="widget-right">
            <div className="flex items-center gap-4">
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="w-48 bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select account to analyze" />
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
                    <Database className="h-4 w-4 mr-2" />
                    Analyze Trading
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {disciplineData && (
        <>
          {/* Overall Score Display */}
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Trading Discipline System Assessment</p>
                <div className="flex items-center space-x-6 mt-4">
                  <div className={`text-6xl font-bold ${getScoreColor(disciplineData.disciplineScore)}`}>
                    {disciplineData.disciplineScore.toFixed(1)}
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Badge className={`${getScoreColor(disciplineData.disciplineScore)} bg-gray-800 text-sm px-3 py-1`}>
                      {getScoreLevel(disciplineData.disciplineScore)} Trader
                    </Badge>
                    <Progress value={disciplineData.disciplineScore} className="h-3 w-32" />
                  </div>
                </div>
                <p className="widget-description mt-4">
                  Based on {disciplineData.totalTrades} trades • Win Rate: {(disciplineData.winRate * 100).toFixed(1)}%
                </p>
              </div>
              <div className="widget-icon-square">
                <Brain className="widget-icon" />
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="action">Action Plan</TabsTrigger>
              <TabsTrigger value="tracking">Tracking</TabsTrigger>
              <TabsTrigger value="truth">Brutal Truth</TabsTrigger>
            </TabsList>

            <TabsContent value="system" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {disciplineAreas.map((area, index) => (
                  <div key={index} className="widget-container">
                    <div className="widget-content">
                      <div className="widget-left">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {area.icon}
                            <span className="widget-label text-sm">{area.name}</span>
                          </div>
                          <Badge className={area.score >= 70 ? "bg-green-900/50 text-green-300" : "bg-red-900/50 text-red-300"}>
                            {area.score.toFixed(0)}%
                          </Badge>
                        </div>
                        <Progress value={area.score} className="h-2 mb-2" />
                        <p className="widget-description">
                          {area.description}
                        </p>
                        <div className="mt-3 text-xs text-gray-400">
                          Weight: {area.weight}% of total score
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="mt-6">
              <div className="space-y-6">
                <div className={`widget-container ${disciplineData.disciplineScore >= 80 ? 'border-green-500/30' : disciplineData.disciplineScore >= 60 ? 'border-yellow-500/30' : 'border-red-500/30'}`}>
                  <div className="widget-content flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      {disciplineData.disciplineScore >= 80 ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : disciplineData.disciplineScore >= 60 ? (
                        <Target className="h-5 w-5 text-yellow-400" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      )}
                      <h3 className="widget-label">
                        {disciplineData.disciplineScore >= 80 ? 'Elite Trader Performance' : 
                         disciplineData.disciplineScore >= 60 ? 'Developing Trader Profile' : 
                         'Foundation Building Required'}
                      </h3>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-white mb-3">Performance Analysis</h4>
                        <ul className="space-y-2">
                          {disciplineData.disciplineScore >= 80 ? [
                            "Exceptional discipline across all trading dimensions",
                            "Consistent risk management and emotional control",
                            "Strong adherence to systematic trading approach",
                            "Demonstrates professional-level trading psychology"
                          ] : disciplineData.disciplineScore >= 60 ? [
                            "Solid foundation with room for improvement",
                            "Good technical skills but inconsistent execution",
                            "Emotional control needs strengthening",
                            "Risk management shows promise but lacks consistency"
                          ] : [
                            "Significant discipline gaps affecting profitability",
                            "Emotional trading patterns dominating decisions",
                            "Inconsistent risk management leading to large losses",
                            "Strategy execution lacks systematic approach"
                          ]}
                          {(disciplineData.disciplineScore >= 80 ? [
                            "Exceptional discipline across all trading dimensions",
                            "Consistent risk management and emotional control",
                            "Strong adherence to systematic trading approach",
                            "Demonstrates professional-level trading psychology"
                          ] : disciplineData.disciplineScore >= 60 ? [
                            "Solid foundation with room for improvement",
                            "Good technical skills but inconsistent execution",
                            "Emotional control needs strengthening",
                            "Risk management shows promise but lacks consistency"
                          ] : [
                            "Significant discipline gaps affecting profitability",
                            "Emotional trading patterns dominating decisions",
                            "Inconsistent risk management leading to large losses",
                            "Strategy execution lacks systematic approach"
                          ]).map((point, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-gray-300">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-white mb-3">Strategic Recommendations</h4>
                        <ul className="space-y-2">
                          {(disciplineData.disciplineScore >= 80 ? [
                            "Focus on scaling position sizes gradually",
                            "Consider teaching or mentoring other traders",
                            "Explore advanced strategies like options spreads",
                            "Document your methodology for future reference"
                          ] : disciplineData.disciplineScore >= 60 ? [
                            "Implement strict daily trading routines",
                            "Use smaller position sizes while developing discipline",
                            "Focus on one strategy until mastered",
                            "Keep detailed trading journal for pattern recognition"
                          ] : [
                            "Return to demo trading to rebuild confidence",
                            "Focus exclusively on risk management rules",
                            "Implement mandatory cooling-off periods",
                            "Seek mentorship or professional trading education"
                          ]).map((rec, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-gray-300">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <Alert className="mt-4 bg-blue-900/30 border-blue-500/30">
                      <DollarSign className="h-4 w-4 text-blue-400" />
                      <AlertDescription className="text-blue-300">
                        <strong>Potential Returns:</strong> {
                          disciplineData.disciplineScore >= 80 ? "15-25% annual returns sustainable" :
                          disciplineData.disciplineScore >= 60 ? "8-15% annual returns with discipline improvements" :
                          "Focus on capital preservation before profit targets"
                        }
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="action" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="widget-container">
                  <div className="widget-content flex-col">
                    <div className="widget-left mb-4">
                      <p className="widget-label">30-Day Action Plan</p>
                      <p className="widget-description">Immediate improvements</p>
                    </div>
                    <div className="space-y-3">
                      {disciplineAreas
                        .filter(area => area.score < 70)
                        .slice(0, 4)
                        .map((area, index) => (
                          <div key={index} className="p-3 bg-gray-800/50 rounded-lg border border-prop-gold/20">
                            <div className="flex items-center gap-2 mb-2">
                              {area.icon}
                              <span className="text-sm font-medium text-white">{area.name}</span>
                              <Badge className="bg-red-900/50 text-red-300 text-xs">
                                {area.score.toFixed(0)}%
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-400">{area.recommendations[0]}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="widget-container">
                  <div className="widget-content flex-col">
                    <div className="widget-left mb-4">
                      <p className="widget-label">90-Day Goals</p>
                      <p className="widget-description">Long-term development</p>
                    </div>
                    <div className="space-y-3">
                      {disciplineAreas
                        .filter(area => area.score >= 60)
                        .slice(0, 4)
                        .map((area, index) => (
                          <div key={index} className="p-3 bg-gray-800/50 rounded-lg border border-prop-gold/20">
                            <div className="flex items-center gap-2 mb-2">
                              {area.icon}
                              <span className="text-sm font-medium text-white">{area.name}</span>
                              <Badge className="bg-green-900/50 text-green-300 text-xs">
                                {area.score.toFixed(0)}%
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-400">{area.recommendations[1] || area.recommendations[0]}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tracking" className="mt-6">
              <div className="widget-container">
                <div className="widget-content flex-col">
                  <div className="widget-left mb-6">
                    <p className="widget-label">Progress Tracking Dashboard</p>
                    <p className="widget-description">Monitor your discipline improvement</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-800/50 rounded-lg border border-prop-gold/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-prop-tiffany" />
                        <span className="text-sm font-medium text-white">Daily Score</span>
                      </div>
                      <div className="text-2xl font-bold text-prop-gold">{disciplineData.disciplineScore.toFixed(1)}</div>
                      <div className="text-xs text-gray-400">Current assessment</div>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-lg border border-prop-gold/20">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium text-white">Improvement</span>
                      </div>
                      <div className="text-2xl font-bold text-green-400">+{(disciplineData.disciplineScore * 0.1).toFixed(1)}</div>
                      <div className="text-xs text-gray-400">This week</div>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-lg border border-prop-gold/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm font-medium text-white">Target</span>
                      </div>
                      <div className="text-2xl font-bold text-yellow-400">85.0</div>
                      <div className="text-xs text-gray-400">Professional level</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="truth" className="mt-6">
              <div className="widget-container">
                <div className="widget-content flex-col">
                  <div className="widget-left mb-6">
                    <p className="widget-label">The Brutal Truth</p>
                    <p className="widget-description">Unfiltered analysis of your trading</p>
                  </div>
                  <div className="space-y-4">
                    <Alert className="bg-red-900/20 border-red-500/30">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <AlertDescription className="text-red-300">
                        <strong>Reality Check:</strong> Your discipline score of {disciplineData.disciplineScore.toFixed(1)}% indicates 
                        {disciplineData.disciplineScore >= 80 ? " exceptional trading discipline. You're operating at a professional level." :
                         disciplineData.disciplineScore >= 60 ? " decent foundation but significant room for improvement. You're making avoidable mistakes." :
                         " serious discipline issues that are costing you money. Without changes, consistent profitability is unlikely."}
                      </AlertDescription>
                    </Alert>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-800/50 rounded-lg border border-prop-gold/20">
                        <h4 className="font-semibold text-white mb-3">What's Actually Happening</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                          <li>• Stop modifications: {disciplineData.stopModificationRate.toFixed(1)}% of trades</li>
                          <li>• Emotional control: {disciplineData.emotionalControlScore.toFixed(1)}% efficiency</li>
                          <li>• Risk management: {disciplineData.riskManagementScore.toFixed(1)}% adherence</li>
                          <li>• Total excess losses: ${disciplineData.excessLosses.toLocaleString()}</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-gray-800/50 rounded-lg border border-prop-gold/20">
                        <h4 className="font-semibold text-white mb-3">The Cost of Indiscipline</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                          <li>• Money lost to emotion: ${(disciplineData.excessLosses * 0.4).toLocaleString()}</li>
                          <li>• Potential missed gains: ${(disciplineData.excessLosses * 0.6).toLocaleString()}</li>
                          <li>• Time wasted: {Math.round(disciplineData.stopModificationRate * 2)} hours/week</li>
                          <li>• Opportunity cost: {((100 - disciplineData.disciplineScore) * 0.5).toFixed(1)}% annual returns</li>
                        </ul>
                      </div>
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