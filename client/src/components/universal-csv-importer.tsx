import React, { useState, useCallback } from 'react';
import { Upload, FileText, Settings, BarChart3, TrendingUp, TrendingDown, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Account } from "@shared/schema";

interface UniversalCSVImporterProps {
  accounts: Account[];
  onImportComplete?: () => void;
}

export const UniversalCSVImporter: React.FC<UniversalCSVImporterProps> = ({ 
  accounts, 
  onImportComplete 
}) => {
  const [csvData, setCsvData] = useState<any>(null);
  const [mappedData, setMappedData] = useState<any>(null);
  const [detectedFormat, setDetectedFormat] = useState<string | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [customMapping, setCustomMapping] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [fileName, setFileName] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  // Standard field mappings for different brokers
  const formatTemplates = {
    tradovate: {
      name: "Tradovate",
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
    rithmic: {
      name: "Rithmic",
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
    cqg: {
      name: "CQG",
      fields: {
        orderId: ['Order ID', 'OrderID'],
        symbol: ['Symbol', 'Contract'],
        side: ['Side', 'B/S'],
        quantity: ['Qty', 'Quantity', 'Size'],
        price: ['Price', 'Fill Price'],
        timestamp: ['Time', 'Fill Time'],
        status: ['Status'],
        account: ['Account']
      }
    },
    ninjatrader: {
      name: "NinjaTrader",
      fields: {
        instrument: ['Instrument', 'Contract'],
        action: ['Action', 'Side'],
        quantity: ['Qty', 'Quantity'],
        price: ['Price', 'Avg fill price'],
        time: ['Time', 'Fill time'],
        id: ['Id', 'Order id']
      }
    },
    interactive_brokers: {
      name: "Interactive Brokers",
      fields: {
        symbol: ['Symbol', 'UnderlyingSymbol'],
        side: ['Buy/Sell', 'B/S'],
        quantity: ['Quantity', 'Qty'],
        price: ['Price', 'TradePrice'],
        datetime: ['Date/Time', 'DateTime'],
        currency: ['Currency'],
        proceeds: ['Proceeds', 'NetCash']
      }
    },
    ftmo: {
      name: "FTMO",
      fields: {
        symbol: ['Symbol', 'Instrument'],
        side: ['Action', 'Type', 'Side'],
        quantity: ['Volume', 'Size', 'Lots'],
        price: ['Price', 'Open Price', 'Close Price'],
        timestamp: ['Time', 'Open Time', 'Close Time'],
        profit: ['Profit', 'P/L'],
        drawdown: ['Drawdown', 'Max DD']
      }
    }
  };

  // Auto-detect format based on column names
  const detectFormat = (headers: string[]) => {
    const headerLower = headers.map(h => h.toLowerCase().trim());
    
    // Check for specific indicators
    if (headerLower.includes('orderid') || headerLower.some(h => h.includes('tradingview'))) return 'tradovate';
    if (headerLower.includes('ticket') || headerLower.includes('magic') || headerLower.includes('expert')) return 'mt4';
    if (headerLower.some(h => h.includes('rithmic') || h.includes('rith'))) return 'rithmic';
    if (headerLower.some(h => h.includes('cqg'))) return 'cqg';
    if (headerLower.includes('instrument') && headerLower.includes('action')) return 'ninjatrader';
    if (headerLower.includes('underlyingsymbol') || headerLower.includes('proceeds')) return 'interactive_brokers';
    if (headerLower.some(h => h.includes('ftmo') || h.includes('drawdown'))) return 'ftmo';
    
    return 'custom';
  };

  // Parse CSV file
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const text = await file.text();
    
    // Simple CSV parser
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      return row;
    });

    setCsvData({ headers, rows });
    
    // Auto-detect format
    const format = detectFormat(headers);
    setDetectedFormat(format);
    
    // Auto-map if known format
    if (format !== 'custom' && formatTemplates[format as keyof typeof formatTemplates]) {
      const autoMapping: Record<string, string> = {};
      const template = formatTemplates[format as keyof typeof formatTemplates].fields;
      
      Object.keys(template).forEach(standardField => {
        const possibleColumns = template[standardField as keyof typeof template] as string[];
        const matchedColumn = headers.find(header => 
          possibleColumns.some(col => 
            header.toLowerCase().includes(col.toLowerCase())
          )
        );
        if (matchedColumn) {
          autoMapping[standardField] = matchedColumn;
        }
      });
      
      setColumnMapping(autoMapping);
      applyMapping(rows, autoMapping);
    }
  }, []);

  // Apply column mapping to data
  const applyMapping = (rows: Record<string, string>[], mapping: Record<string, string>) => {
    const mapped = rows.map(row => {
      const mappedRow: Record<string, string> = {};
      Object.keys(mapping).forEach(standardField => {
        const csvColumn = mapping[standardField];
        if (csvColumn && row[csvColumn] !== undefined) {
          mappedRow[standardField] = row[csvColumn];
        }
      });
      return mappedRow;
    }).filter(row => Object.keys(row).length > 0);
    
    setMappedData(mapped);
    generateAnalysis(mapped);
  };

  // Generate analysis of the trading data
  const generateAnalysis = (data: Record<string, string>[]) => {
    if (!data || data.length === 0) return;

    // Filter filled orders only
    const filledOrders = data.filter(row => 
      row.status && row.status.toLowerCase().trim() === 'filled'
    );

    let totalProfit = 0;
    let winningTrades = 0;
    let losingTrades = 0;
    const symbols = new Set<string>();
    
    // Calculate basic metrics
    filledOrders.forEach(order => {
      if (order.symbol) symbols.add(order.symbol);
      
      // Simple P&L calculation for demo
      const side = order.side?.toLowerCase().includes('sell') ? -1 : 1;
      const price = parseFloat(order.price) || 0;
      const quantity = parseFloat(order.quantity) || 0;
      const pnl = side * price * quantity * 0.01; // Simplified calculation
      
      totalProfit += pnl;
      if (pnl > 0) winningTrades++;
      else if (pnl < 0) losingTrades++;
    });

    const completedTrades = winningTrades + losingTrades;
    const winRate = completedTrades > 0 ? ((winningTrades / completedTrades) * 100).toFixed(1) : '0';

    setAnalysis({
      totalTrades: filledOrders.length,
      completedTrades,
      winningTrades,
      losingTrades,
      winRate,
      totalProfit: totalProfit.toFixed(2),
      symbols: Array.from(symbols)
    });
  };

  // Update custom mapping
  const updateMapping = (standardField: string, csvColumn: string) => {
    const newMapping = { ...columnMapping, [standardField]: csvColumn };
    setColumnMapping(newMapping);
    if (csvData) {
      applyMapping(csvData.rows, newMapping);
    }
  };

  // Import to PropTraderJournal
  const handleImportToJournal = async () => {
    if (!selectedAccountId || !mappedData) {
      toast({
        title: "Missing Information",
        description: "Please select an account and ensure data is mapped correctly.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      // Convert mapped data to CSV format for existing endpoint
      const headers = Object.keys(columnMapping).filter(key => columnMapping[key]);
      const csvLines = [
        headers.map(key => columnMapping[key]).join(','),
        ...mappedData.map((row: Record<string, string>) => 
          headers.map(key => row[key] || '').join(',')
        )
      ];
      const csvContent = csvLines.join('\n');

      const response = await fetch('/api/trades/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: selectedAccountId,
          csvContent
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Import Successful",
          description: `Successfully imported ${result.recordsImported} trades.`,
        });
        setIsOpen(false);
        onImportComplete?.();
      } else {
        throw new Error(result.message || 'Import failed');
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "An error occurred during import.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
          <Upload className="mr-2 h-4 w-4" />
          Universal CSV Import
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-dark-surface border-dark-border max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gradient-rainbow">
            <Upload className="h-5 w-5" />
            Universal Trading CSV Importer
          </DialogTitle>
          <p className="text-gray-400 text-sm">
            Import and analyze trading data from any broker: Tradovate, MT4/5, Rithmic, CQG, and more
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Account Selection */}
          <Card className="bg-prop-card border-prop-tiffany/20">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Select Trading Account</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
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
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card className="bg-prop-card border-prop-tiffany/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload CSV File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csvUpload"
                />
                <label htmlFor="csvUpload" className="cursor-pointer">
                  <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-300 mb-2">Click to upload your trading CSV file</p>
                  <p className="text-sm text-gray-500">Supports: Tradovate, MT4/5, Rithmic, CQG, NinjaTrader, IB, and custom formats</p>
                </label>
              </div>

              {fileName && (
                <div className="mt-4 p-3 bg-blue-900/20 rounded-lg">
                  <p className="text-blue-200">
                    <strong>File:</strong> {fileName}
                    {detectedFormat && (
                      <span className="ml-4">
                        <strong>Detected Format:</strong> {formatTemplates[detectedFormat as keyof typeof formatTemplates]?.name || 'Custom'}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Column Mapping */}
          {csvData && (
            <Card className="bg-prop-card border-prop-tiffany/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Column Mapping
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomMapping(!customMapping)}
                    className="border-blue-600 text-blue-600 hover:bg-blue-900/20"
                  >
                    {customMapping ? 'Auto Map' : 'Custom Map'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {['symbol', 'side', 'quantity', 'price', 'timestamp', 'status', 'orderId', 'account'].map(field => (
                    <div key={field} className="flex flex-col">
                      <label className="text-sm font-medium text-gray-300 mb-1 capitalize">
                        {field}
                      </label>
                      <Select
                        value={columnMapping[field] || ''}
                        onValueChange={(value) => updateMapping(field, value)}
                      >
                        <SelectTrigger className="bg-prop-dark border-gray-600">
                          <SelectValue placeholder="Select column..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Select column...</SelectItem>
                          {csvData.headers.map((header: string) => (
                            <SelectItem key={header} value={header}>{header}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis Results */}
          {analysis && (
            <Card className="bg-prop-card border-prop-green/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Trading Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="bg-prop-gradient-subtle rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Orders</p>
                        <p className="text-2xl font-bold text-white">{analysis.totalTrades}</p>
                      </div>
                      <BarChart3 className="text-blue-400" size={24} />
                    </div>
                  </div>

                  <div className="bg-prop-gradient-subtle rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Win Rate</p>
                        <p className="text-2xl font-bold text-prop-green">{analysis.winRate}%</p>
                        <p className="text-xs text-gray-500">
                          {analysis.winningTrades}W / {analysis.losingTrades}L
                        </p>
                      </div>
                      <TrendingUp className="text-prop-green" size={24} />
                    </div>
                  </div>

                  <div className="bg-prop-gradient-subtle rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total P&L</p>
                        <p className={`text-2xl font-bold ${parseFloat(analysis.totalProfit) >= 0 ? 'text-prop-green' : 'text-prop-pink'}`}>
                          ${analysis.totalProfit}
                        </p>
                      </div>
                      <DollarSign className={parseFloat(analysis.totalProfit) >= 0 ? 'text-prop-green' : 'text-prop-pink'} size={24} />
                    </div>
                  </div>

                  <div className="bg-prop-gradient-subtle rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Symbols</p>
                        <p className="text-2xl font-bold text-prop-gold">{analysis.symbols.length}</p>
                      </div>
                      <CheckCircle className="text-prop-gold" size={24} />
                    </div>
                  </div>
                </div>

                {/* Symbols */}
                {analysis.symbols.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Instruments Traded</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.symbols.map((symbol: string) => (
                        <span key={symbol} className="px-3 py-1 bg-blue-900/30 text-blue-200 rounded-full text-sm">
                          {symbol}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Data Preview */}
          {mappedData && (
            <Card className="bg-prop-card border-prop-tiffany/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-prop-green" />
                  Mapped Data Preview ({mappedData.length} records)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead className="bg-prop-dark">
                      <tr>
                        {Object.keys(columnMapping).filter(field => columnMapping[field]).map(field => (
                          <th key={field} className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            {field}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {mappedData.slice(0, 5).map((row: Record<string, string>, index: number) => (
                        <tr key={index} className="hover:bg-prop-dark/50">
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

                {mappedData.length > 5 && (
                  <p className="text-sm text-gray-500 mt-4">
                    Showing first 5 of {mappedData.length} records
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Import Button */}
          {mappedData && selectedAccountId && (
            <div className="flex justify-end">
              <Button 
                onClick={handleImportToJournal}
                disabled={isImporting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isImporting ? "Importing..." : `Import ${mappedData.length} Records`}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UniversalCSVImporter;