import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTradeSchema, type Account, type InsertTrade } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Upload, FileText, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TradeEntryProps {
  accounts: Account[];
}

export default function TradeEntry({ accounts }: TradeEntryProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string>("");
  const { toast } = useToast();

  const createTradeMutation = useMutation({
    mutationFn: async (data: InsertTrade) => {
      return apiRequest("POST", "/api/trades", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trades'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Trade Added",
        description: "Trade has been successfully recorded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add trade. Please try again.",
        variant: "destructive",
      });
    }
  });

  const csvImportMutation = useMutation({
    mutationFn: async (data: { accountId: number; csvContent: string }) => {
      const response = await fetch("/api/trades/import-csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to import CSV");
      }
      
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
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: "Failed to import CSV. Please check the format and try again.",
        variant: "destructive",
      });
    }
  });

  const form = useForm<InsertTrade>({
    resolver: zodResolver(insertTradeSchema),
    defaultValues: {
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
    },
  });

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
    const accountId = form.watch("accountId");
    if (!accountId || !csvData) {
      toast({
        title: "Missing Information",
        description: "Please select an account and upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    csvImportMutation.mutate({
      accountId,
      csvContent: csvData,
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add Trade
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-dark-surface border-dark-border">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Add New Trade</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="manual" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="manual" className="text-white data-[state=active]:bg-green-600">
              <FileText className="mr-2 h-4 w-4" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="csv" className="text-white data-[state=active]:bg-blue-600">
              <Upload className="mr-2 h-4 w-4" />
              CSV Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createTradeMutation.mutate(data))} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="accountId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">Trading Account</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                <SelectValue placeholder="Select account" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-700 border-gray-600">
                              {accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id.toString()} className="text-white hover:bg-gray-600">
                                  {account.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="symbol"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">Symbol</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              placeholder="e.g., NQ, ES, EURUSD"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">Trade Date</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              type="date"
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="side"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">Side</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                <SelectValue placeholder="Select side" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-700 border-gray-600">
                              <SelectItem value="long" className="text-white hover:bg-gray-600">Long</SelectItem>
                              <SelectItem value="short" className="text-white hover:bg-gray-600">Short</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">Quantity</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              placeholder="Number of contracts/units"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="entryPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">Entry Price</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              placeholder="Entry price"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="exitPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">Exit Price (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              step="0.01"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              placeholder="Exit price (if closed)"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pnl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">P&L ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              placeholder="Profit/Loss amount"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-700 border-gray-600">
                              <SelectItem value="open" className="text-white hover:bg-gray-600">Open</SelectItem>
                              <SelectItem value="closed" className="text-white hover:bg-gray-600">Closed</SelectItem>
                              <SelectItem value="cancelled" className="text-white hover:bg-gray-600">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="orderId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">Order ID (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              value={field.value || ""}
                              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              placeholder="Broker order ID"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-md font-semibold text-white">Initial Stop Loss & Take Profit</h3>
                    <FormField
                      control={form.control}
                      name="initialStopLoss"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">Initial Stop Loss</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              step="0.01"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              placeholder="Initial SL price"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="initialTakeProfit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">Initial Take Profit</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              step="0.01"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              placeholder="Initial TP price"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-md font-semibold text-white">Final Stop Loss & Take Profit</h3>
                    <FormField
                      control={form.control}
                      name="finalStopLoss"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">Final Stop Loss</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              step="0.01"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              placeholder="Final SL price"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="finalTakeProfit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-medium">Final Take Profit</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              step="0.01"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              placeholder="Final TP price"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-medium">Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          value={field.value || ""}
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none"
                          rows={3}
                          placeholder="Trade notes, strategy, or observations..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={createTradeMutation.isPending}
                  >
                    {createTradeMutation.isPending ? "Adding..." : "Add Trade"}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="csv" className="space-y-6">
            <div className="space-y-4">
              <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg border border-blue-600 border-opacity-30">
                <h3 className="text-white font-medium mb-2">CSV Format Requirements</h3>
                <p className="text-sm text-gray-300 mb-2">Your CSV file should include the following columns:</p>
                <code className="text-xs bg-gray-800 p-2 rounded block text-green-400">
                  Symbol, Date, Side, Quantity, EntryPrice, ExitPrice, PnL, Status, Notes
                </code>
                <p className="text-xs text-gray-400 mt-2">
                  Date format: YYYY-MM-DD | Side: long/short | Status: open/closed/cancelled
                </p>
              </div>

              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-medium">Trading Account</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select account for import" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id.toString()} className="text-white hover:bg-gray-600">
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <label className="text-white font-medium">Upload CSV File</label>
                <Input 
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileChange}
                  className="bg-gray-700 border-gray-600 text-white file:bg-blue-600 file:text-white file:border-0"
                />
                {csvFile && (
                  <p className="text-sm text-green-400">
                    File selected: {csvFile.name} ({Math.round(csvFile.size / 1024)} KB)
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCsvImport}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={csvImportMutation.isPending || !csvFile || !form.watch("accountId")}
                >
                  {csvImportMutation.isPending ? "Importing..." : "Import CSV"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}