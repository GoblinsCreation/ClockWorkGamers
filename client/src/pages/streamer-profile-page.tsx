import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Streamer } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StreamerSchedule from "@/components/streamers/StreamerSchedule";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Calendar, 
  GamepadIcon, 
  ArrowLeft, 
  ExternalLink,
  UserX,
  Twitch
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StreamerProfilePage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const streamerId = parseInt(id);
  const [activeTab, setActiveTab] = useState("schedule");
  
  const { data: streamer, isLoading, error } = useQuery<Streamer>({
    queryKey: [`/api/streamers/${streamerId}`],
  });
  
  // Check if the authenticated user is the owner of this streamer profile or an admin
  const isOwner = user && streamer && (user.id === streamer.userId || user.isAdmin);
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-[hsl(var(--cwg-orange))]" />
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !streamer) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <UserX className="h-24 w-24 mx-auto text-[hsl(var(--cwg-muted))]" />
            <h1 className="mt-6 text-3xl font-orbitron font-bold text-[hsl(var(--cwg-orange))]">
              Streamer Not Found
            </h1>
            <p className="mt-3 text-[hsl(var(--cwg-muted))] max-w-2xl mx-auto">
              We couldn't find the streamer you're looking for. They may have been removed or the ID is incorrect.
            </p>
            <Button 
              className="mt-6"
              onClick={() => navigate("/streamers")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Streamers
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header section with streamer information */}
        <section className="bg-mesh py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/streamers">
              <Button 
                variant="link" 
                className="mb-4 pl-0 text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Streamers
              </Button>
            </Link>
            
            <div className="flex flex-col md:flex-row items-start md:items-center">
              {/* Profile Image */}
              <div className="w-24 h-24 rounded-full bg-[hsl(var(--cwg-dark-blue))] border-4 border-[hsl(var(--cwg-orange))] flex items-center justify-center mb-4 md:mb-0 md:mr-6">
                {streamer.profileImageUrl ? (
                  <img 
                    src={streamer.profileImageUrl}
                    alt={streamer.displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-orbitron text-[hsl(var(--cwg-text))]">
                    {streamer.displayName.charAt(0)}
                  </span>
                )}
              </div>
              
              <div>
                <div className="flex items-center flex-wrap gap-2">
                  <h1 className="text-3xl font-orbitron font-bold text-[hsl(var(--cwg-orange))]">
                    {streamer.displayName}
                  </h1>
                  
                  {streamer.isLive && (
                    <Badge className="bg-red-600 text-white">
                      <span className="inline-block w-2 h-2 rounded-full bg-white mr-1 animate-pulse"></span> LIVE
                    </Badge>
                  )}
                </div>
                
                <div className="mt-2 flex flex-wrap items-center gap-4">
                  <a 
                    href={`https://twitch.tv/${streamer.twitchId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[hsl(var(--cwg-muted))] hover:text-[hsl(var(--cwg-orange))] transition-colors flex items-center"
                  >
                    <Twitch className="mr-1 h-4 w-4" />
                    {streamer.twitchId}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                  
                  {streamer.mainGames && streamer.mainGames.length > 0 && (
                    <div className="flex items-center flex-wrap">
                      <GamepadIcon className="mr-1 h-4 w-4 text-[hsl(var(--cwg-muted))]" />
                      <div className="flex flex-wrap gap-1">
                        {streamer.mainGames.map((game, index) => (
                          <Badge 
                            key={index} 
                            variant="outline"
                            className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]"
                          >
                            {game}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {streamer.bio && (
                  <p className="mt-4 text-[hsl(var(--cwg-text))] max-w-3xl">
                    {streamer.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
        
        {/* Content tabs */}
        <section className="py-12 bg-[hsl(var(--cwg-dark))]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs 
              defaultValue="schedule" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full md:w-auto grid-cols-2 md:flex mb-8">
                <TabsTrigger 
                  value="schedule" 
                  className="font-orbitron"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule
                </TabsTrigger>
                
                <TabsTrigger 
                  value="streams" 
                  className="font-orbitron"
                  disabled={true}
                >
                  <Twitch className="mr-2 h-4 w-4" />
                  Recent Streams
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="schedule" className="space-y-4">
                <StreamerSchedule streamer={streamer} />
              </TabsContent>
              
              <TabsContent value="streams" className="space-y-4">
                <Card className="w-full bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                  <CardHeader>
                    <CardTitle className="text-xl font-orbitron text-[hsl(var(--cwg-orange))]">
                      Recent Streams
                    </CardTitle>
                    <CardDescription>
                      Coming soon - This feature is under development
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex justify-center items-center py-16">
                    <p className="text-[hsl(var(--cwg-muted))]">
                      Recent streams will be available here soon
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}