import { useState } from "react";
import { Course } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Clock, Users, Star, Info, CheckCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function CourseCard({ course, isGuildMember = false }: { course: Course, isGuildMember?: boolean }) {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Calculate discounted price for guild members
  const discountedPrice = Math.floor(course.price * 0.75);
  
  // Check if course is free for CWG members
  const isFreeCourse = ["Weapon Mastery", "Fighter Mastery", "Boss Mastery"].includes(course.title) && isGuildMember;
  
  // Format price 
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  // Course difficulty icons
  const difficultyIcons = {
    "Beginner": <Star className="h-4 w-4 text-green-400" />,
    "Intermediate": <Star className="h-4 w-4 text-[hsl(var(--cwg-orange))]" />,
    "Advanced": <Star className="h-4 w-4 text-red-400" />
  };
  
  // Get course difficulty
  const getCourseDifficulty = (course: Course) => {
    if (course.courseType === "Weapon Mastery" || course.courseType === "Crafting & Merging") {
      return "Beginner";
    } else if (course.courseType === "Fighter Mastery") {
      return "Intermediate";
    } else {
      return "Advanced";
    }
  };
  
  const difficulty = getCourseDifficulty(course);
  
  // Mock enrollment process
  const handleEnroll = () => {
    setIsEnrolling(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsEnrolling(false);
      
      toast({
        title: "Enrollment successful",
        description: `You've successfully enrolled in ${course.title}`,
      });
      
      setShowDetails(false);
    }, 1500);
  };

  return (
    <Card className="card-gradient border-[hsl(var(--cwg-dark-blue))] hover:border-[hsl(var(--cwg-orange))]/50 transition-all duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-[hsl(var(--cwg-text))] font-orbitron">{course.title}</CardTitle>
          {difficulty && (
            <Badge variant="outline" className="flex items-center gap-1 border-[hsl(var(--cwg-blue))]">
              {difficultyIcons[difficulty as keyof typeof difficultyIcons]} {difficulty}
            </Badge>
          )}
        </div>
        <CardDescription className="text-[hsl(var(--cwg-muted))]">
          {course.courseType} • {course.game}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="w-full h-40 bg-[hsl(var(--cwg-dark-blue))] rounded-lg overflow-hidden mb-4 flex items-center justify-center">
          <GraduationCap className="h-16 w-16 text-[hsl(var(--cwg-orange))]/50" />
        </div>
        
        <p className="text-[hsl(var(--cwg-muted))] mb-4 line-clamp-3">
          {course.description}
        </p>
        
        <div className="flex flex-col space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-[hsl(var(--cwg-muted))] flex items-center">
              <Clock className="mr-2 h-4 w-4 text-[hsl(var(--cwg-blue))]" /> Duration
            </span>
            <span className="text-[hsl(var(--cwg-text))]">4 weeks</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-[hsl(var(--cwg-muted))] flex items-center">
              <Users className="mr-2 h-4 w-4 text-[hsl(var(--cwg-blue))]" /> Students
            </span>
            <span className="text-[hsl(var(--cwg-text))]">{Math.floor(Math.random() * 200) + 50}+</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-[hsl(var(--cwg-muted))] flex items-center">
              <GraduationCap className="mr-2 h-4 w-4 text-[hsl(var(--cwg-blue))]" /> Instructor
            </span>
            <span className="text-[hsl(var(--cwg-text))]">CWG | {course.instructorId === 1 ? "FrostiiGoblin" : course.instructorId === 2 ? "YarblesTV" : "Nexion"}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-3">
        <div className="w-full flex justify-between items-center">
          {isFreeCourse ? (
            <div className="text-green-400 font-orbitron">FREE</div>
          ) : (
            <div className="flex flex-col">
              <span className="text-[hsl(var(--cwg-orange))] font-semibold font-orbitron">
                {isGuildMember ? formatPrice(discountedPrice) : formatPrice(course.price)}
              </span>
              {isGuildMember && !isFreeCourse && (
                <span className="text-xs text-green-400">25% guild discount</span>
              )}
            </div>
          )}
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-[hsl(var(--cwg-blue))] text-[hsl(var(--cwg-blue))]">
                <Info className="h-4 w-4 mr-1" /> Details
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[hsl(var(--cwg-dark-blue))] border-[hsl(var(--cwg-dark-blue))]">
              <DialogHeader>
                <DialogTitle className="text-xl font-orbitron text-[hsl(var(--cwg-orange))]">
                  {course.title}
                </DialogTitle>
                <DialogDescription className="text-[hsl(var(--cwg-muted))]">
                  {course.courseType} • {course.game}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <p className="text-[hsl(var(--cwg-text))]">
                  {course.description}
                </p>
                
                <div className="space-y-3 mt-4">
                  <h4 className="font-orbitron text-[hsl(var(--cwg-blue))]">What You'll Learn</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-[hsl(var(--cwg-muted))]">Master advanced techniques and strategies</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-[hsl(var(--cwg-muted))]">Understand meta builds and optimal playstyles</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-[hsl(var(--cwg-muted))]">Maximize your in-game earnings potential</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-[hsl(var(--cwg-muted))]">Weekly live sessions with instructors</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-[hsl(var(--cwg-dark))] p-4 rounded-lg mt-4">
                  <h4 className="font-orbitron text-[hsl(var(--cwg-text))] mb-2">Course Details</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[hsl(var(--cwg-muted))]">Duration:</span>
                      <span className="text-[hsl(var(--cwg-text))]">4 weeks</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[hsl(var(--cwg-muted))]">Format:</span>
                      <span className="text-[hsl(var(--cwg-text))]">Video + Live</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[hsl(var(--cwg-muted))]">Difficulty:</span>
                      <span className="text-[hsl(var(--cwg-text))]">{difficulty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[hsl(var(--cwg-muted))]">Certificate:</span>
                      <span className="text-[hsl(var(--cwg-text))]">Included</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="w-full bg-gradient-to-r from-[hsl(var(--cwg-orange))] to-[hsl(var(--cwg-orange))]/80 text-white py-3 rounded-lg font-orbitron font-medium btn-hover transition-all duration-300"
                >
                  {isEnrolling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    isFreeCourse ? "Enroll for Free" : `Enroll for ${isGuildMember ? formatPrice(discountedPrice) : formatPrice(course.price)}`
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Button
          onClick={() => setShowDetails(true)}
          className="w-full bg-[hsl(var(--cwg-orange))] text-[hsl(var(--cwg-dark))] hover:bg-[hsl(var(--cwg-orange))]/90"
        >
          Enroll Now
        </Button>
      </CardFooter>
    </Card>
  );
}

export default CourseCard;
