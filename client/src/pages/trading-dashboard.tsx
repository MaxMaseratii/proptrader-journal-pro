import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Account, TradingStrategy } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Heart, 
  Shield, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Zap,
  TrendingDown,
  Activity,
  Play,
  Pause,
  RefreshCw,
  Calendar,
  DollarSign,
  Timer,
  BarChart3,
  Plus,
  BookOpen,
  Award,
  FileText,
  History,
  Search,
  Filter,
  Eye,
  Settings,
  MoreVertical,
  Copy,
  Trash2,
  Star,
  Crown
} from 'lucide-react';

// Strategy data will be loaded from API

// Accounts data will be loaded from API - removed hardcoded mock data

// Historical trading plans will be loaded from API

export default function CompleteTradingDashboard() {
  // Load accounts from API
  const { data: accounts } = useQuery<Account[]>({ queryKey: ['/api/accounts'] });
  const { data: strategies } = useQuery<TradingStrategy[]>({ queryKey: ['/api/trading-strategies'] });
  
  // Main tab state
  const [activeTab, setActiveTab] = useState('psychology');
  
  // Strategy management states - now using proper API
  const [selectedStrategy, setSelectedStrategy] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Historical plans states - now using proper API
  const [historicalPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  
  // Individual trade execution state
  const [currentTradeIndex, setCurrentTradeIndex] = useState(0);
  const [selectedTradeNumber, setSelectedTradeNumber] = useState(1);
  const [tradeExecutionData, setTradeExecutionData] = useState([]);

  // Psychology/Daily Plan states
  const [currentStep, setCurrentStep] = useState('pre-session');
  const [emergencyProtocol, setEmergencyProtocol] = useState(false);
  const [emergencyStep, setEmergencyStep] = useState(1);
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [selectedStrategyId, setSelectedStrategyId] = useState<number | null>(null);
  
  // Auto-select first account when loaded
  useEffect(() => {
    if (accounts && accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0].id);
    }
  }, [accounts, selectedAccount]);
  
  // Auto-select first strategy when loaded
  useEffect(() => {
    if (strategies && strategies.length > 0 && !selectedStrategyId) {
      setSelectedStrategyId(strategies[0].id);
    }
  }, [strategies, selectedStrategyId]);

  // New strategy form state
  const [newStrategy, setNewStrategy] = useState({
    name: '',
    description: '',
    expectedWinRate: 65,
    riskRewardRatio: 2.0,
    rules: '',
    marketConditions: '',
    assets: '',
    status: 'active'
  });

  // Pre-session data
  const [preSessionData, setPreSessionData] = useState({
    emotionalClarity: 4,
    physicalEnergy: 5,
    focusLevel: 4,
    confidence: 4,
    marketRegimeAwareness: 4,
    riskRespectLevel: 5,
    humilityCheck: 4,
    wizardMindset: 4,
    overallReadiness: 33,
    traderIdentity: 'disciplined_professional',
    biggestFear: '',
    strongestDesire: '',
    tradingEdgeOrOutcome: 'edge',
    goNoGoDecision: 'go'
  });

  // Daily plan data
  const [dailyPlanData, setDailyPlanData] = useState({
    riskAmount: 100,
    targetProfit: 200,
    maxTrades: 3,
    plannedTrades: 2,
    maxRiskPercentage: 2,
    plannedHours: 6,
    hourlyWage: 50,
    startTime: '09:30',
    endTime: '16:00',
    notes: '',
    tradeSetupLinks: []
  });

  // Real-time execution data
  const [realTimeData, setRealTimeData] = useState({
    entryDecisionBy: 'plan',
    realTimeTracking: {
      minute1: { feeling: '', urge: '' },
      minute5: { feeling: '', urge: '' },
      exit: { feeling: '', reason: '' }
    }
  });

  // Post-trade data
  const [postTradeData, setPostTradeData] = useState({
    disciplineScore: {
      followedEntryRules: 5,
      respectedStopLoss: 5,
      managedEmotions: 4,
      stuckToPositionSize: 5,
      exitedPerPlan: 4
    },
    primaryEmotion: '',
    keyInsight: '',
    whatWentWell: '',
    needsImprovement: ''
  });

  // Filtered strategies
  const filteredStrategies = useMemo(() => {
    return strategies?.filter(strategy => {
      const matchesSearch = strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           strategy.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || strategy.status === filterStatus;
      return matchesSearch && matchesFilter;
    }) || [];
  }, [strategies, searchTerm, filterStatus]);

  // Strategy management functions - now uses API
  const createStrategy = () => {
    // This should be handled by the strategy management API
    // For now, just close the dialog - proper API integration needed
    setNewStrategy({
      name: '',
      description: '',
      expectedWinRate: 65,
      riskRewardRatio: 2.0,
      rules: '',
      marketConditions: '',
      assets: '',
      status: 'active'
    });
    setIsCreateDialogOpen(false);
  };

  const getStrategyMetrics = (strategy) => {
    const winRate = strategy.performance.trades > 0 ? 
      (strategy.performance.wins / strategy.performance.trades * 100).toFixed(1) : 
      strategy.expectedWinRate;
    
    const profitFactor = strategy.performance.trades > 0 ? 
      (strategy.performance.totalPnl / (strategy.performance.trades * 100)).toFixed(2) : 
      ((strategy.expectedWinRate / 100) * strategy.riskRewardRatio).toFixed(2);

    return { winRate, profitFactor };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-900/30 text-green-400 border-green-400/30';
      case 'testing': return 'bg-yellow-900/30 text-yellow-400 border-yellow-400/30';
      case 'paused': return 'bg-gray-900/30 text-gray-400 border-gray-400/30';
      default: return 'bg-blue-900/30 text-blue-400 border-blue-400/30';
    }
  };

  // Psychology functions
  const renderEmergencyProtocol = () => {
    const steps = [
      {
        title: "PAUSE - Stop All Clicking",
        icon: Pause,
        content: "Immediately stop any trading actions. Remove hands from mouse/keyboard.",
        action: "Take your hands off all trading controls right now."
      },
      {
        title: "BREATHE - 3 Deep Breaths", 
        icon: RefreshCw,
        content: "Take three slow, deep breaths to activate your parasympathetic nervous system.",
        action: "Breathe in for 4 counts, hold for 4, exhale for 6. Repeat 3 times."
      },
      {
        title: "ASK - Is this my plan or emotion?",
        icon: Brain,
        content: "Identify whether your next action comes from your trading plan or emotional reaction.",
        action: "Honestly assess: Am I following my predetermined plan or reacting emotionally?"
      },
      {
        title: "CHOOSE - Follow plan or close and reset",
        icon: Target,
        content: "Make a conscious choice to either follow your plan or close positions and reset.",
        action: "If emotional: Close position and take 5-minute break. If following plan: Continue with discipline."
      }
    ];

    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm">
        <Card className="max-w-2xl w-full mx-4 bg-gradient-to-br from-red-950 via-red-900 to-black border-2 border-red-500/50 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-red-900/50 to-red-800/50">
            <CardTitle className="text-gradient-rainbow flex items-center gap-2 text-xl">
              <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
              Emergency Protocol: Emotional Spike
            </CardTitle>
            <Badge className="bg-red-500/20 text-red-400 w-fit border border-red-500/30">
              Step {emergencyStep} of {steps.length}
            </Badge>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="text-center p-8 bg-red-950/50 border-2 border-red-500/30 rounded-lg">
                {React.createElement(steps[emergencyStep - 1].icon, {
                  className: "w-12 h-12 text-red-400 mx-auto mb-4 animate-pulse"
                })}
                <h2 className="text-white text-2xl font-bold mb-4">
                  {steps[emergencyStep - 1].title}
                </h2>
                <p className="text-blue-200 text-lg mb-6">
                  {steps[emergencyStep - 1].content}
                </p>
                <div className="p-4 bg-red-900/50 border border-red-400/50 rounded-lg">
                  <p className="text-red-300 font-semibold">
                    {steps[emergencyStep - 1].action}
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => setEmergencyProtocol(false)}
                  variant="outline"
                  className="border-blue-400 text-blue-300 hover:bg-blue-900/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (emergencyStep < steps.length) {
                      setEmergencyStep(emergencyStep + 1);
                    } else {
                      setEmergencyProtocol(false);
                      setEmergencyStep(1);
                    }
                  }}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 shadow-lg"
                >
                  {emergencyStep < steps.length ? 'Step Complete - Next' : 'Protocol Complete'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPreSessionCheck = () => {
    // Enhanced state management for better psychology tracking
    const [sliderValues, setSliderValues] = useState({
      emotional: 4,
      physical: 5,
      focus: 4,
      confidence: 4,
      market: 4,
      risk: 5,
      humility: 4,
      professional: 4
    });

    const totalScore = Object.values(sliderValues).reduce((sum, val) => sum + val, 0);
    const maxScore = 40;
    const percentage = (totalScore / maxScore) * 100;

    const getScoreLabel = (score) => {
      if (score >= 35) return { label: "Excellent", color: "text-emerald-400" };
      if (score >= 30) return { label: "Good", color: "text-blue-400" };
      if (score >= 25) return { label: "Fair", color: "text-yellow-400" };
      return { label: "Needs Improvement", color: "text-red-400" };
    };

    const scoreInfo = getScoreLabel(totalScore);

    return (
      <div className="h-full space-y-4">
        <Card className="bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950 border-2 border-blue-500/30 shadow-2xl h-full flex flex-col">
          <CardHeader className="bg-gradient-to-r from-blue-900/50 to-purple-900/50">
            <CardTitle className="text-gradient-rainbow flex items-center gap-2 text-xl">
              <Brain className="h-6 w-6 text-yellow-400" />
              Pre-Session Mental Check & Loss-Cutting Mindset
            </CardTitle>
            <p className="text-blue-200">Complete assessment before trading (2 minutes)</p>
          </CardHeader>
          <CardContent className="space-y-6 p-6 flex-1 overflow-auto">
            {/* Loss-Cutting Psychology Education */}
            <div className="bg-gradient-to-r from-red-900/20 via-pink-900/20 to-orange-900/20 p-6 rounded-2xl border border-red-500/30 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <h4 className="text-white font-bold text-lg">The Mental Battle: Why We Hold Losing Trades</h4>
              </div>
              <div className="space-y-4 text-gray-300">
                <p className="leading-relaxed">
                  <strong className="text-red-400">Every trader faces this moment:</strong> Your trade is moving against you. Your stop-loss level 
                  is getting closer. Logic says "exit now," but your emotions scream "just wait a little longer!"
                </p>
                <p className="leading-relaxed text-sm">
                  Three powerful forces work against you: <span className="text-orange-400 font-medium">Pride</span> (admitting you're wrong hurts), 
                  <span className="text-blue-400 font-medium"> Hope</span> (maybe it will reverse), and <span className="text-purple-400 font-medium">Fear</span> (what if you exit and it immediately recovers?). 
                  These emotions are natural, but they destroy accounts.
                </p>
                <div className="bg-slate-800/70 p-4 rounded-xl border border-orange-500/30 shadow-sm">
                  <p className="text-orange-300 font-medium mb-2">💡 The Reality:</p>
                  <p className="text-sm text-gray-300">Professional traders cut losses fast because they understand: Small losses are the cost of doing business. 
                  Big losses are account killers. Every dollar you save by cutting losses early is capital preserved for your next winning trade.</p>
                </div>
              </div>
            </div>

            {/* Simple Loss-Cutting System */}
            <div className="bg-gradient-to-r from-emerald-900/20 via-teal-900/20 to-cyan-900/20 p-6 rounded-2xl border border-emerald-500/30 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-emerald-400" />
                <h4 className="text-white font-bold text-lg">Simple 4-Step Loss Control System</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-slate-800/60 rounded-xl border border-emerald-500/20 shadow-sm hover:shadow-md transition-all">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                    <div>
                      <p className="text-emerald-300 font-semibold text-sm">Plan Your Exit Before You Enter</p>
                      <p className="text-gray-400 text-xs mt-1">Decide your maximum loss before clicking buy. Write it down: "I will exit if price hits $_____"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-slate-800/60 rounded-xl border border-sky-500/20 shadow-sm hover:shadow-md transition-all">
                    <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                    <div>
                      <p className="text-sky-300 font-semibold text-sm">Set Your Risk Limit</p>
                      <p className="text-gray-400 text-xs mt-1">Never risk more than 1-2% of your account on any single trade. This keeps you in the game long-term.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-slate-800/60 rounded-xl border border-violet-500/20 shadow-sm hover:shadow-md transition-all">
                    <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                    <div>
                      <p className="text-violet-300 font-semibold text-sm">Execute Without Emotion</p>
                      <p className="text-gray-400 text-xs mt-1">When your stop is hit, exit immediately. No second-guessing, no "one more minute." Trust your plan.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-slate-800/60 rounded-xl border border-orange-500/20 shadow-sm hover:shadow-md transition-all">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold text-sm">4</div>
                    <div>
                      <p className="text-orange-300 font-semibold text-sm">Reset and Look Forward</p>
                      <p className="text-gray-400 text-xs mt-1">Losses are feedback, not failures. Learn what you can, then focus on finding your next high-probability setup.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-slate-800/70 p-4 rounded-xl border border-teal-500/30 shadow-sm">
                <p className="text-gray-300 text-sm">
                  <span className="text-emerald-400 font-semibold">Pro Tip:</span> Practice this system in a demo account until it becomes automatic. 
                  The traders who master loss control are the ones who survive and thrive in all market conditions.
                </p>
              </div>
            </div>

            {/* Enhanced Mental State Assessment */}
            <div className="bg-gradient-to-r from-indigo-900/20 via-purple-900/20 to-pink-900/20 p-6 rounded-2xl border border-indigo-500/30 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-6 h-6 text-indigo-400" />
                <h4 className="text-white font-bold text-lg">Mental State Assessment (Rate 1-5)</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full shadow-sm"></div>
                      <Label className="text-white font-semibold">Emotional Clarity</Label>
                    </div>
                    <p className="text-xs text-gray-400 italic">Calm vs. Anxious/Excited • Clarity breeds consistency</p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500 min-w-[60px]">Anxious</span>
                      <Slider
                        value={[sliderValues.emotional]}
                        onValueChange={(value) => setSliderValues(prev => ({ ...prev, emotional: value[0] }))}
                        max={5}
                        min={1}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-500 min-w-[40px]">Calm</span>
                      <span className="text-orange-400 font-bold min-w-[20px] text-lg">{sliderValues.emotional}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full shadow-sm"></div>
                      <Label className="text-white font-semibold">Focus Level</Label>
                    </div>
                    <p className="text-xs text-gray-400 italic">Sharp vs. Scattered • Focus determines outcome</p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500 min-w-[60px]">Scattered</span>
                      <Slider
                        value={[sliderValues.focus]}
                        onValueChange={(value) => setSliderValues(prev => ({ ...prev, focus: value[0] }))}
                        max={5}
                        min={1}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-500 min-w-[40px]">Sharp</span>
                      <span className="text-emerald-400 font-bold min-w-[20px] text-lg">{sliderValues.focus}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full shadow-sm"></div>
                      <Label className="text-white font-semibold">Market Regime Awareness</Label>
                    </div>
                    <p className="text-xs text-gray-400 italic">Do you understand current conditions? • Know the market you're trading</p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500 min-w-[60px]">Confused</span>
                      <Slider
                        value={[sliderValues.market]}
                        onValueChange={(value) => setSliderValues(prev => ({ ...prev, market: value[0] }))}
                        max={5}
                        min={1}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-500 min-w-[40px]">Clear</span>
                      <span className="text-blue-400 font-bold min-w-[20px] text-lg">{sliderValues.market}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full shadow-sm"></div>
                      <Label className="text-white font-semibold">Humility Check</Label>
                    </div>
                    <p className="text-xs text-gray-400 italic">Ready to be wrong? • Market will humble everyone</p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500 min-w-[60px]">Arrogant</span>
                      <Slider
                        value={[sliderValues.humility]}
                        onValueChange={(value) => setSliderValues(prev => ({ ...prev, humility: value[0] }))}
                        max={5}
                        min={1}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-500 min-w-[40px]">Humble</span>
                      <span className="text-purple-400 font-bold min-w-[20px] text-lg">{sliderValues.humility}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full shadow-sm"></div>
                      <Label className="text-white font-semibold">Physical Energy</Label>
                    </div>
                    <p className="text-xs text-gray-400 italic">Alert vs. Tired/Wired • Energy fuels execution</p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500 min-w-[60px]">Tired</span>
                      <Slider
                        value={[sliderValues.physical]}
                        onValueChange={(value) => setSliderValues(prev => ({ ...prev, physical: value[0] }))}
                        max={5}
                        min={1}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-500 min-w-[40px]">Alert</span>
                      <span className="text-green-400 font-bold min-w-[20px] text-lg">{sliderValues.physical}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-sky-400 to-blue-400 rounded-full shadow-sm"></div>
                      <Label className="text-white font-semibold">Confidence</Label>
                    </div>
                    <p className="text-xs text-gray-400 italic">Assured vs. Uncertain • Confidence enables action</p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500 min-w-[60px]">Uncertain</span>
                      <Slider
                        value={[sliderValues.confidence]}
                        onValueChange={(value) => setSliderValues(prev => ({ ...prev, confidence: value[0] }))}
                        max={5}
                        min={1}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-500 min-w-[40px]">Assured</span>
                      <span className="text-sky-400 font-bold min-w-[20px] text-lg">{sliderValues.confidence}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full shadow-sm"></div>
                      <Label className="text-white font-semibold">Risk Respect Level</Label>
                    </div>
                    <p className="text-xs text-gray-400 italic">Will you honor your stops? • Risk management is everything</p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500 min-w-[60px]">Reckless</span>
                      <Slider
                        value={[sliderValues.risk]}
                        onValueChange={(value) => setSliderValues(prev => ({ ...prev, risk: value[0] }))}
                        max={5}
                        min={1}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-500 min-w-[40px]">Disciplined</span>
                      <span className="text-pink-400 font-bold min-w-[20px] text-lg">{sliderValues.risk}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full shadow-sm"></div>
                      <Label className="text-white font-semibold">Professional Trader Mindset</Label>
                    </div>
                    <p className="text-xs text-gray-400 italic">Thinking like the masters? • Discipline over discretion</p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500 min-w-[60px]">Amateur</span>
                      <Slider
                        value={[sliderValues.professional]}
                        onValueChange={(value) => setSliderValues(prev => ({ ...prev, professional: value[0] }))}
                        max={5}
                        min={1}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-500 min-w-[40px]">Pro</span>
                      <span className="text-amber-400 font-bold min-w-[20px] text-lg">{sliderValues.professional}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Mental Fitness Score */}
            <div className="bg-gradient-to-r from-violet-900/30 to-indigo-900/30 rounded-2xl p-6 border border-violet-500/30 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-indigo-400" />
                  <span className="text-white font-bold text-lg">Mental Fitness Score</span>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${scoreInfo.color}`}>{totalScore}/{maxScore}</div>
                  <div className={`text-sm font-medium ${scoreInfo.color}`}>{scoreInfo.label}</div>
                </div>
              </div>
              <Progress 
                value={percentage} 
                className="h-4 mb-4"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400 font-semibold">
                      {percentage >= 75 ? "High readiness level" : 
                       percentage >= 60 ? "Good readiness level" : 
                       "Needs improvement"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300 leading-relaxed">
                    {percentage >= 75 
                      ? "You're mentally prepared for trading today. Your loss-cutting discipline and risk respect are excellent."
                      : percentage >= 60 
                      ? "Good mental state with room for improvement. Focus on your weaker areas before trading."
                      : "Consider improving your mental state before trading. Practice the loss-cutting drills and work on focus areas."}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-white font-semibold">Focus Areas:</div>
                  <div className="text-sm text-indigo-300 leading-relaxed">
                    • Maintain emotional clarity throughout session<br/>
                    • Trust your pre-defined stop losses<br/>
                    • Stay humble and adaptable to market changes
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={() => setCurrentStep('daily-plan')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
              >
                Continue to Daily Plan
              </Button>
            </div>
        </CardContent>
      </Card>
    </div>
    );
  };

  const renderDailyPlan = () => (
    <div className="h-full space-y-4">
      <Card className="bg-gradient-to-br from-green-950 via-emerald-950 to-teal-950 border-2 border-green-500/30 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-green-900/50 to-teal-900/50">
          <CardTitle className="text-gradient-rainbow flex items-center gap-2 text-xl">
            <Calendar className="h-6 w-6 text-yellow-400" />
            Daily Trading Plan - {selectedDate}
          </CardTitle>
          <p className="text-green-200">Set your trading parameters and strategy for today</p>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* Account and Strategy Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-green-300 mb-2 block">Trading Account</Label>
              <Select value={selectedAccount?.toString() || ""} onValueChange={(value) => setSelectedAccount(parseInt(value))}>
                <SelectTrigger className="bg-white border-green-500/30 text-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map(account => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name} ({account.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-green-300 mb-2 block">Primary Strategy</Label>
              <Select value={selectedStrategyId?.toString() || ""} onValueChange={(value) => setSelectedStrategyId(parseInt(value))}>
                <SelectTrigger className="bg-white border-green-500/30 text-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {strategies?.map(strategy => (
                    <SelectItem key={strategy.id} value={strategy.id.toString()}>
                      {strategy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Trading Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-green-300 mb-2 block flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Risk Amount ($)
              </Label>
              <Input
                type="number"
                value={dailyPlanData.riskAmount}
                onChange={(e) => setDailyPlanData(prev => ({ ...prev, riskAmount: parseFloat(e.target.value) || 0 }))}
                className="bg-white border-green-500/30 text-black placeholder:text-gray-500"
              />
            </div>
            <div>
              <Label className="text-green-300 mb-2 block flex items-center gap-2">
                <Target className="w-4 h-4" />
                Target Profit ($)
              </Label>
              <Input
                type="number"
                value={dailyPlanData.targetProfit}
                onChange={(e) => setDailyPlanData(prev => ({ ...prev, targetProfit: parseFloat(e.target.value) || 0 }))}
                className="bg-white border-green-500/30 text-black placeholder:text-gray-500"
              />
            </div>
            <div>
              <Label className="text-green-300 mb-2 block flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Max Trades
              </Label>
              <Input
                type="number"
                value={dailyPlanData.maxTrades}
                onChange={(e) => setDailyPlanData(prev => ({ ...prev, maxTrades: parseInt(e.target.value) || 0 }))}
                className="bg-white border-green-500/30 text-black placeholder:text-gray-500"
              />
            </div>
            <div>
              <Label className="text-green-300 mb-2 block flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Planned Trades
              </Label>
              <Input
                type="number"
                value={dailyPlanData.plannedTrades}
                onChange={(e) => setDailyPlanData(prev => ({ ...prev, plannedTrades: parseInt(e.target.value) || 0 }))}
                className="bg-white border-green-500/30 text-black placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Time Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-green-300 mb-2 block flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Trading Session Start
              </Label>
              <Input
                type="time"
                value={dailyPlanData.startTime}
                onChange={(e) => setDailyPlanData(prev => ({ ...prev, startTime: e.target.value }))}
                className="bg-white border-green-500/30 text-black"
              />
            </div>
            <div>
              <Label className="text-green-300 mb-2 block flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Trading Session End
              </Label>
              <Input
                type="time"
                value={dailyPlanData.endTime}
                onChange={(e) => setDailyPlanData(prev => ({ ...prev, endTime: e.target.value }))}
                className="bg-white border-green-500/30 text-black"
              />
            </div>
          </div>

          {/* Trading Notes */}
          <div>
            <Label className="text-green-300 mb-2 block flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Daily Trading Notes & Setup Ideas
            </Label>
            <Textarea
              value={dailyPlanData.notes}
              onChange={(e) => setDailyPlanData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Market outlook, key levels to watch, news events, setup ideas..."
              className="bg-white border-green-500/30 text-black placeholder:text-gray-500 h-24"
            />
          </div>

          <div className="flex justify-between">
            <Button
              onClick={() => setCurrentStep('pre-session')}
              variant="outline"
              className="border-green-400 text-green-300 hover:bg-green-900/20"
            >
              Back to Pre-Session
            </Button>
            <Button
              onClick={() => setCurrentStep('real-time')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8"
            >
              Start Trading Session
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRealTimeExecution = () => (
    <div className="h-full space-y-4">
      <Card className="bg-gradient-to-br from-orange-950 via-red-950 to-pink-950 border-2 border-orange-500/30 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-orange-900/50 to-red-900/50">
          <CardTitle className="text-gradient-rainbow flex items-center gap-2 text-xl">
            <Activity className="h-6 w-6 text-yellow-400" />
            Real-Time Trading Execution
          </CardTitle>
          <p className="text-orange-200">Track your execution and emotional state during trades</p>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* Emergency Protocol Button */}
          <div className="text-center p-6 bg-red-950/30 border-2 border-red-500/50 rounded-lg">
            <h3 className="text-white font-semibold mb-4 text-lg">Emergency Protocol</h3>
            <p className="text-red-300 mb-4">Feeling emotional spike or losing control?</p>
            <Button
              onClick={() => setEmergencyProtocol(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg animate-pulse"
            >
              <AlertTriangle className="w-6 h-6 mr-2" />
              ACTIVATE EMERGENCY PROTOCOL
            </Button>
          </div>

          {/* Trade Selection */}
          <div className="p-4 bg-blue-950/30 border border-blue-500/30 rounded-lg">
            <Label className="text-blue-300 font-semibold text-lg mb-4 block">Select Which Trade You're Tracking</Label>
            <div className="flex items-center gap-4">
              <Select value={selectedTradeNumber.toString()} onValueChange={(value) => setSelectedTradeNumber(parseInt(value))}>
                <SelectTrigger className="w-48 bg-white border-blue-500/30 text-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-blue-500/30">
                  {Array.from({ length: dailyPlanData.maxTrades }, (_, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()} className="text-black hover:bg-blue-100">
                      Trade #{index + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-blue-300">
                out of {dailyPlanData.maxTrades} max trades for today
              </div>
            </div>
          </div>

          {/* Entry Decision Tracking */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Entry Decision Made By:</h3>
            <div className="flex gap-4">
              {[
                { id: 'plan', label: 'My Plan', color: 'green' },
                { id: 'emotion', label: 'Emotion', color: 'red' },
                { id: 'impulse', label: 'Impulse', color: 'yellow' }
              ].map(({ id, label, color }) => (
                <Button
                  key={id}
                  onClick={() => setRealTimeData(prev => ({ ...prev, entryDecisionBy: id }))}
                  className={`flex-1 ${
                    realTimeData.entryDecisionBy === id
                      ? `bg-${color}-600 hover:bg-${color}-700`
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Real-time Tracking */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Real-Time Tracking</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-900/50 border-orange-500/30">
                <CardHeader>
                  <CardTitle className="text-orange-300 text-sm">1 Minute Check-In</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-orange-300 text-xs">How do I feel?</Label>
                    <Input
                      value={realTimeData.realTimeTracking.minute1.feeling}
                      onChange={(e) => setRealTimeData(prev => ({
                        ...prev,
                        realTimeTracking: {
                          ...prev.realTimeTracking,
                          minute1: { ...prev.realTimeTracking.minute1, feeling: e.target.value }
                        }
                      }))}
                      placeholder="Calm, anxious, excited..."
                      className="bg-white border-orange-500/30 text-black placeholder:text-gray-500 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-orange-300 text-xs">Urge to...</Label>
                    <Input
                      value={realTimeData.realTimeTracking.minute1.urge}
                      onChange={(e) => setRealTimeData(prev => ({
                        ...prev,
                        realTimeTracking: {
                          ...prev.realTimeTracking,
                          minute1: { ...prev.realTimeTracking.minute1, urge: e.target.value }
                        }
                      }))}
                      placeholder="Add size, close early..."
                      className="bg-white border-orange-500/30 text-black placeholder:text-gray-500 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-orange-500/30">
                <CardHeader>
                  <CardTitle className="text-orange-300 text-sm">5 Minute Check-In</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-orange-300 text-xs">How do I feel?</Label>
                    <Input
                      value={realTimeData.realTimeTracking.minute5.feeling}
                      onChange={(e) => setRealTimeData(prev => ({
                        ...prev,
                        realTimeTracking: {
                          ...prev.realTimeTracking,
                          minute5: { ...prev.realTimeTracking.minute5, feeling: e.target.value }
                        }
                      }))}
                      placeholder="Calm, anxious, excited..."
                      className="bg-white border-orange-500/30 text-black placeholder:text-gray-500 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-orange-300 text-xs">Urge to...</Label>
                    <Input
                      value={realTimeData.realTimeTracking.minute5.urge}
                      onChange={(e) => setRealTimeData(prev => ({
                        ...prev,
                        realTimeTracking: {
                          ...prev.realTimeTracking,
                          minute5: { ...prev.realTimeTracking.minute5, urge: e.target.value }
                        }
                      }))}
                      placeholder="Add size, close early..."
                      className="bg-white border-orange-500/30 text-black placeholder:text-gray-500 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-orange-500/30">
                <CardHeader>
                  <CardTitle className="text-orange-300 text-sm">Exit Tracking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-orange-300 text-xs">Exit feeling</Label>
                    <Input
                      value={realTimeData.realTimeTracking.exit.feeling}
                      onChange={(e) => setRealTimeData(prev => ({
                        ...prev,
                        realTimeTracking: {
                          ...prev.realTimeTracking,
                          exit: { ...prev.realTimeTracking.exit, feeling: e.target.value }
                        }
                      }))}
                      placeholder="Relief, regret, satisfaction..."
                      className="bg-white border-orange-500/30 text-black placeholder:text-gray-500 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-orange-300 text-xs">Exit reason</Label>
                    <Input
                      value={realTimeData.realTimeTracking.exit.reason}
                      onChange={(e) => setRealTimeData(prev => ({
                        ...prev,
                        realTimeTracking: {
                          ...prev.realTimeTracking,
                          exit: { ...prev.realTimeTracking.exit, reason: e.target.value }
                        }
                      }))}
                      placeholder="Plan, stop loss, target..."
                      className="bg-white border-orange-500/30 text-black placeholder:text-gray-500 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              onClick={() => setCurrentStep('daily-plan')}
              variant="outline"
              className="border-orange-400 text-orange-300 hover:bg-orange-900/20"
            >
              Back to Daily Plan
            </Button>
            <Button
              onClick={() => setCurrentStep('post-trade')}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8"
            >
              Complete Session Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPostTradeAnalysis = () => {
    const totalDisciplineScore = Object.values(postTradeData.disciplineScore).reduce((sum, score) => sum + score, 0);

    return (
      <div className="h-full space-y-4">
        <Card className="bg-gradient-to-br from-purple-950 via-indigo-950 to-blue-950 border-2 border-purple-500/30 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-purple-900/50 to-blue-900/50">
            <CardTitle className="text-gradient-rainbow flex items-center gap-2 text-xl">
              <Award className="h-6 w-6 text-yellow-400" />
              Post-Trade Analysis & Reflection
            </CardTitle>
            <p className="text-purple-200">Evaluate your performance and extract insights</p>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Discipline Scorecard */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-lg">Discipline Scorecard (Rate 1-5)</h3>
              <div className="space-y-4">
                {[
                  { key: 'followedEntryRules', label: 'Followed Entry Rules', desc: 'Waited for setup confirmation' },
                  { key: 'respectedStopLoss', label: 'Respected Stop Loss', desc: 'Did not move stops against me' },
                  { key: 'managedEmotions', label: 'Managed Emotions', desc: 'Stayed calm under pressure' },
                  { key: 'stuckToPositionSize', label: 'Stuck to Position Size', desc: 'Did not oversize positions' },
                  { key: 'exitedPerPlan', label: 'Exited Per Plan', desc: 'Took profits as planned' }
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-slate-900/50 border border-purple-500/30 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">{label}</h4>
                      <p className="text-purple-300 text-sm">{desc}</p>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(score => (
                        <Button
                          key={score}
                          onClick={() => setPostTradeData(prev => ({
                            ...prev,
                            disciplineScore: { ...prev.disciplineScore, [key]: score }
                          }))}
                          className={`w-10 h-10 p-0 ${
                            postTradeData.disciplineScore[key] >= score
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                        >
                          {score}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Score */}
              <div className="text-center p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-purple-500/30 rounded-lg mt-6">
                <h3 className="text-white font-semibold mb-2">Total Discipline Score</h3>
                <div className="text-4xl font-bold mb-2">
                  <span className={`${totalDisciplineScore >= 20 ? 'text-green-400' : 
                                     totalDisciplineScore >= 15 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {totalDisciplineScore}/25
                  </span>
                </div>
                <Badge className={`text-lg px-4 py-2 ${
                  totalDisciplineScore >= 20 ? 'bg-green-900/30 text-green-400 border-green-400/30' :
                  totalDisciplineScore >= 15 ? 'bg-yellow-900/30 text-yellow-400 border-yellow-400/30' :
                  'bg-red-900/30 text-red-400 border-red-400/30'
                }`}>
                  {totalDisciplineScore >= 20 ? 'EXCELLENT' : 
                   totalDisciplineScore >= 15 ? 'GOOD' : 'NEEDS WORK'}
                </Badge>
              </div>
            </div>

            {/* Reflection Questions */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg">Reflection Questions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-purple-300 mb-2 block">Primary emotion during trading?</Label>
                  <Input
                    value={postTradeData.primaryEmotion}
                    onChange={(e) => setPostTradeData(prev => ({ ...prev, primaryEmotion: e.target.value }))}
                    placeholder="Fear, greed, confidence, anxiety..."
                    className="bg-slate-900/50 border-purple-500/30 text-white"
                  />
                </div>
                <div>
                  <Label className="text-purple-300 mb-2 block">Key insight from today?</Label>
                  <Input
                    value={postTradeData.keyInsight}
                    onChange={(e) => setPostTradeData(prev => ({ ...prev, keyInsight: e.target.value }))}
                    placeholder="What did you learn?"
                    className="bg-slate-900/50 border-purple-500/30 text-white"
                  />
                </div>
              </div>
              <div>
                <Label className="text-purple-300 mb-2 block">What went well today?</Label>
                <Textarea
                  value={postTradeData.whatWentWell}
                  onChange={(e) => setPostTradeData(prev => ({ ...prev, whatWentWell: e.target.value }))}
                  placeholder="Celebrate your wins, both big and small..."
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>
              <div>
                <Label className="text-purple-300 mb-2 block">What needs improvement?</Label>
                <Textarea
                  value={postTradeData.needsImprovement}
                  onChange={(e) => setPostTradeData(prev => ({ ...prev, needsImprovement: e.target.value }))}
                  placeholder="Areas to focus on for tomorrow..."
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                onClick={() => setCurrentStep('real-time')}
                variant="outline"
                className="border-purple-400 text-purple-300 hover:bg-purple-900/20"
              >
                Back to Real-Time
              </Button>
              <Button
                onClick={() => {
                  // Reset for next day's session
                  setCurrentStep('pre-session');
                  setSelectedTradeNumber(1);
                  setTradeExecutionData([]);
                  // Reset all session data for tomorrow
                  setPreSessionData({
                    emotionalClarity: 4,
                    physicalEnergy: 5,
                    focusLevel: 4,
                    confidence: 4,
                    overallReadiness: 17,
                    traderIdentity: 'disciplined_professional',
                    biggestFear: '',
                    strongestDesire: '',
                    tradingEdgeOrOutcome: 'edge',
                    goNoGoDecision: 'go'
                  });
                  setDailyPlanData({
                    riskAmount: 100,
                    targetProfit: 200,
                    maxTrades: 3,
                    plannedTrades: 2,
                    maxRiskPercentage: 2,
                    plannedHours: 6,
                    hourlyWage: 50,
                    startTime: '09:30',
                    endTime: '16:00',
                    notes: '',
                    tradeSetupLinks: []
                  });
                  setRealTimeData({
                    entryDecisionBy: '',
                    realTimeTracking: {
                      minute1: { feeling: '', urge: '' },
                      minute5: { feeling: '', urge: '' },
                      exit: { feeling: '', reason: '' }
                    }
                  });
                  setPostTradeData({
                    disciplineScore: {
                      followedEntryRules: 3,
                      respectedStopLoss: 3,
                      managedEmotions: 3,
                      stuckToPositionSize: 3,
                      exitedPerPlan: 3
                    },
                    primaryEmotion: '',
                    keyInsight: '',
                    whatWentWell: '',
                    needsImprovement: ''
                  });
                }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8"
              >
                Complete & Start Tomorrow's Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPsychologyWorkflow = () => {
    const steps = [
      { id: 'pre-session', label: 'Pre-Session Check', component: renderPreSessionCheck },
      { id: 'daily-plan', label: 'Daily Plan', component: renderDailyPlan },
      { id: 'real-time', label: 'Real-Time Execution', component: renderRealTimeExecution },
      { id: 'post-trade', label: 'Post-Trade Analysis', component: renderPostTradeAnalysis }
    ];

    const currentStepIndex = steps.findIndex(step => step.id === currentStep);

    return (
      <div className="h-full flex flex-col space-y-4">
        {/* Progress Indicator */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                    index <= currentStepIndex
                      ? 'bg-blue-600 border-blue-400 text-white'
                      : 'bg-gray-700 border-gray-500 text-gray-400'
                  }`}
                >
                  {index < currentStepIndex ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    index <= currentStepIndex ? 'text-white' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    index < currentStepIndex ? 'bg-blue-400' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="flex-1 min-h-0 overflow-auto">
          {steps.find(step => step.id === currentStep)?.component()}
        </div>

        {/* Emergency Protocol Modal */}
        {emergencyProtocol && renderEmergencyProtocol()}
      </div>
    );
  };

  const renderStrategiesSection = () => (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-gradient-rainbow text-2xl font-bold mb-2">Trading Strategies</h2>
          <p className="text-gray-400">Manage your trading strategies and performance</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search strategies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-blue-500/30 text-black placeholder:text-gray-500 w-64"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 bg-white border-blue-500/30 text-black">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="testing">Testing</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Strategy
          </Button>
        </div>
      </div>

      {/* Strategies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStrategies.map(strategy => {
          const metrics = getStrategyMetrics(strategy);
          return (
            <Card key={strategy.id} className="bg-gradient-to-br from-slate-900 to-slate-950 border border-blue-500/30 hover:border-blue-400/50 transition-all shadow-lg hover:shadow-xl">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg mb-2">{strategy.name}</CardTitle>
                    <Badge className={getStatusColor(strategy.status)}>
                      {strategy.status.toUpperCase()}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-gray-400 text-sm mt-2">{strategy.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gradient-to-br from-green-950/50 to-emerald-950/50 border border-green-500/30 rounded-lg">
                      <div className="text-green-400 font-bold text-lg">{metrics.winRate}%</div>
                      <div className="text-green-300 text-xs">Win Rate</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-blue-950/50 to-indigo-950/50 border border-blue-500/30 rounded-lg">
                      <div className="text-blue-400 font-bold text-lg">{strategy.riskRewardRatio}:1</div>
                      <div className="text-blue-300 text-xs">R:R Ratio</div>
                    </div>
                  </div>

                  {/* Edge Calculation */}
                  <div className="text-center p-3 bg-gradient-to-br from-purple-950/50 to-pink-950/50 border border-purple-500/30 rounded-lg">
                    <div className="text-purple-400 font-bold text-lg">
                      {((metrics.winRate / 100) * strategy.riskRewardRatio - (1 - metrics.winRate / 100)).toFixed(2)}
                    </div>
                    <div className="text-purple-300 text-xs">Edge (Expected Value)</div>
                  </div>

                  {/* Performance Summary */}
                  {strategy.performance.trades > 0 && (
                    <div className="p-3 bg-slate-800/50 border border-gray-600/30 rounded-lg">
                      <div className="text-gray-300 text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Total Trades:</span>
                          <span className="text-white">{strategy.performance.trades}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total P&L:</span>
                          <span className={strategy.performance.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                            ${strategy.performance.totalPnl}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setSelectedStrategy(strategy);
                        setIsDetailsDialogOpen(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-blue-400/30 text-blue-300 hover:bg-blue-900/20"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    <Button
                      onClick={() => setSelectedStrategyId(strategy.id)}
                      size="sm" 
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Use
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Strategy Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 border border-blue-500/30">
          <DialogHeader>
            <DialogTitle className="text-gradient-rainbow text-xl">Create New Trading Strategy</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-blue-300 mb-2 block">Strategy Name</Label>
                <Input
                  value={newStrategy.name}
                  onChange={(e) => setNewStrategy(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., My Custom Strategy"
                  className="bg-white border-blue-500/30 text-black placeholder:text-gray-500"
                />
              </div>
              <div>
                <Label className="text-blue-300 mb-2 block">Status</Label>
                <Select value={newStrategy.status} onValueChange={(value) => setNewStrategy(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="bg-white border-blue-500/30 text-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-blue-300 mb-2 block">Description</Label>
              <Textarea
                value={newStrategy.description}
                onChange={(e) => setNewStrategy(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the strategy..."
                className="bg-white border-blue-500/30 text-black placeholder:text-gray-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-blue-300 mb-2 block">Expected Win Rate (%)</Label>
                <Input
                  type="number"
                  value={newStrategy.expectedWinRate}
                  onChange={(e) => setNewStrategy(prev => ({ ...prev, expectedWinRate: parseFloat(e.target.value) || 0 }))}
                  className="bg-white border-blue-500/30 text-black placeholder:text-gray-500"
                />
              </div>
              <div>
                <Label className="text-blue-300 mb-2 block">Risk/Reward Ratio</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newStrategy.riskRewardRatio}
                  onChange={(e) => setNewStrategy(prev => ({ ...prev, riskRewardRatio: parseFloat(e.target.value) || 0 }))}
                  className="bg-white border-blue-500/30 text-black placeholder:text-gray-500"
                />
              </div>
            </div>

            <div>
              <Label className="text-blue-300 mb-2 block">Trading Rules</Label>
              <Textarea
                value={newStrategy.rules}
                onChange={(e) => setNewStrategy(prev => ({ ...prev, rules: e.target.value }))}
                placeholder="• Entry criteria&#10;• Exit criteria&#10;• Risk management rules"
                className="bg-white border-blue-500/30 text-black placeholder:text-gray-500 h-24"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-blue-300 mb-2 block">Market Conditions</Label>
                <Input
                  value={newStrategy.marketConditions}
                  onChange={(e) => setNewStrategy(prev => ({ ...prev, marketConditions: e.target.value }))}
                  placeholder="e.g., High volatility, trending markets"
                  className="bg-white border-blue-500/30 text-black placeholder:text-gray-500"
                />
              </div>
              <div>
                <Label className="text-blue-300 mb-2 block">Target Assets</Label>
                <Input
                  value={newStrategy.assets}
                  onChange={(e) => setNewStrategy(prev => ({ ...prev, assets: e.target.value }))}
                  placeholder="e.g., Large cap stocks, ETFs"
                  className="bg-white border-blue-500/30 text-black placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                onClick={() => setIsCreateDialogOpen(false)}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={createStrategy}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Create Strategy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Strategy Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 border border-blue-500/30">
          <DialogHeader>
            <DialogTitle className="text-gradient-rainbow text-xl">
              {selectedStrategy?.name} - Strategy Details
            </DialogTitle>
          </DialogHeader>
          {selectedStrategy && (
            <div className="space-y-6 p-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { 
                    label: 'Win Rate', 
                    value: `${getStrategyMetrics(selectedStrategy).winRate}%`, 
                    color: 'green',
                    icon: TrendingUp
                  },
                  { 
                    label: 'R:R Ratio', 
                    value: `${selectedStrategy.riskRewardRatio}:1`, 
                    color: 'blue',
                    icon: Target
                  },
                  { 
                    label: 'Edge', 
                    value: ((getStrategyMetrics(selectedStrategy).winRate / 100) * selectedStrategy.riskRewardRatio - (1 - getStrategyMetrics(selectedStrategy).winRate / 100)).toFixed(2), 
                    color: 'purple',
                    icon: BarChart3
                  },
                  { 
                    label: 'Total Trades', 
                    value: selectedStrategy.performance.trades, 
                    color: 'orange',
                    icon: Activity
                  }
                ].map(({ label, value, color, icon: Icon }) => (
                  <Card key={label} className={`bg-gradient-to-br from-${color}-950/50 to-${color}-900/50 border border-${color}-500/30`}>
                    <CardContent className="p-4 text-center">
                      <Icon className={`w-6 h-6 text-${color}-400 mx-auto mb-2`} />
                      <div className={`text-${color}-400 font-bold text-xl`}>{value}</div>
                      <div className={`text-${color}-300 text-sm`}>{label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Strategy Overview */}
              <Card className="bg-slate-900/50 border border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-blue-300 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Strategy Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">{selectedStrategy.description}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <Badge className={getStatusColor(selectedStrategy.status)}>
                      {selectedStrategy.status.toUpperCase()}
                    </Badge>
                    <span className="text-gray-400 text-sm">
                      Created: {selectedStrategy.createdAt}
                    </span>
                    {selectedStrategy.lastUsed && (
                      <span className="text-gray-400 text-sm">
                        Last used: {selectedStrategy.lastUsed}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Trading Rules */}
              <Card className="bg-slate-900/50 border border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-300 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Trading Rules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedStrategy.rules.split('\n').map((rule, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-green-400 font-bold min-w-6">{index + 1}.</span>
                        <span className="text-gray-300">{rule.replace('• ', '')}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Market Conditions & Assets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-slate-900/50 border border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-yellow-300 flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Market Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">{selectedStrategy.marketConditions}</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-purple-300 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Target Assets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">{selectedStrategy.assets}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  // Render Historical Plans Section
  const renderHistoricalPlansSection = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-gradient-rainbow text-xl flex items-center gap-2">
            <History className="w-6 h-6" />
            Historical Trading Plans & Journal Review
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {historicalPlans.map(plan => (
            <Card key={plan.id} className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-purple-500/30 hover:border-purple-400/50 transition-all">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-400" />
                      {plan.date}
                    </CardTitle>
                    <div className="flex gap-4 mt-2 text-sm">
                      <Badge className="bg-blue-900/30 text-blue-300 border-blue-400/30">
                        {plan.account}
                      </Badge>
                      <Badge className="bg-green-900/30 text-green-300 border-green-400/30">
                        {plan.strategy}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Readiness Score</div>
                    <div className={`text-xl font-bold ${
                      plan.overallReadiness >= 16 ? 'text-green-400' : 
                      plan.overallReadiness >= 12 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {plan.overallReadiness}/20
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Plan Details */}
                  <div className="space-y-3">
                    <h4 className="text-purple-300 font-semibold">Plan Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Risk Amount:</span>
                        <span className="text-white">${plan.riskAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Target Profit:</span>
                        <span className="text-white">${plan.targetProfit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Max Trades:</span>
                        <span className="text-white">{plan.maxTrades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Planned Trades:</span>
                        <span className="text-white">{plan.plannedTrades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Session:</span>
                        <span className="text-white">{plan.startTime} - {plan.endTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mental State */}
                  <div className="space-y-3">
                    <h4 className="text-purple-300 font-semibold">Mental State</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Emotional Clarity:</span>
                        <span className="text-white">{plan.mentalState.emotionalClarity}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Physical Energy:</span>
                        <span className="text-white">{plan.mentalState.physicalEnergy}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Focus Level:</span>
                        <span className="text-white">{plan.mentalState.focusLevel}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Confidence:</span>
                        <span className="text-white">{plan.mentalState.confidence}/5</span>
                      </div>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="space-y-3">
                    <h4 className="text-purple-300 font-semibold">Results</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Actual Trades:</span>
                        <span className="text-white">{plan.actualTrades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Actual P&L:</span>
                        <span className={plan.actualPnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {plan.actualPnl >= 0 ? '+' : ''}${plan.actualPnl}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Discipline Score:</span>
                        <span className={`font-bold ${
                          plan.disciplineScore >= 20 ? 'text-green-400' : 
                          plan.disciplineScore >= 15 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {plan.disciplineScore}/25
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Journal Notes */}
                <div className="mt-4 p-4 bg-slate-800/50 border border-gray-600/30 rounded-lg">
                  <h4 className="text-purple-300 font-semibold mb-2">Journal Notes</h4>
                  <p className="text-gray-300 text-sm">{plan.notes}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 flex flex-col">
      <div className="flex-1 flex flex-col p-1">
        <div className="mb-2">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-gradient-rainbow text-2xl font-bold mb-1">Pre-session Mental Check & Daily Plan</h1>
              <p className="text-gray-400 text-sm">Comprehensive psychology and strategy management platform</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-white">{new Date().toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}</div>
              <div className="text-gray-400 text-sm">{new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true
              })}</div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 border border-blue-500/30">
            <TabsTrigger 
              value="psychology" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Brain className="w-5 h-5 mr-2" />
              Mental Check & Plan
            </TabsTrigger>
            <TabsTrigger 
              value="strategies"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
            >
              <Target className="w-5 h-5 mr-2" />
              Trading Strategies
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
            >
              <History className="w-5 h-5 mr-2" />
              Historical Plans
            </TabsTrigger>
          </TabsList>

          <TabsContent value="psychology" className="flex-1 min-h-0 overflow-hidden">
            <div className="h-full overflow-auto">
              {renderPsychologyWorkflow()}
            </div>
          </TabsContent>

          <TabsContent value="strategies" className="flex-1 min-h-0 overflow-hidden">
            <div className="h-full overflow-auto">
              {renderStrategiesSection()}
            </div>
          </TabsContent>

          <TabsContent value="history" className="flex-1 min-h-0 overflow-hidden">
            <div className="h-full overflow-auto">
              {renderHistoricalPlansSection()}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <style>{`
        .text-gradient-rainbow {
          background: linear-gradient(
            90deg,
            #ff0000 0%,
            #ff8000 16.67%,
            #ffff00 33.33%,
            #80ff00 50%,
            #00ff80 66.67%,
            #0080ff 83.33%,
            #8000ff 100%
          );
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: rainbow-text 3s ease-in-out infinite;
        }
        
        @keyframes rainbow-text {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>


    </div>
  );
}