import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  TrendingUp,
  Target,
  Heart,
  Zap,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Star,
  BarChart3,
  Waves,
  Focus,
  Award,
  ChevronRight,
  Activity
} from "lucide-react";

export default function FlowStateTraining() {
  const [currentView, setCurrentView] = useState('assessment'); // assessment, ritual, results
  const [flowPercentage, setFlowPercentage] = useState(50);
  const [currentRitualStep, setCurrentRitualStep] = useState(0);
  const [ritualCompleted, setRitualCompleted] = useState(false);
  const [skillLevel, setSkillLevel] = useState(5);
  const [challengeLevel, setChallengeLevel] = useState(5);
  const [postRitualFeelings, setPostRitualFeelings] = useState({});
  const [ritualTimer, setRitualTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setRitualTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const ritualSteps = [
    {
      title: "Nervous System Reset",
      duration: 300, // 5 minutes
      description: "Box breathing to activate parasympathetic nervous system",
      instructions: [
        "Sit comfortably with your back straight",
        "Close your eyes gently",
        "Breathe in for 4 counts",
        "Hold for 4 counts", 
        "Breathe out for 6 counts",
        "Repeat this cycle slowly and mindfully"
      ],
      icon: Heart
    },
    {
      title: "Body Activation", 
      duration: 180, // 3 minutes
      description: "Physical movement to release tension and reset nervous system",
      instructions: [
        "Stand up and shake out your entire body for 30 seconds",
        "Do 20 push-ups (modify as needed)",
        "Do 20 jumping jacks",
        "Roll your neck slowly in both directions",
        "Take 3 deep breaths and feel the energy flow"
      ],
      icon: Zap
    },
    {
      title: "Market Synchronization",
      duration: 180, // 3 minutes  
      description: "Calibrate with current market conditions without analyzing",
      instructions: [
        "Open your trading platform",
        "Look at the overall market - don't analyze, just observe",
        "Notice: Is it trending or ranging?",
        "Notice: Is volume high or low?", 
        "Notice: What's the general 'feel' - fast, slow, erratic?",
        "Make 3 simple observations, nothing more"
      ],
      icon: Activity
    },
    {
      title: "Intention Setting",
      duration: 180, // 3 minutes
      description: "Set clear, process-focused intentions for the session", 
      instructions: [
        "Write down: 'Today I will execute my edge with discipline on A+ setups only'",
        "Write down: 'Today I will honor my stop losses without hesitation'",
        "Write down: 'Today I will remain aware of my emotional state before every trade'",
        "Read each statement out loud",
        "Feel the commitment behind each word"
      ],
      icon: Target
    },
    {
      title: "Anchor Activation",
      duration: 120, // 2 minutes
      description: "Create physical anchor for flow state recall",
      instructions: [
        "Find a small object (coin, stone, ring)",
        "Hold it in your dominant hand",
        "Close your eyes and recall your best trading day ever",
        "Focus on the FEELING, not the profit",
        "Remember the calm, clarity, precision you felt",
        "Squeeze the object and say 'I am ready' out loud"
      ],
      icon: Star
    }
  ];

  const getPerformanceZone = () => {
    if (challengeLevel >= 7 && skillLevel >= 7) return { zone: 'Flow', color: 'green', description: 'Optimal Trading State' };
    if (challengeLevel >= 7 && skillLevel < 5) return { zone: 'Anxiety', color: 'red', description: 'High Risk - Avoid Trading' };
    if (challengeLevel < 5 && skillLevel >= 7) return { zone: 'Boredom', color: 'yellow', description: 'Risk of Overtrading' };
    return { zone: 'Apathy', color: 'gray', description: 'Learning Mode Only' };
  };

  const calculateFlowScore = () => {
    const zone = getPerformanceZone();
    let baseScore = flowPercentage;
    
    // Bonus for being in flow zone
    if (zone.zone === 'Flow') baseScore += 15;
    
    // Bonus for completing ritual
    if (ritualCompleted) baseScore += 10;
    
    // Emotional state bonuses
    Object.values(postRitualFeelings).forEach(feeling => {
      if (feeling === 'excellent') baseScore += 5;
      if (feeling === 'good') baseScore += 2;
      if (feeling === 'poor') baseScore -= 5;
    });
    
    return Math.min(100, Math.max(0, baseScore));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (currentView === 'ritual') {
    const currentStep = ritualSteps[currentRitualStep];
    const StepIcon = currentStep.icon;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6 bg-gradient-to-br from-blue-950/80 via-teal-950/60 to-slate-950 border-2 border-teal-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 text-gradient-rainbow">
                  <Timer className="h-5 w-5 text-blue-500" />
                  <span>Flow State Ritual - Step {currentRitualStep + 1} of {ritualSteps.length}</span>
                </CardTitle>
                <Badge className="bg-blue-100 text-blue-700 border border-blue-500/30">
                  {formatTime(currentStep.duration)} duration
                </Badge>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentRitualStep + 1) / ritualSteps.length) * 100}%` }}
                ></div>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-blue-950/50 via-teal-950/40 to-slate-950/80 border-2 border-teal-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <StepIcon className="h-6 w-6 text-teal-400" />
                <span>{currentStep.title}</span>
              </CardTitle>
              <CardDescription className="text-teal-200">{currentStep.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-teal-900/30 p-6 rounded-lg border border-teal-500/20">
                  <h4 className="font-medium text-teal-300 mb-3">Instructions:</h4>
                  <ul className="space-y-2">
                    {currentStep.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                        <span className="text-teal-200">{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">
                    {formatTime(ritualTimer)}
                  </div>
                  <p className="text-gray-400">
                    Recommended: {formatTime(currentStep.duration)}
                  </p>
                </div>

                <div className="flex justify-center space-x-4">
                  <Button 
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isTimerRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    {isTimerRunning ? 'Pause' : 'Start'} Timer
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setRitualTimer(0)}
                    className="border-teal-500/30 text-teal-300 hover:bg-teal-900/20"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>

                <div className="flex justify-between">
                  <Button 
                    variant="outline"
                    onClick={() => setCurrentRitualStep(Math.max(0, currentRitualStep - 1))}
                    disabled={currentRitualStep === 0}
                    className="border-teal-500/30 text-teal-300 hover:bg-teal-900/20 disabled:opacity-50"
                  >
                    Previous Step
                  </Button>
                  <Button 
                    onClick={() => {
                      if (currentRitualStep === ritualSteps.length - 1) {
                        setRitualCompleted(true);
                        setCurrentView('results');
                      } else {
                        setCurrentRitualStep(currentRitualStep + 1);
                        setRitualTimer(0);
                        setIsTimerRunning(false);
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {currentRitualStep === ritualSteps.length - 1 ? 'Complete Ritual' : 'Next Step'}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentView === 'results') {
    const zone = getPerformanceZone();
    const flowScore = calculateFlowScore();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-teal-900/30 rounded-lg border border-teal-500/30">
                <Award className="h-6 w-6 text-teal-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Flow State Assessment Results</h1>
                <p className="text-gray-400">Your psychological readiness for trading</p>
              </div>
            </div>
          </div>

          {/* Post-Ritual Feelings Assessment */}
          <Card className="mb-8 bg-gradient-to-br from-teal-950/50 via-blue-950/50 to-black border-2 border-teal-500/30">
            <CardHeader>
              <CardTitle className="text-white">How do you feel after completing the ritual?</CardTitle>
              <CardDescription className="text-teal-200">Rate your current state in each area</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {['Focus', 'Calmness', 'Confidence', 'Clarity'].map((feeling) => (
                  <div key={feeling} className="space-y-2">
                    <label className="text-sm font-medium text-teal-300">{feeling}</label>
                    <select 
                      className="w-full p-2 border border-teal-500/30 rounded-md bg-gray-800 text-white"
                      value={postRitualFeelings[feeling as keyof typeof postRitualFeelings] || ''}
                      onChange={(e) => setPostRitualFeelings({...postRitualFeelings, [feeling]: e.target.value})}
                    >
                      <option value="">Select...</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="average">Average</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Matrix */}
          <Card className="mb-8 bg-gradient-to-br from-teal-950/50 via-blue-950/50 to-black border-2 border-teal-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <BarChart3 className="h-5 w-5 text-teal-400" />
                <span>Performance Matrix Position</span>
              </CardTitle>
              <CardDescription className="text-teal-200">Adjust your current skill and challenge levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-teal-300">Your Skill Level: {skillLevel}/10</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-400">1=Beginner, 5=Developing, 8=Competent, 10=Expert</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-teal-300">Current Market Challenge: {challengeLevel}/10</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={challengeLevel}
                    onChange={(e) => setChallengeLevel(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-400">1=Slow/Ranging, 5=Normal, 8=Volatile, 10=Extreme</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`text-center p-4 rounded-lg ${zone.zone === 'Anxiety' ? 'bg-teal-950/50 border-2 border-teal-500' : 'bg-teal-950/30 border border-teal-500/30'}`}>
                  <h4 className="font-medium text-teal-300">Anxiety Zone</h4>
                  <p className="text-sm text-teal-400">High Challenge + Low Skill</p>
                </div>
                <div className={`text-center p-4 rounded-lg ${zone.zone === 'Flow' ? 'bg-green-950/50 border-2 border-green-500' : 'bg-green-950/30 border border-green-500/30'}`}>
                  <h4 className="font-medium text-green-300">Flow Zone</h4>
                  <p className="text-sm text-green-500">High Challenge + High Skill</p>
                </div>
                <div className={`text-center p-4 rounded-lg ${zone.zone === 'Apathy' ? 'bg-gray-800 border-2 border-gray-500' : 'bg-gray-800/50 border border-gray-500/30'}`}>
                  <h4 className="font-medium text-gray-300">Apathy Zone</h4>
                  <p className="text-sm text-gray-400">Low Challenge + Low Skill</p>
                </div>
                <div className={`text-center p-4 rounded-lg ${zone.zone === 'Boredom' ? 'bg-yellow-950/50 border-2 border-yellow-500' : 'bg-yellow-950/30 border border-yellow-500/30'}`}>
                  <h4 className="font-medium text-yellow-300">Boredom Zone</h4>
                  <p className="text-sm text-yellow-400">Low Challenge + High Skill</p>
                </div>
              </div>

              <div className="mt-4 text-center">
                <Badge className={`${zone.color === 'green' ? 'bg-green-900/50 text-green-300 border border-green-500/30' : zone.color === 'red' ? 'bg-teal-900/50 text-teal-300 border border-teal-500/30' : zone.color === 'yellow' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/30' : 'bg-gray-800 text-gray-300 border border-gray-500/30'}`}>
                  Current Zone: {zone.zone} - {zone.description}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Flow Zone Assessment */}
          <Card className="mb-8 bg-gradient-to-br from-green-950/50 via-blue-950/50 to-black border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Waves className="h-5 w-5 text-green-500" />
                <span>Flow Zone Assessment Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-green-500 mb-2">{flowScore}</div>
                <div className="text-lg text-gray-400">Overall Flow State Score</div>
                <Badge className={flowScore >= 80 ? 'bg-green-900/50 text-green-300 border border-green-500/30' : flowScore >= 60 ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/30' : 'bg-teal-900/50 text-teal-300 border border-teal-500/30'}>
                  {flowScore >= 80 ? 'Excellent - Ready to Trade' : flowScore >= 60 ? 'Good - Proceed with Caution' : 'Poor - Consider Paper Trading'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
                  <div className="text-2xl font-bold text-blue-400">{flowPercentage}%</div>
                  <div className="text-sm text-blue-300">Base Flow Level</div>
                </div>
                <div className="text-center p-4 bg-teal-900/30 rounded-lg border border-teal-500/30">
                  <div className="text-2xl font-bold text-teal-400">{zone.zone === 'Flow' ? '+15' : '0'}</div>
                  <div className="text-sm text-teal-300">Zone Bonus</div>
                </div>
                <div className="text-center p-4 bg-green-900/30 rounded-lg border border-green-500/30">
                  <div className="text-2xl font-bold text-green-500">{ritualCompleted ? '+10' : '0'}</div>
                  <div className="text-sm text-green-300">Ritual Bonus</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center space-x-4">
            <Button 
              onClick={() => {
                setCurrentView('assessment');
                setRitualCompleted(false);
                setCurrentRitualStep(0);
                setPostRitualFeelings({});
              }}
              variant="outline"
              className="border-teal-500/30 text-teal-300 hover:bg-teal-900/20"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Start Over
            </Button>
            <Link href="/trading-dashboard">
              <Button className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Begin Mental Check Plan
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main Assessment View
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-teal-900/30 rounded-lg border border-teal-500/30">
              <Brain className="h-6 w-6 text-teal-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Flow State Training Center</h1>
              <p className="text-gray-400">Master your psychology for optimal trading performance</p>
            </div>
          </div>
        </div>

        {/* Current Flow Assessment */}
        <Card className="mb-8 bg-gradient-to-br from-teal-950/50 via-blue-950/50 to-black border-2 border-teal-500/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Waves className="h-5 w-5 text-blue-400" />
              <span>Current Flow State Assessment</span>
            </CardTitle>
            <CardDescription className="text-teal-200">How connected to flow do you feel right now?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-teal-300">Flow State Percentage: {flowPercentage}%</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={flowPercentage}
                  onChange={(e) => setFlowPercentage(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>0% - Scattered/Anxious</span>
                  <span>50% - Neutral</span>
                  <span>100% - Perfect Flow</span>
                </div>
              </div>

              <div className="text-center">
                <Badge className={flowPercentage >= 70 ? 'bg-green-900/50 text-green-300 border border-green-500/30' : flowPercentage >= 40 ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/30' : 'bg-teal-900/50 text-teal-300 border border-teal-500/30'}>
                  {flowPercentage >= 70 ? 'Good Flow State' : flowPercentage >= 40 ? 'Moderate Flow' : 'Low Flow - Training Recommended'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flow State Education */}
        <Card className="mb-8 bg-gradient-to-br from-teal-950/50 via-blue-950/50 to-black border-2 border-teal-500/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Focus className="h-5 w-5 text-teal-400" />
              <span>What is Flow State?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-300">
                Flow is a mental state where you operate with total clarity, focused attention, and effortless concentration. 
                In trading, it's when fear disappears, decisions feel natural, and you respond rather than react to market movements.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-950/30 rounded-lg border border-green-500/30">
                  <h4 className="font-medium text-green-300 mb-2">Flow State Benefits:</h4>
                  <ul className="text-sm text-green-500 space-y-1">
                    <li>• 200-400% increase in profitability</li>
                    <li>• 73% reduction in stress hormones</li>
                    <li>• Enhanced pattern recognition</li>
                    <li>• Improved decision-making speed</li>
                    <li>• Natural discipline and patience</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-blue-950/30 rounded-lg border border-blue-500/30">
                  <h4 className="font-medium text-blue-300 mb-2">Neurochemical Changes:</h4>
                  <ul className="text-sm text-blue-400 space-y-1">
                    <li>• Norepinephrine: Laser focus</li>
                    <li>• Dopamine: Pattern recognition</li>
                    <li>• Anandamide: Creative problem solving</li>
                    <li>• Endorphins: Stress resilience</li>
                    <li>• Reduced cortisol: Calm decision making</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flow State Ritual */}
        <Card className="bg-gradient-to-br from-teal-950/50 via-blue-950/50 to-black border-2 border-teal-500/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Timer className="h-5 w-5 text-orange-400" />
              <span>16-Minute Flow State Ritual</span>
            </CardTitle>
            <CardDescription className="text-teal-200">
              A scientifically-designed routine to activate flow state before trading
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {ritualSteps.map((step, index) => {
                  const StepIcon = step.icon;
                  return (
                    <div key={index} className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <StepIcon className="h-8 w-8 text-teal-400 mx-auto mb-2" />
                      <h4 className="font-medium text-sm text-white">{step.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        {Math.floor(step.duration / 60)} min
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="text-center space-y-4">
                <p className="text-gray-400">
                  This ritual prepares your nervous system, aligns your mindset, and activates the neurochemical 
                  cascade needed for optimal trading performance.
                </p>
                
                <Button 
                  onClick={() => setCurrentView('ritual')}
                  className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white"
                  size="lg"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Flow State Ritual
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}