import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";

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
import Billing from "@/pages/billing";
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
import FullChart from "@/pages/full-chart";
import TradingDashboard from "@/pages/trading-dashboard";
import Notifications from "@/pages/notifications";
import Watchlists from "@/pages/watchlists";
import PositionSizing from "@/pages/position-sizing";
import Accounts from "@/pages/accounts";
import RiskManagement from "@/pages/risk-management";

import AccountManager from "@/pages/account-manager";
import TradingJournalPage from "@/pages/trading-journal-page";
import AnalyticsReports from "@/pages/analytics-reports";
import MentalFitness from "@/pages/mental-fitness";
import NewsCalendar from "@/pages/news-calendar";
import StrategyBuilder from "@/pages/strategy-builder";
import Product from "@/pages/product";
import Security from "@/pages/security";
import Integrations from "@/pages/integrations";
import API from "@/pages/api";
import Changelog from "@/pages/changelog";
import Documentation from "@/pages/documentation";
import Tutorials from "@/pages/tutorials";
import Blog from "@/pages/blog";
import Contact from "@/pages/contact";
import About from "@/pages/about";
import KnowledgeBase from "@/pages/knowledge-base";
import KnowledgeBaseArticle from "@/pages/knowledge-base-article";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import Pricing from "@/pages/pricing";
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
        <Route path="/standalone-auth.html">
          {() => {
            window.location.href = '/standalone-auth.html';
            return null;
          }}
        </Route>
        <Route path="/auth">
          {() => {
            window.location.href = '/auth.html';
            return null;
          }}
        </Route>
        <Route path="/signup" component={Signup} />
        <Route path="/welcome" component={Welcome} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/support" component={Support} />
        <Route path="/knowledge-base" component={KnowledgeBase} />
        <Route path="/" component={Welcome} />
        <Route component={Welcome} />
      </Switch>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-900">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard-simple" component={DashboardShowcase} />
          <Route path="/daily-plan" component={DailyPlan} />
          <Route path="/trading-companion" component={TradingCompanion} />
          <Route path="/trading-dashboard" component={TradingDashboard} />
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
          <Route path="/full-chart" component={FullChart} />

          <Route path="/discipline-analysis" component={DisciplineAnalysis} />
          <Route path="/disciplinary-assistant" component={DisciplinaryAssistant} />
          <Route path="/knowledge-base" component={KnowledgeBase} />
          <Route path="/knowledge-base/article/:category/:article" component={KnowledgeBaseArticle} />
          
          {/* Missing critical pages */}
          <Route path="/accounts" component={Accounts} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/risk-management" component={RiskManagement} />
          <Route path="/watchlists" component={Watchlists} />
          <Route path="/position-sizing" component={PositionSizing} />
          
          <Route path="/profile" component={Profile} />
          <Route path="/billing" component={Billing} />

          <Route path="/account-manager" component={AccountManager} />
          <Route path="/trading-journal-page" component={TradingJournalPage} />
          <Route path="/analytics-reports" component={AnalyticsReports} />
          <Route path="/mental-fitness" component={MentalFitness} />
          <Route path="/news-calendar" component={NewsCalendar} />
          <Route path="/strategy-builder" component={StrategyBuilder} />
          <Route path="/product" component={Product} />
          <Route path="/security" component={Security} />
          <Route path="/integrations" component={Integrations} />
          <Route path="/api" component={API} />
          <Route path="/changelog" component={Changelog} />
          <Route path="/knowledge-base" component={KnowledgeBase} />
          <Route path="/documentation" component={Documentation} />
          <Route path="/tutorials" component={Tutorials} />
          <Route path="/blog" component={Blog} />
          <Route path="/contact" component={Contact} />
          <Route path="/about" component={About} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/welcome" component={Welcome} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
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
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
