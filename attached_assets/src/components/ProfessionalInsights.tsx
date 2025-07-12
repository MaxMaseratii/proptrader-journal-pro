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
      bgColor: "bg-yellow-900/20 border-yellow-500/30",
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
      <Card className={`${currentInsight.bgColor} backdrop-blur-sm`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            {currentInsight.icon}
            {currentInsight.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-white mb-3">Performance Analysis</h4>
              <ul className="space-y-2">
                {currentInsight.analysis.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-300">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3">Strategic Recommendations</h4>
              <ul className="space-y-2">
                {currentInsight.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-300">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <Alert className="bg-blue-900/30 border-blue-500/30">
            <DollarSign className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-300">
              <strong>Profit Potential:</strong> {currentInsight.potentialGains}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white">Market Adaptation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="outline" className="text-xs">
                Current: Trending Market
              </Badge>
              <p className="text-xs text-gray-400">
                {marketConditions.trending}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white">Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant={disciplineScore >= 70 ? "default" : "destructive"} className="text-xs">
                {disciplineScore >= 70 ? "Controlled" : "Elevated"}
              </Badge>
              <p className="text-xs text-gray-400">
                {disciplineScore >= 70 
                  ? "Risk management within acceptable parameters"
                  : "Risk management requires immediate attention"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white">Development Focus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="secondary" className="text-xs">
                {disciplineScore < 50 ? "Foundation" : disciplineScore < 75 ? "Refinement" : "Optimization"}
              </Badge>
              <p className="text-xs text-gray-400">
                {disciplineScore < 50 
                  ? "Build core trading fundamentals"
                  : disciplineScore < 75 
                  ? "Refine existing skills and consistency"
                  : "Optimize advanced strategies"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}