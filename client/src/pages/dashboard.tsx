import React from "react";
import { useQuery } from "@tanstack/react-query";
import type { Account, Trade } from "@shared/schema";
import WeeklyPerformanceCalendar from "@/components/weekly-performance-calendar";

export default function Dashboard() {
  const { data: accounts } = useQuery<Account[]>({ queryKey: ["/api/accounts"] });
  const { data: trades } = useQuery<Trade[]>({ queryKey: ["/api/trades"] });

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gradient-rainbow mb-8">Trading Dashboard</h1>
        
        {/* Enhanced Weekly Performance Calendar with Navigation and Bar Chart View */}
        <WeeklyPerformanceCalendar trades={trades} />
      </div>
    </div>
  );
}