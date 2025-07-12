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
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <Card className={`backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-white">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
          {score.toFixed(1)}
        </div>
        <Progress value={score} className="mt-2 h-2" />
        <div className="mt-2 text-xs text-gray-400">
          {description}
        </div>
      </CardContent>
    </Card>
  );
}