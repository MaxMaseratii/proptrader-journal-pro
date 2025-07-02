import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Layout, 
  Bot, 
  Share2, 
  Activity, 
  Users,
  Settings,
  Maximize2
} from 'lucide-react';
import CustomizableDashboard from '@/components/customizable-dashboard';
import AITradingMentor from '@/components/ai-trading-mentor';
import StrategyExport from '@/components/strategy-export';
import RealtimeData from '@/components/realtime-data';
import CommunityForum from '@/components/community-forum';
import type { Account, Trade } from "@shared/schema";

export default function AdvancedDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMentorMinimized, setIsMentorMinimized] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data: accounts, isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: trades, isLoading: tradesLoading } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

  if (accountsLoading || tradesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading advanced dashboard...</p>
        </div>
      </div>
    );
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Advanced Dashboard Header */}
      <div className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-prop-gold via-prop-tiffany to-prop-blue bg-clip-text text-transparent">
                PropJournal Pro - Advanced Platform
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Elite trading dashboard with AI mentoring, real-time data, and community insights
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="border-gray-600 hover:border-prop-gold"
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMentorMinimized(!isMentorMinimized)}
                className={`border-gray-600 ${!isMentorMinimized ? 'bg-prop-gold/20 border-prop-gold' : 'hover:border-prop-gold'}`}
              >
                <Bot className="h-4 w-4 mr-2" />
                AI Mentor
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5 bg-gray-800 border border-gray-600">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <Layout className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="strategy" className="flex items-center space-x-2">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Strategy</span>
            </TabsTrigger>
            <TabsTrigger value="realtime" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Real-time</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Community</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <CustomizableDashboard 
              accounts={accounts || []} 
              trades={trades || []} 
            />
          </TabsContent>

          <TabsContent value="strategy" className="space-y-6">
            <StrategyExport 
              accounts={accounts || []} 
              trades={trades || []} 
            />
          </TabsContent>

          <TabsContent value="realtime" className="space-y-6">
            <RealtimeData />
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <CommunityForum />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dashboard Preferences */}
              <div className="bg-dark-card border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Dashboard Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Auto-refresh data</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Show notifications</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Dark mode</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Compact layout</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>
              </div>

              {/* AI Mentor Settings */}
              <div className="bg-dark-card border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">AI Mentor Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Smart notifications</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Risk alerts</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Performance insights</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Daily summaries</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>
              </div>

              {/* Data Integration */}
              <div className="bg-dark-card border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Data Integration</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Real-time market data</span>
                    <span className="text-green-400 text-sm">Connected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">News feed</span>
                    <span className="text-green-400 text-sm">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Economic calendar</span>
                    <span className="text-green-400 text-sm">Synced</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Broker integration</span>
                    <span className="text-yellow-400 text-sm">Setup Required</span>
                  </div>
                </div>
              </div>

              {/* Community Settings */}
              <div className="bg-dark-card border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Community Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Public profile</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Strategy sharing</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Forum notifications</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Peer insights</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Trading Mentor - Floating Component */}
      <AITradingMentor
        accounts={accounts || []}
        trades={trades || []}
        isMinimized={isMentorMinimized}
        onToggleMinimize={() => setIsMentorMinimized(!isMentorMinimized)}
      />
    </div>
  );
}