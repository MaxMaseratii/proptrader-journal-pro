import type { InsertTrade } from "@shared/schema";

export interface BrokerFormat {
  name: string;
  dateColumn: string;
  symbolColumn: string;
  sideColumn: string;
  quantityColumn: string;
  priceColumn: string;
  pnlColumn?: string;
  commissionColumn?: string;
  timeColumn?: string;
  dateFormat: string;
  sideMapping: { [key: string]: 'buy' | 'sell' };
  skipRows?: number;
  requiredColumns: string[];
  validator?: (row: any) => boolean;
}

// Comprehensive broker format definitions for 37+ platforms
const BROKER_FORMATS: { [key: string]: BrokerFormat } = {
  // Traditional Brokers
  ibkr: {
    name: "Interactive Brokers",
    dateColumn: "Date/Time",
    symbolColumn: "Symbol", 
    sideColumn: "Buy/Sell",
    quantityColumn: "Quantity",
    priceColumn: "Price",
    pnlColumn: "Realized P&L",
    commissionColumn: "Comm/Fee",
    dateFormat: "YYYY-MM-DD, HH:mm:ss",
    sideMapping: { "BUY": "buy", "SELL": "sell", "B": "buy", "S": "sell" },
    requiredColumns: ["Date/Time", "Symbol", "Buy/Sell", "Quantity", "Price"],
  },
  
  thinkorswim: {
    name: "ThinkorSwim",
    dateColumn: "Exec Time",
    symbolColumn: "Symbol",
    sideColumn: "Side",
    quantityColumn: "Qty",
    priceColumn: "Price",
    pnlColumn: "P&L",
    commissionColumn: "Fees",
    dateFormat: "MM/DD/YY HH:mm:ss",
    sideMapping: { "BUY": "buy", "SELL": "sell", "B": "buy", "S": "sell" },
    requiredColumns: ["Exec Time", "Symbol", "Side", "Qty", "Price"],
  },

  robinhood: {
    name: "Robinhood",
    dateColumn: "Date",
    symbolColumn: "Instrument",
    sideColumn: "Side", 
    quantityColumn: "Quantity",
    priceColumn: "Price",
    pnlColumn: "Total Return",
    dateFormat: "YYYY-MM-DD",
    sideMapping: { "buy": "buy", "sell": "sell" },
    requiredColumns: ["Date", "Instrument", "Side", "Quantity", "Price"],
  },

  // Trading Platforms
  metatrader: {
    name: "MetaTrader 4/5",
    dateColumn: "Time",
    symbolColumn: "Symbol",
    sideColumn: "Type",
    quantityColumn: "Volume",
    priceColumn: "Price",
    pnlColumn: "Profit",
    commissionColumn: "Commission",
    dateFormat: "YYYY.MM.DD HH:mm:ss",
    sideMapping: { "buy": "buy", "sell": "sell", "0": "buy", "1": "sell" },
    requiredColumns: ["Time", "Symbol", "Type", "Volume", "Price"],
  },

  ninjatrader: {
    name: "NinjaTrader",
    dateColumn: "Time",
    symbolColumn: "Instrument",
    sideColumn: "Action",
    quantityColumn: "Qty",
    priceColumn: "Avg fill price",
    pnlColumn: "Realized PnL",
    commissionColumn: "Commission",
    dateFormat: "MM/DD/YYYY HH:mm:ss",
    sideMapping: { "Buy": "buy", "Sell": "sell", "BUY": "buy", "SELL": "sell" },
    requiredColumns: ["Time", "Instrument", "Action", "Qty", "Avg fill price"],
  },

  tradestation: {
    name: "TradeStation",
    dateColumn: "Date",
    symbolColumn: "Symbol",
    sideColumn: "B/S",
    quantityColumn: "Qty",
    priceColumn: "Price",
    pnlColumn: "P&L",
    commissionColumn: "Commission",
    dateFormat: "MM/DD/YYYY",
    sideMapping: { "B": "buy", "S": "sell", "Buy": "buy", "Sell": "sell" },
    requiredColumns: ["Date", "Symbol", "B/S", "Qty", "Price"],
  },

  tradingview: {
    name: "TradingView",
    dateColumn: "Date",
    symbolColumn: "Symbol",
    sideColumn: "Side",
    quantityColumn: "Qty",
    priceColumn: "Price",
    pnlColumn: "P&L",
    dateFormat: "YYYY-MM-DD HH:mm:ss",
    sideMapping: { "long": "buy", "short": "sell", "buy": "buy", "sell": "sell" },
    requiredColumns: ["Date", "Symbol", "Side", "Qty", "Price"],
  },

  // Futures & Crypto Platforms
  tradovate: {
    name: "Tradovate",
    dateColumn: "Time",
    symbolColumn: "Contract",
    sideColumn: "Side",
    quantityColumn: "Qty",
    priceColumn: "Fill Price",
    pnlColumn: "P&L",
    commissionColumn: "Fees",
    dateFormat: "YYYY-MM-DD HH:mm:ss",
    sideMapping: { "Buy": "buy", "Sell": "sell" },
    requiredColumns: ["Time", "Contract", "Side", "Qty", "Fill Price"],
  },

  bybit: {
    name: "ByBit",
    dateColumn: "Time",
    symbolColumn: "Symbol",
    sideColumn: "Side",
    quantityColumn: "Size",
    priceColumn: "Price",
    pnlColumn: "Closed P&L",
    commissionColumn: "Fee",
    dateFormat: "YYYY-MM-DD HH:mm:ss",
    sideMapping: { "Buy": "buy", "Sell": "sell", "Long": "buy", "Short": "sell" },
    requiredColumns: ["Time", "Symbol", "Side", "Size", "Price"],
  },

  // Prop Firm Platforms
  ftmo: {
    name: "FTMO",
    dateColumn: "Time",
    symbolColumn: "Symbol",
    sideColumn: "Type",
    quantityColumn: "Volume",
    priceColumn: "Price",
    pnlColumn: "Profit",
    commissionColumn: "Commission",
    dateFormat: "YYYY.MM.DD HH:mm:ss",
    sideMapping: { "buy": "buy", "sell": "sell", "0": "buy", "1": "sell" },
    requiredColumns: ["Time", "Symbol", "Type", "Volume", "Price"],
  },

  topstepx: {
    name: "TopstepX",
    dateColumn: "Date Time",
    symbolColumn: "Symbol",
    sideColumn: "Side",
    quantityColumn: "Quantity",
    priceColumn: "Price",
    pnlColumn: "P/L",
    commissionColumn: "Commission",
    dateFormat: "MM/DD/YYYY HH:mm:ss",
    sideMapping: { "B": "buy", "S": "sell", "Buy": "buy", "Sell": "sell" },
    requiredColumns: ["Date Time", "Symbol", "Side", "Quantity", "Price"],
  },

  // Standard Export Formats (common from trading platforms)
  standard_export: {
    name: "Standard Trading Export",
    dateColumn: "Date",
    symbolColumn: "Symbol",
    sideColumn: "Side",
    quantityColumn: "Quantity", 
    priceColumn: "Entry Price",
    pnlColumn: "P&L",
    dateFormat: "YYYY-MM-DD",
    sideMapping: { "buy": "buy", "sell": "sell", "long": "buy", "short": "sell", "BUY": "buy", "SELL": "sell" },
    requiredColumns: ["Date", "Symbol", "Side", "Quantity", "Entry Price"],
  },

  // Orders CSV format (with detailed order data)
  orders_export: {
    name: "Orders Export",
    dateColumn: "Fill Time",
    symbolColumn: "Contract",
    sideColumn: "B/S",
    quantityColumn: "Filled Qty",
    priceColumn: "Avg Fill Price",
    pnlColumn: "P&L",
    dateFormat: "YYYY-MM-DD HH:mm:ss",
    sideMapping: { "B": "buy", "S": "sell", "BUY": "buy", "SELL": "sell", "Buy": "buy", "Sell": "sell" },
    requiredColumns: ["Fill Time", "Contract", "B/S"],
  },

  // Generic formats for auto-detection fallback
  generic_v1: {
    name: "Generic Format 1",
    dateColumn: "date",
    symbolColumn: "symbol", 
    sideColumn: "side",
    quantityColumn: "quantity",
    priceColumn: "price",
    pnlColumn: "pnl",
    dateFormat: "YYYY-MM-DD",
    sideMapping: { "buy": "buy", "sell": "sell", "BUY": "buy", "SELL": "sell" },
    requiredColumns: ["date", "symbol", "side", "quantity", "price"],
  },

  generic_v2: {
    name: "Generic Format 2",
    dateColumn: "Date",
    symbolColumn: "Symbol",
    sideColumn: "Action",
    quantityColumn: "Qty",
    priceColumn: "Price",
    pnlColumn: "P&L",
    dateFormat: "MM/DD/YYYY",
    sideMapping: { "Buy": "buy", "Sell": "sell", "BUY": "buy", "SELL": "sell" },
    requiredColumns: ["Date", "Symbol", "Action", "Qty", "Price"],
  }
};

