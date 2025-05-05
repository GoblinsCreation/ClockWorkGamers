import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  guild: z.string().min(1, "Please select a guild"),
  referralCode: z.string().optional(),
  discordUsername: z.string().optional(),
  twitchHandle: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm({ onSuccess, selectedGuild = "" }: { onSuccess: () => void, selectedGuild?: string }) {
  const { registerMutation } = useAuth();
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      dateOfBirth: "",
      password: "",
      guild: selectedGuild,
      referralCode: "",
      discordUsername: "",
      twitchHandle: "",
    },
  });
  
  // Set the guild value when selectedGuild changes
  useEffect(() => {
    if (selectedGuild) {
      form.setValue('guild', selectedGuild);
    }
  }, [selectedGuild, form]);

  const onSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate(values, {
      onSuccess: () => {
        form.reset();
        onSuccess();
      }
    });
  };

  const guilds = [
    { value: "ClockWork Gamers", label: "ClockWork Gamers" },
    { value: "The Alchemists", label: "The Alchemists" },
    { value: "The Nest", label: "The Nest" },
    { value: "Kraken Gaming", label: "Kraken Gaming" },
    { value: "BigTimeWarriors", label: "BigTimeWarriors" },
    { value: "FAM Guild", label: "FAM Guild" },
    { value: "Vast Impact Gaming", label: "Vast Impact Gaming" },
    { value: "Tempus Genesis", label: "Tempus Genesis" },
    { value: "No Guild", label: "No Guild" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[hsl(var(--cwg-muted))]">Full Name</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))] focus:border-[hsl(var(--cwg-orange))]" 
                    placeholder="Enter your full name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[hsl(var(--cwg-muted))]">Username</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))] focus:border-[hsl(var(--cwg-orange))]" 
                    placeholder="Choose a username"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[hsl(var(--cwg-muted))]">Email</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="email"
                  className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))] focus:border-[hsl(var(--cwg-orange))]" 
                  placeholder="Enter your email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[hsl(var(--cwg-muted))]">Date of Birth</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="date"
                  className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))] focus:border-[hsl(var(--cwg-orange))]" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[hsl(var(--cwg-muted))]">Password</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="password"
                  className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))] focus:border-[hsl(var(--cwg-orange))]" 
                  placeholder="Choose a password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="guild"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[hsl(var(--cwg-muted))]">Select Guild</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))] focus:border-[hsl(var(--cwg-orange))]">
                    <SelectValue placeholder="Select your guild" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]">
                  {guilds.map((guild) => (
                    <SelectItem key={guild.value} value={guild.value}>
                      {guild.label}
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
          name="referralCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[hsl(var(--cwg-muted))]">Referral Code (Optional)</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))] focus:border-[hsl(var(--cwg-orange))]" 
                  placeholder="Enter referral code if you have one"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discordUsername"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[hsl(var(--cwg-muted))]">Discord Username (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))] focus:border-[hsl(var(--cwg-orange))]" 
                    placeholder="Enter your Discord username"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="twitchHandle"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[hsl(var(--cwg-muted))]">Twitch Handle (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-text))] focus:border-[hsl(var(--cwg-orange))]" 
                    placeholder="Enter your Twitch handle"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full mt-2 bg-gradient-to-r from-[hsl(var(--cwg-orange))] to-[hsl(var(--cwg-orange))]/80 text-white py-3 rounded-lg font-orbitron font-medium btn-hover transition-all duration-300"
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </Form>
  );
}

export default RegisterForm;
