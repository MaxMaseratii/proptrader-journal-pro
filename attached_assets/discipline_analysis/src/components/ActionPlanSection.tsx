import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Clock, Target, Award, CheckCircle } from "lucide-react";

interface ActionPlanSectionProps {
  disciplineScore: number;
  tradeData?: any[];
}

export default function ActionPlanSection({ disciplineScore, tradeData }: ActionPlanSectionProps) {
  const generateActionPlan = () => {
    const plan = {
      immediate: [],
      shortTerm: [],
      longTerm: []
    };

    if (disciplineScore < 60) {
      plan.immediate.push('Suspend live trading until discipline protocols are established');
      plan.immediate.push('Implement paper trading with strict rule adherence tracking');
    } else {
      plan.immediate.push('Review and document current trading rules');
      plan.immediate.push('Set up daily discipline tracking system');
    }

    plan.shortTerm.push('Establish daily performance review routine');
    plan.shortTerm.push('Track discipline metrics on weekly basis');
    plan.shortTerm.push('Implement maximum daily loss limits');
    
    plan.longTerm.push('Develop systematic trading methodology');
    plan.longTerm.push('Build consistent profitability through disciplined execution');
    plan.longTerm.push('Create comprehensive trading business plan');

    return plan;
  };

  const generateRecommendations = () => {
    const recommendations = [];
    
    if (disciplineScore < 60) {
      recommendations.push('Critical Priority: Implement systematic entry/exit protocols with predefined risk parameters');
      recommendations.push('Risk Framework: Establish maximum daily drawdown limits with automatic position closure');
    }

    recommendations.push('Execution Protocol: Institute non-negotiable stop loss adherence - no intra-trade modifications');
    recommendations.push('Focus Strategy: Limit trading to maximum 2 instruments until consistency achieved');
    recommendations.push('Process Development: Create systematic decision trees for entry and exit criteria');

    return recommendations;
  };

  const actionPlan = generateActionPlan();
  const recommendations = generateRecommendations();
  const totalActions = actionPlan.immediate.length + actionPlan.shortTerm.length + actionPlan.longTerm.length;

  return (
    <div className="space-y-6">
      <Card className="bg-dark-card border-dark-border hover-glow">
        <CardHeader>
          <CardTitle className="text-gradient-rainbow text-center">
            Action Plan Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-green-400">
              {totalActions}
            </div>
            <div className="text-xl text-gray-300">
              Strategic Actions Required
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="h-3 rounded-full bg-prop-gradient-green transition-all duration-300"
                style={{ width: `${Math.min(100, (totalActions / 10) * 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Zap className="h-6 w-6 text-yellow-400" />
            Strategic Action Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Immediate (This Week)
              </h4>
              <div className="space-y-3">
                {actionPlan.immediate.map((action, index) => (
                  <div key={index} className="bg-yellow-400/20 border border-yellow-400 rounded-lg p-3 shadow-lg shadow-yellow-400/20">
                    <p className="text-gray-200 text-sm">{action}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Short-term (30 Days)
              </h4>
              <div className="space-y-3">
                {actionPlan.shortTerm.map((action, index) => (
                  <div key={index} className="bg-yellow-400/20 border border-yellow-400 rounded-lg p-3 shadow-lg shadow-yellow-400/20">
                    <p className="text-gray-200 text-sm">{action}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Long-term (90 Days)
              </h4>
              <div className="space-y-3">
                {actionPlan.longTerm.map((action, index) => (
                  <div key={index} className="bg-yellow-400/20 border border-yellow-400 rounded-lg p-3 shadow-lg shadow-yellow-400/20">
                    <p className="text-gray-200 text-sm">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <CheckCircle className="h-6 w-6 text-green-400" />
            Strategic Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <p className="text-gray-200">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-500/20 border-green-500 shadow-lg shadow-green-500/20">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Key Takeaway</h3>
          <p className="text-xl text-gray-200 leading-relaxed max-w-4xl mx-auto">
            Trading discipline drives long-term profitability more than market analysis or timing. 
            The metrics clearly demonstrate that systematic execution and emotional control 
            are fundamental to sustainable trading success.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}