import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { insertTradeSchema, type Account, type InsertTrade } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { Plus, Upload, FileText, TrendingUp, DollarSign, Target, Calendar, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TradeEntryProps {
  accounts: Account[];
}

export default function TradeEntry({ accounts }: TradeEntryProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'csv'>('manual');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string>("");
  const { toast } = useToast();

  // Manual trade form state
  const [formData, setFormData] = useState<Partial<InsertTrade>>({
    symbol: "",
    date: new Date().toISOString().split('T')[0],
    side: "long",
    quantity: 1,
    entryPrice: 0,
    exitPrice: null,
    pnl: 0,
    status: "closed",
    notes: "",
    orderId: "",
    initialStopLoss: null,
    initialTakeProfit: null,
    finalStopLoss: null,
    finalTakeProfit: null,
  });

  const createTradeMutation = useMutation({
    mutationFn: async (data: InsertTrade) => {
      const response = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create trade");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trades'] });
      setIsDialogOpen(false);
      setFormData({
        symbol: "",
        date: new Date().toISOString().split('T')[0],
        side: "long",
        quantity: 1,
        entryPrice: 0,
        exitPrice: null,
        pnl: 0,
        status: "closed",
        notes: "",
        orderId: "",
        initialStopLoss: null,
        initialTakeProfit: null,
        finalStopLoss: null,
        finalTakeProfit: null,
      });
      toast({
        title: "Trade Added Successfully",
        description: "Your trade has been recorded and added to the system.",
      });
    },
    onError: () => {
      toast({
        title: "Error Adding Trade",
        description: "Failed to add trade. Please check your inputs and try again.",
        variant: "destructive",
      });
    }
  });

  const csvImportMutation = useMutation({
    mutationFn: async (data: { accountId: number; csvContent: string }) => {
      const response = await fetch("/api/trades/import-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to import CSV");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/trades'] });
      setIsDialogOpen(false);
      setCsvFile(null);
      setCsvData("");
      toast({
        title: "CSV Import Complete",
        description: `Successfully imported ${data.recordsImported} out of ${data.recordsProcessed} trades.`,
      });
    },
    onError: () => {
      toast({
        title: "Import Failed",
        description: "Failed to import CSV. Please check the format and try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountId) {
      toast({
        title: "Account Required",
        description: "Please select a trading account.",
        variant: "destructive",
      });
      return;
    }

    try {
      const validatedData = insertTradeSchema.parse(formData);
      createTradeMutation.mutate(validatedData);
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Please check all required fields are filled correctly.",
        variant: "destructive",
      });
    }
  };

  const handleCsvFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvData(content);
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid CSV file.",
        variant: "destructive",
      });
    }
  };

  const handleCsvImport = () => {
    if (!formData.accountId || !csvData) {
      toast({
        title: "Missing Information",
        description: "Please select an account and upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    csvImportMutation.mutate({
      accountId: formData.accountId,
      csvContent: csvData,
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          <Plus className="mr-2 h-4 w-4" />
          Add Trade
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 shadow-2xl">
        <DialogHeader className="pb-6 border-b border-gray-700">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Add New Trade
          </DialogTitle>
          <p className="text-gray-400 text-sm mt-1">Record your trading activity manually or import from CSV</p>
        </DialogHeader>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-800 rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'manual' 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <FileText className="mr-2 h-4 w-4" />
            Manual Entry
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'csv' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Upload className="mr-2 h-4 w-4" />
            CSV Import
          </button>
        </div>

        <div className="max-h-[calc(95vh-200px)] overflow-y-auto">
          {activeTab === 'manual' ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Account Selection */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-white flex items-center">
                    <Target className="mr-2 h-5 w-5 text-blue-400" />
                    Account Selection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label className="text-gray-300 font-medium">Trading Account</Label>
                    <Select 
                      value={formData.accountId?.toString() || ""} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, accountId: parseInt(value) }))}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:border-blue-400">
                        <SelectValue placeholder="Select your trading account" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id.toString()} className="text-white hover:bg-gray-600">
                            <div className="flex items-center justify-between w-full">
                              <span>{account.name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {account.firm}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Trade Details */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-white flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-green-400" />
                    Trade Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-gray-300 font-medium flex items-center">
                        <Hash className="mr-1 h-4 w-4" />
                        Symbol
                      </Label>
                      <Input 
                        value={formData.symbol || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
                        className="bg-gray-700 border-gray-600 text-white focus:border-green-400"
                        placeholder="e.g., NQ, ES, EURUSD"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300 font-medium flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        Date
                      </Label>
                      <Input 
                        type="date"
                        value={formData.date || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        className="bg-gray-700 border-gray-600 text-white focus:border-green-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300 font-medium">Side</Label>
                      <Select 
                        value={formData.side || "long"} 
                        onValueChange={(value: 'long' | 'short') => setFormData(prev => ({ ...prev, side: value }))}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:border-green-400">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="long" className="text-white hover:bg-gray-600">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                              Long
                            </div>
                          </SelectItem>
                          <SelectItem value="short" className="text-white hover:bg-gray-600">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                              Short
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300 font-medium">Quantity</Label>
                      <Input 
                        type="number"
                        value={formData.quantity || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                        className="bg-gray-700 border-gray-600 text-white focus:border-green-400"
                        placeholder="Contracts/Units"
                        min="1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300 font-medium">Entry Price</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        value={formData.entryPrice || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, entryPrice: parseFloat(e.target.value) || 0 }))}
                        className="bg-gray-700 border-gray-600 text-white focus:border-green-400"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300 font-medium">Exit Price</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        value={formData.exitPrice || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, exitPrice: e.target.value ? parseFloat(e.target.value) : null }))}
                        className="bg-gray-700 border-gray-600 text-white focus:border-green-400"
                        placeholder="0.00 (optional)"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300 font-medium flex items-center">
                        <DollarSign className="mr-1 h-4 w-4" />
                        P&L
                      </Label>
                      <Input 
                        type="number"
                        step="0.01"
                        value={formData.pnl || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, pnl: parseFloat(e.target.value) || 0 }))}
                        className="bg-gray-700 border-gray-600 text-white focus:border-green-400"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300 font-medium">Status</Label>
                      <Select 
                        value={formData.status || "closed"} 
                        onValueChange={(value: 'open' | 'closed' | 'cancelled') => setFormData(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:border-green-400">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="closed" className="text-white hover:bg-gray-600">Closed</SelectItem>
                          <SelectItem value="open" className="text-white hover:bg-gray-600">Open</SelectItem>
                          <SelectItem value="cancelled" className="text-white hover:bg-gray-600">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300 font-medium">Order ID</Label>
                      <Input 
                        value={formData.orderId || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, orderId: e.target.value }))}
                        className="bg-gray-700 border-gray-600 text-white focus:border-green-400"
                        placeholder="Broker order ID (optional)"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stop Loss & Take Profit */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-white">Initial Levels</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300 font-medium">Initial Stop Loss</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        value={formData.initialStopLoss || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, initialStopLoss: e.target.value ? parseFloat(e.target.value) : null }))}
                        className="bg-gray-700 border-gray-600 text-white focus:border-red-400"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300 font-medium">Initial Take Profit</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        value={formData.initialTakeProfit || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, initialTakeProfit: e.target.value ? parseFloat(e.target.value) : null }))}
                        className="bg-gray-700 border-gray-600 text-white focus:border-green-400"
                        placeholder="0.00"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-white">Final Levels</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300 font-medium">Final Stop Loss</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        value={formData.finalStopLoss || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, finalStopLoss: e.target.value ? parseFloat(e.target.value) : null }))}
                        className="bg-gray-700 border-gray-600 text-white focus:border-red-400"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300 font-medium">Final Take Profit</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        value={formData.finalTakeProfit || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, finalTakeProfit: e.target.value ? parseFloat(e.target.value) : null }))}
                        className="bg-gray-700 border-gray-600 text-white focus:border-green-400"
                        placeholder="0.00"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notes */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-white">Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label className="text-gray-300 font-medium">Trade Notes</Label>
                    <Textarea 
                      value={formData.notes || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-white focus:border-blue-400 resize-none"
                      rows={3}
                      placeholder="Add any observations, strategy details, or lessons learned..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createTradeMutation.isPending}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                >
                  {createTradeMutation.isPending ? "Adding Trade..." : "Add Trade"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* CSV Import Instructions */}
              <Card className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-600/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-blue-400" />
                    CSV Format Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300">Your CSV file should include the following columns:</p>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <code className="text-green-400 text-sm font-mono">
                      Symbol, Date, Side, Quantity, EntryPrice, ExitPrice, PnL, Status, Notes
                    </code>
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>• Date format: YYYY-MM-DD</p>
                    <p>• Side: long or short</p>
                    <p>• Status: open, closed, or cancelled</p>
                    <p>• Optional columns: OrderId, InitialStopLoss, InitialTakeProfit, FinalStopLoss, FinalTakeProfit</p>
                  </div>
                </CardContent>
              </Card>

              {/* Account Selection for CSV */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Account Selection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label className="text-gray-300 font-medium">Trading Account</Label>
                    <Select 
                      value={formData.accountId?.toString() || ""} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, accountId: parseInt(value) }))}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:border-blue-400">
                        <SelectValue placeholder="Select account for import" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id.toString()} className="text-white hover:bg-gray-600">
                            <div className="flex items-center justify-between w-full">
                              <span>{account.name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {account.firm}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* File Upload */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Upload CSV File</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-4 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-400">CSV files only</p>
                        </div>
                        <Input 
                          type="file"
                          accept=".csv"
                          onChange={handleCsvFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    
                    {csvFile && (
                      <div className="bg-green-900/30 border border-green-600/30 rounded-lg p-4">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-green-400 mr-2" />
                          <span className="text-green-300 font-medium">{csvFile.name}</span>
                          <span className="text-green-400 text-sm ml-2">
                            ({Math.round(csvFile.size / 1024)} KB)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCsvImport}
                  disabled={csvImportMutation.isPending || !csvFile || !formData.accountId}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                >
                  {csvImportMutation.isPending ? "Importing..." : "Import CSV"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}