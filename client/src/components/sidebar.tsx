import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState } from "react";
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
  Bot,
  Settings,
  Menu,
  X,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Target,
  Activity,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeSwitcherModal } from "@/components/theme-switcher-modal";

const navItems = [
  { href: "/", label: "Dashboard", icon: BarChart3, section: "main" },
  { href: "/trading-dashboard", label: "Mental Check & Daily Plan", icon: Brain, section: "main" },
  { href: "/projections", label: "Challenge Target Planner", icon: TrendingUp, section: "main" },
  { href: "/trading-companion", label: "Trading Companion", icon: Bot, section: "main" },
  { href: "/trades", label: "Trades Log", icon: FileText, section: "main" },
  { href: "/charts", label: "Charts & Analytics", icon: ChartLine, section: "main" },
  { href: "/disciplinary-assistant", label: "Discipline & Psychology Tracker", icon: Settings, section: "main" },
  { href: "/journal", label: "Trading Journal", icon: Book, section: "main" },
  { href: "/spending", label: "Prop Firm Spending", icon: Wallet, section: "main" },
  { href: "/payouts", label: "Payout Records", icon: DollarSign, section: "main" },
  { href: "/reports", label: "Reports", icon: Calendar, section: "main" },
  { href: "/achievements", label: "Achievement", icon: Trophy, section: "main" },
  { href: "/profile", label: "Profile", icon: User, section: "main" },
  { action: "theme", label: "Theme", icon: Settings, section: "main" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPartiallyCollapsed, setIsPartiallyCollapsed] = useState(false);

  const mainItems = navItems.filter(item => item.section === "main");
  const profileItems = navItems.filter(item => item.section === "profile");

  const handleToggleCollapse = () => {
    if (!isCollapsed && !isPartiallyCollapsed) {
      setIsPartiallyCollapsed(true); // First click: partial collapse
    } else if (isPartiallyCollapsed) {
      setIsPartiallyCollapsed(false);
      setIsCollapsed(true); // Second click: full collapse
    } else {
      setIsCollapsed(false); // Third click: expand
    }
  };

  return (
    <aside className={cn(
      "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-prop-gold/20 flex-shrink-0 transition-all duration-300 ease-in-out relative",
      isCollapsed ? "w-16" : isPartiallyCollapsed ? "w-20" : "w-64"
    )}>
      <div className="p-6 border-b border-gray-200 dark:border-prop-gold/20">
        <div className="flex items-center space-x-3">
          <Link 
            href="/welcome"
            className="bg-prop-gradient-rainbow p-3 rounded-xl hover-glow smooth-transition cursor-pointer block"
          >
            <BookOpen className="h-6 w-6 text-white" />
          </Link>
          {!isCollapsed && !isPartiallyCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">#1 PropFirm Trader's Journal</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">PropTrader Journal</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Sidebar toggle button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleCollapse}
        className={cn(
          "absolute top-4 -right-3 z-10 h-6 w-6 p-0 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-prop-gold/20 text-gray-700 dark:text-prop-gold hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-prop-gold/20 hover:border-gray-400 dark:hover:border-prop-gold/40 transition-all duration-200 shadow-md",
          "flex items-center justify-center"
        )}
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : 
         isPartiallyCollapsed ? <PanelLeftClose className="h-3 w-3" /> : 
         <ChevronLeft className="h-3 w-3" />}
      </Button>
      
      <nav className="mt-6 flex-1 overflow-y-auto pb-20">
        {!isCollapsed && !isPartiallyCollapsed && (
          <div className="px-6 mb-4">
            <h3 className="text-xs font-medium text-gray-600 dark:text-prop-gold uppercase tracking-wider">Main</h3>
          </div>
        )}
        <ul className="space-y-2 px-4">
          {mainItems.map(({ href, label, icon: Icon }, index) => (
            <li key={href || `item-${index}`}>
              <Link href={href || "/"} className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-xl smooth-transition cursor-pointer group relative",
                location === href 
                  ? "bg-blue-100 dark:bg-prop-gradient-gold text-blue-900 dark:text-black font-bold" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-prop-card hover:text-blue-700 dark:hover:text-prop-gold hover-scale",
                (isCollapsed || isPartiallyCollapsed) ? "justify-center" : ""
              )}>
                <Icon className={cn(
                  "h-5 w-5 smooth-transition",
                  location === href ? "text-blue-900 dark:text-black" : "text-gray-600 dark:text-gray-400 group-hover:text-blue-700 dark:group-hover:text-prop-gold",
                  !(isCollapsed || isPartiallyCollapsed) ? "mr-3" : ""
                )} />
                {!isCollapsed && !isPartiallyCollapsed && label}
                {(isCollapsed || isPartiallyCollapsed) && (
                  <>
                    <div className="absolute left-full ml-2 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-prop-gold/20 rounded-md text-xs text-gray-700 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-md">
                      {label}
                    </div>
                    {/* Show first letter of first menu item when collapsed */}
                    {index === 0 && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 dark:bg-prop-gold rounded-full flex items-center justify-center text-xs font-bold text-white dark:text-black">
                        {label.charAt(0)}
                      </div>
                    )}
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
