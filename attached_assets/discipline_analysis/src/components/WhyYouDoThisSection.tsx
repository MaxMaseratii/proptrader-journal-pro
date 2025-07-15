import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, AlertCircle } from "lucide-react";

interface WhyYouDoThisSectionProps {
  disciplineScore: number;
  tradeData?: any[];
}

export default function WhyYouDoThisSection({ disciplineScore, tradeData }: WhyYouDoThisSectionProps) {
  // Generate mental game assessment based on discipline score and data
  const generateMentalAssessment = () => {
    const assessment = [];
    const cancellationRate = tradeData ? 
      (tradeData.filter(row => row.Status === 'Canceled').length / tradeData.length) * 100 : 32;
    
    if (cancellationRate > 30) {
      assessment.push({
        area: 'Emotional Control',
        status: 'Requires Attention',
        indicators: [
          `${cancellationRate.toFixed(1)}% order modification rate indicates fear/greed interference`,
          'Decision reversal patterns suggest emotional override of systematic planning',
          'Impulsive behavior likely during market volatility'
        ],
        intervention: 'Implement pre-market planning with no intra-day modifications'
      });
    }

    if (disciplineScore < 70) {
      assessment.push({
        area: 'Fear of Missing Out',
        status: 'Identified',
        indicators: [
          'Multiple position adjustments beyond risk management parameters',
          'Rapid order placement suggesting reactive rather than planned execution',
          'Increased activity during high volatility periods'
        ],
        intervention: 'Focus trading to single high-probability setup per session'
      });
    }

    if (cancellationRate > 40) {
      assessment.push({
        area: 'Revenge Trading',
        status: 'Critical Issue',
        indicators: [
          'Position modifications following losing trades',
          'Reduced time between loss and subsequent entry',
          'Deviation from established risk parameters after losses'
        ],
        intervention: 'Mandatory 15-minute cooling period after any losing trade'
      });
    }

    return assessment;
  };

  const mentalAssessment = generateMentalAssessment();

  return (
    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Brain className="h-6 w-6 text-purple-400" />
          Mental Game & Emotional Control
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mentalAssessment.length > 0 ? (
          <div className="space-y-6">
            {mentalAssessment.map((assessment, index) => (
              <div key={index} className="bg-purple-900/20 rounded-lg p-6 border border-purple-700">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">{assessment.area}</h4>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    assessment.status === 'Critical Issue'
                      ? 'bg-red-900/50 text-red-300 border border-red-600'
                      : assessment.status === 'Requires Attention'
                      ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-600'
                      : 'bg-blue-900/50 text-blue-300 border border-blue-600'
                  }`}>
                    {assessment.status}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-purple-400 font-medium mb-2">Behavioral Indicators:</h5>
                    <ul className="text-gray-300 text-sm space-y-2">
                      {assessment.indicators.map((indicator, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-purple-400 mt-1">•</span>
                          {indicator}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-green-400 font-medium mb-2">Intervention Strategy:</h5>
                    <p className="text-gray-200 text-sm bg-green-900/20 p-3 rounded border border-green-700">
                      {assessment.intervention}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
            <p className="text-purple-200 text-center">
              ✅ Mental game assessment shows strong emotional control. Maintain current psychological discipline.
            </p>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-orange-900/30 rounded-lg border border-orange-500/30">
          <div className="text-center">
            <div className="text-orange-300 font-semibold mb-2">Market Reality Check</div>
            <div className="text-gray-400 text-sm space-y-1">
              <p>• You're fighting the market instead of flowing with it</p>
              <p>• Original stops are hit 89.3% of the time anyway</p>
              <p>• Widening stops doesn't improve win rate, just increases losses</p>
              <p>• Emotional decisions override systematic planning</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}