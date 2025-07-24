import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CalendarDays, Download, Filter, Search, Plus, Edit3, Save, X, Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Trade, Account } from "@shared/schema";
import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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

  // Convert contract symbols to standard format
  const convertContractToSymbol = (contract: string): string => {
    if (!contract) return 'UNKNOWN';
    
    // Futures contract mapping
    if (contract.startsWith('MES')) return 'ES';   // Micro E-mini S&P 500
    if (contract.startsWith('NQ')) return 'NQ';    // E-mini NASDAQ 100
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
      notes: 'Performance CSV Import'
    };

    console.log('🔍 PERFORMANCE: Mapped trade:', {
      fillTime: mappedTrade.fillTime,
      exitTime: mappedTrade.exitTime
    });

    return mappedTrade;
  };

  // Map Orders CSV - requires matching buy/sell orders
  const mapOrdersRows = (rows: any[]): any[] => {
    console.log('🔍 ORDERS: Processing', rows.length, 'order rows');
    
    const trades = [];
    const orderMap = new Map();
    
    // Group orders by symbol and account to match entry/exit
    rows.forEach(row => {
      const symbol = convertContractToSymbol(row['Contract']);
      const account = row['Account'];
      const side = row['B/S'].toLowerCase();
      const key = `${symbol}-${account}`;
      
      if (!orderMap.has(key)) {
        orderMap.set(key, { buys: [], sells: [] });
      }
      
      const orderGroup = orderMap.get(key);
      if (side === 'buy' || side === 'b') {
        orderGroup.buys.push(row);
      } else if (side === 'sell' || side === 's') {
        orderGroup.sells.push(row);
      }
    });
    
    // Match buy/sell pairs to create trades
    for (const [key, orders] of Array.from(orderMap.entries())) {
      const { buys, sells } = orders;
      
      // Simple FIFO matching
      const maxPairs = Math.min(buys.length, sells.length);
      for (let i = 0; i < maxPairs; i++) {
        const buyOrder = buys[i];
        const sellOrder = sells[i];
        
        const account = findAccountByName(buyOrder['Account']);
        const entryTime = new Date(buyOrder['Fill Time']);
        const exitTime = new Date(sellOrder['Fill Time']);
        
        const trade = {
          accountId: account.id,
          symbol: convertContractToSymbol(buyOrder['Contract']),
          side: entryTime < exitTime ? 'buy' : 'sell',
          quantity: parseInt(buyOrder['Filled Qty']) || 1,
          fillTime: entryTime < exitTime ? buyOrder['Fill Time'] : sellOrder['Fill Time'],
          exitTime: entryTime < exitTime ? sellOrder['Fill Time'] : buyOrder['Fill Time'],
          entryPrice: entryTime < exitTime ? 
            parseFloat(buyOrder['Avg Fill Price']) || 0 : 
            parseFloat(sellOrder['Avg Fill Price']) || 0,
          exitPrice: entryTime < exitTime ? 
            parseFloat(sellOrder['Avg Fill Price']) || 0 : 
            parseFloat(buyOrder['Avg Fill Price']) || 0,
          pnl: 0, // Calculate later
          status: 'closed',
          date: buyOrder['Date'] || sellOrder['Date'] || new Date().toISOString().split('T')[0],
          orderId: `ORD-${buyOrder['Order ID']}-${sellOrder['Order ID']}`,
          notes: 'Orders CSV Import - Matched Buy/Sell'
        };
        
        // Calculate P&L
        const priceDiff = trade.exitPrice - trade.entryPrice;
        trade.pnl = trade.side === 'buy' ? 
          priceDiff * trade.quantity : 
          -priceDiff * trade.quantity;
        
        trades.push(trade);
      }
    }
    
    console.log('🔍 ORDERS: Created', trades.length, 'matched trades');
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
        
        // Calculate P&L
        const priceDiff = trade.exitPrice - trade.entryPrice;
        trade.pnl = trade.side === 'buy' ? 
          priceDiff * trade.quantity : 
          -priceDiff * trade.quantity;
        
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
      alert(`Error parsing CSV: ${(error as Error).message}`);
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
      
      // Send to API
      const response = await apiRequest('/api/trades/import', 'POST', {
        trades,
        source: `${csvFormat}-csv`
      });
      
      console.log('🔍 API Response:', response);
      
      if (response && (response as any).success) {
        setImportStats({
          imported: trades.length,
          errors: errors.length,
          longTrades: trades.filter(t => t.side === 'buy').length,
          shortTrades: trades.filter(t => t.side === 'sell').length,
          format: csvFormat
        });
        
        alert(`✅ Successfully imported ${trades.length} trades from ${csvFormat.toUpperCase()} CSV!\n\n` +
              `Long trades: ${trades.filter(t => t.side === 'buy').length}\n` +
              `Short trades: ${trades.filter(t => t.side === 'sell').length}\n` +
              `${errors.length > 0 ? `Errors: ${errors.length}` : ''}`);
        
        queryClient.invalidateQueries({ queryKey: ['/api/trades'] });
        
        // Reset form
        setCsvFile(null);
        setPreviewData([]);
        setCsvFormat('unknown');
        setCsvHeaders([]);
        
      } else {
        throw new Error((response as any).message || 'Import failed');
      }
      
    } catch (error) {
      console.error('Import error:', error);
      alert(`Import failed: ${(error as Error).message}`);
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

  return (
    <div className="space-y-6">
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
            className="bg-gray-700 border-gray-600 text-white file:bg-blue-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1"
          />
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
        disabled={!csvFile || csvFormat === 'unknown' || isUploading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
        size="lg"
      >
        {isUploading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Importing {formatInfo.name}...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Import {formatInfo.name} CSV
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

  // Filter and sort trades
  const filteredTrades = useMemo(() => {
    if (!trades) return [];
    
    let filtered = trades.filter(trade => {
      const matchesSearch = 
        trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trade.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      
      const matchesAccount = selectedAccount === "all" || trade.accountId.toString() === selectedAccount;
      const matchesStatus = selectedStatus === "all" || trade.status === selectedStatus;
      
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
                      alert(`Updated ${result.updatedCount} trades with improved SL/TP analysis`);
                      window.location.reload();
                    } else {
                      alert(`Error: ${result.message || 'Failed to reprocess trades'}`);
                    }
                  } catch (error) {
                    console.error('Reprocessing error:', error);
                    alert('Failed to reprocess trades');
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
                  <tr key={trade.id} className="border-b border-gray-800 hover:bg-gray-800/50">
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
                      {trade.initialStopLoss ? formatPrice(trade.initialStopLoss) : 'Not placed'}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300">
                      {trade.initialTakeProfit ? formatPrice(trade.initialTakeProfit) : 'Not placed'}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300">
                      {trade.finalStopLoss ? formatPrice(trade.finalStopLoss) : 'Not placed'}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300">
                      {trade.finalTakeProfit ? formatPrice(trade.finalTakeProfit) : 'Not placed'}
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
      </div>
    </div>
  );
}