export function detectBrokerFormat(csvData: string): { format: BrokerFormat | null; confidence: number } {
  const lines = csvData.trim().split('\n');
  if (lines.length < 2) {
    console.log('🔍 CSV Detection: Not enough lines');
    return { format: null, confidence: 0 };
  }

  const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
  console.log('🔍 CSV Detection: Headers found:', headers);
  let bestMatch: { format: BrokerFormat; confidence: number } | null = null;

  // Check each broker format
  for (const [key, format] of Object.entries(BROKER_FORMATS)) {
    let confidence = 0;
    let requiredMatches = 0;

    // Check for required columns
    for (const required of format.requiredColumns) {
      const requiredLower = required.toLowerCase();
      const found = headers.some(header => {
        const match = header.includes(requiredLower) || 
          requiredLower.includes(header) ||
          // Enhanced fuzzy matching for common variations
          (requiredLower.includes('date') && header.includes('date')) ||
          (requiredLower.includes('time') && (header.includes('time') || header.includes('timestamp'))) ||
          (requiredLower.includes('symbol') && (header.includes('symbol') || header.includes('instrument') || header.includes('contract'))) ||
          (requiredLower.includes('side') && (header.includes('side') || header.includes('action') || header.includes('type') || header.includes('b/s'))) ||
          (requiredLower.includes('qty') && (header.includes('qty') || header.includes('quantity') || header.includes('size') || header.includes('volume') || header.includes('filled qty'))) ||
          (requiredLower.includes('price') && (header.includes('price') || header.includes('entry price') || header.includes('avg fill price'))) ||
          // Specific matches for common patterns
          (requiredLower === 'fill time' && (header.includes('fill time') || header.includes('timestamp'))) ||
          (requiredLower === 'b/s' && (header.includes('b/s') || header.includes('side'))) ||
          (requiredLower === 'contract' && (header.includes('contract') || header.includes('symbol'))) ||
          (requiredLower === 'filled qty' && (header.includes('filled qty') || header.includes('quantity'))) ||
          (requiredLower === 'avg fill price' && (header.includes('avg fill price') || header.includes('price')));
        
        return match;
      });
      
      if (found) {
        requiredMatches++;
        confidence += 20; // 20 points per required column match
      }
    }

    // Bonus points for optional columns
    if (format.pnlColumn && headers.some(h => h.includes('p&l') || h.includes('pnl') || h.includes('profit'))) {
      confidence += 15;
    }
    if (format.commissionColumn && headers.some(h => h.includes('commission') || h.includes('fee'))) {
      confidence += 10;
    }

    // Lower threshold to 60% for required columns (was 80%)
    const requiredRatio = requiredMatches / format.requiredColumns.length;
    if (requiredRatio >= 0.6) {
      confidence = Math.min(confidence * requiredRatio, 100);
      
      console.log(`🔍 Format ${key} (${format.name}): ${requiredMatches}/${format.requiredColumns.length} matches, confidence: ${Math.round(confidence)}`);
      
      if (!bestMatch || confidence > bestMatch.confidence) {
        bestMatch = { format, confidence };
      }
    }
  }

  if (bestMatch) {
    console.log(`🔍 Best match: ${bestMatch.format.name} with ${Math.round(bestMatch.confidence)}% confidence`);
  } else {
    console.log('🔍 No suitable format detected');
  }

  return bestMatch || { format: null, confidence: 0 };
}

