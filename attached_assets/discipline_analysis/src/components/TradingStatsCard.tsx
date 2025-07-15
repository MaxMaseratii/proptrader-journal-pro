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
    <Card className="bg-dark-card border-dark-border hover-glow">
      <CardHeader>
        <CardTitle className="text-gradient-rainbow flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-prop-gold" />
          Trading Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Total Trades</p>
                <p className="widget-value">{totalTrades}</p>
              </div>
              <div className="widget-icon-square">
                <BarChart3 className="widget-icon" />
              </div>
            </div>
          </div>
          
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Win Rate</p>
                <p className="widget-value text-prop-green">{formatPercentage(winRate)}</p>
              </div>
              <div className="widget-icon-square bg-gradient-to-br from-prop-green/20 to-prop-green/10">
                <BarChart3 className="widget-icon text-prop-green" />
              </div>
            </div>
          </div>
          
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Profit Factor</p>
                <p className="widget-value text-prop-blue">{profitFactor.toFixed(2)}</p>
              </div>
              <div className="widget-icon-square bg-gradient-to-br from-prop-blue/20 to-prop-blue/10">
                <BarChart3 className="widget-icon text-prop-blue" />
              </div>
            </div>
          </div>
          
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Avg Win</p>
                <p className="widget-value text-success-green">{formatCurrency(avgWin)}</p>
              </div>
              <div className="widget-icon-square bg-gradient-to-br from-success-green/20 to-success-green/10">
                <BarChart3 className="widget-icon text-success-green" />
              </div>
            </div>
          </div>
          
          <div className="widget-container">
            <div className="widget-content">
              <div className="widget-left">
                <p className="widget-label">Avg Loss</p>
                <p className="widget-value text-error-red">{formatCurrency(avgLoss)}</p>
              </div>
              <div className="widget-icon-square bg-gradient-to-br from-error-red/20 to-error-red/10">
                <BarChart3 className="widget-icon text-error-red" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}