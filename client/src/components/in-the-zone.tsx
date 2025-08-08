import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Heart, 
  Target, 
  Zap, 
  CheckCircle,
  TrendingUp,
  Timer,
  BarChart3,
  Activity,
  Star,
  Trophy,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

const InTheZone = () => {
  const [mentalScore, setMentalScore] = useState(75);
  const [breathingPhase, setBreathingPhase] = useState('inhale');
  const [breathCount, setBreathCount] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const [assessmentScores, setAssessmentScores] = useState({
    focus: 7,
    confidence: 8,
    energy: 6,
    discipline: 9
  });

  // Breathing timer
  useEffect(() => {
    let interval: any;
    if (isBreathing) {
      interval = setInterval(() => {
        setBreathingPhase(prev => {
          switch(prev) {
            case 'inhale': return 'hold';
            case 'hold': return 'exhale';
            case 'exhale': 
              setBreathCount(c => c + 1);
              return 'inhale';
            default: return 'inhale';
          }
        });
      }, breathingPhase === 'inhale' ? 4000 : breathingPhase === 'hold' ? 4000 : 6000);
    }
    return () => clearInterval(interval);
  }, [isBreathing, breathingPhase]);

  const calculateOverallReadiness = () => {
    const avgAssessment = Object.values(assessmentScores).reduce((a, b) => a + b, 0) / 4;
    return Math.round((avgAssessment * 10 + mentalScore) / 2);
  };

  const getReadinessLevel = (score: number) => {
    if (score >= 85) return { level: 'Peak Zone', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (score >= 70) return { level: 'Ready', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (score >= 50) return { level: 'Caution', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    return { level: 'Not Ready', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const readinessScore = calculateOverallReadiness();
  const readiness = getReadinessLevel(readinessScore);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pre-Session Mental Check</h1>
              <p className="text-gray-600 dark:text-gray-400">Assess and optimize your trading readiness</p>
            </div>
          </div>
          
          {/* Overall Readiness Score */}
          <Card className={`border-l-4 border-l-purple-500 ${readiness.bg}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{readinessScore}%</div>
                  <div className={`text-sm font-medium ${readiness.color}`}>{readiness.level}</div>
                </div>
                <div className="flex items-center space-x-2">
                  {readinessScore >= 85 ? <Trophy className="h-8 w-8 text-yellow-500" /> :
                   readinessScore >= 70 ? <CheckCircle className="h-8 w-8 text-green-500" /> :
                   readinessScore >= 50 ? <AlertTriangle className="h-8 w-8 text-yellow-500" /> :
                   <AlertTriangle className="h-8 w-8 text-red-500" />}
                </div>
              </div>
              <Progress value={readinessScore} className="mt-4" />
            </CardContent>
          </Card>
        </div>

        {/* Assessment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Focus Assessment */}
          <Card className="border border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                <Target className="h-5 w-5" />
                <span>Focus Level</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {assessmentScores.focus}/10
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Current Focus</div>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={assessmentScores.focus}
                  onChange={(e) => setAssessmentScores(prev => ({...prev, focus: parseInt(e.target.value)}))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  1 = Scattered • 10 = Laser Focused
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Confidence Assessment */}
          <Card className="border border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <Star className="h-5 w-5" />
                <span>Confidence</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {assessmentScores.confidence}/10
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Trading Confidence</div>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={assessmentScores.confidence}
                  onChange={(e) => setAssessmentScores(prev => ({...prev, confidence: parseInt(e.target.value)}))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  1 = Doubtful • 10 = Fully Confident
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Energy Assessment */}
          <Card className="border border-yellow-200 dark:border-yellow-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
                <Zap className="h-5 w-5" />
                <span>Energy Level</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {assessmentScores.energy}/10
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Physical Energy</div>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={assessmentScores.energy}
                  onChange={(e) => setAssessmentScores(prev => ({...prev, energy: parseInt(e.target.value)}))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  1 = Exhausted • 10 = High Energy
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discipline Assessment */}
          <Card className="border border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
                <CheckCircle className="h-5 w-5" />
                <span>Discipline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {assessmentScores.discipline}/10
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Rule Following</div>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={assessmentScores.discipline}
                  onChange={(e) => setAssessmentScores(prev => ({...prev, discipline: parseInt(e.target.value)}))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  1 = Impulsive • 10 = Strict Discipline
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Breathing Exercise */}
        <Card className="border border-cyan-200 dark:border-cyan-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400">
              <Heart className="h-5 w-5" />
              <span>Box Breathing Exercise</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Breathing Visual */}
              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <div className={`w-32 h-32 rounded-full border-4 border-cyan-400 flex items-center justify-center transition-all duration-1000 ${
                    breathingPhase === 'inhale' ? 'scale-110 bg-cyan-100 dark:bg-cyan-900/30' :
                    breathingPhase === 'hold' ? 'scale-110 bg-cyan-200 dark:bg-cyan-900/50' :
                    'scale-90 bg-cyan-50 dark:bg-cyan-900/10'
                  }`}>
                    <div className="text-center">
                      <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400 capitalize">
                        {breathingPhase}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {breathingPhase === 'inhale' ? '4s' : breathingPhase === 'hold' ? '4s' : '6s'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                    {breathCount}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Breath Cycles</div>
                </div>
              </div>

              {/* Breathing Controls */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">4-4-6 Box Breathing</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Inhale for 4 seconds</li>
                    <li>• Hold for 4 seconds</li>
                    <li>• Exhale for 6 seconds</li>
                    <li>• Repeat 5-10 cycles</li>
                  </ul>
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    onClick={() => setIsBreathing(!isBreathing)}
                    className={`${isBreathing ? 'bg-red-500 hover:bg-red-600' : 'bg-cyan-500 hover:bg-cyan-600'} text-white`}
                  >
                    {isBreathing ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    {isBreathing ? 'Pause' : 'Start'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setBreathCount(0);
                      setBreathingPhase('inhale');
                      setIsBreathing(false);
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mental Score Adjustment
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={mentalScore}
                    onChange={(e) => setMentalScore(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Stressed (0%)</span>
                    <span className="font-medium">{mentalScore}%</span>
                    <span>Zen (100%)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span>Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {readinessScore < 50 && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span className="font-medium text-red-700 dark:text-red-400">Not Ready</span>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    Consider paper trading or taking a break. Focus on stress management.
                  </p>
                </div>
              )}
              
              {readinessScore >= 50 && readinessScore < 85 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <Timer className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium text-yellow-700 dark:text-yellow-400">Prepare More</span>
                  </div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-300">
                    Do breathing exercises and review your trading plan before starting.
                  </p>
                </div>
              )}
              
              {readinessScore >= 85 && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <Trophy className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-700 dark:text-green-400">Peak State</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    You're in optimal condition for trading. Execute your plan with confidence.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InTheZone;