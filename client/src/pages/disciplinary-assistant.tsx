import React from 'react';
import { useQuery } from '@tanstack/react-query';
import MMMDisciplinaryAssistant from '@/components/MMM-DisciplinaryAssistant';
import type { Trade, Account } from '@shared/schema';

export default function DisciplinaryAssistantPage() {
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  const { data: trades = [] } = useQuery<Trade[]>({
    queryKey: ['/api/trades'],
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <MMMDisciplinaryAssistant
          trades={trades}
          accounts={accounts}
        />
      </div>
    </div>
  );
}