import { Streamer } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, ChevronRight, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { StreamerSchedule } from "@shared/schema";

export function StreamerCard({ streamer }: { streamer: Streamer }) {
  // Get streamer schedule
  const { data: schedules = [] } = useQuery<StreamerSchedule[]>({
    queryKey: [`/api/streamers/${streamer.id}/schedule`],
    enabled: !!streamer.id,
  });

  // Get current day of the week for highlighting today's schedule
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  
  // Find today's schedule if available
  const todaySchedule = schedules.find(schedule => 
    schedule.dayOfWeek.toLowerCase() === today.toLowerCase()
  );
  
  return (
    <div className="relative card-gradient rounded-xl overflow-hidden streamer-card transition-all duration-300 border-2 border-[hsl(var(--cwg-dark-blue))] hover:border-[hsl(var(--cwg-orange))]/70 web3-chip">
      <div className="relative">
        {/* Stream preview */}
        <div className="w-full h-48 bg-[hsl(var(--cwg-dark-blue))] relative overflow-hidden">
          {/* Web3 background effect */}
          <div className="absolute inset-0 bg-web3-grid opacity-30"></div>
          
          <svg
            viewBox="0 0 800 450"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id={`stream-gradient-${streamer.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={streamer.isLive ? "#FF6B00" : "#1E1E2F"} stopOpacity="0.3" />
                <stop offset="100%" stopColor={streamer.isLive ? "#00A3FF" : "#2A2A3A"} stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <rect width="800" height="450" fill="#1A1A2E" />
            <rect x="150" y="100" width="500" height="250" rx="15" fill={`url(#stream-gradient-${streamer.id})`} className="animate-pulse-glow" />
            <rect x="300" y="150" width="200" height="150" rx="10" fill="#2A2A3A" />
            <circle cx="400" cy="225" r="50" fill="#3A3A4A" />
            <path d="M380,200 L430,225 L380,250 Z" fill={streamer.isLive ? "#FF6B00" : "#616176"} />
          </svg>
          
          {/* Overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--cwg-dark))] to-transparent"></div>
        </div>
        
        {/* Live indicator - enhanced with glow effect */}
        <div className={`absolute top-3 right-3 flex items-center ${streamer.isLive ? 'neon-glow' : ''}`}>
          <div className={`h-3 w-3 rounded-full ${streamer.isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'} mr-1`}></div>
          <span className={`text-xs font-bold font-orbitron ${streamer.isLive ? 'text-green-500' : 'text-red-500'}`}>
            {streamer.isLive ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
        
        {/* Stream stats - enhanced */}
        <div className="absolute bottom-3 left-3 flex items-center">
          {streamer.isLive ? (
            <>
              <span className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1 rounded-full text-xs font-semibold font-orbitron flex items-center neon-glow">
                <span className="inline-block w-2 h-2 rounded-full bg-white mr-2 animate-pulse"></span> LIVE NOW
              </span>
              <span className="ml-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
                {streamer.viewerCount} viewers
              </span>
            </>
          ) : (
            todaySchedule ? (
              <span className="bg-gradient-to-r from-[hsl(var(--cwg-dark-blue))] to-[hsl(var(--cwg-dark-blue))]/70 text-[hsl(var(--cwg-muted))] px-3 py-1 rounded-full text-xs font-orbitron flex items-center">
                <Clock className="h-3 w-3 mr-1" /> Live at {todaySchedule.startTime}
              </span>
            ) : (
              <span className="bg-[hsl(var(--cwg-muted))]/20 text-[hsl(var(--cwg-muted))] px-3 py-1 rounded-full text-xs font-orbitron">
                OFFLINE
              </span>
            )
          )}
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-center">
          {/* Streamer profile image - enhanced with glow and effects */}
          <div className={`w-12 h-12 rounded-full bg-[hsl(var(--cwg-dark-blue))] border-2 ${streamer.isLive ? 'border-[hsl(var(--cwg-orange))] neon-glow' : 'border-[hsl(var(--cwg-blue))]'} flex items-center justify-center`}>
            {streamer.profileImageUrl ? (
              <img 
                src={streamer.profileImageUrl} 
                alt={streamer.displayName} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className={`text-lg font-orbitron font-bold ${streamer.isLive ? 'text-[hsl(var(--cwg-orange))]' : 'text-[hsl(var(--cwg-blue))]'}`}>
                {streamer.displayName.charAt(0)}
              </span>
            )}
          </div>
          <div className="ml-3">
            <h3 className="font-orbitron font-semibold text-[hsl(var(--cwg-text))]">{streamer.displayName}</h3>
            <p className="text-sm text-[hsl(var(--cwg-muted))]">
              {streamer.isLive 
                ? `${streamer.currentGame || 'Gaming'} - ${streamer.streamTitle || "Streaming"}` 
                : "Currently Offline"
              }
            </p>
          </div>
        </div>
        
        {/* Weekly schedule indicator (simplified version) */}
        {schedules.length > 0 && (
          <div className="mt-3 flex justify-between">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
              const dayFull = {
                'Mon': 'Monday',
                'Tue': 'Tuesday',
                'Wed': 'Wednesday',
                'Thu': 'Thursday',
                'Fri': 'Friday',
                'Sat': 'Saturday',
                'Sun': 'Sunday'
              }[day];
              
              const hasStream = schedules.some(s => s.dayOfWeek === dayFull);
              const isToday = dayFull === today;
              
              return (
                <div 
                  key={day} 
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium
                    ${isToday ? 'border-2 font-bold' : ''} 
                    ${hasStream 
                      ? isToday 
                        ? 'bg-[hsl(var(--cwg-orange))]/20 text-[hsl(var(--cwg-orange))] border-[hsl(var(--cwg-orange))]' 
                        : 'bg-[hsl(var(--cwg-blue))]/10 text-[hsl(var(--cwg-blue))]' 
                      : 'bg-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-muted))]/50'}
                  `}
                >
                  {day.charAt(0)}
                </div>
              );
            })}
          </div>
        )}
        
        <div className="mt-4 flex gap-2">
          {streamer.isLive ? (
            <a 
              href={`https://twitch.tv/${streamer.twitchId}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 bg-gradient-to-r from-[hsl(var(--cwg-orange))] to-[hsl(var(--cwg-orange-dark))] text-white font-orbitron py-2 rounded-lg text-center neon-border-orange btn-hover transition-all duration-300"
            >
              <div className="flex items-center justify-center web3-hover">
                <Eye className="mr-2 h-4 w-4" />
                WATCH NOW
              </div>
            </a>
          ) : (
            <a 
              href={`https://twitch.tv/${streamer.twitchId}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 bg-[hsl(var(--cwg-dark-blue))] text-[hsl(var(--cwg-muted))] font-orbitron py-2 rounded-lg text-center border border-[hsl(var(--cwg-muted))]/30 hover:border-[hsl(var(--cwg-muted))]/50 transition-all duration-300"
            >
              <div className="flex items-center justify-center">
                <Eye className="mr-2 h-4 w-4" />
                View Channel
              </div>
            </a>
          )}
          
          <Link 
            href={`/streamers/${streamer.id}`}
            className="bg-[hsl(var(--cwg-dark-blue))] hover:bg-[hsl(var(--cwg-dark-blue))]/80 text-[hsl(var(--cwg-blue))] py-2 px-3 rounded-lg transition-colors border border-[hsl(var(--cwg-blue))]/20 hover:border-[hsl(var(--cwg-blue))]/50"
          >
            <Calendar className="h-4 w-4" />
          </Link>
        </div>
        
        <Link 
          href={`/streamers/${streamer.id}`}
          className="mt-3 text-sm text-[hsl(var(--cwg-blue))] flex items-center justify-center hover:text-[hsl(var(--cwg-orange))] transition-colors duration-200 group"
        >
          View Profile & Schedule <ChevronRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>
    </div>
  );
}

export default StreamerCard;
