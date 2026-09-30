import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Database } from "lucide-react";
import TradingDisciplineSystem from "./TradingDisciplineSystem";
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

interface EnhancedDisciplineAnalyzerProps {
  trades: Trade[];
  accounts: Account[];
  selectedAccountId?: number;
}

export default function EnhancedDisciplineAnalyzer({ trades, accounts, selectedAccountId }: EnhancedDisciplineAnalyzerProps) {
  const [selectedAccount, setSelectedAccount] = useState<string>(selectedAccountId?.toString() || "all");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [disciplineData, setDisciplineData] = useState<DisciplineMetrics | null>(null);

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
      consistencyScore * 0.2 +
      marketAnalysisScore * 0.15 +
      timeManagementScore * 0.1 +
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
        <TradingDisciplineSystem
          disciplineScore={disciplineData.disciplineScore}
          totalTrades={disciplineData.totalTrades}
          winRate={disciplineData.winRate}
          stopModificationRate={disciplineData.stopModificationRate}
          excessLosses={disciplineData.excessLosses}
          emotionalControlScore={disciplineData.emotionalControlScore}
          riskManagementScore={disciplineData.riskManagementScore}
          consistencyScore={disciplineData.consistencyScore}
          marketAnalysisScore={disciplineData.marketAnalysisScore}
          timeManagementScore={disciplineData.timeManagementScore}
          learningScore={disciplineData.learningScore}
        />
      )}
    </div>
  );
}