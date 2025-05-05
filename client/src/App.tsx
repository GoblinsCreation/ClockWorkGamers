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
import AdminPage from "@/pages/admin-page";
import NFTMarketplacePage from "@/pages/nft-marketplace-page";
import TokenDashboardPage from "@/pages/token-dashboard-page";
import PlayToEarnPage from "@/pages/play-to-earn-page";
import PayToEarnPage from "@/pages/pay-to-earn-page";
import PaymentPage from "@/pages/payment-page";
import GamesPage from "@/pages/games-page";
import InvestmentsPage from "@/pages/investments-page";
import ProfilePage from "@/pages/profile-page";
import ChatPage from "@/pages/chat-page";
import ReferralPage from "@/pages/referral-page";
import NewsPage from "@/pages/news-page";
import { ProtectedRoute } from "./lib/protected-route";
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from "./hooks/use-auth";
import { Web3Provider } from "./hooks/use-web3";
import FloatingChat from "@/components/chat/FloatingChat";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/streamers" component={StreamersPage} />
      <Route path="/streamers/:id" component={StreamerProfilePage} />
      <Route path="/rentals" component={RentalsPage} />
      <Route path="/courses" component={CoursesPage} />
      <Route path="/games" component={GamesPage} />
      <Route path="/investments" component={InvestmentsPage} />
      <Route path="/play-to-earn" component={PlayToEarnPage} />
      <Route path="/pay-to-earn" component={PayToEarnPage} />
      <Route path="/payment" component={PaymentPage} />
      <Route path="/nft-marketplace" component={NFTMarketplacePage} />
      <Route path="/token-dashboard" component={TokenDashboardPage} />
      <Route path="/calculators" component={CalculatorsPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/news" component={NewsPage} />
      {/* We're using the floating chat, so no need for these separate pages */}
      {/* <Route path="/chat" component={() => ChatPage() as React.ReactElement} /> */}
      <Route path="/referrals" component={ReferralPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/admin" component={AdminPage} />
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
                <FloatingChat />
              </TooltipProvider>
            </ThemeProvider>
        </Web3Provider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
