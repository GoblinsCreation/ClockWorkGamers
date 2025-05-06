import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import StreamersPage from "@/pages/streamers-page";
import StreamerProfilePage from "@/pages/streamer-profile-page";
import RentalsPage from "@/pages/rentals-page";
import CoursesPage from "@/pages/courses-page";
import CalculatorsPage from "@/pages/calculators-page";
import ContactPage from "@/pages/contact-page";
import AdminPage from "@/pages/admin-page-new";
import NFTMarketplacePage from "@/pages/nft-marketplace-page";
import TokenDashboardPage from "@/pages/token-dashboard-page";
import PlayToEarnPage from "@/pages/play-to-earn-page";
import PayToEarnPage from "@/pages/pay-to-earn-page";
import PaymentPage from "@/pages/payment-page";
import PaymentOptionsPage from "@/pages/payment-options";
import GamesPage from "@/pages/games-page";
import InvestmentsPage from "@/pages/investments-page";
import ProfilePage from "@/pages/profile-page";
import ChatPage from "@/pages/chat-page";
import ReferralsPage from "@/pages/referrals-page";
import NewsPage from "@/pages/news-page";
import AchievementsPage from "@/pages/achievements-page";
import DemoPage from "@/pages/demo-page";
import ShowcasePage from "@/pages/showcase-page";
import PrivacyPolicyPage from "@/pages/privacy-policy-page";
import TermsOfServicePage from "@/pages/terms-of-service-page";
import CookiePolicyPage from "@/pages/cookie-policy-page";
import { ProtectedRoute } from "./lib/protected-route";
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from "./hooks/use-auth";
import { Web3Provider } from "./hooks/use-web3";
import SimpleChatWidget from "@/components/chat/SimpleChatWidget";
import AchievementUnlockNotification from "@/components/achievements/AchievementUnlockNotification";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/auth" component={AuthPage} />
      <Route path="/privacy-policy" component={PrivacyPolicyPage} />
      <Route path="/terms-of-service" component={TermsOfServicePage} />
      <Route path="/cookie-policy" component={CookiePolicyPage} />
      
      {/* Protected Routes - Require Authentication */}
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/streamers" component={StreamersPage} />
      <ProtectedRoute path="/streamers/:id" component={StreamerProfilePage} />
      <ProtectedRoute path="/rentals" component={RentalsPage} />
      <ProtectedRoute path="/courses" component={CoursesPage} />
      <ProtectedRoute path="/games" component={GamesPage} />
      <ProtectedRoute path="/investments" component={InvestmentsPage} />
      <ProtectedRoute path="/play-to-earn" component={PlayToEarnPage} />
      <ProtectedRoute path="/pay-to-earn" component={PayToEarnPage} />
      <ProtectedRoute path="/payment" component={PaymentPage} />
      <ProtectedRoute path="/payment-options" component={PaymentOptionsPage} />
      <ProtectedRoute path="/nft-marketplace" component={NFTMarketplacePage} />
      <ProtectedRoute path="/token-dashboard" component={TokenDashboardPage} />
      <ProtectedRoute path="/calculators" component={CalculatorsPage} />
      <ProtectedRoute path="/contact" component={ContactPage} />
      <ProtectedRoute path="/news" component={NewsPage} />
      <ProtectedRoute path="/chat" component={ChatPage} />
      <ProtectedRoute path="/referrals" component={ReferralsPage} />
      <ProtectedRoute path="/achievements" component={AchievementsPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/admin" component={AdminPage} />
      <ProtectedRoute path="/demo" component={DemoPage} />
      <ProtectedRoute path="/showcase" component={ShowcasePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Web3Provider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
              <TooltipProvider>
                <Toaster />
                <Router />
                <SimpleChatWidget />
                <AchievementUnlockNotification />
                <OnboardingFlow />
              </TooltipProvider>
            </ThemeProvider>
        </Web3Provider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
