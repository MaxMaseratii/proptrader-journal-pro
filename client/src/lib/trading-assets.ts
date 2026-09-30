// Trading Assets Configuration based on Prop Firm Trading Assets Overview

export interface TradingAsset {
  symbol: string;
  name: string;
  category: 'futures' | 'forex' | 'stocks' | 'crypto';
  subcategory: string;
  description: string;
  volatility: 'low' | 'medium' | 'high';
  liquidity: 'high' | 'medium' | 'low';
  riskLevel: 1 | 2 | 3 | 4 | 5; // 1 = lowest risk, 5 = highest risk
  tickSize: number;
  pointValue: number;
  marginRequirement: number; // Typical margin requirement in USD
  suggestedRiskPerTrade: number; // Suggested risk amount in USD
  tradingSessions: string[];
  isBeginnerFriendly: boolean;
}

export const TRADING_ASSETS: TradingAsset[] = [
  // Futures - Major Indices
  {
    symbol: 'ES',
    name: 'E-mini S&P 500',
    category: 'futures',
    subcategory: 'Major Indices',
    description: 'Most popular index future - consistent liquidity',
    volatility: 'medium',
    liquidity: 'high',
    riskLevel: 2,
    tickSize: 0.25,
    pointValue: 12.50,
    marginRequirement: 13200,
    suggestedRiskPerTrade: 500,
    tradingSessions: ['US Session', 'Overnight'],
    isBeginnerFriendly: true
  },
  {
    symbol: 'NQ',
    name: 'E-mini Nasdaq',
    category: 'futures',
    subcategory: 'Major Indices',
    description: 'High volatility tech-heavy index',
    volatility: 'high',
    liquidity: 'high',
    riskLevel: 3,
    tickSize: 0.25,
    pointValue: 5.00,
    marginRequirement: 19800,
    suggestedRiskPerTrade: 750,
    tradingSessions: ['US Session', 'Overnight'],
    isBeginnerFriendly: false
  },
  {
    symbol: 'YM',
    name: 'E-mini Dow Jones',
    category: 'futures',
    subcategory: 'Major Indices',
    description: 'Blue-chip index with steady movements',
    volatility: 'medium',
    liquidity: 'high',
    riskLevel: 2,
    tickSize: 1.00,
    pointValue: 5.00,
    marginRequirement: 11000,
    suggestedRiskPerTrade: 400,
    tradingSessions: ['US Session', 'Overnight'],
    isBeginnerFriendly: true
  },
  {
    symbol: 'RTY',
    name: 'E-mini Russell 2000',
    category: 'futures',
    subcategory: 'Major Indices',
    description: 'Small-cap index with higher volatility',
    volatility: 'high',
    liquidity: 'medium',
    riskLevel: 4,
    tickSize: 0.1,
    pointValue: 5.00,
    marginRequirement: 6600,
    suggestedRiskPerTrade: 600,
    tradingSessions: ['US Session', 'Overnight'],
    isBeginnerFriendly: false
  },
  {
    symbol: 'MES',
    name: 'Micro E-mini S&P 500',
    category: 'futures',
    subcategory: 'Micro Contracts',
    description: 'Lower capital requirements, 1/10th of ES',
    volatility: 'medium',
    liquidity: 'high',
    riskLevel: 1,
    tickSize: 0.25,
    pointValue: 1.25,
    marginRequirement: 1320,
    suggestedRiskPerTrade: 50,
    tradingSessions: ['US Session', 'Overnight'],
    isBeginnerFriendly: true
  },
  {
    symbol: 'MNQ',
    name: 'Micro E-mini Nasdaq',
    category: 'futures',
    subcategory: 'Micro Contracts',
    description: 'Lower capital requirements, 1/10th of NQ',
    volatility: 'high',
    liquidity: 'high',
    riskLevel: 2,
    tickSize: 0.25,
    pointValue: 0.50,
    marginRequirement: 1980,
    suggestedRiskPerTrade: 75,
    tradingSessions: ['US Session', 'Overnight'],
    isBeginnerFriendly: true
  },

  // Futures - Energy & Commodities
  {
    symbol: 'CL',
    name: 'Crude Oil',
    category: 'futures',
    subcategory: 'Energy',
    description: 'High profit potential with energy sector volatility',
    volatility: 'high',
    liquidity: 'high',
    riskLevel: 4,
    tickSize: 0.01,
    pointValue: 10.00,
    marginRequirement: 6600,
    suggestedRiskPerTrade: 800,
    tradingSessions: ['US Session', 'Asian Session'],
    isBeginnerFriendly: false
  },
  {
    symbol: 'NG',
    name: 'Natural Gas',
    category: 'futures',
    subcategory: 'Energy',
    description: 'Highly volatile energy commodity',
    volatility: 'high',
    liquidity: 'medium',
    riskLevel: 5,
    tickSize: 0.001,
    pointValue: 10.00,
    marginRequirement: 2970,
    suggestedRiskPerTrade: 1000,
    tradingSessions: ['US Session'],
    isBeginnerFriendly: false
  },
  {
    symbol: 'GC',
    name: 'Gold',
    category: 'futures',
    subcategory: 'Precious Metals',
    description: 'Safe haven asset with steady demand',
    volatility: 'medium',
    liquidity: 'high',
    riskLevel: 3,
    tickSize: 0.10,
    pointValue: 10.00,
    marginRequirement: 11000,
    suggestedRiskPerTrade: 600,
    tradingSessions: ['US Session', 'Asian Session', 'European Session'],
    isBeginnerFriendly: true
  },
  {
    symbol: 'SI',
    name: 'Silver',
    category: 'futures',
    subcategory: 'Precious Metals',
    description: 'More volatile than gold, industrial demand',
    volatility: 'high',
    liquidity: 'medium',
    riskLevel: 4,
    tickSize: 0.005,
    pointValue: 25.00,
    marginRequirement: 14300,
    suggestedRiskPerTrade: 750,
    tradingSessions: ['US Session', 'Asian Session'],
    isBeginnerFriendly: false
  },

  // Forex - Major Pairs
  {
    symbol: 'EUR/USD',
    name: 'Euro/US Dollar',
    category: 'forex',
    subcategory: 'Major Pairs',
    description: 'Most liquid forex pair with tight spreads',
    volatility: 'medium',
    liquidity: 'high',
    riskLevel: 2,
    tickSize: 0.00001,
    pointValue: 10.00,
    marginRequirement: 3300,
    suggestedRiskPerTrade: 100,
    tradingSessions: ['European Session', 'US Session'],
    isBeginnerFriendly: true
  },
  {
    symbol: 'GBP/USD',
    name: 'British Pound/US Dollar',
    category: 'forex',
    subcategory: 'Major Pairs',
    description: 'High volatility with major price swings',
    volatility: 'high',
    liquidity: 'high',
    riskLevel: 3,
    tickSize: 0.00001,
    pointValue: 10.00,
    marginRequirement: 3300,
    suggestedRiskPerTrade: 150,
    tradingSessions: ['European Session', 'US Session'],
    isBeginnerFriendly: false
  },
  {
    symbol: 'USD/JPY',
    name: 'US Dollar/Japanese Yen',
    category: 'forex',
    subcategory: 'Major Pairs',
    description: 'Popular Asian pair with good liquidity',
    volatility: 'medium',
    liquidity: 'high',
    riskLevel: 2,
    tickSize: 0.001,
    pointValue: 10.00,
    marginRequirement: 3300,
    suggestedRiskPerTrade: 120,
    tradingSessions: ['Asian Session', 'US Session'],
    isBeginnerFriendly: true
  },
  {
    symbol: 'AUD/USD',
    name: 'Australian Dollar/US Dollar',
    category: 'forex',
    subcategory: 'Commodity Currencies',
    description: 'Commodity-correlated currency pair',
    volatility: 'medium',
    liquidity: 'high',
    riskLevel: 3,
    tickSize: 0.00001,
    pointValue: 10.00,
    marginRequirement: 3300,
    suggestedRiskPerTrade: 130,
    tradingSessions: ['Asian Session', 'US Session'],
    isBeginnerFriendly: true
  },

  // Stocks - Large Cap
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    category: 'stocks',
    subcategory: 'Large Cap Tech',
    description: 'Most valuable tech company with high liquidity',
    volatility: 'medium',
    liquidity: 'high',
    riskLevel: 2,
    tickSize: 0.01,
    pointValue: 1.00,
    marginRequirement: 6600,
    suggestedRiskPerTrade: 200,
    tradingSessions: ['US Session'],
    isBeginnerFriendly: true
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    category: 'stocks',
    subcategory: 'Large Cap Tech',
    description: 'High volatility electric vehicle leader',
    volatility: 'high',
    liquidity: 'high',
    riskLevel: 4,
    tickSize: 0.01,
    pointValue: 1.00,
    marginRequirement: 13200,
    suggestedRiskPerTrade: 400,
    tradingSessions: ['US Session'],
    isBeginnerFriendly: false
  },

  // ETFs
  {
    symbol: 'SPY',
    name: 'SPDR S&P 500 ETF',
    category: 'stocks',
    subcategory: 'ETFs',
    description: 'Tracks S&P 500 index with high liquidity',
    volatility: 'low',
    liquidity: 'high',
    riskLevel: 1,
    tickSize: 0.01,
    pointValue: 1.00,
    marginRequirement: 5500,
    suggestedRiskPerTrade: 150,
    tradingSessions: ['US Session'],
    isBeginnerFriendly: true
  },

  // Crypto
  {
    symbol: 'BTC/USD',
    name: 'Bitcoin/US Dollar',
    category: 'crypto',
    subcategory: 'Major Crypto',
    description: 'Leading cryptocurrency with high volatility',
    volatility: 'high',
    liquidity: 'high',
    riskLevel: 5,
    tickSize: 0.01,
    pointValue: 1.00,
    marginRequirement: 19800,
    suggestedRiskPerTrade: 1000,
    tradingSessions: ['24/7'],
    isBeginnerFriendly: false
  },
  {
    symbol: 'ETH/USD',
    name: 'Ethereum/US Dollar',
    category: 'crypto',
    subcategory: 'Major Crypto',
    description: 'Second largest cryptocurrency',
    volatility: 'high',
    liquidity: 'high',
    riskLevel: 5,
    tickSize: 0.01,
    pointValue: 1.00,
    marginRequirement: 6600,
    suggestedRiskPerTrade: 800,
    tradingSessions: ['24/7'],
    isBeginnerFriendly: false
  }
];

