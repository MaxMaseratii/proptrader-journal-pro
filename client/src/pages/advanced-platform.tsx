import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  LayoutDashboard, 
  Bot, 
  Share2, 
  Zap, 
  Users, 
  GripVertical,
  MessageSquare,
  TrendingUp,
  Settings,
  Download,
  Upload,
  Plus,
  Brain,
  Globe,
  Heart,
  Star,
  X,
  Edit,
  BarChart3,
  Target,
  Calendar,
  DollarSign,
  Wallet,
  Shield,
  Trophy,
  Activity,
  ChartLine,
  Save,
  RotateCcw
} from 'lucide-react';
import { formatCurrency } from "@/lib/utils";

// Widget types available for the dashboard
const AVAILABLE_WIDGETS = [
  { id: 'portfolio-overview', title: 'Portfolio Overview', type: 'stats', icon: DollarSign, category: 'Finance' },
  { id: 'performance-metrics', title: 'Performance Metrics', type: 'chart', icon: TrendingUp, category: 'Performance' },
  { id: 'recent-trades', title: 'Recent Trades', type: 'table', icon: BarChart3, category: 'Trading' },
  { id: 'active-accounts', title: 'Active Accounts', type: 'list', icon: Wallet, category: 'Accounts' },
  { id: 'risk-metrics', title: 'Risk Metrics', type: 'gauge', icon: Shield, category: 'Risk' },
  { id: 'trade-calendar', title: 'Trade Calendar', type: 'calendar', icon: Calendar, category: 'Calendar' },
  { id: 'discipline-score', title: 'Discipline Score', type: 'score', icon: Target, category: 'Analysis' },
  { id: 'achievements', title: 'Achievements', type: 'badges', icon: Trophy, category: 'Gamification' },
  { id: 'win-rate', title: 'Win Rate', type: 'percentage', icon: Activity, category: 'Performance' },
  { id: 'equity-curve', title: 'Equity Curve', type: 'line-chart', icon: ChartLine, category: 'Finance' },
  { id: 'news-feed', title: 'Market News', type: 'feed', icon: Globe, category: 'Market' },
  { id: 'profit-targets', title: 'Profit Targets', type: 'progress', icon: Target, category: 'Goals' }
];

