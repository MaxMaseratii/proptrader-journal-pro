import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import DashboardShowcase from "@/pages/dashboard-showcase";
import Projections from "@/pages/projections";
import Accounts from "@/pages/accounts";
import Journal from "@/pages/journal";
import RiskManagement from "@/pages/risk-management";
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
import AdvancedPlatform from "@/pages/advanced-platform";
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
    return <Welcome />;
  }

  return (
    <div className="flex h-screen bg-dark-bg text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard-simple" component={DashboardShowcase} />
          <Route path="/advanced" component={AdvancedDashboard} />
          <Route path="/projections" component={Projections} />
          <Route path="/accounts" component={Accounts} />
          <Route path="/csv-import" component={CsvImport} />
          <Route path="/spending" component={Spending} />
          <Route path="/journal" component={Journal} />
          <Route path="/risk-management" component={RiskManagement} />
          <Route path="/performance" component={Performance} />
          <Route path="/payouts" component={Payouts} />
          <Route path="/reports" component={Reports} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/trades" component={Trades} />
          <Route path="/achievements" component={Achievements} />
          <Route path="/advanced-platform" component={AdvancedPlatform} />
          <Route path="/profile" component={Profile} />
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
