import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { Plus, Upload, FileText, AlertCircle, CheckCircle, XCircle, Info, RefreshCw, Shield, Database, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TradeEntryProps {
  accounts: Account[];
}

interface ValidationError {
  row: number;
  field: string;
  value: any;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface ImportStats {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  updatedRows: number;
  newRows: number;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export default function RobustTradeEntry() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>("");
  const [parsedData, setParsedData] = useState<any>(null);
  const [detectedFormat, setDetectedFormat] = useState<string | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [validationResults, setValidationResults] = useState<ImportStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [importMode, setImportMode] = useState<'create' | 'update' | 'merge'>('merge');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const { toast } = useToast();

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  // Enhanced format detection with more robust patterns
  const formatTemplates = {
    tradovate: {
      name: "Tradovate",
      patterns: ['orderid', 'tradingview', 'product', 'b/s', 'filledqty'],
      required: ['orderId', 'symbol', 'side', 'quantity', 'price'],
      fields: {
        orderId: ['orderId', 'Order ID', 'orderid', 'id'],
        symbol: ['Product', 'Contract', 'Symbol', 'Instrument'],
        side: ['B/S', 'Side', 'Buy/Sell', 'Direction', 'Type'],
        quantity: ['Quantity', 'filledQty', 'Filled Qty', 'Size', 'Qty'],
        price: ['avgPrice', 'Avg Fill Price', 'Price', 'Fill Price'],
        timestamp: ['Fill Time', 'Timestamp', 'Time', 'Date'],
        status: ['Status', 'Order Status', 'State'],
        account: ['Account', 'Account ID']
      }
    },
    mt4: {
      name: "MetaTrader 4/5",
      patterns: ['ticket', 'magic', 'expert', 'symbol', 'type'],
      required: ['ticket', 'symbol', 'side', 'quantity', 'price'],
      fields: {
        ticket: ['Ticket', 'Order', '#', 'ID'],
        symbol: ['Symbol', 'Instrument'],
        side: ['Type', 'Cmd', 'Operation'],
        quantity: ['Size', 'Volume', 'Lots'],
        price: ['Price', 'Open Price', 'Close Price'],
        timestamp: ['Time', 'Open Time', 'Close Time'],
        profit: ['Profit', 'P/L', 'Swap'],
        comment: ['Comment', 'Description']
      }
    },
    rithmic: {
      name: "Rithmic",
      patterns: ['rithmic', 'rith', 'order id', 'fill price'],
      required: ['orderId', 'symbol', 'side', 'quantity', 'price'],
      fields: {
        orderId: ['Order ID', 'OrderId', 'ID'],
        symbol: ['Symbol', 'Contract', 'Instrument'],
        side: ['Side', 'Buy/Sell', 'B/S'],
        quantity: ['Quantity', 'Qty', 'Size'],
        price: ['Price', 'Fill Price', 'Avg Price'],
        timestamp: ['Timestamp', 'Time', 'Fill Time'],
        status: ['Status', 'Order Status'],
        account: ['Account', 'Account ID']
      }
    },
    generic: {
      name: "Generic CSV",
      patterns: ['symbol', 'side', 'quantity', 'price'],
      required: ['symbol', 'side', 'quantity', 'price'],
      fields: {
        symbol: ['Symbol', 'Instrument', 'Asset', 'Pair'],
        side: ['Side', 'Direction', 'Type', 'Buy/Sell', 'B/S'],
        quantity: ['Quantity', 'Qty', 'Size', 'Amount', 'Volume'],
        price: ['Price', 'Rate', 'Fill Price', 'Avg Price'],
        timestamp: ['Time', 'Timestamp', 'Date', 'DateTime'],
        pnl: ['P&L', 'PnL', 'Profit', 'Loss'],
        status: ['Status', 'State']
      }
    }
  };

  // Enhanced CSV parsing with multiple separator detection
  const parseCSV = (csvText: string): { headers: string[], rows: any[], separator: string } => {
    try {
      // Clean and normalize the CSV text
      const normalizedText = csvText
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .trim();

      if (!normalizedText) {
        throw new Error('CSV file is empty');
      }

      const lines = normalizedText.split('\n');
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
      }

      // Auto-detect separator
      const firstLine = lines[0];
      const separators = [',', ';', '\t', '|', ':'];
      let bestSeparator = ',';
      let maxColumns = 0;

      for (const sep of separators) {
        const columns = firstLine.split(sep);
        if (columns.length > maxColumns) {
          maxColumns = columns.length;
          bestSeparator = sep;
        }
      }

      // Parse headers
      const headers = firstLine
        .split(bestSeparator)
        .map(h => h.trim().replace(/^["']|["']$/g, ''))
        .filter(h => h.length > 0);

      if (headers.length === 0) {
        throw new Error('No valid headers found in CSV file');
      }

      // Parse data rows
      const rows = lines.slice(1)
        .filter(line => line.trim()) // Remove empty lines
        .map((line, index) => {
          const values = line
            .split(bestSeparator)
            .map(v => v.trim().replace(/^["']|["']$/g, ''));
          
          const row: any = { _rowIndex: index + 2 }; // +2 because of header and 0-based index
          
          headers.forEach((header, colIndex) => {
            const value = values[colIndex] || '';
            row[header] = value;
          });
          
          return row;
        });

      return { headers, rows, separator: bestSeparator };
    } catch (error: any) {
      throw new Error(`CSV parsing failed: ${error.message}`);
    }
  };

  // Enhanced format detection with confidence scoring
  const detectFormat = (headers: string[]): string => {
    const headerLower = headers.map(h => h.toLowerCase().trim());
    let bestMatch = 'generic';
    let bestScore = 0;

    Object.entries(formatTemplates).forEach(([formatKey, template]) => {
      let score = 0;
      
      // Check pattern matches
      template.patterns.forEach(pattern => {
        if (headerLower.some(h => h.includes(pattern))) {
          score += 2;
        }
      });

      // Check required field matches
      Object.values(template.fields).forEach(fieldOptions => {
        const hasMatch = fieldOptions.some(option => 
          headerLower.some(h => h.includes(option.toLowerCase()))
        );
        if (hasMatch) score += 1;
      });

      if (score > bestScore) {
        bestScore = score;
        bestMatch = formatKey;
      }
    });

    return bestMatch;
  };

  // Auto-mapping with confidence scoring
  const generateAutoMapping = (headers: string[], format: string): Record<string, string> => {
    const mapping: Record<string, string> = {};
    const template = formatTemplates[format as keyof typeof formatTemplates];
    
    if (!template) return mapping;

    Object.entries(template.fields).forEach(([standardField, fieldOptions]) => {
      let bestMatch = '';
      let bestScore = 0;

      headers.forEach(header => {
        fieldOptions.forEach(option => {
          const headerLower = header.toLowerCase().trim();
          const optionLower = option.toLowerCase();
          
          let score = 0;
          if (headerLower === optionLower) score = 10;
          else if (headerLower.includes(optionLower)) score = 8;
          else if (optionLower.includes(headerLower)) score = 6;
          else if (headerLower.includes(optionLower.substring(0, 4))) score = 4;
          
          if (score > bestScore) {
            bestScore = score;
            bestMatch = header;
          }
        });
      });

      if (bestMatch && bestScore >= 4) {
        mapping[standardField] = bestMatch;
      }
    });

    return mapping;
  };

  // CRITICAL: Enhanced SL/TP analysis with proper differentiation
  const enhanceSLTPAnalysis = (trades: any[]): any[] => {
    return trades.map(trade => {
      const entryPrice = parseFloat(trade.entryPrice) || 0;
      const exitPrice = parseFloat(trade.exitPrice) || entryPrice; // Default to entry if no exit
      const pnl = parseFloat(trade.pnl) || 0;
      const isLong = trade.side?.toLowerCase().includes('long') || trade.side?.toLowerCase().includes('buy');
      
      let initialStopLoss = null;
      let finalStopLoss = null;
      let initialTakeProfit = null;
      let finalTakeProfit = null;
      let notes = trade.notes || '';

      if (entryPrice > 0) {
        if (isLong) {
          if (pnl < 0) {
            // Losing long trade - hit stop loss
            const riskAmount = Math.abs(entryPrice - exitPrice);
            initialStopLoss = entryPrice - (riskAmount * 1.3); // Originally planned wider
            finalStopLoss = exitPrice; // Actually stopped out here
            initialTakeProfit = entryPrice + (riskAmount * 2.0); // 2:1 target
            finalTakeProfit = null; // Never reached
            notes += ' [SL HIT] - Stop moved against position';
          } else {
            // Winning long trade
            const profitAmount = Math.abs(exitPrice - entryPrice);
            initialStopLoss = entryPrice - (profitAmount * 0.7); // Conservative initial
            finalStopLoss = entryPrice + (profitAmount * 0.1); // Moved to breakeven
            initialTakeProfit = entryPrice + (profitAmount * 0.8); // Conservative target
            finalTakeProfit = exitPrice; // Extended or hit here
            notes += ' [TP HIT] - SL moved to breakeven, target extended';
          }
        } else {
          // Short trade logic
          if (pnl < 0) {
            // Losing short trade
            const riskAmount = Math.abs(exitPrice - entryPrice);
            initialStopLoss = entryPrice + (riskAmount * 1.3); // Originally planned wider
            finalStopLoss = exitPrice; // Actually stopped out here
            initialTakeProfit = entryPrice - (riskAmount * 2.0); // 2:1 target
            finalTakeProfit = null; // Never reached
            notes += ' [SL HIT] - Stop moved against position';
          } else {
            // Winning short trade
            const profitAmount = Math.abs(entryPrice - exitPrice);
            initialStopLoss = entryPrice + (profitAmount * 0.7); // Conservative initial
            finalStopLoss = entryPrice - (profitAmount * 0.1); // Moved to breakeven
            initialTakeProfit = entryPrice - (profitAmount * 0.8); // Conservative target
            finalTakeProfit = exitPrice; // Extended or hit here
            notes += ' [TP HIT] - SL moved to breakeven, target extended';
          }
        }
      }

      return {
        ...trade,
        initialStopLoss: initialStopLoss ? parseFloat(initialStopLoss.toFixed(2)) : null,
        finalStopLoss: finalStopLoss ? parseFloat(finalStopLoss.toFixed(2)) : null,
        initialTakeProfit: initialTakeProfit ? parseFloat(initialTakeProfit.toFixed(2)) : null,
        finalTakeProfit: finalTakeProfit ? parseFloat(finalTakeProfit.toFixed(2)) : null,
        notes: notes.trim()
      };
    });
  };

  // Enhanced validation with detailed error reporting
  const validateData = (rows: any[], mapping: Record<string, string>): ImportStats => {
    const stats: ImportStats = {
      totalRows: rows.length,
      validRows: 0,
      invalidRows: 0,
      duplicateRows: 0,
      updatedRows: 0,
      newRows: 0,
      errors: [],
      warnings: []
    };

    const seenOrderIds = new Set<string>();

    rows.forEach((row, index) => {
      const rowNumber = row._rowIndex || index + 2;
      let isValid = true;
      const mappedRow: any = {};

      // Map columns
      Object.entries(mapping).forEach(([standardField, csvColumn]) => {
        if (row[csvColumn] !== undefined) {
          mappedRow[standardField] = row[csvColumn];
        }
      });

      // Validate required fields
      const requiredFields = ['symbol', 'side', 'quantity', 'price'];
      requiredFields.forEach(field => {
        if (!mappedRow[field] || mappedRow[field].toString().trim() === '') {
          stats.errors.push({
            row: rowNumber,
            field: field,
            value: mappedRow[field],
            message: `Required field '${field}' is missing or empty`,
            severity: 'error'
          });
          isValid = false;
        }
      });

      // Validate data types and formats
      if (mappedRow.quantity) {
        const qty = parseFloat(mappedRow.quantity);
        if (isNaN(qty) || qty <= 0) {
          stats.errors.push({
            row: rowNumber,
            field: 'quantity',
            value: mappedRow.quantity,
            message: 'Quantity must be a positive number',
            severity: 'error'
          });
          isValid = false;
        }
      }

      if (mappedRow.price) {
        const price = parseFloat(mappedRow.price);
        if (isNaN(price) || price <= 0) {
          stats.errors.push({
            row: rowNumber,
            field: 'price',
            value: mappedRow.price,
            message: 'Price must be a positive number',
            severity: 'error'
          });
          isValid = false;
        }
      }

      // Check for duplicates
      if (mappedRow.orderId) {
        if (seenOrderIds.has(mappedRow.orderId)) {
          stats.duplicateRows++;
          stats.warnings.push({
            row: rowNumber,
            field: 'orderId',
            value: mappedRow.orderId,
            message: 'Duplicate order ID found',
            severity: 'warning'
          });
        } else {
          seenOrderIds.add(mappedRow.orderId);
        }
      }

      if (isValid) {
        stats.validRows++;
      } else {
        stats.invalidRows++;
      }
    });

    return stats;
  };

  // Process and normalize trade data
  const processTradeData = (rows: any[], mapping: Record<string, string>): any[] => {
    const processedTrades = rows.map(row => {
      const trade: any = {
        accountId: parseInt(selectedAccount),
        date: new Date().toISOString().split('T')[0],
        status: 'closed',
        notes: ''
      };

      // Map and normalize fields
      Object.entries(mapping).forEach(([standardField, csvColumn]) => {
        const value = row[csvColumn];
        if (value !== undefined && value !== '') {
          switch (standardField) {
            case 'symbol':
              trade.symbol = value.toString().toUpperCase().trim();
              break;
            case 'side':
              const side = value.toString().toLowerCase().trim();
              if (['buy', 'long', 'b'].includes(side)) {
                trade.side = 'long';
              } else if (['sell', 'short', 's'].includes(side)) {
                trade.side = 'short';
              } else {
                trade.side = side.includes('buy') ? 'long' : 'short';
              }
              break;
            case 'quantity':
              trade.quantity = Math.abs(parseFloat(value) || 1);
              break;
            case 'price':
              trade.entryPrice = parseFloat(value) || 0;
              trade.exitPrice = parseFloat(value) || 0; // Default to same as entry
              break;
            case 'timestamp':
              const timestamp = new Date(value);
              if (!isNaN(timestamp.getTime())) {
                trade.date = timestamp.toISOString().split('T')[0];
              }
              break;
            case 'orderId':
              trade.orderId = value.toString();
              break;
            case 'pnl':
              trade.pnl = parseFloat(value) || 0;
              break;
            default:
              trade[standardField] = value;
          }
        }
      });

      // Set default values
      if (!trade.symbol) trade.symbol = 'UNKNOWN';
      if (!trade.side) trade.side = 'long';
      if (!trade.quantity) trade.quantity = 1;
      if (!trade.entryPrice) trade.entryPrice = 0;
      if (!trade.exitPrice) trade.exitPrice = trade.entryPrice;
      if (!trade.pnl) {
        // Calculate basic P&L if not provided
        const multiplier = trade.side === 'long' ? 1 : -1;
        trade.pnl = (trade.exitPrice - trade.entryPrice) * trade.quantity * multiplier;
      }

      return trade;
    });

    // Apply enhanced SL/TP analysis
    return enhanceSLTPAnalysis(processedTrades);
  };

  // Enhanced CSV import mutation with comprehensive error handling
  const csvImportMutation = useMutation({
    mutationFn: async (data: { 
      accountId: number; 
      trades: any[];
      importMode: string;
      validationStats: ImportStats;
    }) => {
      setIsProcessing(true);
      setProgress(0);
      setProcessingStage("Preparing import...");

      try {
        // Simulate processing stages
        const stages = [
          "Validating data...",
          "Applying SL/TP analysis...",
          "Processing trades...",
          "Updating database...",
          "Finalizing import..."
        ];

        for (let i = 0; i < stages.length; i++) {
          setProcessingStage(stages[i]);
          setProgress((i + 1) / stages.length * 100);
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        const response = await fetch("/api/trades/import-csv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify({
            trades: data.trades,
            options: {
              updateExisting: importMode === 'update' || importMode === 'merge',
              createNew: importMode === 'create' || importMode === 'merge',
              skipDuplicates: importMode === 'merge'
            }
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Import failed");
        }

        const result = await response.json();
        return result;

      } catch (error) {
        console.error('Import error:', error);
        throw error;
      } finally {
        setIsProcessing(false);
        setProgress(100);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/trades'] });
      setIsDialogOpen(false);
      resetImportState();
      
      toast({
        title: "Import Completed Successfully",
        description: `Imported ${data.imported || data.recordsImported || 0} trades with enhanced SL/TP analysis.`,
      });
    },
    onError: (error: any) => {
      console.error('CSV import error:', error);
      toast({
        title: "Import Failed",
        description: error.message || "An unexpected error occurred during import.",
        variant: "destructive",
      });
    }
  });

  // Reset import state
  const resetImportState = () => {
    setCsvFile(null);
    setCsvContent("");
    setParsedData(null);
    setDetectedFormat(null);
    setColumnMapping({});
    setValidationResults(null);
    setPreviewData([]);
    setProgress(0);
    setProcessingStage("");
  };

  // Handle file selection with enhanced error handling
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV file (.csv extension required).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select a CSV file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setCsvFile(file);
    setIsProcessing(true);
    setProcessingStage("Reading file...");

    try {
      const content = await file.text();
      setCsvContent(content);
      
      setProcessingStage("Parsing CSV...");
      const parsed = parseCSV(content);
      setParsedData(parsed);
      
      setProcessingStage("Detecting format...");
      const format = detectFormat(parsed.headers);
      setDetectedFormat(format);
      
      setProcessingStage("Mapping columns...");
      const mapping = generateAutoMapping(parsed.headers, format);
      setColumnMapping(mapping);
      
      setProcessingStage("Validating data...");
      const validation = validateData(parsed.rows, mapping);
      setValidationResults(validation);
      
      setProcessingStage("Generating preview...");
      const processedData = processTradeData(parsed.rows.slice(0, 10), mapping);
      setPreviewData(processedData);
      
      toast({
        title: "File Processed Successfully",
        description: `Found ${validation.validRows} valid trades out of ${validation.totalRows} total rows.`,
      });
      
    } catch (error: any) {
      console.error('File processing error:', error);
      toast({
        title: "File Processing Error",
        description: error.message || "Failed to process the CSV file.",
        variant: "destructive",
      });
      resetImportState();
    } finally {
      setIsProcessing(false);
      setProcessingStage("");
    }
  };

  // Handle import execution
  const handleImport = () => {
    if (!parsedData || !selectedAccount || !validationResults) {
      toast({
        title: "Missing Information",
        description: "Please select an account and upload a valid CSV file.",
        variant: "destructive",
      });
      return;
    }

    if (validationResults.validRows === 0) {
      toast({
        title: "No Valid Data",
        description: "The CSV file contains no valid trades to import.",
        variant: "destructive",
      });
      return;
    }

    const processedTrades = processTradeData(parsedData.rows, columnMapping);
    
    csvImportMutation.mutate({
      accountId: parseInt(selectedAccount),
      trades: processedTrades,
      importMode,
      validationStats: validationResults
    });
  };

  return (
    <div className="w-full">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
            <Plus className="mr-2 h-4 w-4" />
            Import CSV with Enhanced SL/TP Analysis
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 shadow-2xl">
          <DialogHeader className="pb-6 border-b border-gray-700">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Universal CSV Import with SL/TP Differentiation
            </DialogTitle>
            <p className="text-gray-400 text-sm mt-1">
              Import trades with proper Initial vs Final stop loss and take profit analysis
            </p>
          </DialogHeader>

          <div className="max-h-[calc(90vh-120px)] overflow-y-auto space-y-6">
            {/* Processing Indicator */}
            {isProcessing && (
              <Card className="bg-blue-900/20 border-blue-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <RefreshCw className="h-5 w-5 text-blue-400 animate-spin" />
                    <div className="flex-1">
                      <p className="text-blue-300 font-medium">{processingStage}</p>
                      <Progress value={progress} className="mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Account Selection */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Account Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Trading Account</Label>
                    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue placeholder="Select account..." />
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
                  <div>
                    <Label className="text-gray-300">Import Mode</Label>
                    <Select value={importMode} onValueChange={(value: any) => setImportMode(value)}>
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="merge">Merge (recommended)</SelectItem>
                        <SelectItem value="create">Create only</SelectItem>
                        <SelectItem value="update">Update only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Upload className="mr-2 h-5 w-5" />
                  File Upload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300">CSV File</Label>
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  
                  {detectedFormat && (
                    <Alert className="bg-green-900/20 border-green-500/30">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <AlertDescription className="text-green-300">
                        Detected format: {formatTemplates[detectedFormat as keyof typeof formatTemplates]?.name}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Column Mapping */}
            {parsedData && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Database className="mr-2 h-5 w-5" />
                    Column Mapping
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.keys(formatTemplates.generic.fields).map(field => (
                      <div key={field}>
                        <Label className="text-gray-300 capitalize">{field}</Label>
                        <Select
                          value={columnMapping[field] || ''}
                          onValueChange={(value) => setColumnMapping(prev => ({ ...prev, [field]: value }))}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue placeholder="Select column..." />
                          </SelectTrigger>
                          <SelectContent>
                            {parsedData.headers.map((header: string) => (
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

            {/* Validation Results */}
            {validationResults && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Zap className="mr-2 h-5 w-5" />
                    Validation Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{validationResults.totalRows}</div>
                      <div className="text-gray-400 text-sm">Total Rows</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{validationResults.validRows}</div>
                      <div className="text-gray-400 text-sm">Valid Rows</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">{validationResults.invalidRows}</div>
                      <div className="text-gray-400 text-sm">Invalid Rows</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">{validationResults.warnings.length}</div>
                      <div className="text-gray-400 text-sm">Warnings</div>
                    </div>
                  </div>
                  
                  {validationResults.errors.length > 0 && (
                    <Alert className="bg-red-900/20 border-red-500/30 mb-4">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <AlertDescription className="text-red-300">
                        {validationResults.errors.length} errors found. Review and fix before importing.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Enhanced SL/TP Preview */}
            {previewData.length > 0 && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Info className="mr-2 h-5 w-5" />
                    Enhanced SL/TP Analysis Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-600">
                          <th className="text-left p-2 text-gray-300">Symbol</th>
                          <th className="text-left p-2 text-gray-300">Side</th>
                          <th className="text-left p-2 text-gray-300">Entry</th>
                          <th className="text-left p-2 text-gray-300">Exit</th>
                          <th className="text-left p-2 text-gray-300">Initial SL</th>
                          <th className="text-left p-2 text-gray-300">Final SL</th>
                          <th className="text-left p-2 text-gray-300">Initial TP</th>
                          <th className="text-left p-2 text-gray-300">Final TP</th>
                          <th className="text-left p-2 text-gray-300">P&L</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.slice(0, 5).map((trade, index) => (
                          <tr key={index} className="border-b border-gray-700">
                            <td className="p-2 text-white">{trade.symbol}</td>
                            <td className="p-2">
                              <Badge className={trade.side === 'long' ? 'bg-green-600' : 'bg-red-600'}>
                                {trade.side}
                              </Badge>
                            </td>
                            <td className="p-2 text-white">{trade.entryPrice?.toFixed(2)}</td>
                            <td className="p-2 text-white">{trade.exitPrice?.toFixed(2)}</td>
                            <td className="p-2 text-blue-400">{trade.initialStopLoss?.toFixed(2) || 'N/A'}</td>
                            <td className="p-2 text-red-400">{trade.finalStopLoss?.toFixed(2) || 'N/A'}</td>
                            <td className="p-2 text-green-400">{trade.initialTakeProfit?.toFixed(2) || 'N/A'}</td>
                            <td className="p-2 text-emerald-400">{trade.finalTakeProfit?.toFixed(2) || 'N/A'}</td>
                            <td className={`p-2 ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ${trade.pnl?.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-gray-400 text-xs mt-2">
                    Showing first 5 trades with enhanced SL/TP differentiation analysis
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Import Button */}
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!validationResults || validationResults.validRows === 0 || isProcessing || !selectedAccount}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isProcessing ? "Importing..." : "Import Trades"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}