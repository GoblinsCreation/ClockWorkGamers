import { useState, useEffect } from 'react';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Initialize Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.warn('Missing Stripe key: VITE_STRIPE_PUBLIC_KEY. Payment functionality will be limited.');
}
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY ? 
  loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY) : null;

// Component for handling Stripe payment
const StripeCheckoutForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/payment/success',
        },
        redirect: 'if_required'
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Thank you for your purchase!",
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong with the payment process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            Processing...
          </>
        ) : (
          "Pay Now"
        )}
      </Button>
    </form>
  );
};

// Props for the StripePayment component
interface StripePaymentProps {
  amount: number;
  currency?: string;
  onSuccess?: () => void;
  description?: string;
}

// Main component that initializes Stripe and sets up payment intent
export default function StripePayment({ 
  amount, 
  currency = "usd", 
  onSuccess,
  description 
}: StripePaymentProps) {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initializePayment = async () => {
      if (!stripePromise) {
        setError('Stripe API key is missing. Please configure VITE_STRIPE_PUBLIC_KEY.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await apiRequest("POST", "/api/create-payment-intent", { 
          amount, 
          currency 
        });
        
        if (!response.ok) {
          throw new Error('Failed to initialize payment');
        }
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Payment initialization error:', err);
        setError('Failed to initialize payment. Please try again.');
        toast({
          title: "Payment Error",
          description: "Could not initialize the payment process. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, [amount, currency, toast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--cwg-orange))]" />
        <p className="text-[hsl(var(--cwg-text))]">Initializing payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Payment Error</AlertTitle>
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!stripePromise) {
    return (
      <Alert>
        <AlertTitle>Payment Configuration Error</AlertTitle>
        <AlertDescription>
          Stripe payments are not configured. Please contact support.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {description && (
        <div className="mb-6 p-4 bg-[hsl(var(--cwg-dark-blue))] rounded-lg">
          <h3 className="text-lg font-orbitron mb-2 text-[hsl(var(--cwg-orange))]">
            Order Summary
          </h3>
          <p className="text-[hsl(var(--cwg-text))]">{description}</p>
          <div className="mt-3 pt-3 border-t border-[hsl(var(--cwg-muted))]/20">
            <div className="flex justify-between">
              <span className="text-[hsl(var(--cwg-muted))]">Total:</span>
              <span className="font-medium text-[hsl(var(--cwg-text))]">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: currency.toUpperCase()
                }).format(amount / 100)}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {clientSecret && (
        <Elements 
          stripe={stripePromise} 
          options={{ 
            clientSecret,
            appearance: {
              theme: 'night',
              variables: {
                colorPrimary: '#FF6B00',
                colorBackground: '#1E1E2F',
                colorText: '#FFFFFF',
                colorDanger: '#FF4D4F',
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '4px',
              },
            },
          }}
        >
          <StripeCheckoutForm onSuccess={onSuccess} />
        </Elements>
      )}
    </div>
  );
}