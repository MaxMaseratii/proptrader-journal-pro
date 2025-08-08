import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Critical pages - load immediately
import Welcome from "@/pages/welcome";
import AuthPage from "@/pages/auth-page";
import Signup from "@/pages/signup";
import Sidebar from "@/components/sidebar";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/useAuth";

// Initialize basic performance monitoring
if (typeof window !== 'undefined') {
  console.log('🚀 PropTrader Journal - Performance Optimized Build Loaded');
}

// Lazy load non-critical pages for better performance
const Dashboard = lazy(() => import("@/pages/dashboard"));
const DashboardShowcase = lazy(() => import("@/pages/dashboard-showcase"));
const Projections = lazy(() => import("@/pages/projections"));
const Journal = lazy(() => import("@/pages/journal"));
const Performance = lazy(() => import("@/pages/performance"));
const Payouts = lazy(() => import("@/pages/payouts"));
const Reports = lazy(() => import("@/pages/reports"));
const Analytics = lazy(() => import("@/pages/analytics"));
const Trades = lazy(() => import("@/pages/trades"));
const Profile = lazy(() => import("@/pages/profile"));
const Billing = lazy(() => import("@/pages/billing"));
const CsvImport = lazy(() => import("@/pages/csv-import"));
const Spending = lazy(() => import("@/pages/spending"));
const Achievements = lazy(() => import("@/pages/achievements"));
const AdvancedDashboard = lazy(() => import("@/pages/advanced-dashboard"));
const TradingCompanion = lazy(() => import("@/pages/trading-companion"));
const DailyPlan = lazy(() => import("@/pages/daily-plan"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy"));
const TermsOfService = lazy(() => import("@/pages/terms-of-service"));
const Support = lazy(() => import("@/pages/support"));
const DisciplineAnalysis = lazy(() => import("@/pages/discipline-analysis"));
const DisciplinaryAssistant = lazy(() => import("@/pages/disciplinary-assistant"));
const Charts = lazy(() => import("@/pages/charts"));
const FullChart = lazy(() => import("@/pages/full-chart"));
const TradingDashboard = lazy(() => import("@/pages/trading-dashboard"));
const Notifications = lazy(() => import("@/pages/notifications"));
const Watchlists = lazy(() => import("@/pages/watchlists"));
const PositionSizing = lazy(() => import("@/pages/position-sizing"));
const Accounts = lazy(() => import("@/pages/accounts"));
const RiskManagement = lazy(() => import("@/pages/risk-management"));
const AccountManager = lazy(() => import("@/pages/account-manager"));
const TradingJournalPage = lazy(() => import("@/pages/trading-journal-page"));
const AnalyticsReports = lazy(() => import("@/pages/analytics-reports"));
const MentalFitness = lazy(() => import("@/pages/mental-fitness"));
const NewsCalendar = lazy(() => import("@/pages/news-calendar"));
const StrategyBuilder = lazy(() => import("@/pages/strategy-builder"));
const Product = lazy(() => import("@/pages/product"));
const Security = lazy(() => import("@/pages/security"));
const Integrations = lazy(() => import("@/pages/integrations"));
const API = lazy(() => import("@/pages/api"));
const Changelog = lazy(() => import("@/pages/changelog"));
const Documentation = lazy(() => import("@/pages/documentation"));
const Tutorials = lazy(() => import("@/pages/tutorials"));
const Blog = lazy(() => import("@/pages/blog"));
const Contact = lazy(() => import("@/pages/contact"));
const About = lazy(() => import("@/pages/about"));
const KnowledgeBase = lazy(() => import("@/pages/knowledge-base"));
const KnowledgeBaseArticle = lazy(() => import("@/pages/knowledge-base-article"));
const Terms = lazy(() => import("@/pages/terms"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Pricing = lazy(() => import("@/pages/pricing"));
const FlowStateTraining = lazy(() => import("@/components/FlowStateTraining"));

// Performance optimized loading component
const LoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      <div className="text-foreground text-lg">Loading...</div>
    </div>
  </div>
);

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Loading...</div>
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
        <Route path="/auth" component={AuthPage} />
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
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <Suspense fallback={<LoadingFallback />}>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/flow-state-training" component={FlowStateTraining} />
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
        </Suspense>
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
