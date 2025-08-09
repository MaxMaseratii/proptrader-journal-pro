import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AccountFormModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function AccountFormModal({ open = false, onOpenChange }: AccountFormModalProps) {
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(open);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
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
    drawdownType: "trailing",
    maxDrawdownType: "eod",
    
    // Account Rules
    minimumTradingDays: null,
    timeLimit: null,
    daysRequiredToPass: null,
    consistencyPercentage: null,
    
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
    primaryAsset: "ES",
    secondaryAsset: "",
    tertiaryAsset: "",

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
    takeProfitPoints: 20,
    riskPerTrade: null,
    riskPerTradeDivider: 1,
    maxTradesPerDay: 0,
    maxRiskPerDay: null,
    maxPositionSize: null,
    preferredAssets: null,
    
    // Personal Trading Time fields
    personalTradingTimeStart1: "",
    personalTradingTimeEnd1: "",
    personalTradingTimeZone1: "",
    personalTradingTimeStart2: "",
    personalTradingTimeEnd2: "",
    personalTradingTimeZone2: "",
    personalTradingTimeStart3: "",
    personalTradingTimeEnd3: "",
    personalTradingTimeZone3: "",
    
    // Enhanced and Live Account Settings
    liveAccountAvailable: false,
    enhancedPayoutsAvailable: false,
    transitionTrigger: null,
    
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
  });

  // Update form field
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Account name is required";
    }
    
    if (!formData.firm.trim()) {
      newErrors.firm = "Prop firm is required";
    }
    
    if (formData.startingBalance <= 0) {
      newErrors.startingBalance = "Starting balance must be greater than 0";
    }
    
    if (formData.profitTarget <= 0) {
      newErrors.profitTarget = "Profit target must be greater than 0";
    }
    
    if (formData.maxDrawdown <= 0) {
      newErrors.maxDrawdown = "Max drawdown must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createAccountMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/accounts", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      handleOpenChange(false);
      resetForm();
      toast({
        title: "Account Created",
        description: "Your account has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create account.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
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
      drawdownType: "trailing",
      maxDrawdownType: "eod",
      minimumTradingDays: null,
      timeLimit: null,
      daysRequiredToPass: null,
      consistencyPercentage: null,
      accountCost: null,
      purchaseMethod: null,
      resetCount: 0,
      totalResetsCost: 0,
      activationCost: null,
      activationPaid: false,
      includesActivationFee: false,
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
      tradingCapital: null,
      riskCalculationPeriod: "weekly",
      useRiskPercentage: false,
      riskPercentage: null,
      customRiskAmount: null,
      riskRewardRatio: 2.0,
      primaryAsset: "ES",
      secondaryAsset: "",
      tertiaryAsset: "",
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
      takeProfitPoints: 20,
      riskPerTrade: null,
      riskPerTradeDivider: 1,
      maxTradesPerDay: 0,
      maxRiskPerDay: null,
      maxPositionSize: null,
      preferredAssets: null,
      personalTradingTimeStart1: "",
      personalTradingTimeEnd1: "",
      personalTradingTimeZone1: "",
      personalTradingTimeStart2: "",
      personalTradingTimeEnd2: "",
      personalTradingTimeZone2: "",
      personalTradingTimeStart3: "",
      personalTradingTimeEnd3: "",
      personalTradingTimeZone3: "",
      liveAccountAvailable: false,
      enhancedPayoutsAvailable: false,
      transitionTrigger: null,
      liveAccountTransitionEnabled: false,
      liveAccountTransitionProfitTarget: null,
      liveAccountTransitionDays: null,
      liveAccountTransitionDrawdownLimit: null,
      fundedPayoutEnabled: false,
      fundedDaysRequiredForPayout: null,
      fundedWinningDayMinimum: null,
      fundedPayoutFrequency: null,
      fundedMinimumPayoutAmount: null,
      fundedMaxNetBalanceForPayout: null,
      fundedProfitSplit: null,
      livePayoutEnabled: false,
      liveDaysRequiredForPayout: null,
      liveWinningDayMinimum: null,
      livePayoutFrequency: null,
      liveMinimumPayoutAmount: null,
      liveMaxNetBalanceForPayout: null,
      liveProfitSplit: null,
    });
    setErrors({});
  };

  // Handle external prop changes
  useEffect(() => {
    if (open !== undefined) {
      setIsAccountDialogOpen(open);
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsAccountDialogOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    createAccountMutation.mutate(formData);
  };

  // Generate time options for select
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    const time = `${hour.toString().padStart(2, '0')}:${minute}`;
    return { value: time, label: time };
  });

  return (
    <>
      {/* Account Creation Modal */}
      <Dialog open={isAccountDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Create New Trading Account</DialogTitle>
            <DialogDescription className="text-gray-400">
              Set up a new trading account with proper risk management and financial tracking.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[80vh] px-6">
            <div className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="financial">Financial</TabsTrigger>
                  <TabsTrigger value="rules">Rules & Risk</TabsTrigger>
                </TabsList>

                {/* Basic Info Tab */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Account Name</Label>
                      <Input 
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white" 
                        placeholder="My Trading Account" 
                      />
                      {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Prop Firm</Label>
                      <Input 
                        value={formData.firm}
                        onChange={(e) => updateField('firm', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white" 
                        placeholder="FTMO, TopstepTrader, etc." 
                      />
                      {errors.firm && <p className="text-red-400 text-sm">{errors.firm}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Account Type</Label>
                      <Select onValueChange={(value) => updateField('type', value)} value={formData.type}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="challenge">Challenge</SelectItem>
                          <SelectItem value="funded">Funded</SelectItem>
                          <SelectItem value="live">Live</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Status</Label>
                      <Select onValueChange={(value) => updateField('status', value)} value={formData.status}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                {/* Financial Tab */}
                <TabsContent value="financial" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Starting Balance ($)</Label>
                      <Input 
                        type="number"
                        value={formData.startingBalance}
                        onChange={(e) => updateField('startingBalance', Number(e.target.value))}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                      {errors.startingBalance && <p className="text-red-400 text-sm">{errors.startingBalance}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Profit Target ($)</Label>
                      <Input 
                        type="number"
                        value={formData.profitTarget}
                        onChange={(e) => updateField('profitTarget', Number(e.target.value))}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                      {errors.profitTarget && <p className="text-red-400 text-sm">{errors.profitTarget}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Max Drawdown ($)</Label>
                      <Input 
                        type="number"
                        value={formData.maxDrawdown}
                        onChange={(e) => updateField('maxDrawdown', Number(e.target.value))}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                      {errors.maxDrawdown && <p className="text-red-400 text-sm">{errors.maxDrawdown}</p>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasDailyLossLimit"
                        checked={formData.hasDailyLossLimit}
                        onCheckedChange={(checked) => {
                          updateField("hasDailyLossLimit", checked);
                          if (!checked) {
                            updateField("dailyLossLimit", null);
                          }
                        }}
                      />
                      <Label htmlFor="hasDailyLossLimit" className="text-white">
                        Enable Daily Loss Limit
                      </Label>
                    </div>
                    {formData.hasDailyLossLimit && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white">Daily Loss Limit ($)</Label>
                          <Input 
                            type="number"
                            value={formData.dailyLossLimit || ""}
                            onChange={(e) => updateField('dailyLossLimit', e.target.value ? Number(e.target.value) : null)}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Daily Loss Limit Type</Label>
                          <Select onValueChange={(value) => updateField('dailyLossLimitType', value)} value={formData.dailyLossLimitType}>
                            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              <SelectItem value="soft">Soft (Discipline Tracking)</SelectItem>
                              <SelectItem value="hard">Hard (Account Suspension)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Rules & Risk Tab */}
                <TabsContent value="rules" className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">Risk Management</h3>
                      
                      <div className="space-y-2">
                        <Label className="text-white">Risk:Reward Ratio</Label>
                        <Input 
                          type="number"
                          step="0.1"
                          min="1"
                          max="10"
                          value={formData.riskRewardRatio}
                          onChange={(e) => updateField('riskRewardRatio', Number(e.target.value))}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white">Primary Asset</Label>
                          <Select onValueChange={(value) => updateField('primaryAsset', value)} value={formData.primaryAsset}>
                            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                              <SelectValue placeholder="Select asset" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              <SelectItem value="ES">E-mini S&P 500 (ES)</SelectItem>
                              <SelectItem value="NQ">E-mini NASDAQ-100 (NQ)</SelectItem>
                              <SelectItem value="YM">E-mini Dow (YM)</SelectItem>
                              <SelectItem value="RTY">E-mini Russell 2000 (RTY)</SelectItem>
                              <SelectItem value="GC">Gold Futures (GC)</SelectItem>
                              <SelectItem value="CL">Crude Oil (CL)</SelectItem>
                              <SelectItem value="EUR/USD">EUR/USD</SelectItem>
                              <SelectItem value="GBP/USD">GBP/USD</SelectItem>
                              <SelectItem value="USD/JPY">USD/JPY</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Take Profit (Points)</Label>
                          <Input 
                            type="number"
                            value={formData.takeProfitPoints}
                            onChange={(e) => updateField('takeProfitPoints', Number(e.target.value))}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white">Stop Loss (Points)</Label>
                          <Input 
                            type="number"
                            value={formData.stopLossPoints}
                            onChange={(e) => updateField('stopLossPoints', Number(e.target.value))}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-white font-semibold">Trading Hours & Session</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white">Session Start</Label>
                          <Input 
                            type="time"
                            value={formData.tradingSessionStart}
                            onChange={(e) => updateField('tradingSessionStart', e.target.value)}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Session End</Label>
                          <Input 
                            type="time"
                            value={formData.tradingSessionEnd}
                            onChange={(e) => updateField('tradingSessionEnd', e.target.value)}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Timezone</Label>
                        <Select onValueChange={(value) => updateField('timezone', value)} value={formData.timezone}>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            <SelectItem value="EST">EST (Eastern Standard Time)</SelectItem>
                            <SelectItem value="CST">CST (Central Standard Time)</SelectItem>
                            <SelectItem value="MST">MST (Mountain Standard Time)</SelectItem>
                            <SelectItem value="PST">PST (Pacific Standard Time)</SelectItem>
                            <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                            <SelectItem value="CET">CET (Central European Time)</SelectItem>
                            <SelectItem value="JST">JST (Japan Standard Time)</SelectItem>
                            <SelectItem value="AEST">AEST (Australian Eastern Standard Time)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white">Daily Working Hours</Label>
                          <Input 
                            type="number"
                            step="0.5"
                            min="0.5"
                            max="16"
                            value={formData.dailyWorkingHours || ""}
                            onChange={(e) => updateField('dailyWorkingHours', e.target.value ? Number(e.target.value) : null)}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Hourly Wages ($)</Label>
                          <Input 
                            type="number"
                            value={formData.hourlyWages || ""}
                            onChange={(e) => updateField('hourlyWages', e.target.value ? Number(e.target.value) : null)}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={createAccountMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {createAccountMutation.isPending ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Export button components for use in other pages
export function CreateFirstAccountButton({ className = "" }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className={`bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold hover:from-yellow-500 hover:to-yellow-700 ${className}`}
      >
        <Plus className="w-4 h-4 mr-2" />
        New Account
      </Button>
      <AccountFormModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

export { AccountFormModal };