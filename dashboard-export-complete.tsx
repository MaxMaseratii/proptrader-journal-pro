// PropTraderJournal Dashboard - Complete Export
// This file contains the complete dashboard with all styling and functionality
// Ready for upload to another system

import React from 'react';
import { useQuery } from "@tanstack/react-query";

// Mock data structure for external implementation
interface Account {
  id: number;
  name: string;
  type: string;
  status: string;
  currentBalance: number;
  startingBalance: number;
  accountCost?: number;
  activationCost?: number;
}

interface Trade {
  id: number;
  accountId: number;
  date: string;
  symbol: string;
  side: string;
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  pnl: number;
  initialStopLoss?: number;
  initialTakeProfit?: number;
  finalStopLoss?: number;
  finalTakeProfit?: number;
}

interface JournalEntry {
  id: number;
  accountId: number;
  date: string;
  content: string;
}

// CSS Variables - Add these to your CSS file
const CSS_VARIABLES = `
:root {
  --prop-black: hsl(0, 0%, 4%);
  --prop-dark: hsl(0, 0%, 10%);
  --prop-surface: hsl(0, 0%, 12%);
  --prop-gold: hsl(45, 100%, 55%);
  --prop-gold-light: hsl(45, 100%, 65%);
  --prop-tiffany: hsl(180, 70%, 55%);
  --prop-tiffany-light: hsl(180, 80%, 65%);
  --prop-green: hsl(142, 76%, 36%);
  --prop-green-light: hsl(142, 76%, 46%);
  --prop-blue: hsl(217, 91%, 60%);
  --prop-blue-light: hsl(217, 91%, 70%);
  --prop-pink: hsl(322, 100%, 70%);
  --prop-pink-light: hsl(322, 100%, 80%);
  --dark-card: hsl(0, 0%, 8%);
  --dark-border: hsl(0, 0%, 15%);
}

/* Widget Styling */
.bg-prop-card {
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 215, 0, 0.1);
}

.hover-glow:hover {
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
  transform: translateY(-2px);
  border-color: rgba(217, 163, 26, 0.5);
  background: linear-gradient(135deg, 
    rgba(217, 163, 26, 0.04) 0%, 
    var(--dark-card) 50%, 
    rgba(217, 163, 26, 0.04) 100%);
}

.bg-prop-gradient-gold {
  background: linear-gradient(135deg, var(--prop-gold) 0%, var(--prop-gold-light) 100%);
}

.bg-prop-gradient-tiffany {
  background: linear-gradient(135deg, var(--prop-tiffany) 0%, var(--prop-tiffany-light) 100%);
}

.bg-prop-gradient-green {
  background: linear-gradient(135deg, var(--prop-green) 0%, var(--prop-green-light) 100%);
}

.bg-prop-gradient-blue {
  background: linear-gradient(135deg, var(--prop-blue) 0%, var(--prop-blue-light) 100%);
}

.bg-prop-gradient-pink {
  background: linear-gradient(135deg, var(--prop-pink) 0%, var(--prop-pink-light) 100%);
}

.bg-prop-gradient-main {
  background: linear-gradient(135deg, var(--prop-black) 0%, var(--prop-dark) 50%, var(--prop-black) 100%);
}

.text-gradient-rainbow {
  background: linear-gradient(135deg, 
    var(--prop-gold) 0%, 
    var(--prop-tiffany) 25%, 
    var(--prop-green) 50%, 
    var(--prop-blue) 75%, 
    var(--prop-pink) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Color Classes */
.text-prop-gold { color: var(--prop-gold); }
.text-prop-tiffany { color: var(--prop-tiffany); }
.text-prop-green { color: var(--prop-green); }
.text-prop-blue { color: var(--prop-blue); }
.text-prop-pink { color: var(--prop-pink); }
.border-prop-gold { border-color: rgba(255, 215, 0, 0.2); }
.border-prop-tiffany { border-color: rgba(180, 70, 55, 0.2); }
.border-prop-green { border-color: rgba(142, 76, 36, 0.2); }
.border-prop-blue { border-color: rgba(217, 91, 60, 0.2); }
.border-prop-pink { border-color: rgba(322, 100, 70, 0.2); }

/* Smooth Transitions */
.smooth-transition {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
`;

