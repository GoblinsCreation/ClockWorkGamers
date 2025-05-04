import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Check, CreditCard, Wallet } from 'lucide-react';
import StripePayment from './StripePayment';
import PayPalButton from './PayPalButton';

// Payment method types
type PaymentMethod = 'stripe' | 'paypal';

// Props interface
interface PaymentSelectorProps {
  amount: number;
  currency?: string;
  description?: string;
  onSuccess?: () => void;
  defaultMethod?: PaymentMethod;
}

/**
 * Payment selector component that allows users to choose between
 * Stripe and PayPal payment methods
 */
export default function PaymentSelector({
  amount,
  currency = 'USD',
  description = 'Payment',
  onSuccess,
  defaultMethod = 'stripe'
}: PaymentSelectorProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(defaultMethod);
  const { toast } = useToast();
  
  // Format amount for display
  const formattedAmount = (amount / 100).toFixed(2);
  
  // Convert currency to lowercase for API compatibility
  const formattedCurrency = currency.toLowerCase();
  
  // Handle successful payment
  const handleSuccess = () => {
    toast({
      title: "Payment Successful",
      description: "Thank you for your purchase!",
    });
    
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
        <CardHeader>
          <CardTitle className="text-xl font-orbitron text-[hsl(var(--cwg-orange))]">
            Payment Details
          </CardTitle>
          <CardDescription>
            Select your preferred payment method
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex justify-between items-baseline">
            <div className="text-sm text-[hsl(var(--cwg-muted))]">{description}</div>
            <div className="text-xl font-bold text-[hsl(var(--cwg-orange))]">
              {formattedCurrency === 'usd' ? '$' : ''}{formattedAmount} {formattedCurrency !== 'usd' ? formattedCurrency.toUpperCase() : ''}
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <RadioGroup 
            value={paymentMethod} 
            onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <Label 
                htmlFor="stripe-method" 
                className={`flex flex-col items-center gap-2 rounded-md border-2 p-4 cursor-pointer transition-all ${
                  paymentMethod === 'stripe' 
                    ? 'border-[hsl(var(--cwg-orange))] bg-[hsl(var(--cwg-purple-dark))]' 
                    : 'border-muted'
                }`}
              >
                <RadioGroupItem value="stripe" id="stripe-method" className="sr-only" />
                <CreditCard className="h-6 w-6 text-[hsl(var(--cwg-orange))]" />
                <div className="text-center">
                  <div className="font-medium">Credit Card</div>
                  <div className="text-xs text-[hsl(var(--cwg-muted))]">Powered by Stripe</div>
                </div>
                {paymentMethod === 'stripe' && (
                  <Check className="absolute top-2 right-2 h-4 w-4 text-[hsl(var(--cwg-orange))]" />
                )}
              </Label>
            </div>
            
            <div>
              <Label 
                htmlFor="paypal-method" 
                className={`flex flex-col items-center gap-2 rounded-md border-2 p-4 cursor-pointer transition-all ${
                  paymentMethod === 'paypal' 
                    ? 'border-[hsl(var(--cwg-orange))] bg-[hsl(var(--cwg-purple-dark))]' 
                    : 'border-muted'
                }`}
              >
                <RadioGroupItem value="paypal" id="paypal-method" className="sr-only" />
                <Wallet className="h-6 w-6 text-[hsl(var(--cwg-orange))]" />
                <div className="text-center">
                  <div className="font-medium">PayPal</div>
                  <div className="text-xs text-[hsl(var(--cwg-muted))]">Secure checkout</div>
                </div>
                {paymentMethod === 'paypal' && (
                  <Check className="absolute top-2 right-2 h-4 w-4 text-[hsl(var(--cwg-orange))]" />
                )}
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
      
      {paymentMethod === 'stripe' ? (
        <StripePayment 
          amount={amount} 
          currency={formattedCurrency} 
          description={description}
          onSuccess={handleSuccess}
        />
      ) : (
        <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
          <CardContent className="pt-6 flex justify-center">
            <div className="max-w-xs w-full">
              <PayPalButton 
                amount={formattedAmount}
                currency={formattedCurrency === 'usd' ? 'USD' : formattedCurrency.toUpperCase()}
                intent="CAPTURE"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}