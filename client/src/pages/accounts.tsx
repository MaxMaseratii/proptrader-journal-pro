import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { insertAccountSchema, type Account, type InsertAccount } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Calculator, TrendingUp, DollarSign, Lightbulb, RotateCcw, LogOut, Trash2, AlertTriangle, Target, Trophy, Settings, Brain, ArrowRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { calculateRiskSuggestions, TRADING_ASSETS, type AssetSymbol } from "@/lib/risk-calculator";
import { TRADING_ASSETS as ASSET_CONFIG, ASSET_CATEGORIES, getRiskSuggestion } from "@/lib/trading-assets";
import AccountManagement from "@/components/account-management";

export default function Accounts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: accounts, isLoading } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: InsertAccount) => {
      return apiRequest("POST", "/api/accounts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      setIsDialogOpen(false);
      form.reset();
    },
  });



  const form = useForm<InsertAccount>({
    resolver: zodResolver(insertAccountSchema),
    defaultValues: {
      name: "",
      firm: "",
      type: "challenge",
      status: "active",
      startingBalance: 0,
      profitTarget: 5000,
      maxDrawdown: 2000,
      hasDailyLossLimit: false,
      dailyLossLimit: 0,
      dailyLossLimitType: "soft",
      // Risk calculator fields
      tradingCapital: 0,
      riskCalculationPeriod: "weekly",
      useRiskPercentage: false,
      riskPercentage: 1.0,
      customRiskAmount: 500,
      riskRewardRatio: 2.0,
      primaryAsset: "ES" as AssetSymbol,
      useIntradayMargins: true,
      marginSafetyBuffer: 50.0,
      stopLossPoints: 10,

      // Challenge/Evaluation Settings
      numberOfPhases: 1,
      phase1Target: null,
      phase2Target: null,
      minimumTradingDays: null,
      timeLimit: null,
      
      // Drawdown Rules
      drawdownType: "daily",
      maxTotalLoss: null,
      trailingThreshold: null,
      
      // Trading Rules
      consistencyRule: false,
      consistencyPercentage: null,
      copyTradingAllowed: true,
      newsTradingAllowed: true,
      
      // Payout fields (challenge account)
      allowChallengePayouts: false,
      daysRequiredForPayout: 5,
      winningDayMinimum: 200,
      payoutFrequency: "monthly",
      minimumPayoutAmount: 100,
      profitSplit: 80,
      maximumPayoutAllowed: 5000,
      maximumPayoutPerAccount: 2500,
      accountBufferRequired: false,
      bufferAmount: null,
      bufferPercentage: null,
      
      // Funded account payout settings
      fundedPayoutEnabled: true,
      fundedDaysRequiredForPayout: 5,
      fundedWinningDayMinimum: 200,
      fundedMinimumPayoutAmount: 100,
      fundedMaxNetBalanceForPayout: 2500,
      fundedPayoutFrequency: "monthly",
      fundedProfitSplit: 80,
      
      // Live account payout settings
      livePayoutEnabled: true,
      liveDaysRequiredForPayout: 3,
      liveWinningDayMinimum: 100,
      liveMinimumPayoutAmount: 50,
      liveMaxNetBalanceForPayout: 1000,
      livePayoutFrequency: "weekly",
      liveProfitSplit: 90,
      
      // Risk Management Settings
      riskPerTrade: null,
      riskPercentage: null,
      maxPositionSize: null,
      maxTradesPerDay: 0,
      maxRiskPerDay: null,
      preferredAssets: null,
      
      // Enhanced and Live Account Settings
      enhancedPayoutsAvailable: false,
      liveAccountAvailable: false,
      transitionTrigger: null,
      
      // Live account transition settings
      liveAccountTransitionEnabled: false,
      liveAccountTransitionProfitTarget: null,
      liveAccountTransitionDays: null,
      liveAccountTransitionDrawdownLimit: null,
      
      // Challenge Account Payout Settings
      allowChallengePayouts: false,
      
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
      // Trading Asset Selection
      primaryTradingAsset: "ES",
      secondaryTradingAsset: "none",
      tertiaryTradingAsset: "none",
      
      // New fields for discipline scoring
      daysRequiredToPass: 5,
      disciplineRiskPeriod: "weekly",
      disciplineRiskPeriodDays: 5,
      maxDailyRiskBudget: 500,
      
      // Account lifecycle management
      accountSource: "challenge",
      resetCount: 0,
      totalResetsCost: 0,
      lifecycleStatus: "C",
      liveAccountType: "prop_firm",
      liveAccountConditions: null,
    },
  });

  // Calculate risk suggestions based on form values
  const formValues = form.watch();
  const riskSuggestion = useMemo(() => {
    return calculateRiskSuggestions(formValues);
  }, [formValues]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading accounts...</div>
      </div>
    );
  }

  return (
    <>
      <header className="border-b border-gray-800 bg-dark-bg sticky top-0 z-50">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="primary-header text-gradient-rainbow">PropFirms Trading Accounts</h1>
              <h2 className="secondary-header">Risk Management & Responsible Day-to-Pass Planning</h2>
              <p className="text-gray-400 mt-2">Manage your prop trading accounts and strategic planning</p>
            </div>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Account
            </Button>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-6xl max-h-[95vh] bg-dark-bg border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white text-xl">Create New Trading Account</DialogTitle>
              </DialogHeader>
              <div className="overflow-y-auto max-h-[85vh] pr-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => createAccountMutation.mutate(data))} className="space-y-6">
                    <Tabs defaultValue="account" className="space-y-6">
                      <TabsList className="grid w-full grid-cols-4 bg-gray-800">
                        <TabsTrigger value="account" className="text-white data-[state=active]:bg-blue-600">
                          Account Info & Rules
                        </TabsTrigger>
                        <TabsTrigger value="financial" className="text-white data-[state=active]:bg-blue-600">
                          Financial Tracking
                        </TabsTrigger>
                        <TabsTrigger value="payout" className="text-white data-[state=active]:bg-blue-600">
                          Payout Rules
                        </TabsTrigger>
                        <TabsTrigger value="risk" className="text-white data-[state=active]:bg-blue-600">
                          Risk Settings
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="account" className="space-y-6 mt-6">
                        <div className="bg-gray-800 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-4">Basic Account Information</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Account Name</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., FTMO Challenge #1"
                                    />
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
                                  <FormLabel className="text-white font-medium">Trading Firm</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., FTMO, Apex, TopStep"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="type"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Account Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                        <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-700 border-gray-600">
                                      <SelectItem value="challenge" className="text-white hover:bg-gray-600">Challenge</SelectItem>
                                      <SelectItem value="funded" className="text-white hover:bg-gray-600">Funded (After passing challenge)</SelectItem>
                                      <SelectItem value="direct_funded" className="text-white hover:bg-gray-600">Direct Funded (Purchased directly)</SelectItem>
                                      <SelectItem value="live" className="text-white hover:bg-gray-600">Live Account (Funded → Live)</SelectItem>
                                      <SelectItem value="personal_live" className="text-white hover:bg-gray-600">Personal Live (Your own account)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="accountSource"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Account Source</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                        <SelectValue placeholder="Select source" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-700 border-gray-600">
                                      <SelectItem value="challenge" className="text-white hover:bg-gray-600">Challenge (Start with Challenge)</SelectItem>
                                      <SelectItem value="direct_funded" className="text-white hover:bg-gray-600">Direct Funded (Skip Challenge)</SelectItem>
                                      <SelectItem value="personal_live" className="text-white hover:bg-gray-600">Personal Live Account</SelectItem>
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
                                  <FormLabel className="text-white font-medium">Status</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-700 border-gray-600">
                                      <SelectItem value="active" className="text-white hover:bg-gray-600">Active</SelectItem>
                                      <SelectItem value="passed" className="text-white hover:bg-gray-600">Passed</SelectItem>
                                      <SelectItem value="failed" className="text-white hover:bg-gray-600">Failed</SelectItem>
                                      <SelectItem value="withdrawn" className="text-white hover:bg-gray-600">Withdrawn</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div className="bg-gray-800 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-4">Account Rules & Limits</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="startingBalance"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Starting Balance ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
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
                                  <FormLabel className="text-white font-medium">Current Balance ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
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
                                  <FormLabel className="text-white font-medium">Profit Target ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="maxDrawdown"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Max Drawdown ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Challenge/Evaluation Settings */}
                        <div className="bg-gray-800 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <Trophy className="mr-2 h-5 w-5" />
                            Challenge/Evaluation Settings
                          </h3>
                          
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <FormField
                              control={form.control}
                              name="numberOfPhases"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Number of Phases</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      min="1"
                                      max="3"
                                      {...field} 
                                      value={field.value || ""} 
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 1"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="phase1Target"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Phase 1 Target ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""} 
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 5000"
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
                                  <FormLabel className="text-white font-medium">Phase 2 Target ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""} 
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 2500"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <FormField
                              control={form.control}
                              name="minimumTradingDays"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Minimum Trading Days Required to Pass</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""} 
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 5"
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
                                  <FormLabel className="text-white font-medium">Time Limit (days)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""} 
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 30 (0 = unlimited)"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="daysRequiredToPass"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Days Required to Pass</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""} 
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 5"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          {/* Discipline Scoring Settings */}
                          <div className="bg-gray-700 p-4 rounded-lg">
                            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                              <Brain className="mr-2 h-5 w-5" />
                              Discipline Scoring Configuration
                            </h4>
                            <p className="text-gray-400 text-sm mb-4">
                              Configure risk period calculations and daily risk budgets for discipline score analysis.
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <FormField
                                control={form.control}
                                name="disciplineRiskPeriod"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white font-medium">Risk Period Calculation</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                          <SelectValue placeholder="Select period" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-gray-700 border-gray-600">
                                        <SelectItem value="daily" className="text-white hover:bg-gray-600">Daily</SelectItem>
                                        <SelectItem value="weekly" className="text-white hover:bg-gray-600">Weekly</SelectItem>
                                        <SelectItem value="monthly" className="text-white hover:bg-gray-600">Monthly</SelectItem>
                                        <SelectItem value="custom" className="text-white hover:bg-gray-600">Custom</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="maxDailyRiskBudget"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white font-medium">Maximum Daily Risk Budget ($)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        {...field} 
                                        value={field.value || ""} 
                                        onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                        placeholder="e.g., 500"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            {form.watch('disciplineRiskPeriod') === 'custom' && (
                              <div className="mb-4">
                                <FormField
                                  control={form.control}
                                  name="disciplineRiskPeriodDays"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-white font-medium">Custom Risk Period (days)</FormLabel>
                                      <FormControl>
                                        <Input 
                                          type="number" 
                                          {...field} 
                                          value={field.value || ""} 
                                          onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                          placeholder="e.g., 5"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Drawdown Rules */}
                        <div className="bg-gray-800 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <AlertTriangle className="mr-2 h-5 w-5" />
                            Drawdown Rules
                          </h3>
                          
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <FormField
                              control={form.control}
                              name="drawdownType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Drawdown Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                        <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-700 border-gray-600">
                                      <SelectItem value="daily" className="text-white hover:bg-gray-600">Daily</SelectItem>
                                      <SelectItem value="unrealized" className="text-white hover:bg-gray-600">Unrealized</SelectItem>
                                      <SelectItem value="trailing" className="text-white hover:bg-gray-600">Trailing</SelectItem>
                                      <SelectItem value="balance_based" className="text-white hover:bg-gray-600">Balance Based</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="maxTotalLoss"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Max Total Loss ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""} 
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 2500"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="trailingThreshold"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Trailing Threshold ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""} 
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 1000"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Daily Loss Limit */}
                        <div className="bg-gray-800 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-4">Daily Loss Limit</h3>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <FormField
                              control={form.control}
                              name="dailyLossLimit"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Daily Loss Limit ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""} 
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 1000"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="dailyLossLimitType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Daily Loss Limit Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                        <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-700 border-gray-600">
                                      <SelectItem value="soft" className="text-white hover:bg-gray-600">Soft (Warning)</SelectItem>
                                      <SelectItem value="hard" className="text-white hover:bg-gray-600">Hard (Violation)</SelectItem>
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
                              name="consistencyPercentage"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Consistency Percentage (%)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      min="0"
                                      max="100"
                                      {...field} 
                                      value={field.value || ""} 
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 20"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Trading Rules */}
                        <div className="bg-gray-800 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <Settings className="mr-2 h-5 w-5" />
                            Trading Rules & Permissions
                          </h3>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="hasDailyLossLimit"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox 
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      className="border-blue-400 data-[state=checked]:bg-blue-600"
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-white font-medium">
                                      Apply daily loss limit
                                    </FormLabel>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="consistencyRule"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox 
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      className="border-blue-400 data-[state=checked]:bg-blue-600"
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-white font-medium">
                                      Consistency rule
                                    </FormLabel>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="copyTradingAllowed"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox 
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      className="border-blue-400 data-[state=checked]:bg-blue-600"
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-white font-medium">
                                      Copy trading allowed
                                    </FormLabel>
                                  </div>
                                  <FormMessage />
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
                                      className="border-blue-400 data-[state=checked]:bg-blue-600"
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-white font-medium">
                                      News trading allowed
                                    </FormLabel>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                          <div className="mt-4">
                            <FormField
                              control={form.control}
                              name="hasDailyLossLimit"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value || false}
                                      onCheckedChange={field.onChange}
                                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-white font-medium">
                                      Has Daily Loss Limit
                                    </FormLabel>
                                    <p className="text-xs text-gray-400">
                                      Enable daily loss limit restrictions
                                    </p>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>

                          {form.watch('hasDailyLossLimit') && (
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <FormField
                                control={form.control}
                                name="dailyLossLimit"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white font-medium">Daily Loss Limit ($)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        {...field} 
                                        value={field.value || ""}
                                        onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                        placeholder="0"
                                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="dailyLossLimitType"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white font-medium">Loss Limit Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                          <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-gray-700 border-gray-600">
                                        <SelectItem value="soft" className="text-white hover:bg-gray-600">
                                          Soft (Trading stopped for day)
                                        </SelectItem>
                                        <SelectItem value="hard" className="text-white hover:bg-gray-600">
                                          Hard (Account failed)
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                        </div>

                        {/* Trading Assets Selection */}
                        <div className="bg-gray-800 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <Target className="mr-2 h-5 w-5" />
                            Primary Trading Assets
                          </h3>
                          <p className="text-gray-400 text-sm mb-4">
                            Select your main trading instruments to get personalized risk suggestions and position sizing recommendations.
                          </p>

                          <div className="grid grid-cols-1 gap-4">
                            <FormField
                              control={form.control}
                              name="primaryTradingAsset"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Primary Trading Asset</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                        <SelectValue placeholder="Select your main trading instrument" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-700 border-gray-600 max-h-64">
                                      {Object.entries(ASSET_CATEGORIES).map(([category, config]) => (
                                        <div key={category}>
                                          <div className="text-xs font-semibold text-gray-400 px-2 py-1 uppercase tracking-wide">
                                            {config.name}
                                          </div>
                                          {ASSET_CONFIG.filter(asset => asset.category === category).map((asset) => (
                                            <SelectItem 
                                              key={asset.symbol} 
                                              value={asset.symbol}
                                              className="text-white hover:bg-gray-600"
                                            >
                                              <div className="flex items-center justify-between w-full">
                                                <span>{asset.symbol} - {asset.name}</span>
                                                {asset.isBeginnerFriendly && (
                                                  <Badge variant="secondary" className="ml-2 bg-green-600 text-xs">
                                                    Beginner Friendly
                                                  </Badge>
                                                )}
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </div>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                  {form.watch("primaryTradingAsset") && (
                                    <div className="mt-2 p-2 bg-blue-900/30 rounded border border-blue-600/30">
                                      {(() => {
                                        const asset = ASSET_CONFIG.find(a => a.symbol === form.watch("primaryTradingAsset"));
                                        const riskSuggestion = getRiskSuggestion(form.watch("primaryTradingAsset"), form.watch("startingBalance") || 0);
                                        return asset ? (
                                          <div className="space-y-1">
                                            <p className="text-blue-300 text-xs">
                                              <strong>{asset.name}</strong> - {asset.description}
                                            </p>
                                            <p className="text-blue-300 text-xs">
                                              Risk Level: {asset.riskLevel}/5 | Volatility: {asset.volatility} | Suggested Risk: ${riskSuggestion.suggestedRisk}
                                            </p>
                                            <p className="text-blue-400 text-xs">{riskSuggestion.reasoning}</p>
                                          </div>
                                        ) : null;
                                      })()}
                                    </div>
                                  )}
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="secondaryTradingAsset"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white font-medium">Secondary Asset (Optional)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                          <SelectValue placeholder="Select secondary instrument" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-gray-700 border-gray-600 max-h-64">
                                        <SelectItem value="none" className="text-white hover:bg-gray-600">
                                          None
                                        </SelectItem>
                                        {ASSET_CONFIG.map((asset) => (
                                          <SelectItem 
                                            key={asset.symbol} 
                                            value={asset.symbol}
                                            className="text-white hover:bg-gray-600"
                                          >
                                            {asset.symbol} - {asset.name}
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
                                name="tertiaryTradingAsset"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white font-medium">Tertiary Asset (Optional)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                          <SelectValue placeholder="Select third instrument" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-gray-700 border-gray-600 max-h-64">
                                        <SelectItem value="none" className="text-white hover:bg-gray-600">
                                          None
                                        </SelectItem>
                                        {ASSET_CONFIG.map((asset) => (
                                          <SelectItem 
                                            key={asset.symbol} 
                                            value={asset.symbol}
                                            className="text-white hover:bg-gray-600"
                                          >
                                            {asset.symbol} - {asset.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="financial" className="space-y-6 mt-6">
                        <div className="bg-gray-800 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <DollarSign className="mr-2 h-5 w-5" />
                            Financial Tracking & Purchase Details
                          </h3>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="accountCost"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Account Purchase Cost ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      step="0.01"
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 299.00"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="purchaseMethod"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Purchase Method</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                        <SelectValue placeholder="How was this account purchased?" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-700 border-gray-600">
                                      <SelectItem value="credit_card" className="text-white hover:bg-gray-600">Credit Card</SelectItem>
                                      <SelectItem value="paypal" className="text-white hover:bg-gray-600">PayPal</SelectItem>
                                      <SelectItem value="crypto" className="text-white hover:bg-gray-600">Cryptocurrency</SelectItem>
                                      <SelectItem value="bank_transfer" className="text-white hover:bg-gray-600">Bank Transfer</SelectItem>
                                      <SelectItem value="other" className="text-white hover:bg-gray-600">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="includesActivationFee"
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
                                    <FormLabel className="text-white font-medium">
                                      Account cost includes activation fee
                                    </FormLabel>
                                    <p className="text-sm text-gray-400">
                                      Check if the purchase price includes the activation fee for when you pass
                                    </p>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="activationCost"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Activation Fee ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      step="0.01"
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 99.00"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="mt-6 bg-gray-700 p-4 rounded-lg">
                            <h4 className="text-md font-semibold text-white mb-3">Reset & Failure Tracking</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="resetCount"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white font-medium">Number of Resets</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        {...field} 
                                        value={field.value || ""}
                                        onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                                        className="bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                                        placeholder="0"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="totalResetsCost"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white font-medium">Total Reset Costs ($)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step="0.01"
                                        {...field} 
                                        value={field.value || ""}
                                        onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                        className="bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                                        placeholder="0.00"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <div className="mt-4 bg-blue-900 bg-opacity-30 p-4 rounded-lg">
                            <h4 className="text-md font-semibold text-white mb-3">Activation Status (For Passed Accounts)</h4>
                            <div className="space-y-4">
                              <FormField
                                control={form.control}
                                name="activationPaid"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox 
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="border-blue-400 data-[state=checked]:bg-blue-600"
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className="text-white font-medium">
                                        Activation fee has been paid
                                      </FormLabel>
                                      <p className="text-sm text-blue-200">
                                        Check this when you've paid the activation fee for a passed challenge
                                      </p>
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="payout" className="space-y-6 mt-6">
                        {/* Challenge Account Payout Settings */}
                        <div className="bg-gray-800 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <DollarSign className="mr-2 h-5 w-5 text-blue-400" />
                            Challenge Account Payout Settings
                          </h3>
                          <p className="text-gray-400 text-sm mb-4">
                            Some prop firms allow payouts from challenge accounts. Configure payout rules for challenge state.
                          </p>
                          
                          <div className="mb-4">
                            <FormField
                              control={form.control}
                              name="allowChallengePayouts"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox 
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      className="border-blue-400 data-[state=checked]:bg-blue-600"
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-white font-medium">
                                      Allow Challenge Account Payouts
                                    </FormLabel>
                                    <p className="text-sm text-blue-200">
                                      Check this if the prop firm allows payouts from challenge accounts
                                    </p>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="daysRequiredForPayout"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Days Required for Payout</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 5"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="winningDayMinimum"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Winning Day Minimum ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 200"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="payoutFrequency"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Payout Frequency</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                        <SelectValue placeholder="Select frequency" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-700 border-gray-600">
                                      <SelectItem value="weekly" className="text-white hover:bg-gray-600">Weekly</SelectItem>
                                      <SelectItem value="bi-weekly" className="text-white hover:bg-gray-600">Bi-weekly</SelectItem>
                                      <SelectItem value="monthly" className="text-white hover:bg-gray-600">Monthly</SelectItem>
                                      <SelectItem value="on-demand" className="text-white hover:bg-gray-600">On-demand</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="minimumPayoutAmount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Minimum Payout Amount ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 100"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="profitSplit"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Profit Split (%)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      min="0"
                                      max="100"
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 80"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="maximumPayoutAllowed"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Maximum Payout Allowed ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 5000"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="maximumPayoutPerAccount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Maximum Payout Allowed Per Account ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 2500"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="bufferAmount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Buffer Amount ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 500"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="bufferPercentage"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Buffer Percentage (%)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      min="0"
                                      max="100"
                                      step="0.1"
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 5.0"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="mt-4">
                            <FormField
                              control={form.control}
                              name="accountBufferRequired"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox 
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      className="border-blue-400 data-[state=checked]:bg-blue-600"
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-white font-medium">
                                      Account buffer required for payouts
                                    </FormLabel>
                                    <p className="text-sm text-blue-200">
                                      Require maintaining a buffer amount in the account
                                    </p>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        {/* Funded Account Payout Settings */}
                        <div className="bg-gray-800 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <DollarSign className="mr-2 h-5 w-5 text-green-400" />
                            Funded Account Payout Settings
                          </h3>
                          <p className="text-gray-400 text-sm mb-4">
                            Configure payout rules when account transitions to funded status after passing challenge.
                          </p>
                          
                          <div className="mb-4">
                            <FormField
                              control={form.control}
                              name="fundedPayoutEnabled"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox 
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      className="border-green-400 data-[state=checked]:bg-green-600"
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-white font-medium">
                                      Enable Funded Account Payouts
                                    </FormLabel>
                                    <p className="text-sm text-green-200">
                                      Allow payouts when account reaches funded status
                                    </p>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="fundedDaysRequiredForPayout"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Funded Days Required for Payout</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 5"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="fundedWinningDayMinimum"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Funded Winning Day Minimum ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 200"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="fundedPayoutFrequency"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Funded Payout Frequency</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                        <SelectValue placeholder="Select frequency" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-700 border-gray-600">
                                      <SelectItem value="weekly" className="text-white hover:bg-gray-600">Weekly</SelectItem>
                                      <SelectItem value="bi-weekly" className="text-white hover:bg-gray-600">Bi-weekly</SelectItem>
                                      <SelectItem value="monthly" className="text-white hover:bg-gray-600">Monthly</SelectItem>
                                      <SelectItem value="on-demand" className="text-white hover:bg-gray-600">On-demand</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="fundedMinimumPayoutAmount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Funded Minimum Payout Amount ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 100"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="fundedMaxNetBalanceForPayout"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Funded Max Net Balance for Payout ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 2500"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="fundedProfitSplit"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Funded Profit Split (%)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      min="0"
                                      max="100"
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 80"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        {/* Live Account Payout Settings */}
                        <div className="bg-gray-800 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <DollarSign className="mr-2 h-5 w-5 text-yellow-400" />
                            Live Account Payout Settings
                          </h3>
                          <p className="text-gray-400 text-sm mb-4">
                            Configure payout rules for live account status with enhanced benefits.
                          </p>
                          
                          <div className="mb-4">
                            <FormField
                              control={form.control}
                              name="livePayoutEnabled"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox 
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      className="border-yellow-400 data-[state=checked]:bg-yellow-600"
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-white font-medium">
                                      Enable Live Account Payouts
                                    </FormLabel>
                                    <p className="text-sm text-yellow-200">
                                      Allow payouts when account reaches live status
                                    </p>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="liveDaysRequiredForPayout"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Live Days Required for Payout</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 3"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="liveWinningDayMinimum"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Live Winning Day Minimum ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 100"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="livePayoutFrequency"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Live Payout Frequency</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                        <SelectValue placeholder="Select frequency" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-700 border-gray-600">
                                      <SelectItem value="weekly" className="text-white hover:bg-gray-600">Weekly</SelectItem>
                                      <SelectItem value="bi-weekly" className="text-white hover:bg-gray-600">Bi-weekly</SelectItem>
                                      <SelectItem value="monthly" className="text-white hover:bg-gray-600">Monthly</SelectItem>
                                      <SelectItem value="on-demand" className="text-white hover:bg-gray-600">On-demand</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="liveMinimumPayoutAmount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Live Minimum Payout Amount ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 50"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="liveMaxNetBalanceForPayout"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Live Max Net Balance for Payout ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 1000"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="liveProfitSplit"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Live Profit Split (%)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      min="0"
                                      max="100"
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 90"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        {/* Live Account Transition Settings */}
                        <div className="bg-gray-800 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <ArrowRight className="mr-2 h-5 w-5 text-purple-400" />
                            Live Account Transition Settings
                          </h3>
                          <p className="text-gray-400 text-sm mb-4">
                            Configure requirements for transitioning from funded to live account status.
                          </p>
                          
                          <div className="mb-4">
                            <FormField
                              control={form.control}
                              name="liveAccountTransitionEnabled"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox 
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      className="border-purple-400 data-[state=checked]:bg-purple-600"
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-white font-medium">
                                      Enable Live Account Transition
                                    </FormLabel>
                                    <p className="text-sm text-purple-200">
                                      Allow funded accounts to transition to live status
                                    </p>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="liveAccountTransitionProfitTarget"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Profit Target for Live Transition ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 5000"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="liveAccountTransitionDays"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Days Required for Live Transition</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 30"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="liveAccountTransitionDrawdownLimit"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Max Drawdown During Transition ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 1000"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="risk" className="space-y-6 mt-6">
                        {/* Trading Capital Settings */}
                        <div className="bg-gray-800 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <Calculator className="mr-2 h-5 w-5" />
                            Trading Capital & Risk Method
                          </h3>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="tradingCapital"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Trading Capital ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="Account starting balance"
                                    />
                                  </FormControl>
                                  <p className="text-xs text-gray-400 mt-1">
                                    Total capital or max acceptable drawdown amount
                                  </p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="riskCalculationPeriod"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Risk Calculation Period</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                        <SelectValue placeholder="Select period" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-700 border-gray-600">
                                      <SelectItem value="weekly" className="text-white hover:bg-gray-600">
                                        Weekly (5 days)
                                      </SelectItem>
                                      <SelectItem value="bi_weekly" className="text-white hover:bg-gray-600">
                                        BiWeekly (10 days)
                                      </SelectItem>
                                      <SelectItem value="monthly" className="text-white hover:bg-gray-600">
                                        Monthly (20 days)
                                      </SelectItem>
                                      <SelectItem value="custom" className="text-white hover:bg-gray-600">
                                        Custom Risk Amount
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <p className="text-xs text-gray-400 mt-1">
                                    How to calculate your risk per trade
                                  </p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          {/* Risk Percentage Toggle */}
                          <div className="mt-4">
                            <FormField
                              control={form.control}
                              name="useRiskPercentage"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value || false}
                                      onCheckedChange={field.onChange}
                                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-white font-medium">
                                      Use Percentage Risk Mode
                                    </FormLabel>
                                    <p className="text-xs text-gray-400">
                                      Use percentage of capital instead of period-based risk
                                    </p>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          {/* Conditional Risk Fields */}
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            {form.watch('useRiskPercentage') ? (
                              <FormField
                                control={form.control}
                                name="riskPercentage"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white font-medium">Risk Percentage (%)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step="0.01"
                                        min="0.01"
                                        max="10"
                                        {...field} 
                                        value={field.value || ""}
                                        onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                        placeholder="e.g., 1.0"
                                      />
                                    </FormControl>
                                    <p className="text-xs text-gray-400 mt-1">
                                      Percentage of total capital to risk per trade
                                    </p>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            ) : (
                              form.watch('riskCalculationPeriod') === 'custom' && (
                                <FormField
                                  control={form.control}
                                  name="customRiskAmount"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-white font-medium">Custom Risk Amount ($)</FormLabel>
                                      <FormControl>
                                        <Input 
                                          type="number" 
                                          {...field} 
                                          value={field.value || ""}
                                          onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                          placeholder="e.g., 500"
                                        />
                                      </FormControl>
                                      <p className="text-xs text-gray-400 mt-1">
                                        Fixed dollar amount to risk per trade
                                      </p>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )
                            )}
                            
                            <FormField
                              control={form.control}
                              name="maxTradesPerDay"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Max Trades Per Day</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number"
                                      min="0"
                                      max="50"
                                      {...field}
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="0 = unlimited"
                                    />
                                  </FormControl>
                                  <p className="text-xs text-gray-400 mt-1">
                                    Maximum number of trades allowed per day (0 = unlimited)
                                  </p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="primaryAsset"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Primary Trading Asset</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                        <SelectValue placeholder="Select asset" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-700 border-gray-600 max-h-48">
                                      {Object.entries(TRADING_ASSETS).map(([symbol, asset]) => (
                                        <SelectItem key={symbol} value={symbol} className="text-white hover:bg-gray-600">
                                          {symbol} - {asset.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <FormField
                              control={form.control}
                              name="riskPerTrade"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Risk Per Trade ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 500"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="maxRiskPerDay"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Maximum Risk Per Day ($)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 1000"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="maxPositionSize"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Max Position Size (contracts)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., 10"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <FormField
                              control={form.control}
                              name="enhancedPayoutsAvailable"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox 
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      className="border-blue-400 data-[state=checked]:bg-blue-600"
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-white font-medium">
                                      Enhanced payouts available
                                    </FormLabel>
                                    <p className="text-sm text-blue-200">
                                      Account supports enhanced payout features
                                    </p>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="liveAccountAvailable"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox 
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      className="border-blue-400 data-[state=checked]:bg-blue-600"
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-white font-medium">
                                      Live account available
                                    </FormLabel>
                                    <p className="text-sm text-blue-200">
                                      Account can transition to live trading
                                    </p>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="mt-4">
                            <FormField
                              control={form.control}
                              name="transitionTrigger"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white font-medium">Transition Trigger</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                      placeholder="e.g., profit target reached"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        {/* Risk Suggestions Display */}
                        {riskSuggestion && (
                          <div className="bg-blue-900/20 border border-blue-600/30 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                              <Lightbulb className="mr-2 h-5 w-5 text-yellow-400" />
                              Smart Risk Suggestions
                            </h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="bg-gray-800 p-3 rounded">
                                <p className="text-xs text-gray-400 mb-1">Suggested Risk Per Trade</p>
                                <p className="text-lg font-bold text-green-400">
                                  ${riskSuggestion.suggestedRiskPerTrade.toLocaleString()}
                                </p>
                              </div>
                              <div className="bg-gray-800 p-3 rounded">
                                <p className="text-xs text-gray-400 mb-1">Max Position Size</p>
                                <p className="text-lg font-bold text-blue-400">
                                  {riskSuggestion.maxPositionSize} contracts
                                </p>
                              </div>
                              <div className="bg-gray-800 p-3 rounded">
                                <p className="text-xs text-gray-400 mb-1">Risk Level</p>
                                <p className={`text-lg font-bold ${
                                  riskSuggestion.riskScore === 'Conservative' ? 'text-green-400' :
                                  riskSuggestion.riskScore === 'Moderate' ? 'text-yellow-400' :
                                  riskSuggestion.riskScore === 'Aggressive' ? 'text-orange-400' : 'text-red-400'
                                }`}>
                                  {riskSuggestion.riskScore}
                                </p>
                              </div>
                              <div className="bg-gray-800 p-3 rounded">
                                <p className="text-xs text-gray-400 mb-1">Margin Required</p>
                                <p className="text-lg font-bold text-purple-400">
                                  ${riskSuggestion.marginRequired.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            
                            {riskSuggestion.warnings.length > 0 && (
                              <div className="bg-red-900/20 border border-red-600/30 p-3 rounded mb-3">
                                <h4 className="text-red-400 font-medium mb-2">⚠️ Risk Warnings:</h4>
                                <ul className="text-xs text-red-200 space-y-1">
                                  {riskSuggestion.warnings.map((warning, index) => (
                                    <li key={index}>• {warning}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            <div className="text-xs text-gray-400">
                              <p className="mb-1">💡 Analysis based on account parameters:</p>
                              <ul className="space-y-1">
                                {riskSuggestion.reasoning.slice(0, 3).map((reason, index) => (
                                  <li key={index}>• {reason}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </TabsContent>

                    </Tabs>
                    
                    {/* Dialog Footer */}
                    <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-700">
                      <Button 
                        type="button"
                        onClick={() => setIsDialogOpen(false)}
                        variant="outline"
                        className="px-6 py-2"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createAccountMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                      >
                        {createAccountMutation.isPending ? "Creating Account..." : "Create Account"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="p-6">
        {/* Account List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts?.map((account) => (
            <AccountManagement key={account.id} account={account} />
          ))}
        </div>


      </div>
    </>
  );
}