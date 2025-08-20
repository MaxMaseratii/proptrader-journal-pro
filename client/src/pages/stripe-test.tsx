import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CreditCard, CheckCircle, AlertCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import StripeTestCards from '@/components/StripeTestCards';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

const TestPaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setPaymentResult(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    try {
      // Create payment intent for $29.99 test payment
      const response = await apiRequest('POST', '/api/create-payment-intent', {
        amount: 29.99,
        planId: 'test'
      });
      const { clientSecret } = await response.json();

      // Confirm payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (result.error) {
        setPaymentResult(`Error: ${result.error.message}`);
        toast({
          title: "Payment Failed",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        setPaymentResult("Payment succeeded!");
        toast({
          title: "Payment Successful",
          description: "Test payment completed successfully!",
        });
      }
    } catch (error: any) {
      setPaymentResult(`Error: ${error.message}`);
      toast({
        title: "Payment Error",
        description: error.message,
        variant: "destructive",
      });
    }

    setProcessing(false);
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Test Payment Form
        </CardTitle>
        <p className="text-gray-400 text-sm">
          Use any test card from the list above to simulate a payment
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
            <Label className="text-sm text-gray-200 mb-2 block">Payment Information</Label>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#fff',
                    backgroundColor: 'transparent',
                    '::placeholder': {
                      color: '#9ca3af',
                    },
                  },
                },
              }}
            />
          </div>
          
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
            <p className="text-blue-300 text-sm font-medium">Test Amount: $29.99</p>
            <p className="text-blue-200 text-xs">This is a test transaction and won't be charged</p>
          </div>

          {paymentResult && (
            <div className={`p-3 rounded-lg border ${
              paymentResult.includes('Error') 
                ? 'bg-red-900/20 border-red-700 text-red-300' 
                : 'bg-green-900/20 border-green-700 text-green-300'
            }`}>
              <div className="flex items-center gap-2">
                {paymentResult.includes('Error') ? (
                  <XCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                <span className="text-sm font-medium">{paymentResult}</span>
              </div>
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={!stripe || processing}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {processing ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing Test Payment...
              </div>
            ) : (
              'Test Payment ($29.99)'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default function StripeTest() {
  const [, setLocation] = useLocation();

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Stripe Payment Testing</h1>
            <p className="text-gray-400">
              Test the Stripe integration with various card scenarios
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StripeTestCards />
            <TestPaymentForm />
          </div>

          <div className="text-center">
            <button
              onClick={() => setLocation('/enhanced-signup')}
              className="text-gray-400 hover:text-white flex items-center justify-center gap-2 mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Signup
            </button>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Testing Instructions:</h3>
            <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
              <li>Copy any test card number from the left panel</li>
              <li>Use any future expiry date (e.g., 12/34)</li>
              <li>Use any 3-digit CVC (e.g., 123)</li>
              <li>Use any ZIP code (e.g., 12345)</li>
              <li>Click "Test Payment" to simulate the transaction</li>
            </ol>
          </div>
        </div>
      </div>
    </Elements>
  );
}