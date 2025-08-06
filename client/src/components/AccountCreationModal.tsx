import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { insertAccountSchema, type InsertAccount, type AssetSymbol } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AccountCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountCreationModal({ open, onOpenChange }: AccountCreationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createAccountMutation = useMutation({
    mutationFn: async (data: InsertAccount) => {
      return apiRequest("/api/accounts", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      onOpenChange(false);
      accountForm.reset();
      toast({
        title: "Account Created",
        description: "Your account has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create account.",
        variant: "destructive",
      });
    },
  });

  const accountForm = useForm<InsertAccount>({
    resolver: zodResolver(insertAccountSchema),
    defaultValues: {
      name: "",
      firm: "",
      type: "challenge",
      status: "active",
      startingBalance: 0,
      profitTarget: 0,
      maxDrawdown: 0,
      hasDailyLossLimit: false,
      dailyLossLimit: null,
      dailyLossLimitType: "soft",
      
      // Account Rules
      minimumTradingDays: null,
      timeLimit: null,
      daysRequiredToPass: null,
      consistencyPercentage: null,
      
      // Discipline Scoring
      disciplineRiskPeriod: "daily",
      disciplineRiskPeriodDays: null,
      maxDailyRiskBudget: null,
      
      // Financial tracking fields
      accountCost: null,
      purchaseMethod: null,
      resetCount: 0,
      totalResetsCost: 0,
      activationCost: null,
      activationPaid: false,
      includesActivationFee: false,
      
      // Payout rule fields
      daysRequiredForPayout: null,
      winningDayMinimum: null,
      payoutFrequency: "monthly",
      minimumPayoutAmount: null,
      maxNetBalanceForPayout: null,
      profitSplit: null,
      maximumPayoutAllowed: null,
      maximumPayoutPerAccount: null,
      bufferAmount: null,
      bufferPercentage: null,
      accountBufferRequired: false,
      
      // Risk management fields
      tradingCapital: null,
      riskCalculationPeriod: "weekly",
      useRiskPercentage: false,
      riskPercentage: null,
      customRiskAmount: null,
      riskRewardRatio: 2.0,
      primaryAsset: "ES" as AssetSymbol,
      secondaryAsset: "",
      tertiaryAsset: "",
      takeProfitPoints: 20,
      tradingSessionStart: "",
      tradingSessionEnd: "",
      timezone: "",
      dailyWorkingHours: null,
      hourlyWages: null,
      copyTradingAllowed: true,
      newsTradingAllowed: true,
      useIntradayMargins: true,
      marginSafetyBuffer: 50.0,
      stopLossPoints: 10,
      riskPerTrade: null,
      maxTradesPerDay: 0,
      maxRiskPerDay: null,
      maxPositionSize: null,
      preferredAssets: null,
      
      // Enhanced and Live Account Settings
      enhancedPayoutsAvailable: false,
      liveAccountAvailable: false,
      transitionTrigger: null,
      allowChallengePayouts: false,
      
      // Live account transition settings
      liveAccountTransitionEnabled: false,
      liveAccountTransitionProfitTarget: null,
      liveAccountTransitionDays: null,
      liveAccountTransitionDrawdownLimit: null,
      
      // Funded Account Payout Settings
      fundedPayoutEnabled: false,
      fundedDaysRequiredForPayout: null,
      fundedWinningDayMinimum: null,
      fundedPayoutFrequency: null,
      fundedMinimumPayoutAmount: null,
      fundedMaxNetBalanceForPayout: null,
      fundedProfitSplit: null,
      
      // Live Account Payout Settings
      livePayoutEnabled: false,
      liveDaysRequiredForPayout: null,
      liveWinningDayMinimum: null,
      livePayoutFrequency: null,
      liveMinimumPayoutAmount: null,
      liveMaxNetBalanceForPayout: null,
      liveProfitSplit: null,
    },
  });

  const accountFormValues = accountForm.watch();

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
          <Form {...accountForm}>
            <form onSubmit={accountForm.handleSubmit((data) => createAccountMutation.mutate(data))} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="financial">Financial</TabsTrigger>
                  <TabsTrigger value="rules">Rules & Risk</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={accountForm.control}
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
                      control={accountForm.control}
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
                      control={accountForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Account Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                <SelectValue />
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
                      control={accountForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="breached">Breached</SelectItem>
                              <SelectItem value="passed">Passed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={accountForm.control}
                      name="startingBalance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Starting Balance ($)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              className="bg-gray-800 border-gray-600 text-white" 
                              placeholder="25000"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={accountForm.control}
                      name="profitTarget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Profit Target ($)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              className="bg-gray-800 border-gray-600 text-white" 
                              placeholder="2500"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={accountForm.control}
                      name="maxDrawdown"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Max Drawdown ($)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              className="bg-gray-800 border-gray-600 text-white" 
                              placeholder="1500"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <FormField
                        control={accountForm.control}
                        name="hasDailyLossLimit"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-white">
                                Has Daily Loss Limit
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {accountFormValues.hasDailyLossLimit && (
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={accountForm.control}
                          name="dailyLossLimit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Daily Loss Limit ($)</FormLabel>
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
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={accountForm.control}
                          name="dailyLossLimitType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Loss Limit Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-gray-800 border-gray-600">
                                  <SelectItem value="soft">Soft (Warning)</SelectItem>
                                  <SelectItem value="hard">Hard (Account Breach)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="financial" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={accountForm.control}
                      name="accountCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Account Cost ($)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.01"
                              className="bg-gray-800 border-gray-600 text-white" 
                              placeholder="150.00"
                              value={field.value === null ? "" : field.value}
                              onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={accountForm.control}
                      name="purchaseMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Purchase Method</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                <SelectValue placeholder="Select method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              <SelectItem value="credit_card">Credit Card</SelectItem>
                              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                              <SelectItem value="crypto">Cryptocurrency</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={accountForm.control}
                      name="resetCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Reset Count</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              className="bg-gray-800 border-gray-600 text-white" 
                              placeholder="0"
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={accountForm.control}
                      name="totalResetsCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Total Resets Cost ($)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.01"
                              className="bg-gray-800 border-gray-600 text-white" 
                              placeholder="0.00"
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={accountForm.control}
                      name="activationCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Activation Cost ($)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              step="0.01"
                              className="bg-gray-800 border-gray-600 text-white" 
                              placeholder="0.00"
                              value={field.value === null ? "" : field.value}
                              onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <FormField
                        control={accountForm.control}
                        name="activationPaid"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-white">
                                Activation Fee Paid
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <FormField
                        control={accountForm.control}
                        name="includesActivationFee"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-white">
                                Includes Activation Fee
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Payout Rules */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Payout Rules</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={accountForm.control}
                        name="daysRequiredForPayout"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Days Required for Payout</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                className="bg-gray-800 border-gray-600 text-white" 
                                placeholder="14"
                                value={field.value === null ? "" : field.value}
                                onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={accountForm.control}
                        name="winningDayMinimum"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Winning Day Minimum</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                className="bg-gray-800 border-gray-600 text-white" 
                                placeholder="5"
                                value={field.value === null ? "" : field.value}
                                onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={accountForm.control}
                        name="payoutFrequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Payout Frequency</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-gray-800 border-gray-600">
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={accountForm.control}
                        name="minimumPayoutAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Minimum Payout Amount ($)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                step="0.01"
                                className="bg-gray-800 border-gray-600 text-white" 
                                placeholder="100.00"
                                value={field.value === null ? "" : field.value}
                                onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={accountForm.control}
                        name="profitSplit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Profit Split (%)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                step="0.01"
                                min="0"
                                max="100"
                                className="bg-gray-800 border-gray-600 text-white" 
                                placeholder="80.00"
                                value={field.value === null ? "" : field.value}
                                onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="rules" className="space-y-4">
                  {/* Account Rules */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Account Rules</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={accountForm.control}
                        name="minimumTradingDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Minimum Trading Days</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                className="bg-gray-800 border-gray-600 text-white" 
                                placeholder="10"
                                value={field.value === null ? "" : field.value}
                                onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={accountForm.control}
                        name="timeLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Time Limit (days)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                className="bg-gray-800 border-gray-600 text-white" 
                                placeholder="30"
                                value={field.value === null ? "" : field.value}
                                onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Trading Session Times */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Trading Session</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={accountForm.control}
                        name="tradingSessionStart"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Session Start Time</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                  <SelectValue placeholder="--:--" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-gray-800 border-gray-600 max-h-60">
                                {Array.from({ length: 48 }, (_, i) => {
                                  const hour = Math.floor(i / 2);
                                  const minute = i % 2 === 0 ? "00" : "30";
                                  const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                                  return (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={accountForm.control}
                        name="tradingSessionEnd"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Session End Time</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                  <SelectValue placeholder="--:--" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-gray-800 border-gray-600 max-h-60">
                                {Array.from({ length: 48 }, (_, i) => {
                                  const hour = Math.floor(i / 2);
                                  const minute = i % 2 === 0 ? "00" : "30";
                                  const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                                  return (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={accountForm.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Timezone</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                  <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-gray-800 border-gray-600">
                                <SelectItem value="EST">EST - Eastern Standard Time</SelectItem>
                                <SelectItem value="CST">CST - Central Standard Time</SelectItem>
                                <SelectItem value="MST">MST - Mountain Standard Time</SelectItem>
                                <SelectItem value="PST">PST - Pacific Standard Time</SelectItem>
                                <SelectItem value="GMT">GMT - Greenwich Mean Time</SelectItem>
                                <SelectItem value="CET">CET - Central European Time</SelectItem>
                                <SelectItem value="JST">JST - Japan Standard Time</SelectItem>
                                <SelectItem value="AEST">AEST - Australian Eastern Standard Time</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={accountForm.control}
                        name="dailyWorkingHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Daily Working Hours</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                step="0.5"
                                className="bg-gray-800 border-gray-600 text-white" 
                                placeholder="8.0"
                                value={field.value === null ? "" : field.value}
                                onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={accountForm.control}
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
                                value={field.value === null ? "" : field.value}
                                onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Automatic Time Calculation */}
                    {accountFormValues.tradingSessionStart && accountFormValues.tradingSessionEnd && (
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-yellow-400/20">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">Daily Trading Duration:</span>
                          <span className="text-yellow-400 font-bold text-lg">
                            {(() => {
                              const start = accountFormValues.tradingSessionStart;
                              const end = accountFormValues.tradingSessionEnd;
                              if (!start || !end) return "-- hours -- minutes";
                              
                              try {
                                const [startHour, startMin] = start.split(':').map(Number);
                                const [endHour, endMin] = end.split(':').map(Number);
                                
                                const startMinutes = startHour * 60 + startMin;
                                const endMinutes = endHour * 60 + endMin;
                                
                                let diffMinutes = endMinutes - startMinutes;
                                if (diffMinutes < 0) diffMinutes += 24 * 60; // Handle overnight sessions
                                
                                const hours = Math.floor(diffMinutes / 60);
                                const minutes = diffMinutes % 60;
                                
                                return `${hours} hours ${minutes} minutes`;
                              } catch {
                                return "-- hours -- minutes";
                              }
                            })()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Trading Permissions */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Trading Permissions</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <FormField
                          control={accountForm.control}
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
                                <FormLabel className="text-white">Allow Copy Trading</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex items-center space-x-3">
                        <FormField
                          control={accountForm.control}
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
                                <FormLabel className="text-white">Allow News Trading</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <FormField
                          control={accountForm.control}
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
                                <FormLabel className="text-white">Live Account Available</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex items-center space-x-3">
                        <FormField
                          control={accountForm.control}
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
                                <FormLabel className="text-white">Allow Challenge Payouts</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="border-gray-600 text-white hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createAccountMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
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