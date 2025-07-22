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
      <Switch>
        <Route path="/signup" component={Signup} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/support" component={Support} />
        <Route component={Welcome} />
      </Switch>
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
          <Route path="/profile" component={Profile} />
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
