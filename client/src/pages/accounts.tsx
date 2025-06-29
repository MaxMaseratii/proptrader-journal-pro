import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  
  // Challenge/Evaluation Settings
  accountCost: z.number().optional(),
  numberOfPhases: z.number().min(1).max(2).optional(),
  phase1Target: z.number().optional(),
  phase2Target: z.number().optional(),
  minimumTradingDays: z.number().optional(),
  timeLimit: z.number().optional(),
  
  // Drawdown Rules
  drawdownType: z.string().optional(),
  maxTotalLoss: z.number().optional(),
  trailingThreshold: z.number().optional(),
  
  // Trading Rules
  consistencyRule: z.boolean().optional(),
  consistencyPercentage: z.number().optional(),
  copyTradingAllowed: z.boolean().optional(),
  newsTradingAllowed: z.boolean().optional(),
  
  // Payout Settings
  daysRequiredForPayout: z.number().optional(),
  winningDayMinimum: z.number().optional(),
  minimumPayoutAmount: z.number().optional(),
  payoutFrequency: z.string().optional(),
  maximumPayoutPercentage: z.number().optional(),
  accountBufferRequired: z.boolean().optional(),
  bufferAmount: z.number().optional(),
  profitSplit: z.number().optional(),
  enhancedPayoutsAvailable: z.boolean().optional(),
  
  // Live Account Settings
  liveAccountAvailable: z.boolean().optional(),
  transitionTrigger: z.string().optional(),
  activationCost: z.number().optional(),
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
              <DialogContent className="bg-dark-surface border-dark-border max-w-4xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle>Add New Account</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[80vh] pr-4">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="basic">Basic Info</TabsTrigger>
                          <TabsTrigger value="challenge">Challenge</TabsTrigger>
                          <TabsTrigger value="payout">Payout Rules</TabsTrigger>
                          <TabsTrigger value="risk">Risk Settings</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="basic" className="space-y-4 mt-6">
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
                          
                          <div className="grid grid-cols-3 gap-4">
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
                                      <SelectItem value="live">Live</SelectItem>
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
                                    <Input placeholder="e.g., TopstepTrader" {...field} />
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
                                  <FormLabel>Status</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="active">Active</SelectItem>
                                      <SelectItem value="passed">Passed</SelectItem>
                                      <SelectItem value="failed">Failed</SelectItem>
                                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                                    </SelectContent>
                                  </Select>
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
                                  <FormLabel>Starting Balance ($)</FormLabel>
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
                              name="currentBalance"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Current Balance ($)</FormLabel>
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
                        </TabsContent>
                        
                        <TabsContent value="challenge" className="space-y-4 mt-6">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="accountCost"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Account Cost ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="numberOfPhases"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Number of Phases</FormLabel>
                                  <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select phases" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="1">1 Phase</SelectItem>
                                      <SelectItem value="2">2 Phase</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="phase1Target"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phase 1 Target ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="phase2Target"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phase 2 Target ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
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
                              name="minimumTradingDays"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Minimum Trading Days</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="timeLimit"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Time Limit (days, 0 = unlimited)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
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
                                  <FormLabel>Max Drawdown ($)</FormLabel>
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
                                  <FormLabel>Daily Loss Limit ($)</FormLabel>
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
                          
                          <FormField
                            control={form.control}
                            name="drawdownType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Drawdown Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select drawdown type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="daily">Daily Drawdown (realized losses only)</SelectItem>
                                    <SelectItem value="unrealized">Unrealized Drawdown (includes open positions)</SelectItem>
                                    <SelectItem value="trailing">End of Day Trailing</SelectItem>
                                    <SelectItem value="balance_based">Account Balance Based</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="consistencyRule"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Consistency Rule</FormLabel>
                                    <div className="text-sm text-muted-foreground">Enable consistency requirements</div>
                                  </div>
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="copyTradingAllowed"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">Copy Trading</FormLabel>
                                      <div className="text-sm text-muted-foreground">Allow copy trading</div>
                                    </div>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="newsTradingAllowed"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">News Trading</FormLabel>
                                      <div className="text-sm text-muted-foreground">Allow news trading</div>
                                    </div>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="payout" className="space-y-4 mt-6">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="daysRequiredForPayout"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Days Required for Payout</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="minimumPayoutAmount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Minimum Payout Amount ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
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
                              name="payoutFrequency"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Payout Frequency</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select frequency" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="daily">Daily</SelectItem>
                                      <SelectItem value="weekly">Weekly</SelectItem>
                                      <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                                      <SelectItem value="monthly">Monthly</SelectItem>
                                      <SelectItem value="on-demand">On-demand</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="profitSplit"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Profit Split (%)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      max="100"
                                      {...field} 
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
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
                              name="accountBufferRequired"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Account Buffer Required</FormLabel>
                                    <div className="text-sm text-muted-foreground">Require buffer amount for payouts</div>
                                  </div>
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="enhancedPayoutsAvailable"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Enhanced Payouts Available</FormLabel>
                                    <div className="text-sm text-muted-foreground">Daily payouts, 100% withdrawals available</div>
                                  </div>
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="risk" className="space-y-4 mt-6">
                          <FormField
                            control={form.control}
                            name="profitTarget"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Profit Target ($)</FormLabel>
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
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="riskPerTrade"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Risk Per Trade ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="riskPercentage"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Risk Percentage (%)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      max="10"
                                      step="0.1"
                                      {...field} 
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="maxPositionSize"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Max Position Size (contracts)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    {...field} 
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="preferredAssets"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Preferred Assets</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g., ES, NQ, YM"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="liveAccountAvailable"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Live Account Available</FormLabel>
                                    <div className="text-sm text-muted-foreground">Transition to live account available</div>
                                  </div>
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="transitionTrigger"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Transition Trigger</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="e.g., After 5 payouts"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </TabsContent>
                      </Tabs>
                      
                      <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createAccountMutation.isPending}>
                          {createAccountMutation.isPending ? "Creating..." : "Create Account"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </ScrollArea>
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
