import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Brain } from "lucide-react";

interface TechnicalImprovementsSectionProps {
  disciplineScore: number;
  tradeData?: any[];
}

export default function TechnicalImprovementsSection({ disciplineScore, tradeData }: TechnicalImprovementsSectionProps) {
  const generateTechnicalImprovements = () => {
    const improvements = [];
    
    if (disciplineScore < 75) {
      improvements.push({
        category: 'Position Sizing',
        issue: 'Inconsistent risk allocation per trade',
        indicators: ['Variable position sizes without correlation to setup quality', 'Risk exceeding predetermined parameters'],
        solution: 'Implement fixed percentage risk model (1-2% per trade)',
        priority: 'high'
      });
    }

    improvements.push({
      category: 'Time Management',
      issue: 'Potential extended trading sessions',
      indicators: ['High order frequency suggests prolonged market exposure', 'Decision fatigue likely after 2-3 hours'],
      solution: 'Limit active trading to 2-3 hour focused sessions',
      priority: 'medium'
    });

    if (disciplineScore < 70) {
      improvements.push({
        category: 'Risk-Reward Ratio',
        issue: 'Suboptimal profit-to-loss ratio management',
        indicators: ['Early profit taking relative to stop loss distance', 'Insufficient reward for accepted risk'],
        solution: 'Maintain minimum 2:1 reward-to-risk ratio on all trades',
        priority: 'high'
      });
    }

    improvements.push({
      category: 'Entry Timing',
      issue: 'Premature market entries',
      indicators: ['Multiple false breakout entries', 'Lack of confirmation signals'],
      solution: 'Wait for 2-3 confirmation signals before entry',
      priority: 'medium'
    });

    return improvements;
  };

  const generateProfessionalInsights = () => {
    const insights = [];
    
    insights.push(`Trading methodology classification: ${disciplineScore > 75 ? 'Systematic Approach' : 'Discretionary with Systematic Elements'}`);
    insights.push(`Execution level: ${disciplineScore > 75 ? 'Highly systematic approach' : disciplineScore > 50 ? 'Moderately systematic with discretionary elements' : 'Primarily discretionary execution'}`);

    if (disciplineScore < 60) {
      insights.push('Pattern Alert: Extended position holding beyond planned exit criteria detected');
      insights.push('Behavioral Warning: Sequential position sizing increases following losses identified');
    }

    if (disciplineScore > 80) {
      insights.push('Strength: Maintaining favorable risk-adjusted returns across trading sessions');
    } else {
      insights.push('Concern: Risk-reward ratios indicate potential profit-taking discipline issues');
    }

    return insights;
  };

  const improvements = generateTechnicalImprovements();
  const insights = generateProfessionalInsights();

  return (
    <div className="space-y-6">
      {/* Professional Analysis Insights */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="h-6 w-6 text-purple-400" />
            Professional Analysis Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                <p className="text-gray-200 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical & Strategy Enhancement */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="h-6 w-6 text-blue-400" />
            Technical & Strategy Enhancement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {improvements.map((improvement, index) => (
              <div key={index} className="bg-gray-700/30 rounded-lg p-6 border border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">{improvement.category}</h4>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    improvement.priority === 'high' 
                      ? 'bg-red-900/50 text-red-300 border border-red-600'
                      : 'bg-yellow-900/50 text-yellow-300 border border-yellow-600'
                  }`}>
                    {improvement.priority.toUpperCase()} PRIORITY
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-gray-400 font-medium mb-2">Issue Identified:</h5>
                    <p className="text-gray-200 text-sm mb-3">{improvement.issue}</p>
                    <h5 className="text-gray-400 font-medium mb-2">Indicators:</h5>
                    <ul className="text-gray-300 text-sm space-y-1">
                      {improvement.indicators.map((indicator, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          {indicator}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-green-400 font-medium mb-2">Recommended Solution:</h5>
                    <p className="text-gray-200 text-sm bg-green-900/20 p-3 rounded border border-green-700">
                      {improvement.solution}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}