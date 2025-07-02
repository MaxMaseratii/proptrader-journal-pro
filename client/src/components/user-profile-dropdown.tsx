import React, { useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Settings, 
  CreditCard, 
  Shield, 
  LogOut,
  ChevronDown
} from "lucide-react";
import { useLocation } from "wouter";

export default function UserProfileDropdown() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Get user initials
  const getInitials = () => {
    if (!user) return 'U';
    
    const userAny = user as any;
    const firstName = userAny.firstName || '';
    const lastName = userAny.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (userAny.email) {
      return userAny.email.charAt(0).toUpperCase();
    }
    
    return 'U';
  };

  const handleSignOut = () => {
    window.location.href = '/api/logout';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-12 w-full flex items-center justify-between px-3 hover:bg-prop-card/50 border border-prop-gold/20 rounded-xl"
        >
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8 border-2 border-prop-gold/30">
              <AvatarImage src={(user as any)?.profileImageUrl || ''} />
              <AvatarFallback className="bg-prop-gradient-gold text-black text-sm font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="text-sm font-medium text-white truncate">
                {(user as any)?.firstName || (user as any)?.email?.split('@')[0] || 'User'}
              </div>
              <div className="text-xs text-gray-400">
                {(user as any)?.email || 'user@example.com'}
              </div>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-64 bg-dark-card border-prop-gold/20 shadow-xl" 
        align="end"
        side="right"
      >
        <DropdownMenuLabel className="text-prop-gold">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-prop-gold/20" />
        
        <DropdownMenuItem 
          className="cursor-pointer hover:bg-prop-card focus:bg-prop-card text-white"
          onClick={() => setLocation('/profile')}
        >
          <User className="mr-2 h-4 w-4 text-prop-tiffany" />
          Profile Settings
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="cursor-pointer hover:bg-prop-card focus:bg-prop-card text-white"
          onClick={() => setLocation('/accounts')}
        >
          <Settings className="mr-2 h-4 w-4 text-prop-blue" />
          Account Management
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="cursor-pointer hover:bg-prop-card focus:bg-prop-card text-white"
          onClick={() => window.open('/billing', '_blank')}
        >
          <CreditCard className="mr-2 h-4 w-4 text-prop-green" />
          Billing & Subscription
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="cursor-pointer hover:bg-prop-card focus:bg-prop-card text-white"
          onClick={() => window.open('/security', '_blank')}
        >
          <Shield className="mr-2 h-4 w-4 text-prop-gold" />
          Security Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-prop-gold/20" />
        
        <DropdownMenuItem 
          className="cursor-pointer hover:bg-red-500/20 focus:bg-red-500/20 text-red-400"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}