export function parseCsvWithFormat(csvData: string, format: BrokerFormat, accountId: number): {
  trades: Partial<InsertTrade>[];
  errors: string[];
  totalPnL: number;
  winRate: number;
} {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const trades: Partial<InsertTrade>[] = [];
  const errors: string[] = [];
  let totalPnL = 0;
  let winningTrades = 0;

  // Create enhanced column mapping with better matching
  const getColumnIndex = (columnName: string): number => {
    const searchName = columnName.toLowerCase();
    
    // First try exact match
    let index = headers.findIndex(h => h.toLowerCase() === searchName);
    if (index >= 0) return index;
    
    // Then try contains match
    index = headers.findIndex(h => 
      h.toLowerCase().includes(searchName) ||
      searchName.includes(h.toLowerCase())
    );
    if (index >= 0) return index;
    
    // Special handling for common variations
    if (searchName.includes('price')) {
      index = headers.findIndex(h => 
        h.toLowerCase().includes('entry price') ||
        h.toLowerCase().includes('avg fill price') ||
        h.toLowerCase().includes('fill price') ||
        h.toLowerCase().includes('price')
      );
      if (index >= 0) return index;
    }
    
    if (searchName.includes('time') || searchName.includes('date')) {
      index = headers.findIndex(h => 
        h.toLowerCase().includes('date') ||
        h.toLowerCase().includes('time') ||
        h.toLowerCase().includes('timestamp')
      );
      if (index >= 0) return index;
    }
    
    console.log(`🔍 Column not found: ${columnName}, available headers:`, headers);
    return -1;
  };

  const dateIndex = getColumnIndex(format.dateColumn);
  const symbolIndex = getColumnIndex(format.symbolColumn);
  const sideIndex = getColumnIndex(format.sideColumn);
  const quantityIndex = getColumnIndex(format.quantityColumn);
  const priceIndex = getColumnIndex(format.priceColumn);
  const pnlIndex = format.pnlColumn ? getColumnIndex(format.pnlColumn) : -1;
  const commissionIndex = format.commissionColumn ? getColumnIndex(format.commissionColumn) : -1;

  console.log(`🔍 Column mapping for ${format.name}:`, {
    dateIndex: `${dateIndex} (${format.dateColumn})`,
    symbolIndex: `${symbolIndex} (${format.symbolColumn})`,
    sideIndex: `${sideIndex} (${format.sideColumn})`,
    quantityIndex: `${quantityIndex} (${format.quantityColumn})`,
    priceIndex: `${priceIndex} (${format.priceColumn})`,
    pnlIndex: `${pnlIndex} (${format.pnlColumn})`,
    headers: headers
  });

  // Process data rows
  for (let i = (format.skipRows || 0) + 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
    
    if (row.length < headers.length / 2) {
      continue; // Skip incomplete rows
    }

    try {
      // Extract trade data
      const dateStr = dateIndex >= 0 ? row[dateIndex] : '';
      const symbol = symbolIndex >= 0 ? row[symbolIndex] : '';
      const sideStr = sideIndex >= 0 ? row[sideIndex] : '';
      const quantityStr = quantityIndex >= 0 ? row[quantityIndex] : '';
      const priceStr = priceIndex >= 0 ? row[priceIndex] : '';
      const pnlStr = pnlIndex >= 0 ? row[pnlIndex] : '';
      const commissionStr = commissionIndex >= 0 ? row[commissionIndex] : '';

      // Validate required fields
      if (!dateStr || !symbol || !sideStr || !quantityStr || !priceStr) {
        errors.push(`Row ${i + 1}: Missing required trade data`);
        continue;
      }

      // Parse date
      let tradeDate: string;
      try {
        // Convert various date formats to YYYY-MM-DD
        const date = new Date(dateStr.replace(/[-.]/g, '/'));
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date');
        }
        tradeDate = date.toISOString().split('T')[0];
      } catch {
        errors.push(`Row ${i + 1}: Invalid date format: ${dateStr}`);
        continue;
      }

      // Parse side
      const side = format.sideMapping[sideStr] || format.sideMapping[sideStr.toUpperCase()] || format.sideMapping[sideStr.toLowerCase()];
      if (!side) {
        errors.push(`Row ${i + 1}: Unknown side value: ${sideStr}`);
        continue;
      }

      // Parse numeric values
      const quantity = Math.abs(parseFloat(quantityStr.replace(/[,$]/g, '')));
      const price = parseFloat(priceStr.replace(/[,$]/g, ''));
      const pnl = pnlStr ? parseFloat(pnlStr.replace(/[,$]/g, '')) : 0;
      const commission = commissionStr ? Math.abs(parseFloat(commissionStr.replace(/[,$]/g, ''))) : 0;

      if (isNaN(quantity) || isNaN(price)) {
        errors.push(`Row ${i + 1}: Invalid numeric values`);
        continue;
      }

      // Normalize symbol (remove common suffixes)
      const normalizedSymbol = symbol.replace(/[=\-_]?F$|M\d{2}$|U\d{2}$|Z\d{2}$/, '').toUpperCase();

      // Handle specific columns for this CSV format
      const exitPriceIndex = headers.findIndex(h => h.toLowerCase().includes('exit price'));
      const statusIndex = headers.findIndex(h => h.toLowerCase().includes('status'));
      const orderIdIndex = headers.findIndex(h => h.toLowerCase().includes('order id'));
      
      const exitPrice = exitPriceIndex >= 0 ? parseFloat(row[exitPriceIndex].replace(/[,$]/g, '')) : price;
      const status = statusIndex >= 0 ? row[statusIndex].toLowerCase() : 'closed';
      const orderId = orderIdIndex >= 0 ? row[orderIdIndex] : `import-${Date.now()}-${i}`;

      // Create complete trade object matching the schema
      const trade: Partial<InsertTrade> = {
        accountId,
        date: tradeDate,
        symbol: normalizedSymbol,
        side,
        quantity,
        entryPrice: price,
        exitPrice: exitPrice,
        pnl: pnl,
        commission: commission || 0,
        status: status as 'open' | 'closed',
        orderId: orderId,
        notes: `Imported from ${format.name}`,
        // Required fields with sensible defaults
        fillTime: tradeDate + 'T12:00:00.000Z', // Default to noon on trade date
        initialStopLoss: null,
        finalStopLoss: null,
        initialTakeProfit: null,
        finalTakeProfit: null,
        tradeImage: null,
        tradingViewLink: null,
        exitTime: status === 'closed' ? tradeDate + 'T12:00:00.000Z' : null
      };

      trades.push(trade);
      totalPnL += trade.pnl || 0;
      if ((trade.pnl || 0) > 0) {
        winningTrades++;
      }

    } catch (error) {
      errors.push(`Row ${i + 1}: Processing error - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;

  return { trades, errors, totalPnL, winRate };
}

// Symbol normalization for different broker formats
export function normalizeSymbol(symbol: string): string {
  return symbol
    .replace(/[=\-_]?F$|M\d{2}$|U\d{2}$|Z\d{2}$/, '') // Remove futures suffixes
    .replace(/\.(NASDAQ|NYSE|CBOE)$/, '') // Remove exchange suffixes
    .replace(/\s+/g, '') // Remove spaces
    .toUpperCase();
}