import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Send, 
  User, 
  Brain, 
  TrendingUp, 
  Shield, 
  Target,
  Lightbulb,
  MessageCircle,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { apiRequest } from "@/lib/queryClient";
import type { Account, Trade } from "@shared/schema";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  category?: 'risk' | 'strategy' | 'analysis' | 'general';
}

interface AIMentorProps {
  accounts: Account[];
  trades: Trade[];
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const mentorPersonality = {
  name: "PropMentor AI",
  role: "Elite Trading Coach",
  expertise: ["Risk Management", "Prop Trading Rules", "Psychology", "Strategy Development"],
  avatar: "🧠"
};

const quickSuggestions = [
  { text: "Analyze my recent performance", category: "analysis" as const },
  { text: "Risk management tips for today", category: "risk" as const },
  { text: "How to improve my win rate?", category: "strategy" as const },
  { text: "Prop firm rules reminder", category: "general" as const },
];

export default function AITradingMentor({ accounts, trades, isMinimized = false, onToggleMinimize }: AIMentorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: `Hello! I'm ${mentorPersonality.name}, your AI trading mentor. I'm here to help you become a better prop trader by analyzing your performance, managing risk, and developing winning strategies. 

I can analyze your trades, suggest improvements, remind you of prop firm rules, and help with trading psychology. What would you like to work on today?`,
      sender: 'ai',
      timestamp: new Date(),
      category: 'general'
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const analyzeUserContext = () => {
    const totalPnl = trades.reduce((sum, trade) => sum + trade.pnl, 0);
    const winRate = trades.length > 0 
      ? (trades.filter(trade => trade.pnl > 0).length / trades.length) * 100 
      : 0;
    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.startingBalance || 0), 0);
    const recentTrades = trades.slice(-5);
    
    return {
      totalPnl,
      winRate,
      totalBalance,
      recentTrades,
      accountCount: accounts.length,
      riskLevel: totalPnl < -1000 ? 'high' : totalPnl < 0 ? 'medium' : 'low'
    };
  };

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    const context = analyzeUserContext();
    
    // Simulate AI analysis based on user context
    if (userMessage.toLowerCase().includes('performance') || userMessage.toLowerCase().includes('analyze')) {
      return `Based on your recent trading data:

📊 **Performance Analysis:**
- Total P&L: $${context.totalPnl.toFixed(2)}
- Win Rate: ${context.winRate.toFixed(1)}%
- Active Accounts: ${context.accountCount}
- Risk Level: ${context.riskLevel.toUpperCase()}

${context.winRate < 50 
  ? "🔴 **Areas for Improvement:** Your win rate is below 50%. Focus on better entry points and risk management."
  : "✅ **Strong Performance:** Your win rate looks good! Continue with your current strategy."
}

**Recommendations:**
1. ${context.riskLevel === 'high' ? 'Reduce position sizes immediately' : 'Maintain current risk levels'}
2. Review your recent losing trades for patterns
3. Consider setting tighter stop losses`;
    }
    
    if (userMessage.toLowerCase().includes('risk')) {
      return `🛡️ **Risk Management Guidance:**

**Current Risk Assessment:**
- Portfolio Value: $${context.totalBalance.toLocaleString()}
- Risk Level: ${context.riskLevel.toUpperCase()}

**Key Rules to Follow:**
1. **Daily Loss Limit:** Never risk more than 5% of your account per day
2. **Position Sizing:** Use 1-2% risk per trade maximum
3. **Max Drawdown:** Stay above your prop firm's drawdown limits
4. **Trailing Stops:** Use them to protect profitable positions

${context.riskLevel === 'high' 
  ? "⚠️ **URGENT:** Your current risk level is HIGH. Consider stopping trading for today and reviewing your strategy."
  : "✅ Your risk management looks stable. Keep following your rules!"
}`;
    }
    
    if (userMessage.toLowerCase().includes('strategy') || userMessage.toLowerCase().includes('win rate')) {
      return `📈 **Strategy Development Tips:**

**To Improve Your Win Rate:**
1. **Market Analysis:** Focus on higher timeframe trends
2. **Entry Timing:** Wait for clear confirmations before entering
3. **Risk/Reward:** Aim for minimum 1:2 risk-reward ratio
4. **Market Sessions:** Trade during active market hours for better liquidity

**Psychology Tips:**
- Stick to your trading plan
- Don't chase losses with bigger positions  
- Take breaks after losing streaks
- Journal every trade decision

**Prop Firm Success:**
- Follow the rules strictly - one violation can end your account
- Be consistent rather than trying for home runs
- Focus on capital preservation first, profits second`;
    }
    
    return `I understand you're asking about "${userMessage}". As your trading mentor, I can help you with:

🎯 **Performance Analysis** - Review your trades and identify patterns
🛡️ **Risk Management** - Keep you within prop firm limits  
📊 **Strategy Development** - Improve your trading approach
🧠 **Trading Psychology** - Handle emotions and maintain discipline

Would you like me to analyze any specific aspect of your trading? I can look at your recent trades, check your risk levels, or discuss strategy improvements.`;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      const aiResponse = await generateAIResponse(inputMessage);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        category: inputMessage.toLowerCase().includes('risk') ? 'risk' : 
                 inputMessage.toLowerCase().includes('strategy') ? 'strategy' : 
                 inputMessage.toLowerCase().includes('analyze') ? 'analysis' : 'general'
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      setIsLoading(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        sender: 'ai',
        timestamp: new Date(),
        category: 'general'
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleQuickSuggestion = (suggestion: typeof quickSuggestions[0]) => {
    setInputMessage(suggestion.text);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggleMinimize}
          className="h-12 w-12 rounded-full bg-prop-gold hover:bg-prop-gold/80 shadow-lg"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] z-50 widget-card shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-prop-gold/20 flex items-center justify-center">
              <Bot className="h-5 w-5 text-prop-gold" />
            </div>
            <div>
              <CardTitle className="text-sm widget-header">{mentorPersonality.name}</CardTitle>
              <p className="text-xs text-gray-400">{mentorPersonality.role}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimize}
              className="h-8 w-8 p-0 hover:bg-gray-700"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {mentorPersonality.expertise.map((skill, index) => (
            <Badge key={index} variant="outline" className="text-xs text-prop-tiffany border-prop-tiffany/30">
              {skill}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col h-[480px] p-4">
        {/* Messages */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-prop-gold text-black'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === 'ai' && (
                      <Bot className="h-4 w-4 mt-0.5 text-prop-gold flex-shrink-0" />
                    )}
                    {message.sender === 'user' && (
                      <User className="h-4 w-4 mt-0.5 text-black flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm whitespace-pre-line">{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  {message.category && message.sender === 'ai' && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {message.category}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-prop-gold" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-prop-gold rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-prop-gold rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-prop-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Quick Suggestions */}
        <div className="grid grid-cols-2 gap-1 my-3">
          {quickSuggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickSuggestion(suggestion)}
              className="text-xs border-gray-600 hover:border-prop-tiffany"
            >
              {suggestion.category === 'risk' && <Shield className="h-3 w-3 mr-1" />}
              {suggestion.category === 'strategy' && <Target className="h-3 w-3 mr-1" />}
              {suggestion.category === 'analysis' && <TrendingUp className="h-3 w-3 mr-1" />}
              {suggestion.category === 'general' && <Lightbulb className="h-3 w-3 mr-1" />}
              {suggestion.text}
            </Button>
          ))}
        </div>
        
        {/* Input */}
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything about trading..."
            className="bg-gray-700 border-gray-600 text-white"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-prop-gold hover:bg-prop-gold/80"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}