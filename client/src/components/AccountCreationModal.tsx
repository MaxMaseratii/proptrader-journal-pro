import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { insertAccountSchema, type InsertAccount } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface AccountCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountCreationModal({ open, onOpenChange }: AccountCreationModalProps) {
  const queryClient = useQueryClient();

  // Account creation form
  const form = useForm<InsertAccount>({
    resolver: zodResolver(insertAccountSchema.extend({
      primaryAsset: insertAccountSchema.shape.primaryAsset,
      secondaryAsset: insertAccountSchema.shape.secondaryAsset,
      tertiaryAsset: insertAccountSchema.shape.tertiaryAsset,
    })),
    defaultValues: {
      name: "",
      firm: "",
      type: "challenge",
      status: "active",
      startingBalance: 100000,
      profitTarget: 10000,
      maxDrawdown: 5000,
      primaryAsset: "",
      secondaryAsset: "",
      tertiaryAsset: "",
      stopLossPoints: null,
      takeProfitPoints: null,
      minimumTradingDays: null,
      timeLimit: null,
      consistencyRulePercent: null,
      hasDailyLossLimit: false,
      dailyLossLimitAmount: null,
      dailyLossLimitType: null,
      maxDrawdownType: null,
      riskRewardRatio: 2.0,
      maxTradesPerDay: null,
      tradingSessionStart: null,
      tradingSessionEnd: null,
      timezone: null,
      dailyWorkingHours: null,
      hourlyWages: null,
      useIntradayMargins: true,
      enhancedPayoutsAvailable: false,
      copyTradingAllowed: true,
      newsTradingAllowed: true,
      accountCost: null,
      activationCost: null,
      purchaseMethod: null,
      resetCount: 0,
      totalResetsCost: null,
      activationPaid: false,
      includesActivationFee: false,
      daysRequiredForPayout: null,
      winningDayMinimum: null,
      payoutFrequency: null,
      profitSplit: null,
      minimumPayoutAmount: null,
      maxNetBalanceForPayout: null,
      allowScalpingStrategy: false,
      allowGridMartingale: false,
      liveAccountAvailable: false,
    },
  });

  // Watch form values for conditional rendering
  const watchedValues = form.watch();

  // Account creation mutation
  const createAccountMutation = useMutation({
    mutationFn: (data: InsertAccount) => apiRequest('/api/accounts', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      onOpenChange(false);
      form.reset();
    },
  });

  const handleSubmit = (data: InsertAccount) => {
    createAccountMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Create New Trading Account</DialogTitle>
          <DialogDescription className="text-gray-400">
            Set up a new trading account with proper risk management and financial tracking.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh] px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="financial">Financial</TabsTrigger>
                  <TabsTrigger value="rules">Rules & Risk</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Account Name</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="My Trading Account" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="firm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Prop Firm</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="FTMO, TopstepTrader, etc." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Account Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-600">
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
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="breached">Breached</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="financial" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startingBalance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Starting Balance ($)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              className="bg-gray-800 border-gray-600 text-white" 
                              placeholder="100000"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
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
                          <FormLabel className="text-white">Profit Target ($)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              className="bg-gray-800 border-gray-600 text-white" 
                              placeholder="10000"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
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
                          <FormLabel className="text-white">Max Drawdown ($)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              className="bg-gray-800 border-gray-600 text-white" 
                              placeholder="5000"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
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
                          <FormLabel className="text-white">Daily Loss Limit ($)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              className="bg-gray-800 border-gray-600 text-white" 
                              placeholder="2000"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="rules" className="space-y-4">
                  {/* Risk Per Trade with Real-time Feedback */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="riskPerTrade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Risk Per Trade ($)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              className="bg-gray-800 border-gray-600 text-white" 
                              placeholder="500"
                              value={field.value === null ? "" : field.value}
                              onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                          {field.value && watchedValues.maxDrawdown && (
                            <div className="text-xs mt-1">
                              <span className={`${
                                (field.value / watchedValues.maxDrawdown) * 100 > 10 
                                  ? 'text-red-400' 
                                  : (field.value / watchedValues.maxDrawdown) * 100 > 5 
                                  ? 'text-yellow-400' 
                                  : 'text-green-400'
                              }`}>
                                {((field.value / watchedValues.maxDrawdown) * 100).toFixed(2)}% of max drawdown
                              </span>
                            </div>
                          )}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="riskRewardRatio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Risk:Reward Ratio (1:X)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.1"
                              className="bg-gray-800 border-gray-600 text-white" 
                              placeholder="2.0"
                              value={field.value === null ? "" : field.value}
                              onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                          {field.value && watchedValues.riskPerTrade && (
                            <div className="text-xs mt-1">
                              <span className="text-green-400">
                                Target profit: ${(watchedValues.riskPerTrade * field.value).toFixed(0)} per trade
                              </span>
                            </div>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Personal Trading Time */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-yellow-400 border-b border-yellow-400/20 pb-2">
                      Personal Trading Time
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dailyWorkingHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Daily Working Hours</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                step="0.1"
                                className="bg-gray-800 border-gray-600 text-white" 
                                placeholder="8.0"
                                value={field.value || ""}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="hourlyWages"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Hourly Wages ($)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                step="0.01"
                                className="bg-gray-800 border-gray-600 text-white" 
                                placeholder="25.00"
                                value={field.value || ""}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Trading Permissions */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-8">
                      <FormField
                        control={form.control}
                        name="liveAccountAvailable"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="border-gray-600 data-[state=checked]:bg-blue-600"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-white">Live Trading Account Available</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="allowChallengePayouts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="border-gray-600 data-[state=checked]:bg-blue-600"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-white">Challenge Payouts Available</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-8">
                      <FormField
                        control={form.control}
                        name="copyTradingAllowed"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="border-gray-600 data-[state=checked]:bg-blue-600"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-white">Copy Trading Allowed</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="newsTradingAllowed"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="border-gray-600 data-[state=checked]:bg-blue-600"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-white">News Trading Allowed</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Trading Assets */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-yellow-400 border-b border-yellow-400/20 pb-2">
                      Trading Assets
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="primaryAsset"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Primary Asset</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="bg-gray-800 border-gray-600 text-white" 
                                placeholder="e.g. ES, NQ, EURUSD, BTCUSD"
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="secondaryAsset"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Secondary Asset</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="bg-gray-800 border-gray-600 text-white" 
                                placeholder="e.g. CL, GC, GBPUSD"
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="tertiaryAsset"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Tertiary Asset</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="bg-gray-800 border-gray-600 text-white" 
                                placeholder="e.g. YM, RTY, USDJPY"
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createAccountMutation.isPending}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                >
                  {createAccountMutation.isPending ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}