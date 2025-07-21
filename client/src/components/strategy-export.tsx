import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Share2, 
  Download, 
  Copy, 
  ExternalLink, 
  FileText, 
  BarChart3,
  Shield,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle,
  Eye,
  Globe
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import type { Account, Trade } from "@shared/schema";

interface StrategyExportProps {
  accounts: Account[];
  trades: Trade[];
}

interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  winRate: number;
  avgReturn: number;
  maxDrawdown: number;
  riskReward: number;
  timeframe: string;
  markets: string[];
  rules: string[];
  isPublic: boolean;
  downloads: number;
  likes: number;
}

const generateStrategyFromData = (accounts: Account[], trades: Trade[]): StrategyTemplate => {
  const totalPnl = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const winningTrades = trades.filter(trade => trade.pnl > 0);
  const losingTrades = trades.filter(trade => trade.pnl < 0);
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
  const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, trade) => sum + trade.pnl, 0) / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0) / losingTrades.length) : 0;
  const riskReward = avgLoss > 0 ? avgWin / avgLoss : 0;
  
  // Extract symbols for markets
  const markets = [...new Set(trades.map(trade => trade.symbol))];
  
  return {
    id: `strategy-${Date.now()}`,
    name: "My Trading Strategy",
    description: "Automated strategy export based on trading performance",
    winRate,
    avgReturn: totalPnl,
    maxDrawdown: Math.abs(Math.min(...trades.map(trade => trade.pnl), 0)),
    riskReward,
    timeframe: "Multiple",
    markets: markets.slice(0, 5),
    rules: [
      `Maintain ${winRate.toFixed(1)}% win rate minimum`,
      `Risk/Reward ratio of 1:${riskReward.toFixed(1)}`,
      `Maximum daily loss limit: $${(accounts[0]?.dailyLossLimit || 1000).toFixed(0)}`,
      "Follow prop firm rules strictly",
      "Use proper position sizing"
    ],
    isPublic: false,
    downloads: 0,
    likes: 0
  };
};

