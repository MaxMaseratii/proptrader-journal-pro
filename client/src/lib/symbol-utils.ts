/**
 * Utility functions for handling trading symbols and TradingView integration
 */

/**
 * Removes contract month suffixes from futures symbols for TradingView compatibility
 * Examples: MNQU -> MNQ, ESU -> ES, CLZ -> CL, NGH -> NG
 */
export function cleanSymbolForTradingView(symbol: string): string {
  if (!symbol) return symbol;
  
  // Common futures symbols and their base forms
  const symbolMappings: Record<string, string> = {
    // E-mini indices
    'ES': 'ES',   // S&P 500 E-mini
    'NQ': 'NQ',   // Nasdaq E-mini  
    'YM': 'YM',   // Dow Jones E-mini
    'RTY': 'RTY', // Russell 2000 E-mini
    'MNQ': 'MNQ', // Micro Nasdaq
    'MES': 'MES', // Micro S&P 500
    'MYM': 'MYM', // Micro Dow Jones
    'M2K': 'M2K', // Micro Russell 2000
    
    // Energy
    'CL': 'CL',   // Crude Oil
    'NG': 'NG',   // Natural Gas
    'RB': 'RB',   // RBOB Gasoline
    'HO': 'HO',   // Heating Oil
    
    // Metals
    'GC': 'GC',   // Gold
    'SI': 'SI',   // Silver
    'HG': 'HG',   // Copper
    'PA': 'PA',   // Palladium
    'PL': 'PL',   // Platinum
    
    // Agricultural
    'ZC': 'ZC',   // Corn
    'ZS': 'ZS',   // Soybeans
    'ZW': 'ZW',   // Wheat
    'KC': 'KC',   // Coffee
    'SB': 'SB',   // Sugar
    'CT': 'CT',   // Cotton
    
    // Currencies
    '6E': '6E',   // Euro
    '6J': '6J',   // Japanese Yen
    '6B': '6B',   // British Pound
    '6A': '6A',   // Australian Dollar
    '6C': '6C',   // Canadian Dollar
    '6S': '6S',   // Swiss Franc
    
    // Bonds/Interest Rates
    'ZB': 'ZB',   // 30-Year Treasury Bond
    'ZN': 'ZN',   // 10-Year Treasury Note
    'ZF': 'ZF',   // 5-Year Treasury Note
    'ZT': 'ZT',   // 2-Year Treasury Note
  };

  // Convert to uppercase for comparison
  const upperSymbol = symbol.toUpperCase();
  
  // Check if it's already a clean symbol
  if (symbolMappings[upperSymbol]) {
    return symbolMappings[upperSymbol];
  }
  
  // Try to match against contract month patterns
  // Futures contracts typically end with month code + year (H25, M25, U25, Z25, etc.)
  // Month codes: F, G, H, J, K, M, N, Q, U, V, X, Z
  const contractMonthPattern = /^([A-Z]+)[FGHJKMNQUVXZ]\d*$/;
  const match = upperSymbol.match(contractMonthPattern);
  
  if (match) {
    const baseSymbol = match[1];
    // Return the clean base symbol if it exists in our mappings
    if (symbolMappings[baseSymbol]) {
      return symbolMappings[baseSymbol];
    }
    // Otherwise return the base symbol
    return baseSymbol;
  }
  
  // Return original symbol if no pattern matches
  return symbol;
}

/**
 * Gets the TradingView symbol format for a given trading symbol
 * This ensures proper symbol formatting for TradingView widgets
 */
export function getTradingViewSymbol(symbol: string, exchange: string = 'CBOT'): string {
  const cleanSymbol = cleanSymbolForTradingView(symbol);
  
  // Exchange mappings for different symbol types
  const exchangeMappings: Record<string, string> = {
    // CME Group symbols
    'ES': 'CME',
    'NQ': 'CME', 
    'YM': 'CBOT',
    'RTY': 'CME',
    'MNQ': 'CME',
    'MES': 'CME',
    'MYM': 'CBOT',
    'M2K': 'CME',
    
    // NYMEX symbols
    'CL': 'NYMEX',
    'NG': 'NYMEX',
    'RB': 'NYMEX',
    'HO': 'NYMEX',
    'GC': 'COMEX',
    'SI': 'COMEX',
    'HG': 'COMEX',
    'PA': 'NYMEX',
    'PL': 'NYMEX',
    
    // CBOT symbols
    'ZC': 'CBOT',
    'ZS': 'CBOT',
    'ZW': 'CBOT',
    'ZB': 'CBOT',
    'ZN': 'CBOT',
    'ZF': 'CBOT',
    'ZT': 'CBOT',
    
    // ICE symbols
    'KC': 'ICE',
    'SB': 'ICE',
    'CT': 'ICE',
    
    // CME FX
    '6E': 'CME',
    '6J': 'CME',
    '6B': 'CME',
    '6A': 'CME',
    '6C': 'CME',
    '6S': 'CME',
  };
  
  const symbolExchange = exchangeMappings[cleanSymbol] || exchange;
  return `${symbolExchange}:${cleanSymbol}`;
}

/**
 * Checks if a symbol appears to be a futures contract with month code
 */
export function isFuturesContract(symbol: string): boolean {
  if (!symbol) return false;
  const contractPattern = /^[A-Z]+[FGHJKMNQUVXZ]\d*$/;
  return contractPattern.test(symbol.toUpperCase());
}

/**
 * Gets a human-readable name for a trading symbol
 */
export function getSymbolDisplayName(symbol: string): string {
  const cleanSymbol = cleanSymbolForTradingView(symbol);
  
  const symbolNames: Record<string, string> = {
    'ES': 'S&P 500 E-mini',
    'NQ': 'Nasdaq E-mini',
    'YM': 'Dow Jones E-mini',
    'RTY': 'Russell 2000 E-mini',
    'MNQ': 'Micro Nasdaq',
    'MES': 'Micro S&P 500',
    'CL': 'Crude Oil',
    'NG': 'Natural Gas',
    'GC': 'Gold',
    'SI': 'Silver',
    'ZC': 'Corn',
    'ZS': 'Soybeans',
    '6E': 'Euro',
    '6J': 'Japanese Yen',
    'ZB': '30Y Treasury Bond',
    'ZN': '10Y Treasury Note',
  };
  
  return symbolNames[cleanSymbol] || cleanSymbol;
}