// ACCURATE CSV PROCESSOR - Fixed Algorithm for Proper P&L Calculation
export interface AccurateTradeResult {
  symbol: string;
  side: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  date: string;
  entryTime: string;
  exitTime: string;
  orderId: string;
  status: 'closed';
  notes: string;
}

export interface AccurateProcessResult {
  success: boolean;
  trades: AccurateTradeResult[];
  summary: {
    totalFills: number;
    tradesCreated: number;
    totalPnL: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
  };
  error?: string;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseTradovateOrder(row: any) {
  return {
    orderId: row.orderId || row['Order ID'] || '',
    account: row.Account || '',
    side: (row['B/S'] || row.side || '').toLowerCase().includes('buy') ? 'buy' : 'sell',
    contract: row.Contract || row.Symbol || '',
    product: row.Product || '',
    avgPrice: parseFloat(row.avgPrice || row['Avg Fill Price'] || row.Price || '0'),
    quantity: parseInt(row.filledQty || row['Filled Qty'] || row.Quantity || '0'),
    fillTime: row['Fill Time'] || row.Time || row.Timestamp || '',
    date: row.Date || '',
    status: (row.Status || '').trim(),
    type: row.Type || row.OrderType || '',
    limitPrice: parseFloat(row['Limit Price'] || '0'),
    stopPrice: parseFloat(row['Stop Price'] || '0')
  };
}

export function processAccurateCSV(csvContent: string, fileName: string): AccurateProcessResult {
  try {
    console.log('🔧 Starting ACCURATE CSV Processing...');
    
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file must contain at least a header row and one data row');
    }

    const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(line => {
      const values = parseCSVLine(line);
      const row: any = {};
      header.forEach((key, index) => {
        row[key] = values[index] || '';
      });
      return row;
    });

    console.log('📋 CSV Data Loaded:', {
      fileName,
      totalRows: rows.length,
      columns: header
    });

    // CRITICAL: Only process FILLED orders - ignore cancelled/pending
    const filledOrders = rows
      .filter(row => row.Status && row.Status.trim() === 'Filled')
      .map(row => parseTradovateOrder(row))
      .filter(order => order.avgPrice > 0 && order.quantity > 0);

    console.log('✅ Filtered to filled orders:', {
      totalOrders: rows.length,
      filledOrders: filledOrders.length,
      sample: filledOrders.slice(0, 2)
    });

    // Group orders by symbol and date for accurate trade matching
    const tradeGroups = new Map<string, any[]>();
    
    filledOrders.forEach(order => {
      const key = `${order.contract}-${order.date}`;
      if (!tradeGroups.has(key)) {
        tradeGroups.set(key, []);
      }
      tradeGroups.get(key)!.push(order);
    });

    console.log('📊 Trade groups created:', tradeGroups.size);

    const trades: AccurateTradeResult[] = [];
    let totalPnL = 0;

    // Process each group to create accurate round-trip trades
    for (const [groupKey, orders] of tradeGroups) {
      console.log(`🔍 Processing group: ${groupKey}`, orders.length, 'orders');
      
      // Sort by fill time
      orders.sort((a, b) => new Date(a.fillTime).getTime() - new Date(b.fillTime).getTime());
      
      // Create round-trip trades from opposing orders
      const processed = new Set<number>();
      
      for (let i = 0; i < orders.length; i++) {
        if (processed.has(i)) continue;
        
        const order1 = orders[i];
        
        // Look for opposing order to complete round trip
        for (let j = i + 1; j < orders.length; j++) {
          if (processed.has(j)) continue;
          
          const order2 = orders[j];
          
          // Must be opposing sides and same quantity
          if (order1.side !== order2.side && order1.quantity === order2.quantity) {
            const buyOrder = order1.side === 'buy' ? order1 : order2;
            const sellOrder = order1.side === 'sell' ? order1 : order2;
            
            // Calculate P&L based on contract type
            const isES = buyOrder.product === 'ES';
            const isMES = buyOrder.product === 'MES' || buyOrder.product === 'MESU5';
            const isNQ = buyOrder.product === 'NQ';
            
            let pointValue = 50; // Default ES
            if (isMES) pointValue = 5;  // MES is 1/10 of ES
            if (isNQ) pointValue = 20;  // NQ point value
            
            const priceDiff = sellOrder.avgPrice - buyOrder.avgPrice;
            const pnl = priceDiff * buyOrder.quantity * pointValue;
            
            totalPnL += pnl;
            
            const trade: AccurateTradeResult = {
              symbol: buyOrder.contract,
              side: 'long', // All round trips are long (buy then sell)
              quantity: buyOrder.quantity,
              entryPrice: buyOrder.avgPrice,
              exitPrice: sellOrder.avgPrice,
              pnl,
              date: buyOrder.date,
              entryTime: buyOrder.fillTime,
              exitTime: sellOrder.fillTime,
              orderId: `${buyOrder.orderId}-${sellOrder.orderId}`,
              status: 'closed',
              notes: `${fileName}: Buy ${buyOrder.avgPrice} → Sell ${sellOrder.avgPrice} | P&L: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`
            };
            
            trades.push(trade);
            processed.add(i);
            processed.add(j);
            
            console.log(`💰 Trade created: ${trade.symbol} ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`);
            break;
          }
        }
      }
    }

    const winningTrades = trades.filter(t => t.pnl > 0).length;
    const losingTrades = trades.filter(t => t.pnl < 0).length;
    
    console.log('🎯 ACCURATE Processing Complete:', {
      tradesCreated: trades.length,
      totalPnL: totalPnL.toFixed(2),
      winningTrades,
      losingTrades,
      winRate: trades.length > 0 ? ((winningTrades / trades.length) * 100).toFixed(1) : 0
    });

    return {
      success: true,
      trades,
      summary: {
        totalFills: filledOrders.length,
        tradesCreated: trades.length,
        totalPnL,
        winningTrades,
        losingTrades,
        winRate: trades.length > 0 ? (winningTrades / trades.length) * 100 : 0
      }
    };

  } catch (error) {
    console.error('❌ ACCURATE CSV Processing Error:', error);
    return {
      success: false,
      trades: [],
      summary: {
        totalFills: 0,
        tradesCreated: 0,
        totalPnL: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0
      },
      error: error instanceof Error ? error.message : 'Unknown processing error'
    };
  }
}