import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAccountSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { Plus, Settings, TrendingUp, TrendingDown, Target, Shield } from "lucide-react";
import CsvImport from "@/components/csv-import";
import type { Account, InsertAccount } from "@shared/schema";
import { z } from "zod";

const formSchema = insertAccountSchema.extend({
  startingBalance: z.number().min(1000, "Starting balance must be at least $1,000"),
  maxDrawdown: z.number().min(100, "Max drawdown must be at least $100"),
  dailyLossLimit: z.number().min(50, "Daily loss limit must be at least $50"),
  profitTarget: z.number().min(0, "Profit target must be positive"),
  riskPerTrade: z.number().optional(),
  riskPercentage: z.number().min(0).max(10).optional(),
  maxPositionSize: z.number().min(1).optional(),
  preferredAssets: z.string().optional(),
});

export default function Accounts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: accounts, isLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "challenge",
      firm: "",
      startingBalance: 50000,
      currentBalance: 50000,
      maxDrawdown: 2500,
      dailyLossLimit: 100,
      profitTarget: 5000,
      status: "active",
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: InsertAccount) => {
      const response = await apiRequest("POST", "/api/accounts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createAccountMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="bg-dark-surface border-b border-dark-border px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Account Management</h2>
            <p className="text-gray-400 text-sm mt-1">Manage your prop firm accounts and challenges</p>
          </div>
          <div className="flex items-center space-x-3">
            <CsvImport accounts={accounts || []} />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-dark-surface border-dark-border">
              <DialogHeader>
                <DialogTitle>Add New Account</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., GT Account #1234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="challenge">Challenge</SelectItem>
                              <SelectItem value="funded">Funded</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="firm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prop Firm</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., PropFirm Pro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startingBalance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Starting Balance</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="profitTarget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profit Target</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="maxDrawdown"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Drawdown</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dailyLossLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Daily Loss Limit</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createAccountMutation.isPending}>
                      {createAccountMutation.isPending ? "Creating..." : "Create Account"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {accounts?.map((account) => {
            const pnlPercentage = ((account.currentBalance - account.startingBalance) / account.startingBalance) * 100;
            const drawdownPercentage = ((account.startingBalance - account.currentBalance) / account.startingBalance) * 100;
            const isProfit = account.currentBalance >= account.startingBalance;
            
            return (
              <Card key={account.id} className="bg-dark-card border-dark-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{account.name}</CardTitle>
                      <p className="text-sm text-gray-400 mt-1">{account.firm}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={account.type === 'funded' ? 'default' : 'secondary'}
                        className={account.type === 'funded' ? 'bg-success-green text-white' : ''}
                      >
                        {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Balance */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Current Balance</span>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${isProfit ? 'text-success-green' : 'text-error-red'}`}>
                        {formatCurrency(account.currentBalance)}
                      </p>
                      <p className={`text-xs flex items-center ${isProfit ? 'text-success-green' : 'text-error-red'}`}>
                        {isProfit ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {formatPercentage(pnlPercentage)}
                      </p>
                    </div>
                  </div>

                  {/* Starting Balance */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Starting Balance</span>
                    <span className="font-medium">{formatCurrency(account.startingBalance)}</span>
                  </div>

                  {/* Profit Target */}
                  {account.profitTarget > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Profit Target</span>
                        <span className="font-medium">{formatCurrency(account.profitTarget)}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{formatPercentage((account.currentBalance - account.startingBalance) / account.profitTarget * 100)}</span>
                        </div>
                        <div className="w-full bg-dark-border rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              (account.currentBalance - account.startingBalance) >= account.profitTarget 
                                ? 'bg-success-green' 
                                : 'bg-primary'
                            }`}
                            style={{ 
                              width: `${Math.min(100, Math.max(0, ((account.currentBalance - account.startingBalance) / account.profitTarget) * 100))}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Risk Metrics */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-dark-border">
                    <div>
                      <p className="text-xs text-gray-400">Max Drawdown</p>
                      <p className="font-medium text-sm">{formatCurrency(account.maxDrawdown)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Daily Limit</p>
                      <p className="font-medium text-sm">{formatCurrency(account.dailyLossLimit)}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between pt-2">
                    <Badge 
                      variant={account.status === 'active' ? 'default' : 'destructive'}
                      className={account.status === 'active' ? 'bg-primary text-white' : ''}
                    >
                      {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                    </Badge>
                    <Button variant="outline" size="sm" className="border-dark-border">
                      <Target className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {accounts?.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No accounts found</h3>
            <p className="text-gray-400 mb-4">Get started by adding your first prop firm account</p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Account
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
