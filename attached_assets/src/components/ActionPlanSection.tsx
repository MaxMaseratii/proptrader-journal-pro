import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, CheckCircle } from "lucide-react";

interface ActionPlanSectionProps {
  actionPlan: string[];
  recommendations: string[];
}

export default function ActionPlanSection({ actionPlan, recommendations }: ActionPlanSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-green-900/20 border-green-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Zap className="h-5 w-5" />
            Immediate Action Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {actionPlan.map((action, index) => {
              const [category, description] = action.split(': ');
              return (
                <div key={index} className="flex items-start gap-3">
                  <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                    {category}
                  </Badge>
                  <span className="text-gray-300 text-sm flex-1">{description}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-900/20 border-blue-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <CheckCircle className="h-5 w-5" />
            Key Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}