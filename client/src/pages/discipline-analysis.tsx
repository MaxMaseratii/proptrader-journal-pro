import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, TrendingUp, AlertTriangle, Target, Clock } from "lucide-react";
import DisciplineAnalyzer from "@/components/discipline-analyzer";
import type { Account } from "@shared/schema";

export default function DisciplineAnalysis() {
  const [selectedAccount, setSelectedAccount] = useState<string>("all");

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Discipline Analysis
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Advanced psychological analysis of your trading behavior and discipline patterns
          </p>
        </div>

        {/* Account Selection */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" />
              Analysis Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Account for Analysis
                </label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Choose account to analyze" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All Accounts</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.name} ({account.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="h-4 w-4" />
                <span>Real-time analysis</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="h-8 w-8 text-blue-400" />
                <div>
                  <h3 className="font-semibold text-white">Behavioral Analysis</h3>
                  <p className="text-sm text-blue-300">20+ metrics tracked</p>
                </div>
              </div>
              <p className="text-sm text-gray-300">
                Comprehensive analysis of trading psychology and decision-making patterns
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="h-8 w-8 text-purple-400" />
                <div>
                  <h3 className="font-semibold text-white">Discipline Score</h3>
                  <p className="text-sm text-purple-300">4-part system</p>
                </div>
              </div>
              <p className="text-sm text-gray-300">
                Order discipline, risk control, emotional control, and consistency metrics
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="h-8 w-8 text-orange-400" />
                <div>
                  <h3 className="font-semibold text-white">Pattern Detection</h3>
                  <p className="text-sm text-orange-300">Revenge trading & FOMO</p>
                </div>
              </div>
              <p className="text-sm text-gray-300">
                Identifies emotional trading patterns and psychological triggers
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Target className="h-8 w-8 text-green-400" />
                <div>
                  <h3 className="font-semibold text-white">Platform Support</h3>
                  <p className="text-sm text-green-300">All major brokers</p>
                </div>
              </div>
              <p className="text-sm text-gray-300">
                Supports Tradovate, MT4/5, Rithmic, NinjaTrader, and more
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Discipline Analyzer Component */}
        <DisciplineAnalyzer />

        {/* Tips Section */}
        <Card className="bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              Tips for Better Discipline Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-3">CSV Import Requirements</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    Upload complete trading history including all orders (filled, cancelled, rejected)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    Ensure timestamps are accurate for proper chronological analysis
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    Include stop loss and take profit order modifications for discipline tracking
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">Interpreting Your Scores</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <strong>90-100:</strong> Excellent discipline - maintain current approach
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    <strong>70-89:</strong> Good discipline - minor improvements needed
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400">•</span>
                    <strong>50-69:</strong> Moderate discipline - focus on emotional control
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <strong>Below 50:</strong> Needs improvement - review risk management
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}