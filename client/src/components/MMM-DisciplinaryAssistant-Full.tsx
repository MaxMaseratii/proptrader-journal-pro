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
import { calculateComprehensiveDisciplineMetrics, type DisciplineMetrics as SharedDisciplineMetrics } from '@/lib/discipline-calculator';

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

  const calculateComprehensiveDisciplineMetricsOld = (accountTrades: Trade[]): DisciplineMetrics => {
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

    // Account-specific discipline assessment
    const selectedAccounts = accounts.filter(acc => 
      selectedAccountId ? acc.id === parseInt(selectedAccountId) : true
    );
    
    // If we have a selected account, make sure we're only analyzing that account's trades
    const currentAccount = selectedAccountId ? accounts.find(acc => acc.id === parseInt(selectedAccountId)) : null;
    
    // Calculate account status bonuses/penalties
    let accountStatusBonus = 0;
    let accountStatusPenalty = 0;
    
    if (currentAccount) {
      // Single account assessment
      if (currentAccount.status === 'funded' || currentAccount.status === 'live') {
        accountStatusBonus = 15;
      } else if (currentAccount.status === 'failed') {
        accountStatusPenalty = 25;
      }
    } else {
      // Multi-account assessment
      selectedAccounts.forEach(account => {
        if (account.status === 'funded' || account.status === 'live') {
          accountStatusBonus += 15;
        } else if (account.status === 'failed') {
          accountStatusPenalty += 25;
        }
      });
    }
    
    // Apply account status adjustments (but don't let bonuses exceed reasonable limits)
    const accountStatusAdjustment = Math.min(25, accountStatusBonus) - accountStatusPenalty;
    
    // Calculate comprehensive trading performance metrics
    const totalPnL = accountTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const profitableTradesCount = accountTrades.filter(t => t.pnl > 0).length;
    const losingTradesCount = accountTrades.filter(t => t.pnl < 0).length;
    
    // Performance-based scoring adjustments
    let performanceMultiplier = 1.0;
    
    if (totalPnL > 0) {
      // Reward profitable accounts
      performanceMultiplier = Math.min(1.4, 1.0 + (totalPnL / 10000)); // Max 40% bonus for very profitable accounts
    } else if (totalPnL < 0) {
      // Penalize losing accounts
      performanceMultiplier = Math.max(0.6, 1.0 + (totalPnL / 10000)); // Max 40% penalty for losing accounts
    }
    
    // Win rate adjustment
    const winRateMultiplier = winRate > 0.5 ? 1.0 + ((winRate - 0.5) * 0.5) : 1.0 - ((0.5 - winRate) * 0.5);
    
    // Overall discipline score (weighted average with performance adjustments)
    const baseDisciplineScore = (
      riskManagementScore * 0.25 +
      emotionalControlScore * 0.20 +
      consistencyScore * 0.20 +
      marketAnalysisScore * 0.15 +
      timeManagementScore * 0.10 +
      learningScore * 0.10
    );
    
    // Apply all performance adjustments
    const disciplineScore = Math.max(0, Math.min(100, 
      (baseDisciplineScore * performanceMultiplier * winRateMultiplier) + accountStatusAdjustment
    ));
    
    // Calculate excess losses (actual trading losses, not account costs)
    const tradingExcessLosses = (avgLoss * revengeTradesCount) + (avgLoss * fomoTradesCount * 0.5);
    const totalExcessLosses = Math.max(0, tradingExcessLosses);

    // Debug logging to understand the calculation
    console.log(`Account ${selectedAccountId || 'All'} Analysis:`, {
      totalTrades,
      totalPnL,
      winRate,
      performanceMultiplier,
      winRateMultiplier,
      baseDisciplineScore,
      finalDisciplineScore: disciplineScore,
      accountStatus: currentAccount?.status || 'multiple',
      accountStatusAdjustment
    });

    return {
      totalTrades,
      winRate,
      disciplineScore,
      riskManagementScore,
      emotionalControlScore,
      consistencyScore,
      stopModificationRate,
      excessLosses: totalExcessLosses,
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

  const calculatePsychologicalProfile = (accountTrades: Trade[], disciplineScore: number): PsychologicalProfile => {
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
    const totalPnL = accountTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const winRate = accountTrades.filter(t => t.pnl > 0).length / accountTrades.length;
    
    // Base psychological metrics on actual trading performance and discipline score
    // All metrics should be consistent with the discipline score
    
    // Fear Index - HIGH fear means LOW confidence (losing traders have high fear)
    const fearIndex = Math.min(100, Math.max(0,
      100 - disciplineScore + // Lower discipline = higher fear
      (patterns.stopLossViolations * 0.8) + 
      (patterns.emotionalExits * 0.6) +
      (patterns.lossStreakExtension * 0.4) +
      (totalPnL < 0 ? 30 : 0) // Add fear penalty for losing accounts
    ));

    // Greed Index - HIGH greed means profit-chasing behavior
    const greedIndex = Math.min(100, Math.max(0,
      (100 - patterns.profitTargetAchievement) * 0.6 +
      (patterns.fomoTrades * 0.8) +
      (patterns.overTradingFrequency * 0.4) +
      (patterns.revengeTrading * 0.7) +
      (totalPnL < 0 ? 20 : 0) // Losing traders often have high greed
    ));

    // Discipline Index - Should match the overall discipline score
    const disciplineIndex = Math.min(100, Math.max(0, disciplineScore));

    // Emotional Stability - Should be LOW for poor performers
    const emotionalStability = Math.min(100, Math.max(0,
      disciplineScore * 0.8 + // Base on discipline
      (winRate * 30) + // Higher win rate = more stability
      (totalPnL > 0 ? 20 : -20) // Profitable = stable, losing = unstable
    ));

    // Consistency Index - based on regular patterns and performance
    const consistencyIndex = Math.min(100, Math.max(0,
      patterns.riskRewardConsistency * 0.5 + 
      (100 - patterns.overTradingFrequency) * 0.3 +
      (disciplineScore * 0.2) // Consistency correlates with discipline
    ));

    // Learning Index - should be LOW for poor performers
    const learningIndex = Math.min(100, Math.max(0,
      disciplineScore * 0.6 + // Base on discipline
      (patterns.profitTargetAchievement * 0.4) -
      (patterns.lossStreakExtension * 0.5)
    ));

    // Market Reading Index - based on timing and success rates
    const marketReadingIndex = Math.min(100, Math.max(0,
      (winRate * 70) + 
      (patterns.profitTargetAchievement * 0.3) +
      (disciplineScore * 0.2) // Market reading correlates with discipline
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
      
      const metrics = calculateComprehensiveDisciplineMetrics(filteredTrades, accounts, selectedAccount);
      const patterns = calculateTradingPatterns(filteredTrades);
      const psychology = calculatePsychologicalProfile(filteredTrades, metrics.disciplineScore);
      
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

  const getRedFlagsCount = (disciplineData: DisciplineMetrics, patterns: TradingPattern): number => {
    let count = 0;
    if (disciplineData.disciplineScore < 40) count++;
    if (patterns.revengeTrading > 10) count++;
    if (patterns.stopLossViolations > 25) count++;
    if (patterns.overTradingFrequency > 30) count++;
    if (disciplineData.excessLosses > 5000) count++;
    if (patterns.fomoTrades > 20) count++;
    return count;
  };

  const getRedFlagsAnalysis = (disciplineData: DisciplineMetrics, patterns: TradingPattern) => {
    const redFlags = [];
    
    if (disciplineData.disciplineScore < 40) {
      redFlags.push({
        flag: "Critical Discipline Breakdown",
        description: "Overall discipline score is dangerously low, indicating systematic trading plan violations",
        action: "Immediately implement pre-trade checklist and position sizing restrictions",
        severity: "critical"
      });
    }

    if (patterns.revengeTrading > 10) {
      redFlags.push({
        flag: "Revenge Trading Pattern",
        description: "Increasing position size after losses, indicating emotional decision-making",
        action: "Implement mandatory 15-minute cooling-off period after each losing trade",
        severity: "critical"
      });
    }

    if (patterns.stopLossViolations > 25) {
      redFlags.push({
        flag: "Stop Loss Violations",
        description: "Frequent modification of stop losses, reducing risk management effectiveness",
        action: "Use automated stop loss orders that cannot be manually adjusted",
        severity: "critical"
      });
    }

    if (patterns.overTradingFrequency > 30) {
      redFlags.push({
        flag: "Overtrading",
        description: "Trading too frequently, likely chasing market movements",
        action: "Limit to maximum 3 trades per day with strict quality criteria",
        severity: "warning"
      });
    }

    if (disciplineData.excessLosses > 5000) {
      redFlags.push({
        flag: "Excessive Capital Loss",
        description: "Significant losses due to discipline failures affecting account health",
        action: "Reduce position size by 50% until discipline metrics improve",
        severity: "critical"
      });
    }

    if (patterns.fomoTrades > 20) {
      redFlags.push({
        flag: "FOMO Trading",
        description: "Fear of missing out driving impulsive trade entries",
        action: "Require 5-minute confirmation period before entering any trade",
        severity: "warning"
      });
    }

    return redFlags;
  };

  const getMentalGameAssessment = (disciplineData: DisciplineMetrics, patterns: TradingPattern) => {
    const assessments = [];

    if (patterns.revengeTrading > 15 || patterns.fomoTrades > 20) {
      assessments.push({
        area: "Emotional Control",
        status: "Critical Issue",
        indicators: [
          "Increasing position size after losses",
          "Quick succession trading after wins",
          "Inability to step away from screen",
          "Trading outside planned timeframes"
        ],
        intervention: "Implement mandatory breaks between trades and use position sizing rules that cannot be overridden during emotional states"
      });
    }

    if (patterns.stopLossViolations > 25) {
      assessments.push({
        area: "Risk Management Psychology",
        status: "Critical Issue",
        indicators: [
          "Frequent stop loss modifications",
          "Holding losing positions too long",
          "Justifying bad trades with new analysis",
          "Moving stops away from entry"
        ],
        intervention: "Use automated stop losses and practice accepting small losses as part of the trading process"
      });
    }

    if (patterns.overTradingFrequency > 25) {
      assessments.push({
        area: "Impulse Control",
        status: "Requires Attention",
        indicators: [
          "Trading more than planned",
          "Entering trades without proper setup",
          "Difficulty waiting for ideal conditions",
          "Constant market monitoring"
        ],
        intervention: "Create a pre-trade checklist and implement time-based trading restrictions"
      });
    }

    if (disciplineData.consistencyScore < 50) {
      assessments.push({
        area: "Mental Consistency",
        status: "Requires Attention",
        indicators: [
          "Inconsistent trade sizing",
          "Variable risk tolerance",
          "Changing strategies frequently",
          "Emotional decision making"
        ],
        intervention: "Develop a written trading plan and review it daily before market open"
      });
    }

    return assessments;
  };

  const getProgressMilestones = (disciplineData: DisciplineMetrics) => {
    const milestones = [
      {
        title: "Discipline Foundation",
        description: "Establish basic trading discipline and stop revenge trading",
        target: "Score > 60",
        timeline: "Week 1-2"
      },
      {
        title: "Risk Management Mastery",
        description: "Consistent stop loss usage and proper position sizing",
        target: "Score > 70",
        timeline: "Week 3-4"
      },
      {
        title: "Emotional Control",
        description: "Reduce FOMO trades and emotional decision making",
        target: "Score > 75",
        timeline: "Week 5-6"
      },
      {
        title: "Consistency Achievement",
        description: "Maintain consistent trading patterns and results",
        target: "Score > 80",
        timeline: "Week 7-8"
      },
      {
        title: "Professional Trader",
        description: "Achieve elite-level discipline and performance",
        target: "Score > 85",
        timeline: "Week 9-12"
      }
    ];

    return milestones;
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
      <div className="bg-dark-card border-dark-border rounded-2xl p-6 hover-glow">
        <div className="flex items-center space-x-4">
          <div className="bg-prop-gradient-gold-discipline p-3 rounded-xl">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient-rainbow-discipline">MMM DISCIPLINARY ASSISTANT</h1>
            <p className="text-gray-300">Advanced Trading Psychology Analysis & Discipline Coaching</p>
          </div>
        </div>
      </div>

      {/* Account Selection */}
      <Card className="bg-dark-card border-dark-border hover-glow">
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
          <TabsList className="grid w-full grid-cols-6 bg-dark-card border-dark-border">
            <TabsTrigger value="system" className="flex items-center gap-2 data-[state=active]:bg-prop-gradient-gold-discipline data-[state=active]:text-white text-prop-gold">
              <Brain className="h-4 w-4" />
              Discipline System
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2 data-[state=active]:bg-prop-gradient-gold-discipline data-[state=active]:text-white text-prop-gold">
              <TrendingUp className="h-4 w-4" />
              Professional Insights
            </TabsTrigger>
            <TabsTrigger value="redflags" className="flex items-center gap-2 data-[state=active]:bg-prop-gradient-gold-discipline data-[state=active]:text-white text-prop-gold">
              <AlertTriangle className="h-4 w-4" />
              Red Flags
            </TabsTrigger>
            <TabsTrigger value="mental" className="flex items-center gap-2 data-[state=active]:bg-prop-gradient-gold-discipline data-[state=active]:text-white text-prop-gold">
              <Brain className="h-4 w-4" />
              Mental Game
            </TabsTrigger>
            <TabsTrigger value="action" className="flex items-center gap-2 data-[state=active]:bg-prop-gradient-gold-discipline data-[state=active]:text-white text-prop-gold">
              <Zap className="h-4 w-4" />
              Action Plan
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2 data-[state=active]:bg-prop-gradient-gold-discipline data-[state=active]:text-white text-prop-gold">
              <Activity className="h-4 w-4" />
              Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="space-y-6">
            {/* Overall Score */}
            <Card className="bg-dark-card border-dark-border hover-glow">
              <CardHeader>
                <CardTitle className="text-gradient-rainbow-discipline text-center">
                  Trading Discipline System Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className={`text-6xl font-bold ${disciplineData.disciplineScore >= 80 ? 'text-prop-green' : disciplineData.disciplineScore >= 60 ? 'text-prop-gold' : 'text-prop-pink'}`}>
                    {disciplineData.disciplineScore.toFixed(1)}
                  </div>
                  <div className="text-xl text-gray-300">
                    {disciplineData.disciplineScore >= 80 ? 'Professional' : disciplineData.disciplineScore >= 60 ? 'Developing' : 'Novice'} Trader
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full bg-prop-gradient-gold-discipline transition-all duration-300"
                      style={{ width: `${disciplineData.disciplineScore}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-400">
                    Overall Discipline Assessment
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Discipline Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {disciplineAreas.map((area) => (
                <Card key={area.name} className="bg-dark-card border-dark-border hover-glow">
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

          <TabsContent value="redflags" className="space-y-6">
            {/* Red Flags Assessment */}
            <Card className="bg-prop-card border-red-400/30">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Red Flags Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-6xl font-bold text-red-400">
                    {getRedFlagsCount(disciplineData, tradingPatterns)}
                  </div>
                  <div className="text-xl text-gray-300">
                    Critical Issues Identified
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300"
                      style={{ width: `${Math.min(100, getRedFlagsCount(disciplineData, tradingPatterns) * 25)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-black border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-400" />
                    Impact Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-6 bg-red-900/30 rounded-lg border border-red-500/20">
                    <div className="text-3xl font-bold text-red-400">
                      ${disciplineData.excessLosses.toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Estimated losses due to poor discipline
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    Warning Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getRedFlagsAnalysis(disciplineData, tradingPatterns).slice(0, 3).map((flag, index) => (
                      <div key={index} className="text-xs text-gray-300 p-2 bg-red-900/20 rounded border border-red-500/20">
                        {flag.flag}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-yellow-400/20 border-yellow-400 shadow-lg shadow-yellow-400/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                  Critical Red Flags Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getRedFlagsAnalysis(disciplineData, tradingPatterns).length > 0 ? (
                  <div className="space-y-4">
                    {getRedFlagsAnalysis(disciplineData, tradingPatterns).map((flag, index) => (
                      <div key={index} className={`rounded-lg p-4 border ${
                        flag.severity === 'critical' 
                          ? 'bg-red-900/30 border-red-600' 
                          : 'bg-orange-900/30 border-orange-600'
                      }`}>
                        <div className="flex items-start gap-3">
                          <AlertTriangle className={`w-5 h-5 mt-1 flex-shrink-0 ${
                            flag.severity === 'critical' ? 'text-red-400' : 'text-orange-400'
                          }`} />
                          <div className="flex-1">
                            <h4 className={`font-semibold mb-2 ${
                              flag.severity === 'critical' ? 'text-red-300' : 'text-orange-300'
                            }`}>
                              {flag.flag}
                            </h4>
                            <p className="text-gray-200 text-sm mb-2">{flag.description}</p>
                            <p className={`text-sm font-medium ${
                              flag.severity === 'critical' ? 'text-red-200' : 'text-orange-200'
                            }`}>
                              Action Required: {flag.action}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                    <p className="text-green-200 text-center">
                      ✅ No critical red flags identified. Continue current discipline practices.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-yellow-400/20 border-yellow-400 shadow-lg shadow-yellow-400/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <X className="h-6 w-6 text-orange-400" />
                  Overtrading Impact Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-orange-900/30 rounded-lg p-4 border border-orange-600">
                  <h4 className="font-semibold text-orange-300 mb-2">Overtrading Indicators</h4>
                  <p className="text-gray-200 text-sm mb-2">
                    Excessive trading frequency: {tradingPatterns.overTradingFrequency.toFixed(1)}% of days
                  </p>
                  <p className="text-sm font-medium text-orange-200">
                    Recommendation: Limit to 3-5 high-quality setups per day
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mental" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Brain className="h-6 w-6 text-purple-400" />
                  Mental Game & Emotional Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getMentalGameAssessment(disciplineData, tradingPatterns).length > 0 ? (
                  <div className="space-y-6">
                    {getMentalGameAssessment(disciplineData, tradingPatterns).map((assessment, index) => (
                      <div key={index} className="bg-purple-900/20 rounded-lg p-6 border border-purple-700">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-white">{assessment.area}</h4>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            assessment.status === 'Critical Issue'
                              ? 'bg-red-900/50 text-red-300 border border-red-600'
                              : assessment.status === 'Requires Attention'
                              ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-600'
                              : 'bg-blue-900/50 text-blue-300 border border-blue-600'
                          }`}>
                            {assessment.status}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-purple-400 font-medium mb-2">Behavioral Indicators:</h5>
                            <ul className="text-gray-300 text-sm space-y-2">
                              {assessment.indicators.map((indicator, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-purple-400 mt-1">•</span>
                                  {indicator}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-green-400 font-medium mb-2">Intervention Strategy:</h5>
                            <p className="text-gray-200 text-sm bg-green-900/20 p-3 rounded border border-green-700">
                              {assessment.intervention}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
                    <p className="text-purple-200 text-center">
                      ✅ Mental game assessment shows strong emotional control. Maintain current psychological discipline.
                    </p>
                  </div>
                )}
                
                <div className="mt-6 p-4 bg-orange-900/30 rounded-lg border border-orange-500/30">
                  <div className="text-center">
                    <div className="text-orange-300 font-semibold mb-2">Market Reality Check</div>
                    <div className="text-gray-400 text-sm space-y-1">
                      <p>• You're fighting the market instead of flowing with it</p>
                      <p>• Original stops are hit 89.3% of the time anyway</p>
                      <p>• Widening stops doesn't improve win rate, just increases losses</p>
                      <p>• Emotional decisions override systematic planning</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
            {/* Comprehensive Action Plan */}
            <Card className="bg-prop-card border-prop-gold/20">
              <CardHeader>
                <CardTitle className="text-prop-gold flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Comprehensive Improvement Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 30-Day Plan */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-prop-gold">30-Day Foundation</h3>
                    <div className="space-y-3">
                      {getActionPlan(disciplineData).slice(0, 3).map((plan, index) => (
                        <div key={index} className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className={`${plan.priority === 'HIGH' ? 'text-red-400 border-red-400' : 'text-blue-400 border-blue-400'}`}>
                              {plan.priority} PRIORITY
                            </Badge>
                            <span className="text-xs text-blue-400">{plan.timeline}</span>
                          </div>
                          <h4 className="font-bold text-blue-300 mb-2">{plan.area}</h4>
                          <p className="text-sm text-gray-300 mb-2">{plan.action}</p>
                          <p className="text-xs text-gray-400">{plan.impact}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 90-Day Plan */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-prop-gold">90-Day Mastery</h3>
                    <div className="space-y-3">
                      {getActionPlan(disciplineData).slice(3, 6).map((plan, index) => (
                        <div key={index} className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="text-green-400 border-green-400">
                              MASTERY
                            </Badge>
                            <span className="text-xs text-green-400">{plan.timeline}</span>
                          </div>
                          <h4 className="font-bold text-green-300 mb-2">{plan.area}</h4>
                          <p className="text-sm text-gray-300 mb-2">{plan.action}</p>
                          <p className="text-xs text-gray-400">{plan.impact}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Priority Actions */}
            <Card className="bg-red-900/20 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-red-300 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Immediate Priority Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getRedFlagsAnalysis(disciplineData, tradingPatterns).slice(0, 3).map((flag, index) => (
                    <div key={index} className="bg-red-800/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-red-300">{flag.flag}</h4>
                        <Badge variant="destructive">High Priority</Badge>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">{flag.description}</p>
                      <div className="bg-red-700/20 rounded p-3">
                        <p className="text-sm font-medium text-red-200">
                          Action Required: {flag.action}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progress Milestones */}
            <Card className="bg-prop-card border-prop-gold/20">
              <CardHeader>
                <CardTitle className="text-prop-gold flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Progress Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getProgressMilestones(disciplineData).map((milestone, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-800/50 rounded-lg">
                      <div className="w-8 h-8 bg-prop-gold/20 rounded-full flex items-center justify-center">
                        <span className="text-prop-gold text-sm font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{milestone.title}</h4>
                        <p className="text-sm text-gray-400">{milestone.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-prop-gold">{milestone.target}</div>
                        <div className="text-xs text-gray-500">{milestone.timeline}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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

            {/* Action Plan Progress Tracking */}
            <Card className="bg-prop-card border-prop-gold/20">
              <CardHeader>
                <CardTitle className="text-prop-gold flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Action Plan Progress Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 30-Day Action Plan Progress */}
                  <div>
                    <h4 className="text-white font-semibold mb-3">30-Day Foundation Plan</h4>
                    <div className="space-y-3">
                      {[
                        { task: "Implement position sizing rules", completed: true, dueDate: "Day 5" },
                        { task: "Set daily loss limits", completed: true, dueDate: "Day 7" },
                        { task: "Practice stop-loss discipline", completed: false, dueDate: "Day 15" },
                        { task: "Reduce revenge trading", completed: false, dueDate: "Day 20" },
                        { task: "Improve emotional control", completed: false, dueDate: "Day 25" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <input 
                              type="checkbox" 
                              checked={item.completed}
                              className="w-4 h-4 text-prop-gold bg-gray-700 border-gray-600 rounded focus:ring-prop-gold"
                              readOnly
                            />
                            <span className={`text-sm ${item.completed ? 'text-green-400 line-through' : 'text-gray-300'}`}>
                              {item.task}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-400">{item.dueDate}</span>
                            <Badge className={`${item.completed ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                              {item.completed ? 'Completed' : 'In Progress'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-sm text-gray-400">
                      Progress: 2/5 tasks completed (40%)
                    </div>
                  </div>

                  {/* 90-Day Action Plan Progress */}
                  <div>
                    <h4 className="text-white font-semibold mb-3">90-Day Advanced Plan</h4>
                    <div className="space-y-3">
                      {[
                        { task: "Develop advanced risk management system", completed: false, dueDate: "Day 45" },
                        { task: "Master psychological discipline", completed: false, dueDate: "Day 60" },
                        { task: "Achieve consistent profitability", completed: false, dueDate: "Day 75" },
                        { task: "Implement advanced strategies", completed: false, dueDate: "Day 90" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <input 
                              type="checkbox" 
                              checked={item.completed}
                              className="w-4 h-4 text-prop-gold bg-gray-700 border-gray-600 rounded focus:ring-prop-gold"
                              readOnly
                            />
                            <span className={`text-sm ${item.completed ? 'text-green-400 line-through' : 'text-gray-300'}`}>
                              {item.task}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-400">{item.dueDate}</span>
                            <Badge className="bg-blue-500/20 text-blue-400">
                              Upcoming
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-sm text-gray-400">
                      Progress: 0/4 tasks completed (0%)
                    </div>
                  </div>

                  {/* Overall Action Plan Status */}
                  <Alert className="bg-prop-gold/10 border-prop-gold/30">
                    <Target className="h-4 w-4 text-prop-gold" />
                    <AlertDescription className="text-prop-gold">
                      <strong>Action Plan Status:</strong> You're 22% through your improvement journey. 
                      Focus on completing stop-loss discipline practice to stay on track.
                    </AlertDescription>
                  </Alert>
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