export default function StrategyExport({ accounts, trades }: StrategyExportProps) {
  const [strategy, setStrategy] = useState<StrategyTemplate>(() => generateStrategyFromData(accounts, trades));
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'pdf' | 'txt' | 'share'>('json');
  const [shareSettings, setShareSettings] = useState({
    isPublic: false,
    allowDownloads: true,
    includeStats: true,
    includeRules: true
  });

  const exportStrategy = () => {
    const exportData = {
      strategy: strategy,
      performance: {
        totalTrades: trades.length,
        totalPnL: trades.reduce((sum, trade) => sum + trade.pnl, 0),
        winRate: strategy.winRate,
        avgReturn: strategy.avgReturn,
        maxDrawdown: strategy.maxDrawdown,
        riskReward: strategy.riskReward
      },
      accounts: accounts.map(acc => ({
        name: acc.name,
        type: acc.type,
        firm: acc.firm,
        startingBalance: acc.startingBalance,
        currentBalance: acc.currentBalance
      })),
      rules: strategy.rules,
      exportDate: new Date().toISOString(),
      version: "1.0"
    };

    if (exportFormat === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${strategy.name.replace(/\s+/g, '_')}_strategy.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'txt') {
      const textContent = `
TRADING STRATEGY EXPORT
=======================

Strategy Name: ${strategy.name}
Description: ${strategy.description}
Export Date: ${new Date().toLocaleDateString()}

PERFORMANCE METRICS
-------------------
Win Rate: ${strategy.winRate.toFixed(1)}%
Average Return: ${formatCurrency(strategy.avgReturn)}
Max Drawdown: ${formatCurrency(strategy.maxDrawdown)}
Risk/Reward Ratio: 1:${strategy.riskReward.toFixed(2)}

TRADING RULES
-------------
${strategy.rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n')}

MARKETS TRADED
--------------
${strategy.markets.join(', ')}

ACCOUNT SUMMARY
---------------
Total Accounts: ${accounts.length}
Total Balance: ${formatCurrency(accounts.reduce((sum, acc) => sum + acc.currentBalance, 0))}
Total Trades: ${trades.length}

Generated by PropJournal Pro - Elite Trading Journal
      `.trim();

      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${strategy.name.replace(/\s+/g, '_')}_strategy.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }

    toast({
      title: "Strategy Exported",
      description: `Your trading strategy has been exported as ${exportFormat.toUpperCase()}`,
    });
    setShowExportDialog(false);
  };

  const shareStrategy = async () => {
    const shareUrl = `https://propjournal.pro/strategies/shared/${strategy.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: strategy.name,
          text: `Check out my trading strategy: ${strategy.description}`,
          url: shareUrl,
        });
      } catch (error) {
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: "Strategy share link has been copied to your clipboard",
      });
    });
  };

  const publishStrategy = () => {
    // Simulate publishing to community
    setStrategy(prev => ({ 
      ...prev, 
      isPublic: true,
      downloads: 0, // Real download count should come from database
      likes: 0 // Real like count should come from database
    }));
    
    toast({
      title: "Strategy Published",
      description: "Your strategy is now available in the community library",
    });
  };

  return (
    <div className="space-y-6">
      {/* Strategy Overview */}
      <Card className="bg-dark-card border-prop-gold/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gradient-gold flex items-center">
              <Share2 className="mr-2 h-5 w-5" />
              Strategy Export & Sharing
            </CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setStrategy(generateStrategyFromData(accounts, trades))}
                className="border-prop-tiffany/30 hover:border-prop-tiffany"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
              <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-prop-gold hover:bg-prop-gold/80">
                    <Download className="h-4 w-4 mr-2" />
                    Export Strategy
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-600 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">Export Trading Strategy</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Strategy Name</label>
                        <Input 
                          value={strategy.name}
                          onChange={(e) => setStrategy(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-gray-700 border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Export Format</label>
                        <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="json">JSON (Data)</SelectItem>
                            <SelectItem value="txt">Text (Report)</SelectItem>
                            <SelectItem value="pdf">PDF (Coming Soon)</SelectItem>
                            <SelectItem value="share">Share Link</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Description</label>
                      <Textarea 
                        value={strategy.description}
                        onChange={(e) => setStrategy(prev => ({ ...prev, description: e.target.value }))}
                        className="bg-gray-700 border-gray-600"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            checked={shareSettings.isPublic}
                            onChange={(e) => setShareSettings(prev => ({ ...prev, isPublic: e.target.checked }))}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-300">Make Public</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            checked={shareSettings.allowDownloads}
                            onChange={(e) => setShareSettings(prev => ({ ...prev, allowDownloads: e.target.checked }))}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-300">Allow Downloads</span>
                        </label>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            checked={shareSettings.includeStats}
                            onChange={(e) => setShareSettings(prev => ({ ...prev, includeStats: e.target.checked }))}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-300">Include Statistics</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            checked={shareSettings.includeRules}
                            onChange={(e) => setShareSettings(prev => ({ ...prev, includeRules: e.target.checked }))}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-300">Include Rules</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button onClick={exportStrategy} className="bg-prop-green hover:bg-prop-green/80">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button onClick={shareStrategy} variant="outline" className="border-prop-tiffany/30">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      {shareSettings.isPublic && (
                        <Button onClick={publishStrategy} className="bg-prop-gold hover:bg-prop-gold/80">
                          <Globe className="h-4 w-4 mr-2" />
                          Publish to Community
                        </Button>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <TrendingUp className="h-8 w-8 text-prop-green mx-auto mb-2" />
              <div className="text-2xl font-bold text-prop-green">{strategy.winRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-400">Win Rate</div>
            </div>
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <Target className="h-8 w-8 text-prop-gold mx-auto mb-2" />
              <div className="text-2xl font-bold text-prop-gold">1:{strategy.riskReward.toFixed(1)}</div>
              <div className="text-sm text-gray-400">Risk/Reward</div>
            </div>
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <BarChart3 className="h-8 w-8 text-prop-tiffany mx-auto mb-2" />
              <div className="text-2xl font-bold text-prop-tiffany">{formatCurrency(strategy.avgReturn)}</div>
              <div className="text-sm text-gray-400">Total Return</div>
            </div>
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <Shield className="h-8 w-8 text-prop-pink mx-auto mb-2" />
              <div className="text-2xl font-bold text-prop-pink">{formatCurrency(strategy.maxDrawdown)}</div>
              <div className="text-sm text-gray-400">Max Drawdown</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Trading Rules</h3>
              <div className="space-y-2">
                {strategy.rules.map((rule, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-prop-green mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Markets & Instruments</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {strategy.markets.map((market, index) => (
                  <Badge key={index} variant="outline" className="text-prop-tiffany border-prop-tiffany/30">
                    {market}
                  </Badge>
                ))}
              </div>
              
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Total Trades:</span>
                  <span className="text-white">{trades.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Accounts:</span>
                  <span className="text-white">{accounts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Timeframes:</span>
                  <span className="text-white">{strategy.timeframe}</span>
                </div>
              </div>
            </div>
          </div>

          {strategy.isPublic && (
            <div className="mt-6 p-4 bg-prop-gold/10 border border-prop-gold/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-prop-gold" />
                  <span className="text-prop-gold font-medium">Published to Community</span>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Download className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300">{strategy.downloads} downloads</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300">{strategy.likes} likes</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}