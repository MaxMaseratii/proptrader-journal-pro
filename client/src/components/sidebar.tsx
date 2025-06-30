import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  ChartLine, 
  Book, 
  Wallet, 
  Shield, 
  BarChart3, 
  DollarSign, 
  Calendar,
  TrendingUp,
  User,
  Brain,
  Activity
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: ChartLine, section: "main" },
  { href: "/journal", label: "Trading Journal", icon: Book, section: "main" },
  { href: "/accounts", label: "Accounts", icon: Wallet, section: "main" },
  { href: "/trades", label: "Trades", icon: TrendingUp, section: "main" },
  { href: "/risk-management", label: "Risk Management", icon: Shield, section: "main" },
  { href: "/performance", label: "Performance", icon: BarChart3, section: "analytics" },
  { href: "/analytics", label: "Advanced Analytics", icon: Brain, section: "analytics" },
  { href: "/payouts", label: "Payouts", icon: DollarSign, section: "analytics" },
  { href: "/reports", label: "Reports", icon: Calendar, section: "analytics" },
];

export default function Sidebar() {
  const [location] = useLocation();

  const mainItems = navItems.filter(item => item.section === "main");
  const analyticsItems = navItems.filter(item => item.section === "analytics");

  return (
    <aside className="w-64 bg-dark-surface border-r border-dark-border flex-shrink-0">
      <div className="p-6 border-b border-dark-border">
        <h1 className="text-xl font-bold text-primary">PropTracker Pro</h1>
        <p className="text-sm text-gray-400 mt-1">Professional Trading Dashboard</p>
      </div>
      
      <nav className="mt-6">
        <div className="px-6 mb-4">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Main</h3>
        </div>
        <ul className="space-y-1 px-4">
          {mainItems.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                location === href 
                  ? "bg-primary text-white" 
                  : "text-gray-300 hover:bg-dark-card"
              )}>
                <Icon className="mr-3 h-4 w-4" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
        
        <div className="px-6 mt-8 mb-4">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Analytics</h3>
        </div>
        <ul className="space-y-1 px-4">
          {analyticsItems.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                location === href 
                  ? "bg-primary text-white" 
                  : "text-gray-300 hover:bg-dark-card"
              )}>
                <Icon className="mr-3 h-4 w-4" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 w-64 p-4 border-t border-dark-border bg-dark-surface">
        <div className="space-y-4">
          {/* Trader Profile */}
          <Link href="/profile" className="flex items-center hover:bg-gray-700 p-2 rounded-lg transition-colors -m-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">MM</span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white hover:text-blue-400 cursor-pointer">Max Maserati</p>
              <p className="text-xs text-gray-400">Professional Trader</p>
            </div>
          </Link>

          {/* MMM Stats Subscription */}
          <div className="bg-purple-900 bg-opacity-30 p-3 rounded-lg border border-purple-600 border-opacity-30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-purple-600 bg-opacity-40 rounded flex items-center justify-center mr-2">
                  <Shield className="h-3 w-3 text-purple-400" />
                </div>
                <span className="text-xs font-medium text-white">MMM Stats</span>
              </div>
              <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">Pro</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Plan:</span>
                <span className="text-white">Monthly Pro</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Next billing:</span>
                <span className="text-white">Jan 15</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
