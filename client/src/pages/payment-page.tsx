import { useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  ArrowLeft,
  CreditCard,
  WalletCards
} from 'lucide-react';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PaymentSelector from '@/components/ui/payment/PaymentSelector';

// List of services/items that can be purchased
const PURCHASE_OPTIONS = [
  {
    id: 'cwg-membership',
    name: 'CWG Guild Membership',
    description: 'Join our premium membership for exclusive guild benefits, tournaments, and more.',
    prices: [
      { id: 'monthly', name: 'Monthly', amount: 999, period: 'month' },
      { id: 'quarterly', name: 'Quarterly', amount: 2499, period: 'quarter', discount: '17%' },
      { id: 'annual', name: 'Annual', amount: 7999, period: 'year', discount: '33%' }
    ]
  },
  {
    id: 'coaching',
    name: 'Professional Coaching',
    description: 'Get personalized coaching from our top players to improve your gaming skills.',
    prices: [
      { id: 'single', name: 'Single Session', amount: 2999, period: 'one-time' },
      { id: 'package-3', name: '3 Sessions', amount: 7999, period: 'one-time', discount: '11%' },
      { id: 'package-5', name: '5 Sessions', amount: 11999, period: 'one-time', discount: '20%' }
    ]
  },
  {
    id: 'tournament',
    name: 'Tournament Entry',
    description: 'Enter our upcoming tournament with cash prizes and exclusive in-game rewards.',
    prices: [
      { id: 'basic', name: 'Basic Entry', amount: 1999, period: 'one-time' },
      { id: 'premium', name: 'Premium Entry', amount: 3999, period: 'one-time' },
      { id: 'team', name: 'Team Entry (5 players)', amount: 8999, period: 'one-time', discount: '10%' }
    ]
  }
];

export default function PaymentPage() {
  const { user } = useAuth();
  const [selectedOption, setSelectedOption] = useState(PURCHASE_OPTIONS[0]);
  const [selectedPrice, setSelectedPrice] = useState(selectedOption.prices[0]);
  const [showPayment, setShowPayment] = useState(false);

  // Handle option change
  const handleOptionChange = (optionId: string) => {
    const option = PURCHASE_OPTIONS.find(opt => opt.id === optionId);
    if (option) {
      setSelectedOption(option);
      setSelectedPrice(option.prices[0]);
      setShowPayment(false);
    }
  };

  // Handle price change
  const handlePriceChange = (priceId: string) => {
    const price = selectedOption.prices.find(p => p.id === priceId);
    if (price) {
      setSelectedPrice(price);
      setShowPayment(false);
    }
  };

  // Get formatted description for payment
  const getPaymentDescription = () => {
    return `${selectedOption.name} - ${selectedPrice.name}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <section className="bg-mesh py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center mb-6">
              <Link href="/">
                <Button variant="ghost" className="pl-0">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
            
            <h1 className="text-3xl font-orbitron font-bold text-[hsl(var(--cwg-orange))]">
              Payments
            </h1>
            <p className="mt-2 text-[hsl(var(--cwg-muted))] max-w-3xl">
              Select a service or membership to purchase for your Crypto Web Gaming experience.
            </p>
          </div>
        </section>
        
        <section className="py-12 bg-[hsl(var(--cwg-dark))]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {!showPayment ? (
              <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                <CardHeader>
                  <CardTitle className="text-xl font-orbitron text-[hsl(var(--cwg-orange))]">
                    Select Payment Option
                  </CardTitle>
                  <CardDescription>
                    Choose a service and payment plan
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label htmlFor="service">Service</Label>
                    <Select 
                      value={selectedOption.id} 
                      onValueChange={handleOptionChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {PURCHASE_OPTIONS.map(option => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="text-sm text-[hsl(var(--cwg-muted))]">
                      {selectedOption.description}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Payment Plan</Label>
                    <Tabs 
                      value={selectedPrice.id} 
                      onValueChange={handlePriceChange}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-3">
                        {selectedOption.prices.map(price => (
                          <TabsTrigger key={price.id} value={price.id}>
                            {price.name}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      
                      {selectedOption.prices.map(price => (
                        <TabsContent key={price.id} value={price.id}>
                          <Card className="bg-[hsl(var(--cwg-background))] border-[hsl(var(--cwg-background))]">
                            <CardContent className="pt-6">
                              <div className="flex items-baseline justify-between">
                                <div>
                                  <span className="text-2xl font-bold text-[hsl(var(--cwg-text))]">
                                    ${(price.amount / 100).toFixed(2)}
                                  </span>
                                  {price.period !== 'one-time' && (
                                    <span className="text-sm text-[hsl(var(--cwg-muted))]">
                                      /{price.period}
                                    </span>
                                  )}
                                </div>
                                
                                {price.discount && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Save {price.discount}
                                  </span>
                                )}
                              </div>
                              
                              <div className="mt-4 space-y-2">
                                <div className="flex items-center">
                                  <WalletCards className="h-4 w-4 text-[hsl(var(--cwg-orange))] mr-2" />
                                  <span className="text-sm text-[hsl(var(--cwg-text))]">
                                    {price.period === 'one-time' ? 'One-time payment' : `Billed ${price.period}ly`}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <CreditCard className="h-4 w-4 text-[hsl(var(--cwg-orange))] mr-2" />
                                  <span className="text-sm text-[hsl(var(--cwg-text))]">
                                    Secure payment via Stripe or PayPal
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                  
                  <Button 
                    className="w-full mt-6" 
                    onClick={() => setShowPayment(true)}
                  >
                    Continue to Payment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl font-orbitron text-[hsl(var(--cwg-orange))]">
                        Checkout
                      </CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowPayment(false)}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                    </div>
                    <CardDescription>
                      Complete your purchase
                    </CardDescription>
                  </CardHeader>
                </Card>
                
                <PaymentSelector
                  amount={selectedPrice.amount}
                  currency="USD"
                  description={getPaymentDescription()}
                  onSuccess={() => {
                    console.log("Payment successful!");
                    // Handle post-payment actions like updating membership status
                  }}
                />
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}