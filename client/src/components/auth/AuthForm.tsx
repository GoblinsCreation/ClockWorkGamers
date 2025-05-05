import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { useLocation } from "wouter";

export function AuthForm() {
  // Get guild parameter from URL if present
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1] || '');
  const guildParam = params.get('guild');
  
  const [activeTab, setActiveTab] = useState<string>(guildParam ? "register" : "login");
  const { user } = useAuth();

  return (
    <Card className="w-full max-w-md mx-auto border-[hsl(var(--cwg-dark-blue))] bg-[hsl(var(--cwg-dark-blue))]/50">
      <CardHeader>
        <CardTitle className="text-2xl font-orbitron text-[hsl(var(--cwg-orange))]">
          {activeTab === "login" ? "Welcome Back" : "Join ClockWork Gamers"}
        </CardTitle>
        <CardDescription>
          {activeTab === "login" 
            ? "Sign in to your account to access exclusive features" 
            : "Create an account to join our Web3 gaming community"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue={guildParam ? "register" : "login"} 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" className="font-orbitron">Sign In</TabsTrigger>
            <TabsTrigger value="register" className="font-orbitron">Create Account</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm onSuccess={() => {}} />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm onSuccess={() => {}} selectedGuild={guildParam || ""} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default AuthForm;
