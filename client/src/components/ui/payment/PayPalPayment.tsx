import { useState } from 'react';
import PayPalButton from './PayPalButton';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PayPalPaymentProps {
  amount: number;
  currency?: string;
  description?: string;
  onSuccess?: () => void;
}

export default function PayPalPayment({
  amount,
  currency = "USD",
  description,
  onSuccess
}: PayPalPaymentProps) {
  const [showPayPal, setShowPayPal] = useState(false);
  
  // PayPal requires string amounts
  const amountString = (amount / 100).toString();
  
  if (!import.meta.env.PAYPAL_CLIENT_ID) {
    return (
      <Alert>
        <AlertTitle>Payment Configuration Error</AlertTitle>
        <AlertDescription>
          PayPal payments are not configured. Please contact support.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="w-full max-w-md mx-auto">
      {description && (
        <Card className="mb-6 bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-orbitron text-[hsl(var(--cwg-orange))]">
              Order Summary
            </CardTitle>
            <CardDescription>
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="pt-2 border-t border-[hsl(var(--cwg-muted))]/20">
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
      )}
      
      {showPayPal ? (
        <div className="custom-paypal-button-container p-4 bg-[hsl(var(--cwg-dark-blue))] rounded-lg">
          <PayPalButton
            amount={amountString}
            currency={currency.toLowerCase()}
            intent="CAPTURE"
          />
        </div>
      ) : (
        <Button 
          className="w-full bg-[#0070BA] hover:bg-[#005ea6] text-white"
          onClick={() => setShowPayPal(true)}
        >
          Pay with PayPal
        </Button>
      )}
    </div>
  );
}