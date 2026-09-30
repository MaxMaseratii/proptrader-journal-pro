import React, { useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, DollarSign, Target, Maximize2, Minimize2, X, Plus, Settings, RotateCcw, Save } from 'lucide-react';

interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isExpanded: boolean;
}

interface CustomizableDashboardProps {
  accounts: any[];
  trades: any[];
}

// Note: Default widgets removed - should be user-customizable configurations

const DashboardWidget: React.FC<{
  id: string;
  title: string;
  type: string;
  isEditing: boolean;
  isExpanded: boolean;
  onRemove: (id: string) => void;
  onExpand: (id: string) => void;
  children?: React.ReactNode;
}> = ({ id, title, type, isEditing, isExpanded, onRemove, onExpand, children }) => {
  return (
    <Card className="dashboard-widget bg-prop-card border-prop-gold/20 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-prop-gold">{title}</CardTitle>
        {isEditing && (
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onExpand(id)}
              className="h-6 w-6 p-0 hover:bg-prop-gold/20"
            >
              {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(id)}
              className="h-6 w-6 p-0 hover:bg-red-500/20 text-red-500"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

const DraggableWidget: React.FC<{
  widget: WidgetConfig;
  isEditing: boolean;
  onMove: (draggedId: string, targetPosition: { x: number; y: number }) => void;
  onRemove: (id: string) => void;
  onExpand: (id: string) => void;
  children: React.ReactNode;
}> = ({ widget, isEditing, onMove, onRemove, onExpand, children }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'widget',
    item: { id: widget.id, position: widget.position },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop(() => ({
    accept: 'widget',
    drop: (item: any, monitor) => {
      if (!monitor.didDrop() && item.id !== widget.id) {
        onMove(item.id, widget.position);
      }
    },
  }));

  const ref = React.useRef<HTMLDivElement>(null);
  drag(drop(ref));

  return (
    <div 
      ref={ref}
      className="absolute"
      style={{
        left: widget.position.x,
        top: widget.position.y,
        width: widget.size.width,
        height: widget.size.height,
        opacity: isDragging ? 0.5 : 1,
        cursor: isEditing ? 'move' : 'default',
      }}
    >
      <DashboardWidget
        id={widget.id}
        title={widget.title}
        type={widget.type}
        isEditing={isEditing}
        isExpanded={widget.isExpanded}
        onRemove={onRemove}
        onExpand={onExpand}
      >
        {children}
      </DashboardWidget>
    </div>
  );
};

export default function CustomizableDashboard({ accounts, trades }: CustomizableDashboardProps) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(defaultWidgets);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [newWidgetType, setNewWidgetType] = useState<string>('');

  const moveWidget = useCallback((draggedId: string, targetPosition: { x: number; y: number }) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === draggedId 
        ? { ...widget, position: targetPosition }
        : widget
    ));
  }, []);

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id));
  }, []);

  const expandWidget = useCallback((id: string) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === id 
        ? { ...widget, isExpanded: !widget.isExpanded }
        : widget
    ));
  }, []);

  const addWidget = useCallback(() => {
    if (newWidgetType) {
      const newWidget: WidgetConfig = {
        id: Date.now().toString(),
        type: newWidgetType,
        title: newWidgetType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        position: { x: 0, y: 0 },
        size: { width: 300, height: 200 },
        isExpanded: false,
      };
      setWidgets(prev => [...prev, newWidget]);
      setShowAddWidget(false);
      setNewWidgetType('');
    }
  }, [newWidgetType]);

  const resetLayout = useCallback(() => {
    setWidgets(defaultWidgets);
  }, []);

  const saveLayout = useCallback(() => {
    localStorage.setItem('dashboard-layout', JSON.stringify(widgets));
  }, [widgets]);

  const renderWidgetContent = (widget: WidgetConfig) => {
    switch (widget.type) {
      case 'account-overview':
        const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
        const totalAccounts = accounts.length;
        const activeAccounts = accounts.filter(acc => acc.status === 'active').length;
        
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">Total Balance</p>
                <p className="text-2xl font-bold text-prop-gold">${totalBalance.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Active Accounts</p>
                <p className="text-2xl font-bold text-prop-blue">{activeAccounts}/{totalAccounts}</p>
              </div>
            </div>
          </div>
        );
      
      case 'recent-trades':
        const recentTrades = trades.slice(0, 5);
        return (
          <div className="space-y-2">
            {recentTrades.length === 0 ? (
              <p className="text-gray-400 text-sm">No recent trades</p>
            ) : (
              recentTrades.map((trade: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-prop-dark rounded">
                  <span className="text-sm text-gray-300">{trade.symbol}</span>
                  <span className={`text-sm font-medium ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl}
                  </span>
                </div>
              ))
            )}
          </div>
        );
      
      case 'performance-chart':
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-prop-gold mx-auto mb-4" />
              <p className="text-gray-400">Performance Chart Widget</p>
              <p className="text-sm text-gray-500">Chart visualization will appear here</p>
            </div>
          </div>
        );
      
      case 'risk-metrics':
        return (
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Risk Level</span>
              <Badge variant="outline" className="text-prop-blue border-prop-blue">Low</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Max Drawdown</span>
              <span className="text-sm text-red-500">-2.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Win Rate</span>
              <span className="text-sm text-green-500">68%</span>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400">Widget content</p>
          </div>
        );
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gradient-rainbow">Customizable Dashboard</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="border-prop-gold/30 text-prop-gold hover:bg-prop-gold/10"
            >
              <Settings className="h-4 w-4 mr-2" />
              {isEditing ? 'Done' : 'Edit'}
            </Button>
            {isEditing && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddWidget(true)}
                  className="border-prop-blue/30 text-prop-blue hover:bg-prop-blue/10"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Widget
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetLayout}
                  className="border-orange-400/30 text-orange-400 hover:bg-orange-400/10"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveLayout}
                  className="border-green-400/30 text-green-500 hover:bg-green-400/10"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="relative min-h-[600px] bg-prop-dark/20 rounded-lg border border-prop-gold/20 p-4">
          {widgets.map(widget => (
            <DraggableWidget
              key={widget.id}
              widget={widget}
              isEditing={isEditing}
              onMove={moveWidget}
              onRemove={removeWidget}
              onExpand={expandWidget}
            >
              {renderWidgetContent(widget)}
            </DraggableWidget>
          ))}
        </div>

        {showAddWidget && (
          <Card className="bg-prop-card border-prop-gold/20">
            <CardHeader>
              <CardTitle className="text-prop-gold">Add New Widget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Select value={newWidgetType} onValueChange={setNewWidgetType}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select widget type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="account-overview">Account Overview</SelectItem>
                    <SelectItem value="recent-trades">Recent Trades</SelectItem>
                    <SelectItem value="performance-chart">Performance Chart</SelectItem>
                    <SelectItem value="risk-metrics">Risk Metrics</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addWidget} className="bg-prop-gradient-gold text-black hover:bg-prop-gold">
                  Add Widget
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddWidget(false)}
                  className="border-gray-600 text-gray-400 hover:bg-gray-800"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DndProvider>
  );
}