import { useState } from 'react';
import StripePayment from './StripePayment';
import PayPalPayment from './PayPalPayment';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type PaymentMethod = 'stripe' | 'paypal';

interface PaymentSelectorProps {
  amount: number;
  currency?: string;
  description?: string;
  onSuccess?: () => void;
  defaultMethod?: PaymentMethod;
}

export default function PaymentSelector({
  amount,
  currency = 'USD',
  description,
  onSuccess,
  defaultMethod = 'stripe'
}: PaymentSelectorProps) {
  const [method, setMethod] = useState<PaymentMethod>(defaultMethod);
  
  // Check if we have the required API keys
  const stripeEnabled = !!import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  const paypalEnabled = !!import.meta.env.PAYPAL_CLIENT_ID;
  
  if (!stripeEnabled && !paypalEnabled) {
    return (
      <Alert className="max-w-md mx-auto">
        <AlertTitle>Payment Not Available</AlertTitle>
        <AlertDescription>
          Payment methods are not properly configured. Please contact support.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="max-w-md mx-auto bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
      <CardHeader>
        <CardTitle className="text-xl font-orbitron text-[hsl(var(--cwg-orange))]">
          Payment
        </CardTitle>
        {description && (
          <CardDescription>
            {description}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent>
        {stripeEnabled && paypalEnabled ? (
          <Tabs value={method} onValueChange={(value) => setMethod(value as PaymentMethod)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="stripe">Credit Card</TabsTrigger>
              <TabsTrigger value="paypal">PayPal</TabsTrigger>
            </TabsList>
            
            <TabsContent value="stripe">
              <StripePayment 
                amount={amount} 
                currency={currency.toLowerCase()} 
                onSuccess={onSuccess} 
              />
            </TabsContent>
            
            <TabsContent value="paypal">
              <PayPalPayment
                amount={amount}
                currency={currency}
                onSuccess={onSuccess}
              />
            </TabsContent>
          </Tabs>
        ) : stripeEnabled ? (
          <StripePayment 
            amount={amount} 
            currency={currency.toLowerCase()} 
            onSuccess={onSuccess} 
          />
        ) : (
          <PayPalPayment
            amount={amount}
            currency={currency}
            onSuccess={onSuccess}
          />
        )}
        
        <div className="mt-6 pt-4 border-t border-[hsl(var(--cwg-muted))]/30">
          <div className="flex justify-between">
            <span className="text-[hsl(var(--cwg-muted))]">Total:</span>
            <span className="font-medium text-[hsl(var(--cwg-text))]">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency
              }).format(amount / 100)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}