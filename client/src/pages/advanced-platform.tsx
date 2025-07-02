import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Bot, 
  Share2, 
  Zap, 
  Users, 
  DragHandleDots2Icon,
  MessageSquare,
  TrendingUp,
  Settings,
  Download,
  Upload,
  Plus,
  Brain,
  Globe,
  Heart,
  Star
} from 'lucide-react';
import { formatCurrency } from "@/lib/utils";

export default function AdvancedPlatform() {
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'AI Mentor', message: 'Welcome! I am your AI trading mentor. How can I help you improve your trading performance today?', timestamp: '2 minutes ago' },
    { id: 2, sender: 'You', message: 'I have been struggling with risk management lately. Any tips?', timestamp: '1 minute ago' },
    { id: 3, sender: 'AI Mentor', message: 'Based on your recent trades, I notice you are risking more than 2% per trade. I recommend implementing a strict 1% risk rule and using position sizing calculations.', timestamp: 'Just now' }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [dashboardWidgets, setDashboardWidgets] = useState([
    { id: 'pnl', title: 'P&L Overview', type: 'chart', position: { x: 0, y: 0 }, size: { w: 2, h: 1 } },
    { id: 'trades', title: 'Recent Trades', type: 'table', position: { x: 2, y: 0 }, size: { w: 2, h: 1 } },
    { id: 'stats', title: 'Key Metrics', type: 'stats', position: { x: 0, y: 1 }, size: { w: 1, h: 1 } },
    { id: 'calendar', title: 'Trade Calendar', type: 'calendar', position: { x: 1, y: 1 }, size: { w: 3, h: 1 } }
  ]);

  const [forumPosts, setForumPosts] = useState([
    { id: 1, title: 'Best Risk Management Strategies for Prop Trading', author: 'ProTrader_Mike', replies: 23, likes: 45, category: 'Risk Management', timestamp: '2 hours ago' },
    { id: 2, title: 'How I Passed My 100K Challenge in 3 Weeks', author: 'FastTracker', replies: 67, likes: 128, category: 'Success Stories', timestamp: '5 hours ago' },
    { id: 3, title: 'Psychology Tips: Dealing with Drawdowns', author: 'MindfulTrader', replies: 34, likes: 89, category: 'Psychology', timestamp: '1 day ago' },
    { id: 4, title: 'Market Analysis: Current EUR/USD Setup', author: 'ForexAnalyst', replies: 12, likes: 34, category: 'Analysis', timestamp: '3 hours ago' }
  ]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const userMessage = {
        id: chatMessages.length + 1,
        sender: 'You',
        message: newMessage,
        timestamp: 'Just now'
      };
      
      setChatMessages([...chatMessages, userMessage]);
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: chatMessages.length + 2,
          sender: 'AI Mentor',
          message: getAIResponse(newMessage),
          timestamp: 'Just now'
        };
        setChatMessages(prev => [...prev, aiResponse]);
      }, 1000);
      
      setNewMessage('');
    }
  };

  const getAIResponse = (userMessage: string) => {
    const responses = [
      "Great question! Based on successful prop traders, I recommend focusing on consistency over big wins. Small, consistent profits compound over time.",
      "I analyzed your trading pattern and suggest implementing a structured trading plan with clear entry/exit rules.",
      "Risk management is crucial. Consider using the 1% rule and never risk more than you can afford to lose on a single trade.",
      "Your performance shows potential. Focus on journaling your trades to identify patterns and improve decision-making.",
      "Remember: the market rewards patience and discipline. Avoid emotional trading and stick to your strategy."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <div className="min-h-screen bg-dark-background text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-prop-gold to-prop-tiffany bg-clip-text text-transparent">
            Advanced Platform Features
          </h1>
          <p className="text-gray-300 text-lg">
            Supercharge your trading with cutting-edge tools and community insights
          </p>
        </div>

        {/* Feature Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-dark-card">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="mentor" className="flex items-center space-x-2">
              <Bot className="h-4 w-4" />
              <span>AI Mentor</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center space-x-2">
              <Share2 className="h-4 w-4" />
              <span>Export</span>
            </TabsTrigger>
            <TabsTrigger value="realtime" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Real-time</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Community</span>
            </TabsTrigger>
          </TabsList>

          {/* Customizable Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <Card className="bg-dark-card border-prop-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LayoutDashboard className="h-5 w-5 text-prop-gold" />
                  <span>Customizable Drag-and-Drop Dashboard</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-gray-300">Design your perfect trading dashboard layout</p>
                  <Button className="bg-prop-gold text-black hover:bg-prop-gold/80">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Widget
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {dashboardWidgets.map((widget) => (
                    <Card key={widget.id} className="bg-dark-surface border-prop-tiffany/30 cursor-move">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <span>{widget.title}</span>
                          <DragHandleDots2Icon className="h-4 w-4 text-gray-400" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {widget.type === 'chart' && (
                          <div className="h-20 bg-prop-green/20 rounded flex items-center justify-center">
                            <TrendingUp className="h-8 w-8 text-prop-green" />
                          </div>
                        )}
                        {widget.type === 'stats' && (
                          <div className="space-y-2">
                            <div className="text-lg font-bold text-prop-gold">{formatCurrency(1245.67)}</div>
                            <div className="text-xs text-gray-400">Today's P&L</div>
                          </div>
                        )}
                        {widget.type === 'table' && (
                          <div className="space-y-1">
                            <div className="text-xs text-gray-400">EURUSD +$45.30</div>
                            <div className="text-xs text-gray-400">GBPJPY -$12.40</div>
                            <div className="text-xs text-gray-400">USDJPY +$78.90</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="bg-prop-blue/10 border border-prop-blue/20 rounded-lg p-4">
                  <h4 className="font-semibold text-prop-blue mb-2">Pro Features:</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Drag and drop widgets to customize layout</li>
                    <li>• Resize widgets to fit your needs</li>
                    <li>• Add custom indicators and charts</li>
                    <li>• Save multiple dashboard layouts</li>
                    <li>• Real-time data updates across all widgets</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Trading Mentor */}
          <TabsContent value="mentor" className="space-y-6">
            <Card className="bg-dark-card border-prop-tiffany/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-prop-tiffany" />
                  <span>AI-Powered Trading Mentor</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-dark-surface rounded-lg p-4 h-96 overflow-y-auto space-y-4">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender === 'You' 
                          ? 'bg-prop-gold text-black' 
                          : 'bg-prop-tiffany/20 border border-prop-tiffany/30'
                      }`}>
                        <div className="font-semibold text-xs mb-1">{msg.sender}</div>
                        <div className="text-sm">{msg.message}</div>
                        <div className="text-xs opacity-70 mt-1">{msg.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ask your AI mentor anything about trading..."
                    className="flex-1 bg-dark-surface border-gray-600"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage} className="bg-prop-tiffany text-black hover:bg-prop-tiffany/80">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="bg-prop-tiffany/10 border border-prop-tiffany/20 rounded-lg p-4">
                  <h4 className="font-semibold text-prop-tiffany mb-2">AI Mentor Features:</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Personalized trading advice based on your performance</li>
                    <li>• Real-time risk management suggestions</li>
                    <li>• Psychology coaching for emotional trading</li>
                    <li>• Strategy optimization recommendations</li>
                    <li>• Market analysis and trade setup alerts</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Strategy Export */}
          <TabsContent value="export" className="space-y-6">
            <Card className="bg-dark-card border-prop-green/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Share2 className="h-5 w-5 text-prop-green" />
                  <span>One-Click Strategy Export & Sharing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-white">Export Your Trading Strategy</h4>
                    <div className="space-y-3">
                      <Button className="w-full bg-prop-green text-black hover:bg-prop-green/80">
                        <Download className="h-4 w-4 mr-2" />
                        Export as PDF Report
                      </Button>
                      <Button className="w-full bg-prop-blue text-white hover:bg-prop-blue/80">
                        <Download className="h-4 w-4 mr-2" />
                        Export as Excel Spreadsheet
                      </Button>
                      <Button className="w-full bg-prop-tiffany text-black hover:bg-prop-tiffany/80">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Strategy Link
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-white">Import Trading Data</h4>
                    <div className="space-y-3">
                      <Button className="w-full bg-gray-600 hover:bg-gray-500">
                        <Upload className="h-4 w-4 mr-2" />
                        Import from MetaTrader
                      </Button>
                      <Button className="w-full bg-gray-600 hover:bg-gray-500">
                        <Upload className="h-4 w-4 mr-2" />
                        Import from TradingView
                      </Button>
                      <Button className="w-full bg-gray-600 hover:bg-gray-500">
                        <Upload className="h-4 w-4 mr-2" />
                        Import from cTrader
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-prop-green/10 border border-prop-green/20 rounded-lg p-4">
                  <h4 className="font-semibold text-prop-green mb-2">Export Features:</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• One-click export to multiple formats</li>
                    <li>• Shareable strategy reports with performance metrics</li>
                    <li>• Custom branding for professional presentations</li>
                    <li>• Integration with popular trading platforms</li>
                    <li>• Automated report scheduling and delivery</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Real-time Data */}
          <TabsContent value="realtime" className="space-y-6">
            <Card className="bg-dark-card border-prop-blue/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-prop-blue" />
                  <span>Real-Time Data Integration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-dark-surface border-prop-blue/30">
                    <CardContent className="p-4 text-center">
                      <Globe className="h-8 w-8 text-prop-blue mx-auto mb-2" />
                      <h4 className="font-semibold mb-2">Live Market Data</h4>
                      <p className="text-sm text-gray-300">Real-time price feeds from major exchanges</p>
                      <div className="mt-3">
                        <Badge className="bg-prop-green/20 text-prop-green">Connected</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-dark-surface border-prop-blue/30">
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-8 w-8 text-prop-blue mx-auto mb-2" />
                      <h4 className="font-semibold mb-2">Performance Tracking</h4>
                      <p className="text-sm text-gray-300">Live P&L and performance metrics</p>
                      <div className="mt-3">
                        <Badge className="bg-prop-green/20 text-prop-green">Active</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-dark-surface border-prop-blue/30">
                    <CardContent className="p-4 text-center">
                      <Settings className="h-8 w-8 text-prop-blue mx-auto mb-2" />
                      <h4 className="font-semibold mb-2">Smart Alerts</h4>
                      <p className="text-sm text-gray-300">Intelligent notifications and alerts</p>
                      <div className="mt-3">
                        <Badge className="bg-prop-gold/20 text-prop-gold">Monitoring</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-prop-blue/10 border border-prop-blue/20 rounded-lg p-4">
                  <h4 className="font-semibold text-prop-blue mb-2">Real-time Features:</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Live market data from multiple sources</li>
                    <li>• Real-time P&L tracking and updates</li>
                    <li>• Instant trade execution monitoring</li>
                    <li>• Smart alerts for risk management</li>
                    <li>• Live performance dashboard updates</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Community Forum */}
          <TabsContent value="community" className="space-y-6">
            <Card className="bg-dark-card border-prop-pink/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-prop-pink" />
                  <span>Interactive Community Forum</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4">
                    <Badge className="bg-prop-gold/20 text-prop-gold">Risk Management</Badge>
                    <Badge className="bg-prop-green/20 text-prop-green">Success Stories</Badge>
                    <Badge className="bg-prop-tiffany/20 text-prop-tiffany">Psychology</Badge>
                    <Badge className="bg-prop-blue/20 text-prop-blue">Analysis</Badge>
                  </div>
                  <Button className="bg-prop-pink text-white hover:bg-prop-pink/80">
                    <Plus className="h-4 w-4 mr-2" />
                    New Post
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {forumPosts.map((post) => (
                    <Card key={post.id} className="bg-dark-surface border-gray-600 hover:border-prop-pink/30 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white mb-2">{post.title}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <span>by {post.author}</span>
                              <span>{post.timestamp}</span>
                              <Badge variant="outline" className="text-xs">{post.category}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="h-4 w-4 text-prop-blue" />
                              <span>{post.replies}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="h-4 w-4 text-prop-pink" />
                              <span>{post.likes}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="bg-prop-pink/10 border border-prop-pink/20 rounded-lg p-4">
                  <h4 className="font-semibold text-prop-pink mb-2">Community Features:</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Connect with thousands of prop traders worldwide</li>
                    <li>• Share strategies and get feedback from experts</li>
                    <li>• Join study groups and trading challenges</li>
                    <li>• Access exclusive educational content</li>
                    <li>• Get mentorship from successful funded traders</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}