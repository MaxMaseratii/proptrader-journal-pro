import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, AlertCircle } from "lucide-react";

interface WhyYouDoThisSectionProps {
  reasons: string[];
}

export default function WhyYouDoThisSection({ reasons }: WhyYouDoThisSectionProps) {
  return (
    <Card className="bg-orange-900/20 border-orange-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-400">
          <Brain className="h-6 w-6" />
          Why You're Doing This - Psychology Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reasons.map((reason, index) => {
            const [title, description] = reason.split(': ');
            return (
              <div key={index} className="p-4 bg-orange-900/20 rounded-lg border border-orange-500/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-orange-300 text-sm mb-1">{title}</div>
                    <div className="text-gray-400 text-xs">{description}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 p-4 bg-orange-900/30 rounded-lg border border-orange-500/30">
          <div className="text-center">
            <div className="text-orange-300 font-semibold mb-2">Market Impact</div>
            <div className="text-gray-400 text-sm space-y-1">
              <p>• You're fighting the market instead of flowing with it</p>
              <p>• Original stops are hit 89.3% of the time anyway</p>
              <p>• Widening stops doesn't improve win rate, just increases losses</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}