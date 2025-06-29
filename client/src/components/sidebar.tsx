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
  User
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: ChartLine, section: "main" },
  { href: "/journal", label: "Trading Journal", icon: Book, section: "main" },
  { href: "/accounts", label: "Accounts", icon: Wallet, section: "main" },
  { href: "/risk-management", label: "Risk Management", icon: Shield, section: "main" },
  { href: "/performance", label: "Performance", icon: BarChart3, section: "analytics" },
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
      
      <div className="absolute bottom-0 w-64 p-6 border-t border-dark-border">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Max Trader</p>
            <p className="text-xs text-gray-400">Pro Account</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
