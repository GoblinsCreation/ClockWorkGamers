import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Loader2, CheckCircle } from 'lucide-react';
import { apiRequest } from "@/lib/queryClient";

// Initialize Stripe
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY as string;
let stripePromise: any = null;

if (stripeKey) {
  stripePromise = loadStripe(stripeKey);
} else {
  console.warn('Missing Stripe key: VITE_STRIPE_PUBLIC_KEY. Payment functionality will be limited.');
}

// Props interface
interface StripePaymentProps {
  amount: number;
  currency: string;
  description: string;
  onSuccess?: () => void;
}

// Inner checkout form component
function CheckoutForm({ onSuccess }: { onSuccess?: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'succeeded' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');

    // Confirm the payment
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`, // Redirect on success
      },
      redirect: 'if_required',
    });

    if (error) {
      console.error('Payment failed:', error);
      setErrorMessage(error.message || 'An unexpected error occurred');
      setPaymentStatus('error');
    } else {
      // The payment has been processed, but may still be pending
      setPaymentStatus('succeeded');
      if (onSuccess) {
        onSuccess();
      }
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      
      <div className="mt-6">
        {paymentStatus === 'succeeded' ? (
          <div className="flex items-center justify-center space-x-2 text-green-500">
            <CheckCircle className="h-5 w-5" />
            <span>Payment successful!</span>
          </div>
        ) : errorMessage ? (
          <div className="text-red-500 text-sm mb-4">
            {errorMessage}
          </div>
        ) : null}
        
        <Button 
          type="submit" 
          className="w-full mt-2" 
          disabled={!stripe || isProcessing || paymentStatus === 'succeeded'}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : paymentStatus === 'succeeded' ? (
            'Paid'
          ) : (
            'Pay Now'
          )}
        </Button>
      </div>
    </form>
  );
}

/**
 * Stripe Payment Component
 * Handles creating a payment intent and rendering the Stripe Elements
 */
export default function StripePayment({ 
  amount, 
  currency, 
  description,
  onSuccess
}: StripePaymentProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function createPaymentIntent() {
      try {
        setLoading(true);
        
        const response = await apiRequest('POST', '/api/create-payment-intent', { 
          amount, 
          currency 
        });
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        console.error('Error creating payment intent:', err);
        setError(err.message || 'Failed to initialize payment. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    createPaymentIntent();
  }, [amount, currency]);

  if (!stripePromise) {
    return (
      <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
        <CardHeader>
          <CardTitle className="text-red-500">Stripe Not Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The Stripe payment method is currently unavailable. Please try another payment method.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--cwg-orange))]" />
            <p className="mt-4 text-[hsl(var(--cwg-muted))]">Initializing payment...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
        <CardHeader>
          <CardTitle className="text-red-500">Payment Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()} className="w-full">
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
      <CardHeader>
        <CardTitle className="text-[hsl(var(--cwg-orange))]">Card Payment</CardTitle>
      </CardHeader>
      
      <CardContent>
        {clientSecret && (
          <Elements 
            stripe={stripePromise} 
            options={{
              clientSecret,
              appearance: {
                theme: 'night',
                variables: {
                  colorPrimary: '#ff7e33',
                  colorBackground: '#1a1c2e',
                  colorText: '#ffffff',
                  colorDanger: '#ff5252',
                  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                  spacingUnit: '4px',
                  borderRadius: '8px',
                },
              },
            }}
          >
            <CheckoutForm onSuccess={onSuccess} />
          </Elements>
        )}
      </CardContent>
    </Card>
  );
}