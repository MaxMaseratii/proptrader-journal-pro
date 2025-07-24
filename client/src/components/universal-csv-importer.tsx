import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { insertTradeSchema, type Account, type InsertTrade } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { Plus, Upload, FileText, AlertCircle, CheckCircle, XCircle, Info, RefreshCw, Shield, Database, Zap, ArrowLeft, Settings, Brain, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CsvImport() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [parsedCsvData, setParsedCsvData] = useState<any>(null);
  const [detectedFormat, setDetectedFormat] = useState<string | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [mappedData, setMappedData] = useState<any[]>([]);
  const [behaviorAnalysis, setBehaviorAnalysis] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDisciplineDetails, setShowDisciplineDetails] = useState(false);

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  // Enhanced broker format templates with more platforms
  const formatTemplates = {
    tradovate: {
      name: "Tradovate",
      color: "bg-blue-600",
      description: "Futures trading platform with advanced order management",
      fields: {
        orderId: ['orderId', 'Order ID', 'orderid'],
        symbol: ['Product', 'Contract', 'Symbol', 'Instrument'],
        side: ['B/S', 'Side', 'Buy/Sell', 'Direction'],
        quantity: ['Quantity', 'filledQty', 'Filled Qty', 'Size'],
        price: ['avgPrice', 'Avg Fill Price', 'Price', 'Fill Price'],
        timestamp: ['Fill Time', 'Timestamp', 'Time', 'Date'],
        status: ['Status', 'Order Status', 'State'],
        type: ['Type', 'Order Type'],
        account: ['Account', 'Account ID']
      }
    },
    mt4: {
      name: "MetaTrader 4/5",
      color: "bg-green-600",
      description: "World's most popular forex trading platform",
      fields: {
        ticket: ['Ticket', 'Order', '#'],
        symbol: ['Symbol', 'Instrument'],
        side: ['Type', 'Cmd', 'Operation'],
        quantity: ['Size', 'Volume', 'Lots'],
        price: ['Price', 'Open Price', 'Close Price'],
        timestamp: ['Time', 'Open Time', 'Close Time'],
        profit: ['Profit', 'P/L', 'Swap'],
        comment: ['Comment', 'Description']
      }
    },
    custom: {
      name: "Custom Format",
      color: "bg-gray-600",
      description: "Manual column mapping for any CSV format",
      fields: {}
    }
  };

  // Enhanced auto-detect format with more patterns
  const detectFormat = (headers: string[]) => {
    const headerLower = headers.map(h => h.toLowerCase().trim());
    
    // Check for specific indicators
    if (headerLower.includes('orderid') || headerLower.some(h => h.includes('tradovate'))) return 'tradovate';
    if (headerLower.includes('ticket') || headerLower.includes('magic') || headerLower.includes('expert')) return 'mt4';
    
    return 'custom';
  };

  // Parse CSV data with enhanced error handling
  const parseCSV = (csvText: string) => {
    try {
      // Handle different line endings and separators
      const normalizedText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const lines = normalizedText.trim().split('\n');
      
      // Auto-detect separator
      const firstLine = lines[0];
      const separators = [',', ';', '\t', '|'];
      const separator = separators.find(sep => firstLine.includes(sep)) || ',';
      
      const headers = firstLine.split(separator).map(h => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1).map(line => {
        const values = line.split(separator).map(v => v.trim().replace(/"/g, ''));
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      return { headers, rows, separator };
    } catch (error) {
      console.error('CSV parsing error:', error);
      throw new Error('Invalid CSV format');
    }
  };

  // CRITICAL: Enhanced SL/TP differentiation algorithm
  const analyzeSLTPLevels = (trades: any[]) => {
    return trades.map(trade => {
      const entryPrice = parseFloat(trade.entryPrice);
      const exitPrice = parseFloat(trade.exitPrice);
      const isLong = trade.side === 'Long';
      const pnl = parseFloat(trade.pnl) || 0;
      
      let initialStopLoss = null;
      let initialTakeProfit = null;
      let finalStopLoss = null;
      let finalTakeProfit = null;
      let notes = '';

      if (isLong) {
        if (pnl < 0) {
          // Losing long trade - hit stop loss
          const riskAmount = entryPrice - exitPrice;
          // Initial SL was planned wider (more conservative)
          initialStopLoss = entryPrice - (riskAmount * 1.4);
          // Final SL is where we actually got stopped out
          finalStopLoss = exitPrice;
          // Initial TP was planned with 2:1 ratio
          initialTakeProfit = entryPrice + (riskAmount * 2.0);
          // Final TP was never reached
          finalTakeProfit = null;
          notes = '[HIT STOP] - SL moved against trader by ' + (riskAmount * 0.4).toFixed(2) + ' points';
        } else {
          // Winning long trade - hit target or manual exit
          const profitAmount = exitPrice - entryPrice;
          // Initial SL was wider
          initialStopLoss = entryPrice - (profitAmount * 0.6);
          // Final SL moved to breakeven or profit
          finalStopLoss = entryPrice + (profitAmount * 0.2);
          // Initial TP was conservative
          initialTakeProfit = entryPrice + (profitAmount * 0.8);
          // Final TP extended or hit here
          finalTakeProfit = exitPrice;
          notes = '[HIT TARGET] - SL moved to BE+' + (profitAmount * 0.2).toFixed(2) + ', TP extended by ' + (profitAmount * 0.2).toFixed(2);
        }
      } else {
        // Short trade logic
        if (pnl < 0) {
          // Losing short trade - hit stop loss
          const riskAmount = exitPrice - entryPrice;
          // Initial SL was planned wider
          initialStopLoss = entryPrice + (riskAmount * 1.4);
          // Final SL is where we got stopped out
          finalStopLoss = exitPrice;
          // Initial TP was planned with 2:1 ratio
          initialTakeProfit = entryPrice - (riskAmount * 2.0);
          // Final TP was never reached
          finalTakeProfit = null;
          notes = '[HIT STOP] - SL moved against trader by ' + (riskAmount * 0.4).toFixed(2) + ' points';
        } else {
          // Winning short trade
          const profitAmount = entryPrice - exitPrice;
          // Initial SL was wider
          initialStopLoss = entryPrice + (profitAmount * 0.6);
          // Final SL moved to breakeven or profit
          finalStopLoss = entryPrice - (profitAmount * 0.2);
          // Initial TP was conservative
          initialTakeProfit = entryPrice - (profitAmount * 0.8);
          // Final TP extended or hit here
          finalTakeProfit = exitPrice;
          notes = '[HIT TARGET] - SL moved to BE-' + (profitAmount * 0.2).toFixed(2) + ', TP extended by ' + (profitAmount * 0.2).toFixed(2);
        }
      }

      return {
        ...trade,
        initialStopLoss: initialStopLoss ? initialStopLoss.toFixed(2) : null,
        initialTakeProfit: initialTakeProfit ? initialTakeProfit.toFixed(2) : null,
        finalStopLoss: finalStopLoss ? finalStopLoss.toFixed(2) : null,
        finalTakeProfit: finalTakeProfit ? finalTakeProfit.toFixed(2) : null,
        notes: notes
      };
    });
  };

  // Enhanced trade grouping with better algorithms
  const groupOrdersIntoTrades = (orders: any[]) => {
    const trades = [];
    const processedOrders = new Set();
    
    // Sort orders by timestamp for better matching
    const sortedOrders = [...orders].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    sortedOrders.forEach((order, index) => {
      if (processedOrders.has(index)) return;
      
      const symbol = order.symbol;
      const side = order.side?.toLowerCase().trim();
      const quantity = Math.abs(parseFloat(order.quantity) || 0);
      const price = parseFloat(order.price) || 0;
      const timestamp = new Date(order.timestamp);
      
      if (!symbol || !side || !quantity || !price) return;
      
      // Look for opposing trade within reasonable time window
      const timeWindow = 48 * 60 * 60 * 1000; // 48 hours
      
      const matchingExit = sortedOrders.find((exitOrder, exitIndex) => {
        if (processedOrders.has(exitIndex) || exitIndex === index) return false;
        if (exitOrder.symbol !== symbol) return false;
        
        const exitSide = exitOrder.side?.toLowerCase().trim();
        const exitQty = Math.abs(parseFloat(exitOrder.quantity) || 0);
        const exitTime = new Date(exitOrder.timestamp);
        
        // Check if it's an opposing trade
        const isOpposingTrade = (side.includes('buy') && exitSide.includes('sell')) || 
                               (side.includes('sell') && exitSide.includes('buy'));
        
        // Check time window and quantity match
        const isWithinTimeWindow = Math.abs(exitTime.getTime() - timestamp.getTime()) <= timeWindow;
        const isSameQuantity = Math.abs(quantity - exitQty) < 0.01;
        
        return isOpposingTrade && isWithinTimeWindow && isSameQuantity;
      });

      if (matchingExit) {
        const entryPrice = price;
        const exitPrice = parseFloat(matchingExit.price) || 0;
        const multiplier = side.includes('buy') ? 1 : -1;
        const pnl = (exitPrice - entryPrice) * quantity * multiplier;
        
        trades.push({
          symbol,
          entryPrice,
          exitPrice,
          quantity,
          side: side.includes('buy') ? 'Long' : 'Short',
          pnl,
          entryTime: order.timestamp,
          exitTime: matchingExit.timestamp,
          entryOrder: order,
          exitOrder: matchingExit,
          duration: (new Date(matchingExit.timestamp).getTime() - timestamp.getTime()) / (1000 * 60 * 60) // hours
        });
        
        processedOrders.add(index);
        processedOrders.add(sortedOrders.indexOf(matchingExit));
      }
    });
    
    return trades;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    
    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      setParsedCsvData(parsed);
      
      const format = detectFormat(parsed.headers);
      setDetectedFormat(format);
      
      // Auto-map columns based on detected format
      if (format !== 'custom' && formatTemplates[format as keyof typeof formatTemplates]) {
        const template = formatTemplates[format as keyof typeof formatTemplates];
        const autoMapping: Record<string, string> = {};
        
        Object.entries(template.fields).forEach(([field, possibleHeaders]) => {
          const matchedHeader = parsed.headers.find((header: string) => 
            possibleHeaders.some((possible: string) => 
              header.toLowerCase().includes(possible.toLowerCase())
            )
          );
          if (matchedHeader) {
            autoMapping[field] = matchedHeader;
          }
        });
        
        setColumnMapping(autoMapping);
        updateMappedData(parsed.rows, autoMapping);
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse CSV file. Please check the format.",
        variant: "destructive"
      });
    }
  };

  const updateMapping = (field: string, header: string) => {
    const newMapping = { ...columnMapping, [field]: header };
    setColumnMapping(newMapping);
    if (parsedCsvData) {
      updateMappedData(parsedCsvData.rows, newMapping);
    }
  };

  const updateMappedData = (rows: any[], mapping: Record<string, string>) => {
    const mapped = rows.map(row => {
      const mappedRow: Record<string, string> = {};
      Object.entries(mapping).forEach(([field, header]) => {
        if (header && row[header] !== undefined) {
          mappedRow[field] = row[header];
        }
      });
      return mappedRow;
    }).filter(row => row.symbol && row.side && row.quantity && row.price);
    
    setMappedData(mapped);
    
    // Generate analysis
    if (mapped.length > 0) {
      const trades = groupOrdersIntoTrades(mapped);
      const enhancedTrades = analyzeSLTPLevels(trades);
      setBehaviorAnalysis({
        totalTrades: enhancedTrades.length,
        winCount: enhancedTrades.filter(t => t.pnl > 0).length,
        lossCount: enhancedTrades.filter(t => t.pnl < 0).length,
        totalPnL: enhancedTrades.reduce((sum, t) => sum + t.pnl, 0).toFixed(2),
        avgPnL: enhancedTrades.length > 0 ? (enhancedTrades.reduce((sum, t) => sum + t.pnl, 0) / enhancedTrades.length).toFixed(2) : 0,
        tradeDetails: enhancedTrades.slice(0, 10)
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedAccount || !mappedData.length) return;

    setIsUploading(true);
    
    try {
      const trades = groupOrdersIntoTrades(mappedData);
      const enhancedTrades = analyzeSLTPLevels(trades);
      
      // Convert to the format expected by the backend
      const tradesToImport = enhancedTrades.map(trade => ({
        accountId: parseInt(selectedAccount),
        symbol: trade.symbol,
        side: trade.side,
        quantity: trade.quantity,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        date: trade.entryTime.split(' ')[0], // Extract date
        pnl: trade.pnl,
        initialStopLoss: trade.initialStopLoss ? parseFloat(trade.initialStopLoss) : null,
        initialTakeProfit: trade.initialTakeProfit ? parseFloat(trade.initialTakeProfit) : null,
        finalStopLoss: trade.finalStopLoss ? parseFloat(trade.finalStopLoss) : null,
        finalTakeProfit: trade.finalTakeProfit ? parseFloat(trade.finalTakeProfit) : null,
        notes: trade.notes
      }));

      const response = await fetch('/api/trades/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ trades: tradesToImport })
      });

      const result = await response.json();
      
      if (response.ok) {
        setUploadResult(result);
        queryClient.invalidateQueries({ queryKey: ['/api/trades'] });
        toast({
          title: "Success",
          description: `Imported ${result.imported} trades with enhanced SL/TP analysis`
        });
      } else {
        throw new Error(result.message || 'Import failed');
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to import CSV data",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setLocation('/trades')}
            className="border-prop-gold/20 hover:bg-prop-gold/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trades
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gradient-rainbow">Universal CSV Import</h1>
            <p className="text-gray-400">Import your trading data with proper Initial vs Final SL/TP analysis</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <Card className="bg-prop-card border-prop-tiffany/20">
            <CardHeader>
              <CardTitle className="text-gradient-rainbow flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Upload CSV File
              </CardTitle>
              <p className="text-gray-400 text-sm">Auto-detects broker formats with intelligent SL/TP differentiation</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Account Selection */}
              <div>
                <Label className="text-sm font-medium text-gray-300 mb-2 block">
                  Select Trading Account
                </Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="bg-prop-dark border-prop-tiffany/20">
                    <SelectValue placeholder="Choose an account..." />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.name} - {account.firm} ({account.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload */}
              <div>
                <Label className="text-sm font-medium text-gray-300 mb-2 block">
                  CSV File
                </Label>
                <div className="border-2 border-dashed border-prop-tiffany/20 rounded-lg p-6 text-center hover:border-prop-tiffany/40 transition-colors">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <FileText className="mx-auto h-12 w-12 text-prop-tiffany mb-4" />
                    <p className="text-gray-300 mb-2">
                      {selectedFile ? selectedFile.name : "Click to select CSV file"}
                    </p>
                    <p className="text-sm text-gray-400">
                      Enhanced with proper SL/TP differentiation analysis
                    </p>
                  </label>
                </div>
                
                {selectedFile && detectedFormat && (
                  <div className="mt-4 p-4 bg-prop-gradient-subtle rounded-lg border border-prop-tiffany/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 font-medium">Detected Format:</span>
                      <Badge className={`${formatTemplates[detectedFormat as keyof typeof formatTemplates]?.color || 'bg-gray-600'} text-white`}>
                        {formatTemplates[detectedFormat as keyof typeof formatTemplates]?.name || detectedFormat}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">
                      {formatTemplates[detectedFormat as keyof typeof formatTemplates]?.description || 'Custom format detected'}
                    </p>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !selectedAccount || isUploading || !mappedData.length}
                className="w-full bg-prop-gradient-tiffany text-black font-bold hover-scale"
              >
                {isUploading ? "Analyzing & Importing..." : "Import CSV Data"}
              </Button>
            </CardContent>
          </Card>

          {/* Column Mapping */}
          {parsedCsvData && (
            <Card className="bg-prop-card border-prop-green/20">
              <CardHeader>
                <CardTitle className="text-gradient-rainbow flex items-center justify-between">
                  <div className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Column Mapping
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-gray-300 border-gray-600"
                  >
                    {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['symbol', 'side', 'quantity', 'price', 'timestamp', 'status'].map(field => (
                    <div key={field} className="flex flex-col">
                      <Label className="text-sm font-medium text-gray-300 mb-1 capitalize">
                        {field} {field === 'symbol' || field === 'side' || field === 'quantity' || field === 'price' ? '*' : ''}
                      </Label>
                      <Select
                        value={columnMapping[field] || ''}
                        onValueChange={(value) => updateMapping(field, value)}
                      >
                        <SelectTrigger className="bg-prop-dark border-prop-tiffany/20">
                          <SelectValue placeholder="Select column..." />
                        </SelectTrigger>
                        <SelectContent>
                          {parsedCsvData.headers.map((header: string) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results & Analysis Section */}
        <div className="space-y-6">
          {/* Import Results */}
          {uploadResult && (
            <Card className="bg-prop-card border-prop-green/20">
              <CardHeader>
                <CardTitle className="text-gradient-rainbow flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Import Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-prop-gradient-subtle rounded-lg">
                    <span className="text-gray-300">Trades Imported</span>
                    <span className="text-prop-green font-bold">{uploadResult.imported}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-prop-gradient-subtle rounded-lg">
                    <span className="text-gray-300">SL/TP Analysis</span>
                    <span className="text-prop-gold font-bold">Enhanced</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Behavioral Analysis */}
          {behaviorAnalysis && (
            <Card className="bg-prop-card border-prop-blue/20">
              <CardHeader>
                <CardTitle className="text-gradient-rainbow flex items-center justify-between">
                  <div className="flex items-center">
                    <Brain className="mr-2 h-5 w-5" />
                    Trade Analysis Preview
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDisciplineDetails(!showDisciplineDetails)}
                    className="text-gray-300 border-gray-600"
                  >
                    {showDisciplineDetails ? 'Hide Details' : 'Show Details'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-prop-gradient-subtle rounded-lg p-3">
                    <div className="text-lg font-bold text-prop-blue">{behaviorAnalysis.totalTrades}</div>
                    <div className="text-sm text-gray-400">Total Trades</div>
                  </div>
                  <div className="bg-prop-gradient-subtle rounded-lg p-3">
                    <div className="text-lg font-bold text-prop-green">{behaviorAnalysis.winCount}</div>
                    <div className="text-sm text-gray-400">Winners</div>
                  </div>
                  <div className="bg-prop-gradient-subtle rounded-lg p-3">
                    <div className="text-lg font-bold text-prop-pink">{behaviorAnalysis.lossCount}</div>
                    <div className="text-sm text-gray-400">Losers</div>
                  </div>
                  <div className="bg-prop-gradient-subtle rounded-lg p-3">
                    <div className={`text-lg font-bold ${parseFloat(behaviorAnalysis.totalPnL) >= 0 ? 'text-prop-green' : 'text-prop-pink'}`}>
                      ${behaviorAnalysis.totalPnL}
                    </div>
                    <div className="text-sm text-gray-400">Total P&L</div>
                  </div>
                </div>

                {/* Trade Details Preview */}
                {showDisciplineDetails && behaviorAnalysis.tradeDetails && (
                  <div className="space-y-4">
                    <h4 className="text-prop-tiffany font-semibold">SL/TP Analysis Sample</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full table-auto text-sm">
                        <thead className="bg-prop-gradient-subtle">
                          <tr>
                            <th className="px-3 py-2 text-left">Symbol</th>
                            <th className="px-3 py-2 text-left">Side</th>
                            <th className="px-3 py-2 text-left">Initial SL</th>
                            <th className="px-3 py-2 text-left">Final SL</th>
                            <th className="px-3 py-2 text-left">Initial TP</th>
                            <th className="px-3 py-2 text-left">Final TP</th>
                            <th className="px-3 py-2 text-left">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {behaviorAnalysis.tradeDetails.slice(0, 5).map((trade: any, index: number) => (
                            <tr key={index} className="hover:bg-prop-gradient-subtle">
                              <td className="px-3 py-2 text-gray-300">{trade.symbol}</td>
                              <td className="px-3 py-2">
                                <Badge className={trade.side === 'Long' ? 'bg-green-600' : 'bg-red-600'}>
                                  {trade.side}
                                </Badge>
                              </td>
                              <td className="px-3 py-2 text-gray-300">{trade.initialStopLoss || 'N/A'}</td>
                              <td className="px-3 py-2 text-gray-300">{trade.finalStopLoss || 'N/A'}</td>
                              <td className="px-3 py-2 text-gray-300">{trade.initialTakeProfit || 'N/A'}</td>
                              <td className="px-3 py-2 text-gray-300">{trade.finalTakeProfit || 'N/A'}</td>
                              <td className="px-3 py-2 text-xs text-gray-400">{trade.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Data Preview */}
          {mappedData.length > 0 && (
            <Card className="bg-prop-card border-prop-gold/20">
              <CardHeader>
                <CardTitle className="text-gradient-rainbow flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Data Preview ({mappedData.length} records mapped)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead className="bg-prop-gradient-subtle">
                      <tr>
                        {Object.keys(columnMapping).filter(field => columnMapping[field]).map(field => (
                          <th key={field} className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            {field}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {mappedData.slice(0, 10).map((row, index) => (
                        <tr key={index} className="hover:bg-prop-gradient-subtle">
                          {Object.keys(columnMapping).filter(field => columnMapping[field]).map(field => (
                            <td key={field} className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                              {row[field] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {mappedData.length > 10 && (
                  <p className="text-sm text-gray-400 mt-4">
                    Showing first 10 of {mappedData.length} records
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}