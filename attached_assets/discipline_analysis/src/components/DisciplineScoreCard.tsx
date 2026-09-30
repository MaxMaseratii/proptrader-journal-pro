import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Brain, Target } from "lucide-react";

interface DisciplineScoreCardProps {
  score: number;
  title: string;
  icon: React.ReactNode;
  description: string;
  className?: string;
}

export default function DisciplineScoreCard({ score, title, icon, description, className }: DisciplineScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-prop-green";
    if (score >= 60) return "text-prop-gold";
    return "text-prop-pink";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-prop-green";
    if (score >= 60) return "bg-prop-gold";
    return "bg-prop-pink";
  };

  return (
    <Card className={`bg-dark-card border-dark-border hover-glow ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-gradient-rainbow text-sm flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="widget-container">
          <div className="widget-content">
            <div className="widget-left">
              <p className="widget-label">{title}</p>
              <p className={`widget-value ${getScoreColor(score)}`}>
                {score.toFixed(1)}
              </p>
              <p className="widget-description">{description}</p>
            </div>
            <div className="widget-icon-square">
              {icon}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(score)}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}