import { useState } from "react";
import { getUniversalValueColor, getStatusColor } from "@/lib/colorUtils";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Account } from "@shared/schema";

export default function CsvImport() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setSelectedFile(file);
      setUploadResult(null);
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

    try {
      // Read file content
      const fileContent = await selectedFile.text();
      
      const response = await fetch('/api/trades/import-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: parseInt(selectedAccount),
          csvData: fileContent
        }),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadResult(result);
      
      toast({
        title: "Upload Complete",
        description: `Successfully imported ${result.recordsImported} trades out of ${result.recordsProcessed} records.`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "There was an error importing your CSV file.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-8 bg-prop-gradient-main min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setLocation('/dashboard-showcase')}
            className="border-prop-gold/20 hover:bg-prop-gold/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gradient-rainbow">CSV Import</h1>
            <p className="text-gray-400">Import your trading data from CSV files</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <Card className="bg-prop-card border-prop-tiffany/20">
          <CardHeader>
            <CardTitle className="text-gradient-rainbow flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              Upload CSV File
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Account Selection */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Select Trading Account
              </label>
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
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                CSV File
              </label>
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
                    Supports MT4/MT5, TradingView, and PropFirm formats
                  </p>
                </label>
              </div>
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !selectedAccount || isUploading}
              className="w-full bg-prop-gradient-tiffany text-black font-bold hover-scale"
            >
              {isUploading ? "Uploading..." : "Import CSV Data"}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="bg-prop-card border-prop-green/20">
          <CardHeader>
            <CardTitle className="text-gradient-rainbow flex items-center">
              <CheckCircle className="mr-2 h-5 w-5" />
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {uploadResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-prop-gradient-subtle rounded-lg">
                  <span className="text-gray-300">Records Processed</span>
                  <span className="text-prop-green font-bold">{uploadResult.recordsProcessed}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-prop-gradient-subtle rounded-lg">
                  <span className="text-gray-300">Records Imported</span>
                  <span className="text-prop-green font-bold">{uploadResult.recordsImported}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-prop-gradient-subtle rounded-lg">
                  <span className="text-gray-300">Success Rate</span>
                  <span className="text-prop-gold font-bold">
                    {Math.round((uploadResult.recordsImported / uploadResult.recordsProcessed) * 100)}%
                  </span>
                </div>
                
                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-prop-pink font-semibold mb-2 flex items-center">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Import Errors
                    </h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {uploadResult.errors.map((error: string, index: number) => (
                        <p key={index} className="text-sm text-gray-400 p-2 bg-prop-dark rounded">
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

      {/* CSV Format Guide */}
      <Card className="bg-prop-card border-prop-blue/20">
        <CardHeader>
          <CardTitle className="text-gradient-rainbow">Supported CSV Formats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-prop-blue font-semibold mb-2">MT4/MT5 Format</h4>
              <p className="text-sm text-gray-400">
                Ticket, Time, Type, Size, Symbol, Price, S/L, T/P, Time, Price, Commission, Swap, Profit
              </p>
            </div>
            <div>
              <h4 className="text-prop-green font-semibold mb-2">TradingView Format</h4>
              <p className="text-sm text-gray-400">
                Symbol, Date, Side, Qty, Price, Commission, P&L, Tags
              </p>
            </div>
            <div>
              <h4 className="text-prop-tiffany font-semibold mb-2">Custom Format</h4>
              <p className="text-sm text-gray-400">
                Symbol, Date, Side, Quantity, Entry Price, Exit Price, P&L, Notes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}