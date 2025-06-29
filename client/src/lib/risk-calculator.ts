import type { Account } from "@shared/schema";

// Asset configuration based on Smart Position Sizing Calculator
export const TRADING_ASSETS = {
  'ES': { name: 'E-mini S&P 500', pointValue: 50.0, intradayMargin: 500.0, overnightMargin: 12100.0 },
  'MES': { name: 'Micro E-mini S&P 500', pointValue: 5.0, intradayMargin: 50.0, overnightMargin: 1210.0 },
  'NQ': { name: 'E-mini Nasdaq 100', pointValue: 40.0, intradayMargin: 500.0, overnightMargin: 15400.0 },
  'MNQ': { name: 'Micro E-mini Nasdaq 100', pointValue: 8.0, intradayMargin: 100.0, overnightMargin: 2442.0 },
  'YM': { name: 'E-mini Dow', pointValue: 5.0, intradayMargin: 500.0, overnightMargin: 11000.0 },
  'MYM': { name: 'Micro E-mini Dow', pointValue: 0.5, intradayMargin: 50.0, overnightMargin: 1100.0 },
  'RTY': { name: 'E-mini Russell 2000', pointValue: 20.0, intradayMargin: 300.0, overnightMargin: 7700.0 },
  'M2K': { name: 'Micro E-mini Russell 2000', pointValue: 2.0, intradayMargin: 50.0, overnightMargin: 770.0 },
  'CL': { name: 'Crude Oil', pointValue: 1000.0, intradayMargin: 1000.0, overnightMargin: 8000.0 },
  'MCL': { name: 'Micro Crude Oil', pointValue: 100.0, intradayMargin: 100.0, overnightMargin: 800.0 },
  'GC': { name: 'Gold', pointValue: 100.0, intradayMargin: 1000.0, overnightMargin: 9900.0 },
  'MGC': { name: 'Micro Gold', pointValue: 10.0, intradayMargin: 100.0, overnightMargin: 990.0 },
} as const;

export type AssetSymbol = keyof typeof TRADING_ASSETS;

export interface RiskCalculationParams {
  tradingCapital: number;
  profitTarget: number;
  maxDrawdown: number;
  dailyLossLimit?: number;
  riskCalculationPeriod: 'weekly' | 'bi_weekly' | 'monthly' | 'custom';
  customRiskAmount?: number;
  useRiskPercentage: boolean;
  riskPercentage?: number;
  riskRewardRatio: number;
  primaryAsset: AssetSymbol;
  useIntradayMargins: boolean;
  marginSafetyBuffer: number;
  stopLossPoints?: number;
  tradingDays?: number;
}

export interface RiskSuggestion {
  suggestedRiskPerTrade: number;
  maxPositionSize: number;
  marginRequired: number;
  dailyRiskBudget: number;
  riskScore: 'Conservative' | 'Moderate' | 'Aggressive' | 'Extreme';
  reasoning: string[];
  warnings: string[];
}

