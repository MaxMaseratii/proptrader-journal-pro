import React from "react";
import { useQuery } from "@tanstack/react-query";
import CustomizableDashboard from "@/components/customizable-dashboard";
import type { Account, Trade } from "@shared/schema";

export default function Dashboard() {
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: trades = [] } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

  return (
    <CustomizableDashboard 
      accounts={accounts}
      trades={trades}
      analytics={[]}
    />
  );
}