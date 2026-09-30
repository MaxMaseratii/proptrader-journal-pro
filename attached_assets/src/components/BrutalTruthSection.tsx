import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingDown } from "lucide-react";

interface BrutalTruthSectionProps {
  truths: string[];
  excessLosses: number;
}

export default function BrutalTruthSection({ truths, excessLosses }: BrutalTruthSectionProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card className="bg-red-900/20 border-red-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="h-6 w-6" />
          The Brutal Truth
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center p-6 bg-red-900/30 rounded-lg border border-red-500/20">
            <TrendingDown className="h-12 w-12 text-red-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-red-400">
              {formatCurrency(excessLosses)}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              Lost due to poor discipline
            </div>
          </div>
          <ul className="space-y-3">
            {truths.map((truth, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-300 text-sm leading-relaxed">{truth}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}