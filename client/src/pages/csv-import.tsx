import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getUniversalValueColor } from "@/lib/colorUtils";
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft, Info, X, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import type { Account } from "@shared/schema";

interface ImportResult {
  recordsProcessed: number;
  recordsImported: number;
  detectedFormat: string;
  errors: string[];
  success: boolean;
  importedTrades?: any[];
  totalPnL?: number;
  winRate?: number;
}

export default function CsvImport() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setSelectedFile(file);
      setUploadResult(null);
      toast({
        title: "File Selected",
        description: `Selected: ${file.name}`,
      });
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid CSV file.",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedAccount) {
      toast({
        title: "Missing Information",
        description: "Please select both a file and an account.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

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

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      const result = await response.json() as ImportResult;
      setUploadResult(result);
      
      toast({
        title: result.success ? "Upload Complete" : "Upload Completed with Issues",
        description: result.success 
          ? `Successfully imported ${result.recordsImported} trades out of ${result.recordsProcessed} records. Format: ${result.detectedFormat}`
          : `Imported ${result.recordsImported} out of ${result.recordsProcessed} records with ${result.errors.length} errors.`,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Import error:', error);
      setUploadProgress(0);
      toast({
        title: "Import Failed",
        description: "Failed to process the CSV file. Please check the format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const supportedBrokers = {
    "Traditional Brokers": [
      { name: "Interactive Brokers (IBKR)", color: "text-blue-400" },
      { name: "Charles Schwab (ThinkorSwim)", color: "text-green-400" },
      { name: "Robinhood", color: "text-purple-400" },
      { name: "Coinbase", color: "text-orange-400" },
      { name: "Questrade", color: "text-pink-400" },
      { name: "Tastyworks", color: "text-cyan-400" },
      { name: "TradeZero", color: "text-yellow-400" },
      { name: "Tradier", color: "text-red-400" },
      { name: "Webull", color: "text-indigo-400" },
      { name: "Zerodha", color: "text-teal-400" },
      { name: "Oanda", color: "text-emerald-400" },
      { name: "TD Direct Investment", color: "text-amber-400" }
    ],
    "Trading Platforms": [
      { name: "MetaTrader 4/5", color: "text-blue-400" },
      { name: "NinjaTrader", color: "text-green-400" },
      { name: "TradeStation", color: "text-purple-400" },
      { name: "TradingView", color: "text-orange-400" },
      { name: "cTrader", color: "text-pink-400" },
      { name: "DXtrade", color: "text-cyan-400" },
      { name: "TradeLocker", color: "text-yellow-400" },
      { name: "CQG Desktop", color: "text-red-400" },
      { name: "DAS Trader Pro", color: "text-indigo-400" },
      { name: "Power E-Trade", color: "text-teal-400" },
      { name: "Lightspeed", color: "text-emerald-400" },
      { name: "Rithmic R Trader", color: "text-amber-400" },
      { name: "Sierra Chart", color: "text-lime-400" },
      { name: "Sterling Trader Pro", color: "text-sky-400" },
      { name: "TC2000", color: "text-violet-400" },
      { name: "Quantower", color: "text-rose-400" },
      { name: "MotiveWave", color: "text-fuchsia-400" },
      { name: "ATAS", color: "text-slate-400" },
      { name: "Tickblaze", color: "text-zinc-400" },
      { name: "LSEG", color: "text-neutral-400" },
      { name: "Match-Trader", color: "text-stone-400" },
      { name: "Silexx", color: "text-orange-300" },
      { name: "TEFS Evolution", color: "text-blue-300" }
    ],
    "Futures & Crypto": [
      { name: "Tradovate", color: "text-blue-400" },
      { name: "ByBit", color: "text-green-400" },
      { name: "Alpha Ticks (Alpha Futures)", color: "text-purple-400" }
    ],
    "Prop Firm Platforms": [
      { name: "FTMO", color: "text-orange-400" },
      { name: "TopstepX", color: "text-pink-400" },
      { name: "ProjectX", color: "text-cyan-400" }
    ]
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button 
                variant="outline" 
                size="sm"
                className="border-blue-500/20 hover:bg-blue-500/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gradient-rainbow">
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
              <CardTitle className="text-gradient-rainbow flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Upload CSV File
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto-Detection Info */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center text-blue-400 mb-2">
                  <Info className="h-4 w-4 mr-2" />
                  <span className="font-medium">AI-Powered Auto-Detection</span>
                </div>
                <p className="text-sm text-gray-300">
                  Our system automatically detects your broker's CSV format from 37+ supported platforms. No manual setup required!
                </p>
              </div>

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
                        {account.name} - {account.firm} ({account.type})
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
                      Supports 37+ brokers including IBKR, ThinkorSwim, MT4/5, NinjaTrader, Tradovate, and more
                    </p>
                  </label>
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Upload Progress</label>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-gray-400">Processing your file...</p>
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
              <CardTitle className="text-gradient-rainbow flex items-center">
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
                      <span className="text-blue-400 font-bold capitalize">{uploadResult.detectedFormat}</span>
                    </div>
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
                          <p className={`text-lg font-bold ${getUniversalValueColor(uploadResult.totalPnL, 'pnl').textColor}`}>
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Supported Brokers Guide */}
        <Card className="bg-gray-800/50 border-purple-500/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-gradient-rainbow">
              Supported Brokers & Platforms (37+)
            </CardTitle>
            <p className="text-gray-400 text-sm">
              Our system automatically detects and parses CSV files from all major brokers and trading platforms
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(supportedBrokers).map(([category, brokers]) => (
                <div key={category} className="space-y-3">
                  <h4 className="text-lg font-semibold text-gradient-rainbow">
                    {category}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {brokers.map((broker, index) => (
                      <div key={index} className="bg-gray-700/30 border border-gray-600 rounded-lg p-3">
                        <span className={`text-sm font-medium ${broker.color}`}>
                          {broker.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="text-blue-400 font-semibold mb-2">How It Works</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Upload your CSV file from any supported broker</li>
                  <li>• AI-powered format detection (99%+ accuracy)</li>
                  <li>• Data is standardized and imported automatically</li>
                  <li>• View detailed results and fix any errors</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4">
                <h4 className="text-green-400 font-semibold mb-2">Key Features</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Auto-detection of 37+ broker formats</li>
                  <li>• Symbol normalization (ES, ES=F, ESM24)</li>
                  <li>• Trade pairing for fill-based exports</li>
                  <li>• Commission and P&L calculation</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4">
              <h4 className="text-yellow-400 font-semibold mb-2">Supported File Types</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
                <div>
                  <strong className="text-white">Trade Reports:</strong><br />
                  Complete trade history with entry/exit data
                </div>
                <div>
                  <strong className="text-white">Execution Reports:</strong><br />
                  Individual fill and execution data
                </div>
                <div>
                  <strong className="text-white">Account Statements:</strong><br />
                  Full account activity and P&L reports
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}