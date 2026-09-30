// Advanced CSV processor for handling complex trading data like Tradovate exports
import { Trade } from "@shared/schema";

interface OrderData {
  orderId: string;
  account: string;
  orderIdNumber: string;
  side: 'Buy' | 'Sell';
  contract: string;
  product: string;
  avgPrice: number;
  filledQty: number;
  fillTime: string;
  status: 'Filled' | 'Canceled';
  type: 'Limit' | 'Market' | 'Stop';
  limitPrice?: number;
  stopPrice?: number;
  quantity: number;
  timestamp: string;
  date: string;
  text: string;
}

interface TradeGroup {
  symbol: string;
  entries: OrderData[];
  exits: OrderData[];
  stops: OrderData[];
  targets: OrderData[];
  canceled: OrderData[];
}

export function processTradovateCSV(csvData: string, accountId: number): Trade[] {
  const lines = csvData.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const orders: OrderData[] = [];
  
  // Parse all orders from CSV
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length < headers.length) continue;
    
    const order: OrderData = {
      orderId: values[0] || '',
      account: values[1] || '',
      orderIdNumber: values[2] || '',
      side: values[3]?.trim() as 'Buy' | 'Sell',
      contract: values[4] || '',
      product: values[5] || '',
      avgPrice: parseFloat(values[7]) || 0,
      filledQty: parseFloat(values[8]) || 0,
      fillTime: values[9] || '',
      status: values[11]?.trim() as 'Filled' | 'Canceled',
      type: values[21]?.trim() as 'Limit' | 'Market' | 'Stop',
      limitPrice: parseFloat(values[22]) || undefined,
      stopPrice: parseFloat(values[23]) || undefined,
      quantity: parseFloat(values[18]) || 0,
      timestamp: values[17] || '',
      date: values[18] || '',
      text: values[19] || ''
    };
    
    orders.push(order);
  }
  
  console.log(`📊 Parsed ${orders.length} orders from CSV`);
  
  // Group orders by symbol and time proximity
  const tradeGroups = groupOrdersIntoTrades(orders);
  console.log(`🔗 Grouped into ${tradeGroups.length} potential trades`);
  
  // Convert trade groups to complete trades
  const completeTrades = tradeGroups.map(group => convertGroupToTrade(group, accountId)).filter(Boolean) as Trade[];
  
  console.log(`✅ Generated ${completeTrades.length} complete trades`);
  return completeTrades;
}

function groupOrdersIntoTrades(orders: OrderData[]): TradeGroup[] {
  const groups = new Map<string, TradeGroup>();
  
  // Sort orders by timestamp
  const sortedOrders = orders.sort((a, b) => new Date(a.fillTime).getTime() - new Date(b.fillTime).getTime());
  
  for (const order of sortedOrders) {
    if (order.status !== 'Filled') continue;
    
    const symbol = order.product;
    const timeWindow = Math.floor(new Date(order.fillTime).getTime() / (1000 * 60 * 30)); // 30-minute windows
    const groupKey = `${symbol}_${timeWindow}`;
    
    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        symbol,
        entries: [],
        exits: [],
        stops: [],
        targets: [],
        canceled: []
      });
    }
    
    const group = groups.get(groupKey)!;
    
    // Classify order type based on text and order characteristics
    if (order.text.toLowerCase().includes('exit') || order.text.toLowerCase().includes('close')) {
      group.exits.push(order);
    } else if (order.text.toLowerCase().includes('tradingview') && order.filledQty > 0) {
      // This is likely an entry order
      group.entries.push(order);
    } else if (order.type === 'Stop') {
      group.stops.push(order);
    } else if (order.type === 'Limit' && order.text.toLowerCase().includes('tradingview')) {
      group.targets.push(order);
    }
  }
  
  return Array.from(groups.values()).filter(group => group.entries.length > 0 && group.exits.length > 0);
}

