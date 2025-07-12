import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign } from "lucide-react";

interface BottomLineSectionProps {
  excessLosses: number;
  originalStopAccuracy: number;
}

export default function BottomLineSection({ excessLosses, originalStopAccuracy }: BottomLineSectionProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border-green-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold text-white">
          💥 BOTTOM LINE
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-6">
          <div className="p-6 bg-green-900/20 rounded-lg border border-green-500/20">
            <DollarSign className="h-12 w-12 text-green-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-green-400 mb-2">
              {formatCurrency(excessLosses)}
            </div>
            <div className="text-gray-300 text-lg mb-4">
              Monthly cost of poor discipline
            </div>
            <div className="text-gray-400 text-sm">
              Your stop loss discipline is costing you approximately $2,000+ per month
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
              <TrendingUp className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-blue-400">{originalStopAccuracy}%</div>
              <div className="text-gray-400 text-sm">Original stop accuracy</div>
            </div>
            <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
              <div className="text-xl font-bold text-purple-400">Excellent</div>
              <div className="text-gray-400 text-sm">Market timing skills</div>
            </div>
          </div>
          
          <div className="text-gray-300 space-y-2">
            <p className="font-semibold">You have excellent market timing and trade management skills, but you're sabotaging yourself by not trusting your original plan.</p>
            <p>If you fix ONLY this one issue - keeping original stops - you'll become consistently profitable immediately.</p>
            <p className="text-green-400 font-bold">The data is crystal clear: Your first instinct on stop placement is right 73.8% of the time. Trust it.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}