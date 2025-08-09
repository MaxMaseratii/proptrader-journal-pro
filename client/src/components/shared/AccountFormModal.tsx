import { useState } from "react";
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

interface AccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountFormModal({ isOpen, onClose }: AccountFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Replace this with your actual API call
      console.log("Form data:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success handling
      onClose();
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
      alert("Account created successfully!");
      
    } catch (error) {
      console.error("Error creating account:", error);
      alert("Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                        <SelectItem value="passed">Passed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="withdrawn">Withdrawn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Starting Balance</Label>
                    <Input 
                      type="number" 
                      value={formData.startingBalance === 0 ? "" : formData.startingBalance}
                      onChange={(e) => updateField('startingBalance', e.target.value === "" ? 0 : parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-600 text-white" 
                      placeholder="100000"
                    />
                    {errors.startingBalance && <p className="text-red-400 text-sm">{errors.startingBalance}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Profit Target</Label>
                    <Input 
                      type="number" 
                      value={formData.profitTarget === 0 ? "" : formData.profitTarget}
                      onChange={(e) => updateField('profitTarget', e.target.value === "" ? 0 : parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-600 text-white" 
                      placeholder="10000"
                    />
                    {errors.profitTarget && <p className="text-red-400 text-sm">{errors.profitTarget}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Max Drawdown</Label>
                    <Input 
                      type="number" 
                      value={formData.maxDrawdown === 0 ? "" : formData.maxDrawdown}
                      onChange={(e) => updateField('maxDrawdown', e.target.value === "" ? 0 : parseFloat(e.target.value))}
                      className="bg-gray-800 border-gray-600 text-white" 
                      placeholder="5000"
                    />
                    {errors.maxDrawdown && <p className="text-red-400 text-sm">{errors.maxDrawdown}</p>}
                  </div>
                </div>
              </TabsContent>

              {/* Financial Tab */}
              <TabsContent value="financial" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Account Cost</Label>
                    <Input 
                      type="number" 
                      value={formData.accountCost || ""}
                      onChange={(e) => updateField('accountCost', parseFloat(e.target.value) || null)}
                      className="bg-gray-800 border-gray-600 text-white" 
                      placeholder="599"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Activation Cost</Label>
                    <Input 
                      type="number" 
                      value={formData.activationCost || ""}
                      onChange={(e) => updateField('activationCost', parseFloat(e.target.value) || null)}
                      className="bg-gray-800 border-gray-600 text-white" 
                      placeholder="200"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Rules & Risk Tab */}
              <TabsContent value="rules" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Minimum Trading Days</Label>
                    <Input 
                      type="number" 
                      value={formData.minimumTradingDays || ""}
                      onChange={(e) => updateField('minimumTradingDays', parseFloat(e.target.value) || null)}
                      className="bg-gray-800 border-gray-600 text-white" 
                      placeholder="5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Time Limit (days)</Label>
                    <Input 
                      type="number" 
                      value={formData.timeLimit || ""}
                      onChange={(e) => updateField('timeLimit', parseFloat(e.target.value) || null)}
                      className="bg-gray-800 border-gray-600 text-white" 
                      placeholder="30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Risk Per Trade (%)</Label>
                    <Input 
                      type="number" 
                      value={formData.riskPerTrade || ""}
                      onChange={(e) => updateField('riskPerTrade', parseFloat(e.target.value) || null)}
                      className="bg-gray-800 border-gray-600 text-white" 
                      placeholder="1.0"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.hasDailyLossLimit}
                    onCheckedChange={(checked) => updateField('hasDailyLossLimit', checked)}
                    className="border-gray-600 data-[state=checked]:bg-blue-600"
                  />
                  <Label className="text-white">Has Daily Loss Limit</Label>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}