// Icon Components (replace with your icon library)
const DollarSign = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const TrendingUp = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17l6-6 4 4 8-8M21 7v6h-6"/>
  </svg>
);

const TrendingDown = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 7l6 6 4-4 8 8M21 17v-6h-6"/>
  </svg>
);

const Target = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const BarChart3 = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 3v18h18M12 17V9M8 17v-3M16 17V5"/>
  </svg>
);

const Shield = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const Activity = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);

const Calendar = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const PlusCircle = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v8M8 12h8"/>
  </svg>
);

const BookOpen = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const Upload = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17,8 12,3 7,8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const Filter = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
  </svg>
);

const Clock = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

// UI Components (replace with your UI library)
const Card = ({ children, className = "" }) => (
  <div className={`rounded-lg ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-6 pb-0 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-0 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = "default", className = "", onClick, ...props }) => (
  <button 
    className={`px-4 py-2 rounded-lg font-medium transition-all ${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);

const Badge = ({ children, variant = "default", className = "" }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

const Progress = ({ value, className = "" }) => (
  <div className={`w-full bg-gray-700 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
      style={{ width: `${value}%` }}
    ></div>
  </div>
);

const Select = ({ children, defaultValue, onValueChange }) => (
  <select 
    className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2"
    defaultValue={defaultValue}
    onChange={(e) => onValueChange && onValueChange(e.target.value)}
  >
    {children}
  </select>
);

const SelectTrigger = ({ children, className = "" }) => (
  <div className={className}>
    {children}
  </div>
);

const SelectValue = ({ placeholder }) => (
  <span>{placeholder}</span>
);

const SelectContent = ({ children }) => (
  <div>{children}</div>
);

const SelectItem = ({ children, value }) => (
  <option value={value}>{children}</option>
);

const Tabs = ({ children, defaultValue, className = "" }) => (
  <div className={`tabs-container ${className}`}>
    {children}
  </div>
);

const TabsList = ({ children, className = "" }) => (
  <div className={`flex space-x-2 ${className}`}>
    {children}
  </div>
);

const TabsTrigger = ({ children, value, className = "" }) => (
  <button className={`px-4 py-2 rounded-lg ${className}`}>
    {children}
  </button>
);

const TabsContent = ({ children, value, className = "" }) => (
  <div className={`mt-4 ${className}`}>
    {children}
  </div>
);

// Main Dashboard Component
export default function PropTraderJournalDashboard() {
  // Mock data - replace with your actual data fetching
  const mockAccounts = [
    {
      id: 1,
      name: "FTMO Challenge",
      type: "challenge",
      status: "active",
      currentBalance: 150000,
      startingBalance: 150000,
      accountCost: 540,
      activationCost: 0
    },
    {
      id: 2,
      name: "Funded Account",
      type: "funded",
      status: "funded",
      currentBalance: 98500,
      startingBalance: 100000,
      accountCost: 340,
      activationCost: 199
    }
  ];

  const mockTrades = [
    {
      id: 1,
      accountId: 1,
      date: "2024-01-15",
      symbol: "MNQ",
      side: "buy",
      quantity: 2,
      entryPrice: 16250.25,
      exitPrice: 16275.50,
      pnl: 101.50,
      initialStopLoss: 16230.00,
      initialTakeProfit: 16280.00,
      finalStopLoss: 16240.00,
      finalTakeProfit: 16275.50
    },
    {
      id: 2,
      accountId: 1,
      date: "2024-01-14",
      symbol: "ES",
      side: "sell",
      quantity: 1,
      entryPrice: 4785.25,
      exitPrice: 4770.00,
      pnl: 765.00,
      initialStopLoss: 4795.00,
      initialTakeProfit: 4770.00,
      finalStopLoss: 4790.00,
      finalTakeProfit: 4770.00
    }
  ];

  const mockJournalEntries = [
    {
      id: 1,
      accountId: 1,
      date: "2024-01-15",
      content: "Great discipline today, followed my trading plan exactly."
    }
  ];

  // Use mock data or replace with your data fetching logic
  const accounts = mockAccounts;
  const trades = mockTrades;
  const journalEntries = mockJournalEntries;

  // Calculate portfolio metrics
  const totalPortfolioValue = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
  const totalInvested = accounts.reduce((sum, acc) => sum + (acc.accountCost || 0) + (acc.activationCost || 0), 0);
  const totalPnL = accounts.reduce((sum, acc) => sum + (acc.currentBalance - acc.startingBalance), 0);
  const totalPnLPercentage = accounts.length > 0 
    ? (totalPnL / accounts.reduce((sum, acc) => sum + acc.startingBalance, 0)) * 100 
    : 0;

  // Account status counts
  const activeAccounts = accounts.filter(acc => acc.status === 'active').length;
  const fundedAccounts = accounts.filter(acc => acc.status === 'funded').length;
  const challengeAccounts = accounts.filter(acc => acc.type === 'challenge').length;

  // Trading performance metrics
  const winningTrades = trades.filter(trade => trade.pnl > 0).length;
  const totalTrades = trades.length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalTradingPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);

  return (
    <div className="p-6 space-y-8 bg-prop-gradient-main min-h-screen">
      <style>{CSS_VARIABLES}</style>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gradient-rainbow mb-2">Trading Dashboard</h1>
          <p className="text-gray-400">Complete portfolio overview and performance analytics</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            className="border-prop-blue/20 hover:bg-prop-blue/10"
            onClick={() => window.location.href = '/trades?tab=add'}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Trade
          </Button>
          <Button 
            variant="outline" 
            className="border-prop-green/20 hover:bg-prop-green/10"
            onClick={() => window.location.href = '/trades'}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
        </div>
      </div>

      {/* Quick Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-prop-card border-prop-blue/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-prop-blue" />
              <label className="text-sm font-medium text-gray-300">Time Period</label>
            </div>
            <Select defaultValue="month">
              <SelectTrigger className="mt-2 bg-prop-dark border-prop-blue/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="bg-prop-card border-prop-green/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-prop-green" />
              <label className="text-sm font-medium text-gray-300">View Mode</label>
            </div>
            <Select defaultValue="overview">
              <SelectTrigger className="mt-2 bg-prop-dark border-prop-green/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="detailed">Detailed Analysis</SelectItem>
                <SelectItem value="monthly">Monthly View</SelectItem>
                <SelectItem value="discipline">Discipline Score</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="bg-prop-card border-prop-gold/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-prop-gold" />
              <label className="text-sm font-medium text-gray-300">Quick Actions</label>
            </div>
            <div className="mt-2 flex space-x-2">
              <Button size="sm" className="bg-prop-gold/20 text-prop-gold">
                Journal
              </Button>
              <Button size="sm" className="bg-prop-blue/20 text-prop-blue">
                Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-prop-card border-prop-gold/20 hover-glow smooth-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Portfolio Value</p>
                <p className="text-2xl font-bold text-prop-gold">
                  ${totalPortfolioValue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">Combined accounts</p>
              </div>
              <div className="bg-prop-gradient-gold p-3 rounded-xl">
                <DollarSign className="h-6 w-6 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-prop-card border-prop-tiffany/20 hover-glow smooth-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Net Balance</p>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-prop-green' : 'text-prop-pink'}`}>
                  ${totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {totalPnLPercentage >= 0 ? '+' : ''}{totalPnLPercentage.toFixed(1)}% return
                </p>
              </div>
              <div className={`p-3 rounded-xl ${totalPnL >= 0 ? 'bg-prop-gradient-green' : 'bg-prop-gradient-pink'}`}>
                {totalPnL >= 0 ? 
                  <TrendingUp className="h-6 w-6 text-white" /> : 
                  <TrendingDown className="h-6 w-6 text-white" />
                }
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-prop-card border-prop-blue/20 hover-glow smooth-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Invested</p>
                <p className="text-2xl font-bold text-prop-blue">
                  ${totalInvested.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">Account costs & fees</p>
              </div>
              <div className="bg-prop-gradient-blue p-3 rounded-xl">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-prop-card border-prop-green/20 hover-glow smooth-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Win Rate</p>
                <p className="text-2xl font-bold text-prop-green">{winRate.toFixed(0)}%</p>
                <p className="text-xs text-gray-400 mt-1">{winningTrades} wins / {totalTrades - winningTrades} losses</p>
              </div>
              <div className="bg-prop-gradient-green p-3 rounded-xl">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-prop-card border-prop-tiffany/20 hover-glow smooth-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Active Accounts</p>
                <p className="text-2xl font-bold text-prop-tiffany">{activeAccounts}</p>
                <p className="text-xs text-gray-400 mt-1">Currently trading</p>
              </div>
              <div className="bg-prop-gradient-tiffany p-3 rounded-xl">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-prop-card border-prop-gold/20 hover-glow smooth-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Funded Accounts</p>
                <p className="text-2xl font-bold text-prop-gold">{fundedAccounts}</p>
                <p className="text-xs text-gray-400 mt-1">Profit eligible</p>
              </div>
              <div className="bg-prop-gradient-gold p-3 rounded-xl">
                <DollarSign className="h-6 w-6 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-prop-card border-prop-pink/20 hover-glow smooth-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Challenge Accounts</p>
                <p className="text-2xl font-bold text-prop-pink">{challengeAccounts}</p>
                <p className="text-xs text-gray-400 mt-1">In evaluation</p>
              </div>
              <div className="bg-prop-gradient-pink p-3 rounded-xl">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button 
          className="bg-prop-card border-prop-blue/20 hover:bg-prop-blue/10 text-prop-blue p-4 h-auto justify-start"
          onClick={() => window.location.href = '/trades?tab=add'}
        >
          <PlusCircle className="mr-3 h-5 w-5" />
          <div className="text-left">
            <div className="font-medium">Add New Trade</div>
            <div className="text-xs text-gray-400">Manual entry</div>
          </div>
        </Button>

        <Button 
          className="bg-prop-card border-prop-green/20 hover:bg-prop-green/10 text-prop-green p-4 h-auto justify-start"
          onClick={() => window.location.href = '/trades'}
        >
          <Upload className="mr-3 h-5 w-5" />
          <div className="text-left">
            <div className="font-medium">Import Trades</div>
            <div className="text-xs text-gray-400">CSV upload</div>
          </div>
        </Button>

        <Button 
          className="bg-prop-card border-prop-gold/20 hover:bg-prop-gold/10 text-prop-gold p-4 h-auto justify-start"
          onClick={() => window.location.href = '/journal'}
        >
          <BookOpen className="mr-3 h-5 w-5" />
          <div className="text-left">
            <div className="font-medium">Trading Journal</div>
            <div className="text-xs text-gray-400">Daily reflection</div>
          </div>
        </Button>

        <Button 
          className="bg-prop-card border-prop-tiffany/20 hover:bg-prop-tiffany/10 text-prop-tiffany p-4 h-auto justify-start"
          onClick={() => window.location.href = '/analytics'}
        >
          <BarChart3 className="mr-3 h-5 w-5" />
          <div className="text-left">
            <div className="font-medium">Analytics</div>
            <div className="text-xs text-gray-400">Performance analysis</div>
          </div>
        </Button>
      </div>

      {/* Recent Activity */}
      <Card className="bg-prop-card border-prop-gold/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-prop-gold" />
            Recent Trading Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {trades.slice(0, 5).map((trade) => (
              <div key={trade.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${trade.pnl > 0 ? 'bg-prop-gradient-green' : 'bg-prop-gradient-pink'}`}>
                    {trade.pnl > 0 ? 
                      <TrendingUp className="h-4 w-4 text-white" /> : 
                      <TrendingDown className="h-4 w-4 text-white" />
                    }
                  </div>
                  <div>
                    <p className="text-white font-medium">{trade.symbol}</p>
                    <p className="text-xs text-gray-400">{trade.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${trade.pnl > 0 ? 'text-prop-green' : 'text-prop-pink'}`}>
                    ${trade.pnl > 0 ? '+' : ''}${trade.pnl.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">{trade.side.toUpperCase()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Export instructions:
// 1. Copy this entire file
// 2. Install required dependencies: React, any icon library (lucide-react recommended)
// 3. Add the CSS variables to your main CSS file
// 4. Replace mock data with your actual data source
// 5. Replace UI components with your preferred UI library (shadcn/ui, Material-UI, etc.)
// 6. Update navigation links to match your routing system