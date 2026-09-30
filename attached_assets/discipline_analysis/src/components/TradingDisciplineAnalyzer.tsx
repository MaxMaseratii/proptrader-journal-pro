import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CsvUploader from './CsvUploader';
import TradingDisciplineSystem from './TradingDisciplineSystem';
import ProfessionalInsights from './ProfessionalInsights';
import ComprehensiveActionPlan from './ComprehensiveActionPlan';
import ProgressTrackingSection from './ProgressTrackingSection';
import BrutalTruthSection from './BrutalTruthSection';
import WhyYouDoThisSection from './WhyYouDoThisSection';
import BottomLineSection from './BottomLineSection';
import ActionPlanSection from './ActionPlanSection';
import TechnicalImprovementsSection from './TechnicalImprovementsSection';
import { Database, FileText, Activity, Brain, Target, TrendingUp, AlertTriangle, Zap } from "lucide-react";

interface DisciplineMetrics {
  totalTrades: number;
  winRate: number;
  disciplineScore: number;
  riskManagementScore: number;
  emotionalControlScore: number;
  consistencyScore: number;
  stopModificationRate: number;
  excessLosses: number;
}

export default function TradingDisciplineAnalyzer() {
  const [selectedAccount, setSelectedAccount] = useState<string>("demo");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [disciplineData, setDisciplineData] = useState<DisciplineMetrics | null>(null);
  const [csvData, setCsvData] = useState<any[] | null>(null);
  const [showUploader, setShowUploader] = useState(true);
  const [activeTab, setActiveTab] = useState("system");
  const [analysisKey, setAnalysisKey] = useState(0);

  const calculateDisciplineMetrics = (data?: any[]): DisciplineMetrics => {
    if (!data || data.length === 0) {
      return {
        totalTrades: 698,
        winRate: 0.364,
        disciplineScore: 67.8,
        riskManagementScore: 72.4,
        emotionalControlScore: 58.9,
        consistencyScore: 64.2,
        stopModificationRate: 32.1,
        excessLosses: 12850
      };
    }

    const cancelledOrders = data.filter(row => row.Status === 'Canceled' || row.Status === 'Cancelled');
    const filledOrders = data.filter(row => row.Status === 'Filled' || row.Status === 'Executed');
    const cancellationRate = data.length > 0 ? (cancelledOrders.length / data.length) * 100 : 0;
    
    // Calculate win rate from filled orders
    const profitableOrders = filledOrders.filter(row => {
      const pnl = parseFloat(row.PnL || row['P&L'] || row.Profit || '0');
      return pnl > 0;
    });
    const winRate = filledOrders.length > 0 ? profitableOrders.length / filledOrders.length : 0.45;
    
    // Calculate discipline score based on cancellation rate
    const disciplineScore = Math.max(0, 100 - cancellationRate * 1.5);
    
    return {
      totalTrades: Math.max(1, Math.floor(filledOrders.length / 2)),
      winRate: winRate,
      disciplineScore: disciplineScore,
      riskManagementScore: Math.max(20, 100 - cancellationRate * 1.2),
      emotionalControlScore: Math.max(15, 100 - cancellationRate * 1.8),
      consistencyScore: Math.max(25, 100 - cancellationRate * 1.1),
      stopModificationRate: cancellationRate,
      excessLosses: Math.round(cancellationRate * 150)
    };
  };

  const analyzeTrading = async () => {
    setIsAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const metrics = calculateDisciplineMetrics(csvData);
      setDisciplineData(metrics);
      setAnalysisKey(prev => prev + 1);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCsvDataLoaded = (data: any[]) => {
    setCsvData(data);
    setShowUploader(false);
    setDisciplineData(null);
    setAnalysisKey(prev => prev + 1);
    setTimeout(() => {
      analyzeTrading();
    }, 500);
  };

  useEffect(() => {
    if (!csvData) {
      analyzeTrading();
    }
  }, [selectedAccount]);

  return (
    <div className="space-y-6">
      {showUploader && (
        <CsvUploader onDataLoaded={handleCsvDataLoaded} />
      )}
      
      {csvData && (
        <Alert className="bg-green-900/20 border-green-500/30">
          <FileText className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-300">
            Analyzing {csvData.length} orders from your CSV file
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4" 
              onClick={() => {
                setShowUploader(true);
                setCsvData(null);
                setDisciplineData(null);
                setAnalysisKey(prev => prev + 1);
              }}
            >
              Upload New File
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Database className="h-5 w-5 text-blue-400" />
            Professional Trading Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select account to analyze" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="demo">Demo Account (Futures)</SelectItem>
                  <SelectItem value="live">Live Account (Forex)</SelectItem>
                  <SelectItem value="csv">{csvData ? 'Uploaded CSV Data' : 'Upload CSV File'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={analyzeTrading} 
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isAnalyzing ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze Trading
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {disciplineData && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Discipline System
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Professional Insights
            </TabsTrigger>
            <TabsTrigger value="redflags" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Red Flags
            </TabsTrigger>
            <TabsTrigger value="mental" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Mental Game
            </TabsTrigger>
            <TabsTrigger value="action" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Action Plan
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="system">
            <TradingDisciplineSystem key={analysisKey} tradeData={csvData} />
          </TabsContent>

          <TabsContent value="insights">
            <div className="space-y-6">
              <TechnicalImprovementsSection 
                key={`tech-${analysisKey}`}
                disciplineScore={disciplineData.disciplineScore} 
                tradeData={csvData} 
              />
              <ProfessionalInsights 
                key={`prof-${analysisKey}`}
                disciplineScore={disciplineData.disciplineScore} 
                tradeData={csvData} 
              />
            </div>
          </TabsContent>

          <TabsContent value="redflags">
            <div className="space-y-6">
              <BrutalTruthSection 
                key={`brutal-${analysisKey}`}
                disciplineScore={disciplineData.disciplineScore} 
                tradeData={csvData} 
              />
              <BottomLineSection 
                key={`bottom-${analysisKey}`}
                disciplineScore={disciplineData.disciplineScore} 
                tradeData={csvData} 
              />
            </div>
          </TabsContent>

          <TabsContent value="mental">
            <WhyYouDoThisSection 
              key={`mental-${analysisKey}`}
              disciplineScore={disciplineData.disciplineScore} 
              tradeData={csvData} 
            />
          </TabsContent>

          <TabsContent value="action">
            <div className="space-y-6">
              <ActionPlanSection 
                key={`action-${analysisKey}`}
                disciplineScore={disciplineData.disciplineScore} 
                tradeData={csvData} 
              />
              <ComprehensiveActionPlan 
                key={`comp-${analysisKey}`}
                disciplineScore={disciplineData.disciplineScore} 
              />
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <ProgressTrackingSection key={`progress-${analysisKey}`} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}