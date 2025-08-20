import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PaymentFormProps {
  selectedPlan: {
    id: string;
    name: string;
    monthlyPrice: number;
    annualPrice: number;
  };
  billingPeriod: 'monthly' | 'annual';
  onSuccess: () => void;
}

export default function PaymentForm({ selectedPlan, billingPeriod, onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      toast({
        title: "Payment Error",
        description: "Payment system is not ready. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast({
        title: "Payment Error",
        description: "Card details are required.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent on the server
      const response = await apiRequest('POST', '/api/create-payment-intent', {
        planId: selectedPlan.id,
        billingPeriod
      });

      const { clientSecret } = await response.json();

      if (!clientSecret) {
        throw new Error("Failed to create payment intent");
      }

      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Customer', // This would come from the form in a real app
          },
        },
      });

      if (error) {
        console.error("Payment error:", error);
        toast({
          title: "Payment Failed",
          description: error.message || "Your payment could not be processed. Please try again.",
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: "Payment Successful",
          description: `Welcome to ${selectedPlan.name}! Your account has been activated.`,
        });
        onSuccess();
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      toast({
        title: "Payment Error", 
        description: error instanceof Error ? error.message : "An error occurred while processing your payment.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        '::placeholder': {
          color: '#9ca3af',
        },
        backgroundColor: '#1f2937',
      },
      invalid: {
        color: '#ef4444',
      },
    },
    hidePostalCode: false,
  };

  return (
    <Card className="bg-gray-800 border-gray-600">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <CreditCard className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Payment Details</h3>
            </div>
            
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Shield className="h-4 w-4 text-green-400" />
              <span>256-bit SSL encryption</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Lock className="h-4 w-4 text-green-400" />
              <span>PCI DSS compliant payment processing</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <CreditCard className="h-4 w-4 text-green-400" />
              <span>Powered by Stripe - trusted by millions</span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Processing Payment...
              </>
            ) : (
              `Complete Payment - $${billingPeriod === 'monthly' ? selectedPlan.monthlyPrice.toFixed(2) : (selectedPlan.annualPrice / 12).toFixed(2)}${billingPeriod === 'monthly' ? '/month' : '/month (billed annually)'}`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}