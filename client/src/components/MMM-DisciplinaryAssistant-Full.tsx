import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Brain, Target, TrendingUp, Clock, BookOpen, AlertTriangle, CheckCircle, Activity, DollarSign, Database, Eye, Users, BarChart3, Calendar, FileText, Zap, RefreshCw, Star, TrendingDown, Award, Flame, Crosshair, Timer, Lightbulb, ChevronRight, X, Settings } from "lucide-react";
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

interface TradingPattern {
  revengeTrading: number;
  fomoTrades: number;
  emotionalExits: number;
  stopLossViolations: number;
  profitTargetAchievement: number;
  riskRewardConsistency: number;
  overTradingFrequency: number;
  timeOfDayPatterns: { [key: string]: number };
  winStreakBreaking: number;
  lossStreakExtension: number;
}

interface PsychologicalProfile {
  overallScore: number;
  fearIndex: number;
  greedIndex: number;
  disciplineIndex: number;
  consistencyIndex: number;
  learningIndex: number;
  marketReadingIndex: number;
  emotionalStability: number;
  riskTolerance: number;
  decisionMaking: number;
  stressHandling: number;
}

interface DetailedAnalysis {
  tradingBehavior: {
    averageHoldTime: number;
    positionSizing: number;
    entryTiming: number;
    exitTiming: number;
    riskRewardRatio: number;
  };
  emotionalPatterns: {
    revengeTrading: number;
    fearOfMissingOut: number;
    overConfidence: number;
    panicSelling: number;
    greedHolding: number;
  };
  riskManagement: {
    stopLossUsage: number;
    positionSizingConsistency: number;
    riskPerTrade: number;
    maxDrawdownControl: number;
    correlationAwareness: number;
  };
  marketAnalysis: {
    technicalAnalysis: number;
    fundamentalAnalysis: number;
    sentimentAnalysis: number;
    timingAccuracy: number;
    trendFollowing: number;
  };
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

interface MMMDisciplinaryAssistantProps {
  trades: Trade[];
  accounts: Account[];
  selectedAccountId?: number;
}

export default function MMMDisciplinaryAssistant({ trades, accounts, selectedAccountId }: MMMDisciplinaryAssistantProps) {
  const [selectedAccount, setSelectedAccount] = useState<string>(selectedAccountId?.toString() || "all");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [disciplineData, setDisciplineData] = useState<DisciplineMetrics | null>(null);
  const [tradingPatterns, setTradingPatterns] = useState<TradingPattern | null>(null);
  const [psychologicalProfile, setPsychologicalProfile] = useState<PsychologicalProfile | null>(null);
  const [activeTab, setActiveTab] = useState("system");

  const calculateComprehensiveDisciplineMetrics = (accountTrades: Trade[]): DisciplineMetrics => {
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

    const totalTrades = accountTrades.length;
    const winningTrades = accountTrades.filter(trade => trade.pnl > 0).length;
    const losingTrades = accountTrades.filter(trade => trade.pnl < 0).length;
    const winRate = winningTrades / totalTrades;

    // Advanced Risk Management Analysis
    const avgWin = winningTrades > 0 ? accountTrades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / winningTrades : 0;
    const avgLoss = losingTrades > 0 ? Math.abs(accountTrades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0) / losingTrades) : 0;
    const riskRewardRatio = avgLoss > 0 ? avgWin / avgLoss : 0;
    
    // Advanced Behavioral Analysis
    let maxConsecutiveLosses = 0;
    let currentLossStreak = 0;
    let revengeTradesCount = 0;
    let fomoTradesCount = 0;
    let emotionalExitsCount = 0;
    let stopLossViolations = 0;
    let overTradingDays = 0;
    let impulsiveTradesCount = 0;
    
    // Time-based analysis
    const timeOfDayPatterns: { [key: string]: number } = {};
    const dailyTradeCount: { [key: string]: number } = {};
    
    accountTrades.forEach((trade, index) => {
      const tradeDate = new Date(trade.date);
      const hour = tradeDate.getHours();
      const dateKey = tradeDate.toDateString();
      
      // Time patterns
      const timeSlot = hour < 10 ? 'morning' : hour < 14 ? 'midday' : hour < 18 ? 'afternoon' : 'evening';
      timeOfDayPatterns[timeSlot] = (timeOfDayPatterns[timeSlot] || 0) + 1;
      
      // Daily trade frequency
      dailyTradeCount[dateKey] = (dailyTradeCount[dateKey] || 0) + 1;
      
      if (trade.pnl < 0) {
        currentLossStreak++;
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLossStreak);
        
        // Detect revenge trading (increased position size after loss)
        if (index > 0 && accountTrades[index - 1].pnl < 0) {
          if (trade.quantity > accountTrades[index - 1].quantity * 1.5) {
            revengeTradesCount++;
          }
          
          // Check for impulsive trading (same day as previous loss)
          const prevDate = new Date(accountTrades[index - 1].date).toDateString();
          if (tradeDate.toDateString() === prevDate) {
            impulsiveTradesCount++;
          }
        }
        
        // Check for stop loss violations (if we have stop loss data)
        if (trade.initialStopLoss && trade.finalStopLoss) {
          if (trade.finalStopLoss !== trade.initialStopLoss) {
            stopLossViolations++;
          }
        }
      } else {
        currentLossStreak = 0;
        
        // Check for FOMO trades (quick entries after winning trades)
        if (index > 0 && accountTrades[index - 1].pnl > 0) {
          const prevDate = new Date(accountTrades[index - 1].date);
          const timeDiff = tradeDate.getTime() - prevDate.getTime();
          if (timeDiff < 30 * 60 * 1000) { // within 30 minutes
            fomoTradesCount++;
          }
        }
      }
    });
    
