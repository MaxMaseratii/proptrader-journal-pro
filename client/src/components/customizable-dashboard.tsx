import React, { useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout, Plus, Save, RotateCcw, Grid, Edit3 } from 'lucide-react';
import DashboardWidget from './dashboard-widget';
import type { Account, Trade } from "@shared/schema";

interface WidgetConfig {
  id: string;
  type: 'performance' | 'accounts' | 'trades' | 'calendar' | 'chart' | 'risk';
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isExpanded: boolean;
}

interface CustomizableDashboardProps {
  accounts: Account[];
  trades: Trade[];
}

const defaultWidgets: WidgetConfig[] = [
  { id: 'performance', type: 'performance', title: 'Performance Overview', position: { x: 0, y: 0 }, size: { width: 1, height: 1 }, isExpanded: false },
  { id: 'accounts', type: 'accounts', title: 'Account Summary', position: { x: 1, y: 0 }, size: { width: 1, height: 1 }, isExpanded: false },
  { id: 'trades', type: 'trades', title: 'Recent Trades', position: { x: 2, y: 0 }, size: { width: 1, height: 1 }, isExpanded: false },
  { id: 'calendar', type: 'calendar', title: 'Trading Calendar', position: { x: 0, y: 1 }, size: { width: 2, height: 1 }, isExpanded: false },
  { id: 'chart', type: 'chart', title: 'P&L Chart', position: { x: 2, y: 1 }, size: { width: 1, height: 1 }, isExpanded: false },
  { id: 'risk', type: 'risk', title: 'Risk Metrics', position: { x: 0, y: 2 }, size: { width: 1, height: 1 }, isExpanded: false },
];

function DraggableWidget({ widget, isEditing, onMove, onRemove, onExpand, children }: any) {
  const [{ isDragging }, drag] = useDrag({
    type: 'widget',
    item: { id: widget.id, type: 'widget' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: isEditing,
  });

  const [, drop] = useDrop({
    accept: 'widget',
    drop: (item: any, monitor) => {
      if (!monitor.didDrop() && item.id !== widget.id) {
        onMove(item.id, widget.position);
      }
    },
  });

  const dragHandleProps = drag({ opacity: isDragging ? 0.5 : 1 });

  return (
    <div ref={drop} className="relative">
      <DashboardWidget
        id={widget.id}
        title={widget.title}
        type={widget.type as any}
        isEditing={isEditing}
        isExpanded={widget.isExpanded}
        onRemove={onRemove}
        onExpand={onExpand}
        dragHandleProps={dragHandleProps}
        className={isDragging ? 'opacity-50' : ''}
      >
        {children}
      </DashboardWidget>
    </div>
  );
}

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
    if (!newWidgetType) return;
    
    const newWidget: WidgetConfig = {
      id: `widget-${Date.now()}`,
      type: newWidgetType as any,
      title: `New ${newWidgetType.charAt(0).toUpperCase() + newWidgetType.slice(1)} Widget`,
      position: { x: 0, y: Math.max(...widgets.map(w => w.position.y)) + 1 },
      size: { width: 1, height: 1 },
      isExpanded: false,
    };
    
    setWidgets(prev => [...prev, newWidget]);
    setNewWidgetType('');
    setShowAddWidget(false);
  }, [newWidgetType, widgets]);

  const resetLayout = useCallback(() => {
    setWidgets(defaultWidgets);
  }, []);

  const saveLayout = useCallback(() => {
    localStorage.setItem('dashboard-layout', JSON.stringify(widgets));
    setIsEditing(false);
  }, [widgets]);

  const renderWidgetContent = (widget: WidgetConfig) => {
    switch (widget.type) {
      case 'performance':
        return (
          <div className="space-y-3">
            <div className="text-2xl font-bold text-prop-green">
              ${accounts.reduce((sum, acc) => sum + acc.currentBalance, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Portfolio Value</div>
          </div>
        );
      
      case 'accounts':
        return (
          <div className="space-y-2">
            {accounts.slice(0, 3).map(account => (
              <div key={account.id} className="flex justify-between text-sm">
                <span className="truncate">{account.name}</span>
                <span className="text-prop-gold">${account.currentBalance.toLocaleString()}</span>
              </div>
            ))}
          </div>
        );
      
      case 'trades':
        return (
          <div className="space-y-2">
            {trades.slice(-3).map(trade => (
              <div key={trade.id} className="flex justify-between text-sm">
                <span>{trade.symbol}</span>
                <span className={trade.pnl >= 0 ? 'text-prop-green' : 'text-prop-pink'}>
                  ${trade.pnl.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        );
      
      case 'calendar':
        return (
          <div className="text-center text-gray-400">
            Trading Calendar View
          </div>
        );
      
      case 'chart':
        return (
          <div className="text-center text-gray-400">
            P&L Chart Visualization
          </div>
        );
      
      case 'risk':
        return (
          <div className="space-y-2">
            <div className="text-sm">Risk Level: <span className="text-prop-tiffany">Moderate</span></div>
            <div className="text-sm">Daily Loss: <span className="text-prop-pink">-$250</span></div>
          </div>
        );
      
      default:
        return <div className="text-gray-400">Widget content</div>;
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Dashboard Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Layout className="mr-3 h-6 w-6 text-prop-gold" />
              Customizable Dashboard
            </h2>
            {isEditing && (
              <div className="bg-prop-gold/20 text-prop-gold px-3 py-1 rounded-full text-sm">
                Edit Mode Active
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={() => setIsEditing(!isEditing)}
              className={isEditing ? "bg-prop-gold hover:bg-prop-gold/80" : "border-prop-gold/30 hover:border-prop-gold"}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              {isEditing ? 'Exit Edit' : 'Edit Layout'}
            </Button>
            
            {isEditing && (
              <>
                <Dialog open={showAddWidget} onOpenChange={setShowAddWidget}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-prop-tiffany/30 hover:border-prop-tiffany">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Widget
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-600">
                    <DialogHeader>
                      <DialogTitle className="text-white">Add New Widget</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Select value={newWidgetType} onValueChange={setNewWidgetType}>
                        <SelectTrigger className="bg-gray-700 border-gray-600">
                          <SelectValue placeholder="Select widget type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="performance">Performance</SelectItem>
                          <SelectItem value="accounts">Accounts</SelectItem>
                          <SelectItem value="trades">Trades</SelectItem>
                          <SelectItem value="calendar">Calendar</SelectItem>
                          <SelectItem value="chart">Chart</SelectItem>
                          <SelectItem value="risk">Risk</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex space-x-2">
                        <Button onClick={addWidget} className="bg-prop-tiffany hover:bg-prop-tiffany/80">
                          Add Widget
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddWidget(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" onClick={resetLayout} className="border-gray-500 hover:border-gray-400">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                
                <Button onClick={saveLayout} className="bg-prop-green hover:bg-prop-green/80">
                  <Save className="h-4 w-4 mr-2" />
                  Save Layout
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-min">
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
      </div>
    </DndProvider>
  );
}