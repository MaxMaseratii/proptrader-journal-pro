import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function StripeTestCards() {
  const testCards = [
    {
      number: '4242424242424242',
      type: 'Visa',
      result: 'Success',
      description: 'Successful payment',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />
    },
    {
      number: '4000000000000002',
      type: 'Visa',
      result: 'Declined',
      description: 'Generic decline',
      icon: <XCircle className="h-4 w-4 text-red-500" />
    },
    {
      number: '4000000000009995',
      type: 'Visa',
      result: 'Declined',
      description: 'Insufficient funds',
      icon: <XCircle className="h-4 w-4 text-red-500" />
    },
    {
      number: '4000000000000119',
      type: 'Visa',
      result: 'Error',
      description: 'Processing error',
      icon: <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  ];

  return (
    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Stripe Test Cards
        </CardTitle>
        <p className="text-gray-400 text-sm">
          Use these test card numbers to simulate different payment scenarios
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {testCards.map((card, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
            <div className="flex items-center gap-3">
              {card.icon}
              <div>
                <p className="text-white font-mono text-sm">{card.number}</p>
                <p className="text-gray-400 text-xs">{card.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={card.result === 'Success' ? 'default' : 'destructive'} className="text-xs">
                {card.result}
              </Badge>
              <span className="text-gray-400 text-xs">{card.type}</span>
            </div>
          </div>
        ))}
        
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
          <p className="text-blue-300 text-sm font-medium">Additional Test Info:</p>
          <ul className="text-blue-200 text-xs mt-1 space-y-1">
            <li>• Any expiry date in the future (e.g., 12/34)</li>
            <li>• Any 3-digit CVC (e.g., 123)</li>
            <li>• Any ZIP code (e.g., 12345)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}