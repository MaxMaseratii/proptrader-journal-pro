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
      "bg-prop-gradient-main border-r border-prop-gold/20 flex-shrink-0 transition-all duration-300 ease-in-out relative",
      isCollapsed ? "w-16" : isPartiallyCollapsed ? "w-20" : "w-64"
    )}>
      <div className="p-6 border-b border-prop-gold/20">
        <div className="flex items-center space-x-3">
          <Link 
            href="/welcome"
            className="bg-prop-gradient-rainbow p-3 rounded-xl hover-glow smooth-transition cursor-pointer block"
          >
            <BookOpen className="h-6 w-6 text-white" />
          </Link>
          {!isCollapsed && !isPartiallyCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-gradient-rainbow">#1 PropFirm Trader's Journal</h1>
              <p className="text-xs text-gray-400">PropTrader Journal</p>
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
          "absolute top-4 -right-3 z-10 h-6 w-6 p-0 rounded-full bg-dark-card border border-prop-gold/20 text-prop-gold hover:text-white hover:bg-prop-gold/20 hover:border-prop-gold/40 transition-all duration-200 shadow-md",
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
            <h3 className="text-xs font-medium text-prop-gold uppercase tracking-wider">Main</h3>
          </div>
        )}
        <ul className="space-y-2 px-4">
          {mainItems.map(({ href, label, icon: Icon }, index) => (
            <li key={href}>
              <Link href={href} className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-xl smooth-transition cursor-pointer group relative",
                location === href 
                  ? "bg-prop-gradient-gold text-black font-bold" 
                  : "text-gray-300 hover:bg-prop-card hover:text-prop-gold hover-scale",
                (isCollapsed || isPartiallyCollapsed) ? "justify-center" : ""
              )}>
                <Icon className={cn(
                  "h-5 w-5 smooth-transition",
                  location === href ? "text-black" : "text-gray-400 group-hover:text-prop-gold",
                  !(isCollapsed || isPartiallyCollapsed) ? "mr-3" : ""
                )} />
                {!isCollapsed && !isPartiallyCollapsed && label}
                {(isCollapsed || isPartiallyCollapsed) && (
                  <>
                    <div className="absolute left-full ml-2 px-2 py-1 bg-dark-card border border-prop-gold/20 rounded-md text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {label}
                    </div>
                    {/* Show first letter of first menu item when collapsed */}
                    {index === 0 && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-prop-gold rounded-full flex items-center justify-center text-xs font-bold text-black">
                        {label.charAt(0)}
                      </div>
                    )}
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>
        
        {/* User Profile with just initials */}
        <div className="px-4 mt-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:bg-dark-card rounded-lg",
                  isCollapsed ? "justify-center" : "justify-start"
                )}
              >
                <div className={cn(
                  "h-4 w-4 bg-prop-gradient-gold rounded-full flex items-center justify-center text-xs font-bold text-black",
                  !isCollapsed ? "mr-3" : ""
                )}>
                  {user ? (
                    (user as any)?.firstName?.charAt(0) || 
                    (user as any)?.email?.charAt(0).toUpperCase() || 'U'
                  ) : 'U'}
                </div>
                {!isCollapsed && "Profile"}
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
              className="w-64 bg-dark-card border-prop-gold/20 shadow-xl" 
              align="start"
              side="right"
            >
              <DropdownMenuLabel className="text-prop-gold">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-prop-gold/20" />
              
              <DropdownMenuItem 
                className="text-gray-300 hover:bg-dark-surface cursor-pointer"
                onClick={() => window.location.href = '/profile'}
              >
                <User className="mr-2 h-4 w-4 text-blue-400" />
                Profile Settings
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="text-gray-300 hover:bg-dark-surface cursor-pointer"
                onClick={() => window.location.href = '/account-manager'}
              >
                <Shield className="mr-2 h-4 w-4 text-blue-500" />
                Account Management
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="text-gray-300 hover:bg-dark-surface cursor-pointer"
                onClick={() => window.location.href = '/payouts'}
              >
                <CreditCard className="mr-2 h-4 w-4 text-green-400" />
                Billing & Subscription
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="text-gray-300 hover:bg-dark-surface cursor-pointer"
                onClick={() => window.location.href = '/appearance'}
              >
                <Settings className="mr-2 h-4 w-4 text-purple-400" />
                Appearance
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="text-gray-300 hover:bg-dark-surface cursor-pointer"
                onClick={() => window.location.href = '/security'}
              >
                <Shield className="mr-2 h-4 w-4 text-yellow-400" />
                Security Settings
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-prop-gold/20" />
              
              {/* Reports moved to profile section */}
              {profileItems.map(({ href, label, icon: Icon }) => (
                <DropdownMenuItem 
                  key={href}
                  className="text-gray-300 hover:bg-dark-surface cursor-pointer"
                  onClick={() => window.location.href = href}
                >
                  <Icon className="mr-2 h-4 w-4 text-prop-gold" />
                  {label}
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator className="bg-prop-gold/20" />
              
              <DropdownMenuItem 
                className="text-red-400 hover:bg-red-600/20 cursor-pointer"
                onClick={async () => {
                  try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.href = '/welcome';
                  } catch (error) {
                    console.error('Logout error:', error);
                    window.location.href = '/welcome';
                  }
                }}
              >
                <LogOut className="mr-2 h-4 w-4 text-red-400" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </aside>
  );
}
