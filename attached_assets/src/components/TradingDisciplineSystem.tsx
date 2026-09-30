import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Target, Shield, TrendingUp, Clock, BookOpen } from "lucide-react";
import EmotionalControlSection from './EmotionalControlSection';
import MarketAnalysisSection from './MarketAnalysisSection';
import GrowthTrackingSection from './GrowthTrackingSection';

interface DisciplineArea {
  name: string;
  score: number;
  weight: number;
  icon: React.ReactNode;
  description: string;
  keyMetrics: string[];
  recommendations: string[];
}

interface SystemProps {
  tradeData?: any[];
}

export default function TradingDisciplineSystem({ tradeData }: SystemProps) {
  const [selectedArea, setSelectedArea] = useState<string>('overview');

  const disciplineAreas: DisciplineArea[] = [
    {
      name: "Risk Management",
      score: 72,
      weight: 25,
      icon: <Shield className="h-5 w-5" />,
      description: "Capital preservation and position sizing discipline",
      keyMetrics: ["Position size consistency", "Stop loss adherence", "Risk-reward ratios"],
      recommendations: [
        "Never risk more than 2% per trade",
        "Use position sizing calculator",
        "Set stops before entry"
      ]
    },
    {
      name: "Emotional Control",
      score: 58,
      weight: 20,
      icon: <Brain className="h-5 w-5" />,
      description: "Managing fear, greed, and impulsive decisions",
      keyMetrics: ["Revenge trading frequency", "FOMO trades", "Emotional exits"],
      recommendations: [
        "Implement cooling-off periods",
        "Use meditation/mindfulness",
        "Keep trading journal"
      ]
    },
    {
      name: "Strategy Adherence",
      score: 68,
      weight: 20,
      icon: <Target className="h-5 w-5" />,
      description: "Following your trading plan consistently",
      keyMetrics: ["Setup quality", "Entry timing", "Exit discipline"],
      recommendations: [
        "Define clear entry criteria",
        "Backtest strategies thoroughly",
        "Review plan weekly"
      ]
    },
    {
      name: "Market Analysis",
      score: 78,
      weight: 15,
      icon: <TrendingUp className="h-5 w-5" />,
      description: "Technical and fundamental analysis skills",
      keyMetrics: ["Analysis accuracy", "Market timing", "Trend identification"],
      recommendations: [
        "Study price action patterns",
        "Understand market structure",
        "Follow economic calendar"
      ]
    },
    {
      name: "Time Management",
      score: 82,
      weight: 10,
      icon: <Clock className="h-5 w-5" />,
      description: "Efficient use of trading time and session planning",
      keyMetrics: ["Session preparation", "Focus duration", "Screen time balance"],
      recommendations: [
        "Create pre-market routine",
        "Limit trading hours",
        "Take regular breaks"
      ]
    },
    {
      name: "Continuous Learning",
      score: 65,
      weight: 10,
      icon: <BookOpen className="h-5 w-5" />,
      description: "Commitment to improvement and skill development",
      keyMetrics: ["Study hours", "Course completion", "Skill application"],
      recommendations: [
        "Read trading books monthly",
        "Attend webinars/courses",
        "Practice on demo accounts"
      ]
    }
  ];

  const calculateOverallScore = () => {
    return disciplineAreas.reduce((total, area) => {
      return total + (area.score * area.weight / 100);
    }, 0);
  };

  const overallScore = calculateOverallScore();
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreLevel = (score: number) => {
    if (score >= 80) return "Professional";
    if (score >= 60) return "Developing";
    return "Novice";
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white text-center">
            Trading Discipline System Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className={`text-6xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore.toFixed(1)}
            </div>
            <div className="text-xl text-gray-300">
              {getScoreLevel(overallScore)} Trader
            </div>
            <Progress value={overallScore} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedArea} onValueChange={setSelectedArea}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
          <TabsTrigger value="emotion">Emotion</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="development">Growth</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {disciplineAreas.map((area, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {area.icon}
                      <span className="font-medium text-white">{area.name}</span>
                    </div>
                    <Badge variant={area.score >= 70 ? "default" : "destructive"}>
                      {area.score}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={area.score} className="h-2 mb-2" />
                  <p className="text-sm text-gray-400">{area.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="emotion" className="space-y-4">
          <EmotionalControlSection />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <MarketAnalysisSection />
        </TabsContent>

        <TabsContent value="development" className="space-y-4">
          <GrowthTrackingSection />
        </TabsContent>

        {disciplineAreas.filter(area => !['Emotional Control', 'Market Analysis', 'Continuous Learning'].includes(area.name)).map((area, index) => {
          const tabValue = area.name.toLowerCase().split(' ')[0];
          return (
            <TabsContent key={index} value={tabValue} className="space-y-4">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    {area.icon}
                    {area.name} Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`text-4xl font-bold ${getScoreColor(area.score)}`}>
                      {area.score}%
                    </div>
                    <div className="flex-1">
                      <Progress value={area.score} className="h-3" />
                      <p className="text-sm text-gray-400 mt-1">{area.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-white mb-2">Key Metrics</h4>
                      <ul className="space-y-1">
                        {area.keyMetrics.map((metric, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                            {metric}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-white mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {area.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}