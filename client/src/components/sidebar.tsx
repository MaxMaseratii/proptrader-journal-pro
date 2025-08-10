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
  FileText,
  Sun,
  Moon,
  Waves
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
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
  // CORE TRADING & PERFORMANCE
  { href: "/", label: "Dashboard", icon: BarChart3, section: "core" },
  { href: "/projections", label: "Challenge Target Planner", icon: TrendingUp, section: "core" },
  { href: "/charts", label: "Charts & Analytics", icon: ChartLine, section: "core" },
  { href: "/achievements", label: "Achievements", icon: Trophy, section: "core" },
  
  // MENTAL PREPARATION
  { href: "/flow-state-training", label: "Flow State Training", icon: Waves, section: "mental" },
  { href: "/trading-dashboard", label: "Mental Check & Daily Plan", icon: Brain, section: "mental" },
  { href: "/disciplinary-assistant", label: "Discipline & Psychology Tracker", icon: Settings, section: "mental" },
  
  // TRADING EXECUTION & RECORDS
  { href: "/accounts", label: "Accounts", icon: Target, section: "trading" },
  { href: "/trades", label: "Trades Log", icon: FileText, section: "trading" },
  { href: "/journal", label: "Trading Journal", icon: Book, section: "trading" },
  { href: "/trading-companion", label: "Trading Companion", icon: Bot, section: "trading" },
  
  // FINANCIAL MANAGEMENT
  { href: "/spending", label: "Prop Firm Spending", icon: Wallet, section: "financial" },
  { href: "/payouts", label: "Payout Records", icon: DollarSign, section: "financial" },
  { href: "/reports", label: "Reports", icon: Calendar, section: "financial" },
  
  { href: "/profile", label: "Profile", icon: User, section: "profile" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPartiallyCollapsed, setIsPartiallyCollapsed] = useState(false);

  const coreItems = navItems.filter(item => item.section === "core");
  const mentalItems = navItems.filter(item => item.section === "mental");
  const tradingItems = navItems.filter(item => item.section === "trading");
  const financialItems = navItems.filter(item => item.section === "financial");
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
      "bg-background border-r border-prop-gold/20 flex-shrink-0 transition-all duration-300 ease-in-out relative",
      isCollapsed ? "w-16" : isPartiallyCollapsed ? "w-20" : "w-64"
    )}>
      <div className="p-6 border-b border-prop-gold/20">
        <div className="flex items-center space-x-3">
          <Link 
            href="/welcome"
            className="relative w-10 h-10 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg border border-white/10 hover-glow smooth-transition cursor-pointer block"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M3 12h3l3-6 3 12 3-9 3 6h3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="7" cy="6" r="1.5" fill="currentColor"/>
                <circle cx="13" cy="15" r="1.5" fill="currentColor"/>
                <circle cx="19" cy="12" r="1.5" fill="currentColor"/>
              </svg>
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full border border-white shadow-sm"></div>
          </Link>
          {!isCollapsed && !isPartiallyCollapsed && (
            <div>
              <h1 className="text-lg font-black text-foreground">
                PropFirm<span className="text-emerald-500">Pro</span>
              </h1>
              <p className="text-xs text-muted-foreground font-semibold tracking-wide">TRADER'S JOURNAL</p>
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
          "absolute top-4 -right-3 z-10 h-6 w-6 p-0 rounded-full bg-card border border-prop-gold/20 text-prop-gold hover:text-foreground hover:bg-prop-gold/20 hover:border-prop-gold/40 transition-all duration-200 shadow-md",
          "flex items-center justify-center"
        )}
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : 
         isPartiallyCollapsed ? <PanelLeftClose className="h-3 w-3" /> : 
         <ChevronLeft className="h-3 w-3" />}
      </Button>
      
      <nav className="mt-6 flex-1 overflow-y-auto pb-4">
        <div className="space-y-6">
          {/* CORE TRADING & PERFORMANCE Section */}
          <div className="nav-section">
            {!isCollapsed && !isPartiallyCollapsed && (
              <h3 className="text-xs font-medium text-prop-gold uppercase tracking-wider px-6 mb-3">
                PERFORMANCE
              </h3>
            )}
            <ul className="space-y-2 px-4">
              {coreItems.map(({ href, label, icon: Icon }, index) => (
                <li key={href}>
                  <Link href={href} className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-xl smooth-transition cursor-pointer group relative",
                    location === href 
                      ? "bg-prop-gradient-gold text-black font-bold" 
                      : "text-muted-foreground hover:bg-card hover:text-prop-gold hover-scale",
                    (isCollapsed || isPartiallyCollapsed) ? "justify-center" : ""
                  )}>
                    <Icon className={cn(
                      "h-5 w-5 smooth-transition",
                      location === href ? "text-black" : "text-muted-foreground group-hover:text-prop-gold",
                      !(isCollapsed || isPartiallyCollapsed) ? "mr-3" : ""
                    )} />
                    {!isCollapsed && !isPartiallyCollapsed && label}
                    {(isCollapsed || isPartiallyCollapsed) && (
                      <>
                        <div className="absolute left-full ml-2 px-2 py-1 bg-card border border-prop-gold/20 rounded-md text-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-md">
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
          </div>

          {/* MENTAL PREPARATION Section */}
          <div className="nav-section">
            {!isCollapsed && !isPartiallyCollapsed && (
              <h3 className="text-xs font-medium text-prop-gold uppercase tracking-wider px-6 mb-3">
                PRE-SESSION PLANNING
              </h3>
            )}
            <ul className="space-y-2 px-4">
              {mentalItems.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link href={href} className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-xl smooth-transition cursor-pointer group relative",
                    location === href 
                      ? "bg-prop-gradient-gold text-black font-bold" 
                      : "text-muted-foreground hover:bg-card hover:text-prop-gold hover-scale",
                    (isCollapsed || isPartiallyCollapsed) ? "justify-center" : ""
                  )}>
                    <Icon className={cn(
                      "h-5 w-5 smooth-transition",
                      location === href ? "text-black" : "text-muted-foreground group-hover:text-prop-gold",
                      !(isCollapsed || isPartiallyCollapsed) ? "mr-3" : ""
                    )} />
                    {!isCollapsed && !isPartiallyCollapsed && label}
                    {(isCollapsed || isPartiallyCollapsed) && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-card border border-prop-gold/20 rounded-md text-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-md">
                        {label}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* TRADING EXECUTION & RECORDS Section */}
          <div className="nav-section">
            {!isCollapsed && !isPartiallyCollapsed && (
              <h3 className="text-xs font-medium text-prop-gold uppercase tracking-wider px-6 mb-3">
                ACCOUNTS & RECORDS
              </h3>
            )}
            <ul className="space-y-2 px-4">
              {tradingItems.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link href={href} className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-xl smooth-transition cursor-pointer group relative",
                    location === href 
                      ? "bg-prop-gradient-gold text-black font-bold" 
                      : "text-muted-foreground hover:bg-card hover:text-prop-gold hover-scale",
                    (isCollapsed || isPartiallyCollapsed) ? "justify-center" : ""
                  )}>
                    <Icon className={cn(
                      "h-5 w-5 smooth-transition",
                      location === href ? "text-black" : "text-muted-foreground group-hover:text-prop-gold",
                      !(isCollapsed || isPartiallyCollapsed) ? "mr-3" : ""
                    )} />
                    {!isCollapsed && !isPartiallyCollapsed && label}
                    {(isCollapsed || isPartiallyCollapsed) && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-card border border-prop-gold/20 rounded-md text-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-md">
                        {label}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* FINANCIAL MANAGEMENT Section */}
          <div className="nav-section">
            {!isCollapsed && !isPartiallyCollapsed && (
              <h3 className="text-xs font-medium text-prop-gold uppercase tracking-wider px-6 mb-3">
                FINANCIAL MANAGEMENT
              </h3>
            )}
            <ul className="space-y-2 px-4">
              {financialItems.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link href={href} className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-xl smooth-transition cursor-pointer group relative",
                    location === href 
                      ? "bg-prop-gradient-gold text-black font-bold" 
                      : "text-muted-foreground hover:bg-card hover:text-prop-gold hover-scale",
                    (isCollapsed || isPartiallyCollapsed) ? "justify-center" : ""
                  )}>
                    <Icon className={cn(
                      "h-5 w-5 smooth-transition",
                      location === href ? "text-black" : "text-muted-foreground group-hover:text-prop-gold",
                      !(isCollapsed || isPartiallyCollapsed) ? "mr-3" : ""
                    )} />
                    {!isCollapsed && !isPartiallyCollapsed && label}
                    {(isCollapsed || isPartiallyCollapsed) && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-card border border-prop-gold/20 rounded-md text-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-md">
                        {label}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Profile Section - Bottom with Separator */}
        <div className="mt-auto pt-4">
          <div className="border-t border-prop-gold/20 pt-4">
            <ul className="space-y-2 px-4">
            <li>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={cn(
                    "w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl smooth-transition cursor-pointer group relative",
                    location === "/profile" 
                      ? "bg-prop-gradient-gold text-black font-bold" 
                      : "text-muted-foreground hover:bg-card hover:text-prop-gold hover-scale",
                    (isCollapsed || isPartiallyCollapsed) ? "justify-center" : ""
                  )}>
                    <User className={cn(
                      "h-5 w-5 smooth-transition",
                      location === "/profile" ? "text-black" : "text-muted-foreground group-hover:text-prop-gold",
                      !(isCollapsed || isPartiallyCollapsed) ? "mr-3" : ""
                    )} />
                    {!isCollapsed && !isPartiallyCollapsed && "Profile"}
                    {(isCollapsed || isPartiallyCollapsed) && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-card border border-prop-gold/20 rounded-md text-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-md">
                        Profile
                      </div>
                    )}
                  </button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent 
                  className="w-64 bg-gray-800 border-gray-700 shadow-xl z-50"
                  style={{ backgroundColor: '#1f2937', border: '1px solid #374151', opacity: 1 }}
                  align="start"
                  side="right"
                >
                  <DropdownMenuLabel className="text-prop-gold">Profile Settings</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-prop-gold/20" />
                  
                  <DropdownMenuItem 
                    className="text-foreground hover:bg-muted cursor-pointer"
                    onClick={() => window.location.href = '/profile'}
                  >
                    <User className="mr-2 h-4 w-4 text-blue-400" />
                    Account Settings
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="text-foreground hover:bg-muted cursor-pointer"
                    onClick={() => window.location.href = '/billing'}
                  >
                    <Activity className="mr-2 h-4 w-4 text-green-400" />
                    Billing & Subscription
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="text-foreground hover:bg-muted cursor-pointer"
                    onClick={toggleTheme}
                  >
                    {theme === 'dark' ? (
                      <Sun className="mr-2 h-4 w-4 text-yellow-400" />
                    ) : (
                      <Moon className="mr-2 h-4 w-4 text-blue-400" />
                    )}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-prop-gold/20" />
                  
                  <DropdownMenuItem 
                    className="text-foreground hover:bg-muted cursor-pointer"
                    onClick={() => window.location.href = '/knowledge-base'}
                  >
                    <BookOpen className="mr-2 h-4 w-4 text-blue-400" />
                    Knowledge Base
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="text-foreground hover:bg-muted cursor-pointer"
                    onClick={() => window.location.href = '/support'}
                  >
                    <Shield className="mr-2 h-4 w-4 text-green-400" />
                    Support Center
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="text-foreground hover:bg-muted cursor-pointer"
                    onClick={() => window.location.href = '/terms'}
                  >
                    <FileText className="mr-2 h-4 w-4 text-yellow-400" />
                    Terms of Service
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="text-foreground hover:bg-muted cursor-pointer"
                    onClick={() => window.location.href = '/privacy'}
                  >
                    <Shield className="mr-2 h-4 w-4 text-purple-400" />
                    Privacy Policy
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-prop-gold/20" />
                  
                  <DropdownMenuItem 
                    className="text-red-400 hover:bg-red-900/20 hover:text-red-300 cursor-pointer"
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
            </li>
            </ul>
          </div>
        </div>
      </nav>
    </aside>
  );
}
