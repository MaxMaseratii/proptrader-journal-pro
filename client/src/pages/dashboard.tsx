import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Shield, 
  Calendar,
  Bot, 
  Send, 
  AlertTriangle, 
  Brain,
  Lightbulb,
  MessageSquare,
  User,
  Activity,
  BarChart3,
  Award,
  CheckCircle,
  XCircle,
  PieChart,
  Zap
} from "lucide-react";
import type { Account, Trade, JournalEntry } from "@shared/schema";
import WeeklyPerformanceCalendar from "@/components/weekly-performance-calendar";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Dashboard() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Hey there! I'm Marthy, your Trading Companion. I've analyzed your recent performance and I'm here to help you level up your game. What would you like to discuss today?",
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: trades = [] } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

  const { data: journalEntries = [] } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
  });

  const chatMutation = useMutation({
    mutationFn: async (data: { message: string; context: any }) => {
      const response = await apiRequest('POST', '/api/trading-companion/chat', data);
      return await response.json();
    },
    onSuccess: (response: any) => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
    },
    onError: () => {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Let me know if you'd like me to analyze your recent trades or discuss risk management strategies!",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    const context = {
      accounts,
      trades: trades.slice(-20),
      totalTrades: trades.length,
      recentPerformance: trades.slice(-10).reduce((sum, trade) => sum + trade.pnl, 0),
      winRate: trades.length > 0 ? (trades.filter(t => t.pnl > 0).length / trades.length) * 100 : 0,
    };

    chatMutation.mutate({ 
      message: inputMessage, 
      context 
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Calculate dashboard metrics
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const totalTrades = trades.length;
  const winningTrades = trades.filter(trade => trade.pnl > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const bestTrade = trades.length > 0 ? Math.max(...trades.map(t => t.pnl)) : 0;
  const worstTrade = trades.length > 0 ? Math.min(...trades.map(t => t.pnl)) : 0;

  // Risk Management Calculations
  const activeAccounts = accounts.filter(acc => acc.status === 'active');
  const riskMetrics = activeAccounts.map(account => {
    const accountTrades = trades.filter(t => t.accountId === account.id);
    const currentDrawdown = Math.max(0, account.balance - account.maxDrawdown);
    const dailyLoss = accountTrades
      .filter(t => t.date === new Date().toISOString().split('T')[0])
      .reduce((sum, t) => sum + Math.min(0, t.pnl), 0);
    const dailyLossPercent = Math.abs(dailyLoss / account.balance) * 100;
    
    return {
      account,
      currentDrawdown,
      dailyLoss,
      dailyLossPercent,
      riskLevel: dailyLossPercent > 4 ? 'high' : dailyLossPercent > 2 ? 'medium' : 'low'
    };
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-rainbow">Trading Dashboard</h1>
            <p className="text-gray-400 mt-2">Your complete trading overview with AI companion</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-success-green text-white">
              <Activity className="h-3 w-3 mr-1" />
              Live
            </Badge>
            <Badge className="bg-prop-gold text-black">
              <Bot className="h-3 w-3 mr-1" />
              Marthy Online
            </Badge>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-dark-card border-dark-border hover-glow smooth-transition">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Net Balance</p>
                  <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-success-green' : 'text-error-red'}`}>
                    {formatCurrency(totalBalance)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-prop-gold" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-dark-border hover-glow smooth-transition">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total P&L</p>
                  <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-success-green' : 'text-error-red'}`}>
                    {formatCurrency(totalPnL)}
                  </p>
                </div>
                {totalPnL >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-success-green" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-error-red" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-dark-border hover-glow smooth-transition">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Win Rate</p>
                  <p className="text-2xl font-bold text-primary-purple">
                    {winRate.toFixed(1)}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-primary-purple" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-card border-dark-border hover-glow smooth-transition">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Trades</p>
                  <p className="text-2xl font-bold text-prop-tiffany">
                    {totalTrades}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-prop-tiffany" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Overview */}
        <Card className="bg-dark-card border-dark-border hover-glow">
          <CardHeader>
            <CardTitle className="text-gradient-rainbow">Account Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {accounts.map((account) => {
                const accountTrades = trades.filter(t => t.accountId === account.id);
                const accountPnL = accountTrades.reduce((sum, t) => sum + t.pnl, 0);
                const accountWinRate = accountTrades.length > 0 ? (accountTrades.filter(t => t.pnl > 0).length / accountTrades.length) * 100 : 0;
                
                return (
                  <div key={account.id} className="p-4 bg-dark-surface rounded-lg border border-prop-gold/20">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{account.name}</h3>
                      <Badge className={`${account.status === 'active' ? 'bg-success-green' : 'bg-gray-600'}`}>
                        {account.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Balance</p>
                        <p className={`font-bold ${account.balance >= 0 ? 'text-success-green' : 'text-error-red'}`}>
                          {formatCurrency(account.balance)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">P&L</p>
                        <p className={`font-bold ${accountPnL >= 0 ? 'text-success-green' : 'text-error-red'}`}>
                          {formatCurrency(accountPnL)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Win Rate</p>
                        <p className="font-bold text-primary-purple">{accountWinRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Trades</p>
                        <p className="font-bold text-prop-tiffany">{accountTrades.length}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Weekly Performance Calendar */}
        <Card className="bg-dark-card border-dark-border hover-glow">
          <CardHeader>
            <CardTitle className="text-gradient-rainbow">Weekly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyPerformanceCalendar trades={trades} />
          </CardContent>
        </Card>

        {/* Trading Bot Companion */}
        <Card className="bg-dark-card border-dark-border hover-glow">
          <CardHeader>
            <CardTitle className="text-gradient-rainbow flex items-center">
              <Bot className="h-5 w-5 mr-2" />
              Trading Companion - Marthy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chat Messages */}
            <ScrollArea className="h-64 w-full pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-prop-gold text-black'
                          : 'bg-dark-surface border border-prop-gold/20'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.role === 'assistant' && (
                          <Bot className="h-4 w-4 text-prop-gold mt-1 flex-shrink-0" />
                        )}
                        {message.role === 'user' && (
                          <User className="h-4 w-4 text-black mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className={`text-sm ${message.role === 'user' ? 'text-black' : 'text-white'}`}>
                            {message.content}
                          </p>
                          <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-black/60' : 'text-gray-400'}`}>
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-dark-surface border border-prop-gold/20 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4 text-prop-gold" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-prop-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-prop-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-prop-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <Separator className="bg-prop-gold/20" />

            {/* Chat Input */}
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Marthy about your trading performance, risk management, or get advice..."
                className="flex-1 bg-dark-surface border-prop-gold/30 text-white placeholder:text-gray-400"
                disabled={chatMutation.isPending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || chatMutation.isPending}
                className="bg-prop-gold hover:bg-prop-gold/80 text-black"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Risk Management */}
        <Card className="bg-dark-card border-dark-border hover-glow">
          <CardHeader>
            <CardTitle className="text-gradient-rainbow flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Risk Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskMetrics.map((metric) => (
                <div key={metric.account.id} className="p-4 bg-dark-surface rounded-lg border border-prop-gold/20">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">{metric.account.name}</h3>
                    <Badge className={`${
                      metric.riskLevel === 'high' ? 'bg-error-red' :
                      metric.riskLevel === 'medium' ? 'bg-yellow-500' :
                      'bg-success-green'
                    }`}>
                      {metric.riskLevel} risk
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Daily Loss</p>
                      <p className="font-bold text-error-red">{formatCurrency(metric.dailyLoss)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Daily Loss %</p>
                      <p className="font-bold text-error-red">{metric.dailyLossPercent.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Max Drawdown</p>
                      <p className="font-bold text-white">{formatCurrency(metric.account.maxDrawdown)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}