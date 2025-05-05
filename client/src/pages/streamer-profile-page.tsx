import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Calendar, Clock, Eye, ThumbsUp, Link as LinkIcon, ChevronLeft, Globe } from 'lucide-react';
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Streamer, StreamerSchedule } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { StreamerTwitchConnect } from '@/components/streamers/StreamerTwitchConnect';
import { StreamerScheduleView } from '@/components/streamers/StreamerScheduleView';

// Extended Streamer type with additional fields from Twitch API
interface TwitchStreamer extends Streamer {
  startedAt?: string;
  thumbnailUrl?: string;
  description?: string;
}

export default function StreamerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const streamerId = parseInt(id);

  // Fetch streamer data
  const { data: streamer, isLoading, error } = useQuery<TwitchStreamer>({
    queryKey: [`/api/streamers/${streamerId}`],
    enabled: !isNaN(streamerId)
  });

  // Fetch streamer schedule
  const { data: streamerSchedules = [] } = useQuery<StreamerSchedule[]>({
    queryKey: [`/api/streamers/${streamerId}/schedule`],
    enabled: !isNaN(streamerId)
  });

  // State for active tab
  const [activeTab, setActiveTab] = useState('about');

  // Handle back button
  const handleBack = () => {
    navigate('/streamers');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0c0c15] to-[#0c0c20]">
        <Navbar />
        <div className="container py-16 flex items-center justify-center">
          <div className="animate-pulse space-y-8 w-full max-w-4xl">
            <div className="flex gap-4">
              <div className="rounded-full bg-gray-800 h-20 w-20"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-6 bg-gray-800 rounded w-1/2"></div>
                <div className="h-4 bg-gray-800 rounded w-1/4"></div>
              </div>
            </div>
            <div className="h-64 bg-gray-800 rounded"></div>
            <div className="h-24 bg-gray-800 rounded"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !streamer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0c0c15] to-[#0c0c20]">
        <Navbar />
        <div className="container py-16">
          <Button variant="outline" onClick={handleBack} className="mb-8">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Streamers
          </Button>
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Streamer Not Found</CardTitle>
              <CardDescription>We couldn't find the streamer you're looking for.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={handleBack}>Return to Streamers List</Button>
            </CardFooter>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Check if current user is the streamer or an admin
  const isStreamerProfile = user && (user.id === streamer.userId || user.isAdmin);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c0c15] to-[#0c0c20]">
      <Navbar />
      <div className="container py-8">
        <Button variant="outline" onClick={handleBack} className="mb-8">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Streamers
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column - Profile info */}
          <div className="lg:col-span-4 space-y-6">
            {/* Profile card */}
            <Card className="overflow-hidden border-2 border-blue-500/30">
              <div className="h-32 bg-gradient-to-r from-blue-900/30 to-orange-900/30 relative">
                {streamer.isLive && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                    <span className="relative mr-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    LIVE
                  </div>
                )}
              </div>
              
              <div className="relative -mt-16 px-6">
                <div className="w-24 h-24 rounded-full border-4 border-[#0c0c15] overflow-hidden bg-[#0c0c15]">
                  <img 
                    src={streamer.profileImageUrl || "https://static-cdn.jtvnw.net/user-default-pictures-uv/75305d54-c7cc-40d1-bb9c-91fbe85943c7-profile_image-300x300.png"} 
                    alt={streamer.displayName} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <CardHeader className="pt-2">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  {streamer.displayName}
                  {streamer.isLive && (
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                  )}
                </CardTitle>
                <CardDescription>
                  {streamer.currentGame ? `Playing ${streamer.currentGame}` : 'Streamer'}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {streamer.isLive && streamer.viewerCount !== undefined && (
                    <div className="flex items-center text-sm">
                      <Eye className="w-4 h-4 mr-2 text-blue-400" />
                      <span>{streamer.viewerCount} viewers watching</span>
                    </div>
                  )}
                  
                  {streamer.isLive && streamer.startedAt && (
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 mr-2 text-blue-400" />
                      <span>Started {format(new Date(streamer.startedAt), 'h:mm a')} ({formatStreamDuration(streamer.startedAt)})</span>
                    </div>
                  )}
                  
                  {streamer.twitchId && (
                    <div className="flex items-center text-sm">
                      <LinkIcon className="w-4 h-4 mr-2 text-blue-400" />
                      <a 
                        href={`https://twitch.tv/${streamer.twitchId}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        twitch.tv/{streamer.twitchId}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col items-stretch gap-3">
                {streamer.isLive && streamer.twitchId && (
                  <Button 
                    className="w-full bg-[#9146FF] hover:bg-[#7d2ff4]"
                    size="lg"
                    asChild
                  >
                    <a 
                      href={`https://twitch.tv/${streamer.twitchId}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Watch Stream
                    </a>
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full border-orange-500 text-orange-500 hover:text-orange-600 hover:border-orange-600"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Follow
                </Button>
              </CardFooter>
            </Card>
            
            {/* Twitch connection (only visible to streamer or admin) */}
            {isStreamerProfile && (
              <StreamerTwitchConnect 
                streamerId={streamerId}
                hasLinkedAccount={!!streamer.twitchId}
              />
            )}
          </div>
          
          {/* Right column - Content */}
          <div className="lg:col-span-8">
            <Card>
              <CardHeader>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="about" className="flex-1">About</TabsTrigger>
                    <TabsTrigger value="schedule" className="flex-1">Stream Schedule</TabsTrigger>
                    {streamer.isLive && (
                      <TabsTrigger value="stream" className="flex-1">Current Stream</TabsTrigger>
                    )}
                  </TabsList>
                </Tabs>
              </CardHeader>
              
              <CardContent className="min-h-[400px]">
                <TabsContent value="about">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">About {streamer.displayName}</h3>
                      <p className="text-gray-400">
                        {streamer.description || `Welcome to ${streamer.displayName}'s profile. This streamer hasn't added a description yet.`}
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Games</h3>
                      <div className="flex flex-wrap gap-2">
                        {streamer.currentGame ? (
                          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">
                            {streamer.currentGame}
                          </span>
                        ) : (
                          <span className="text-gray-400">No games listed</span>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="schedule">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Weekly Stream Schedule</h3>
                      <StreamerScheduleView schedules={streamerSchedules} />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="stream">
                  <div className="space-y-6">
                    {streamer.isLive ? (
                      <>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{streamer.streamTitle || `${streamer.displayName} is Live!`}</h3>
                          {streamer.currentGame && (
                            <div className="text-sm text-gray-400 mb-4">
                              Playing <span className="text-blue-400">{streamer.currentGame}</span>
                            </div>
                          )}
                        </div>
                        
                        {streamer.thumbnailUrl && (
                          <div className="aspect-video overflow-hidden rounded-lg bg-black">
                            <img 
                              src={streamer.thumbnailUrl} 
                              alt={`${streamer.displayName}'s live stream`} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="flex justify-center">
                          <Button 
                            className="bg-[#9146FF] hover:bg-[#7d2ff4]"
                            size="lg"
                            asChild
                          >
                            <a 
                              href={`https://twitch.tv/${streamer.twitchId}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              Watch on Twitch
                            </a>
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <Globe className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                        <h3 className="text-xl font-semibold">Stream is Offline</h3>
                        <p className="text-gray-400 mt-2">
                          {streamer.displayName} is not streaming right now. Check the schedule tab to see when they'll be live.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Helper function to format stream duration
function formatStreamDuration(startedAt: string | Date): string {
  const start = typeof startedAt === 'string' ? new Date(startedAt) : startedAt;
  const now = new Date();
  const diffInMs = now.getTime() - start.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffInHours > 0) {
    return `${diffInHours}h ${diffInMinutes}m`;
  } else {
    return `${diffInMinutes}m`;
  }
}