import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { 
  Bot, 
  Send, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target,
  Brain,
  Lightbulb,
  MessageSquare,
  User,
  Activity,
  BarChart3
} from "lucide-react";
import type { Account, Trade } from "@shared/schema";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    accountData?: any;
    tradeData?: any;
    analysisType?: string;
  };
}

export default function TradingCompanion() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Hey there, trader! I'm Marthy, your Trading Companion. I've analyzed your recent performance and I'm here to help you level up your game. What would you like to discuss today?",
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
        context: response.context,
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    // Prepare context data for the AI
    const context = {
      accounts,
      trades: trades.slice(-20), // Last 20 trades for context
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

  const quickActions = [
    { label: "Analyze Recent Performance", icon: BarChart3, action: "analyze recent performance" },
    { label: "Risk Assessment", icon: AlertTriangle, action: "assess my current risk" },
    { label: "Trading Tips", icon: Lightbulb, action: "give me trading tips" },
    { label: "Goal Setting", icon: Target, action: "help me set trading goals" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-rainbow">Trading Companion</h1>
          <p className="text-gray-400 mt-2">Your AI-powered trading mentor with personality</p>
        </div>
        <div className="flex items-center space-x-2">
          <Bot className="h-8 w-8 text-prop-gold" />
          <Badge className="bg-success-green text-white">
            <Activity className="h-3 w-3 mr-1" />
            Marthy is Online
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Quick Actions */}
        <Card className="bg-prop-card border-prop-gold/20">
          <CardHeader>
            <CardTitle className="text-prop-gold flex items-center">
              <Lightbulb className="h-5 w-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-prop-gold hover:text-black border-prop-gold/30"
                  onClick={() => {
                    setInputMessage(action.action);
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs text-center">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="bg-prop-card border-prop-gold/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-prop-gold flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Chat with Alex
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            <ScrollArea className="h-96 w-full pr-4">
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

            {/* Input */}
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Alex about your trading performance, risk management, or get advice..."
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

        {/* Performance Insights */}
        <Card className="bg-prop-card border-prop-gold/20">
          <CardHeader>
            <CardTitle className="text-prop-gold flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              Alex's Quick Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-dark-surface rounded-lg border border-prop-gold/20">
                <TrendingUp className="h-8 w-8 text-success-green mx-auto mb-2" />
                <p className="text-sm text-gray-400">Recent Streak</p>
                <p className="text-lg font-bold text-white">
                  {trades.slice(-5).filter(t => t.pnl > 0).length}/5 Wins
                </p>
              </div>
              
              <div className="text-center p-4 bg-dark-surface rounded-lg border border-prop-gold/20">
                <Target className="h-8 w-8 text-prop-gold mx-auto mb-2" />
                <p className="text-sm text-gray-400">Win Rate</p>
                <p className="text-lg font-bold text-white">
                  {trades.length > 0 ? Math.round((trades.filter(t => t.pnl > 0).length / trades.length) * 100) : 0}%
                </p>
              </div>
              
              <div className="text-center p-4 bg-dark-surface rounded-lg border border-prop-gold/20">
                <BarChart3 className="h-8 w-8 text-primary-purple mx-auto mb-2" />
                <p className="text-sm text-gray-400">Recent P&L</p>
                <p className={`text-lg font-bold ${trades.slice(-10).reduce((sum, t) => sum + t.pnl, 0) >= 0 ? 'text-success-green' : 'text-error-red'}`}>
                  {formatCurrency(trades.slice(-10).reduce((sum, t) => sum + t.pnl, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}