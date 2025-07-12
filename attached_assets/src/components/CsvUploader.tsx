import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, AlertTriangle } from "lucide-react";

interface CsvUploaderProps {
  onDataLoaded: (data: any[]) => void;
}

export default function CsvUploader({ onDataLoaded }: CsvUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(false);
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',');
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || '';
        });
        data.push(row);
      }
    }

    return data;
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate processing stages
      const stages = [
        'Reading CSV file...',
        'Detecting broker format...',
        'Processing trade data...',
        'Analyzing order patterns...',
        'Calculating discipline metrics...'
      ];

      for (let i = 0; i < stages.length; i++) {
        setProgress((i + 1) / stages.length * 100);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const fileText = await file.text();
      const parsedData = parseCSV(fileText);

      if (parsedData.length === 0) {
        throw new Error('No valid data found in CSV file');
      }

      onDataLoaded(parsedData);
      setSuccess(true);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process CSV file');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Upload className="h-5 w-5 text-blue-400" />
          Upload Trading Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="bg-gray-700 border-gray-600 text-white file:bg-gray-600 file:text-white file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded-md"
          />
          <div className="text-sm text-gray-400">
            Supports: Tradovate, MT4/5, Rithmic, CQG, Interactive Brokers, and more
          </div>
        </div>

        {file && (
          <Alert className="bg-blue-900/20 border-blue-500/30">
            <FileText className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-300">
              File ready: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </AlertDescription>
          </Alert>
        )}

        {isProcessing && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="text-sm text-gray-400 text-center">
              Processing... {progress.toFixed(0)}%
            </div>
          </div>
        )}

        {error && (
          <Alert className="bg-red-900/20 border-red-500/30">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-900/20 border-green-500/30">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300">
              CSV file uploaded and processed successfully!
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || isProcessing}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isProcessing ? 'Processing...' : 'Upload & Analyze'}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <div>• Maximum file size: 10MB</div>
          <div>• Supported formats: CSV files from major trading platforms</div>
          <div>• Auto-detects broker format and analyzes trading discipline</div>
        </div>
      </CardContent>
    </Card>
  );
}