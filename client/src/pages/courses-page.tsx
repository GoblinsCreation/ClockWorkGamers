import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Course } from "@shared/schema";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CourseCard from "@/components/courses/CourseCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Loader2, GraduationCap, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function CoursesPage() {
  const [selectedGame, setSelectedGame] = useState("boss-fighters");
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: [`/api/courses?game=${selectedGame}`],
  });
  
  // Available games for courses
  const games = [
    { id: "boss-fighters", name: "Boss Fighters" },
    { id: "kokodi", name: "KoKodi" },
    { id: "nyan-heroes", name: "Nyan Heroes" },
    { id: "big-time", name: "Big Time" },
    { id: "worldshards", name: "WorldShards" },
    { id: "off-the-grid", name: "Off The Grid" },
    { id: "ravenquest", name: "RavenQuest" },
  ];
  
  // Instructors information
  const instructors = [
    {
      id: 1,
      name: "CWG | FrostiiGoblin",
      role: "Weapon & Combat Specialist",
      expertise: "Boss Fighters, KoKodi, Nyan Heroes",
    },
    {
      id: 2,
      name: "CWG | YarblesTV",
      role: "Crafting & Economy Expert",
      expertise: "Boss Fighters, Big Time, WorldShards",
    },
    {
      id: 3,
      name: "CWG | Nexion",
      role: "Strategy & Game Mechanics",
      expertise: "Off The Grid, RavenQuest",
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header section */}
        <section className="bg-mesh py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-orbitron font-bold text-[hsl(var(--cwg-orange))]">Web3 Game Courses</h1>
              <p className="mt-3 text-[hsl(var(--cwg-muted))] max-w-2xl mx-auto">
                Learn directly from top players and maximize your skills and earnings in Web3 games
              </p>
            </div>
          </div>
        </section>
        
        {/* Courses section */}
        <section className="py-12 bg-[hsl(var(--cwg-dark))]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <Tabs defaultValue="courses">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <TabsList>
                    <TabsTrigger value="courses" className="font-orbitron">Courses</TabsTrigger>
                    <TabsTrigger value="instructors" className="font-orbitron">Instructors</TabsTrigger>
                    <TabsTrigger value="how-it-works" className="font-orbitron">How It Works</TabsTrigger>
                  </TabsList>
                  
                  <div className="w-full sm:w-auto">
                    <Select 
                      defaultValue={selectedGame} 
                      value={selectedGame}
                      onValueChange={setSelectedGame}
                    >
                      <SelectTrigger className="w-full sm:w-[220px] bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
                        <SelectValue placeholder="Select Game" />
                      </SelectTrigger>
                      <SelectContent className="bg-[hsl(var(--cwg-dark))] border-[hsl(var(--cwg-dark-blue))]">
                        {games.map((game) => (
                          <SelectItem key={game.id} value={game.id}>
                            {game.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <TabsContent value="courses">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                      <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--cwg-orange))]" />
                    </div>
                  ) : courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {courses.map((course) => (
                        <CourseCard 
                          key={course.id} 
                          course={course} 
                          isGuildMember={user?.guild === "ClockWork Gamers"}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-muted))]">
                        No courses available for this game yet.
                      </h3>
                      <p className="mt-2 text-[hsl(var(--cwg-muted))]">
                        Please check back later or select a different game.
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="instructors">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {instructors.map((instructor) => (
                      <div key={instructor.id} className="card-gradient rounded-xl overflow-hidden border border-[hsl(var(--cwg-dark-blue))]">
                        <div className="relative h-48 bg-[hsl(var(--cwg-dark-blue))] flex items-center justify-center">
                          <div className="h-24 w-24 rounded-full bg-[hsl(var(--cwg-dark))] border-4 border-[hsl(var(--cwg-orange))] flex items-center justify-center">
                            <GraduationCap className="h-10 w-10 text-[hsl(var(--cwg-orange))]" />
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <h3 className="text-xl font-orbitron font-semibold text-[hsl(var(--cwg-text))]">{instructor.name}</h3>
                          <p className="text-[hsl(var(--cwg-orange))] text-sm mb-2">{instructor.role}</p>
                          <p className="text-[hsl(var(--cwg-muted))] mb-4">
                            Specializes in: {instructor.expertise}
                          </p>
                          <Button 
                            className="w-full bg-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-dark))] hover:bg-[hsl(var(--cwg-blue))]/90"
                            onClick={() => {
                              if (!user) {
                                toast({
                                  title: "Authentication required",
                                  description: "Please sign in to view instructor profiles",
                                  variant: "destructive",
                                });
                                navigate("/auth");
                              } else {
                                toast({
                                  title: "Coming soon!",
                                  description: "Instructor profiles will be available in the next update",
                                });
                              }
                            }}
                          >
                            View Profile
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="how-it-works">
                  <div className="card-gradient rounded-xl p-6 border border-[hsl(var(--cwg-dark-blue))]">
                    <h2 className="text-2xl font-orbitron font-semibold text-[hsl(var(--cwg-orange))] mb-6">How Our Courses Work</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-text))] mb-4">Course Format</h3>
                        <ul className="space-y-4">
                          <li className="flex items-start">
                            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-[hsl(var(--cwg-orange))]/20 flex items-center justify-center text-[hsl(var(--cwg-orange))] mr-3">1</span>
                            <p className="text-[hsl(var(--cwg-muted))]">
                              <span className="text-[hsl(var(--cwg-text))]">Video Lessons</span> - Pre-recorded, comprehensive tutorials
                            </p>
                          </li>
                          <li className="flex items-start">
                            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-[hsl(var(--cwg-orange))]/20 flex items-center justify-center text-[hsl(var(--cwg-orange))] mr-3">2</span>
                            <p className="text-[hsl(var(--cwg-muted))]">
                              <span className="text-[hsl(var(--cwg-text))]">Live Sessions</span> - Weekly group sessions with instructors
                            </p>
                          </li>
                          <li className="flex items-start">
                            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-[hsl(var(--cwg-orange))]/20 flex items-center justify-center text-[hsl(var(--cwg-orange))] mr-3">3</span>
                            <p className="text-[hsl(var(--cwg-muted))]">
                              <span className="text-[hsl(var(--cwg-text))]">1-on-1 Coaching</span> - Personal guidance for premium packages
                            </p>
                          </li>
                          <li className="flex items-start">
                            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-[hsl(var(--cwg-orange))]/20 flex items-center justify-center text-[hsl(var(--cwg-orange))] mr-3">4</span>
                            <p className="text-[hsl(var(--cwg-muted))]">
                              <span className="text-[hsl(var(--cwg-text))]">Discussion Forum</span> - Community support and knowledge sharing
                            </p>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-orbitron text-[hsl(var(--cwg-text))] mb-4">Membership Benefits</h3>
                        <ul className="space-y-2 text-[hsl(var(--cwg-muted))]">
                          <li className="flex items-start">
                            <span className="text-[hsl(var(--cwg-blue))] mr-2">•</span>
                            <span>CWG members receive first 3 packages free of cost</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[hsl(var(--cwg-blue))] mr-2">•</span>
                            <span>25% discount on all packages for verified CWG members</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[hsl(var(--cwg-blue))] mr-2">•</span>
                            <span>Priority access to new courses and exclusive content</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-[hsl(var(--cwg-blue))] mr-2">•</span>
                            <span>Invite to private Discord channel with instructors</span>
                          </li>
                        </ul>
                        
                        <div className="mt-6">
                          <Button 
                            className="flex items-center gap-2 bg-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-dark))] hover:bg-[hsl(var(--cwg-orange))]/90"
                            onClick={() => {
                              if (!user) {
                                toast({
                                  title: "Authentication required",
                                  description: "Please sign in to request information",
                                  variant: "destructive",
                                });
                                navigate("/auth");
                              } else {
                                toast({
                                  title: "Request submitted",
                                  description: "We'll contact you soon with more information about our courses",
                                });
                              }
                            }}
                          >
                            <MessageSquare className="h-4 w-4" />
                            Request More Information
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