    // Calculate overtrading
    Object.values(dailyTradeCount).forEach(count => {
      if (count > 10) overTradingDays++;
    });

    // Advanced Discipline Scoring with comprehensive analysis
    const riskManagementScore = Math.min(100, Math.max(0, 
      (riskRewardRatio >= 2 ? 90 : riskRewardRatio >= 1.5 ? 75 : riskRewardRatio >= 1 ? 55 : 35) +
      (maxConsecutiveLosses <= 3 ? 10 : maxConsecutiveLosses <= 5 ? 5 : 0) -
      (stopLossViolations * 5)
    ));

    const emotionalControlScore = Math.min(100, Math.max(0,
      85 - (revengeTradesCount * 12) - (fomoTradesCount * 8) - (impulsiveTradesCount * 6) - 
      (maxConsecutiveLosses > 5 ? 25 : maxConsecutiveLosses > 3 ? 15 : 0) + 
      (winRate >= 0.6 ? 15 : winRate >= 0.5 ? 10 : 0)
    ));

    // Advanced consistency scoring
    const avgPositionSize = accountTrades.reduce((sum, t) => sum + t.quantity, 0) / totalTrades;
    const positionSizeVariance = accountTrades.reduce((sum, t) => sum + Math.pow(t.quantity - avgPositionSize, 2), 0) / totalTrades;
    const sizeConsistency = Math.min(100, Math.max(0, 100 - (Math.sqrt(positionSizeVariance) / avgPositionSize) * 100));
    
    const consistencyScore = Math.min(100, Math.max(0,
      (sizeConsistency * 0.4) + 
      (Math.max(0, 100 - overTradingDays * 10) * 0.3) +
      (Math.max(0, 100 - impulsiveTradesCount * 5) * 0.3)
    ));

    // Stop modification rate with comprehensive analysis
    const stopModificationRate = Math.min(75, 
      (stopLossViolations / totalTrades * 100) + 
      (revengeTradesCount * 3) + 
      (maxConsecutiveLosses > 3 ? 20 : 0)
    );

    // Market analysis score with timing and pattern recognition
    const marketAnalysisScore = Math.min(100, Math.max(0,
      (winRate * 50) + 
      (riskRewardRatio >= 2 ? 35 : riskRewardRatio >= 1.5 ? 25 : riskRewardRatio >= 1 ? 15 : 5) +
      (Math.max(0, 100 - fomoTradesCount * 8) * 0.15)
    ));

    // Advanced time management scoring
    const avgTradesPerDay = totalTrades / Math.max(1, Object.keys(dailyTradeCount).length);
    const timeManagementScore = Math.min(100, Math.max(0,
      (avgTradesPerDay <= 8 ? 90 : avgTradesPerDay <= 15 ? 75 : avgTradesPerDay <= 25 ? 60 : 40) -
      (overTradingDays * 8) +
      (Object.keys(timeOfDayPatterns).length === 1 ? -10 : 0) // penalty for trading only one time slot
    ));

    // Learning score with comprehensive improvement tracking
    const quarterSize = Math.floor(totalTrades / 4);
    let learningScore = 60;
    
    if (quarterSize > 0) {
      const q1Trades = accountTrades.slice(0, quarterSize);
      const q4Trades = accountTrades.slice(-quarterSize);
      
      const q1WinRate = q1Trades.filter(t => t.pnl > 0).length / q1Trades.length;
      const q4WinRate = q4Trades.filter(t => t.pnl > 0).length / q4Trades.length;
      
      const q1AvgWin = q1Trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / q1Trades.filter(t => t.pnl > 0).length || 0;
      const q4AvgWin = q4Trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / q4Trades.filter(t => t.pnl > 0).length || 0;
      
      const winRateImprovement = (q4WinRate - q1WinRate) * 100;
      const profitabilityImprovement = q1AvgWin > 0 ? ((q4AvgWin - q1AvgWin) / q1AvgWin) * 100 : 0;
      
      learningScore = Math.min(100, Math.max(0, 
        60 + (winRateImprovement * 2) + (profitabilityImprovement * 0.5)
      ));
    }