export default function AdvancedPlatform() {
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'AI Mentor', message: 'Welcome! I am your AI trading mentor. How can I help you improve your trading performance today?', timestamp: '2 minutes ago' },
    { id: 2, sender: 'You', message: 'I have been struggling with risk management lately. Any tips?', timestamp: '1 minute ago' },
    { id: 3, sender: 'AI Mentor', message: 'Based on your recent trades, I notice you are risking more than 2% per trade. I recommend implementing a strict 1% risk rule and using position sizing calculations.', timestamp: 'Just now' }
  ]);

  const [newMessage, setNewMessage] = useState('');
  
  // Dashboard customization state
  const [dashboardWidgets, setDashboardWidgets] = useState([
    { id: 'portfolio-overview', title: 'Portfolio Overview', type: 'stats', enabled: true, position: 0, size: 'large' },
    { id: 'performance-metrics', title: 'Performance Metrics', type: 'chart', enabled: true, position: 1, size: 'medium' },
    { id: 'recent-trades', title: 'Recent Trades', type: 'table', enabled: true, position: 2, size: 'large' },
    { id: 'active-accounts', title: 'Active Accounts', type: 'list', enabled: true, position: 3, size: 'small' }
  ]);
  
  const [draggedWidget, setDraggedWidget] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [savedLayouts, setSavedLayouts] = useState([
    { id: 1, name: 'Default Layout', isActive: true },
    { id: 2, name: 'Performance Focus', isActive: false },
    { id: 3, name: 'Risk Management', isActive: false }
  ]);

  const [forumPosts, setForumPosts] = useState([
    { id: 1, title: 'Best Risk Management Strategies for Prop Trading', author: 'ProTrader_Mike', replies: 23, likes: 45, category: 'Risk Management', timestamp: '2 hours ago' },
    { id: 2, title: 'How I Passed My 100K Challenge in 3 Weeks', author: 'FastTracker', replies: 67, likes: 128, category: 'Success Stories', timestamp: '5 hours ago' },
    { id: 3, title: 'Psychology Tips: Dealing with Drawdowns', author: 'MindfulTrader', replies: 34, likes: 89, category: 'Psychology', timestamp: '1 day ago' },
    { id: 4, title: 'Market Analysis: Current EUR/USD Setup', author: 'ForexAnalyst', replies: 12, likes: 34, category: 'Analysis', timestamp: '3 hours ago' }
  ]);

  // Dashboard customization functions
  const addWidget = (widgetType: any) => {
    const newWidget = {
      id: `${widgetType.id}-${Date.now()}`,
      title: widgetType.title,
      type: widgetType.type,
      enabled: true,
      position: dashboardWidgets.length,
      size: 'medium'
    };
    setDashboardWidgets([...dashboardWidgets, newWidget]);
  };

  const removeWidget = (widgetId: string) => {
    setDashboardWidgets(dashboardWidgets.filter(w => w.id !== widgetId));
  };

  const toggleWidget = (widgetId: string) => {
    setDashboardWidgets(dashboardWidgets.map(w => 
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    ));
  };

  const moveWidget = (draggedId: string, targetId: string) => {
    const widgets = [...dashboardWidgets];
    const draggedIndex = widgets.findIndex(w => w.id === draggedId);
    const targetIndex = widgets.findIndex(w => w.id === targetId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedWidget] = widgets.splice(draggedIndex, 1);
      widgets.splice(targetIndex, 0, draggedWidget);
      
      // Update positions
      widgets.forEach((widget, index) => {
        widget.position = index;
      });
      
      setDashboardWidgets(widgets);
    }
  };

  const saveLayout = (name: string) => {
    const newLayout = {
      id: Date.now(),
      name,
      isActive: false,
      widgets: [...dashboardWidgets]
    };
    setSavedLayouts([...savedLayouts, newLayout]);
  };

  const loadLayout = (layoutId: number) => {
    const layout = savedLayouts.find(l => l.id === layoutId);
    if (layout && (layout as any).widgets) {
      setDashboardWidgets((layout as any).widgets);
      setSavedLayouts(savedLayouts.map(l => ({ ...l, isActive: l.id === layoutId })));
    }
  };

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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-prop-primary to-prop-secondary bg-clip-text text-transparent">
            Advanced Platform Features
          </h1>
          <p className="text-gray-300 text-lg">
            Professional trading tools: Custom layouts, AI guidance, strategy sharing, and community insights
          </p>
        </div>

        {/* Feature Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-dark-card">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <LayoutDashboard className="h-4 w-4" />
              <span>Widget Builder</span>
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
            {/* Dashboard Controls */}
            <Card className="bg-dark-card border-prop-gold/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <LayoutDashboard className="h-5 w-5 text-prop-primary" />
                    <span>Custom Widget Builder</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => setIsEditMode(!isEditMode)}
                      variant={isEditMode ? "destructive" : "default"}
                      size="sm"
                    >
                      {isEditMode ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                      {isEditMode ? 'Exit Edit' : 'Edit Mode'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {isEditMode && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-prop-gold">Add Widgets</h4>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {AVAILABLE_WIDGETS.map(widget => (
                          <Button
                            key={widget.id}
                            onClick={() => addWidget(widget)}
                            size="sm"
                            variant="outline"
                            className="h-auto p-2 flex flex-col items-center space-y-1 border-prop-tiffany/30 hover:border-prop-tiffany/60"
                          >
                            <widget.icon className="h-4 w-4" />
                            <span className="text-xs text-center">{widget.title}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-prop-blue">Layout Controls</h4>
                      <div className="space-y-2">
                        <Button size="sm" variant="outline" className="w-full">
                          <Save className="h-4 w-4 mr-2" />
                          Save Layout
                        </Button>
                        <Button size="sm" variant="outline" className="w-full">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset to Default
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-prop-pink">Saved Layouts</h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {savedLayouts.map(layout => (
                          <Button
                            key={layout.id}
                            onClick={() => loadLayout(layout.id)}
                            size="sm"
                            variant={layout.isActive ? "default" : "outline"}
                            className="w-full text-xs"
                          >
                            {layout.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-prop-green">Quick Actions</h4>
                      <div className="space-y-1">
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          Export Layout
                        </Button>
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          Import Layout
                        </Button>
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          Share Layout
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Dashboard Preview/Editor */}
            <Card className="bg-dark-card border-prop-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Dashboard Preview</span>
                  <Badge variant={isEditMode ? "destructive" : "default"}>
                    {isEditMode ? 'Edit Mode Active' : 'Preview Mode'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[400px]">
                  {dashboardWidgets
                    .filter(w => w.enabled)
                    .sort((a, b) => a.position - b.position)
                    .map((widget) => (
                    <div
                      key={widget.id}
                      className={`relative bg-dark-surface border rounded-lg p-4 transition-all duration-200 ${
                        isEditMode 
                          ? 'border-prop-tiffany/30 cursor-move hover:border-prop-tiffany/60 hover:shadow-lg transform hover:scale-105' 
                          : 'border-gray-700'
                      } ${
                        widget.size === 'large' ? 'md:col-span-2' : 
                        widget.size === 'small' ? 'md:col-span-1' : 'md:col-span-1'
                      }`}
                      draggable={isEditMode}
                      onDragStart={() => setDraggedWidget(widget.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedWidget && draggedWidget !== widget.id) {
                          moveWidget(draggedWidget, widget.id);
                          setDraggedWidget(null);
                        }
                      }}
                    >
                      {isEditMode && (
                        <div className="absolute top-2 right-2 flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 hover:bg-prop-blue/20"
                            onClick={() => toggleWidget(widget.id)}
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 hover:bg-red-500/20"
                            onClick={() => removeWidget(widget.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {isEditMode && <GripVertical className="h-4 w-4 text-gray-400" />}
                          <h3 className="font-semibold text-sm">{widget.title}</h3>
                        </div>
                        
                        {/* Widget Content Based on Type */}
                        {widget.type === 'stats' && (
                          <div className="space-y-1">
                            <div className="text-2xl font-bold text-prop-gold">$24,567</div>
                            <div className="text-xs text-gray-400">Portfolio Value</div>
                          </div>
                        )}
                        
                        {widget.type === 'chart' && (
                          <div className="h-24 bg-gradient-to-r from-prop-green/20 to-prop-blue/20 rounded flex items-center justify-center">
                            <TrendingUp className="h-8 w-8 text-prop-green" />
                          </div>
                        )}
                        
                        {widget.type === 'table' && (
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between"><span>EURUSD</span><span className="text-prop-green">+$245</span></div>
                            <div className="flex justify-between"><span>GBPJPY</span><span className="text-prop-pink">-$82</span></div>
                            <div className="flex justify-between"><span>USDJPY</span><span className="text-prop-green">+$156</span></div>
                          </div>
                        )}
                        
                        {widget.type === 'list' && (
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-prop-green rounded-full"></div>
                              <span>FTMO Challenge</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-prop-blue rounded-full"></div>
                              <span>MyForexFunds</span>
                            </div>
                          </div>
                        )}
                        
                        {widget.type === 'gauge' && (
                          <div className="text-center">
                            <div className="text-xl font-bold text-prop-tiffany">85%</div>
                            <div className="text-xs text-gray-400">Risk Score</div>
                          </div>
                        )}
                        
                        {widget.type === 'calendar' && (
                          <div className="grid grid-cols-7 gap-1 text-xs">
                            {['S','M','T','W','T','F','S'].map(day => (
                              <div key={day} className="text-center text-gray-400">{day}</div>
                            ))}
                            {Array.from({length: 7}, (_, i) => (
                              <div key={i} className="text-center h-4 flex items-center justify-center">
                                {i === 3 ? <div className="w-2 h-2 bg-prop-green rounded-full"></div> : i + 1}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Drop Zone for new widgets */}
                  {isEditMode && (
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 flex items-center justify-center min-h-[120px]">
                      <div className="text-center text-gray-400">
                        <Plus className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Drop widgets here or click "Add Widget"</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 bg-prop-blue/10 border border-prop-blue/20 rounded-lg p-4">
                  <h4 className="font-semibold text-prop-blue mb-2">Dashboard Features:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-300">
                    <div>• Full drag-and-drop customization</div>
                    <div>• Real-time data integration</div>
                    <div>• Resizable widget support</div>
                    <div>• Save and share layouts</div>
                    <div>• 12+ widget types available</div>
                    <div>• Responsive design for all devices</div>
                  </div>
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