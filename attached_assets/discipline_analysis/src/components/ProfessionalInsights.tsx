import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, AlertTriangle, CheckCircle, Target, DollarSign } from "lucide-react";

interface InsightProps {
  disciplineScore: number;
  tradeData?: any[];
}

export default function ProfessionalInsights({ disciplineScore, tradeData }: InsightProps) {
  const getInsightLevel = (score: number) => {
    if (score >= 80) return "elite";
    if (score >= 60) return "intermediate";
    return "developing";
  };

  const insights = {
    elite: {
      title: "Elite Trader Performance",
      color: "text-green-400",
      bgColor: "bg-green-900/20 border-green-500/30",
      icon: <CheckCircle className="h-5 w-5 text-green-400" />,
      analysis: [
        "Exceptional discipline across all trading dimensions",
        "Consistent risk management and emotional control",
        "Strong adherence to systematic trading approach",
        "Demonstrates professional-level trading psychology"
      ],
      recommendations: [
        "Focus on scaling position sizes gradually",
        "Consider teaching or mentoring other traders",
        "Explore advanced strategies like options spreads",
        "Document your methodology for future reference"
      ],
      potentialGains: "15-25% annual returns sustainable"
    },
    intermediate: {
      title: "Developing Trader Profile",
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/20 border-yellow-400 shadow-lg shadow-yellow-400/20",
      icon: <Target className="h-5 w-5 text-yellow-400" />,
      analysis: [
        "Solid foundation with room for improvement",
        "Good technical skills but inconsistent execution",
        "Emotional control needs strengthening",
        "Risk management shows promise but lacks consistency"
      ],
      recommendations: [
        "Implement strict daily trading routines",
        "Use smaller position sizes while developing discipline",
        "Focus on one strategy until mastered",
        "Keep detailed trading journal for pattern recognition"
      ],
      potentialGains: "8-15% annual returns with discipline improvements"
    },
    developing: {
      title: "Foundation Building Required",
      color: "text-red-400",
      bgColor: "bg-red-900/20 border-red-500/30",
      icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
      analysis: [
        "Significant discipline gaps affecting profitability",
        "Emotional trading patterns dominating decisions",
        "Inconsistent risk management leading to large losses",
        "Strategy execution lacks systematic approach"
      ],
      recommendations: [
        "Return to demo trading to rebuild confidence",
        "Focus exclusively on risk management rules",
        "Implement mandatory cooling-off periods",
        "Seek mentorship or professional trading education"
      ],
      potentialGains: "Focus on capital preservation before profit targets"
    }
  };

  const currentInsight = insights[getInsightLevel(disciplineScore)];

  const marketConditions = {
    trending: "Strong directional markets favor disciplined trend followers",
    ranging: "Choppy markets require enhanced emotional control",
    volatile: "High volatility demands strict risk management"
  };

  return (
    <div className="space-y-6">
      <Card className="bg-dark-card border-dark-border hover-glow">
        <CardHeader>
          <CardTitle className="text-gradient-rainbow text-center">
            Professional Insights Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className={`text-6xl font-bold ${currentInsight.color}`}>
              {disciplineScore.toFixed(1)}
            </div>
            <div className="text-xl text-gray-300">
              {currentInsight.title}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="h-3 rounded-full bg-prop-gradient-blue transition-all duration-300"
                style={{ width: `${disciplineScore}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-black border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Performance Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {currentInsight.analysis.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-300">{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-400/20 border-yellow-400 shadow-lg shadow-yellow-400/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-yellow-400" />
              Recommended Solutions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {currentInsight.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-300">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-yellow-400/20 border-yellow-400 shadow-lg shadow-yellow-400/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-yellow-400" />
            Developing Trader Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-blue-900/30 border-blue-500/30">
            <DollarSign className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-300">
              <strong>Profit Potential:</strong> {currentInsight.potentialGains}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}