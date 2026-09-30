import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface TradingStatsCardProps {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
}

export default function TradingStatsCard({ totalTrades, winRate, profitFactor, avgWin, avgLoss }: TradingStatsCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <BarChart3 className="h-5 w-5 text-yellow-400" />
          Trading Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{totalTrades}</div>
            <div className="text-sm text-gray-400">Total Trades</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{formatPercentage(winRate)}</div>
            <div className="text-sm text-gray-400">Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{profitFactor.toFixed(2)}</div>
            <div className="text-sm text-gray-400">Profit Factor</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{formatCurrency(avgWin)}</div>
            <div className="text-sm text-gray-400">Avg Win</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{formatCurrency(avgLoss)}</div>
            <div className="text-sm text-gray-400">Avg Loss</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}