import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { queryClient } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  TrendingUp
} from "lucide-react";
import type { Account, CsvImport } from "@shared/schema";

interface CsvImportProps {
  accounts: Account[];
}

interface ImportResult {
  success: boolean;
  recordsProcessed: number;
  recordsImported: number;
  errors: string[];
  importId: number;
}

export default function CsvImport({ accounts }: CsvImportProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (data: { accountId: number; csvData: string; fileName: string }) => {
      // Mock implementation for now - will implement backend later
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        success: true,
        recordsProcessed: 50,
        recordsImported: 45,
        errors: [],
        importId: 1
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedAccountId) {
      alert("Please select an account first");
      return;
    }

    if (!file.name.endsWith('.csv')) {
      alert("Please select a CSV file");
      return;
    }

    setIsProcessing(true);
    setImportResult(null);

    try {
      const csvData = await file.text();
      const result = await importMutation.mutateAsync({
        accountId: parseInt(selectedAccountId),
        csvData,
        fileName: file.name,
      });
      
      setImportResult(result as ImportResult);
    } catch (error) {
      console.error("Import failed:", error);
      setImportResult({
        success: false,
        recordsProcessed: 0,
        recordsImported: 0,
        errors: ["Failed to process CSV file"],
        importId: 0,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedAccount = accounts.find(acc => acc.id.toString() === selectedAccountId);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Upload className="mr-2 h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-dark-surface border-dark-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Import Trading Orders from CSV
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Account Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Select Trading Account
            </label>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose account for import" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>{account.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {account.type}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedAccount && (
            <div className="bg-dark-card p-4 rounded-lg">
              <h4 className="font-medium mb-2">Account Risk Settings</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Risk per Trade:</span>
                  <span className="ml-2 font-medium">
                    {selectedAccount.riskPerTrade 
                      ? `$${selectedAccount.riskPerTrade.toFixed(2)}` 
                      : 'Not set'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Risk Percentage:</span>
                  <span className="ml-2 font-medium">
                    {selectedAccount.riskPercentage 
                      ? `${selectedAccount.riskPercentage}%` 
                      : 'Not set'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Max Position:</span>
                  <span className="ml-2 font-medium">
                    {selectedAccount.maxPositionSize 
                      ? `${selectedAccount.maxPositionSize} contracts` 
                      : 'Not set'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Preferred Assets:</span>
                  <span className="ml-2 font-medium">
                    {selectedAccount.preferredAssets || 'Any'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/10' 
                : 'border-dark-border hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-dark-card rounded-lg flex items-center justify-center">
                <Upload className="h-6 w-6 text-gray-400" />
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Upload CSV Order File</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Drag and drop your CSV file here, or click to browse
                </p>
              </div>
              
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={!selectedAccountId || isProcessing}
                className="border-dark-border"
              >
                Choose File
              </Button>
            </div>
          </div>

          {/* Processing State */}
          {isProcessing && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Processing CSV...</span>
                <span className="text-sm text-gray-400">Please wait</span>
              </div>
              <Progress value={undefined} className="h-2" />
            </div>
          )}

          {/* Import Results */}
          {importResult && (
            <div className="space-y-4">
              <Alert className={`border ${
                importResult.success ? 'border-success-green' : 'border-error-red'
              }`}>
                <div className="flex items-center">
                  {importResult.success ? (
                    <CheckCircle className="h-4 w-4 text-success-green" />
                  ) : (
                    <XCircle className="h-4 w-4 text-error-red" />
                  )}
                  <AlertDescription className="ml-2">
                    {importResult.success 
                      ? `Successfully imported ${importResult.recordsImported} trades from ${importResult.recordsProcessed} records`
                      : "Import failed with errors"
                    }
                  </AlertDescription>
                </div>
              </Alert>

              {importResult.errors.length > 0 && (
                <div className="bg-error-red/10 border border-error-red rounded-lg p-4">
                  <h4 className="font-medium text-error-red mb-2 flex items-center">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Import Errors
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    {importResult.errors.map((error, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-error-red mr-2">•</span>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Close
                </Button>
                {importResult.success && (
                  <Button 
                    onClick={() => {
                      setIsOpen(false);
                      // Navigate to trades view to see imported data
                    }}
                    className="bg-success-green hover:bg-green-600"
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    View Trades
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* CSV Format Info */}
          {!importResult && !isProcessing && (
            <div className="bg-dark-card p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Expected CSV Format
              </h4>
              <p className="text-sm text-gray-400 mb-2">
                Your CSV should contain these columns (order doesn't matter):
              </p>
              <div className="text-xs font-mono bg-dark-background p-2 rounded">
                orderId, B/S, Contract, Product Description, avgPrice, filledQty, Fill Time, Status, Date
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Only filled orders will be imported. Canceled and rejected orders will be ignored.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}