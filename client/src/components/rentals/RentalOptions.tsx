import { useState } from "react";
import { Rental } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Calendar, ShoppingCart, Sparkles, Shield, Clock, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { differenceInDays, format } from "date-fns";
import { useLocation } from "wouter";

// Rarity colors for items
const rarityColors: {[key: string]: string} = {
  Common: "text-gray-400 bg-gray-400/20",
  Uncommon: "text-green-400 bg-green-400/20",
  Rare: "text-blue-400 bg-blue-400/20",
  Epic: "text-purple-500 bg-purple-500/20",
  Legendary: "text-[hsl(var(--cwg-orange))] bg-[hsl(var(--cwg-orange))]/20",
  Mythic: "text-yellow-400 bg-yellow-400/20",
  Exalted: "text-pink-500 bg-pink-500/20",
  Exotic: "text-purple-600 bg-purple-600/20",
  Transcendent: "text-red-500 bg-red-500/20",
  Unique: "text-pink-400 bg-pink-400/20"
};

export default function RentalOptions({ rentals, selectedGame }: { rentals: Rental[], selectedGame: string }) {
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Calculate number of days and total price
  const days = dateRange?.from && dateRange?.to 
    ? differenceInDays(dateRange.to, dateRange.from) + 1
    : 0;
  
  const totalPrice = selectedRental 
    ? days * selectedRental.pricePerDay 
    : 0;
  
  // Handle rental request submission
  const handleRentalRequest = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    if (!selectedRental || !dateRange?.from || !dateRange?.to) {
      toast({
        title: "Incomplete form",
        description: "Please select a rental item and date range",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await apiRequest("POST", "/api/rental-requests", {
        userId: user.id,
        rentalId: selectedRental.id,
        startDate: format(dateRange.from, "yyyy-MM-dd"),
        endDate: format(dateRange.to, "yyyy-MM-dd"),
        totalPrice,
        status: "pending"
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/rental-requests"] });
      
      toast({
        title: "Rental request submitted",
        description: "Your request has been sent for approval",
      });
      
      // Reset form
      setSelectedRental(null);
      setDateRange(undefined);
      setIsSubmitting(false);
    } catch (error) {
      toast({
        title: "Failed to submit request",
        description: "An error occurred while submitting your rental request",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  // Get formatted game name
  const formatGameName = (id: string) => {
    return id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  // If no rentals are available
  if (rentals.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingCart className="mx-auto h-16 w-16 text-[hsl(var(--cwg-muted))] mb-4" />
        <h3 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-text))] mb-3">
          No Rentals Available
        </h3>
        <p className="text-[hsl(var(--cwg-muted))] max-w-lg mx-auto mb-6">
          We don't have any rental items available for {formatGameName(selectedGame)} at the moment. Please check back later or try another game.
        </p>
        <Button 
          className="bg-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-dark))] hover:bg-[hsl(var(--cwg-orange))]/90"
          onClick={() => {
            // Use the parent component's tabs state manager instead of direct DOM manipulation
            const tabTrigger = document.querySelector('[value="custom"]') as HTMLElement;
            if (tabTrigger) {
              tabTrigger.click();
            }
          }}
        >
          Try Custom Rental Request
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rentals.map((rental) => (
          <Card key={rental.id} className="card-gradient border-[hsl(var(--cwg-dark-blue))] hover:border-[hsl(var(--cwg-orange))]/50 transition-all duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-[hsl(var(--cwg-text))] font-orbitron">{rental.name}</CardTitle>
                <span className={`px-2 py-1 rounded-full text-xs ${rarityColors[rental.rarity] || "text-gray-400 bg-gray-400/20"}`}>
                  {rental.rarity}
                </span>
              </div>
              <CardDescription className="text-[hsl(var(--cwg-muted))]">
                {rental.itemType} • {formatGameName(selectedGame)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-48 bg-[hsl(var(--cwg-dark-blue))] rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                <Sparkles className="h-16 w-16 text-[hsl(var(--cwg-orange))]/50" />
              </div>
              <p className="text-[hsl(var(--cwg-muted))] mb-4">
                {rental.description || `Premium ${rental.rarity} ${rental.itemType} available for rent. Enhance your gameplay and earnings with this powerful asset.`}
              </p>
              <div className="flex flex-col space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--cwg-muted))] flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-[hsl(var(--cwg-blue))]" /> Min. Duration
                  </span>
                  <span className="text-[hsl(var(--cwg-text))]">1 Day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--cwg-muted))] flex items-center">
                    <Shield className="mr-2 h-4 w-4 text-[hsl(var(--cwg-blue))]" /> Security Deposit
                  </span>
                  <span className="text-[hsl(var(--cwg-text))]">${Math.round(rental.pricePerDay * 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--cwg-muted))] flex items-center">
                    <Wallet className="mr-2 h-4 w-4 text-[hsl(var(--cwg-blue))]" /> Price Per Day
                  </span>
                  <span className="text-[hsl(var(--cwg-orange))] font-semibold">${rental.pricePerDay}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => setSelectedRental(rental)} 
                    className="w-full bg-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-dark))] hover:bg-[hsl(var(--cwg-orange))]/90"
                    disabled={!rental.available}
                  >
                    {rental.available ? "Rent Now" : "Currently Unavailable"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-orbitron text-[hsl(var(--cwg-orange))]">
                      Rent {selectedRental?.name}
                    </DialogTitle>
                    <DialogDescription className="text-[hsl(var(--cwg-muted))]">
                      Choose your rental period and confirm your request.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[hsl(var(--cwg-text))]">Item:</span>
                      <span className="text-[hsl(var(--cwg-text))] font-medium">{selectedRental?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[hsl(var(--cwg-text))]">Rarity:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${selectedRental ? rarityColors[selectedRental.rarity] : ""}`}>
                        {selectedRental?.rarity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[hsl(var(--cwg-text))]">Price Per Day:</span>
                      <span className="text-[hsl(var(--cwg-orange))] font-medium">${selectedRental?.pricePerDay}</span>
                    </div>
                    
                    <div className="border-t border-[hsl(var(--cwg-dark))] pt-4">
                      <h4 className="text-[hsl(var(--cwg-text))] font-orbitron mb-2 flex items-center">
                        <Calendar className="mr-2 h-4 w-4" /> Select Rental Period
                      </h4>
                      <DateRangePicker
                        date={dateRange}
                        onDateChange={setDateRange}
                      />
                    </div>
                    
                    {dateRange?.from && dateRange?.to && (
                      <div className="bg-[hsl(var(--cwg-dark))] p-4 rounded-lg">
                        <h4 className="text-[hsl(var(--cwg-text))] font-orbitron mb-2">Rental Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[hsl(var(--cwg-muted))]">Start Date:</span>
                            <span className="text-[hsl(var(--cwg-text))]">{format(dateRange.from, "MMM dd, yyyy")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[hsl(var(--cwg-muted))]">End Date:</span>
                            <span className="text-[hsl(var(--cwg-text))]">{format(dateRange.to, "MMM dd, yyyy")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[hsl(var(--cwg-muted))]">Duration:</span>
                            <span className="text-[hsl(var(--cwg-text))]">{days} day{days !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex justify-between border-t border-[hsl(var(--cwg-dark-blue))] pt-2 mt-2">
                            <span className="text-[hsl(var(--cwg-muted))]">Total Price:</span>
                            <span className="text-[hsl(var(--cwg-orange))] font-semibold">${totalPrice}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[hsl(var(--cwg-muted))]">Security Deposit:</span>
                            <span className="text-[hsl(var(--cwg-text))]">${selectedRental ? Math.round(selectedRental.pricePerDay * 2) : 0}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      onClick={handleRentalRequest}
                      disabled={!dateRange?.from || !dateRange?.to || isSubmitting}
                      className="w-full bg-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-dark))] hover:bg-[hsl(var(--cwg-orange))]/90"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Rental Request"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
