import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, TrendingUp, AlertTriangle, Info, DollarSign, Target, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PositionSizeResult {
  positionSize: number;
  dollarRisk: number;
  percentRisk: number;
  riskRewardRatio: number;
  potentialProfit: number;
  potentialLoss: number;
  recommendedLotSize?: number;
}

const PRESET_RISK_LEVELS = [
  { label: "Conservative", value: 1, color: "green" },
  { label: "Moderate", value: 2, color: "yellow" },
  { label: "Aggressive", value: 3, color: "orange" },
  { label: "High Risk", value: 5, color: "red" },
];

const CURRENCY_PAIRS = [
  { symbol: "EURUSD", pipValue: 10 },
  { symbol: "GBPUSD", pipValue: 10 },
  { symbol: "USDJPY", pipValue: 9.09 },
  { symbol: "USDCAD", pipValue: 7.46 },
  { symbol: "AUDUSD", pipValue: 10 },
  { symbol: "NZDUSD", pipValue: 10 },
  { symbol: "USDCHF", pipValue: 10.87 },
];

const ACCOUNT_TYPES = [
  { label: "Standard (1 lot = 100,000)", multiplier: 100000 },
  { label: "Mini (1 lot = 10,000)", multiplier: 10000 },
  { label: "Micro (1 lot = 1,000)", multiplier: 1000 },
  { label: "Nano (1 lot = 100)", multiplier: 100 },
];

