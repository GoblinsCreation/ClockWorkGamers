import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  
  // Redirect to home if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="flex min-h-screen bg-black">
      {/* Auth Form */}
      <div className="flex items-center justify-center w-full lg:w-1/2 p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-orange-500">ClockWork Gamers</h1>
            <p className="mt-2 text-gray-400">Your Web3 Gaming Guild</p>
          </div>

          <AuthTabs 
            onLogin={(username, password) => {
              loginMutation.mutate(
                { username, password },
                {
                  onSuccess: () => {
                    toast({
                      title: "Welcome back!",
                      description: "You've successfully logged in.",
                    });
                    setLocation("/");
                  }
                }
              );
            }}
            onRegister={(username, email, password) => {
              registerMutation.mutate(
                { username, email, password, role: "user" },
                {
                  onSuccess: () => {
                    setLocation("/");
                  }
                }
              );
            }}
            isAuthenticating={loginMutation.isPending || registerMutation.isPending}
          />
        </div>
      </div>

      {/* Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-gray-900">
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 flex flex-col items-start justify-center h-full p-12">
          <h2 className="text-4xl font-bold text-white mb-6">Join the Future of Gaming</h2>
          <ul className="space-y-4 text-gray-300">
            <li className="flex items-center">
              <span className="mr-2 text-green-400">✓</span>
              Access exclusive Web3 gaming opportunities
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-green-400">✓</span>
              Connect with top streamers and esports professionals
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-green-400">✓</span>
              Earn rewards and unlock achievements
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-green-400">✓</span>
              Participate in guild events and tournaments
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function AuthTabs({ 
  onLogin, 
  onRegister, 
  isAuthenticating 
}: { 
  onLogin: (username: string, password: string) => void; 
  onRegister: (username: string, email: string, password: string) => void;
  isAuthenticating: boolean;
}) {
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const { toast } = useToast();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      toast({
        title: "Input Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    onLogin(loginForm.username, loginForm.password);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.username || !registerForm.email || !registerForm.password) {
      toast({
        title: "Input Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "Password Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    onRegister(registerForm.username, registerForm.email, registerForm.password);
  };

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="register">Register</TabsTrigger>
      </TabsList>
      
      <TabsContent value="login">
        <Card>
          <form onSubmit={handleLoginSubmit}>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  placeholder="Your username" 
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Your password" 
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isAuthenticating}>
                {isAuthenticating ? "Logging in..." : "Login"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
      
      <TabsContent value="register">
        <Card>
          <form onSubmit={handleRegisterSubmit}>
            <CardHeader>
              <CardTitle>Create Account</CardTitle>
              <CardDescription>Join ClockWork Gamers today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-username">Username</Label>
                <Input 
                  id="new-username" 
                  placeholder="Choose a username" 
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Your email address" 
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Password</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  placeholder="Create a password" 
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  placeholder="Confirm your password" 
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isAuthenticating}>
                {isAuthenticating ? "Creating Account..." : "Create Account"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  );
}