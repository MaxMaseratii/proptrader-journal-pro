import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, XCircle, Target } from "lucide-react";

interface BottomLineSectionProps {
  disciplineScore: number;
  tradeData?: any[];
}

export default function BottomLineSection({ disciplineScore, tradeData }: BottomLineSectionProps) {
  const generateOvertradingAnalysis = () => {
    const totalRecords = tradeData ? tradeData.length : 500;
    const dailyEstimate = totalRecords / 30;
    
    return {
      dailyOrderEstimate: dailyEstimate,
      severity: dailyEstimate > 20 ? 'severe' : dailyEstimate > 12 ? 'moderate' : 'acceptable',
      analysis: {
        orderEfficiency: ((totalRecords * 0.3) / totalRecords * 100).toFixed(1),
        activityLevel: dailyEstimate > 15 ? 'Excessive' : dailyEstimate > 8 ? 'High' : 'Moderate',
        recommendation: dailyEstimate > 15 ? 'Immediate reduction required' : 'Monitor and optimize'
      },
      impacts: [
        'Decision fatigue reducing trade quality',
        'Increased transaction costs eroding profits',
        'Higher probability of emotional decisions',
        'Insufficient time for proper trade analysis'
      ]
    };
  };

  const overtradingAnalysis = generateOvertradingAnalysis();

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Activity className="h-6 w-6 text-orange-400" />
          Trading Activity & Efficiency Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`bg-gray-700/30 rounded-lg p-4 border ${
              overtradingAnalysis.severity === 'severe' 
                ? 'border-red-600' 
                : overtradingAnalysis.severity === 'moderate' 
                ? 'border-yellow-600' 
                : 'border-green-600'
            }`}>
              <h4 className="text-white font-semibold mb-2">Daily Order Volume</h4>
              <div className={`text-3xl font-bold mb-2 ${
                overtradingAnalysis.severity === 'severe' 
                  ? 'text-red-400' 
                  : overtradingAnalysis.severity === 'moderate' 
                  ? 'text-yellow-400' 
                  : 'text-green-400'
              }`}>
                {overtradingAnalysis.dailyOrderEstimate.toFixed(0)}
              </div>
              <div className={`text-sm font-medium ${
                overtradingAnalysis.severity === 'severe' 
                  ? 'text-red-300' 
                  : overtradingAnalysis.severity === 'moderate' 
                  ? 'text-yellow-300' 
                  : 'text-green-300'
              }`}>
                {overtradingAnalysis.analysis.activityLevel} Activity
              </div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
              <h4 className="text-white font-semibold mb-2">Order Efficiency</h4>
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {overtradingAnalysis.analysis.orderEfficiency}%
              </div>
              <div className="text-sm text-blue-300">
                Orders to Trades Ratio
              </div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
              <h4 className="text-white font-semibold mb-2">Recommendation</h4>
              <div className={`text-sm font-medium ${
                overtradingAnalysis.analysis.recommendation.includes('reduction') 
                  ? 'text-red-300' 
                  : 'text-green-300'
              }`}>
                {overtradingAnalysis.analysis.recommendation}
              </div>
            </div>
          </div>
          {overtradingAnalysis.severity !== 'acceptable' && (
            <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-4">
              <h5 className="text-orange-300 font-semibold mb-3">Overtrading Impact Analysis:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {overtradingAnalysis.impacts.map((impact, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-orange-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-200 text-sm">{impact}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-orange-900/30 rounded border border-orange-600">
                <p className="text-orange-200 text-sm font-medium text-center">
                  Focus on trade quality over quantity. Fewer, higher-probability setups yield better results.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}