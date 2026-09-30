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
  Waves,
  Crown,
  Upload
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

// Navigation items organized by section
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
  
  // ACCOUNTS & RECORDS
  { href: "/accounts", label: "Accounts", icon: Target, section: "trading" },
  { href: "/trades", label: "Trades Log", icon: FileText, section: "trading" },
  { href: "/journal", label: "Trading Journal", icon: Book, section: "trading" },
  { href: "/trading-companion", label: "Trading Companion", icon: Bot, section: "trading" },
  { href: "/spending", label: "Prop Firm Spending", icon: Wallet, section: "trading" },
  { href: "/payouts", label: "Payout Records", icon: DollarSign, section: "trading" },
  { href: "/reports", label: "Reports", icon: Calendar, section: "trading" },
  
  // PROFILE
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
  const profileItems = navItems.filter(item => item.section === "profile");

  const handleToggleCollapse = () => {
    if (!isCollapsed && !isPartiallyCollapsed) {
      setIsPartiallyCollapsed(true);
    } else if (isPartiallyCollapsed) {
      setIsPartiallyCollapsed(false);
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  };

  // Sidebar render logic with collapsible states
  return (
    <aside className={cn(
      "bg-background flex-shrink-0 transition-all duration-300 ease-in-out relative flex flex-col h-full",
      isCollapsed ? "w-16" : isPartiallyCollapsed ? "w-20" : "w-64"
    )}>
      {/* Navigation items would be rendered here */}
      {/* See full implementation in Replit repository */}
    </aside>
  );
}
