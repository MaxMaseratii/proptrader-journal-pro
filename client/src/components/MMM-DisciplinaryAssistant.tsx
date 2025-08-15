import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Brain, Target, TrendingUp, Clock, BookOpen, AlertTriangle, CheckCircle, Activity, DollarSign, Database, Eye, Users, BarChart3, Calendar, FileText, Zap, RefreshCw, Star, TrendingDown, Award, Flame, Crosshair, Timer, Lightbulb, ChevronRight, X } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("overview");

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
    if (quarterSize > 0) {
      const q1Trades = accountTrades.slice(0, quarterSize);
      const q4Trades = accountTrades.slice(-quarterSize);
      
      const q1WinRate = q1Trades.filter(t => t.pnl > 0).length / q1Trades.length;
      const q4WinRate = q4Trades.filter(t => t.pnl > 0).length / q4Trades.length;
      
      const q1AvgWin = q1Trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / q1Trades.filter(t => t.pnl > 0).length || 0;
      const q4AvgWin = q4Trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / q4Trades.filter(t => t.pnl > 0).length || 0;
      
      const winRateImprovement = (q4WinRate - q1WinRate) * 100;
      const profitabilityImprovement = q1AvgWin > 0 ? ((q4AvgWin - q1AvgWin) / q1AvgWin) * 100 : 0;
      
      const learningScore = Math.min(100, Math.max(0, 
        60 + (winRateImprovement * 2) + (profitabilityImprovement * 0.5)
      ));
    }

    const learningScore = Math.min(100, Math.max(0, 
      60 + (quarterSize > 0 ? 0 : 0) // Will be calculated above if quarterSize > 0
    ));

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

  const [tradingPatterns, setTradingPatterns] = useState<TradingPattern | null>(null);
  const [psychologicalProfile, setPsychologicalProfile] = useState<PsychologicalProfile | null>(null);

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
      color: "text-green-500",
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
      color: "text-red-500",
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
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-400";
    return "text-red-500";
  };

  const getScoreLevel = (score: number) => {
    if (score >= 80) return "Elite";
    if (score >= 60) return "Developing";
    return "Novice";
  };

  const getInsightLevel = (score: number) => {
    if (score >= 80) return "elite";
    if (score >= 60) return "intermediate";
    return "developing";
  };

  const insights = {
    elite: {
      title: "Elite Trader Performance",
      color: "text-green-500",
      bgColor: "bg-green-900/20 border-green-500/30",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      analysis: [
        "Exceptional discipline across all trading dimensions",
        "Consistent risk management and emotional control",
        "Strong adherence to systematic trading approach",
        "Demonstrates professional-level trading psychology"
      ],
      recommendations: [
        "Focus on scaling position sizes gradually",
        "Consider teaching or mentoring other traders",
        "Explore advanced strategies like options spreads",
        "Document your methodology for future reference"
      ],
      potentialGains: "15-25% annual returns sustainable"
    },
    intermediate: {
      title: "Developing Trader Profile",
      color: "text-yellow-400",
      bgColor: "bg-yellow-900/20 border-yellow-500/30",
      icon: <Target className="h-5 w-5 text-yellow-400" />,
      analysis: [
        "Solid foundation with room for improvement",
        "Good technical skills but inconsistent execution",
        "Emotional control needs strengthening",
        "Risk management shows promise but lacks consistency"
      ],
      recommendations: [
        "Implement strict daily trading routines",
        "Use smaller position sizes while developing discipline",
        "Focus on one strategy until mastered",
        "Keep detailed trading journal for pattern recognition"
      ],
      potentialGains: "8-15% annual returns with discipline improvements"
    },
    developing: {
      title: "Foundation Building Required",
      color: "text-red-500",
      bgColor: "bg-red-900/20 border-red-500/30",
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      analysis: [
        "Significant discipline gaps affecting profitability",
        "Emotional trading patterns dominating decisions",
        "Inconsistent risk management leading to large losses",
        "Strategy execution lacks systematic approach"
      ],
      recommendations: [
        "Return to demo trading to rebuild confidence",
        "Focus exclusively on risk management rules",
        "Implement mandatory cooling-off periods",
        "Seek mentorship or professional trading education"
      ],
      potentialGains: "Focus on capital preservation before profit targets"
    }
  };

  const currentInsight = disciplineData ? insights[getInsightLevel(disciplineData.disciplineScore)] : null;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="widget-container">
        <div className="widget-content">
          <div className="widget-left">
            <p className="widget-label">MMM DISCIPLINARY ASSISTANT</p>
            <p className="widget-description">Advanced Professional Trading Psychology Analysis</p>
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
                    Analyzing Psychology...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Run Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Score Display */}
      {disciplineData && (
        <div className="widget-container">
          <div className="widget-content">
            <div className="widget-left">
              <p className="widget-label">Trading Discipline Assessment</p>
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
      )}

      {/* Tabbed Analysis */}
      {disciplineData && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">System</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="action">Action Plan</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
            <TabsTrigger value="truth">Brutal Truth</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
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

          <TabsContent value="insights" className="space-y-6">
            {currentInsight && (
              <div className={`widget-container ${currentInsight.bgColor.replace('bg-', 'border-').replace('/20', '/30')}`}>
                <div className="widget-content flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    {currentInsight.icon}
                    <h3 className="widget-label">{currentInsight.title}</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-white mb-3">Performance Analysis</h4>
                      <ul className="space-y-2">
                        {currentInsight.analysis.map((point, index) => (
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
                        {currentInsight.recommendations.map((rec, index) => (
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
                      <strong>Potential Returns:</strong> {currentInsight.potentialGains}
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="action" className="space-y-6">
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

          <TabsContent value="tracking" className="space-y-6">
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
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-white">Improvement</span>
                    </div>
                    <div className="text-2xl font-bold text-green-500">+{(disciplineData.disciplineScore * 0.1).toFixed(1)}</div>
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

          <TabsContent value="truth" className="space-y-6">
            <div className="widget-container">
              <div className="widget-content flex-col">
                <div className="widget-left mb-6">
                  <p className="widget-label">The Brutal Truth</p>
                  <p className="widget-description">Unfiltered analysis of your trading</p>
                </div>
                <div className="space-y-4">
                  <Alert className="bg-red-900/20 border-red-500/30">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
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
      )}
    </div>
  );
}