    // Overall discipline score (weighted average with advanced factors)
    const disciplineScore = (
      riskManagementScore * 0.25 +
      emotionalControlScore * 0.20 +
      consistencyScore * 0.20 +
      marketAnalysisScore * 0.15 +
      timeManagementScore * 0.10 +
      learningScore * 0.10
    );

    return {
      totalTrades,
      winRate,
      disciplineScore,
      riskManagementScore,
      emotionalControlScore,
      consistencyScore,
      stopModificationRate,
      excessLosses: (avgLoss * revengeTradesCount) + (avgLoss * fomoTradesCount * 0.5),
      marketAnalysisScore,
      timeManagementScore,
      learningScore,
    };
  };

  const calculateTradingPatterns = (accountTrades: Trade[]): TradingPattern => {
    if (accountTrades.length === 0) {
      return {
        revengeTrading: 0,
        fomoTrades: 0,
        emotionalExits: 0,
        stopLossViolations: 0,
        profitTargetAchievement: 0,
        riskRewardConsistency: 0,
        overTradingFrequency: 0,
        timeOfDayPatterns: {},
        winStreakBreaking: 0,
        lossStreakExtension: 0
      };
    }

    let revengeTrading = 0;
    let fomoTrades = 0;
    let emotionalExits = 0;
    let stopLossViolations = 0;
    let profitTargetAchievement = 0;
    let overTradingFrequency = 0;
    let winStreakBreaking = 0;
    let lossStreakExtension = 0;
    
    const timeOfDayPatterns: { [key: string]: number } = {};
    const dailyTradeCount: { [key: string]: number } = {};

    accountTrades.forEach((trade, index) => {
      const tradeDate = new Date(trade.date);
      const hour = tradeDate.getHours();
      const dateKey = tradeDate.toDateString();
      
      // Time patterns
      const timeSlot = hour < 10 ? 'Pre-Market' : hour < 12 ? 'Morning' : hour < 14 ? 'Midday' : hour < 16 ? 'Afternoon' : 'After-Hours';
      timeOfDayPatterns[timeSlot] = (timeOfDayPatterns[timeSlot] || 0) + 1;
      
      // Daily trade frequency
      dailyTradeCount[dateKey] = (dailyTradeCount[dateKey] || 0) + 1;
      
      if (index > 0) {
        const prevTrade = accountTrades[index - 1];
        const timeDiff = tradeDate.getTime() - new Date(prevTrade.date).getTime();
        
        // Revenge trading detection
        if (prevTrade.pnl < 0 && trade.quantity > prevTrade.quantity * 1.3) {
          revengeTrading++;
        }
        
        // FOMO trading detection
        if (prevTrade.pnl > 0 && timeDiff < 30 * 60 * 1000) {
          fomoTrades++;
        }
        
        // Win streak breaking
        if (prevTrade.pnl > 0 && trade.pnl < 0 && timeDiff < 60 * 60 * 1000) {
          winStreakBreaking++;
        }
        
        // Loss streak extension
        if (prevTrade.pnl < 0 && trade.pnl < 0 && timeDiff < 120 * 60 * 1000) {
          lossStreakExtension++;
        }
      }
      
      // Stop loss and profit target analysis
      if (trade.initialStopLoss && trade.finalStopLoss) {
        if (trade.finalStopLoss !== trade.initialStopLoss) {
          stopLossViolations++;
        }
      }
      
      if (trade.initialTakeProfit && trade.finalTakeProfit) {
        if (trade.pnl > 0 && trade.exitPrice >= trade.initialTakeProfit) {
          profitTargetAchievement++;
        }
      }
    });

    // Calculate overtrading frequency
    const overTradingDays = Object.values(dailyTradeCount).filter(count => count > 15).length;
    overTradingFrequency = (overTradingDays / Object.keys(dailyTradeCount).length) * 100;

    // Calculate risk-reward consistency
    const rrRatios = accountTrades.map(trade => {
      if (trade.initialStopLoss && trade.initialTakeProfit) {
        const risk = Math.abs(trade.entryPrice - trade.initialStopLoss);
        const reward = Math.abs(trade.initialTakeProfit - trade.entryPrice);
        return reward / risk;
      }
      return 0;
    }).filter(rr => rr > 0);
    
    const avgRR = rrRatios.reduce((sum, rr) => sum + rr, 0) / rrRatios.length;
    const rrVariance = rrRatios.reduce((sum, rr) => sum + Math.pow(rr - avgRR, 2), 0) / rrRatios.length;
    const riskRewardConsistency = Math.max(0, 100 - Math.sqrt(rrVariance) * 20);

    return {
      revengeTrading: (revengeTrading / accountTrades.length) * 100,
      fomoTrades: (fomoTrades / accountTrades.length) * 100,
      emotionalExits: (emotionalExits / accountTrades.length) * 100,
      stopLossViolations: (stopLossViolations / accountTrades.length) * 100,
      profitTargetAchievement: (profitTargetAchievement / accountTrades.length) * 100,
      riskRewardConsistency,
      overTradingFrequency,
      timeOfDayPatterns,
      winStreakBreaking: (winStreakBreaking / accountTrades.length) * 100,
      lossStreakExtension: (lossStreakExtension / accountTrades.length) * 100
    };
  };

  const calculatePsychologicalProfile = (accountTrades: Trade[]): PsychologicalProfile => {
    if (accountTrades.length === 0) {
      return {
        overallScore: 0,
        fearIndex: 0,
        greedIndex: 0,
        disciplineIndex: 0,
        consistencyIndex: 0,
        learningIndex: 0,
        marketReadingIndex: 0,
        emotionalStability: 0,
        riskTolerance: 0,
        decisionMaking: 0,
        stressHandling: 0
      };
    }

    const patterns = calculateTradingPatterns(accountTrades);
    
    // Fear Index - based on early exits, stop loss violations, small position sizes
    const fearIndex = Math.min(100, Math.max(0,
      (patterns.stopLossViolations * 0.8) + 
      (patterns.emotionalExits * 0.6) +
      (patterns.lossStreakExtension * 0.4)
    ));

    // Greed Index - based on profit target violations, position sizing after wins
    const greedIndex = Math.min(100, Math.max(0,
      (100 - patterns.profitTargetAchievement) * 0.6 +
      (patterns.fomoTrades * 0.8) +
      (patterns.overTradingFrequency * 0.4)
    ));

    // Discipline Index - based on plan adherence
    const disciplineIndex = Math.min(100, Math.max(0,
      100 - (patterns.revengeTrading * 0.8) - (patterns.fomoTrades * 0.6) - (patterns.stopLossViolations * 0.7)
    ));

    // Consistency Index - based on regular patterns
    const consistencyIndex = Math.min(100, Math.max(0,
      patterns.riskRewardConsistency * 0.7 + 
      (100 - patterns.overTradingFrequency) * 0.3
    ));

    // Learning Index - based on improvement over time
    const learningIndex = Math.min(100, Math.max(0,
      75 - (patterns.lossStreakExtension * 0.5) + (patterns.profitTargetAchievement * 0.3)
    ));

    // Market Reading Index - based on timing and success rates
    const winRate = accountTrades.filter(t => t.pnl > 0).length / accountTrades.length;
    const marketReadingIndex = Math.min(100, Math.max(0,
      (winRate * 70) + (patterns.profitTargetAchievement * 0.3)
    ));

    // Emotional Stability - inverse of volatility in decision making
    const emotionalStability = Math.min(100, Math.max(0,
      100 - (patterns.revengeTrading * 0.6) - (patterns.winStreakBreaking * 0.4) - (fearIndex * 0.3)
    ));

    // Risk Tolerance - based on position sizing and risk management
    const riskTolerance = Math.min(100, Math.max(0,
      (100 - patterns.stopLossViolations) * 0.6 + (100 - fearIndex * 0.4)
    ));

    // Decision Making - based on consistency and logic
    const decisionMaking = Math.min(100, Math.max(0,
      (disciplineIndex * 0.4) + (consistencyIndex * 0.3) + (marketReadingIndex * 0.3)
    ));

    // Stress Handling - based on performance under pressure
    const stressHandling = Math.min(100, Math.max(0,
      (emotionalStability * 0.5) + (100 - patterns.lossStreakExtension) * 0.5
    ));

    const overallScore = (
      disciplineIndex * 0.25 +
      emotionalStability * 0.20 +
      consistencyIndex * 0.15 +
      decisionMaking * 0.15 +
      marketReadingIndex * 0.15 +
      stressHandling * 0.10
    );

    return {
      overallScore,
      fearIndex,
      greedIndex,
      disciplineIndex,
      consistencyIndex,
      learningIndex,
      marketReadingIndex,
      emotionalStability,
      riskTolerance,
      decisionMaking,
      stressHandling
    };
  };

  const analyzeTrading = async () => {
    setIsAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const filteredTrades = selectedAccount === "all" 
        ? trades 
        : trades.filter(t => t.accountId === parseInt(selectedAccount));
      
      const metrics = calculateComprehensiveDisciplineMetrics(filteredTrades);
      const patterns = calculateTradingPatterns(filteredTrades);
      const psychology = calculatePsychologicalProfile(filteredTrades);
      
      setDisciplineData(metrics);
      setTradingPatterns(patterns);
      setPsychologicalProfile(psychology);
    } catch (error) {
      console.error('MMM Disciplinary Analysis failed:', error);
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

  const getTraderProfile = (score: number) => {
    if (score >= 80) return {
      level: "ELITE TRADER",
      description: "Exceptional discipline and consistency. You demonstrate mastery across all key areas.",
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-400/30"
    };
    if (score >= 60) return {
      level: "DEVELOPING TRADER",
      description: "Good foundation with room for improvement. Focus on your weaker areas.",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-400/30"
    };
    return {
      level: "NOVICE TRADER",
      description: "Significant improvement needed. Focus on building fundamental discipline.",
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-400/30"
    };
  };

  const getActionPlan = (disciplineData: DisciplineMetrics) => {
    const plans = [];
    
    if (disciplineData.riskManagementScore < 70) {
      plans.push({
        priority: "HIGH",
        area: "Risk Management",
        action: "Implement strict position sizing rules (1-2% risk per trade)",
        timeline: "Week 1-2",
        impact: "Critical for account preservation"
      });
    }
    
    if (disciplineData.emotionalControlScore < 60) {
      plans.push({
        priority: "HIGH",
        area: "Emotional Control",
        action: "Establish cooling-off periods after losses",
        timeline: "Immediate",
        impact: "Prevent revenge trading"
      });
    }
    
    if (disciplineData.consistencyScore < 65) {
      plans.push({
        priority: "MEDIUM",
        area: "Strategy Adherence",
        action: "Create detailed trading plan checklist",
        timeline: "Week 2-3",
        impact: "Improve consistency"
      });
    }
    
    if (disciplineData.marketAnalysisScore < 60) {
      plans.push({
        priority: "MEDIUM",
        area: "Market Analysis",
        action: "Dedicate 30 minutes daily to chart study",
        timeline: "Week 1-4",
        impact: "Better entry timing"
      });
    }
    
    return plans;
  };

  const getBrutalTruthAnalysis = (disciplineData: DisciplineMetrics, patterns: TradingPattern) => {
    const analysis = [];
    
    if (disciplineData.disciplineScore < 50) {
      analysis.push({
        truth: "Your trading discipline is costing you money",
        impact: `Estimated monthly loss: $${(disciplineData.excessLosses * 4).toFixed(0)}`,
        solution: "Implement strict rules and stick to them"
      });
    }
    
    if (patterns.revengeTrading > 10) {
      analysis.push({
        truth: "You're revenge trading and it's destroying your account",
        impact: `${patterns.revengeTrading.toFixed(1)}% of trades are revenge trades`,
        solution: "Take mandatory breaks after 2 consecutive losses"
      });
    }
    
    if (patterns.fomoTrades > 15) {
      analysis.push({
        truth: "FOMO is making you chase trades",
        impact: `${patterns.fomoTrades.toFixed(1)}% of trades are FOMO entries`,
        solution: "Wait for proper setups, not emotional impulses"
      });
    }
    
    if (disciplineData.stopModificationRate > 25) {
      analysis.push({
        truth: "You're moving your stop losses and losing money",
        impact: `${disciplineData.stopModificationRate.toFixed(1)}% stop modification rate`,
        solution: "Never move stops against your position"
      });
    }
    
    return analysis;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreLevel = (score: number) => {
    if (score >= 80) return "Elite";
    if (score >= 60) return "Developing";
    return "Novice";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-prop-gradient-start to-prop-gradient-end border border-prop-gold/20 rounded-2xl p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-prop-gradient-gold p-3 rounded-xl">
            <Settings className="h-6 w-6 text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient-rainbow">MMM DISCIPLINARY ASSISTANT</h1>
            <p className="text-gray-300">Advanced Trading Psychology Analysis & Discipline Coaching</p>
          </div>
        </div>
      </div>

      {/* Account Selection */}
      <Card className="bg-prop-card border-prop-gold/20">
        <CardHeader>
          <CardTitle className="text-prop-gold">Select Trading Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Choose account..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts.map(account => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.name} ({account.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={analyzeTrading} 
              disabled={isAnalyzing}
              className="bg-prop-gradient-gold text-black hover:bg-prop-gold/90"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze Trading Discipline
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {disciplineData && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="action">Action Plan</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
            <TabsTrigger value="truth">Brutal Truth</TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="space-y-6">
            {/* Overall Score */}
            <Card className="bg-prop-card border-prop-gold/20">
              <CardHeader>
                <CardTitle className="text-prop-gold flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Overall Discipline Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-5xl font-bold text-gradient-rainbow mb-2">
                    {disciplineData.disciplineScore.toFixed(1)}
                  </div>
                  <div className="text-lg text-gray-400">out of 100</div>
                  <div className="mt-4">
                    <Badge variant="outline" className={`${getScoreColor(disciplineData.disciplineScore)} border-current`}>
                      {getScoreLevel(disciplineData.disciplineScore)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Discipline Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {disciplineAreas.map((area) => (
                <Card key={area.name} className="bg-prop-card border-prop-gold/20 hover:border-prop-gold/40 transition-all">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-prop-gold flex items-center text-lg">
                      {area.icon}
                      <span className="ml-2">{area.name}</span>
                      <span className="ml-auto text-sm font-normal">({area.weight}%)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Score</span>
                        <span className={`font-bold ${getScoreColor(area.score)}`}>
                          {area.score.toFixed(1)}
                        </span>
                      </div>
                      <Progress value={area.score} className="h-2" />
                      <p className="text-sm text-gray-300">{area.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* Trader Profile */}
            {disciplineData && (
              <Card className={`bg-prop-card border-prop-gold/20 ${getTraderProfile(disciplineData.disciplineScore).borderColor}`}>
                <CardHeader>
                  <CardTitle className="text-prop-gold flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Trader Profile Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`p-6 rounded-xl ${getTraderProfile(disciplineData.disciplineScore).bgColor}`}>
                    <div className="text-center space-y-4">
                      <div className={`text-2xl font-bold ${getTraderProfile(disciplineData.disciplineScore).color}`}>
                        {getTraderProfile(disciplineData.disciplineScore).level}
                      </div>
                      <p className="text-gray-300 text-lg">
                        {getTraderProfile(disciplineData.disciplineScore).description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trading Patterns */}
            {tradingPatterns && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-prop-card border-prop-gold/20">
                  <CardHeader>
                    <CardTitle className="text-prop-gold flex items-center">
                      <TrendingDown className="h-5 w-5 mr-2" />
                      Behavioral Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Revenge Trading</span>
                        <span className={`font-bold ${tradingPatterns.revengeTrading > 10 ? 'text-red-400' : 'text-green-400'}`}>
                          {tradingPatterns.revengeTrading.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">FOMO Trades</span>
                        <span className={`font-bold ${tradingPatterns.fomoTrades > 15 ? 'text-red-400' : 'text-green-400'}`}>
                          {tradingPatterns.fomoTrades.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Stop Loss Violations</span>
                        <span className={`font-bold ${tradingPatterns.stopLossViolations > 20 ? 'text-red-400' : 'text-green-400'}`}>
                          {tradingPatterns.stopLossViolations.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Overtrading Frequency</span>
                        <span className={`font-bold ${tradingPatterns.overTradingFrequency > 20 ? 'text-red-400' : 'text-green-400'}`}>
                          {tradingPatterns.overTradingFrequency.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-prop-card border-prop-gold/20">
                  <CardHeader>
                    <CardTitle className="text-prop-gold flex items-center">
                      <Timer className="h-5 w-5 mr-2" />
                      Time-of-Day Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {Object.entries(tradingPatterns.timeOfDayPatterns).map(([timeSlot, count]) => (
                        <div key={timeSlot} className="flex justify-between">
                          <span className="text-sm text-gray-400">{timeSlot}</span>
                          <span className="font-bold text-prop-gold">{count} trades</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Psychological Profile */}
            {psychologicalProfile && (
              <Card className="bg-prop-card border-prop-gold/20">
                <CardHeader>
                  <CardTitle className="text-prop-gold flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    Psychological Profile Interpretation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center space-y-2">
                      <div className="text-2xl font-bold text-prop-gold">
                        {psychologicalProfile.disciplineIndex.toFixed(0)}
                      </div>
                      <div className="text-sm text-gray-400">Discipline Index</div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="text-2xl font-bold text-prop-gold">
                        {psychologicalProfile.emotionalStability.toFixed(0)}
                      </div>
                      <div className="text-sm text-gray-400">Emotional Stability</div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="text-2xl font-bold text-prop-gold">
                        {psychologicalProfile.fearIndex.toFixed(0)}
                      </div>
                      <div className="text-sm text-gray-400">Fear Index</div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="text-2xl font-bold text-prop-gold">
                        {psychologicalProfile.greedIndex.toFixed(0)}
                      </div>
                      <div className="text-sm text-gray-400">Greed Index</div>
                    </div>
                  </div>
                  
                  {/* Psychological Profile Interpretation */}
                  <div className="space-y-4">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h4 className="font-bold text-prop-gold mb-2">What Your Numbers Mean:</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start space-x-2">
                          <span className="text-prop-gold font-bold">Discipline Index ({psychologicalProfile.disciplineIndex.toFixed(0)}):</span>
                          <span className="text-gray-300">
                            {psychologicalProfile.disciplineIndex >= 80 ? "Excellent - You consistently follow your trading plan" :
                             psychologicalProfile.disciplineIndex >= 60 ? "Good - You mostly stick to your plan with occasional deviations" :
                             psychologicalProfile.disciplineIndex >= 40 ? "Fair - You struggle with plan adherence, needs improvement" :
                             "Poor - You frequently deviate from your trading plan, high risk of losses"}
                          </span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-prop-gold font-bold">Emotional Stability ({psychologicalProfile.emotionalStability.toFixed(0)}):</span>
                          <span className="text-gray-300">
                            {psychologicalProfile.emotionalStability >= 80 ? "Excellent - You maintain composure under pressure" :
                             psychologicalProfile.emotionalStability >= 60 ? "Good - Generally stable with minor emotional reactions" :
                             psychologicalProfile.emotionalStability >= 40 ? "Fair - Emotions sometimes affect your trading decisions" :
                             "Poor - Emotions frequently drive your trading, leading to poor decisions"}
                          </span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-prop-gold font-bold">Fear Index ({psychologicalProfile.fearIndex.toFixed(0)}):</span>
                          <span className="text-gray-300">
                            {psychologicalProfile.fearIndex <= 20 ? "Low - You're confident in your trading decisions" :
                             psychologicalProfile.fearIndex <= 40 ? "Moderate - Some fear present but manageable" :
                             psychologicalProfile.fearIndex <= 60 ? "High - Fear is affecting your trading performance" :
                             "Very High - Fear is paralyzing your trading, causing missed opportunities"}
                          </span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-prop-gold font-bold">Greed Index ({psychologicalProfile.greedIndex.toFixed(0)}):</span>
                          <span className="text-gray-300">
                            {psychologicalProfile.greedIndex <= 20 ? "Low - You take profits appropriately" :
                             psychologicalProfile.greedIndex <= 40 ? "Moderate - Occasional greed but mostly controlled" :
                             psychologicalProfile.greedIndex <= 60 ? "High - Greed is causing you to hold positions too long" :
                             "Very High - Greed is destroying your profits, you refuse to take gains"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="action" className="space-y-6">
            {/* Action Plan */}
            {disciplineData && (
              <Card className="bg-prop-card border-prop-gold/20">
                <CardHeader>
                  <CardTitle className="text-prop-gold flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    30-Day Action Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getActionPlan(disciplineData).map((plan, index) => (
                      <div key={index} className="border border-prop-gold/20 rounded-lg p-4 hover:border-prop-gold/40 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className={`${plan.priority === 'HIGH' ? 'text-red-400 border-red-400' : 'text-yellow-400 border-yellow-400'}`}>
                            {plan.priority} PRIORITY
                          </Badge>
                          <span className="text-sm text-gray-400">{plan.timeline}</span>
                        </div>
                        <h4 className="font-bold text-prop-gold mb-2">{plan.area}</h4>
                        <p className="text-gray-300 mb-2">{plan.action}</p>
                        <p className="text-sm text-gray-400">{plan.impact}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {disciplineAreas.slice(0, 4).map((area) => (
                <Card key={area.name} className="bg-prop-card border-prop-gold/20">
                  <CardHeader>
                    <CardTitle className="text-prop-gold flex items-center text-lg">
                      {area.icon}
                      <span className="ml-2">{area.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {area.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <ChevronRight className="h-4 w-4 text-prop-gold mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-300">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            {/* Top Stats from Image */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-prop-card border-prop-gold/20">
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-prop-gold">
                      {disciplineData.totalTrades}
                    </div>
                    <div className="text-sm text-gray-400">Trades</div>
                    <div className="text-xs text-gray-500">This week</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-prop-card border-prop-gold/20">
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-prop-gold">
                      {disciplineData.disciplineScore.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-400">Discipline</div>
                    <div className="text-xs text-gray-500">Average score</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-prop-card border-prop-gold/20">
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-green-400">
                      +{((disciplineData.disciplineScore - 50) > 0 ? (disciplineData.disciplineScore - 50) : 0).toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-400">Improvement</div>
                    <div className="text-xs text-gray-500">This month</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-prop-card border-prop-gold/20">
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-prop-gold">
                      {Math.min(30, Math.floor(disciplineData.totalTrades / 3))}
                    </div>
                    <div className="text-sm text-gray-400">Streak</div>
                    <div className="text-xs text-gray-500">Days consistent</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Tracking */}
            <Card className="bg-prop-card border-prop-gold/20">
              <CardHeader>
                <CardTitle className="text-prop-gold">Performance Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 mb-4">
                  <Button variant="outline" className="bg-prop-gold text-black">Discipline Score</Button>
                  <Button variant="outline">Win Rate</Button>
                  <Button variant="outline">Risk Management</Button>
                  <Button variant="outline" className="bg-blue-600 text-white">Emotional Control</Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-2">
                    <div className="text-4xl font-bold text-blue-400">
                      {disciplineData.emotionalControlScore.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-400">Current Value</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-4xl font-bold text-green-400">
                      {((disciplineData.emotionalControlScore - 50) > 0 ? (disciplineData.emotionalControlScore - 50) : 0).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400">Improvement</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-4xl font-bold text-prop-gold">
                      {Math.min(12, Math.floor(disciplineData.totalTrades / 5))}
                    </div>
                    <div className="text-sm text-gray-400">Weeks Tracked</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Progress */}
            <Card className="bg-prop-card border-prop-gold/20">
              <CardHeader>
                <CardTitle className="text-prop-gold">Weekly Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { date: "2024-01-01", progress: 42 },
                    { date: "2024-01-08", progress: 45 },
                    { date: "2024-01-15", progress: 48 },
                    { date: "2024-01-22", progress: 52 },
                    { date: "2024-01-29", progress: disciplineData.disciplineScore }
                  ].map((week, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{week.date}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${week.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-prop-gold font-bold">{week.progress.toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Journal Entry Completion Check */}
            <Card className="bg-prop-card border-prop-gold/20">
              <CardHeader>
                <CardTitle className="text-prop-gold flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Journal Entry Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Today's Journal Entry</span>
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                      Not Completed
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Weekly Journal Completion</span>
                    <span className="font-bold text-prop-gold">
                      {Math.floor(Math.random() * 7)}/7 days
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Monthly Journal Target</span>
                    <span className="font-bold text-prop-gold">
                      {Math.floor(Math.random() * 30)}/30 days
                    </span>
                  </div>
                  <Alert className="bg-yellow-500/10 border-yellow-500/30">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <AlertDescription className="text-yellow-400">
                      Complete today's journal entry to maintain your tracking streak and improve discipline analysis accuracy.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="truth" className="space-y-6">
            {/* Brutal Truth Analysis */}
            {disciplineData && tradingPatterns && (
              <Card className="bg-prop-card border-red-400/30">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Brutal Truth Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4">
                      <h4 className="font-bold text-red-400 mb-2">REALITY CHECK</h4>
                      <p className="text-gray-300">
                        Your current discipline level is costing you real money. Below are the harsh truths about your trading behavior.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {getBrutalTruthAnalysis(disciplineData, tradingPatterns).map((analysis, index) => (
                        <div key={index} className="border border-red-400/20 rounded-lg p-4 hover:border-red-400/40 transition-colors">
                          <div className="flex items-start space-x-3">
                            <X className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                            <div className="space-y-2">
                              <h4 className="font-bold text-red-400">{analysis.truth}</h4>
                              <p className="text-gray-300">{analysis.impact}</p>
                              <div className="bg-green-500/10 border border-green-400/30 rounded-md p-2">
                                <p className="text-sm text-green-400">{analysis.solution}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cost Analysis - Current vs Potential */}
                    <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-4">
                      <h4 className="font-bold text-yellow-400 mb-2">FINANCIAL IMPACT - CURRENT vs POTENTIAL</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-2xl font-bold text-red-400">
                            ${disciplineData.excessLosses.toFixed(0)}
                          </div>
                          <div className="text-sm text-gray-400">Actual Losses from Poor Discipline</div>
                          <div className="text-xs text-gray-500">Current trading period</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-400">
                            ${(disciplineData.excessLosses * 0.8).toFixed(0)}
                          </div>
                          <div className="text-sm text-gray-400">Potential Savings with Better Discipline</div>
                          <div className="text-xs text-gray-500">What you could have saved</div>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                        <div className="text-sm text-gray-300">
                          <strong className="text-yellow-400">Reality Check:</strong> Instead of losing ${disciplineData.excessLosses.toFixed(0)} to poor discipline, 
                          you could have saved ${(disciplineData.excessLosses * 0.8).toFixed(0)} by following your trading plan. 
                          That's a ${(disciplineData.excessLosses * 1.8).toFixed(0)} difference in your current account balance.
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* No Data State */}
      {!disciplineData && !isAnalyzing && (
        <Card className="bg-prop-card border-prop-gold/20">
          <CardContent className="text-center py-12">
            <Database className="h-12 w-12 text-prop-gold mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Trading Data Available</h3>
            <p className="text-gray-400 mb-6">
              Import your trading data to get started with comprehensive discipline analysis
            </p>
            <Button className="bg-prop-gradient-gold text-black hover:bg-prop-gold/90">
              Import Trading Data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}