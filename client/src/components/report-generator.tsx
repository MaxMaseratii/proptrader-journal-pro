import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatPercentage, formatDate } from "@/lib/utils";
import { 
  Download, 
  FileText, 
  Calendar, 
  BarChart3,
  DollarSign,
  Target,
  TrendingUp,
  Activity,
  Settings
} from "lucide-react";
import type { Account, Trade, JournalEntry } from "@shared/schema";

interface ReportConfig {
  reportType: 'comprehensive' | 'performance' | 'risk' | 'custom';
  accounts: string[];
  dateRange: { from: string; to: string };
  includeCharts: boolean;
  includeTrades: boolean;
  includeJournal: boolean;
  includeMetrics: boolean;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  customTitle?: string;
  customNotes?: string;
}

interface ReportGeneratorProps {
  accounts: Account[];
}

export default function ReportGenerator({ accounts }: ReportGeneratorProps) {
  const [config, setConfig] = useState<ReportConfig>({
    reportType: 'comprehensive',
    accounts: [],
    dateRange: {
      from: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0]
    },
    includeCharts: true,
    includeTrades: true,
    includeJournal: true,
    includeMetrics: true,
    format: 'pdf',
    customTitle: '',
    customNotes: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const { data: trades } = useQuery<Trade[]>({
    queryKey: ['/api/trades'],
  });

  const { data: journalEntries } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal-entries'],
  });

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Filter data based on config
      const filteredTrades = trades?.filter(trade => {
        const inDateRange = trade.date >= config.dateRange.from && trade.date <= config.dateRange.to;
        const inSelectedAccounts = config.accounts.length === 0 || config.accounts.includes(trade.accountId.toString());
        return inDateRange && inSelectedAccounts;
      }) || [];

      const filteredJournal = journalEntries?.filter(entry => {
        const inDateRange = entry.date >= config.dateRange.from && entry.date <= config.dateRange.to;
        const inSelectedAccounts = config.accounts.length === 0 || config.accounts.includes(entry.accountId.toString());
        return inDateRange && inSelectedAccounts;
      }) || [];

      const selectedAccounts = config.accounts.length === 0 
        ? accounts 
        : accounts.filter(acc => config.accounts.includes(acc.id.toString()));

      // Calculate metrics
      const totalPnL = filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0);
      const winningTrades = filteredTrades.filter(trade => trade.pnl > 0);
      const losingTrades = filteredTrades.filter(trade => trade.pnl < 0);
      const winRate = filteredTrades.length > 0 ? (winningTrades.length / filteredTrades.length) * 100 : 0;
      
      const averageWin = winningTrades.length > 0 
        ? winningTrades.reduce((sum, trade) => sum + trade.pnl, 0) / winningTrades.length 
        : 0;
      
      const averageLoss = losingTrades.length > 0 
        ? Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0) / losingTrades.length)
        : 0;

      const profitFactor = averageLoss > 0 ? (averageWin * winningTrades.length) / (averageLoss * losingTrades.length) : 0;

      // Create report data
      const reportData = {
        title: config.customTitle || `Trading Report - ${formatDate(config.dateRange.from)} to ${formatDate(config.dateRange.to)}`,
        generatedAt: new Date().toISOString(),
        config,
        summary: {
          totalTrades: filteredTrades.length,
          totalPnL,
          winRate,
          winningTrades: winningTrades.length,
          losingTrades: losingTrades.length,
          averageWin,
          averageLoss,
          profitFactor,
          largestWin: winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl)) : 0,
          largestLoss: losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnl)) : 0,
          bestDay: getBestWorstDay(filteredTrades).best,
          worstDay: getBestWorstDay(filteredTrades).worst,
          tradingDays: getUniqueTradingDays(filteredTrades),
          accountsAnalyzed: selectedAccounts.length
        },
        accounts: selectedAccounts,
        trades: config.includeTrades ? filteredTrades : [],
        journal: config.includeJournal ? filteredJournal : [],
        notes: config.customNotes || '',
        dateRange: config.dateRange
      };

      // Generate file based on format
      switch (config.format) {
        case 'json':
          downloadJSON(reportData);
          break;
        case 'csv':
          downloadCSV(reportData);
          break;
        case 'excel':
          // For now, generate CSV as Excel requires additional libraries
          downloadCSV(reportData);
          break;
        case 'pdf':
          // Generate proper PDF instead of JSON
          downloadPDF(reportData);
          break;
        default:
          downloadJSON(reportData);
      }

    } catch (error) {
      console.error('Report generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadJSON = (data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `trading-report-${new Date().toISOString().split('T')[0]}.json`);
  };

  const downloadPDF = (data: any) => {
    // Generate HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${data.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
          .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
          .metric { padding: 15px; background: #f5f5f5; border-radius: 8px; text-align: center; }
          .metric h3 { margin: 0 0 10px 0; color: #333; }
          .metric .value { font-size: 24px; font-weight: bold; color: #2563eb; }
          .positive { color: #16a34a; }
          .negative { color: #dc2626; }
          .trades-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .trades-table th, .trades-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .trades-table th { background: #f8f9fa; }
          .section { margin: 30px 0; }
          .section h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${data.title}</h1>
          <p>Generated on: ${new Date(data.generatedAt).toLocaleDateString()}</p>
          <p>Date Range: ${data.dateRange.from} to ${data.dateRange.to}</p>
        </div>
        
        <div class="section">
          <h2>Performance Summary</h2>
          <div class="summary">
            <div class="metric">
              <h3>Total Trades</h3>
              <div class="value">${data.summary.totalTrades}</div>
            </div>
            <div class="metric">
              <h3>Total P&L</h3>
              <div class="value ${data.summary.totalPnL >= 0 ? 'positive' : 'negative'}">
                $${data.summary.totalPnL.toFixed(2)}
              </div>
            </div>
            <div class="metric">
              <h3>Win Rate</h3>
              <div class="value">${(data.summary.winRate * 100).toFixed(1)}%</div>
            </div>
            <div class="metric">
              <h3>Profit Factor</h3>
              <div class="value">${data.summary.profitFactor.toFixed(2)}</div>
            </div>
            <div class="metric">
              <h3>Best Trade</h3>
              <div class="value positive">$${data.summary.largestWin.toFixed(2)}</div>
            </div>
            <div class="metric">
              <h3>Worst Trade</h3>
              <div class="value negative">$${data.summary.largestLoss.toFixed(2)}</div>
            </div>
          </div>
        </div>

        ${data.trades && data.trades.length > 0 ? `
        <div class="section">
          <h2>Recent Trades</h2>
          <table class="trades-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Symbol</th>
                <th>Side</th>
                <th>Quantity</th>
                <th>Entry Price</th>
                <th>Exit Price</th>
                <th>P&L</th>
              </tr>
            </thead>
            <tbody>
              ${data.trades.slice(-50).map((trade: any) => `
                <tr>
                  <td>${trade.date}</td>
                  <td>${trade.symbol}</td>
                  <td>${trade.side}</td>
                  <td>${trade.quantity}</td>
                  <td>${trade.entryPrice}</td>
                  <td>${trade.exitPrice}</td>
                  <td class="${trade.pnl >= 0 ? 'positive' : 'negative'}">$${trade.pnl.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${data.notes ? `
        <div class="section">
          <h2>Notes</h2>
          <p>${data.notes}</p>
        </div>
        ` : ''}
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    downloadBlob(blob, `trading-report-${new Date().toISOString().split('T')[0]}.html`);
  };

  const downloadCSV = (data: any) => {
    let csvContent = '';
    
    // Add summary
    csvContent += 'TRADING REPORT SUMMARY\n';
    csvContent += `Generated,${data.generatedAt}\n`;
    csvContent += `Period,${formatDate(data.dateRange.from)} to ${formatDate(data.dateRange.to)}\n`;
    csvContent += `Total Trades,${data.summary.totalTrades}\n`;
    csvContent += `Total P&L,${data.summary.totalPnL}\n`;
    csvContent += `Win Rate,${data.summary.winRate.toFixed(2)}%\n`;
    csvContent += `Profit Factor,${data.summary.profitFactor.toFixed(2)}\n`;
    csvContent += `Best Day,${data.summary.bestDay}\n`;
    csvContent += `Worst Day,${data.summary.worstDay}\n`;
    csvContent += '\n';

    // Add trades if included
    if (data.trades.length > 0) {
      csvContent += 'TRADES\n';
      csvContent += 'Date,Symbol,Side,Quantity,Entry Price,Exit Price,P&L,Account\n';
      data.trades.forEach((trade: Trade) => {
        const account = data.accounts.find((acc: Account) => acc.id === trade.accountId);
        csvContent += `${trade.date},${trade.symbol},${trade.side},${trade.quantity},${trade.entryPrice},${trade.exitPrice || 'N/A'},${trade.pnl},${account?.name || 'Unknown'}\n`;
      });
      csvContent += '\n';
    }

    // Add journal entries if included
    if (data.journal.length > 0) {
      csvContent += 'JOURNAL ENTRIES\n';
      csvContent += 'Date,What Went Wrong,What Went Right,Improvement Plan,Account\n';
      data.journal.forEach((entry: JournalEntry) => {
        const account = data.accounts.find((acc: Account) => acc.id === entry.accountId);
        csvContent += `${entry.date},"${entry.whatWentWrong || ''}","${entry.whatWentRight || ''}","${entry.improvementPlan || ''}",${account?.name || 'Unknown'}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    downloadBlob(blob, `trading-report-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getBestWorstDay = (trades: Trade[]) => {
    const dailyPnL = new Map<string, number>();
    
    trades.forEach(trade => {
      const current = dailyPnL.get(trade.date) || 0;
      dailyPnL.set(trade.date, current + trade.pnl);
    });

    const values = Array.from(dailyPnL.values());
    return {
      best: values.length > 0 ? Math.max(...values) : 0,
      worst: values.length > 0 ? Math.min(...values) : 0
    };
  };

  const getUniqueTradingDays = (trades: Trade[]) => {
    return new Set(trades.map(trade => trade.date)).size;
  };

  const reportTypes = [
    { value: 'comprehensive', label: 'Comprehensive Report', icon: FileText },
    { value: 'performance', label: 'Performance Only', icon: BarChart3 },
    { value: 'risk', label: 'Risk Analysis', icon: Target },
    { value: 'custom', label: 'Custom Report', icon: Settings }
  ];

  const formats = [
    { value: 'json', label: 'JSON Data', description: 'Structured data format' },
    { value: 'csv', label: 'CSV Export', description: 'Spreadsheet compatible' },
    { value: 'excel', label: 'Excel File', description: 'Advanced spreadsheet' },
    { value: 'pdf', label: 'PDF Report', description: 'Professional document' }
  ];

  return (
    <Card className="widget-bg border-prop-gold/20">
      <CardHeader>
        <CardTitle className="widget-header flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-400" />
          Report Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Type Selection */}
        <div>
          <Label className="widget-text mb-3 block">Report Type</Label>
          <div className="grid grid-cols-2 gap-3">
            {reportTypes.map((type) => (
              <Button
                key={type.value}
                variant={config.reportType === type.value ? "default" : "outline"}
                className={`justify-start h-auto p-3 ${
                  config.reportType === type.value 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "widget-bg border-prop-gold/20 hover:bg-muted widget-text"
                }`}
                onClick={() => setConfig(prev => ({ ...prev, reportType: type.value as any }))}
              >
                <type.icon className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">{type.label}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Account Selection */}
        <div>
          <Label className="widget-text mb-2 block">Accounts to Include</Label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="all-accounts"
                checked={config.accounts.length === 0}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ 
                    ...prev, 
                    accounts: checked ? [] : accounts.map(acc => acc.id.toString())
                  }))
                }
              />
              <Label htmlFor="all-accounts" className="text-sm font-medium">
                All Accounts
              </Label>
            </div>
            {accounts.map((account) => (
              <div key={account.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`account-${account.id}`}
                  checked={config.accounts.includes(account.id.toString())}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setConfig(prev => ({ 
                        ...prev, 
                        accounts: [...prev.accounts, account.id.toString()]
                      }));
                    } else {
                      setConfig(prev => ({ 
                        ...prev, 
                        accounts: prev.accounts.filter(id => id !== account.id.toString())
                      }));
                    }
                  }}
                />
                <Label htmlFor={`account-${account.id}`} className="text-sm">
                  {account.name} ({account.type})
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="widget-text">From Date</Label>
            <Input
              type="date"
              value={config.dateRange.from}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                dateRange: { ...prev.dateRange, from: e.target.value }
              }))}
              className="widget-input"
            />
          </div>
          <div>
            <Label className="widget-text">To Date</Label>
            <Input
              type="date"
              value={config.dateRange.to}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                dateRange: { ...prev.dateRange, to: e.target.value }
              }))}
              className="widget-input"
            />
          </div>
        </div>

        {/* Content Options */}
        <div>
          <Label className="widget-text mb-3 block">Include in Report</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-metrics"
                checked={config.includeMetrics}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ ...prev, includeMetrics: checked as boolean }))
                }
              />
              <Label htmlFor="include-metrics" className="text-sm">
                Performance Metrics & Statistics
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-trades"
                checked={config.includeTrades}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ ...prev, includeTrades: checked as boolean }))
                }
              />
              <Label htmlFor="include-trades" className="text-sm">
                Individual Trades Data
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-journal"
                checked={config.includeJournal}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ ...prev, includeJournal: checked as boolean }))
                }
              />
              <Label htmlFor="include-journal" className="text-sm">
                Journal Entries
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-charts"
                checked={config.includeCharts}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ ...prev, includeCharts: checked as boolean }))
                }
              />
              <Label htmlFor="include-charts" className="text-sm">
                Charts & Visualizations
              </Label>
            </div>
          </div>
        </div>

        {/* Custom Options */}
        {config.reportType === 'custom' && (
          <div className="space-y-4">
            <div>
              <Label className="widget-text">Custom Report Title</Label>
              <Input
                value={config.customTitle}
                onChange={(e) => setConfig(prev => ({ ...prev, customTitle: e.target.value }))}
                placeholder="Enter custom report title..."
                className="widget-input"
              />
            </div>
            <div>
              <Label className="widget-text">Additional Notes</Label>
              <Textarea
                value={config.customNotes}
                onChange={(e) => setConfig(prev => ({ ...prev, customNotes: e.target.value }))}
                placeholder="Add any additional notes or context for this report..."
                className="widget-input"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Format Selection */}
        <div>
          <Label className="widget-text mb-3 block">Export Format</Label>
          <div className="grid grid-cols-2 gap-3">
            {formats.map((format) => (
              <Button
                key={format.value}
                variant={config.format === format.value ? "default" : "outline"}
                className={`justify-start h-auto p-3 ${
                  config.format === format.value 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "widget-bg border-prop-gold/20 hover:bg-muted widget-text"
                }`}
                onClick={() => setConfig(prev => ({ ...prev, format: format.value as any }))}
              >
                <div className="text-left">
                  <div className="font-medium">{format.label}</div>
                  <div className="text-xs widget-text opacity-70">{format.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={generateReport}
          disabled={isGenerating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isGenerating ? (
            <>
              <Activity className="h-4 w-4 mr-2 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </>
          )}
        </Button>

        {/* Report Preview */}
        <div className="bg-gray-900 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Report Preview</h4>
          <div className="text-sm text-gray-400 space-y-1">
            <div>Type: {reportTypes.find(t => t.value === config.reportType)?.label}</div>
            <div>Accounts: {config.accounts.length === 0 ? 'All' : config.accounts.length}</div>
            <div>Period: {formatDate(config.dateRange.from)} to {formatDate(config.dateRange.to)}</div>
            <div>Format: {formats.find(f => f.value === config.format)?.label}</div>
            <div className="flex gap-2 mt-2">
              {config.includeMetrics && <Badge variant="secondary">Metrics</Badge>}
              {config.includeTrades && <Badge variant="secondary">Trades</Badge>}
              {config.includeJournal && <Badge variant="secondary">Journal</Badge>}
              {config.includeCharts && <Badge variant="secondary">Charts</Badge>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}