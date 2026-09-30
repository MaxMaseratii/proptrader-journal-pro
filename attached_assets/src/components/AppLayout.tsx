import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import TradingDisciplineAnalyzer from './TradingDisciplineAnalyzer';

const AppLayout: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useAppContext();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            Trading Discipline Analyzer
          </h1>
          <p className="text-gray-400 text-lg">
            Professional trading discipline assessment and behavioral analysis
          </p>
        </div>
        <TradingDisciplineAnalyzer />
      </div>
    </div>
  );
};

export default AppLayout;