import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CreditCard, Landmark, Wallet as WalletIcon, AlertCircle, Check } from "lucide-react";
import { useWeb3 } from "@/hooks/use-web3";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function PaymentOptionsPage() {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [amount, setAmount] = useState("100");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { connected, connectWallet } = useWeb3();
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const handlePayment = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue with the payment process.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    if ((paymentMethod === "crypto" || paymentMethod === "phantom") && !connected) {
      toast({
        title: "Wallet Connection Required",
        description: "Please connect your wallet to continue with crypto payment.",
        variant: "destructive"
      });
      connectWallet();
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      toast({
        title: "Payment Successful",
        description: "Your investment has been processed successfully!",
      });
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[hsl(var(--cwg-dark))]">
      <Navbar />
      
      <main className="flex-grow py-16">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold font-orbitron text-[hsl(var(--cwg-text))]">
              Payment Options
            </h1>
            <p className="mt-4 text-[hsl(var(--cwg-muted))] max-w-2xl mx-auto">
              Choose your preferred payment method to invest in ClockWork Gamers' Web3 gaming ecosystem
            </p>
          </div>
          
          {isComplete ? (
            <Card className="border border-[hsl(var(--cwg-green))] bg-[hsl(var(--cwg-dark-blue))]/20">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-[hsl(var(--cwg-green))]/20 rounded-full flex items-center justify-center">
                    <Check className="h-8 w-8 text-[hsl(var(--cwg-green))]" />
                  </div>
                </div>
                <CardTitle className="text-center text-2xl font-orbitron text-[hsl(var(--cwg-text))]">
                  Payment Successful!
                </CardTitle>
                <CardDescription className="text-center text-[hsl(var(--cwg-muted))]">
                  Your investment of {amount} SOL has been processed successfully
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <p className="text-[hsl(var(--cwg-muted))]">
                  You'll receive a confirmation email shortly with details of your investment.
                  You can track your investment in your dashboard.
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button 
                  className="bg-[hsl(var(--cwg-green))] text-white"
                  onClick={() => navigate("/investments")}
                >
                  Return to Investments
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="border border-[hsl(var(--cwg-dark-blue))] bg-[hsl(var(--cwg-dark-blue))]/20">
              <CardHeader>
                <CardTitle className="text-2xl font-orbitron text-[hsl(var(--cwg-text))]">
                  Complete Your Investment
                </CardTitle>
                <CardDescription className="text-[hsl(var(--cwg-muted))]">
                  Select your preferred payment method and enter investment details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="amount" className="text-[hsl(var(--cwg-text))]">Investment Amount (SOL)</Label>
                    <Input 
                      id="amount" 
                      type="number" 
                      min="0.1" 
                      step="0.1" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]" 
                    />
                  </div>
                  
                  <div>
                    <Label className="text-[hsl(var(--cwg-text))] mb-2 block">Payment Method</Label>
                    <Tabs defaultValue="card" value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
                      <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="card" className="font-orbitron">
                          <CreditCard className="h-4 w-4 mr-2" /> Credit/Debit
                        </TabsTrigger>
                        <TabsTrigger value="paypal" className="font-orbitron">
                          <Landmark className="h-4 w-4 mr-2" /> PayPal
                        </TabsTrigger>
                        <TabsTrigger value="crypto" className="font-orbitron">
                          <WalletIcon className="h-4 w-4 mr-2" /> Crypto Wallet
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="card" className="space-y-4">
                        <Alert className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-blue))]">
                          <AlertCircle className="h-4 w-4 text-[hsl(var(--cwg-blue))]" />
                          <AlertTitle className="text-[hsl(var(--cwg-text))]">Secure Payment</AlertTitle>
                          <AlertDescription className="text-[hsl(var(--cwg-muted))]">
                            Your card details are securely processed and never stored on our servers.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="cardName" className="text-[hsl(var(--cwg-text))]">Name on Card</Label>
                            <Input 
                              id="cardName" 
                              placeholder="John Doe" 
                              className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]" 
                            />
                          </div>
                          <div>
                            <Label htmlFor="cardNumber" className="text-[hsl(var(--cwg-text))]">Card Number</Label>
                            <Input 
                              id="cardNumber" 
                              placeholder="1234 5678 9012 3456" 
                              className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]" 
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="expiry" className="text-[hsl(var(--cwg-text))]">Expiry Date</Label>
                              <Input 
                                id="expiry" 
                                placeholder="MM/YY" 
                                className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]" 
                              />
                            </div>
                            <div>
                              <Label htmlFor="cvc" className="text-[hsl(var(--cwg-text))]">CVC</Label>
                              <Input 
                                id="cvc" 
                                placeholder="123" 
                                className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]" 
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="paypal" className="space-y-4">
                        <Alert className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-blue))]">
                          <AlertCircle className="h-4 w-4 text-[hsl(var(--cwg-blue))]" />
                          <AlertTitle className="text-[hsl(var(--cwg-text))]">PayPal Integration</AlertTitle>
                          <AlertDescription className="text-[hsl(var(--cwg-muted))]">
                            You'll be redirected to PayPal to complete your payment securely.
                          </AlertDescription>
                        </Alert>
                        
                        <div className="p-6 bg-[hsl(var(--cwg-dark))] rounded-md border border-[hsl(var(--cwg-dark-blue))] flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-[hsl(var(--cwg-muted))] mb-4">
                              Click the button below to proceed to PayPal checkout
                            </p>
                            <img 
                              src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png" 
                              alt="PayPal Logo" 
                              className="h-8 mx-auto mb-4" 
                            />
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="crypto" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Button 
                              className="w-full h-20 bg-[hsl(var(--cwg-dark))] hover:bg-[hsl(var(--cwg-dark-blue))]/20 border border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]"
                              onClick={() => {
                                setPaymentMethod("metamask");
                                connectWallet();
                              }}
                            >
                              <div className="flex flex-col items-center">
                                <img 
                                  src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                                  alt="MetaMask" 
                                  className="h-8 mb-2" 
                                />
                                <span>MetaMask</span>
                              </div>
                            </Button>
                          </div>
                          
                          <div>
                            <Button 
                              className="w-full h-20 bg-[hsl(var(--cwg-dark))] hover:bg-[hsl(var(--cwg-dark-blue))]/20 border border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]"
                              onClick={() => {
                                setPaymentMethod("phantom");
                                connectWallet();
                              }}
                            >
                              <div className="flex flex-col items-center">
                                <img 
                                  src="https://cryptologos.cc/logos/phantom-phm-logo.svg" 
                                  alt="Phantom" 
                                  className="h-8 mb-2" 
                                />
                                <span>Phantom</span>
                              </div>
                            </Button>
                          </div>
                        </div>
                        
                        {connected ? (
                          <Alert className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-green))]">
                            <Check className="h-4 w-4 text-[hsl(var(--cwg-green))]" />
                            <AlertTitle className="text-[hsl(var(--cwg-text))]">Wallet Connected</AlertTitle>
                            <AlertDescription className="text-[hsl(var(--cwg-muted))]">
                              Your wallet is connected and ready for payment.
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <Alert className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-orange))]">
                            <AlertCircle className="h-4 w-4 text-[hsl(var(--cwg-orange))]" />
                            <AlertTitle className="text-[hsl(var(--cwg-text))]">Wallet Required</AlertTitle>
                            <AlertDescription className="text-[hsl(var(--cwg-muted))]">
                              Please connect your wallet to continue with crypto payment.
                            </AlertDescription>
                          </Alert>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-gradient-to-r from-[hsl(var(--cwg-blue))] to-[hsl(var(--cwg-green))] text-white font-orbitron"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : `Invest ${amount} SOL`}
                </Button>
              </CardFooter>
            </Card>
          )}
          
          <div className="mt-8">
            <Alert className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]">
              <AlertCircle className="h-4 w-4 text-[hsl(var(--cwg-blue))]" />
              <AlertTitle className="text-[hsl(var(--cwg-text))]">Payment Options</AlertTitle>
              <AlertDescription className="text-[hsl(var(--cwg-muted))]">
                We support multiple payment methods including credit/debit cards, PayPal, and cryptocurrency wallets like MetaMask and Phantom.
                All transactions are secure and your financial information is never stored on our servers.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}