export default function PositionSizingPage() {
  const [accountBalance, setAccountBalance] = useState<string>("10000");
  const [riskPercentage, setRiskPercentage] = useState<string>("2");
  const [entryPrice, setEntryPrice] = useState<string>("");
  const [stopLoss, setStopLoss] = useState<string>("");
  const [takeProfit, setTakeProfit] = useState<string>("");
  const [selectedPair, setSelectedPair] = useState<string>("EURUSD");
  const [accountType, setAccountType] = useState<string>("standard");
  const [result, setResult] = useState<PositionSizeResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>("calculator");

  const calculatePositionSize = () => {
    const balance = parseFloat(accountBalance);
    const risk = parseFloat(riskPercentage);
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    const tp = parseFloat(takeProfit);

    if (!balance || !risk || !entry || !sl) {
      alert("Please fill in all required fields");
      return;
    }

    const selectedPairData = CURRENCY_PAIRS.find(pair => pair.symbol === selectedPair);
    const selectedAccountType = ACCOUNT_TYPES.find(type => type.label.toLowerCase().includes(accountType));
    
    if (!selectedPairData || !selectedAccountType) return;

    // Calculate dollar risk
    const dollarRisk = (balance * risk) / 100;

    // Calculate pip distance (stop loss distance)
    const pipDistance = Math.abs(entry - sl) * 10000; // Convert to pips

    // Calculate position size in units
    const pipValue = selectedPairData.pipValue;
    const positionSizeInUnits = dollarRisk / (pipDistance * pipValue / selectedAccountType.multiplier);

    // Calculate lot size
    const lotSize = positionSizeInUnits / selectedAccountType.multiplier;

    // Calculate potential profit/loss
    const tpDistance = tp ? Math.abs(tp - entry) * 10000 : 0;
    const potentialProfit = tp ? (tpDistance * pipValue * lotSize) : 0;
    const potentialLoss = pipDistance * pipValue * lotSize;

    // Risk/Reward ratio
    const riskRewardRatio = tp ? potentialProfit / potentialLoss : 0;

    const calculationResult: PositionSizeResult = {
      positionSize: positionSizeInUnits,
      dollarRisk,
      percentRisk: risk,
      riskRewardRatio,
      potentialProfit,
      potentialLoss,
      recommendedLotSize: lotSize,
    };

    setResult(calculationResult);
  };

  const resetCalculator = () => {
    setEntryPrice("");
    setStopLoss("");
    setTakeProfit("");
    setResult(null);
  };

  const getRiskColor = (risk: number) => {
    if (risk <= 1) return "text-green-600";
    if (risk <= 2) return "text-yellow-600";
    if (risk <= 3) return "text-orange-600";
    return "text-red-600";
  };

  const getRiskRewardColor = (ratio: number) => {
    if (ratio >= 2) return "text-green-600";
    if (ratio >= 1.5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Calculator className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Position Sizing Calculator
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Calculate optimal position sizes for risk management
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="presets">Risk Presets</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Trading Parameters</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Account Settings */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">Account Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="balance">Account Balance ($)</Label>
                        <Input
                          id="balance"
                          type="number"
                          value={accountBalance}
                          onChange={(e) => setAccountBalance(e.target.value)}
                          placeholder="10000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="risk">Risk Percentage (%)</Label>
                        <Input
                          id="risk"
                          type="number"
                          step="0.1"
                          value={riskPercentage}
                          onChange={(e) => setRiskPercentage(e.target.value)}
                          placeholder="2"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="accountType">Account Type</Label>
                      <Select value={accountType} onValueChange={setAccountType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard (1 lot = 100,000)</SelectItem>
                          <SelectItem value="mini">Mini (1 lot = 10,000)</SelectItem>
                          <SelectItem value="micro">Micro (1 lot = 1,000)</SelectItem>
                          <SelectItem value="nano">Nano (1 lot = 100)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* Trade Settings */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">Trade Settings</h3>
                    <div>
                      <Label htmlFor="pair">Currency Pair</Label>
                      <Select value={selectedPair} onValueChange={setSelectedPair}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCY_PAIRS.map((pair) => (
                            <SelectItem key={pair.symbol} value={pair.symbol}>
                              {pair.symbol}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="entry">Entry Price *</Label>
                        <Input
                          id="entry"
                          type="number"
                          step="0.00001"
                          value={entryPrice}
                          onChange={(e) => setEntryPrice(e.target.value)}
                          placeholder="1.08500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="stopLoss">Stop Loss *</Label>
                        <Input
                          id="stopLoss"
                          type="number"
                          step="0.00001"
                          value={stopLoss}
                          onChange={(e) => setStopLoss(e.target.value)}
                          placeholder="1.08000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="takeProfit">Take Profit (Optional)</Label>
                        <Input
                          id="takeProfit"
                          type="number"
                          step="0.00001"
                          value={takeProfit}
                          onChange={(e) => setTakeProfit(e.target.value)}
                          placeholder="1.09500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button onClick={calculatePositionSize} className="flex-1">
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate
                    </Button>
                    <Button variant="outline" onClick={resetCalculator}>
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Calculation Results</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result ? (
                    <div className="space-y-6">
                      {/* Main Results */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Position Size</h3>
                          <p className="text-2xl font-bold text-blue-600">
                            {result.recommendedLotSize?.toFixed(2)} lots
                          </p>
                          <p className="text-xs text-gray-500">
                            {result.positionSize.toFixed(0)} units
                          </p>
                        </div>
                        <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Dollar Risk</h3>
                          <p className={`text-2xl font-bold ${getRiskColor(result.percentRisk)}`}>
                            ${result.dollarRisk.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {result.percentRisk}% of account
                          </p>
                        </div>
                      </div>

                      <Separator />

                      {/* Risk/Reward Analysis */}
                      {result.riskRewardRatio > 0 && (
                        <div className="space-y-3">
                          <h3 className="font-medium text-gray-900 dark:text-white">Risk/Reward Analysis</h3>
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Potential Profit</p>
                              <p className="font-bold text-green-600">
                                ${result.potentialProfit.toFixed(2)}
                              </p>
                            </div>
                            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Potential Loss</p>
                              <p className="font-bold text-red-600">
                                ${result.potentialLoss.toFixed(2)}
                              </p>
                            </div>
                            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded">
                              <p className="text-sm text-gray-600 dark:text-gray-400">R:R Ratio</p>
                              <p className={`font-bold ${getRiskRewardColor(result.riskRewardRatio)}`}>
                                1:{result.riskRewardRatio.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Risk Assessment */}
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">Risk Assessment</h3>
                        {result.percentRisk <= 1 && (
                          <Alert>
                            <Shield className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Conservative Risk:</strong> Your risk level is very conservative. Good for capital preservation.
                            </AlertDescription>
                          </Alert>
                        )}
                        {result.percentRisk > 1 && result.percentRisk <= 2 && (
                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Moderate Risk:</strong> This is a balanced risk level suitable for most traders.
                            </AlertDescription>
                          </Alert>
                        )}
                        {result.percentRisk > 2 && result.percentRisk <= 3 && (
                          <Alert>
                            <TrendingUp className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Aggressive Risk:</strong> Higher risk level. Make sure you're comfortable with potential losses.
                            </AlertDescription>
                          </Alert>
                        )}
                        {result.percentRisk > 3 && (
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>High Risk:</strong> This risk level is very high and could lead to significant losses.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Ready to Calculate
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Fill in the trading parameters and click calculate to see your optimal position size
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="presets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Level Presets</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Quick presets for different risk tolerance levels
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {PRESET_RISK_LEVELS.map((preset) => (
                    <Card
                      key={preset.label}
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        parseFloat(riskPercentage) === preset.value
                          ? 'ring-2 ring-blue-500'
                          : ''
                      }`}
                      onClick={() => setRiskPercentage(preset.value.toString())}
                    >
                      <CardContent className="p-4 text-center">
                        <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-content-center bg-${preset.color}-100 dark:bg-${preset.color}-950/20`}>
                          <Shield className={`h-6 w-6 text-${preset.color}-600`} />
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {preset.label}
                        </h3>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                          {preset.value}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Risk per trade
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Why Position Sizing Matters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Position sizing is one of the most critical aspects of trading. It determines how much of your capital you risk on each trade and directly impacts your long-term profitability.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-medium">Key Benefits:</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                      <li>• Protects your capital from large losses</li>
                      <li>• Ensures consistent risk across all trades</li>
                      <li>• Allows for long-term growth</li>
                      <li>• Reduces emotional trading decisions</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Management Rules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-green-600">1% Rule</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Never risk more than 1% of your account on a single trade. This is considered the safest approach.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-yellow-600">2% Rule</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        A balanced approach allowing for slightly higher returns while maintaining reasonable risk.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-600">3%+ Rule</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        High-risk approach that should only be used by experienced traders with proven strategies.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk/Reward Ratios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    The risk/reward ratio compares your potential profit to your potential loss.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-950/20 rounded">
                      <span className="text-sm font-medium">1:2 Ratio</span>
                      <Badge className="bg-green-500 text-white">Excellent</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                      <span className="text-sm font-medium">1:1.5 Ratio</span>
                      <Badge className="bg-yellow-500 text-white">Good</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-950/20 rounded">
                      <span className="text-sm font-medium">1:1 Ratio</span>
                      <Badge className="bg-red-500 text-white">Minimum</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Calculator Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">Accurate Entry & Stop Loss</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Use precise entry and stop loss levels based on technical analysis for accurate calculations.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Account Type Selection</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Choose the correct account type (standard, mini, micro) to get accurate lot size calculations.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Review Before Trading</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Always double-check calculations and ensure the position size fits your risk tolerance.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}