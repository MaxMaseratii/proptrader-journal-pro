import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CalendarDays, Download, Filter, Search, Plus, Edit3, Save, X, Upload, FileText, AlertCircle, CheckCircle, Target } from "lucide-react";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Trade, Account } from "@shared/schema";
import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import SimpleTradeModal from "@/components/simple-trade-modal";

// Format price levels (not currency)
const formatPrice = (price: number): string => {
  return price.toFixed(2);
};

// Helper function to format time for CSV
const formatTimeForCSV = (timestamp: Date | string | null): string => {
  if (!timestamp) return 'Not recorded';
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

// Helper function to get contract multiplier for accurate P&L calculation - CRITICAL FIX
const getContractMultiplier = (symbol: string): number => {
  const symbolUpper = symbol.toUpperCase();
  console.log(`🔍 Getting multiplier for symbol: ${symbol} (upper: ${symbolUpper})`);
  
  // CRITICAL: MES must be checked BEFORE ES to avoid wrong matching
  if (symbolUpper.includes('MES')) {
    console.log(`✅ MES detected: returning multiplier 5`);
    return 5; // Micro E-mini S&P 500: $5 per point
  }
  if (symbolUpper.includes('ESU') || (symbolUpper.includes('ES') && !symbolUpper.includes('MES'))) {
    console.log(`✅ ES detected: returning multiplier 50`);
    return 50; // E-mini S&P 500: $50 per point
  }
  if (symbolUpper.includes('MNQ')) {
    console.log(`✅ MNQ detected: returning multiplier 2`);
    return 2; // Micro E-mini NASDAQ: $2 per point
  }
  if (symbolUpper.includes('NQ') && !symbolUpper.includes('MNQ')) {
    console.log(`✅ NQ detected: returning multiplier 20`);
    return 20; // E-mini NASDAQ: $20 per point
  }
  if (symbolUpper.includes('YM')) {
    console.log(`✅ YM detected: returning multiplier 5`);
    return 5; // E-mini Dow: $5 per point
  }
  if (symbolUpper.includes('RTY')) {
    console.log(`✅ RTY detected: returning multiplier 50`);
    return 50; // E-mini Russell 2000: $50 per point
  }
  
  console.warn(`⚠️ Unknown symbol multiplier for ${symbol}, using 1`);
  return 1; // Default multiplier for unknown contracts
};

// Helper function to calculate duration for CSV
const calculateDurationForCSV = (trade: Trade): string => {
  if (!trade.fillTime) return 'No entry time';
  
  const entryTime = new Date(trade.fillTime);
  let exitTime;
  
  // Priority 1: Use actual exitTime if available
  if (trade.exitTime) {
    exitTime = new Date(trade.exitTime);
  }
  // Priority 2: For closed trades without exitTime, try to estimate from trade date + some time
  else if (trade.status === 'closed' && trade.exitPrice) {
    // Since we don't have exact exit time, we can't calculate precise duration
    return 'Exit time not recorded';
  }
  // Priority 3: Open trades show "Open"
  else {
    return trade.status === 'open' ? 'Currently open' : 'No timing data';
  }
  
  // Calculate actual duration from real timestamps
  const durationMs = exitTime.getTime() - entryTime.getTime();
  const durationMinutes = Math.max(1, Math.floor(durationMs / (1000 * 60)));
  
  if (durationMinutes < 60) {
    return `${durationMinutes}m`;
  } else if (durationMinutes < 1440) { // Less than 24 hours
    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  } else {
    const days = Math.floor(durationMinutes / 1440);
    const hours = Math.floor((durationMinutes % 1440) / 60);
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  }
};

// Universal CSV Import Component supporting all formats
const UniversalCsvImport = ({ accounts }: { accounts: Account[] }) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvFormat, setCsvFormat] = useState<string>('unknown');
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importStats, setImportStats] = useState<any>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Convert contract symbols to standard format - CRITICAL FIX for MESU5 detection
  const convertContractToSymbol = (contract: string): string => {
    if (!contract) return 'UNKNOWN';
    
    // Futures contract mapping - IMPORTANT: MES must come before ES to avoid wrong matching
    if (contract.startsWith('MES')) return 'MES';   // Micro E-mini S&P 500 - KEEP AS MES NOT ES!
    if (contract.startsWith('MNQ')) return 'MNQ';   // Micro E-mini NASDAQ 100
    if (contract.startsWith('ESU') || contract.startsWith('ES')) return 'ESU';   // E-mini S&P 500
    if (contract.startsWith('NQU') || contract.startsWith('NQ')) return 'NQ';    // E-mini NASDAQ 100
    if (contract.startsWith('YM')) return 'YM';    // E-mini Dow Jones
    if (contract.startsWith('RTY')) return 'RTY';  // E-mini Russell 2000
    if (contract.startsWith('GC')) return 'GC';    // Gold Futures
    if (contract.startsWith('CL')) return 'CL';    // Crude Oil Futures
    if (contract.startsWith('6E')) return 'EUR';   // Euro Futures
    if (contract.startsWith('6B')) return 'GBP';   // British Pound Futures
    
    // Return first 2-3 characters as fallback
    return contract.substring(0, Math.min(3, contract.length));
  };

  // Enhanced format detection for all CSV types
  const detectCsvFormat = (headers: string[]): string => {
    console.log('🔍 Detecting format for headers:', headers);
    
    // Position History CSV detection (most specific first)
    if (headers.includes('Position ID') && 
        headers.includes('Bought Timestamp') && 
        headers.includes('Sold Timestamp') &&
        (headers.includes('Paired Qty') || headers.includes('Buy Price'))) {
      return 'position-history';
    }
    
    // Performance CSV detection  
    if ((headers.includes('buyFillId') || headers.includes('Buy Fill ID')) && 
        (headers.includes('sellFillId') || headers.includes('Sell Fill ID')) && 
        (headers.includes('boughtTimestamp') || headers.includes('soldTimestamp') || 
         headers.includes('buyPrice') || headers.includes('sellPrice'))) {
      return 'performance';
    }
    
    // Orders CSV detection
    if (headers.includes('Order ID') && 
        (headers.includes('Fill Time') || headers.includes('Timestamp')) && 
        (headers.includes('B/S') || headers.includes('Side')) &&
        (headers.includes('Avg Fill Price') || headers.includes('Price'))) {
      return 'orders';
    }
    
    // Fills/Trades CSV detection
    if (headers.includes('Fill ID') && 
        headers.includes('Order ID') && 
        headers.includes('Timestamp') &&
        (headers.includes('B/S') || headers.includes('Side')) &&
        headers.includes('Price')) {
      return 'fills';
    }
    
    return 'unknown';
  };

  // Parse CSV text into structured data
  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return { headers: [], data: [] };
    
    // Parse headers (handle quotes and various delimiters)
    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t') ? '\t' : ',';
    const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
    
    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      // Skip empty rows
      if (Object.values(row).some(v => v !== '')) {
        data.push(row);
      }
    }
    
    return { headers, data };
  };

  // Find account by name or use first available account as fallback
  const findAccountByName = (accountName: string): any => {
    // First try exact match
    let account = accounts.find(acc => acc.name === accountName);
    
    // Then try partial match
    if (!account) {
      account = accounts.find(acc => acc.name.includes(accountName) || accountName.includes(acc.name));
    }
    
    // Finally, if no match and we have accounts, use the first available account
    if (!account && accounts.length > 0) {
      console.warn(`Account "${accountName}" not found. Using first available account: ${accounts[0].name}`);
      account = accounts[0];
    }
    
    if (!account) {
      throw new Error(`No accounts available. Please create an account first.`);
    }
    
    return account;
  };

  // Map Position History row to trade format
  const mapPositionHistoryRow = (row: any): any => {
    console.log('🔍 POSITION HISTORY: Mapping row:', row);
    
    const boughtTime = new Date(row['Bought Timestamp']);
    const soldTime = new Date(row['Sold Timestamp']);
    const isShort = soldTime < boughtTime;
    
    const account = findAccountByName(row['Account']);
    const buyPrice = parseFloat(row['Buy Price']);
    const sellPrice = parseFloat(row['Sell Price']);
    const pnl = parseFloat(row['P/L']);
    const quantity = parseInt(row['Paired Qty']);
    
    const mappedTrade = {
      accountId: account.id,
      symbol: convertContractToSymbol(row['Contract']),
      side: isShort ? 'sell' : 'buy',
      quantity: quantity || 1,
      fillTime: isShort ? row['Sold Timestamp'] : row['Bought Timestamp'],
      exitTime: isShort ? row['Bought Timestamp'] : row['Sold Timestamp'],
      entryPrice: isShort ? sellPrice : buyPrice,
      exitPrice: isShort ? buyPrice : sellPrice,
      pnl: pnl || 0,
      status: 'closed',
      date: row['Trade Date'] || new Date().toISOString().split('T')[0],
      orderId: `POS-${row['Position ID']}`,
      notes: `Position History Import - ${isShort ? 'Short' : 'Long'} Trade`,
      // Add required fields that might be missing
      initialStopLoss: null,
      finalStopLoss: null,
      initialTakeProfit: null,
      finalTakeProfit: null,
      tradeImage: null,
      tradingViewLink: null
    };

    console.log('🔍 POSITION HISTORY: Mapped trade:', {
      fillTime: mappedTrade.fillTime,
      exitTime: mappedTrade.exitTime,
      side: mappedTrade.side
    });

    return mappedTrade;
  };

  // Map Performance CSV row to trade format
  const mapPerformanceRow = (row: any): any => {
    console.log('🔍 PERFORMANCE: Mapping row:', row);
    
    const account = findAccountByName(row['Account'] || 'Default');
    const buyPrice = parseFloat(row['buyPrice'] || row['Buy Price']);
    const sellPrice = parseFloat(row['sellPrice'] || row['Sell Price']);
    const pnl = parseFloat(row['pnl'] || row['P/L']);
    const quantity = parseInt(row['qty'] || row['Quantity'] || 1);
    
    const mappedTrade = {
      accountId: account.id,
      symbol: convertContractToSymbol(row['symbol'] || row['Contract']),
      side: 'buy', // Performance CSV typically shows completed round trips
      quantity: quantity,
      fillTime: row['boughtTimestamp'] || row['Bought Timestamp'],
      exitTime: row['soldTimestamp'] || row['Sold Timestamp'],
      entryPrice: buyPrice,
      exitPrice: sellPrice,
      pnl: pnl,
      status: 'closed',
      date: row['date'] || row['Date'] || new Date().toISOString().split('T')[0],
      orderId: `PERF-${row['buyFillId'] || Date.now()}`,
      notes: 'Performance CSV Import',
      // Performance CSV has no SL/TP data - add required fields as null
      initialStopLoss: null,
      finalStopLoss: null,
      initialTakeProfit: null,
      finalTakeProfit: null,
      tradeImage: null,
      tradingViewLink: null
    };

    console.log('🔍 PERFORMANCE: Mapped trade:', {
      fillTime: mappedTrade.fillTime,
      exitTime: mappedTrade.exitTime
    });

    return mappedTrade;
  };

  // Advanced Orders CSV mapping with position tracking and SL/TP detection
  const mapOrdersRows = (rows: any[]): any[] => {
    console.log('🔍 ADVANCED ORDERS: Processing', rows.length, 'order rows with position tracking and SL/TP detection');
    
    const trades: any[] = [];
    
    // Helper function to group orders
    const groupBy = (array: any[], keyFn: (item: any) => string) => {
      const groups: { [key: string]: any[] } = {};
      array.forEach(item => {
        const key = keyFn(item);
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
      });
      return groups;
    };
    
    // Helper function to calculate weighted average
    const calculateWeightedAverage = (entries: any[], field: string) => {
      const totalQty = entries.reduce((sum, entry) => sum + entry.qty, 0);
      const weightedSum = entries.reduce((sum, entry) => sum + (entry[field] * entry.qty), 0);
      return weightedSum / totalQty;
    };
    
    // Helper function to calculate duration
    const calculateDuration = (startTime: string, endTime: string): string => {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const durationMs = end.getTime() - start.getTime();
      const minutes = Math.floor(durationMs / (60 * 1000));
      
      if (minutes < 60) return `${minutes}m`;
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    };
    
    // Group ALL orders (filled + cancelled) by symbol + account + trading day for SL/TP analysis
    const allOrderGroups = groupBy(rows, (order) => {
      const symbol = convertContractToSymbol(order['Contract']);
      const account = order['Account'];
      const date = order['Date'] || order['Fill Time']?.split(' ')[0] || '';
      return `${symbol}-${account}-${date}`;
    });
    
    // Filter filled orders for position tracking
    const orderGroups = groupBy(rows.filter(row => row.Status === 'Filled'), (order) => {
      const symbol = convertContractToSymbol(order['Contract']);
      const account = order['Account'];
      const date = order['Date'] || order['Fill Time']?.split(' ')[0] || '';
      return `${symbol}-${account}-${date}`;
    });
    
    console.log('🔍 ADVANCED ORDERS: Created', Object.keys(orderGroups).length, 'order groups');
    
    // Process each group with position tracking
    Object.entries(orderGroups).forEach(([groupKey, orderGroup]) => {
      console.log('🔍 ADVANCED ORDERS: Processing group:', groupKey, 'with', orderGroup.length, 'orders');
      
      // Sort orders chronologically
      orderGroup.sort((a, b) => {
        const timeA = new Date(a['Fill Time'] || a['Timestamp']).getTime();
        const timeB = new Date(b['Fill Time'] || b['Timestamp']).getTime();
        return timeA - timeB;
      });
      
      // Position tracking variables
      let position = 0; // Current net position
      let positionEntries: any[] = []; // Orders that built current position
      let tradeCounter = 1;
      
      // Get ALL orders for this group (including cancelled) for SL/TP detection
      const allOrdersInGroup = allOrderGroups[groupKey] || [];
      
      // Detect Stop Loss and Take Profit orders from cancelled orders - ENHANCED SL/TP DETECTION
      const detectSLTPOrders = () => {
        const cancelledOrders = allOrdersInGroup.filter(order => 
          order.Status === 'Cancelled' || order.Status === 'Canceled'
        );
        
        console.log(`🔍 SL/TP DETECTION: Found ${cancelledOrders.length} cancelled orders in group`);
        
        const stopLossOrders = cancelledOrders.filter(order => {
          const orderType = (order['Order Type'] || order['Type'] || '').toLowerCase();
          const hasStopPrice = order['Stop Price'] && order['Stop Price'].trim() !== '';
          const isStopOrder = orderType.includes('stop');
          
          console.log(`🔍 Order: ${order['Order ID']} - Type: ${orderType}, HasStopPrice: ${hasStopPrice}, IsStopOrder: ${isStopOrder}`);
          
          return isStopOrder || hasStopPrice;
        });
        
        const takeProfitOrders = cancelledOrders.filter(order => {
          const orderType = (order['Order Type'] || order['Type'] || '').toLowerCase();
          const hasLimitPrice = order['Limit Price'] && order['Limit Price'].trim() !== '';
          const isLimitOrder = orderType.includes('limit');
          
          return isLimitOrder && hasLimitPrice && !stopLossOrders.includes(order);
        });
        
        console.log(`🔍 SL/TP RESULT: ${stopLossOrders.length} stop losses, ${takeProfitOrders.length} take profits`);
        
        return { stopLossOrders, takeProfitOrders };
      };
      
      const { stopLossOrders, takeProfitOrders } = detectSLTPOrders();
      
      console.log(`🔍 SL/TP DETECTION: Found ${stopLossOrders.length} stop loss orders and ${takeProfitOrders.length} take profit orders for group ${groupKey}`);
      
      if (stopLossOrders.length > 0) {
        console.log('🔍 Stop Loss Orders:', stopLossOrders.map(o => ({ price: o['Avg Fill Price'] || o['Price'], type: o['Order Type'] || o['Type'], status: o.Status })));
      }
      if (takeProfitOrders.length > 0) {
        console.log('🔍 Take Profit Orders:', takeProfitOrders.map(o => ({ price: o['Avg Fill Price'] || o['Price'], type: o['Order Type'] || o['Type'], status: o.Status })));
      }
      
      // Function to get initial and final SL/TP levels - ENHANCED DETECTION
      const getSLTPLevels = (isLong: boolean) => {
        // Get chronologically ordered SL orders using Stop Price instead of Avg Fill Price
        const chronoStopLoss = stopLossOrders
          .filter(order => order['Stop Price'] || order['Limit Price'] || order['Avg Fill Price'] || order['Price'])
          .map(order => ({
            ...order,
            effectivePrice: parseFloat(order['Stop Price'] || order['Limit Price'] || order['Avg Fill Price'] || order['Price'] || '0')
          }))
          .filter(order => order.effectivePrice > 0)
          .sort((a, b) => {
            const timeA = new Date(a['Fill Time'] || a['Timestamp'] || 0).getTime();
            const timeB = new Date(b['Fill Time'] || b['Timestamp'] || 0).getTime();
            return timeA - timeB;
          });
          
        console.log(`🔍 SL Analysis: Found ${chronoStopLoss.length} valid stop loss orders with prices`);
        chronoStopLoss.forEach((order, i) => {
          console.log(`  ${i+1}. Price: ${order.effectivePrice}, Time: ${order['Fill Time'] || order['Timestamp']}`);
        });
          
        // Get chronologically ordered TP orders  
        const chronoTakeProfit = takeProfitOrders
          .filter(order => order['Avg Fill Price'] || order['Price'])
          .sort((a, b) => {
            const timeA = new Date(a['Fill Time'] || a['Timestamp'] || 0).getTime();
            const timeB = new Date(b['Fill Time'] || b['Timestamp'] || 0).getTime();
            return timeA - timeB;
          });
        
        return {
          initialStopLoss: chronoStopLoss.length > 0 ? 
            parseFloat(chronoStopLoss[0]['Avg Fill Price'] || chronoStopLoss[0]['Price']) : null,
          finalStopLoss: chronoStopLoss.length > 0 ? 
            parseFloat(chronoStopLoss[chronoStopLoss.length - 1]['Avg Fill Price'] || chronoStopLoss[chronoStopLoss.length - 1]['Price']) : null,
          initialTakeProfit: chronoTakeProfit.length > 0 ? 
            parseFloat(chronoTakeProfit[0]['Avg Fill Price'] || chronoTakeProfit[0]['Price']) : null,
          finalTakeProfit: chronoTakeProfit.length > 0 ? 
            parseFloat(chronoTakeProfit[chronoTakeProfit.length - 1]['Avg Fill Price'] || chronoTakeProfit[chronoTakeProfit.length - 1]['Price']) : null
        };
      };
      
      orderGroup.forEach((order, index) => {
        const side = order['B/S']?.toLowerCase();
        const quantity = parseInt(order['Filled Qty'] || order['Quantity'] || 0);
        const price = parseFloat(order['Avg Fill Price'] || order['Price'] || 0);
        const fillTime = order['Fill Time'] || order['Timestamp'];
        
        if (!quantity || !price || !fillTime) {
          console.log('🔍 ADVANCED ORDERS: Skipping invalid order:', order);
          return;
        }
        
        // Calculate position change
        const orderQty = (side === 'buy' || side === 'b') ? quantity : -quantity;
        const newPosition = position + orderQty;
        
        console.log(`🔍 ADVANCED ORDERS: Order ${index + 1}: ${side.toUpperCase()} ${quantity} @ ${price}`);
        console.log(`🔍 ADVANCED ORDERS: Position: ${position} → ${newPosition}`);
        
        // CASE 1: Opening new position (from flat)
        if (position === 0 && newPosition !== 0) {
          console.log('🔍 ADVANCED ORDERS: Opening new position');
          positionEntries = [{
            fillTime,
            price,
            qty: Math.abs(orderQty),
            side: newPosition > 0 ? 'buy' : 'sell',
            order
          }];
        }
        
        // CASE 2: Adding to existing position (scaling in)
        else if (position !== 0 && Math.sign(position) === Math.sign(newPosition) && Math.abs(newPosition) > Math.abs(position)) {
          console.log('🔍 ADVANCED ORDERS: Adding to position (scaling in)');
          positionEntries.push({
            fillTime,
            price,
            qty: Math.abs(orderQty),
            side: newPosition > 0 ? 'buy' : 'sell',
            order
          });
        }
        
        // CASE 3: Partially closing position
        else if (position !== 0 && Math.sign(position) === Math.sign(newPosition) && Math.abs(newPosition) < Math.abs(position)) {
          console.log('🔍 ADVANCED ORDERS: Partially closing position');
          
          const closedQuantity = Math.abs(orderQty);
          
          // Calculate weighted entry values for the portion being closed
          const weightedEntryPrice = calculateWeightedAverage(positionEntries, 'price');
          const earliestEntryTime = positionEntries[0].fillTime; // Use earliest entry for duration
          
          // Get SL/TP levels for this trade
          const isLong = position > 0;
          const slTPLevels = getSLTPLevels(isLong);
          
          const trade = {
            accountId: findAccountByName(order['Account']).id,
            symbol: convertContractToSymbol(order['Contract']),
            side: position > 0 ? 'buy' : 'sell',
            quantity: closedQuantity,
            fillTime: earliestEntryTime,
            exitTime: fillTime,
            entryPrice: weightedEntryPrice,
            exitPrice: price,
            pnl: 0, // Will calculate below
            status: 'closed',
            date: order['Date'] || fillTime.split(' ')[0],
            orderId: `ADV-${groupKey}-${tradeCounter++}`,
            notes: `Advanced Orders Import - Partial Close (${calculateDuration(earliestEntryTime, fillTime)})`,
            // Apply detected SL/TP levels
            initialStopLoss: slTPLevels.initialStopLoss,
            finalStopLoss: slTPLevels.finalStopLoss,
            initialTakeProfit: slTPLevels.initialTakeProfit,
            finalTakeProfit: slTPLevels.finalTakeProfit,
            tradeImage: null,
            tradingViewLink: null
          };
          
          // Calculate P&L - CRITICAL FIX for accurate P&L calculation
          const priceDiff = trade.exitPrice - trade.entryPrice;
          const multiplier = getContractMultiplier(trade.symbol);
          if (trade.side === 'buy') {
            // Long position: profit = (exit - entry) * quantity * multiplier
            trade.pnl = priceDiff * trade.quantity * multiplier;
          } else {
            // Short position: profit = (entry - exit) * quantity * multiplier
            trade.pnl = -priceDiff * trade.quantity * multiplier;
          }
          
          trades.push(trade);
          console.log('🔍 ADVANCED ORDERS: Created partial close trade:', calculateDuration(earliestEntryTime, fillTime));
          
          // Adjust positionEntries to reflect remaining position (FIFO basis)
          let qtyToRemove = closedQuantity;
          positionEntries = positionEntries.filter(entry => {
            if (qtyToRemove <= 0) return true;
            
            if (entry.qty <= qtyToRemove) {
              qtyToRemove -= entry.qty;
              return false; // Remove this entry completely
            } else {
              entry.qty -= qtyToRemove;
              qtyToRemove = 0;
              return true; // Keep partial entry
            }
          });
        }
        
        // CASE 4: Completely closing position
        else if (position !== 0 && newPosition === 0) {
          console.log('🔍 ADVANCED ORDERS: Completely closing position');
          
          // Calculate weighted entry values
          const weightedEntryPrice = calculateWeightedAverage(positionEntries, 'price');
          const earliestEntryTime = positionEntries[0].fillTime;
          
          // Get SL/TP levels for this trade
          const isLong = position > 0;
          const slTPLevels = getSLTPLevels(isLong);
          
          const trade = {
            accountId: findAccountByName(order['Account']).id,
            symbol: convertContractToSymbol(order['Contract']),
            side: position > 0 ? 'buy' : 'sell',
            quantity: Math.abs(position),
            fillTime: earliestEntryTime,
            exitTime: fillTime,
            entryPrice: weightedEntryPrice,
            exitPrice: price,
            pnl: 0, // Will calculate below
            status: 'closed',
            date: order['Date'] || fillTime.split(' ')[0],
            orderId: `ADV-${groupKey}-${tradeCounter++}`,
            notes: `Advanced Orders Import - Complete Close (${calculateDuration(earliestEntryTime, fillTime)})`,
            // Apply detected SL/TP levels
            initialStopLoss: slTPLevels.initialStopLoss,
            finalStopLoss: slTPLevels.finalStopLoss,
            initialTakeProfit: slTPLevels.initialTakeProfit,
            finalTakeProfit: slTPLevels.finalTakeProfit,
            tradeImage: null,
            tradingViewLink: null
          };
          
          // Calculate P&L - CRITICAL FIX for accurate P&L calculation
          const priceDiff = trade.exitPrice - trade.entryPrice;
          const multiplier = getContractMultiplier(trade.symbol);
          if (trade.side === 'buy') {
            // Long position: profit = (exit - entry) * quantity * multiplier
            trade.pnl = priceDiff * trade.quantity * multiplier;
          } else {
            // Short position: profit = (entry - exit) * quantity * multiplier
            trade.pnl = -priceDiff * trade.quantity * multiplier;
          }
          
          trades.push(trade);
          console.log('🔍 ADVANCED ORDERS: Created complete trade:', calculateDuration(earliestEntryTime, fillTime));
          
          // Reset position tracking
          positionEntries = [];
        }
        
        // CASE 5: Position reversal (close current + open opposite)
        else if (position !== 0 && newPosition !== 0 && Math.sign(position) !== Math.sign(newPosition)) {
          console.log('🔍 ADVANCED ORDERS: Position reversal detected');
          
          // First, close the existing position
          const weightedEntryPrice = calculateWeightedAverage(positionEntries, 'price');
          const earliestEntryTime = positionEntries[0].fillTime;
          
          // Get SL/TP levels for this trade
          const isLong = position > 0;
          const slTPLevels = getSLTPLevels(isLong);
          
          const closeTrade = {
            accountId: findAccountByName(order['Account']).id,
            symbol: convertContractToSymbol(order['Contract']),
            side: position > 0 ? 'buy' : 'sell',
            quantity: Math.abs(position),
            fillTime: earliestEntryTime,
            exitTime: fillTime,
            entryPrice: weightedEntryPrice,
            exitPrice: price,
            pnl: 0, // Will calculate below
            status: 'closed',
            date: order['Date'] || fillTime.split(' ')[0],
            orderId: `ADV-${groupKey}-${tradeCounter++}`,
            notes: `Advanced Orders Import - Reversal Close (${calculateDuration(earliestEntryTime, fillTime)})`,
            // Apply detected SL/TP levels
            initialStopLoss: slTPLevels.initialStopLoss,
            finalStopLoss: slTPLevels.finalStopLoss,
            initialTakeProfit: slTPLevels.initialTakeProfit,
            finalTakeProfit: slTPLevels.finalTakeProfit,
            tradeImage: null,
            tradingViewLink: null
          };
          
          // Calculate P&L for close trade - CRITICAL FIX
          const priceDiff = closeTrade.exitPrice - closeTrade.entryPrice;
          const multiplier = getContractMultiplier(closeTrade.symbol);
          if (closeTrade.side === 'buy') {
            // Long position: profit = (exit - entry) * quantity * multiplier
            closeTrade.pnl = priceDiff * closeTrade.quantity * multiplier;
          } else {
            // Short position: profit = (entry - exit) * quantity * multiplier
            closeTrade.pnl = -priceDiff * closeTrade.quantity * multiplier;
          }
          
          trades.push(closeTrade);
          console.log('🔍 ADVANCED ORDERS: Created reversal close trade:', calculateDuration(earliestEntryTime, fillTime));
          
          // Then, start new position in opposite direction
          const newPositionQty = Math.abs(newPosition);
          positionEntries = [{
            fillTime,
            price,
            qty: newPositionQty,
            side: newPosition > 0 ? 'buy' : 'sell',
            order
          }];
          
          console.log('🔍 ADVANCED ORDERS: Started new position after reversal');
        }
        
        // Update position
        position = newPosition;
        console.log(`🔍 ADVANCED ORDERS: Updated position to: ${position}`);
      });
      
      // Handle any remaining open position
      if (Math.abs(position) > 0) {
        console.log('🔍 ADVANCED ORDERS: Position remains open:', position);
      }
    });
    
    console.log('🔍 ADVANCED ORDERS: Created', trades.length, 'trades with durations');
    
    // Log sample trade with duration
    if (trades.length > 0) {
      console.log('🔍 ADVANCED ORDERS: Sample trade with duration:', {
        symbol: trades[0].symbol,
        side: trades[0].side,
        fillTime: trades[0].fillTime,
        exitTime: trades[0].exitTime,
        pnl: trades[0].pnl
      });
    }
    
    return trades;
  };

  // Map Fills CSV - similar to Orders but with Fill IDs
  const mapFillsRows = (rows: any[]): any[] => {
    console.log('🔍 FILLS: Processing', rows.length, 'fill rows');
    
    const trades = [];
    const fillGroups = new Map();
    
    // Group fills by Order ID to match entry/exit
    rows.forEach(row => {
      const orderId = row['Order ID'];
      if (!fillGroups.has(orderId)) {
        fillGroups.set(orderId, []);
      }
      fillGroups.get(orderId).push(row);
    });
    
    // Process each order's fills
    for (const [orderId, fills] of Array.from(fillGroups.entries())) {
      if (fills.length >= 2) {
        // Sort by timestamp to determine entry/exit
        fills.sort((a: any, b: any) => new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime());
        
        const entryFill = fills[0];
        const exitFill = fills[fills.length - 1];
        
        const account = findAccountByName(entryFill['Account']);
        
        const trade = {
          accountId: account.id,
          symbol: convertContractToSymbol(entryFill['Contract']),
          side: entryFill['B/S'].toLowerCase() === 'buy' ? 'buy' : 'sell',
          quantity: parseInt(entryFill['Quantity']),
          fillTime: entryFill['Timestamp'],
          exitTime: exitFill['Timestamp'],
          entryPrice: parseFloat(entryFill['Price']),
          exitPrice: parseFloat(exitFill['Price']),
          pnl: 0, // Calculate later
          status: 'closed',
          date: entryFill['Date'] || entryFill['Timestamp'].split(' ')[0],
          orderId: `FILL-${orderId}`,
          notes: 'Fills CSV Import'
        };
        
        // Calculate P&L - CRITICAL FIX for accurate P&L calculation
        const priceDiff = trade.exitPrice - trade.entryPrice;
        const multiplier = getContractMultiplier(trade.symbol);
        if (trade.side === 'buy') {
          // Long position: profit = (exit - entry) * quantity * multiplier
          trade.pnl = priceDiff * trade.quantity * multiplier;
        } else {
          // Short position: profit = (entry - exit) * quantity * multiplier
          trade.pnl = -priceDiff * trade.quantity * multiplier;
        }
        
        trades.push(trade);
      }
    }
    
    console.log('🔍 FILLS: Created', trades.length, 'matched trades');
    return trades;
  };

  // Main mapping function - routes to appropriate mapper
  const mapRowsToTrades = (rows: any[], format: string): any[] => {
    switch (format) {
      case 'position-history':
        return rows.map(mapPositionHistoryRow);
      case 'performance':
        return rows.map(mapPerformanceRow);
      case 'orders':
        return mapOrdersRows(rows);
      case 'fills':
        return mapFillsRows(rows);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  };



  // Handle file selection and preview
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setImportStats(null);
    
    try {
      const text = await file.text();
      const { headers, data } = parseCSV(text);
      
      setCsvHeaders(headers);
      const detectedFormat = detectCsvFormat(headers);
      setCsvFormat(detectedFormat);
      
      // Show preview
      setPreviewData(data.slice(0, 3));
      
      console.log(`🔍 Detected format: ${detectedFormat}`);
      console.log(`🔍 Found ${data.length} data rows`);
      console.log(`🔍 Headers:`, headers);
      
    } catch (error) {
      console.error('Error parsing CSV:', error);
      console.error(`Error parsing CSV: ${(error as Error).message}`);
      setCsvFile(null);
      setPreviewData([]);
      setCsvFormat('unknown');
    }
  };

  // Upload and process CSV
  const handleUpload = async () => {
    if (!csvFile || csvFormat === 'unknown') return;

    setIsUploading(true);
    
    try {
      const text = await csvFile.text();
      const { headers, data } = parseCSV(text);
      
      console.log(`🔍 Processing ${data.length} rows with format: ${csvFormat}`);
      
      const trades = [];
      const errors = [];
      
      try {
        const mappedTrades = mapRowsToTrades(data, csvFormat);
        trades.push(...mappedTrades);
      } catch (error) {
        console.error(`🔍 Error mapping trades:`, error);
        errors.push(`Mapping error: ${(error as Error).message}`);
      }
      
      if (errors.length > 0 && trades.length === 0) {
        throw new Error(errors.join('\n'));
      }
      
      console.log(`🔍 Prepared ${trades.length} trades for import`);
      console.log(`🔍 Sample trade:`, trades[0]);
      
      // Override trades with selected account ID
      const tradesWithAccount = trades.map(trade => ({
        ...trade,
        accountId: parseInt(selectedImportAccount)
      }));

      // Send to Universal CSV Import API
      const rawResponse = await apiRequest('/api/trades/import-csv', 'POST', {
        trades: tradesWithAccount,
        accountId: parseInt(selectedImportAccount),
        source: `${csvFormat}-csv`
      });
      
      const response = await rawResponse.json();
      
      console.log('🔍 API Response:', response);
      console.log('🔍 API Response type:', typeof response);
      console.log('🔍 API Response success:', response?.success);
      
      if (response && response.success) {
        const imported = response.recordsImported || trades.length;
        
        setImportStats({
          imported: imported,
          errors: errors.length,
          longTrades: trades.filter(t => t.side === 'buy').length,
          shortTrades: trades.filter(t => t.side === 'sell').length,
          format: csvFormat
        });
        
        // REMOVED: No popup for production app - silent success
        
        queryClient.invalidateQueries({ queryKey: ['/api/trades'] });
        
        // Reset form
        setCsvFile(null);
        setPreviewData([]);
        setCsvFormat('unknown');
        setCsvHeaders([]);
        
      } else {
        console.error('🔍 Import failed - Response:', response);
        throw new Error(response.message || 'Import failed - check server logs');
      }
      
    } catch (error) {
      console.error('Import error:', error);
      // REMOVED: No error popup for production app - logged only
    } finally {
      setIsUploading(false);
    }
  };

  // Get format info
  const getFormatInfo = (format: string) => {
    const formatDetails = {
      'position-history': {
        icon: '🏛️',
        name: 'Position History',
        description: 'Complete trade pairs with entry/exit timestamps',
        features: ['✅ Entry & Exit Times', '✅ Long & Short Detection', '✅ Calculated P&L', '✅ Account Info']
      },
      'performance': {
        icon: '📊',
        name: 'Performance',
        description: 'Trade performance data with P&L metrics',
        features: ['✅ Entry & Exit Times', '✅ Pre-calculated P&L', '✅ Fill IDs', '⚠️ May need account mapping']
      },
      'orders': {
        icon: '📋',
        name: 'Orders',
        description: 'Individual order records (will match buy/sell pairs)',
        features: ['✅ Order matching', '✅ Fill times', '⚠️ Requires buy/sell pairing', '✅ Account info']
      },
      'fills': {
        icon: '🔄',
        name: 'Fills/Trades',
        description: 'Individual fill records (will group by Order ID)',
        features: ['✅ Fill-level detail', '✅ Timestamps', '⚠️ Requires fill matching', '✅ Commission data']
      },
      'unknown': {
        icon: '❓',
        name: 'Unknown Format',
        description: 'CSV format not recognized',
        features: ['❌ Unsupported format']
      }
    };
    
    return formatDetails[format as keyof typeof formatDetails] || formatDetails['unknown'];
  };

  const formatInfo = getFormatInfo(csvFormat);

  // Account selection state for CSV import
  const [selectedImportAccount, setSelectedImportAccount] = useState<string>("");

  return (
    <div className="space-y-6">
      {/* Account Selection for CSV Import */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-blue-400" />
            <CardTitle className="text-blue-400">Account Selection</CardTitle>
          </div>
          <p className="text-gray-400">Choose which trading account to import your trades to</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300 font-medium">Select Trading Account</Label>
              <Select 
                value={selectedImportAccount} 
                onValueChange={setSelectedImportAccount}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:border-blue-400">
                  <SelectValue placeholder="Choose your trading account for CSV import" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {accounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()} className="text-white hover:bg-gray-600">
                      <div className="flex items-center justify-between w-full">
                        <span>{account.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {account.type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedImportAccount && (
                <p className="text-sm text-green-400 mt-2">
                  ✓ Selected: {accounts?.find(acc => acc.id.toString() === selectedImportAccount)?.name}
                </p>
              )}
            </div>
            
            {!selectedImportAccount && (
              <div className="bg-yellow-600/20 border border-yellow-600 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm">Please select an account before uploading CSV files</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* File Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Position History CSV File
          </label>
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={!selectedImportAccount}
            className={`bg-gray-700 border-gray-600 text-white file:bg-blue-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1 ${
              !selectedImportAccount ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
          {!selectedImportAccount && (
            <p className="text-xs text-yellow-400 mt-1">Select an account first</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Detected Format
          </label>
          <div className="p-3 bg-gray-700 rounded-md flex items-center">
            {csvFormat === 'position-history' ? (
              <><CheckCircle className="h-4 w-4 text-green-400 mr-2" />
              <Badge className="bg-green-600 text-white">✅ Position History CSV</Badge></>
            ) : csvFormat === 'unknown' ? (
              <><AlertCircle className="h-4 w-4 text-red-400 mr-2" />
              <Badge variant="destructive">❌ Unknown Format</Badge></>
            ) : (
              <><AlertCircle className="h-4 w-4 text-yellow-400 mr-2" />
              <Badge variant="secondary">{csvFormat}</Badge></>
            )}
          </div>
        </div>
      </div>

      {/* Format Information */}
      {csvFormat !== 'unknown' && csvHeaders.length > 0 && (
        <div className="bg-green-600/20 border border-green-600 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
            <div>
              <h4 className="text-green-400 font-medium">
                {formatInfo.icon} {formatInfo.name} CSV Detected!
              </h4>
              <p className="text-sm text-gray-300 mt-1">{formatInfo.description}</p>
              <div className="mt-2 space-y-1">
                {formatInfo.features.map((feature, index) => (
                  <div key={index} className="text-xs text-gray-300">• {feature}</div>
                ))}
              </div>
              <p className="text-xs text-green-300 mt-2">
                Ready to import {previewData.length > 0 ? `${previewData.length} sample` : ''} records
              </p>
            </div>
          </div>
        </div>
      )}

      {csvFormat === 'unknown' && csvHeaders.length > 0 && (
        <div className="bg-yellow-600/20 border border-yellow-600 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
            <div>
              <h4 className="text-yellow-400 font-medium">⚠️ CSV Format Not Recognized</h4>
              <div className="text-sm text-gray-300 mt-2">
                <p><strong>Detected columns:</strong> {csvHeaders.slice(0, 5).join(', ')}{csvHeaders.length > 5 ? '...' : ''}</p>
                <p className="mt-2"><strong>Supported formats:</strong></p>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• <strong>Position History:</strong> Must have 'Position ID', 'Bought Timestamp', 'Sold Timestamp'</li>
                  <li>• <strong>Performance:</strong> Must have 'buyFillId', 'sellFillId', 'boughtTimestamp'</li>
                  <li>• <strong>Orders:</strong> Must have 'Order ID', 'Fill Time', 'B/S'</li>
                  <li>• <strong>Fills:</strong> Must have 'Fill ID', 'Order ID', 'Timestamp'</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {previewData.length > 0 && csvFormat !== 'unknown' && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Preview Data (First 3 Trades)
          </h4>
          
          {previewData.map((row, index) => {
            const boughtTime = new Date(row['Bought Timestamp']);
            const soldTime = new Date(row['Sold Timestamp']);
            const isShort = soldTime < boughtTime;
            
            return (
              <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400">Contract:</span>
                    <div className="font-mono text-white">{row['Contract']} → {convertContractToSymbol(row['Contract'])}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Direction:</span>
                    <div className={`font-medium ${isShort ? 'text-red-400' : 'text-green-400'}`}>
                      {isShort ? 'SHORT' : 'LONG'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Entry Time:</span>
                    <div className="font-mono text-white text-xs">
                      {isShort ? row['Sold Timestamp'] : row['Bought Timestamp']}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">P&L:</span>
                    <div className={`font-medium ${parseFloat(row['P/L']) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${row['P/L']}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Import Stats */}
      {importStats && (
        <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-4">
          <h4 className="text-blue-400 font-medium mb-2">📊 Import Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Total Imported</div>
              <div className="text-xl font-bold text-white">{importStats.imported}</div>
            </div>
            <div>
              <div className="text-gray-400">Long Trades</div>
              <div className="text-xl font-bold text-green-400">{importStats.longTrades}</div>
            </div>
            <div>
              <div className="text-gray-400">Short Trades</div>
              <div className="text-xl font-bold text-red-400">{importStats.shortTrades}</div>
            </div>
            <div>
              <div className="text-gray-400">Errors</div>
              <div className="text-xl font-bold text-yellow-400">{importStats.errors}</div>
            </div>
          </div>
        </div>
      )}

      {/* Import Button */}
      <Button 
        onClick={handleUpload}
        disabled={!csvFile || csvFormat === 'unknown' || isUploading || !selectedImportAccount}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
        size="lg"
      >
        {isUploading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Importing {formatInfo.name} to {accounts?.find(acc => acc.id.toString() === selectedImportAccount)?.name}...
          </>
        ) : !selectedImportAccount ? (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            Select Account to Import
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Import {formatInfo.name} to {accounts?.find(acc => acc.id.toString() === selectedImportAccount)?.name}
          </>
        )}
      </Button>
    </div>
  );
};

import TradeEntry from "@/components/trade-entry";
// Note: Using PositionHistoryCsvImport component directly in this file instead of AutomaticCsvImport

export default function Trades() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [activeTab, setActiveTab] = useState<string>("view");
  const [location] = useLocation();
  const [editingTradeId, setEditingTradeId] = useState<number | null>(null);
  const [editingLink, setEditingLink] = useState<string>("");
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Check if we should open the "Add Trade" tab automatically
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tab') === 'add') {
      setActiveTab('add');
    }
  }, [location]);

  const { data: trades, isLoading: tradesLoading } = useQuery<Trade[]>({
    queryKey: ['/api/trades'],
  });

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  const queryClient = useQueryClient();

  // Mutation for updating trade TradingView link
  const updateTradeMutation = useMutation({
    mutationFn: async ({ id, tradingViewLink }: { id: number; tradingViewLink: string }) => {
      return await apiRequest(`/api/trades/${id}`, 'PUT', { tradingViewLink });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trades'] });
      setEditingTradeId(null);
      setEditingLink("");
    },
    onError: (error) => {
      console.error('Error updating trade:', error);
      alert('Failed to update trade link');
    }
  });

  const startEditing = (trade: Trade) => {
    setEditingTradeId(trade.id);
    setEditingLink(trade.tradingViewLink || "");
  };

  const saveTradeLink = () => {
    if (editingTradeId) {
      updateTradeMutation.mutate({ 
        id: editingTradeId, 
        tradingViewLink: editingLink.trim() 
      });
    }
  };

  const cancelEditing = () => {
    setEditingTradeId(null);
    setEditingLink("");
  };

  const openTradeDetail = (trade: Trade) => {
    console.log('Opening trade detail for:', trade.symbol, trade.id);
    setSelectedTrade(trade);
    setIsDetailModalOpen(true);
  };

  const closeTradeDetail = () => {
    setSelectedTrade(null);
    setIsDetailModalOpen(false);
  };

  // Filter and sort trades
  const filteredTrades = useMemo(() => {
    if (!trades) return [];
    
    let filtered = trades.filter(trade => {
      const matchesSearch = 
        trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trade.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      
      const matchesAccount = selectedAccount === "all" || trade.accountId.toString() === selectedAccount;
      
      // Fix status filtering - determine result based on P&L
      let matchesStatus = true;
      if (selectedStatus !== "all") {
        if (selectedStatus === "win" && trade.pnl <= 0) matchesStatus = false;
        if (selectedStatus === "loss" && trade.pnl >= 0) matchesStatus = false;  
        if (selectedStatus === "breakeven" && trade.pnl !== 0) matchesStatus = false;
      }
      
      return matchesSearch && matchesAccount && matchesStatus;
    });

    // Sort trades
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "date":
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case "pnl":
          aValue = a.pnl;
          bValue = b.pnl;
          break;
        case "symbol":
          aValue = a.symbol;
          bValue = b.symbol;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }
      
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [trades, searchTerm, selectedAccount, selectedStatus, sortBy, sortOrder]);

  const getAccountName = (accountId: number) => {
    return accounts?.find(acc => acc.id === accountId)?.name || `Account ${accountId}`;
  };

  const exportToCSV = () => {
    if (!filteredTrades.length) return;
    
    const headers = [
      "Date", "Entry Time", "Exit Time", "Duration", "Account", "Symbol", "Side", 
      "Quantity", "Entry Price", "Exit Price", "P&L", "Status", "Order ID", 
      "Initial SL Price", "Initial TP Price", "Final SL Price", "Final TP Price", 
      "Notes", "TradingView Link"
    ];
    
    const csvContent = [
      headers.join(","),
      ...filteredTrades.map(trade => [
        trade.date,
        formatTimeForCSV(trade.fillTime),
        formatTimeForCSV(trade.exitTime),
        calculateDurationForCSV(trade),
        `"${getAccountName(trade.accountId)}"`, // Quoted to handle spaces in account names
        trade.symbol,
        trade.side,
        trade.quantity,
        trade.entryPrice,
        trade.exitPrice || "",
        trade.pnl,
        trade.status,
        trade.orderId || "",
        trade.initialStopLoss || "",
        trade.initialTakeProfit || "",
        trade.finalStopLoss || "",
        trade.finalTakeProfit || "",
        `"${(trade.notes || "").replace(/"/g, '""')}"`, // Escape quotes in notes
        trade.tradingViewLink || ""
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trades_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (tradesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading trades...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white p-6">
      <div className="space-y-6">
      <header className="border-b border-gray-800 bg-dark-bg pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-rainbow">
              Trades Log
            </h1>
            <p className="text-gray-400 mt-2">Add new trades manually or view existing trading activity</p>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800">
          <TabsTrigger value="view" className="text-white data-[state=active]:bg-blue-600">
            View All Trades
          </TabsTrigger>
          <TabsTrigger value="add" className="text-white data-[state=active]:bg-green-600">
            <Plus className="mr-2 h-4 w-4" />
            Add Trade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="space-y-6">
          {/* CSV Import Section */}
          <Card className="bg-dark-card border-dark-border">
            <CardHeader>
              <CardTitle className="text-white">Universal CSV Import</CardTitle>
              <p className="text-gray-400">Import trades from any broker: Tradovate, MT4/5, Rithmic, CQG, NinjaTrader, Interactive Brokers, and more. For complete timing data, use Performance CSV exports when available.</p>
            </CardHeader>
            <CardContent>
              <UniversalCsvImport accounts={accounts || []} />
            </CardContent>
          </Card>

          {/* Manual Entry Section */}
          <Card className="bg-dark-card border-dark-border">
            <CardHeader>
              <CardTitle className="text-white">Manual Trade Entry</CardTitle>
              <p className="text-gray-400">Enter trade details manually for precise record keeping</p>
            </CardHeader>
            <CardContent>
              <TradeEntry accounts={accounts || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="view" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">All Trades</h2>
            <div className="flex gap-2">
              {/* Show data quality warning if there are trades with missing exit times */}
              {filteredTrades.some(trade => trade.status === 'closed' && trade.exitPrice && !trade.exitTime) && (
                <div className="bg-yellow-600/20 border border-yellow-600 rounded px-3 py-1 text-yellow-400 text-sm">
                  ⚠️ Some trades missing exit timestamps
                </div>
              )}
              <Button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/trades/reprocess-sltp', { 
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      credentials: 'include'
                    });
                    const result = await response.json();
                    if (result.success) {
                      // REMOVED: No popup for production app - silent success
                      window.location.reload();
                    } else {
                      // REMOVED: No error popup for production app - log error only
                      console.error('Failed to reprocess trades:', result.message);
                    }
                  } catch (error) {
                    console.error('Reprocessing error:', error);
                    // REMOVED: No error popup for production app - log error only
                  }
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Update SL/TP Analysis
              </Button>
              <Button onClick={exportToCSV} className="bg-blue-600 hover:bg-blue-700">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

      {/* Filters */}
      <Card className="bg-dark-card border-dark-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search symbol, order ID, notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="All Accounts" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all" className="text-white">All Accounts</SelectItem>
                {accounts?.map(account => (
                  <SelectItem key={account.id} value={account.id.toString()} className="text-white">
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all" className="text-white">All Status</SelectItem>
                <SelectItem value="win" className="text-white">Wins</SelectItem>
                <SelectItem value="loss" className="text-white">Losses</SelectItem>
                <SelectItem value="breakeven" className="text-white">Breakeven</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="date" className="text-white">Date</SelectItem>
                <SelectItem value="pnl" className="text-white">P&L</SelectItem>
                <SelectItem value="symbol" className="text-white">Symbol</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="desc" className="text-white">Newest First</SelectItem>
                <SelectItem value="asc" className="text-white">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-dark-card border-dark-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{filteredTrades.length}</div>
            <div className="text-sm text-gray-400">Total Trades</div>
          </CardContent>
        </Card>
        <Card className="bg-dark-card border-dark-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(filteredTrades.reduce((sum, trade) => sum + Math.max(0, trade.pnl), 0))}
            </div>
            <div className="text-sm text-gray-400">Total Wins</div>
          </CardContent>
        </Card>
        <Card className="bg-dark-card border-dark-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-400">
              {formatCurrency(Math.abs(filteredTrades.reduce((sum, trade) => sum + Math.min(0, trade.pnl), 0)))}
            </div>
            <div className="text-sm text-gray-400">Total Losses</div>
          </CardContent>
        </Card>
        <Card className="bg-dark-card border-dark-border">
          <CardContent className="p-4">
            <div className={`text-2xl font-bold ${
              filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatCurrency(filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0))}
            </div>
            <div className="text-sm text-gray-400">Net P&L</div>
          </CardContent>
        </Card>
      </div>

      {/* Trades Table */}
      <Card className="bg-dark-card border-dark-border">
        <CardHeader>
          <CardTitle className="text-white">Trade History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Time</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Duration</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Account</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Symbol</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Side</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Quantity</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Entry</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Exit</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">P&L</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-medium">Result</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Initial SL Price</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Initial TP Price</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Final SL Price</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Final TP Price</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-medium">Price Chart</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-medium">Planned Trade Link</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map((trade) => (
                  <tr 
                    key={trade.id} 
                    className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer"
                    onClick={(e) => {
                      // Don't trigger on button clicks within the row
                      if ((e.target as HTMLElement).closest('button')) return;
                      openTradeDetail(trade);
                    }}
                  >
                    <td className="py-3 px-4 text-white">{formatDate(trade.date)}</td>
                    <td className="py-3 px-4 text-gray-300">
                      <div className="space-y-1">
                        <div className="text-green-400 text-xs font-medium">Entry:</div>
                        <div>
                          {trade.fillTime ? new Date(trade.fillTime).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit', 
                            hour12: false 
                          }) : '-'}
                        </div>
                        <div className="text-red-400 text-xs font-medium">Exit:</div>
                        <div>
                          {trade.exitTime ? new Date(trade.exitTime).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit', 
                            hour12: false 
                          }) : (trade.status === 'open' ? (
                            <span className="text-blue-400">Open</span>
                          ) : (
                            <span className="text-yellow-400 text-xs">Not recorded</span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {(() => {
                        // Check if we have entry time
                        if (!trade.fillTime) return 'No entry time';
                        
                        const entryTime = new Date(trade.fillTime);
                        let exitTime;
                        
                        // Priority 1: Use actual exitTime if available
                        if (trade.exitTime) {
                          exitTime = new Date(trade.exitTime);
                        }
                        // Priority 2: For closed trades without exitTime, indicate missing data
                        else if (trade.status === 'closed' && trade.exitPrice) {
                          return (
                            <span className="text-yellow-400 text-xs">
                              Exit time not recorded
                            </span>
                          );
                        }
                        // Priority 3: Open trades show "Open"
                        else {
                          return trade.status === 'open' ? (
                            <span className="text-blue-400">Currently open</span>
                          ) : 'No timing data';
                        }
                        
                        // Calculate actual duration from real timestamps
                        const durationMs = exitTime.getTime() - entryTime.getTime();
                        const durationMinutes = Math.max(1, Math.floor(durationMs / (1000 * 60)));
                        
                        if (durationMinutes < 60) {
                          return `${durationMinutes}m`;
                        } else if (durationMinutes < 1440) { // Less than 24 hours
                          const hours = Math.floor(durationMinutes / 60);
                          const mins = durationMinutes % 60;
                          return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
                        } else {
                          const days = Math.floor(durationMinutes / 1440);
                          const hours = Math.floor((durationMinutes % 1440) / 60);
                          return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
                        }
                      })()}
                    </td>
                    <td className="py-3 px-4 text-gray-300">{getAccountName(trade.accountId)}</td>
                    <td className="py-3 px-4 text-white font-medium">{trade.symbol}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={trade.side === 'buy' ? 'default' : 'secondary'}
                        className={trade.side === 'buy' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
                      >
                        {trade.side.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-white">{trade.quantity}</td>
                    <td className="py-3 px-4 text-right text-white">{formatPrice(trade.entryPrice)}</td>
                    <td className="py-3 px-4 text-right text-white">
                      {trade.exitPrice ? formatPrice(trade.exitPrice) : '-'}
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${
                      trade.pnl > 0 ? 'text-green-400' : trade.pnl < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {trade.pnl >= 0 ? '+' : '-'}{formatCurrency(Math.abs(trade.pnl))}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge 
                        variant={trade.pnl > 0 ? 'default' : trade.pnl < 0 ? 'destructive' : 'secondary'}
                        className={
                          trade.pnl > 0 ? 'bg-green-600 text-white' :
                          trade.pnl < 0 ? 'bg-red-600 text-white' :
                          'bg-gray-600 text-white'
                        }
                      >
                        {trade.pnl > 0 ? 'WIN' : trade.pnl < 0 ? 'LOSS' : 'BREAKEVEN'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300">
                      {trade.initialStopLoss ? formatPrice(trade.initialStopLoss) : 
                        <span className="text-gray-500 text-sm">—</span>}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300">
                      {trade.initialTakeProfit ? formatPrice(trade.initialTakeProfit) : 
                        <span className="text-gray-500 text-sm">—</span>}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300">
                      {trade.finalStopLoss ? formatPrice(trade.finalStopLoss) : 
                        <span className="text-gray-500 text-sm">—</span>}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300">
                      {trade.finalTakeProfit ? formatPrice(trade.finalTakeProfit) : 
                        <span className="text-gray-500 text-sm">—</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col gap-1">
                        {trade.tradeImage && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => trade.tradeImage && window.open(trade.tradeImage, '_blank')}
                            className="text-purple-400 border-purple-400 hover:bg-purple-400/20"
                          >
                            🖼️ Trade Image
                          </Button>
                        )}
                        {trade.tradingViewLink && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => trade.tradingViewLink && window.open(trade.tradingViewLink, '_blank')}
                            className="text-blue-400 border-blue-400 hover:bg-blue-400/20"
                          >
                            📈 TradingView
                          </Button>
                        )}
                        {!trade.tradeImage && !trade.tradingViewLink && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`https://www.tradingview.com/chart/?symbol=${trade.symbol}`, '_blank')}
                            className="text-blue-400 border-blue-400 hover:bg-blue-400/20"
                          >
                            📈 View Chart
                          </Button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {editingTradeId === trade.id ? (
                        <div className="flex flex-col gap-2">
                          <Input
                            value={editingLink}
                            onChange={(e) => setEditingLink(e.target.value)}
                            placeholder="Enter TradingView link..."
                            className="text-xs h-8"
                          />
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={saveTradeLink}
                              disabled={updateTradeMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 h-6 px-2"
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditing}
                              className="h-6 px-2"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {trade.tradingViewLink && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(trade.tradingViewLink || '', '_blank')}
                              className="text-blue-400 border-blue-400 hover:bg-blue-400/20 h-6 text-xs"
                            >
                              📈 View Plan
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(trade)}
                            className="text-yellow-400 border-yellow-400 hover:bg-yellow-400/20 h-6 text-xs"
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            {trade.tradingViewLink ? 'Edit' : 'Add'} Link
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredTrades.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No trades found matching your filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>

      {/* Trade Detail Modal */}
      <SimpleTradeModal 
        trade={selectedTrade}
        isOpen={isDetailModalOpen}
        onClose={closeTradeDetail}
      />
      </div>
    </div>
  );
}