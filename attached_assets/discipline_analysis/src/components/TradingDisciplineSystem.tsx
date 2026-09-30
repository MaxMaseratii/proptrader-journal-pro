import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Target, Shield, TrendingUp, Clock, BookOpen } from "lucide-react";

interface SystemProps {
  tradeData?: any[];
}

export default function TradingDisciplineSystem({ tradeData }: SystemProps) {
  const [selectedArea, setSelectedArea] = useState<string>('overview');

  const calculateScores = () => {
    if (!tradeData || tradeData.length === 0) {
      return {
        riskScore: 72,
        emotionalScore: 58,
        strategyScore: 68,
        analysisScore: 78,
        timeScore: 82,
        learningScore: 65
      };
    }

    const cancelledOrders = tradeData.filter(row => row.Status === 'Canceled').length;
    const cancellationRate = (cancelledOrders / tradeData.length) * 100;
    
    return {
      riskScore: Math.max(20, 100 - cancellationRate * 1.2),
      emotionalScore: Math.max(15, 100 - cancellationRate * 1.5),
      strategyScore: Math.max(25, 100 - cancellationRate),
      analysisScore: Math.max(30, 100 - cancellationRate * 0.8),
      timeScore: Math.max(40, 100 - cancellationRate * 0.6),
      learningScore: Math.max(35, 100 - cancellationRate * 0.9)
    };
  };

  const scores = calculateScores();

  const disciplineAreas = [
    {
      name: "Risk Management",
      score: scores.riskScore,
      weight: 25,
      icon: <Shield className="h-5 w-5 text-prop-gold" />,
      description: "Capital preservation and position sizing discipline"
    },
    {
      name: "Emotional Control",
      score: scores.emotionalScore,
      weight: 20,
      icon: <Brain className="h-5 w-5 text-prop-gold" />,
      description: "Managing fear, greed, and impulsive decisions"
    },
    {
      name: "Strategy Adherence",
      score: scores.strategyScore,
      weight: 20,
      icon: <Target className="h-5 w-5 text-prop-gold" />,
      description: "Following your trading plan consistently"
    },
    {
      name: "Market Analysis",
      score: scores.analysisScore,
      weight: 15,
      icon: <TrendingUp className="h-5 w-5 text-prop-gold" />,
      description: "Technical and fundamental analysis skills"
    },
    {
      name: "Time Management",
      score: scores.timeScore,
      weight: 10,
      icon: <Clock className="h-5 w-5 text-prop-gold" />,
      description: "Efficient use of trading time and session planning"
    },
    {
      name: "Continuous Learning",
      score: scores.learningScore,
      weight: 10,
      icon: <BookOpen className="h-5 w-5 text-prop-gold" />,
      description: "Commitment to improvement and skill development"
    }
  ];

  const calculateOverallScore = () => {
    return disciplineAreas.reduce((total, area) => {
      return total + (area.score * area.weight / 100);
    }, 0);
  };

  const overallScore = calculateOverallScore();
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-prop-green";
    if (score >= 60) return "text-prop-gold";
    return "text-prop-pink";
  };

  const getScoreLevel = (score: number) => {
    if (score >= 80) return "Professional";
    if (score >= 60) return "Developing";
    return "Novice";
  };

  return (
    <div className="space-y-6">
      <Card className="bg-dark-card border-dark-border hover-glow">
        <CardHeader>
          <CardTitle className="text-gradient-rainbow text-center">
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
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="h-3 rounded-full bg-prop-gradient-gold transition-all duration-300"
                style={{ width: `${overallScore}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {disciplineAreas.map((area, index) => (
          <Card key={index} className="bg-dark-card border-dark-border hover-glow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gradient-rainbow">
                  {area.icon}
                  <span className="font-medium">{area.name}</span>
                </div>
                <Badge className={area.score >= 70 ? "bg-prop-green text-white" : "bg-prop-pink text-white"}>
                  {area.score.toFixed(1)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    area.score >= 70 ? 'bg-prop-green' : area.score >= 50 ? 'bg-prop-gold' : 'bg-prop-pink'
                  }`}
                  style={{ width: `${area.score}%` }}
                />
              </div>
              <p className="text-sm text-gray-400">{area.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}