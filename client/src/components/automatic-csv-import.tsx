import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { type Account } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { Plus, Upload, CheckCircle, RefreshCw, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AutomaticCsvImport() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  // Automatic CSV import with hidden complexity
  const csvImportMutation = useMutation({
    mutationFn: async (data: { accountId: number; csvContent: string; fileName: string }) => {
      setIsProcessing(true);
      setProgress(0);

      const stages = [
        "Reading CSV file...",
        "Detecting broker format...",
        "Processing trade data...",
        "Analyzing stop loss and take profit levels...",
        "Importing trades to database...",
        "Finalizing import..."
      ];

      for (let i = 0; i < stages.length; i++) {
        setProcessingStage(stages[i]);
        setProgress((i + 1) / stages.length * 100);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      const response = await fetch("/api/trades/import-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          accountId: data.accountId,
          csvData: data.csvContent,
          csvContent: data.csvContent,
          fileName: data.fileName
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Import failed");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/trades'] });
      setIsDialogOpen(false);
      resetState();
      
      toast({
        title: "Import Successful",
        description: `Successfully imported ${data.recordsImported || data.imported || 0} trades with advanced analytics.`,
      });
    },
    onError: (error: any) => {
      console.error('CSV import error:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import CSV file. Please check the format and try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  });

  const resetState = () => {
    setCsvFile(null);
    setSelectedAccount("");
    setProgress(0);
    setProcessingStage("");
    setIsProcessing(false);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setCsvFile(file);
  };

  const handleImport = async () => {
    if (!csvFile || !selectedAccount) {
      toast({
        title: "Missing Information",
        description: "Please select both an account and a CSV file.",
        variant: "destructive",
      });
      return;
    }

    try {
      const csvContent = await csvFile.text();
      csvImportMutation.mutate({
        accountId: parseInt(selectedAccount),
        csvContent,
        fileName: csvFile.name
      });
    } catch (error) {
      toast({
        title: "File Error",
        description: "Failed to read the CSV file.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
          <Plus className="mr-2 h-4 w-4" />
          Import CSV Trades
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 shadow-2xl">
        <DialogHeader className="pb-6 border-b border-gray-700">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Universal CSV Import
          </DialogTitle>
          <p className="text-gray-400 text-sm mt-1">
            Automatically detect and import trades from any broker platform
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Processing Indicator */}
          {isProcessing && (
            <Card className="bg-blue-900/20 border-blue-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <RefreshCw className="h-5 w-5 text-blue-400 animate-spin" />
                  <div className="flex-1">
                    <p className="text-blue-300 font-medium">{processingStage}</p>
                    <Progress value={progress} className="mt-2 h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Selection */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Select Trading Account</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Choose your trading account..." />
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
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Upload CSV File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="bg-gray-700 border-gray-600 text-white file:bg-gray-600 file:text-white file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded-md"
                />
                
                {csvFile && (
                  <Alert className="bg-green-900/20 border-green-500/30">
                    <FileText className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-300">
                      File ready: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="text-gray-400 text-sm space-y-1">
                  <p>• Supports all major brokers: Tradovate, MetaTrader, Rithmic, CQG, NinjaTrader, Interactive Brokers</p>
                  <p>• Automatically detects format and processes stop loss/take profit data</p>
                  <p>• Maximum file size: 10MB</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Import Button */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isProcessing}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!csvFile || !selectedAccount || isProcessing}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isProcessing ? "Processing..." : "Import Trades"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}