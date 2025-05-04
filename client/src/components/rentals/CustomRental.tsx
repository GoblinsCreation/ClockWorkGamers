import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { format, differenceInDays } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles, MessageSquare } from "lucide-react";

const customRentalSchema = z.object({
  itemType: z.string().min(1, "Item type is required"),
  rarity: z.string().min(1, "Rarity is required"),
  game: z.string().min(1, "Game is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type CustomRentalFormValues = z.infer<typeof customRentalSchema>;

// List of item types for Boss Fighters
const bossFightersItems = [
  "Boss Body", "Boss Weapon 1", "Boss Weapon 2", "Boss Gadget",
  "Fighter Character", "Fighter Weapon", "Fighter Gadget", "Fighter Tool",
  "Boss Body Skin", "Boss Weapon Skin 1", "Boss Weapon Skin 2", "Boss Gadget Skin",
  "Fighter Character Skin", "Fighter Weapon Skin", "Fighter Gadget Skin", "Fighter Tool Skin"
];

// List of rarities
const rarities = [
  "Common", "Uncommon", "Rare", "Epic", "Legendary",
  "Mythic", "Exalted", "Exotic", "Transcendent", "Unique"
];

// Rarity colors
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

export default function CustomRental({ games }: { games: { id: string, name: string }[] }) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [selectedRarity, setSelectedRarity] = useState<string>("");
  
  const form = useForm<CustomRentalFormValues>({
    resolver: zodResolver(customRentalSchema),
    defaultValues: {
      itemType: "",
      rarity: "",
      game: "",
      description: "",
    },
  });
  
  // Get values from form
  const game = form.watch("game");
  const rarity = form.watch("rarity");
  
  // Update select fields
  const onGameChange = (value: string) => {
    form.setValue("game", value);
    setSelectedGame(value);
  };
  
  const onRarityChange = (value: string) => {
    form.setValue("rarity", value);
    setSelectedRarity(value);
  };
  
  // Calculate price based on rarity (simplified estimate)
  const getEstimatedPrice = () => {
    const rarityPricing: { [key: string]: number } = {
      Common: 10,
      Uncommon: 25,
      Rare: 50, 
      Epic: 100,
      Legendary: 200,
      Mythic: 400,
      Exalted: 800,
      Exotic: 1000,
      Transcendent: 1500,
      Unique: 2000
    };
    
    return rarityPricing[rarity] || 0;
  };
  
  // Calculate days and total price
  const days = dateRange?.from && dateRange?.to 
    ? differenceInDays(dateRange.to, dateRange.from) + 1
    : 0;
  
  const estimatedPricePerDay = getEstimatedPrice();
  const totalPrice = days * estimatedPricePerDay;
  
  const onSubmit = async (values: CustomRentalFormValues) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: "Date range required",
        description: "Please select a rental period",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await apiRequest("POST", "/api/rental-requests", {
        userId: user.id,
        customRequest: JSON.stringify({
          ...values,
          estimatedPricePerDay
        }),
        startDate: format(dateRange.from, "yyyy-MM-dd"),
        endDate: format(dateRange.to, "yyyy-MM-dd"),
        totalPrice,
        status: "pending"
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/rental-requests"] });
      
      toast({
        title: "Custom rental request submitted",
        description: "Your request has been sent for approval. An admin will review it shortly.",
      });
      
      // Reset form
      form.reset();
      setDateRange(undefined);
    } catch (error) {
      toast({
        title: "Failed to submit request",
        description: "An error occurred while submitting your custom rental request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-orange))] mb-6">Custom Rental Request</h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="game"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[hsl(var(--cwg-muted))]">Game</FormLabel>
                  <Select onValueChange={onGameChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]">
                        <SelectValue placeholder="Select a game" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]">
                      {games.map((game) => (
                        <SelectItem key={game.id} value={game.id}>
                          {game.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="itemType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[hsl(var(--cwg-muted))]">Item Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]">
                        <SelectValue placeholder="Select item type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]">
                      {/* Show Boss Fighters items if selected, otherwise generic items */}
                      {game === "boss-fighters" 
                        ? bossFightersItems.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))
                        : [
                            "Character", "Weapon", "Armor", "Accessory", 
                            "Vehicle", "Pet", "Skin", "Special Item"
                          ].map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))
                      }
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="rarity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[hsl(var(--cwg-muted))]">Rarity</FormLabel>
                  <Select onValueChange={onRarityChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))]">
                        <SelectValue placeholder="Select rarity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]">
                      {rarities.map((rarity) => (
                        <SelectItem key={rarity} value={rarity}>
                          <span className={`px-2 py-1 rounded-full text-xs ${rarityColors[rarity] || "text-gray-400 bg-gray-400/20"}`}>
                            {rarity}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[hsl(var(--cwg-muted))]">
                    Specific Requirements
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))] min-h-[100px]"
                      placeholder="Describe the specific asset you need, any attributes, or other requirements..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <h3 className="text-[hsl(var(--cwg-text))] font-orbitron mb-2">Rental Period</h3>
              <DateRangePicker
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>
            
            {dateRange?.from && dateRange?.to && rarity && (
              <Card className="bg-[hsl(var(--cwg-dark-blue))]/30 border-[hsl(var(--cwg-dark-blue))]">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-orbitron text-[hsl(var(--cwg-blue))] mb-4">Estimated Rental Cost</h3>
                  <div className="space-y-2">
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
                    <div className="flex justify-between">
                      <span className="text-[hsl(var(--cwg-muted))]">Est. Price Per Day:</span>
                      <span className="text-[hsl(var(--cwg-orange))]">${estimatedPricePerDay}</span>
                    </div>
                    <div className="flex justify-between border-t border-[hsl(var(--cwg-dark-blue))] pt-2 mt-2">
                      <span className="text-[hsl(var(--cwg-muted))]">Est. Total Price:</span>
                      <span className="text-[hsl(var(--cwg-orange))] font-semibold">${totalPrice}</span>
                    </div>
                    <p className="text-xs text-[hsl(var(--cwg-muted))] italic mt-4">
                      Note: This is an estimated price. The final price will be confirmed by an admin after reviewing your request.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[hsl(var(--cwg-orange))] to-[hsl(var(--cwg-orange))]/80 text-white py-3 rounded-lg font-orbitron font-medium btn-hover transition-all duration-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                "Submit Custom Rental Request"
              )}
            </Button>
          </form>
        </Form>
      </div>
      
      <div>
        <h2 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-blue))] mb-6">How Custom Rentals Work</h2>
        
        <div className="card-gradient rounded-xl overflow-hidden border border-[hsl(var(--cwg-dark-blue))]">
          <div className="p-6">
            <div className="w-full h-48 bg-[hsl(var(--cwg-dark-blue))] rounded-lg overflow-hidden mb-6 flex items-center justify-center">
              <Sparkles className="h-24 w-24 text-[hsl(var(--cwg-blue))]/30" />
            </div>
            
            <p className="text-[hsl(var(--cwg-muted))] mb-6">
              Can't find the exact item you need? Our custom rental system allows you to request specific in-game assets tailored to your requirements.
            </p>
            
            <ol className="space-y-4">
              <li className="flex">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-[hsl(var(--cwg-orange))]/20 flex items-center justify-center text-[hsl(var(--cwg-orange))] mr-3">1</span>
                <p className="text-[hsl(var(--cwg-muted))]">
                  <span className="text-[hsl(var(--cwg-text))]">Submit your request</span> - Fill out the form with details about the item you need
                </p>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-[hsl(var(--cwg-orange))]/20 flex items-center justify-center text-[hsl(var(--cwg-orange))] mr-3">2</span>
                <p className="text-[hsl(var(--cwg-muted))]">
                  <span className="text-[hsl(var(--cwg-text))]">Admin review</span> - Our team will review your request within 24 hours
                </p>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-[hsl(var(--cwg-orange))]/20 flex items-center justify-center text-[hsl(var(--cwg-orange))] mr-3">3</span>
                <p className="text-[hsl(var(--cwg-muted))]">
                  <span className="text-[hsl(var(--cwg-text))]">Confirmation</span> - We'll confirm availability and pricing with you
                </p>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-[hsl(var(--cwg-orange))]/20 flex items-center justify-center text-[hsl(var(--cwg-orange))] mr-3">4</span>
                <p className="text-[hsl(var(--cwg-muted))]">
                  <span className="text-[hsl(var(--cwg-text))]">Payment</span> - Secure payment through our platform
                </p>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-[hsl(var(--cwg-orange))]/20 flex items-center justify-center text-[hsl(var(--cwg-orange))] mr-3">5</span>
                <p className="text-[hsl(var(--cwg-muted))]">
                  <span className="text-[hsl(var(--cwg-text))]">Asset transfer</span> - We'll transfer the requested item to your game account
                </p>
              </li>
            </ol>
            
            <div className="mt-8 p-4 bg-[hsl(var(--cwg-dark))]/80 rounded-lg border border-[hsl(var(--cwg-blue))]/20">
              <div className="flex items-start">
                <MessageSquare className="h-5 w-5 text-[hsl(var(--cwg-blue))] mt-1 mr-3" />
                <p className="text-[hsl(var(--cwg-muted))] text-sm">
                  <span className="text-[hsl(var(--cwg-blue))] font-semibold">Need help?</span> Our team can help you identify the best items for your gameplay style and budget. Just describe what you're looking for in the request.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