// Asset categories for filtering
export const ASSET_CATEGORIES = {
  futures: {
    name: 'Futures',
    subcategories: ['Major Indices', 'Micro Contracts', 'Energy', 'Precious Metals', 'Agricultural']
  },
  forex: {
    name: 'Forex',
    subcategories: ['Major Pairs', 'Minor Pairs', 'Commodity Currencies', 'Exotic Pairs']
  },
  stocks: {
    name: 'Stocks & ETFs',
    subcategories: ['Large Cap Tech', 'ETFs', 'Small Cap', 'Sector ETFs']
  },
  crypto: {
    name: 'Cryptocurrency',
    subcategories: ['Major Crypto', 'Altcoins']
  }
};

// Get assets by category
export const getAssetsByCategory = (category: string) => {
  return TRADING_ASSETS.filter(asset => asset.category === category);
};

// Get beginner-friendly assets
export const getBeginnerFriendlyAssets = () => {
  return TRADING_ASSETS.filter(asset => asset.isBeginnerFriendly);
};

// Get risk level suggestions based on asset
export const getRiskSuggestion = (assetSymbol: string, accountBalance: number) => {
  const asset = TRADING_ASSETS.find(a => a.symbol === assetSymbol);
  if (!asset) return { suggestedRisk: 500, reasoning: 'Default risk amount' };

  const accountRiskPercentage = Math.min(2.0, Math.max(0.5, asset.riskLevel * 0.4));
  const suggestedRisk = Math.min(asset.suggestedRiskPerTrade, accountBalance * (accountRiskPercentage / 100));

  let reasoning = `Based on ${asset.name} (${asset.volatility} volatility, risk level ${asset.riskLevel}/5)`;
  
  if (asset.isBeginnerFriendly) {
    reasoning += ' - Beginner-friendly instrument';
  } else {
    reasoning += ' - Advanced instrument, consider smaller position sizes';
  }

  return { suggestedRisk: Math.round(suggestedRisk), reasoning };
};