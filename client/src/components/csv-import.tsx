import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import type { Account } from "@shared/schema";

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
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleFileUpload = async (selectedFile: File) => {
    if (!selectedAccountId || !selectedFile) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Read file content
      const fileContent = await selectedFile.text();
      setUploadProgress(25);

      // Send to backend
      const res = await apiRequest(
        "POST",
        "/api/csv-import",
        {
          accountId: parseInt(selectedAccountId),
          csvData: fileContent,
          fileName: selectedFile.name
        }
      );

      setUploadProgress(75);
      
      const response = await res.json();

      if (response.success) {
        setImportResult(response);
        setUploadProgress(100);
      } else {
        throw new Error(response.message || "Import failed");
      }
    } catch (error) {
      console.error("CSV import failed:", error);
      setImportResult({
        success: false,
        recordsProcessed: 0,
        recordsImported: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        importId: 0
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    if (file) {
      handleFileUpload(file);
    }
  };

  const resetForm = () => {
    setFile(null);
    setSelectedAccountId("");
    setImportResult(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
          <Upload className="mr-2 h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-dark-surface border-dark-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Import Trading Orders
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Account Selection */}
          <div className="space-y-2">
            <Label htmlFor="account">Select Account</Label>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">CSV File</Label>
            <Input
              id="file"
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={isUploading}
            />
            {file && (
              <p className="text-sm text-gray-400">
                Selected: {file.name} ({Math.round(file.size / 1024)} KB)
              </p>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <Label>Upload Progress</Label>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-gray-400">Processing your file...</p>
            </div>
          )}

          {/* Import Results */}
          {importResult && (
            <div className="space-y-2">
              <Alert className={importResult.success ? "border-green-500" : "border-red-500"}>
                {importResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertDescription>
                  {importResult.success ? (
                    <div>
                      <p className="font-medium">Import Successful!</p>
                      <p>Processed: {importResult.recordsProcessed} records</p>
                      <p>Imported: {importResult.recordsImported} trades</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium">Import Failed</p>
                      {importResult.errors.map((error, index) => (
                        <p key={index} className="text-sm">{error}</p>
                      ))}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
            {!importResult && (
              <Button 
                onClick={handleSubmit}
                disabled={!selectedAccountId || !file || isUploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUploading ? "Importing..." : "Import Orders"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}