function convertGroupToTrade(group: TradeGroup, accountId: number): Trade | null {
  if (group.entries.length === 0 || group.exits.length === 0) return null;
  
  // Get the primary entry and exit
  const entry = group.entries[0];
  const exit = group.exits[group.exits.length - 1]; // Last exit
  
  // Determine trade direction
  const isLong = entry.side === 'Buy';
  const side = isLong ? 'long' : 'short';
  
  // Calculate total quantity (sum of all entries)
  const totalQuantity = group.entries.reduce((sum, e) => sum + e.filledQty, 0);
  
  // Calculate weighted average entry price
  const totalEntryValue = group.entries.reduce((sum, e) => sum + (e.avgPrice * e.filledQty), 0);
  const avgEntryPrice = totalEntryValue / totalQuantity;
  
  // Calculate weighted average exit price
  const totalExitQuantity = group.exits.reduce((sum, e) => sum + e.filledQty, 0);
  const totalExitValue = group.exits.reduce((sum, e) => sum + (e.avgPrice * e.filledQty), 0);
  const avgExitPrice = totalExitValue / totalExitQuantity;
  
  // Calculate P&L based on symbol multipliers
  let multiplier = 1;
  if (group.symbol === 'ES') multiplier = 50;        // E-mini S&P 500
  else if (group.symbol === 'MES') multiplier = 5;   // Micro E-mini S&P 500
  else if (group.symbol === 'NQ') multiplier = 20;   // E-mini NASDAQ 100
  else if (group.symbol === 'MNQ') multiplier = 2;   // Micro E-mini NASDAQ 100
  
  const pointDifference = isLong ? (avgExitPrice - avgEntryPrice) : (avgEntryPrice - avgExitPrice);
  const pnl = pointDifference * totalQuantity * multiplier;
  
  // Extract stop loss and take profit levels
  const initialStopLoss = group.stops.length > 0 ? group.stops[0].stopPrice || group.stops[0].avgPrice : null;
  const finalStopLoss = group.stops.length > 0 ? group.stops[group.stops.length - 1].stopPrice || group.stops[group.stops.length - 1].avgPrice : null;
  
  const initialTakeProfit = group.targets.length > 0 ? group.targets[0].limitPrice || group.targets[0].avgPrice : null;
  const finalTakeProfit = group.targets.length > 0 ? group.targets[group.targets.length - 1].limitPrice || group.targets[group.targets.length - 1].avgPrice : null;
  
  // Create comprehensive notes
  const notes = `Entry: ${avgEntryPrice}, Exit: ${avgExitPrice} | ` +
    `Initial SL: ${initialStopLoss || 'N/A'}, Initial TP: ${initialTakeProfit || 'N/A'} | ` +
    `Final SL: ${finalStopLoss || 'N/A'}, Final TP: ${finalTakeProfit || 'N/A'}`;
  
  const trade: Trade = {
    id: 0, // Will be set by database
    accountId,
    date: entry.fillTime.split(' ')[0],
    symbol: group.symbol,
    side,
    quantity: totalQuantity,
    entryPrice: avgEntryPrice,
    exitPrice: avgExitPrice,
    pnl: parseFloat(pnl.toFixed(2)),
    status: 'closed',
    notes,
    orderId: `${entry.orderId}-${exit.orderId}`,
    fillTime: new Date(entry.fillTime),
    orderType: 'Sequential Match',
    originalQuantity: totalQuantity,
    commission: null,
    riskAmount: Math.abs(initialStopLoss ? ((avgEntryPrice - initialStopLoss) * totalQuantity * multiplier) : 20),
    riskCompliance: initialStopLoss ? Math.abs(pnl) <= Math.abs((avgEntryPrice - initialStopLoss) * totalQuantity * multiplier) * 1.1 : true,
    initialStopLoss,
    initialTakeProfit,
    finalStopLoss,
    finalTakeProfit,
    tradeImage: null,
    tradingViewLink: null
  };
  
  console.log(`🔍 Created trade: ${trade.symbol} ${trade.side} ${trade.quantity} @ ${trade.entryPrice} -> ${trade.exitPrice} = $${trade.pnl}`);
  
  return trade;
}

// Enhanced CSV processor that handles multiple formats
export function processEnhancedCSV(csvData: string, accountId: number, platformType?: string): Trade[] {
  console.log(`🚀 Processing CSV for account ${accountId} with platform type: ${platformType || 'auto-detect'}`);
  
  // Auto-detect format if not specified
  if (!platformType) {
    if (csvData.includes('Tradingview') && csvData.includes('avgPrice')) {
      return processTradovateCSV(csvData, accountId);
    }
  }
  
  // Default to Tradovate format for now
  return processTradovateCSV(csvData, accountId);
}