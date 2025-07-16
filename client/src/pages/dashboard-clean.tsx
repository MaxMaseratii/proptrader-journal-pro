import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, Target, Calendar, Users, Clock, AlertTriangle, BarChart3, Shield, Trophy, Brain, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'wouter';
import { SimpleChart } from '@/components/tradingview/SimpleChart';
import { TradeAnalysisCalendar } from '@/components/trade-analysis-calendar';
import { calculateDisciplinedScore } from '@/lib/discipline-calculator';

export default function Dashboard() {
  const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>([]);
  const [accountSelectionMode, setAccountSelectionMode] = useState<'all' | 'single' | 'multiple'>('all');
  const [payoutStatusAccountId, setPayoutStatusAccountId] = useState<number | null>(null);

  const { data: accounts } = useQuery({ queryKey: ['/api/accounts'] });
  const { data: trades } = useQuery({ queryKey: ['/api/trades'] });
  const { data: user } = useQuery({ queryKey: ['/api/auth/user'] });

  // Load account selection from localStorage
  useEffect(() => {
    const savedSelection = localStorage.getItem('dashboardAccountSelection');
    if (savedSelection) {
      const parsed = JSON.parse(savedSelection);
      setSelectedAccountIds(parsed.accountIds || []);
      setAccountSelectionMode(parsed.mode || 'all');
    }
  }, []);

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getValueColor = (value: number) => {
    if (value > 0) return 'text-green-400';
    if (value < 0) return 'text-red-400';
    return 'text-yellow-400';
  };

  // Calculate filtered data based on selection
  const filteredTrades = selectedAccountIds.length > 0 && accountSelectionMode !== 'all'
    ? trades?.filter(t => selectedAccountIds.includes(t.accountId)) || []
    : trades || [];

  const filteredAccounts = selectedAccountIds.length > 0 && accountSelectionMode !== 'all'
    ? accounts?.filter(a => selectedAccountIds.includes(a.id)) || []
    : accounts || [];

  // Calculate key metrics
  const totalPnl = filteredTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const totalWins = filteredTrades.filter(t => (t.pnl || 0) > 0).length;
  const winRate = filteredTrades.length > 0 ? (totalWins / filteredTrades.length) * 100 : 0;
  const totalInvestment = filteredAccounts.reduce((sum, acc) => sum + (acc.accountCost || 0) + (acc.activationCost || 0), 0);
  const totalBalance = filteredAccounts.reduce((sum, acc) => sum + (acc.startingBalance || 0), 0);
  const totalPortfolioValue = totalBalance + totalPnl;
  const roiPercentage = totalInvestment > 0 ? (totalPnl / totalInvestment) * 100 : 0;

  // Calculate discipline score
  const disciplineScore = filteredAccounts.length > 0 && filteredTrades.length > 0
    ? filteredAccounts.reduce((sum, acc) => {
        const accountTrades = filteredTrades.filter(t => t.accountId === acc.id);
        return sum + calculateDisciplinedScore(acc, accountTrades);
      }, 0) / filteredAccounts.length
    : 0;

  // Calculate daily trade limit
  const today = new Date().toISOString().split('T')[0];
  const todayTrades = filteredTrades.filter(t => t.date.startsWith(today));
  const dailyTradeLimit = 5; // Default limit

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Trading Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Select 
            value={accountSelectionMode === 'all' ? 'all' : selectedAccountIds[0]?.toString() || 'all'} 
            onValueChange={(value) => {
              if (value === 'all') {
                setSelectedAccountIds([]);
                setAccountSelectionMode('all');
              } else {
                setSelectedAccountIds([parseInt(value)]);
                setAccountSelectionMode('single');
              }
              localStorage.setItem('dashboardAccountSelection', JSON.stringify({
                accountIds: value === 'all' ? [] : [parseInt(value)],
                mode: value === 'all' ? 'all' : 'single'
              }));
            }}
          >
            <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="all" className="text-white">All Accounts</SelectItem>
              {accounts?.map(account => (
                <SelectItem key={account.id} value={account.id.toString()} className="text-white">
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ROW 1: CORE METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-yellow-400/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Net Balance</p>
              <p className={`text-xl font-bold ${getValueColor(totalPortfolioValue)}`}>
                {formatCurrency(totalPortfolioValue)}
              </p>
              <p className="text-xs text-gray-500">Total portfolio value</p>
            </div>
            <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-yellow-400/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total P&L</p>
              <p className={`text-xl font-bold ${getValueColor(totalPnl)}`}>
                {formatCurrency(totalPnl)}
              </p>
              <p className="text-xs text-gray-500">All time performance</p>
            </div>
            <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-yellow-400/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Win Rate</p>
              <p className={`text-xl font-bold ${getValueColor(winRate - 50)}`}>
                {winRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">{totalWins} of {filteredTrades.length} trades</p>
            </div>
            <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-yellow-400/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Daily Trade Limit</p>
              <p className={`text-xl font-bold ${todayTrades.length >= dailyTradeLimit ? 'text-red-400' : 'text-green-400'}`}>
                {todayTrades.length}/{dailyTradeLimit}
              </p>
              <p className="text-xs text-gray-500">Today's trades</p>
            </div>
            <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: PERFORMANCE METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-yellow-400/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Discipline Score</p>
              <p className={`text-xl font-bold ${disciplineScore >= 80 ? 'text-green-400' : disciplineScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                {disciplineScore.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">Trading discipline</p>
            </div>
            <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-yellow-400/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Payout Status</p>
              <Select value={payoutStatusAccountId?.toString() || ''} onValueChange={(value) => setPayoutStatusAccountId(parseInt(value))}>
                <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white text-xs mb-2">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {accounts?.filter(a => a.type === 'funded' || a.type === 'live').map(account => (
                    <SelectItem key={account.id} value={account.id.toString()} className="text-white">
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(() => {
                const account = accounts?.find(a => a.id === payoutStatusAccountId);
                if (!account) return <p className="text-xs text-gray-500">Select account</p>;
                
                const accountTrades = trades?.filter(t => t.accountId === account.id) || [];
                const profit = accountTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
                const required = (account.maxNetBalanceForPayout || 0) + (account.minimumPayoutAmount || 0);
                const eligible = profit >= required;
                
                return (
                  <p className={`text-xs ${eligible ? 'text-green-400' : 'text-red-400'}`}>
                    {eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                  </p>
                );
              })()}
            </div>
            <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-yellow-400/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Weekly Performance</p>
              {(() => {
                const startOfWeek = new Date();
                startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
                startOfWeek.setHours(0, 0, 0, 0);
                
                const weeklyTrades = filteredTrades.filter(t => {
                  const tradeDate = new Date(t.date);
                  return tradeDate >= startOfWeek;
                });
                
                const weeklyPnl = weeklyTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
                
                return (
                  <>
                    <p className={`text-xl font-bold ${getValueColor(weeklyPnl)}`}>
                      {formatCurrency(weeklyPnl)}
                    </p>
                    <p className="text-xs text-gray-500">This week's P&L</p>
                  </>
                );
              })()}
            </div>
            <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: INVESTMENT TRACKING */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-yellow-400/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Investment ROI</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Invested:</span>
                  <span>{formatCurrency(totalInvestment)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Returns:</span>
                  <span className={getValueColor(totalPnl)}>{formatCurrency(totalPnl)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>ROI:</span>
                  <span className={getValueColor(roiPercentage)}>{roiPercentage.toFixed(1)}%</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {roiPercentage > 0 ? 'PROFITABLE TRADER' : 'BUILDING CAPITAL'}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-yellow-400/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Account Status</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Challenge:</span>
                  <span className="text-yellow-400">{accounts?.filter(a => a.type === 'challenge').length || 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Funded:</span>
                  <span className="text-green-400">{accounts?.filter(a => a.type === 'funded').length || 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Live:</span>
                  <span className="text-blue-400">{accounts?.filter(a => a.type === 'live').length || 0}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {accounts?.filter(a => a.status === 'active').length || 0} active accounts
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ROW 4: TRADING CALENDAR */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-yellow-400/50 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Calendar className="w-5 h-5 text-yellow-400 mr-2" />
            Trading Calendar
          </h3>
          <Link href="/calendar">
            <Button variant="outline" size="sm" className="text-blue-400 border-blue-400 hover:bg-blue-400/10">
              View Full Calendar
            </Button>
          </Link>
        </div>
        <TradeAnalysisCalendar 
          trades={filteredTrades} 
          accounts={filteredAccounts}
          viewMode="monthly"
          compact={true}
        />
      </div>

      {/* ROW 5: TRADING CHARTS */}
      {filteredTrades.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-yellow-400/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <BarChart3 className="w-5 h-5 text-yellow-400 mr-2" />
              Trading Charts Preview
            </h3>
            <Link href="/charts">
              <Button variant="outline" size="sm" className="text-blue-400 border-blue-400 hover:bg-blue-400/10">
                View All Charts
              </Button>
            </Link>
          </div>
          <div className="h-64">
            <SimpleChart trades={filteredTrades} height={250} />
          </div>
        </div>
      )}
    </div>
  );
}