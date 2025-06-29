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
      disciplinedScore: 100,
      scoreGrade: 'A+',
      personalRiskPerTrade: account.riskPerTrade || 0,
      averageTradeRisk: 0,
      violationsCount: 0,
      totalTrades: 0,
      compliance: { withinLimit: 0, violations: 0 },
      analysis: ['No trades to analyze yet'],
      recommendations: ['Start trading to establish a disciplined track record']
    };
  }

  const personalRiskLimit = account.riskPerTrade || account.maxDrawdown * 0.1; // 10% of max drawdown if no personal risk set
  const analysis: string[] = [];
  const recommendations: string[] = [];
  
  // Calculate risk per trade based on absolute loss amounts
  const tradeRisks = accountTrades.map(trade => Math.abs(Math.min(0, trade.pnl)));
  const averageTradeRisk = tradeRisks.reduce((sum, risk) => sum + risk, 0) / tradeRisks.length;
  
  // Count violations (trades that lost more than personal risk limit)
  const violations = tradeRisks.filter(risk => risk > personalRiskLimit);
  const violationsCount = violations.length;
  const complianceRate = ((accountTrades.length - violationsCount) / accountTrades.length) * 100;
  
  // Calculate disciplined score
  let score = 100;
  
  // Deduct points for violations
  const violationPenalty = (violationsCount / accountTrades.length) * 40; // Up to 40 points for violations
  score -= violationPenalty;
  
  // Deduct points for average risk exceeding personal limit
  if (averageTradeRisk > personalRiskLimit) {
    const riskExcessPenalty = Math.min(30, ((averageTradeRisk - personalRiskLimit) / personalRiskLimit) * 30);
    score -= riskExcessPenalty;
  }
  
  // Deduct points for consecutive violations
  let consecutiveViolations = 0;
  let maxConsecutiveViolations = 0;
  
  tradeRisks.forEach(risk => {
    if (risk > personalRiskLimit) {
      consecutiveViolations++;
      maxConsecutiveViolations = Math.max(maxConsecutiveViolations, consecutiveViolations);
    } else {
      consecutiveViolations = 0;
    }
  });
  
  if (maxConsecutiveViolations > 2) {
    score -= Math.min(20, (maxConsecutiveViolations - 2) * 5);
  }
  
  score = Math.max(0, Math.round(score));
  
  // Determine grade
  let scoreGrade: DisciplinedAnalysis['scoreGrade'];
  if (score >= 95) scoreGrade = 'A+';
  else if (score >= 90) scoreGrade = 'A';
  else if (score >= 80) scoreGrade = 'B';
  else if (score >= 70) scoreGrade = 'C';
  else if (score >= 60) scoreGrade = 'D';
  else scoreGrade = 'F';
  
  // Generate analysis
  analysis.push(`Compliance rate: ${complianceRate.toFixed(1)}% (${accountTrades.length - violationsCount}/${accountTrades.length} trades)`);
  analysis.push(`Average risk per trade: $${averageTradeRisk.toFixed(0)} vs limit of $${personalRiskLimit.toFixed(0)}`);
  
  if (violationsCount > 0) {
    analysis.push(`${violationsCount} trades exceeded your personal risk limit`);
    const maxViolation = Math.max(...violations);
    analysis.push(`Largest violation: $${maxViolation.toFixed(0)} (${((maxViolation / personalRiskLimit - 1) * 100).toFixed(0)}% over limit)`);
  }
  
  if (maxConsecutiveViolations > 1) {
    analysis.push(`Maximum consecutive violations: ${maxConsecutiveViolations} trades`);
  }
  
  // Generate recommendations
  if (scoreGrade === 'A+' || scoreGrade === 'A') {
    recommendations.push('Excellent risk discipline! Keep following your risk management plan');
    if (averageTradeRisk < personalRiskLimit * 0.5) {
      recommendations.push('You may consider slightly increasing position size to optimize returns');
    }
  } else if (scoreGrade === 'B') {
    recommendations.push('Good risk management with room for improvement');
    if (violationsCount > 0) {
      recommendations.push('Focus on reducing risk violations to improve your score');
    }
  } else if (scoreGrade === 'C' || scoreGrade === 'D') {
    recommendations.push('Risk discipline needs improvement - consider tighter controls');
    recommendations.push('Review your position sizing and stop-loss strategies');
    if (maxConsecutiveViolations > 2) {
      recommendations.push('Implement a mandatory cool-down period after risk violations');
    }
  } else {
    recommendations.push('URGENT: Significant risk management issues detected');
    recommendations.push('Consider reducing position sizes by 50% until discipline improves');
    recommendations.push('Implement strict stop-losses and position size limits');
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