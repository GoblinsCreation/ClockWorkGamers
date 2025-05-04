import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
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
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { loginMutation } = useAuth();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        form.reset();
        onSuccess();
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  placeholder="Enter your username"
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
                  placeholder="Enter your password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full bg-gradient-to-r from-[hsl(var(--cwg-orange))] to-[hsl(var(--cwg-orange))]/80 text-white py-3 rounded-lg font-orbitron font-medium btn-hover transition-all duration-300"
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </Form>
  );
}

export default LoginForm;
