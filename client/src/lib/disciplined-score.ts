import type { Account, Trade } from "@shared/schema";

export interface DisciplinedAnalysis {
  disciplinedScore: number;
  scoreGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  personalRiskPerTrade: number;
  averageTradeRisk: number;
  violationsCount: number;
  totalTrades: number;
  compliance: {
    withinLimit: number;
    violations: number;
  };
  analysis: string[];
  recommendations: string[];
}

export function calculateDisciplinedScore(account: Account, trades: Trade[]): DisciplinedAnalysis {
  const accountTrades = trades.filter(trade => trade.accountId === account.id);
  
  if (accountTrades.length === 0) {
    return {
      disciplinedScore: 0,
      scoreGrade: 'F',
      personalRiskPerTrade: account.riskPerTrade || 0,
      averageTradeRisk: 0,
      violationsCount: 0,
      totalTrades: 0,
      compliance: { withinLimit: 0, violations: 0 },
      analysis: ['No trades to analyze yet'],
      recommendations: ['Start trading to establish a disciplined track record']
    };
  }

  const analysis: string[] = [];
  const recommendations: string[] = [];
  
  // Use the SAME algorithm as DisciplineAnalyzer component
  const totalTrades = accountTrades.length;
  const winningTrades = accountTrades.filter(t => (t.pnl || 0) > 0);
  const losingTrades = accountTrades.filter(t => (t.pnl || 0) < 0);
  const winRate = winningTrades.length / totalTrades;
  
  // Risk management analysis (same as discipline analyzer)
  const overRiskedTrades = accountTrades.filter(t => {
    const riskAmount = Math.abs((t.entryPrice || 0) - (t.initialStopLoss || 0)) * (t.quantity || 1);
    return riskAmount > 1000; // Assuming $1000 as high risk threshold
  }).length;
  
  // Revenge trading detection (consecutive losses followed by larger position)
  let revengeTrading = 0;
  for (let i = 1; i < accountTrades.length; i++) {
    const prevTrade = accountTrades[i - 1];
    const currTrade = accountTrades[i];
    if ((prevTrade.pnl || 0) < 0 && (currTrade.quantity || 0) > (prevTrade.quantity || 0) * 1.5) {
      revengeTrading++;
    }
  }

  // Calculate component scores (exact same formula as discipline analyzer)
  const riskManagementScore = Math.max(0, 100 - (overRiskedTrades / totalTrades) * 100);
  const emotionalControlScore = Math.max(0, 100 - (revengeTrading / totalTrades) * 200);
  const consistencyScore = winRate * 100;
  const score = (riskManagementScore + emotionalControlScore + consistencyScore) / 3;



  const violationsCount = overRiskedTrades; // Use overRiskedTrades as violations for consistency
  const personalRiskLimit = account.riskPerTrade || 100; // Default risk amount
  const averageTradeRisk = losingTrades.length > 0 ? 
    Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)) / losingTrades.length : 0;
  
  // Determine grade based on final score
  let scoreGrade: DisciplinedAnalysis['scoreGrade'];
  if (score >= 95) scoreGrade = 'A+';
  else if (score >= 90) scoreGrade = 'A';
  else if (score >= 80) scoreGrade = 'B';
  else if (score >= 70) scoreGrade = 'C';
  else if (score >= 60) scoreGrade = 'D';
  else scoreGrade = 'F';
  
  // Generate analysis based on new methodology
  const complianceRate = (accountTrades.length - violationsCount) / accountTrades.length * 100;
  analysis.push(`Win rate: ${(winRate * 100).toFixed(1)}% (${winningTrades.length}/${totalTrades} trades)`);
  analysis.push(`Risk management score: ${riskManagementScore.toFixed(1)}/100`);
  analysis.push(`Emotional control score: ${emotionalControlScore.toFixed(1)}/100`);
  
  if (revengeTrading > 0) {
    analysis.push(`${revengeTrading} instances of potential revenge trading detected`);
  }
  
  if (overRiskedTrades > 0) {
    analysis.push(`${overRiskedTrades} trades flagged as potentially over-risked`);
  }
  
  // Generate recommendations based on new scoring
  if (scoreGrade === 'A+' || scoreGrade === 'A') {
    recommendations.push('Excellent trading discipline! Keep following your current strategy');
  } else if (scoreGrade === 'B') {
    recommendations.push('Good trading discipline with room for improvement');
    if (consistencyScore < 60) {
      recommendations.push('Focus on improving trade selection and win rate');
    }
  } else if (scoreGrade === 'C' || scoreGrade === 'D') {
    recommendations.push('Trading discipline needs improvement');
    recommendations.push('Consider implementing stricter risk management rules');
    if (revengeTrading > totalTrades * 0.1) {
      recommendations.push('Implement cooling-off periods after losing trades');
    }
  } else {
    recommendations.push('Significant improvement needed in trading discipline');
    recommendations.push('Consider reducing position sizes and focusing on strategy');
    recommendations.push('Implement strict rules for entry and exit criteria');
  }
  
  return {
    disciplinedScore: score,
    scoreGrade,
    personalRiskPerTrade: personalRiskLimit,
    averageTradeRisk,
    violationsCount,
    totalTrades: accountTrades.length,
    compliance: {
      withinLimit: accountTrades.length - violationsCount,
      violations: violationsCount
    },
    analysis,
    recommendations
  };
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-400';
  if (score >= 80) return 'text-yellow-400';
  if (score >= 70) return 'text-orange-400';
  return 'text-red-400';
}

export function getGradeColor(grade: DisciplinedAnalysis['scoreGrade']): string {
  switch (grade) {
    case 'A+':
    case 'A':
      return 'bg-green-600';
    case 'B':
      return 'bg-yellow-600';
    case 'C':
      return 'bg-orange-600';
    case 'D':
    case 'F':
      return 'bg-red-600';
    default:
      return 'bg-gray-600';
  }
}