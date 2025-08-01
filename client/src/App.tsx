import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import DashboardShowcase from "@/pages/dashboard-showcase";
import Projections from "@/pages/projections";

import Journal from "@/pages/journal";

import Performance from "@/pages/performance";
import Payouts from "@/pages/payouts";
import Reports from "@/pages/reports";
import Analytics from "@/pages/analytics";
import Trades from "@/pages/trades";
import Profile from "@/pages/profile";
import Welcome from "@/pages/welcome";
import AuthPage from "@/pages/auth-page";
import CsvImport from "@/pages/csv-import";
import Spending from "@/pages/spending";
import Achievements from "@/pages/achievements";
import AdvancedDashboard from "@/pages/advanced-dashboard";
import TradingCompanion from "@/pages/trading-companion";
import DailyPlan from "@/pages/daily-plan";
import Signup from "@/pages/signup";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import Support from "@/pages/support";

import DisciplineAnalysis from "@/pages/discipline-analysis";
import DisciplinaryAssistant from "@/pages/disciplinary-assistant";
import Charts from "@/pages/charts";
import KnowledgeBase from "@/pages/knowledge-base";
import Sidebar from "@/components/sidebar";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/useAuth";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">PropTraderJournal</h2>
            <p className="text-gray-300 mb-8">Please log in to access your trading journal</p>
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-300 mb-2">Demo Credentials:</p>
              <p className="text-yellow-400 font-mono">testdemo@example.com</p>
              <p className="text-yellow-400 font-mono">demo123</p>
            </div>
            <button 
              onClick={() => window.location.href = '/auth.html'}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded"
            >
              Go to Login Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-dark-bg text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard-simple" component={DashboardShowcase} />
          <Route path="/daily-plan" component={DailyPlan} />
          <Route path="/trading-companion" component={TradingCompanion} />
          <Route path="/projections" component={Projections} />

          <Route path="/csv-import" component={CsvImport} />
          <Route path="/spending" component={Spending} />
          <Route path="/journal" component={Journal} />

          <Route path="/performance" component={Performance} />
          <Route path="/payouts" component={Payouts} />
          <Route path="/reports" component={Reports} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/trades" component={Trades} />
          <Route path="/achievements" component={Achievements} />
          <Route path="/charts" component={Charts} />

          <Route path="/discipline-analysis" component={DisciplineAnalysis} />
          <Route path="/disciplinary-assistant" component={DisciplinaryAssistant} />
          <Route path="/knowledge-base" component={KnowledgeBase} />
          <Route path="/profile" component={Profile} />
          <Route path="/welcome" component={Welcome} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms" component={TermsOfService} />
          <Route path="/support" component={Support} />
          <Route path="/signup" component={Signup} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