export function calculateRiskSuggestions(account: Partial<Account>): RiskSuggestion {
  // Default values
  const tradingCapital = account.tradingCapital || account.startingBalance || 50000;
  const profitTarget = account.profitTarget || tradingCapital * 0.1;
  const maxDrawdown = account.maxDrawdown || tradingCapital * 0.05;
  const dailyLossLimit = account.dailyLossLimit || maxDrawdown * 0.5;
  const riskCalculationPeriod = account.riskCalculationPeriod || 'bi_weekly';
  const riskPercentage = account.riskPercentage || 1.0;
  const useRiskPercentage = account.useRiskPercentage || false;
  const riskRewardRatio = account.riskRewardRatio || 2.0;
  const primaryAsset = (account.primaryAsset as AssetSymbol) || 'MES';
  const useIntradayMargins = account.useIntradayMargins !== false;
  const marginSafetyBuffer = account.marginSafetyBuffer || 50.0;
  const stopLossPoints = account.stopLossPoints || 10;
  const customRiskAmount = account.customRiskAmount;

  const asset = TRADING_ASSETS[primaryAsset];
  const marginRequired = useIntradayMargins ? asset.intradayMargin : asset.overnightMargin;
  
  let suggestedRiskPerTrade = 0;
  let dailyRiskBudget = 0;
  const reasoning: string[] = [];
  const warnings: string[] = [];

  // Calculate risk per trade based on method
  if (useRiskPercentage && riskPercentage) {
    suggestedRiskPerTrade = tradingCapital * (riskPercentage / 100);
    reasoning.push(`Using ${riskPercentage}% of trading capital ($${tradingCapital.toLocaleString()})`);
  } else if (riskCalculationPeriod === 'custom' && customRiskAmount) {
    suggestedRiskPerTrade = customRiskAmount;
    reasoning.push(`Using custom risk amount of $${customRiskAmount.toLocaleString()}`);
  } else {
    // Period-based calculation
    const periodDays = {
      'weekly': 5,
      'bi_weekly': 10,
      'monthly': 20
    }[riskCalculationPeriod];
    
    // Conservative approach: split daily loss limit across multiple trades per day
    const tradesPerDay = 2; // Conservative estimate
    dailyRiskBudget = dailyLossLimit / 2; // Use 50% of daily loss limit as buffer
    suggestedRiskPerTrade = dailyRiskBudget / tradesPerDay;
    
    reasoning.push(`${riskCalculationPeriod} period (${periodDays} days)`);
    reasoning.push(`Daily risk budget: $${dailyRiskBudget.toLocaleString()}`);
    reasoning.push(`Assuming ${tradesPerDay} trades per day maximum`);
  }

  // Calculate maximum position size based on risk and asset
  const riskPerPoint = suggestedRiskPerTrade / (stopLossPoints || 10);
  const maxContracts = Math.floor(riskPerPoint / asset.pointValue);
  const actualMarginNeeded = maxContracts * marginRequired;
  
  // Apply margin safety buffer
  const availableCapital = tradingCapital * ((100 - marginSafetyBuffer) / 100);
  const maxPositionSize = Math.min(maxContracts, Math.floor(availableCapital / marginRequired));

  // Risk scoring
  const riskToCapitalRatio = suggestedRiskPerTrade / tradingCapital;
  let riskScore: RiskSuggestion['riskScore'];
  
  if (riskToCapitalRatio <= 0.005) {
    riskScore = 'Conservative';
    reasoning.push('Risk level: Conservative (≤0.5% of capital per trade)');
  } else if (riskToCapitalRatio <= 0.01) {
    riskScore = 'Moderate';
    reasoning.push('Risk level: Moderate (0.5-1% of capital per trade)');
  } else if (riskToCapitalRatio <= 0.02) {
    riskScore = 'Aggressive';
    reasoning.push('Risk level: Aggressive (1-2% of capital per trade)');
    warnings.push('Higher risk level - ensure you have strong risk management');
  } else {
    riskScore = 'Extreme';
    reasoning.push('Risk level: EXTREME (>2% of capital per trade)');
    warnings.push('WARNING: Very high risk level - consider reducing position size');
  }

  // Additional warnings and checks
  if (suggestedRiskPerTrade > dailyLossLimit / 2) {
    warnings.push('Risk per trade exceeds 50% of daily loss limit - reduce position size');
  }

  if (account.hasDailyLossLimit && account.dailyLossLimitType === 'hard') {
    warnings.push('Hard daily loss limit - account will fail if limit is exceeded');
  }

  if (actualMarginNeeded > tradingCapital * 0.8) {
    warnings.push('High margin usage - consider using micro contracts or reduce position size');
  }

  reasoning.push(`Asset: ${asset.name} ($${asset.pointValue}/point)`);
  reasoning.push(`Stop loss: ${stopLossPoints} points`);
  reasoning.push(`Margin: $${marginRequired.toLocaleString()} per contract`);

  return {
    suggestedRiskPerTrade: Math.round(suggestedRiskPerTrade),
    maxPositionSize,
    marginRequired: actualMarginNeeded,
    dailyRiskBudget: Math.round(dailyRiskBudget),
    riskScore,
    reasoning,
    warnings
  };
}

export function formatRiskSuggestion(suggestion: RiskSuggestion): string {
  const lines = [
    `💡 Risk Suggestion: $${suggestion.suggestedRiskPerTrade.toLocaleString()} per trade`,
    `📊 Risk Level: ${suggestion.riskScore}`,
    `📈 Max Position: ${suggestion.maxPositionSize} contracts`,
    `💰 Margin Required: $${suggestion.marginRequired.toLocaleString()}`,
    '',
    '📋 Analysis:',
    ...suggestion.reasoning.map(r => `• ${r}`),
  ];

  if (suggestion.warnings.length > 0) {
    lines.push('', '⚠️ Warnings:');
    lines.push(...suggestion.warnings.map(w => `• ${w}`));
  }

  return lines.join('\n');
}