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
  LogOut,
  BookOpen,
  CreditCard,
  ChevronRight,
  Trophy,
  Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import UserProfileDropdown from "@/components/user-profile-dropdown";

const navItems = [
  { href: "/accounts", label: "Accounts", icon: Wallet, section: "main" },
  { href: "/", label: "Dashboard", icon: ChartLine, section: "main" },
  { href: "/advanced", label: "Advanced Platform", icon: Bot, section: "main" },
  { href: "/projections", label: "Target & Risk Projection", icon: TrendingUp, section: "main" },
  { href: "/trades", label: "Trades", icon: BarChart3, section: "main" },
  { href: "/discipline-analysis", label: "Discipline Analysis", icon: Brain, section: "main" },
  { href: "/journal", label: "Trading Journal", icon: Book, section: "main" },
  { href: "/spending", label: "Prop Spending", icon: CreditCard, section: "main" },
  { href: "/payouts", label: "Payouts", icon: DollarSign, section: "main" },
  { href: "/risk-management", label: "Risk Management", icon: Shield, section: "main" },
  { href: "/achievements", label: "Achievement", icon: Trophy, section: "analytics" },
  { href: "/analytics", label: "Advanced Analytics", icon: Brain, section: "analytics" },
  { href: "/reports", label: "Reports", icon: Calendar, section: "analytics" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const mainItems = navItems.filter(item => item.section === "main");
  const analyticsItems = navItems.filter(item => item.section === "analytics");

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-prop-tiffany/20 flex-shrink-0">
      <div className="p-6 border-b border-prop-tiffany/20">
        <div className="flex items-center space-x-3">
          <div className="bg-prop-gradient-rainbow p-3 rounded-xl hover-glow smooth-transition">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gradient-rainbow">PropJournal Pro</h1>
            <p className="text-xs text-gray-400">Elite Trading Journal</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6 flex-1 overflow-y-auto pb-20">
        <div className="px-6 mb-4">
          <h3 className="text-xs font-medium text-prop-gold uppercase tracking-wider">Main</h3>
        </div>
        <ul className="space-y-2 px-4">
          {mainItems.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-xl smooth-transition cursor-pointer group",
                location === href 
                  ? "bg-prop-gradient-gold text-black font-bold" 
                  : "text-gray-300 hover:bg-prop-card hover:text-prop-gold hover-scale"
              )}>
                <Icon className={cn(
                  "mr-3 h-5 w-5 smooth-transition",
                  location === href ? "text-black" : "text-gray-400 group-hover:text-prop-gold"
                )} />
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
        
        {/* User Profile moved to Analytics section */}
        <div className="px-4 mt-4">
          <UserProfileDropdown />
        </div>
      </nav>
    </aside>
  );
}
