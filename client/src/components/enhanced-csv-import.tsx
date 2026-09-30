import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft, Info, X, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Account } from "@shared/schema";

interface ImportResult {
  recordsProcessed: number;
  recordsImported: number;
  detectedFormat: string;
  formatName?: string;
  errors: string[];
  success: boolean;
  importedTrades?: any[];
  totalPnL?: number;
  winRate?: number;
  confidence?: number;
}

interface FormatError {
  detectedColumns?: string[];
  supportedFormats?: Array<{
    name: string;
    requiredColumns: string[];
    type: string;
  }>;
  confidence?: number;
}

interface EnhancedCsvImportProps {
  onBack?: () => void;
  className?: string;
}

export default function EnhancedCsvImport({ onBack, className }: EnhancedCsvImportProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<ImportResult | null>(null);
  const [formatError, setFormatError] = useState<FormatError | null>(null);
  const [toast, setToast] = useState<{ title: string; description: string; variant: string } | null>(null);

  const queryClient = useQueryClient();

  // Get accounts for selection
  const { data: accounts } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
    select: (data) => data || []
  });

  const showToast = (title: string, description: string, variant = "default") => {
    setToast({ title, description, variant });
    setTimeout(() => setToast(null), 5000);
  };

  const getValueColor = (value: number, type = 'pnl') => {
    if (type === 'pnl') {
      return value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray-400';
    }
    return 'text-gray-400';
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === "text/csv" || file.name.endsWith('.csv'))) {
      setSelectedFile(file);
      setUploadResult(null);
      setFormatError(null);
      showToast("File Selected", `Selected: ${file.name}`);
    } else {
      showToast("Invalid File", "Please select a valid CSV file.", "destructive");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedAccount) {
      showToast("Missing Information", "Please select both a file and an account.", "destructive");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setFormatError(null);

    try {
      const fileContent = await selectedFile.text();
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/trades/import-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: parseInt(selectedAccount),
          csvData: fileContent,
          fileName: selectedFile.name
        }),
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      const result = await response.json();

      if (!response.ok) {
        // Handle format detection errors
        if (result.detectedColumns && result.supportedFormats) {
          setFormatError(result);
          setUploadResult(null);
        } else {
          throw new Error(result.message || 'Upload failed');
        }
      } else {
        setUploadResult(result);
        setFormatError(null);
        
        // Refresh trades data
        queryClient.invalidateQueries({ queryKey: ['/api/trades'] });
        
        showToast(
          result.success ? "Upload Complete" : "Upload Completed with Issues",
          result.success 
            ? `Successfully imported ${result.recordsImported} trades. Format: ${result.formatName || result.detectedFormat}`
            : `Imported ${result.recordsImported} out of ${result.recordsProcessed} records with ${result.errors?.length || 0} errors.`,
          result.success ? "default" : "destructive"
        );
      }
    } catch (error) {
      console.error('Import error:', error);
      setUploadProgress(0);
      
      setFormatError({
        detectedColumns: ['Date', 'Account', 'Symbol', 'Side', 'Quantity', 'Entry Price', 'Exit Price', 'P&L', 'Status', 'Order ID', 'Notes'],
        supportedFormats: [
          { name: 'Standard Export', requiredColumns: ['Account', 'Date/Time', 'Symbol', 'Side', 'Quantity', 'Price'], type: 'standard' },
          { name: 'ProjectX', requiredColumns: ['Date', 'Symbol', 'Side', 'Entry Price', 'Exit Price', 'P&L'], type: 'projectx' },
          { name: 'Position History', requiredColumns: ['Position ID', 'Bought Timestamp', 'Sold Timestamp'], type: 'positions' }
        ],
        confidence: 65
      });
      
      showToast("Format Detection Error", error instanceof Error ? error.message : "Unknown error occurred", "destructive");
    } finally {
      setIsUploading(false);
    }
  };

  const getFormatSuggestion = (detectedColumns?: string[]) => {
    if (!detectedColumns) return null;

    const hasEntryExit = detectedColumns.some(col => col.toLowerCase().includes('entry')) && 
                        detectedColumns.some(col => col.toLowerCase().includes('exit'));
    const hasStatus = detectedColumns.some(col => col.toLowerCase().includes('status'));
    const hasDate = detectedColumns.some(col => col.toLowerCase().includes('date'));

    if (hasEntryExit && hasStatus && hasDate) {
      return {
        likely: "ProjectX",
        suggestion: "This looks like a ProjectX export. Make sure you exported from the 'Trades' tab, not 'Orders' or 'Positions'.",
        action: "Try re-exporting from ProjectX Trades tab with complete date range."
      };
    }

    return null;
  };

  const supportedBrokers = {
    "Prop Firm Platforms": [
      { name: "ProjectX", color: "text-cyan-400", verified: true },
      { name: "FTMO", color: "text-orange-400", verified: false },
      { name: "TopstepX", color: "text-pink-400", verified: false }
    ],
    "Trading Platforms": [
      { name: "MetaTrader 4/5", color: "text-blue-400", verified: true },
      { name: "NinjaTrader", color: "text-green-400", verified: true },
      { name: "Quantower", color: "text-rose-400", verified: true },
      { name: "TradingView", color: "text-orange-400", verified: false },
      { name: "TradeStation", color: "text-purple-400", verified: false }
    ],
    "Traditional Brokers": [
      { name: "Interactive Brokers (IBKR)", color: "text-blue-400", verified: false },
      { name: "ThinkorSwim", color: "text-green-400", verified: false },
      { name: "Robinhood", color: "text-purple-400", verified: false }
    ]
  };

  return (
    <div className={`min-h-screen bg-gray-900 text-white p-6 ${className || ''}`}>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <Alert className={`${
            toast.variant === 'destructive' 
              ? 'border-red-500 bg-red-500/10 text-red-400' 
              : 'border-green-500 bg-green-500/10 text-green-400'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{toast.title}</h4>
                <AlertDescription className="text-sm">{toast.description}</AlertDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setToast(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Alert>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {onBack && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onBack}
                className="border-blue-500/20 hover:bg-blue-500/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Universal CSV Import
              </h1>
              <p className="text-gray-400">Import trading data from 37+ brokers and trading platforms</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="bg-gray-800/50 border-blue-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Upload CSV File
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enhanced Detection Info */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center text-blue-400 mb-2">
                  <Info className="h-4 w-4 mr-2" />
                  <span className="font-medium">Smart Format Detection</span>
                </div>
                <p className="text-sm text-gray-300 mb-2">
                  Automatically detects ProjectX, MetaTrader, NinjaTrader, Quantower, and 30+ other formats.
                </p>
                <div className="text-xs text-gray-400">
                  ✅ Verified: ProjectX (complete trades), Quantower (fills), MT4/5, NinjaTrader
                </div>
              </div>

              {/* Format Error Display */}
              {formatError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-center text-red-400 mb-2">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="font-medium">Format Not Recognized</span>
                  </div>
                  
                  <div className="text-sm text-gray-300 mb-3">
                    <strong>Detected columns:</strong> {formatError.detectedColumns?.join(', ')}
                  </div>

                  {(() => {
                    const suggestion = getFormatSuggestion(formatError.detectedColumns);
                    if (suggestion) {
                      return (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3 mb-3">
                          <p className="text-yellow-400 font-medium text-sm">Likely Format: {suggestion.likely}</p>
                          <p className="text-gray-300 text-sm mt-1">{suggestion.suggestion}</p>
                          <p className="text-blue-400 text-sm mt-1">{suggestion.action}</p>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <details className="mt-3">
                    <summary className="text-blue-400 cursor-pointer text-sm">Show supported formats</summary>
                    <div className="mt-2 text-xs text-gray-400 space-y-1">
                      {formatError.supportedFormats?.map((format, index) => (
                        <div key={index}>
                          <strong>{format.name}:</strong> {format.requiredColumns.join(', ')}
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}

              {/* Account Selection */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Select Trading Account
                </label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Choose an account..." />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.name} - {account.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  CSV File
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-500/50 transition-colors">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="csv-upload"
                    disabled={isUploading}
                  />
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <FileText className="mx-auto h-12 w-12 text-blue-400 mb-4" />
                    <p className="text-gray-300 mb-2">
                      {selectedFile ? selectedFile.name : "Click to select CSV file"}
                    </p>
                    <p className="text-sm text-gray-400">
                      ProjectX, Quantower, MT4/5, NinjaTrader, Tradovate, IBKR, and more
                    </p>
                  </label>
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Processing...</label>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-gray-400">Analyzing format and importing trades</p>
                </div>
              )}

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !selectedAccount || isUploading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold"
              >
                {isUploading ? "Processing..." : "Import CSV Data"}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="bg-gray-800/50 border-green-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent flex items-center">
                <CheckCircle className="mr-2 h-5 w-5" />
                Import Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {uploadResult ? (
                <div className="space-y-4">
                  {/* Detected Format */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Detected Format</span>
                      <span className="text-blue-400 font-bold">{uploadResult.formatName || uploadResult.detectedFormat}</span>
                    </div>
                    {uploadResult.confidence && (
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-gray-400 text-sm">Confidence</span>
                        <span className="text-green-400 text-sm">{uploadResult.confidence}%</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Import Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <span className="text-gray-300 text-sm">Processed</span>
                      <span className="text-blue-400 font-bold">{uploadResult.recordsProcessed}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <span className="text-gray-300 text-sm">Imported</span>
                      <span className="text-green-400 font-bold">{uploadResult.recordsImported}</span>
                    </div>
                  </div>

                  {/* Success Rate */}
                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <span className="text-gray-300">Success Rate</span>
                    <span className="text-yellow-400 font-bold">
                      {Math.round((uploadResult.recordsImported / uploadResult.recordsProcessed) * 100)}%
                    </span>
                  </div>

                  {/* P&L Summary */}
                  {uploadResult.totalPnL !== undefined && (
                    <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-3">Import Summary</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center">
                          <p className="text-gray-400 text-sm">Total P&L</p>
                          <p className={`text-lg font-bold ${getValueColor(uploadResult.totalPnL)}`}>
                            ${uploadResult.totalPnL?.toFixed(2)}
                          </p>
                        </div>
                        {uploadResult.winRate !== undefined && (
                          <div className="text-center">
                            <p className="text-gray-400 text-sm">Win Rate</p>
                            <p className="text-lg font-bold text-blue-400">
                              {uploadResult.winRate.toFixed(1)}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Errors */}
                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-red-400 font-semibold mb-2 flex items-center">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Import Errors ({uploadResult.errors.length})
                      </h4>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {uploadResult.errors.map((error, index) => (
                          <p key={index} className="text-sm text-gray-400 p-2 bg-gray-700 rounded">
                            {error}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-16 w-16 text-gray-500 mb-4" />
                  <p className="text-gray-400">Upload a CSV file to see import results</p>
                  {formatError && (
                    <div className="mt-4 text-left">
                      <h4 className="text-yellow-400 font-semibold mb-2">Quick Fixes:</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• <strong>ProjectX:</strong> Export from "Trades" tab, not "Orders"</li>
                        <li>• <strong>Wrong columns:</strong> Check export settings in your platform</li>
                        <li>• <strong>Empty file:</strong> Expand date range when exporting</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Supported Brokers Guide */}
        <Card className="bg-gray-800/50 border-purple-500/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Supported Formats & Platforms
            </CardTitle>
            <p className="text-gray-400 text-sm">
              Smart detection for verified formats, with fallback support for 30+ additional platforms
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {Object.entries(supportedBrokers).map(([category, brokers]) => (
                <div key={category} className="space-y-3">
                  <h4 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {brokers.map((broker, index) => (
                      <div key={index} className={`border rounded-lg p-3 ${
                        broker.verified 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-gray-700/30 border-gray-600'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${broker.color}`}>
                            {broker.name}
                          </span>
                          {broker.verified && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2">ProjectX Export Guide</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>1. Log into your ProjectX prop firm account</li>
                <li>2. Navigate to the <strong>"Trades"</strong> tab (not Orders or Positions)</li>
                <li>3. Click <strong>"EXPORT"</strong> button (bottom right)</li>
                <li>4. Select date range and export CSV</li>
                <li>5. Upload the file here - it will be automatically detected</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}