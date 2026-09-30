import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingDown, XCircle } from "lucide-react";

interface BrutalTruthSectionProps {
  disciplineScore: number;
  tradeData?: any[];
}

export default function BrutalTruthSection({ disciplineScore, tradeData }: BrutalTruthSectionProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Generate red flags based on discipline score and data
  const generateRedFlags = () => {
    const redFlags = [];
    const cancellationRate = tradeData ? 
      (tradeData.filter(row => row.Status === 'Canceled').length / tradeData.length) * 100 : 32;
    
    if (cancellationRate > 40) {
      redFlags.push({
        severity: 'critical',
        flag: 'Excessive Stop Loss Modifications',
        description: `${cancellationRate.toFixed(1)}% of orders cancelled - indicates emotional interference`,
        action: 'Cease all stop loss modifications immediately'
      });
    }

    if (disciplineScore < 60) {
      redFlags.push({
        severity: 'critical',
        flag: 'Poor Discipline Score',
        description: 'Overall discipline below acceptable threshold',
        action: 'Implement systematic trading rules'
      });
    }

    if (cancellationRate > 25) {
      redFlags.push({
        severity: 'warning',
        flag: 'High Order Modification Rate',
        description: 'Frequent order changes suggest emotional trading',
        action: 'Use preset orders with no modifications'
      });
    }

    return redFlags;
  };

  const redFlags = generateRedFlags();
  const excessLosses = Math.round((100 - disciplineScore) * 150);

  return (
    <div className="space-y-6">
      <Card className="bg-dark-card border-dark-border hover-glow">
        <CardHeader>
          <CardTitle className="text-gradient-rainbow text-center">
            Red Flags Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className={`text-6xl font-bold text-red-400`}>
              {redFlags.length}
            </div>
            <div className="text-xl text-gray-300">
              Critical Issues Identified
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="h-3 rounded-full bg-prop-gradient-red transition-all duration-300"
                style={{ width: `${Math.min(100, redFlags.length * 25)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-black border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-400" />
              Impact Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6 bg-red-900/30 rounded-lg border border-red-500/20">
              <div className="text-3xl font-bold text-red-400">
                {formatCurrency(excessLosses)}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Estimated losses due to poor discipline
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Warning Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {redFlags.slice(0, 3).map((flag, index) => (
                <div key={index} className="text-xs text-gray-300 p-2 bg-red-900/20 rounded border border-red-500/20">
                  {flag.flag}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-yellow-400/20 border-yellow-400 shadow-lg shadow-yellow-400/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            Critical Red Flags Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {redFlags.length > 0 ? (
            <div className="space-y-4">
              {redFlags.map((flag, index) => (
                <div key={index} className={`rounded-lg p-4 border ${
                  flag.severity === 'critical' 
                    ? 'bg-red-900/30 border-red-600' 
                    : 'bg-orange-900/30 border-orange-600'
                }`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 mt-1 flex-shrink-0 ${
                      flag.severity === 'critical' ? 'text-red-400' : 'text-orange-400'
                    }`} />
                    <div className="flex-1">
                      <h4 className={`font-semibold mb-2 ${
                        flag.severity === 'critical' ? 'text-red-300' : 'text-orange-300'
                      }`}>
                        {flag.flag}
                      </h4>
                      <p className="text-gray-200 text-sm mb-2">{flag.description}</p>
                      <p className={`text-sm font-medium ${
                        flag.severity === 'critical' ? 'text-red-200' : 'text-orange-200'
                      }`}>
                        Action Required: {flag.action}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
              <p className="text-green-200 text-center">
                ✅ No critical red flags identified. Continue current discipline practices.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-yellow-400/20 border-yellow-400 shadow-lg shadow-yellow-400/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <XCircle className="h-6 w-6 text-orange-400" />
            Overtrading Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-orange-900/30 rounded-lg p-4 border border-orange-600">
            <h4 className="font-semibold text-orange-300 mb-2">Overtrading Indicators</h4>
            <p className="text-gray-200 text-sm mb-2">Excessive trading frequency reducing overall profitability</p>
            <p className="text-sm font-medium text-orange-200">
              Recommendation: Limit to 3-5 high-quality setups per day
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}